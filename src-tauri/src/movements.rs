use chrono::NaiveDate;
use rusqlite::{params, params_from_iter, types::Value, Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{errors::AppError, AppState};

const MAX_SAFE_INTEGER: i64 = 9_007_199_254_740_991;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum MovementType {
    Income,
    Expense,
    Transfer,
    InitialBalance,
}

impl MovementType {
    fn as_sql(self) -> &'static str {
        match self {
            Self::Income => "income",
            Self::Expense => "expense",
            Self::Transfer => "transfer_out",
            Self::InitialBalance => "initial_balance",
        }
    }
}

#[derive(Debug, Clone, Default, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct MovementFilter {
    pub search: Option<String>,
    #[ts(type = "number | null")]
    pub account_id: Option<i64>,
    #[ts(type = "number | null")]
    pub category_id: Option<i64>,
    pub movement_type: Option<MovementType>,
    pub currency_code: Option<String>,
    pub date_from: Option<String>,
    pub date_to: Option<String>,
    #[ts(type = "number | null")]
    pub limit: Option<i64>,
    #[ts(type = "number | null")]
    pub offset: Option<i64>,
}

#[derive(Debug, Clone, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct MovementEntry {
    #[ts(type = "number")]
    pub account_id: i64,
    pub r#type: MovementType,
    #[ts(type = "number")]
    pub amount: i64,
    pub currency_code: String,
    pub date: String,
    pub description: String,
    pub notes: Option<String>,
    #[ts(type = "number | null")]
    pub category_id: Option<i64>,
    #[ts(type = "number | null")]
    pub shop_id: Option<i64>,
    #[ts(type = "number | null")]
    pub to_account_id: Option<i64>,
    #[ts(type = "number | null")]
    pub to_amount: Option<i64>,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Movement {
    #[ts(type = "number")]
    pub id: i64,
    #[ts(type = "number")]
    pub account_id: i64,
    pub account_name: String,
    pub r#type: MovementType,
    #[ts(type = "number")]
    pub amount: i64,
    pub currency_code: String,
    pub date: String,
    pub description: String,
    pub notes: Option<String>,
    #[ts(type = "number | null")]
    pub category_id: Option<i64>,
    #[ts(type = "number | null")]
    pub shop_id: Option<i64>,
    #[ts(type = "number | null")]
    pub to_account_id: Option<i64>,
    pub to_account_name: Option<String>,
    #[ts(type = "number | null")]
    pub to_amount: Option<i64>,
    pub to_currency_code: Option<String>,
    pub transfer_group_id: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct MovementsPage {
    pub items: Vec<Movement>,
    #[ts(type = "number")]
    pub total: i64,
    pub has_next_page: bool,
    pub has_previous_page: bool,
}

// Keep money integral on both sides of IPC, including pre-existing data and SQL sums.
pub(crate) fn read_number(row: &Row<'_>, column: &str) -> rusqlite::Result<i64> {
    let value: i64 = row.get(column)?;
    check_sql_number(row, column, value)
}

fn check_sql_number(row: &Row<'_>, column: &str, value: i64) -> rusqlite::Result<i64> {
    if !(-MAX_SAFE_INTEGER..=MAX_SAFE_INTEGER).contains(&value) {
        return Err(rusqlite::Error::FromSqlConversionFailure(
            row.as_ref().column_index(column)?,
            rusqlite::types::Type::Integer,
            Box::new(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                "integer exceeds the JavaScript safe-integer range",
            )),
        ));
    }
    Ok(value)
}

fn read_optional_number(row: &Row<'_>, column: &str) -> rusqlite::Result<Option<i64>> {
    row.get::<_, Option<i64>>(column)?
        .map(|value| check_sql_number(row, column, value))
        .transpose()
}

fn positive_integer(value: i64, field: &str) -> Result<(), AppError> {
    if !(1..=MAX_SAFE_INTEGER).contains(&value) {
        return Err(AppError::Validation(format!(
            "{field} debe ser un entero positivo dentro del rango seguro de JavaScript."
        )));
    }
    Ok(())
}

fn validate_date(date: &str) -> Result<(), AppError> {
    if date.len() != 10
        || NaiveDate::parse_from_str(date, "%Y-%m-%d")
            .map(|parsed| parsed.format("%Y-%m-%d").to_string() != date)
            .unwrap_or(true)
    {
        return Err(AppError::Validation(
            "La fecha debe ser válida y tener el formato YYYY-MM-DD.".into(),
        ));
    }
    Ok(())
}

fn active_account_currency(conn: &Connection, id: i64) -> Result<String, AppError> {
    positive_integer(id, "La cuenta")?;
    let account: Option<(String, bool)> = conn
        .query_row(
            "SELECT currency_code, is_active FROM accounts WHERE id = ?1",
            [id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()?;
    match account {
        Some((currency, true)) => Ok(currency),
        Some(_) => Err(AppError::Validation("La cuenta está inactiva.".into())),
        None => Err(AppError::NotFound(
            "No se encontró la cuenta indicada.".into(),
        )),
    }
}

struct Destination {
    account_id: i64,
    amount: i64,
    currency_code: String,
}

fn validate_entry(
    conn: &Connection,
    entry: &MovementEntry,
) -> Result<Option<Destination>, AppError> {
    positive_integer(entry.amount, "El importe en unidades menores")?;
    validate_date(&entry.date)?;
    let currency = active_account_currency(conn, entry.account_id)?;
    if currency != entry.currency_code {
        return Err(AppError::Validation(
            "La moneda del movimiento debe coincidir con la moneda de la cuenta.".into(),
        ));
    }

    if let Some(category_id) = entry.category_id {
        positive_integer(category_id, "La categoría")?;
        if !matches!(entry.r#type, MovementType::Income | MovementType::Expense) {
            return Err(AppError::Validation(
                "Solo los ingresos y gastos pueden tener categoría.".into(),
            ));
        }
        let category: Option<(String, bool)> = conn
            .query_row(
                "SELECT type, is_active FROM categories WHERE id = ?1",
                [category_id],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .optional()?;
        match category {
            Some((kind, true)) if kind == "both" || kind == entry.r#type.as_sql() => {}
            _ => {
                return Err(AppError::Validation(
                    "La categoría debe existir, estar activa y corresponder al tipo de movimiento."
                        .into(),
                ))
            }
        }
    }

    if let Some(shop_id) = entry.shop_id {
        positive_integer(shop_id, "El comercio")?;
        if entry.r#type != MovementType::Expense {
            return Err(AppError::Validation(
                "Solo los gastos pueden tener comercio.".into(),
            ));
        }
        let exists: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM shops WHERE id = ?1)",
            [shop_id],
            |row| row.get(0),
        )?;
        if !exists {
            return Err(AppError::NotFound(
                "No se encontró el comercio indicado.".into(),
            ));
        }
    }

    if entry.r#type != MovementType::Transfer {
        if entry.to_account_id.is_some() || entry.to_amount.is_some() {
            return Err(AppError::Validation(
                "Solo las transferencias pueden tener cuenta o importe de destino.".into(),
            ));
        }
        return Ok(None);
    }

    let account_id = entry.to_account_id.ok_or_else(|| {
        AppError::Validation("La transferencia requiere una cuenta de destino.".into())
    })?;
    if account_id == entry.account_id {
        return Err(AppError::Validation(
            "Las cuentas de origen y destino deben ser distintas.".into(),
        ));
    }
    let currency_code = active_account_currency(conn, account_id)?;
    let amount = match entry.to_amount {
        Some(amount) => amount,
        None if currency_code == currency => entry.amount,
        None => {
            return Err(AppError::Validation(
                "Las transferencias entre monedas requieren un importe de destino explícito."
                    .into(),
            ))
        }
    };
    positive_integer(amount, "El importe de destino en unidades menores")?;
    if currency_code == currency && amount != entry.amount {
        return Err(AppError::Validation(
            "Los importes deben coincidir al transferir entre cuentas de la misma moneda.".into(),
        ));
    }
    Ok(Some(Destination {
        account_id,
        amount,
        currency_code,
    }))
}

const LOGICAL_FROM: &str = "FROM movements m
    JOIN accounts a ON a.id = m.account_id
    LEFT JOIN movements destination ON m.type = 'transfer_out'
        AND destination.transfer_group_id = m.transfer_group_id AND destination.type = 'transfer_in'
    LEFT JOIN accounts destination_account ON destination_account.id = destination.account_id";

const MOVEMENT_COLUMNS: &str = "m.id, m.account_id, a.name AS account_name,
    m.type, m.amount, m.currency_code, m.date, m.description, m.notes, m.category_id,
    m.shop_id, m.transfer_group_id, m.created_at,
    destination.account_id AS to_account_id, destination.amount AS to_amount,
    destination.currency_code AS to_currency_code, destination_account.name AS to_account_name";

fn row_to_movement(row: &Row<'_>) -> rusqlite::Result<Movement> {
    let kind: String = row.get("type")?;
    let kind = match kind.as_str() {
        "income" => MovementType::Income,
        "expense" => MovementType::Expense,
        "transfer_out" => MovementType::Transfer,
        "initial_balance" => MovementType::InitialBalance,
        _ => return Err(rusqlite::Error::InvalidQuery),
    };
    Ok(Movement {
        id: read_number(row, "id")?,
        account_id: read_number(row, "account_id")?,
        account_name: row.get("account_name")?,
        r#type: kind,
        amount: read_number(row, "amount")?,
        currency_code: row.get("currency_code")?,
        date: row.get("date")?,
        description: row.get("description")?,
        notes: row.get("notes")?,
        category_id: read_optional_number(row, "category_id")?,
        shop_id: read_optional_number(row, "shop_id")?,
        to_account_id: read_optional_number(row, "to_account_id")?,
        to_account_name: row.get("to_account_name")?,
        to_amount: read_optional_number(row, "to_amount")?,
        to_currency_code: row.get("to_currency_code")?,
        transfer_group_id: row.get("transfer_group_id")?,
        created_at: row.get("created_at")?,
    })
}

fn movement_by_id(conn: &Connection, id: i64) -> Result<Movement, AppError> {
    conn.query_row(
        &format!(
            "SELECT {MOVEMENT_COLUMNS} {LOGICAL_FROM} WHERE m.id = ?1 AND m.type != 'transfer_in'"
        ),
        [id],
        row_to_movement,
    )
    .optional()?
    .ok_or_else(|| AppError::NotFound("No se encontró el movimiento indicado.".into()))
}

fn list_movements(conn: &Connection, filter: MovementFilter) -> Result<MovementsPage, AppError> {
    let limit = filter.limit.unwrap_or(50);
    let offset = filter.offset.unwrap_or(0);
    if !(1..=500).contains(&limit) || !(0..=MAX_SAFE_INTEGER).contains(&offset) {
        return Err(AppError::Validation(
            "El límite debe estar entre 1 y 500 y el desplazamiento debe ser un entero no negativo seguro.".into(),
        ));
    }
    for date in [&filter.date_from, &filter.date_to].into_iter().flatten() {
        validate_date(date)?;
    }
    if matches!((&filter.date_from, &filter.date_to), (Some(from), Some(to)) if from > to) {
        return Err(AppError::Validation(
            "La fecha inicial no puede ser posterior a la final.".into(),
        ));
    }

    let mut conditions = String::from(" WHERE m.type != 'transfer_in'");
    let mut values: Vec<Value> = Vec::new();
    if let Some(id) = filter.account_id {
        positive_integer(id, "La cuenta")?;
        conditions.push_str(" AND (m.account_id = ? OR destination.account_id = ?)");
        values.extend([Value::Integer(id), Value::Integer(id)]);
    }
    if let Some(id) = filter.category_id {
        positive_integer(id, "La categoría")?;
        conditions.push_str(" AND m.category_id = ?");
        values.push(Value::Integer(id));
    }
    if let Some(kind) = filter.movement_type {
        conditions.push_str(" AND m.type = ?");
        values.push(Value::Text(kind.as_sql().into()));
    }
    if let Some(currency) = filter.currency_code {
        conditions.push_str(" AND (m.currency_code = ? OR destination.currency_code = ?)");
        values.extend([Value::Text(currency.clone()), Value::Text(currency)]);
    }
    if let Some(date) = filter.date_from {
        conditions.push_str(" AND m.date >= ?");
        values.push(Value::Text(date));
    }
    if let Some(date) = filter.date_to {
        conditions.push_str(" AND m.date <= ?");
        values.push(Value::Text(date));
    }
    if let Some(search) = filter
        .search
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty())
    {
        // Treat user input as literal prefix terms, never as executable FTS syntax.
        let query = search
            .split_whitespace()
            .map(|term| format!("\"{}\"*", term.replace('"', "\"\"")))
            .collect::<Vec<_>>()
            .join(" AND ");
        conditions.push_str(
            " AND (m.id IN (SELECT rowid FROM movements_fts WHERE movements_fts MATCH ?)
            OR destination.id IN (SELECT rowid FROM movements_fts WHERE movements_fts MATCH ?))",
        );
        values.extend([Value::Text(query.clone()), Value::Text(query)]);
    }

    // Count and page share one snapshot, including when another SQLite connection writes.
    let tx = conn.unchecked_transaction()?;
    let total = tx.query_row(
        &format!("SELECT COUNT(*) AS total {LOGICAL_FROM}{conditions}"),
        params_from_iter(&values),
        |row| read_number(row, "total"),
    )?;
    values.extend([Value::Integer(limit), Value::Integer(offset)]);
    let items = {
        let mut stmt = tx.prepare(&format!(
            "SELECT {MOVEMENT_COLUMNS} {LOGICAL_FROM}{conditions} ORDER BY m.date DESC, m.id DESC LIMIT ? OFFSET ?"
        ))?;
        let items = stmt
            .query_map(params_from_iter(&values), row_to_movement)?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        items
    };
    tx.commit()?;
    Ok(MovementsPage {
        has_next_page: offset < total && limit < total - offset,
        has_previous_page: offset > 0,
        items,
        total,
    })
}

struct ExistingMovement {
    id: i64,
    incoming_id: Option<i64>,
    transfer_group_id: Option<String>,
}

fn resolve_movement(conn: &Connection, id: i64) -> Result<ExistingMovement, AppError> {
    positive_integer(id, "El movimiento")?;
    let existing: Option<(String, Option<String>)> = conn
        .query_row(
            "SELECT type, transfer_group_id FROM movements WHERE id = ?1",
            [id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()?;
    let (kind, group) = existing
        .ok_or_else(|| AppError::NotFound("No se encontró el movimiento indicado.".into()))?;
    if !matches!(kind.as_str(), "transfer_in" | "transfer_out") {
        if group.is_some() {
            return Err(AppError::Constraint(
                "non-transfer movement has a transfer group".into(),
            ));
        }
        return Ok(ExistingMovement {
            id,
            incoming_id: None,
            transfer_group_id: None,
        });
    }
    let group =
        group.ok_or_else(|| AppError::Constraint("transfer is missing its group".into()))?;
    let (count, outgoing_id, incoming_id): (i64, Option<i64>, Option<i64>) = conn.query_row(
        "SELECT COUNT(*), MAX(CASE WHEN type = 'transfer_out' THEN id END),
            MAX(CASE WHEN type = 'transfer_in' THEN id END) FROM movements WHERE transfer_group_id = ?1",
        [&group], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
    )?;
    match (count, outgoing_id, incoming_id) {
        (2, Some(id), Some(incoming_id)) => Ok(ExistingMovement {
            id,
            incoming_id: Some(incoming_id),
            transfer_group_id: Some(group),
        }),
        _ => Err(AppError::Constraint(
            "transfer must contain exactly one outgoing and one incoming leg".into(),
        )),
    }
}

fn write_source(
    conn: &Connection,
    id: Option<i64>,
    entry: &MovementEntry,
    group: Option<&str>,
) -> Result<i64, AppError> {
    let values = params![
        entry.account_id,
        entry.r#type.as_sql(),
        entry.amount,
        entry.currency_code,
        entry.date,
        entry.description,
        entry.notes,
        entry.category_id,
        entry.shop_id,
        group,
        id
    ];
    if let Some(id) = id {
        conn.execute(
            "UPDATE movements SET account_id = ?1, type = ?2, amount = ?3,
            currency_code = ?4, date = ?5, description = ?6, notes = ?7, category_id = ?8,
            shop_id = ?9, transfer_group_id = ?10 WHERE id = ?11",
            values,
        )?;
        Ok(id)
    } else {
        conn.execute(
            "INSERT INTO movements (account_id, type, amount, currency_code, date,
            description, notes, category_id, shop_id, transfer_group_id, id)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            values,
        )?;
        Ok(conn.last_insert_rowid())
    }
}

fn write_destination(
    conn: &Connection,
    id: Option<i64>,
    entry: &MovementEntry,
    destination: &Destination,
    group: &str,
) -> Result<(), AppError> {
    let values = params![
        destination.account_id,
        destination.amount,
        destination.currency_code,
        entry.date,
        entry.description,
        entry.notes,
        group,
        id
    ];
    if id.is_some() {
        conn.execute(
            "UPDATE movements SET account_id = ?1, type = 'transfer_in', amount = ?2,
            currency_code = ?3, date = ?4, description = ?5, notes = ?6, transfer_group_id = ?7,
            category_id = NULL, shop_id = NULL WHERE id = ?8",
            values,
        )?;
    } else {
        conn.execute(
            "INSERT INTO movements (account_id, type, amount, currency_code, date,
            description, notes, transfer_group_id, id)
            VALUES (?1, 'transfer_in', ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            values,
        )?;
    }
    Ok(())
}

fn save_movement(
    conn: &mut Connection,
    id: Option<i64>,
    entry: MovementEntry,
) -> Result<Movement, AppError> {
    let tx = conn.transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)?;
    let movement = match id {
        Some(id) => save_movement_in_transaction(&tx, Some(id), entry)?,
        None => create_movement_in_transaction(&tx, entry)?,
    };
    tx.commit()?;
    Ok(movement)
}

/// The caller owns the transaction, including both transfer legs and triggers.
pub(crate) fn create_movement_in_transaction(
    tx: &Connection,
    entry: MovementEntry,
) -> Result<Movement, AppError> {
    save_movement_in_transaction(tx, None, entry)
}

fn save_movement_in_transaction(
    tx: &Connection,
    id: Option<i64>,
    entry: MovementEntry,
) -> Result<Movement, AppError> {
    let existing = id.map(|id| resolve_movement(tx, id)).transpose()?;
    let destination = validate_entry(tx, &entry)?;
    if let Some(existing) = &existing {
        let (currency_code, has_purchases): (String, bool) = tx.query_row(
            "SELECT m.currency_code,
                EXISTS(SELECT 1 FROM purchases p WHERE p.movement_id = m.id)
             FROM movements m WHERE m.id = ?1",
            [existing.id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )?;
        if has_purchases
            && (entry.r#type != MovementType::Expense || entry.currency_code != currency_code)
        {
            return Err(AppError::Validation(
                "Quitá las líneas de compra antes de cambiar el tipo o la moneda del gasto.".into(),
            ));
        }
    }
    let group = if destination.is_some() {
        Some(
            match existing.as_ref().and_then(|m| m.transfer_group_id.clone()) {
                Some(group) => group,
                None => tx.query_row("SELECT lower(hex(randomblob(16)))", [], |row| row.get(0))?,
            },
        )
    } else {
        None
    };
    let source_id = write_source(
        tx,
        existing.as_ref().map(|m| m.id),
        &entry,
        group.as_deref(),
    )?;
    let incoming_id = existing.as_ref().and_then(|m| m.incoming_id);
    if let (Some(destination), Some(group)) = (destination, group.as_deref()) {
        write_destination(tx, incoming_id, &entry, &destination, group)?;
    } else if let Some(id) = incoming_id {
        tx.execute("DELETE FROM movements WHERE id = ?1", [id])?;
    }
    let movement = movement_by_id(tx, source_id)?;
    Ok(movement)
}

fn remove_movement(conn: &mut Connection, id: i64) -> Result<(), AppError> {
    let tx = conn.transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)?;
    let existing = resolve_movement(&tx, id)?;
    if let Some(incoming_id) = existing.incoming_id {
        tx.execute("DELETE FROM movements WHERE id = ?1", [incoming_id])?;
    }
    tx.execute("DELETE FROM movements WHERE id = ?1", [existing.id])?;
    tx.commit()?;
    Ok(())
}

#[tauri::command]
pub fn get_movements(
    state: tauri::State<AppState>,
    filter: MovementFilter,
) -> Result<MovementsPage, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    list_movements(&conn, filter)
}

#[tauri::command]
pub fn get_movements_by_account_id(
    state: tauri::State<AppState>,
    account_id: i64,
    filter: Option<MovementFilter>,
) -> Result<MovementsPage, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    let mut filter = filter.unwrap_or_default();
    filter.account_id = Some(account_id);
    list_movements(&conn, filter)
}

#[tauri::command]
pub fn add_movement(
    state: tauri::State<AppState>,
    entry: MovementEntry,
) -> Result<Movement, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    save_movement(&mut conn, None, entry)
}

#[tauri::command]
pub fn update_movement(
    state: tauri::State<AppState>,
    id: i64,
    entry: MovementEntry,
) -> Result<Movement, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    save_movement(&mut conn, Some(id), entry)
}

#[tauri::command]
pub fn delete_movement(state: tauri::State<AppState>, id: i64) -> Result<(), AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    remove_movement(&mut conn, id)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn database() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(include_str!("../schema.sql")).unwrap();
        conn.execute_batch("INSERT OR IGNORE INTO currencies (code, name, symbol) VALUES
            ('USD', 'Dollar', '$'), ('EUR', 'Euro', '€');
            INSERT INTO accounts (name, type, currency_code, is_active) VALUES
            ('Cash', 'cash', 'USD', 1), ('Bank', 'checking', 'USD', 1),
            ('Euro', 'cash', 'EUR', 1), ('Inactive', 'cash', 'USD', 0);
            INSERT INTO categories (name, type, is_active) VALUES
            ('Food', 'expense', 1), ('Salary', 'income', 1), ('Both', 'both', 1), ('Old', 'expense', 0);
            INSERT INTO shops (name) VALUES ('Market');").unwrap();
        conn
    }

    fn entry(kind: MovementType) -> MovementEntry {
        MovementEntry {
            account_id: 1,
            r#type: kind,
            amount: 1250,
            currency_code: "USD".into(),
            date: "2026-02-28".into(),
            description: "Groceries".into(),
            notes: Some("Weekly supplies".into()),
            category_id: None,
            shop_id: None,
            to_account_id: None,
            to_amount: None,
        }
    }

    fn transfer() -> MovementEntry {
        MovementEntry {
            to_account_id: Some(2),
            ..entry(MovementType::Transfer)
        }
    }

    fn count(conn: &Connection) -> i64 {
        conn.query_row("SELECT COUNT(*) FROM movements", [], |r| r.get(0))
            .unwrap()
    }

    #[test]
    fn transfer_lifecycle_is_one_logical_row_and_two_ledger_legs() {
        let mut conn = database();
        let movement = save_movement(&mut conn, None, transfer()).unwrap();
        assert_eq!(count(&conn), 2);
        assert_eq!(movement.r#type, MovementType::Transfer);
        assert_eq!(movement.to_account_name.as_deref(), Some("Bank"));
        assert_eq!(movement.to_amount, Some(1250));
        assert_eq!(
            list_movements(&conn, MovementFilter::default())
                .unwrap()
                .total,
            1
        );
        for id in [1, 2] {
            let page = list_movements(
                &conn,
                MovementFilter {
                    account_id: Some(id),
                    ..Default::default()
                },
            )
            .unwrap();
            assert_eq!(page.total, 1);
            assert_eq!(page.items[0].id, movement.id);
        }
        let incoming_id: i64 = conn
            .query_row(
                "SELECT id FROM movements WHERE type = 'transfer_in'",
                [],
                |r| r.get(0),
            )
            .unwrap();
        let mut update = transfer();
        update.amount = 2000;
        update.date = "2026-03-01".into();
        update.description = "Updated".into();
        let updated = save_movement(&mut conn, Some(incoming_id), update).unwrap();
        assert_eq!(updated.id, movement.id);
        assert_eq!(updated.transfer_group_id, movement.transfer_group_id);
        assert_eq!(updated.to_amount, Some(2000));
        let matching: i64 = conn.query_row("SELECT COUNT(*) FROM movements WHERE amount = 2000 AND date = '2026-03-01' AND description = 'Updated'", [], |r| r.get(0)).unwrap();
        assert_eq!(matching, 2);
        remove_movement(&mut conn, incoming_id).unwrap();
        assert_eq!(count(&conn), 0);
        assert!(matches!(
            remove_movement(&mut conn, movement.id),
            Err(AppError::NotFound(_))
        ));
    }

    #[test]
    fn cross_currency_requires_explicit_amount_and_preserves_each_currency() {
        let mut conn = database();
        let mut data = transfer();
        data.to_account_id = Some(3);
        assert!(matches!(
            save_movement(&mut conn, None, data.clone()),
            Err(AppError::Validation(_))
        ));
        data.to_amount = Some(1000);
        let movement = save_movement(&mut conn, None, data).unwrap();
        assert_eq!(movement.amount, 1250);
        assert_eq!(movement.to_amount, Some(1000));
        assert_eq!(movement.to_currency_code.as_deref(), Some("EUR"));
        let page = list_movements(
            &conn,
            MovementFilter {
                currency_code: Some("EUR".into()),
                ..Default::default()
            },
        )
        .unwrap();
        assert_eq!(page.total, 1);
        let source_balance: i64 = conn
            .query_row(
                "SELECT balance FROM v_account_balances WHERE account_id = 1",
                [],
                |r| r.get(0),
            )
            .unwrap();
        let target_balance: i64 = conn
            .query_row(
                "SELECT balance FROM v_account_balances WHERE account_id = 3",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!((source_balance, target_balance), (-1250, 1000));
    }

    #[test]
    fn changing_movement_type_creates_and_removes_the_other_leg() {
        let mut conn = database();
        let movement = save_movement(&mut conn, None, entry(MovementType::Expense)).unwrap();
        let updated = save_movement(&mut conn, Some(movement.id), transfer()).unwrap();
        assert_eq!(updated.id, movement.id);
        assert_eq!(count(&conn), 2);
        let updated =
            save_movement(&mut conn, Some(movement.id), entry(MovementType::Income)).unwrap();
        assert_eq!(count(&conn), 1);
        assert!(updated.transfer_group_id.is_none());
        assert!(updated.to_account_id.is_none());
    }

    #[test]
    fn failed_second_leg_rolls_back_create_update_and_delete() {
        let mut conn = database();
        conn.execute_batch("CREATE TRIGGER reject_incoming BEFORE INSERT ON movements WHEN NEW.type = 'transfer_in'
            BEGIN SELECT RAISE(ABORT, 'test failure'); END;").unwrap();
        assert!(save_movement(&mut conn, None, transfer()).is_err());
        assert_eq!(count(&conn), 0);
        let audit: i64 = conn
            .query_row("SELECT COUNT(*) FROM audit_log", [], |r| r.get(0))
            .unwrap();
        assert_eq!(audit, 0);
        conn.execute_batch("DROP TRIGGER reject_incoming;").unwrap();
        let movement = save_movement(&mut conn, None, transfer()).unwrap();
        conn.execute_batch(
            "CREATE TRIGGER reject_update BEFORE UPDATE ON movements WHEN NEW.type = 'transfer_in'
            BEGIN SELECT RAISE(ABORT, 'test failure'); END;",
        )
        .unwrap();
        let mut updated = transfer();
        updated.amount = 999;
        assert!(save_movement(&mut conn, Some(movement.id), updated).is_err());
        assert_eq!(movement_by_id(&conn, movement.id).unwrap().amount, 1250);
        assert_eq!(
            movement_by_id(&conn, movement.id).unwrap().to_amount,
            Some(1250)
        );
        conn.execute_batch(
            "CREATE TRIGGER reject_delete BEFORE DELETE ON movements WHEN OLD.type = 'transfer_out'
            BEGIN SELECT RAISE(ABORT, 'test failure'); END;",
        )
        .unwrap();
        assert!(remove_movement(&mut conn, movement.id).is_err());
        assert_eq!(count(&conn), 2);
    }

    #[test]
    fn validates_amounts_accounts_dates_categories_and_destinations() {
        let mut conn = database();
        let mut invalid = Vec::new();
        for amount in [0, -1, MAX_SAFE_INTEGER + 1] {
            invalid.push(MovementEntry {
                amount,
                ..entry(MovementType::Expense)
            });
        }
        for date in [
            "2026-02-30",
            "2026-2-01",
            "2026-01-01T00:00:00Z",
            "not a date",
        ] {
            invalid.push(MovementEntry {
                date: date.into(),
                ..entry(MovementType::Expense)
            });
        }
        for account_id in [0, 4, 99] {
            invalid.push(MovementEntry {
                account_id,
                ..entry(MovementType::Expense)
            });
        }
        invalid.push(MovementEntry {
            currency_code: "EUR".into(),
            ..entry(MovementType::Expense)
        });
        for category_id in [2, 4, 99] {
            invalid.push(MovementEntry {
                category_id: Some(category_id),
                ..entry(MovementType::Expense)
            });
        }
        invalid.push(MovementEntry {
            category_id: Some(1),
            ..entry(MovementType::InitialBalance)
        });
        invalid.push(MovementEntry {
            category_id: Some(1),
            ..transfer()
        });
        invalid.push(MovementEntry {
            shop_id: Some(1),
            ..entry(MovementType::Income)
        });
        invalid.push(MovementEntry {
            shop_id: Some(99),
            ..entry(MovementType::Expense)
        });
        invalid.push(MovementEntry {
            to_account_id: Some(2),
            ..entry(MovementType::Income)
        });
        invalid.push(MovementEntry {
            to_account_id: None,
            ..transfer()
        });
        invalid.push(MovementEntry {
            to_account_id: Some(1),
            ..transfer()
        });
        invalid.push(MovementEntry {
            to_account_id: Some(4),
            ..transfer()
        });
        invalid.push(MovementEntry {
            to_amount: Some(0),
            ..transfer()
        });
        invalid.push(MovementEntry {
            to_amount: Some(999),
            ..transfer()
        });
        for data in invalid {
            assert!(
                save_movement(&mut conn, None, data.clone()).is_err(),
                "accepted {data:?}"
            );
            assert_eq!(count(&conn), 0);
        }
        for kind in [MovementType::Income, MovementType::Expense] {
            save_movement(
                &mut conn,
                None,
                MovementEntry {
                    category_id: Some(3),
                    ..entry(kind)
                },
            )
            .unwrap();
        }
        save_movement(
            &mut conn,
            None,
            MovementEntry {
                date: "2024-02-29".into(),
                ..entry(MovementType::InitialBalance)
            },
        )
        .unwrap();
    }

    #[test]
    fn pagination_filters_and_fts_use_the_same_logical_result_set() {
        let mut conn = database();
        let expense = save_movement(
            &mut conn,
            None,
            MovementEntry {
                category_id: Some(1),
                shop_id: Some(1),
                ..entry(MovementType::Expense)
            },
        )
        .unwrap();
        save_movement(&mut conn, None, entry(MovementType::Income)).unwrap();
        save_movement(&mut conn, None, transfer()).unwrap();
        let first = list_movements(
            &conn,
            MovementFilter {
                limit: Some(2),
                ..Default::default()
            },
        )
        .unwrap();
        assert_eq!(first.total, 3);
        assert_eq!(first.items.len(), 2);
        assert!(first.has_next_page);
        assert!(!first.has_previous_page);
        let last = list_movements(
            &conn,
            MovementFilter {
                limit: Some(2),
                offset: Some(2),
                ..Default::default()
            },
        )
        .unwrap();
        assert_eq!(last.items[0].id, expense.id);
        assert!(!last.has_next_page);
        assert!(last.has_previous_page);
        let beyond = list_movements(
            &conn,
            MovementFilter {
                offset: Some(99),
                ..Default::default()
            },
        )
        .unwrap();
        assert_eq!(beyond.total, 3);
        assert!(beyond.items.is_empty());
        assert!(!beyond.has_next_page);
        for search in ["groc", "supplies", "Weekly groc", "\"Groceries\"", "   "] {
            assert_eq!(
                list_movements(
                    &conn,
                    MovementFilter {
                        search: Some(search.into()),
                        ..Default::default()
                    }
                )
                .unwrap()
                .total,
                3
            );
        }
        for search in ["missing", "\" OR *", "---", "' OR 1=1 --"] {
            assert_eq!(
                list_movements(
                    &conn,
                    MovementFilter {
                        search: Some(search.into()),
                        ..Default::default()
                    }
                )
                .unwrap()
                .total,
                0
            );
        }
        let filtered = list_movements(
            &conn,
            MovementFilter {
                search: Some("supplies".into()),
                account_id: Some(1),
                category_id: Some(1),
                movement_type: Some(MovementType::Expense),
                currency_code: Some("USD".into()),
                date_from: Some("2026-02-28".into()),
                date_to: Some("2026-02-28".into()),
                ..Default::default()
            },
        )
        .unwrap();
        assert_eq!(filtered.total, 1);
        assert_eq!(filtered.items[0].id, expense.id);
        save_movement(
            &mut conn,
            Some(expense.id),
            MovementEntry {
                description: "Replacement".into(),
                notes: None,
                ..entry(MovementType::Expense)
            },
        )
        .unwrap();
        assert_eq!(
            list_movements(
                &conn,
                MovementFilter {
                    search: Some("Replacement".into()),
                    ..Default::default()
                }
            )
            .unwrap()
            .total,
            1
        );
        remove_movement(&mut conn, expense.id).unwrap();
        assert_eq!(
            list_movements(
                &conn,
                MovementFilter {
                    search: Some("Replacement".into()),
                    ..Default::default()
                }
            )
            .unwrap()
            .total,
            0
        );
    }

    #[test]
    fn invalid_filters_missing_records_and_unsafe_outputs_are_rejected() {
        let mut conn = database();
        for filter in [
            MovementFilter {
                limit: Some(0),
                ..Default::default()
            },
            MovementFilter {
                limit: Some(501),
                ..Default::default()
            },
            MovementFilter {
                offset: Some(-1),
                ..Default::default()
            },
            MovementFilter {
                offset: Some(MAX_SAFE_INTEGER + 1),
                ..Default::default()
            },
            MovementFilter {
                date_from: Some("2026-02-30".into()),
                ..Default::default()
            },
            MovementFilter {
                date_from: Some("2026-02-02".into()),
                date_to: Some("2026-02-01".into()),
                ..Default::default()
            },
        ] {
            assert!(matches!(
                list_movements(&conn, filter),
                Err(AppError::Validation(_))
            ));
        }
        assert!(matches!(
            save_movement(&mut conn, Some(99), entry(MovementType::Income)),
            Err(AppError::NotFound(_))
        ));
        let mut data = entry(MovementType::Income);
        data.amount = MAX_SAFE_INTEGER;
        let movement = save_movement(&mut conn, None, data).unwrap();
        assert_eq!(
            serde_json::to_value(&movement).unwrap()["amount"],
            MAX_SAFE_INTEGER
        );
        conn.execute(
            "UPDATE movements SET amount = ?1 WHERE id = ?2",
            params![MAX_SAFE_INTEGER + 1, movement.id],
        )
        .unwrap();
        assert!(list_movements(&conn, MovementFilter::default()).is_err());
    }

    #[test]
    fn purchase_lines_prevent_currency_changes_but_allow_same_currency_edits() {
        let mut conn = database();
        conn.execute_batch(
            "INSERT INTO items (name) VALUES ('Milk');
             INSERT INTO shops (name) VALUES ('Other market');",
        )
        .unwrap();
        let mut original = entry(MovementType::Expense);
        original.category_id = Some(1);
        original.shop_id = Some(1);
        let expense = save_movement(&mut conn, None, original.clone()).unwrap();
        conn.execute(
            "INSERT INTO purchases (movement_id, item_id, quantity, unit_price, notes)
             VALUES (?1, 1, 1.5, 251, 'Fractional quantity'), (?1, 1, 2, 0, NULL)",
            [expense.id],
        )
        .unwrap();
        let purchase_rows = |conn: &Connection| {
            let mut stmt = conn.prepare("SELECT * FROM purchases ORDER BY id").unwrap();
            let width = stmt.column_count();
            stmt.query_map([], |row| {
                (0..width)
                    .map(|column| row.get::<_, rusqlite::types::Value>(column))
                    .collect::<rusqlite::Result<Vec<_>>>()
            })
            .unwrap()
            .collect::<rusqlite::Result<Vec<_>>>()
            .unwrap()
        };
        let purchases_before = purchase_rows(&conn);
        let movement_before = serde_json::to_value(&expense).unwrap();
        let audit_before: i64 = conn
            .query_row("SELECT COUNT(*) FROM audit_log", [], |row| row.get(0))
            .unwrap();
        let mut update = original;
        update.account_id = 3;
        update.currency_code = "EUR".into();
        update.amount = 999;
        update.date = "2026-03-01".into();
        update.shop_id = Some(2);
        update.description = "Changed expense".into();
        update.notes = None;
        assert!(matches!(
            save_movement(&mut conn, Some(expense.id), update.clone()),
            Err(AppError::Validation(message)) if message.contains("moneda")
        ));
        assert_eq!(
            serde_json::to_value(movement_by_id(&conn, expense.id).unwrap()).unwrap(),
            movement_before
        );
        assert_eq!(purchase_rows(&conn), purchases_before);
        let audit_after: i64 = conn
            .query_row("SELECT COUNT(*) FROM audit_log", [], |row| row.get(0))
            .unwrap();
        assert_eq!(audit_after, audit_before);

        update.account_id = 2;
        update.currency_code = "USD".into();
        let updated = save_movement(&mut conn, Some(expense.id), update.clone()).unwrap();
        assert_eq!(updated.account_id, 2);
        assert_eq!(updated.currency_code, "USD");
        assert_eq!(updated.amount, 999);
        assert_eq!(updated.date, "2026-03-01");
        assert_eq!(updated.shop_id, Some(2));
        assert_eq!(purchase_rows(&conn), purchases_before);

        conn.execute("DELETE FROM purchases WHERE movement_id = ?1", [expense.id])
            .unwrap();
        update.account_id = 3;
        update.currency_code = "EUR".into();
        let updated = save_movement(&mut conn, Some(expense.id), update).unwrap();
        assert_eq!(updated.account_id, 3);
        assert_eq!(updated.currency_code, "EUR");
    }

    #[test]
    fn malformed_transfer_groups_and_purchase_type_changes_are_rejected() {
        let mut conn = database();
        let movement = save_movement(&mut conn, None, transfer()).unwrap();
        conn.execute("DELETE FROM movements WHERE type = 'transfer_in'", [])
            .unwrap();
        assert!(matches!(
            remove_movement(&mut conn, movement.id),
            Err(AppError::Constraint(_))
        ));
        assert!(matches!(
            save_movement(&mut conn, Some(movement.id), transfer()),
            Err(AppError::Constraint(_))
        ));
        let expense = save_movement(&mut conn, None, entry(MovementType::Expense)).unwrap();
        conn.execute_batch("INSERT INTO items (name) VALUES ('Apple');")
            .unwrap();
        conn.execute("INSERT INTO purchases (movement_id, item_id, quantity, unit_price) VALUES (?1, 1, 1, 1250)", [expense.id]).unwrap();
        assert!(matches!(
            save_movement(&mut conn, Some(expense.id), entry(MovementType::Income)),
            Err(AppError::Validation(_))
        ));
        remove_movement(&mut conn, expense.id).unwrap();
        let purchases: i64 = conn
            .query_row("SELECT COUNT(*) FROM purchases", [], |r| r.get(0))
            .unwrap();
        assert_eq!(purchases, 0);
    }
}
