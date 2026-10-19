use rusqlite::{params, Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::errors::AppError;

const MAX_SAFE_INTEGER: i64 = 9_007_199_254_740_991;

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Purchase {
    #[ts(type = "number")]
    pub id: i64,
    #[ts(type = "number")]
    pub movement_id: i64,
    #[ts(type = "number")]
    pub item_id: i64,
    pub item_name: String,
    pub quantity: f64,
    #[ts(type = "number")]
    pub unit_price: i64,
    #[ts(type = "number")]
    pub total_price: i64,
    pub currency_code: String,
    pub date: String,
    pub shop_name: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct PurchaseEntry {
    #[ts(type = "number")]
    pub movement_id: i64,
    #[ts(type = "number")]
    pub item_id: i64,
    pub quantity: f64,
    #[ts(type = "number")]
    pub unit_price: i64,
    pub notes: Option<String>,
}

const PURCHASE_SELECT: &str = "SELECT p.id, p.movement_id, p.item_id, i.name AS item_name,
    p.quantity, p.unit_price, p.total_price, m.currency_code, m.date,
    s.name AS shop_name, p.notes
    FROM purchases p
    JOIN movements m ON m.id = p.movement_id
    JOIN items i ON i.id = p.item_id
    LEFT JOIN shops s ON s.id = m.shop_id";

fn read_price(row: &Row<'_>, column: &str) -> rusqlite::Result<i64> {
    let price: i64 = row.get(column)?;
    if !(0..=MAX_SAFE_INTEGER).contains(&price) {
        return Err(rusqlite::Error::FromSqlConversionFailure(
            row.as_ref().column_index(column)?,
            rusqlite::types::Type::Integer,
            Box::new(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                "price must be a nonnegative JavaScript safe integer",
            )),
        ));
    }
    Ok(price)
}

fn row_to_purchase(row: &Row<'_>) -> rusqlite::Result<Purchase> {
    Ok(Purchase {
        id: row.get("id")?,
        movement_id: row.get("movement_id")?,
        item_id: row.get("item_id")?,
        item_name: row.get("item_name")?,
        quantity: row.get("quantity")?,
        unit_price: read_price(row, "unit_price")?,
        total_price: read_price(row, "total_price")?,
        currency_code: row.get("currency_code")?,
        date: row.get("date")?,
        shop_name: row.get("shop_name")?,
        notes: row.get("notes")?,
    })
}

fn list_purchases(
    conn: &Connection,
    item_id: Option<i64>,
    movement_id: Option<i64>,
) -> Result<Vec<Purchase>, AppError> {
    let mut stmt = conn.prepare(&format!(
        "{PURCHASE_SELECT}
         WHERE (?1 IS NULL OR p.item_id = ?1) AND (?2 IS NULL OR p.movement_id = ?2)
         ORDER BY m.date DESC, p.id DESC"
    ))?;
    let purchases = stmt
        .query_map(params![item_id, movement_id], row_to_purchase)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(purchases)
}

fn find_purchase(conn: &Connection, id: i64) -> Result<Purchase, AppError> {
    conn.query_row(
        &format!("{PURCHASE_SELECT} WHERE p.id = ?1"),
        [id],
        row_to_purchase,
    )
    .optional()?
    .ok_or_else(|| AppError::NotFound("Compra no encontrada".into()))
}

fn validate_entry(entry: &PurchaseEntry) -> Result<(), AppError> {
    if !entry.quantity.is_finite() || entry.quantity <= 0.0 {
        return Err(AppError::Validation(
            "La cantidad debe ser un número finito mayor a cero".into(),
        ));
    }
    if !(0..=MAX_SAFE_INTEGER).contains(&entry.unit_price) {
        return Err(AppError::Validation(
            "El precio debe ser un entero no negativo dentro del rango seguro de JavaScript".into(),
        ));
    }
    // Match SQLite's generated CAST(quantity * unit_price AS INTEGER): fractional
    // minor units are truncated, not rounded. Never write the generated column.
    let total = (entry.quantity * entry.unit_price as f64).trunc();
    if !total.is_finite() || total > MAX_SAFE_INTEGER as f64 {
        return Err(AppError::Validation(
            "El total de la compra excede el rango seguro de JavaScript".into(),
        ));
    }
    Ok(())
}

fn insert_purchase(conn: &mut Connection, entry: PurchaseEntry) -> Result<Purchase, AppError> {
    let tx = conn.transaction()?;
    let purchase = create_purchase_in_transaction(&tx, entry)?;
    tx.commit()?;
    Ok(purchase)
}

/// The caller owns the transaction, including rollback of trigger side effects.
pub(crate) fn create_purchase_in_transaction(
    tx: &Connection,
    entry: PurchaseEntry,
) -> Result<Purchase, AppError> {
    validate_entry(&entry)?;
    let movement_type: String = tx
        .query_row(
            "SELECT type FROM movements WHERE id = ?1",
            [entry.movement_id],
            |row| row.get(0),
        )
        .optional()?
        .ok_or_else(|| AppError::NotFound("Movimiento no encontrado".into()))?;
    if movement_type != "expense" {
        return Err(AppError::Validation(
            "Solo se pueden agregar compras a movimientos de gasto".into(),
        ));
    }
    let is_archived: bool = tx
        .query_row(
            "SELECT is_archived FROM items WHERE id = ?1",
            [entry.item_id],
            |row| row.get(0),
        )
        .optional()?
        .ok_or_else(|| AppError::NotFound("Ítem no encontrado".into()))?;
    if is_archived {
        return Err(AppError::Validation(
            "No se pueden agregar compras de un ítem archivado".into(),
        ));
    }
    tx.execute(
        "INSERT INTO purchases (movement_id, item_id, quantity, unit_price, notes)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            entry.movement_id,
            entry.item_id,
            entry.quantity,
            entry.unit_price,
            entry.notes
        ],
    )?;
    let purchase = find_purchase(tx, tx.last_insert_rowid())?;
    Ok(purchase)
}

fn remove_purchase(conn: &Connection, id: i64) -> Result<(), AppError> {
    let affected = conn.execute("DELETE FROM purchases WHERE id = ?1", [id])?;
    if affected == 0 {
        return Err(AppError::NotFound("Compra no encontrada".into()));
    }
    Ok(())
}

#[tauri::command]
pub fn get_purchases(state: tauri::State<crate::AppState>) -> Result<Vec<Purchase>, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    list_purchases(&conn, None, None)
}

#[tauri::command]
pub fn purchases_by_item(
    state: tauri::State<crate::AppState>,
    item_id: i64,
) -> Result<Vec<Purchase>, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    list_purchases(&conn, Some(item_id), None)
}

#[tauri::command]
pub fn purchases_by_movement(
    state: tauri::State<crate::AppState>,
    movement_id: i64,
) -> Result<Vec<Purchase>, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    list_purchases(&conn, None, Some(movement_id))
}

#[tauri::command]
pub fn add_purchase(
    state: tauri::State<crate::AppState>,
    entry: PurchaseEntry,
) -> Result<Purchase, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    insert_purchase(&mut conn, entry)
}

#[tauri::command]
pub fn delete_purchase(state: tauri::State<crate::AppState>, id: i64) -> Result<(), AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    remove_purchase(&conn, id)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn database() -> Result<Connection, AppError> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch(include_str!("../schema.sql"))?;
        conn.execute_batch(
            "INSERT OR IGNORE INTO currencies (code, name, symbol) VALUES ('USD', 'Dollar', '$'), ('EUR', 'Euro', '€');
             INSERT INTO accounts (name, type, currency_code) VALUES ('Cash', 'cash', 'USD'), ('Euro cash', 'cash', 'EUR');
             INSERT INTO items (name) VALUES ('Milk'), ('Bread');
             INSERT INTO shops (name, address) VALUES ('Market', 'Main Street');
             INSERT INTO movements (account_id, type, amount, currency_code, date, shop_id, notes)
             VALUES (1, 'expense', 1000, 'USD', '2026-01-01', 1, 'Movement notes');
             INSERT INTO movements (account_id, type, amount, currency_code, date)
             VALUES (2, 'expense', 1000, 'EUR', '2026-02-01');",
        )?;
        Ok(conn)
    }

    fn entry(movement_id: i64, item_id: i64, quantity: f64, unit_price: i64) -> PurchaseEntry {
        PurchaseEntry {
            movement_id,
            item_id,
            quantity,
            unit_price,
            notes: None,
        }
    }

    #[test]
    fn fractional_purchases_use_generated_totals_and_movement_shop() -> Result<(), AppError> {
        let mut conn = database()?;
        let purchase = insert_purchase(
            &mut conn,
            PurchaseEntry {
                notes: Some("Purchase notes".into()),
                ..entry(1, 1, 1.5, 103)
            },
        )?;
        assert_eq!(purchase.movement_id, 1);
        assert_eq!(purchase.item_id, 1);
        assert_eq!(purchase.item_name, "Milk");
        assert_eq!(purchase.quantity, 1.5);
        assert_eq!(purchase.unit_price, 103);
        assert_eq!(purchase.total_price, 154);
        assert_eq!(purchase.currency_code, "USD");
        assert_eq!(purchase.date, "2026-01-01");
        assert_eq!(purchase.shop_name.as_deref(), Some("Market"));
        assert_eq!(purchase.notes.as_deref(), Some("Purchase notes"));
        let free = insert_purchase(&mut conn, entry(2, 1, 0.25, 0))?;
        assert_eq!(free.total_price, 0);
        assert!(free.shop_name.is_none());
        assert!(free.notes.is_none());
        let amount: i64 =
            conn.query_row("SELECT amount FROM movements WHERE id = 1", [], |row| {
                row.get(0)
            })?;
        assert_eq!(amount, 1000);
        Ok(())
    }

    #[test]
    fn history_filters_keep_currencies_separate_and_include_archived_items() -> Result<(), AppError>
    {
        let mut conn = database()?;
        let usd = insert_purchase(&mut conn, entry(1, 1, 1.0, 100))?;
        let eur = insert_purchase(&mut conn, entry(2, 1, 1.0, 200))?;
        let bread = insert_purchase(&mut conn, entry(2, 2, 2.0, 50))?;
        conn.execute("UPDATE items SET is_archived = 1 WHERE id = 1", [])?;
        let all = list_purchases(&conn, None, None)?;
        assert_eq!(all.len(), 3);
        assert_eq!(all[0].id, bread.id);
        assert_eq!(all[1].id, eur.id);
        assert_eq!(all[2].id, usd.id);
        let history = list_purchases(&conn, Some(1), None)?;
        assert_eq!(history.len(), 2);
        assert_eq!(history[0].currency_code, "EUR");
        assert_eq!(history[0].total_price, 200);
        assert_eq!(history[1].currency_code, "USD");
        assert_eq!(history[1].total_price, 100);
        let lines = list_purchases(&conn, None, Some(2))?;
        assert_eq!(lines.len(), 2);
        assert!(lines.iter().all(|purchase| purchase.currency_code == "EUR"));
        assert!(list_purchases(&conn, Some(99), None)?.is_empty());
        assert!(list_purchases(&conn, None, Some(99))?.is_empty());
        assert!(matches!(
            insert_purchase(&mut conn, entry(1, 1, 1.0, 10)),
            Err(AppError::Validation(_))
        ));
        remove_purchase(&conn, usd.id)?;
        assert!(matches!(
            remove_purchase(&conn, usd.id),
            Err(AppError::NotFound(_))
        ));
        assert_eq!(list_purchases(&conn, None, None)?.len(), 2);
        let movements: i64 =
            conn.query_row("SELECT COUNT(*) FROM movements", [], |row| row.get(0))?;
        assert_eq!(movements, 2);
        Ok(())
    }

    #[test]
    fn purchase_validation_rejects_invalid_quantities_prices_and_unsafe_totals(
    ) -> Result<(), AppError> {
        let mut conn = database()?;
        for quantity in [0.0, -1.0, f64::NAN, f64::INFINITY, f64::NEG_INFINITY] {
            assert!(matches!(
                insert_purchase(&mut conn, entry(1, 1, quantity, 1)),
                Err(AppError::Validation(_))
            ));
        }
        for price in [-1, MAX_SAFE_INTEGER + 1, i64::MAX] {
            assert!(matches!(
                insert_purchase(&mut conn, entry(1, 1, 1.0, price)),
                Err(AppError::Validation(_))
            ));
        }
        for (quantity, price) in [(2.0, MAX_SAFE_INTEGER), (f64::MAX, 2)] {
            assert!(matches!(
                insert_purchase(&mut conn, entry(1, 1, quantity, price)),
                Err(AppError::Validation(_))
            ));
        }
        assert!(list_purchases(&conn, None, None)?.is_empty());
        let max = insert_purchase(&mut conn, entry(1, 1, 1.0, MAX_SAFE_INTEGER))?;
        assert_eq!(max.total_price, MAX_SAFE_INTEGER);
        let fractional = insert_purchase(&mut conn, entry(1, 1, 0.25, 1))?;
        assert_eq!(fractional.total_price, 0);
        Ok(())
    }

    #[test]
    fn purchases_require_existing_expense_movement_and_active_item() -> Result<(), AppError> {
        let mut conn = database()?;
        for movement_type in ["income", "initial_balance", "transfer_out", "transfer_in"] {
            let transfer_group_id = match movement_type {
                "transfer_out" | "transfer_in" => Some("test-transfer"),
                _ => None,
            };
            conn.execute(
                "INSERT INTO movements (account_id, type, amount, currency_code, date, transfer_group_id)
                 VALUES (1, ?1, 100, 'USD', '2026-01-01', ?2)",
                params![movement_type, transfer_group_id],
            )?;
            let id = conn.last_insert_rowid();
            assert!(matches!(
                insert_purchase(&mut conn, entry(id, 1, 1.0, 1)),
                Err(AppError::Validation(_))
            ));
        }
        assert!(matches!(
            insert_purchase(&mut conn, entry(99, 1, 1.0, 1)),
            Err(AppError::NotFound(_))
        ));
        assert!(matches!(
            insert_purchase(&mut conn, entry(1, 99, 1.0, 1)),
            Err(AppError::NotFound(_))
        ));
        conn.execute("UPDATE items SET is_archived = 1 WHERE id = 1", [])?;
        assert!(matches!(
            insert_purchase(&mut conn, entry(1, 1, 1.0, 1)),
            Err(AppError::Validation(_))
        ));
        assert!(list_purchases(&conn, None, None)?.is_empty());
        Ok(())
    }

    #[test]
    fn unsafe_existing_prices_are_not_sent_to_javascript() -> Result<(), AppError> {
        let conn = database()?;
        conn.execute(
            "INSERT INTO purchases (movement_id, item_id, quantity, unit_price) VALUES (1, 1, 1.0, ?1)",
            [MAX_SAFE_INTEGER + 1],
        )?;
        assert!(list_purchases(&conn, None, None).is_err());
        conn.execute("DELETE FROM purchases", [])?;
        conn.execute(
            "INSERT INTO purchases (movement_id, item_id, quantity, unit_price) VALUES (1, 1, 2.0, ?1)",
            [MAX_SAFE_INTEGER],
        )?;
        assert!(list_purchases(&conn, None, None).is_err());
        Ok(())
    }

    #[test]
    fn purchase_dto_contract_is_camel_case_and_numeric() -> Result<(), AppError> {
        let mut conn = database()?;
        let input: PurchaseEntry = serde_json::from_value(serde_json::json!({
            "movementId": 1, "itemId": 1, "quantity": 0.5, "unitPrice": 100, "notes": null
        }))
        .map_err(|error| AppError::Internal(error.to_string()))?;
        let purchase = insert_purchase(&mut conn, input)?;
        let json = serde_json::to_value(purchase)
            .map_err(|error| AppError::Internal(error.to_string()))?;
        assert_eq!(json["movementId"], 1);
        assert_eq!(json["itemId"], 1);
        assert_eq!(json["itemName"], "Milk");
        assert_eq!(json["quantity"], 0.5);
        assert_eq!(json["unitPrice"], 100);
        assert_eq!(json["totalPrice"], 50);
        assert_eq!(json["currencyCode"], "USD");
        assert!(serde_json::from_value::<PurchaseEntry>(serde_json::json!({
            "movementId": 1, "itemId": 1, "quantity": 1, "unitPrice": 1.5, "notes": null
        }))
        .is_err());
        let config = ts_rs::Config::default();
        let declaration = Purchase::decl(&config);
        assert!(declaration.contains("totalPrice: number"));
        assert!(!declaration.contains("bigint"));
        assert!(!PurchaseEntry::decl(&config).contains("bigint"));
        Ok(())
    }
}
