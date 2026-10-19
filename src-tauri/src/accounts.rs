use rusqlite::{params, params_from_iter, Connection, ToSql};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::errors::AppError;
use crate::filters::{Pagination, SortColumn, SortDirection};
use crate::AppState;

#[derive(Debug, Deserialize, Serialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum AccountType {
    Cash,
    Checking,
    Savings,
    CreditCard,
    Investment,
    Loan,
    DigitalWallet,
    Other,
}

impl AccountType {
    fn as_sql(&self) -> &'static str {
        match self {
            AccountType::Cash => "cash",
            AccountType::Checking => "checking",
            AccountType::Savings => "savings",
            AccountType::CreditCard => "credit_card",
            AccountType::Investment => "investment",
            AccountType::Loan => "loan",
            AccountType::DigitalWallet => "digital_wallet",
            AccountType::Other => "other",
        }
    }
}

impl ToSql for AccountType {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        Ok(rusqlite::types::ToSqlOutput::from(self.as_sql()))
    }
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Account {
    pub id: u32,
    pub name: String,
    /// De lectura: viene de la vista como String cruda, ya validada por el CHECK
    /// de la tabla.
    pub account_type: String,
    pub currency_code: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
    /// En centavos. El frontend formatea usando decimal_places de `currencies`.
    #[ts(type = "number")]
    pub balance: i64,
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct AddAccount {
    pub name: String,
    pub account_type: AccountType,
    pub currency_code: String,
    pub description: Option<String>,
    /// En centavos. None o 0 -> no se crea movimiento de saldo inicial.
    #[ts(type = "number | null")]
    pub initial_balance: Option<i64>,
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct UpdateAccount {
    pub name: String,
    pub account_type: AccountType,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub enum AccountSortField {
    Name,
    CreatedAt,
    Balance,
}

impl SortColumn for AccountSortField {
    fn column(&self) -> &'static str {
        match self {
            AccountSortField::Name => "account_name",
            AccountSortField::CreatedAt => "created_at",
            AccountSortField::Balance => "balance",
        }
    }
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct AccountSort {
    pub field: AccountSortField,
    pub direction: SortDirection,
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct AccountFilter {
    pub active_only: Option<bool>,
    pub sort: Option<AccountSort>,
    #[serde(default)]
    pub pagination: Pagination,
    pub search: Option<String>,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct AccountsPage {
    pub items: Vec<Account>,
    pub total: u32,
    pub has_next_page: bool,
    pub has_previous_page: bool,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct NetWorthByCurrency {
    pub currency_code: String,
    #[ts(type = "number")]
    pub total_balance: i64,
}

// ---------------------------------------------------------------------
// Comandos
// ---------------------------------------------------------------------

fn row_to_account(row: &rusqlite::Row) -> rusqlite::Result<Account> {
    Ok(Account {
        id: row.get("account_id")?,
        name: row.get("account_name")?,
        account_type: row.get("account_type")?,
        currency_code: row.get("currency_code")?,
        description: row.get("description")?,
        is_active: row.get::<_, i64>("is_active")? != 0,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
        balance: crate::movements::read_number(row, "balance")?,
    })
}

#[tauri::command]
pub fn get_net_worth(state: tauri::State<AppState>) -> Result<Vec<NetWorthByCurrency>, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;

    get_net_worth_with_conn(&conn)
}

fn get_net_worth_with_conn(conn: &Connection) -> Result<Vec<NetWorthByCurrency>, AppError> {
    let mut stmt = conn
        .prepare("SELECT currency_code, total_balance FROM v_net_worth ORDER BY currency_code")?;
    let rows = stmt
        .query_map([], |row| {
            Ok(NetWorthByCurrency {
                currency_code: row.get("currency_code")?,
                total_balance: crate::movements::read_number(row, "total_balance")?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(rows)
}

#[tauri::command]
pub fn get_accounts(
    state: tauri::State<AppState>,
    filter: AccountFilter,
) -> Result<AccountsPage, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;

    get_accounts_with_conn(&conn, filter)
}

fn get_accounts_with_conn(
    conn: &Connection,
    filter: AccountFilter,
) -> Result<AccountsPage, AppError> {
    if filter.pagination.limit == 0 {
        return Err(AppError::Validation(
            "El tamaño de página debe ser positivo.".into(),
        ));
    }

    // El WHERE + sus params se arman UNA sola vez y se reusan para el
    // COUNT(*) y para el SELECT paginado. Si mañana agregás otro filtro,
    // tocás solo este bloque y las dos queries quedan sincronizadas
    // automáticamente — no hay forma de que el total se desalinee de lo
    // que realmente se devuelve.
    let mut where_sql = String::from(" WHERE 1=1");
    let mut where_params: Vec<Box<dyn ToSql>> = Vec::new();

    // Archived accounts remain available only when explicitly requested.
    if filter.active_only.unwrap_or(true) {
        where_sql.push_str(" AND is_active = 1");
    }

    if let Some(term) = filter
        .search
        .as_deref()
        .map(str::trim)
        .filter(|s| !s.is_empty())
    {
        // Anónimos (?) consistentes en toda la sentencia: no mezclar con ?1 numerado.
        where_sql
            .push_str(" AND (account_name LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')");
        let pattern = format!(
            "%{}%",
            term.replace('\\', "\\\\")
                .replace('%', "\\%")
                .replace('_', "\\_")
        );
        where_params.push(Box::new(pattern.clone()));
        where_params.push(Box::new(pattern));
    }

    // --- total, sin LIMIT/OFFSET ---
    let count_sql = format!("SELECT COUNT(*) FROM v_account_balances{where_sql}");
    // Count and page must describe the same snapshot, even across connections.
    let tx = conn.unchecked_transaction()?;
    let total: u32 = tx.query_row(
        &count_sql,
        params_from_iter(where_params.iter().map(|p| p.as_ref())),
        |row| row.get(0),
    )?;

    // --- página actual ---
    let (sort_column, sort_dir) = match &filter.sort {
        Some(s) => (s.field.column(), s.direction.as_sql()),
        None => ("account_name", "ASC"),
    };

    let select_sql = format!(
        "SELECT * FROM v_account_balances{where_sql} ORDER BY {sort_column} {sort_dir}, account_id ASC LIMIT ? OFFSET ?"
    );

    let mut select_params = where_params;
    select_params.push(Box::new(filter.pagination.limit));
    select_params.push(Box::new(filter.pagination.offset));

    let items = {
        let mut stmt = tx.prepare(&select_sql)?;
        let items = stmt
            .query_map(
                params_from_iter(select_params.iter().map(|p| p.as_ref())),
                row_to_account,
            )?
            .collect::<Result<Vec<_>, _>>()?;
        items
    };
    tx.commit()?;

    let limit = u64::from(filter.pagination.limit);
    let offset = u64::from(filter.pagination.offset);

    Ok(AccountsPage {
        items,
        total,
        has_next_page: offset + limit < u64::from(total),
        has_previous_page: offset > 0,
    })
}

#[tauri::command]
pub fn add_account(state: tauri::State<AppState>, entry: AddAccount) -> Result<Account, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    add_account_with_conn(&mut conn, entry)
}

fn add_account_with_conn(conn: &mut Connection, entry: AddAccount) -> Result<Account, AppError> {
    let tx = conn.transaction()?;
    let account = create_account_in_transaction(&tx, entry)?;
    tx.commit()?;
    Ok(account)
}

/// The caller owns the transaction, including rollback of trigger side effects.
pub(crate) fn create_account_in_transaction(
    tx: &Connection,
    entry: AddAccount,
) -> Result<Account, AppError> {
    if entry.name.trim().is_empty() {
        return Err(AppError::Validation(
            "El nombre de la cuenta no puede estar vacío.".into(),
        ));
    }
    if let Some(balance) = entry.initial_balance {
        if !(0..=9_007_199_254_740_991).contains(&balance) {
            return Err(AppError::Validation(
                "El saldo inicial debe ser un entero seguro no negativo.".into(),
            ));
        }
    }

    let active_currency: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM currencies WHERE code = ?1 AND is_active = 1)",
        [&entry.currency_code],
        |row| row.get(0),
    )?;
    if !active_currency {
        return Err(AppError::Validation(
            "La moneda indicada no existe o está inactiva.".into(),
        ));
    }

    tx.execute(
        "INSERT INTO accounts (name, type, currency_code, description) VALUES (?1, ?2, ?3, ?4)",
        params![
            entry.name,
            entry.account_type,
            entry.currency_code,
            entry.description
        ],
    )?;

    let account_id = tx.last_insert_rowid();

    if let Some(balance) = entry.initial_balance {
        if balance > 0 {
            let today = chrono::Local::now().format("%Y-%m-%d").to_string();
            tx.execute(
                "INSERT INTO movements (account_id, type, amount, currency_code, date, description)
                 VALUES (?1, 'initial_balance', ?2, ?3, ?4, 'Saldo inicial')",
                params![account_id, balance, entry.currency_code, today],
            )?;
        }
    }

    let account = tx.query_row(
        "SELECT * FROM v_account_balances WHERE account_id = ?1",
        params![account_id],
        row_to_account,
    )?;
    Ok(account)
}

#[tauri::command]
pub fn update_account(
    state: tauri::State<AppState>,
    id: i64,
    entry: UpdateAccount,
) -> Result<Account, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    update_account_with_conn(&mut conn, id, entry)
}

fn update_account_with_conn(
    conn: &mut Connection,
    id: i64,
    entry: UpdateAccount,
) -> Result<Account, AppError> {
    if entry.name.trim().is_empty() {
        return Err(AppError::Validation(
            "El nombre de la cuenta no puede estar vacío.".into(),
        ));
    }

    let tx = conn.transaction()?;
    let affected = tx.execute(
        "UPDATE accounts SET name = ?1, type = ?2, description = ?3 WHERE id = ?4",
        params![entry.name, entry.account_type, entry.description, id],
    )?;

    if affected == 0 {
        return Err(AppError::NotFound(
            "No se encontró la cuenta indicada.".into(),
        ));
    }

    let account = tx.query_row(
        "SELECT * FROM v_account_balances WHERE account_id = ?1",
        params![id],
        row_to_account,
    )?;
    tx.commit()?;
    Ok(account)
}

#[tauri::command]
pub fn delete_account(state: tauri::State<AppState>, id: i64) -> Result<Account, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    delete_account_with_conn(&mut conn, id)
}

fn delete_account_with_conn(conn: &mut Connection, id: i64) -> Result<Account, AppError> {
    let tx = conn.transaction()?;
    let affected = tx.execute(
        "UPDATE accounts SET is_active = 0 WHERE id = ?1",
        params![id],
    )?;

    if affected == 0 {
        return Err(AppError::NotFound(
            "No se encontró la cuenta indicada.".into(),
        ));
    }

    let account = tx.query_row(
        "SELECT * FROM v_account_balances WHERE account_id = ?1",
        params![id],
        row_to_account,
    )?;
    tx.commit()?;
    Ok(account)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    const MAX_SAFE_INTEGER: i64 = 9_007_199_254_740_991;

    fn database() -> Connection {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::database::initialize(&mut conn).unwrap();
        conn
    }

    fn entry(name: &str, initial_balance: Option<i64>) -> AddAccount {
        AddAccount {
            name: name.into(),
            account_type: AccountType::Checking,
            currency_code: "USD".into(),
            description: None,
            initial_balance,
        }
    }

    fn filter(search: Option<&str>, limit: u8, offset: u32) -> AccountFilter {
        AccountFilter {
            active_only: None,
            sort: None,
            pagination: Pagination { limit, offset },
            search: search.map(str::to_owned),
        }
    }

    fn scalar(conn: &Connection, sql: &str) -> i64 {
        conn.query_row(sql, [], |row| row.get(0)).unwrap()
    }

    fn movement(conn: &Connection, account: &Account, kind: &str, amount: i64) {
        conn.execute(
            "INSERT INTO movements (account_id, type, amount, currency_code, date)
             VALUES (?1, ?2, ?3, ?4, '2026-10-18')",
            params![account.id, kind, amount, account.currency_code],
        )
        .unwrap();
    }

    #[test]
    fn searched_pages_count_names_and_descriptions_with_the_same_active_filter() {
        let mut conn = database();
        let first = add_account_with_conn(&mut conn, entry("Alpha target", None)).unwrap();
        let second = add_account_with_conn(
            &mut conn,
            AddAccount {
                description: Some("Description TARGET only".into()),
                ..entry("Beta", None)
            },
        )
        .unwrap();
        let third = add_account_with_conn(&mut conn, entry("Gamma target", None)).unwrap();
        add_account_with_conn(&mut conn, entry("Unrelated", None)).unwrap();
        let archived = add_account_with_conn(&mut conn, entry("Archived target", None)).unwrap();
        delete_account_with_conn(&mut conn, i64::from(archived.id)).unwrap();

        let page = get_accounts_with_conn(&conn, filter(Some(" target "), 2, 0)).unwrap();
        assert_eq!(page.total, 3);
        assert_eq!(
            page.items.iter().map(|a| a.id).collect::<Vec<_>>(),
            [first.id, second.id]
        );
        assert!(page.has_next_page);
        assert!(!page.has_previous_page);
        assert_eq!(serde_json::to_value(&page).unwrap()["total"], 3);
        let page = get_accounts_with_conn(&conn, filter(Some("target"), 2, 2)).unwrap();
        assert_eq!(page.total, 3);
        assert_eq!(page.items[0].id, third.id);
        assert_eq!(page.items.len(), 1);
        assert!(!page.has_next_page);
        assert!(page.has_previous_page);

        let mut all = filter(Some("target"), 50, 0);
        all.active_only = Some(false);
        assert_eq!(get_accounts_with_conn(&conn, all).unwrap().total, 4);
        for search in [None, Some("  ")] {
            assert_eq!(
                get_accounts_with_conn(&conn, filter(search, 50, 0))
                    .unwrap()
                    .total,
                4
            );
        }
        let page = get_accounts_with_conn(&conn, filter(Some("missing"), 2, 0)).unwrap();
        assert_eq!(page.total, 0);
        assert!(page.items.is_empty());
        assert!(!page.has_next_page);
        assert!(!page.has_previous_page);
    }

    #[test]
    fn search_treats_percent_underscore_and_backslash_as_literals() {
        for literal in ["%", "_", "\\", "\\%_"] {
            let mut conn = database();
            let named =
                add_account_with_conn(&mut conn, entry(&format!("Alpha {literal}"), None)).unwrap();
            let described = add_account_with_conn(
                &mut conn,
                AddAccount {
                    description: Some(format!("Contains {literal} literally")),
                    ..entry("Beta", None)
                },
            )
            .unwrap();
            add_account_with_conn(&mut conn, entry("Alpha wildcard decoy", None)).unwrap();
            for (offset, id) in [(0, named.id), (1, described.id)] {
                let page = get_accounts_with_conn(&conn, filter(Some(literal), 1, offset)).unwrap();
                assert_eq!(page.total, 2, "literal {literal:?}");
                assert_eq!(page.items.len(), 1);
                assert_eq!(page.items[0].id, id);
                assert_eq!(page.has_next_page, offset == 0);
                assert_eq!(page.has_previous_page, offset > 0);
            }
        }
    }

    #[test]
    fn pagination_handles_empty_exact_end_past_end_and_maximum_offset() {
        let mut conn = database();
        let empty = get_accounts_with_conn(&conn, filter(None, 1, 0)).unwrap();
        assert_eq!(empty.total, 0);
        assert!(empty.items.is_empty());
        assert!(!empty.has_next_page);
        assert!(!empty.has_previous_page);
        for name in ["A", "B", "C"] {
            add_account_with_conn(&mut conn, entry(name, None)).unwrap();
        }
        for (limit, offset, len, next) in [
            (2, 0, 2, true),
            (2, 1, 2, false),
            (2, 2, 1, false),
            (2, 3, 0, false),
            (2, 4, 0, false),
            (u8::MAX, u32::MAX, 0, false),
        ] {
            let page = get_accounts_with_conn(&conn, filter(None, limit, offset)).unwrap();
            assert_eq!(page.total, 3);
            assert_eq!(page.items.len(), len);
            assert_eq!(page.has_next_page, next);
            assert_eq!(page.has_previous_page, offset > 0);
        }
        assert!(matches!(
            get_accounts_with_conn(&conn, filter(None, 0, 0)),
            Err(AppError::Validation(_))
        ));
    }

    #[test]
    fn every_sort_uses_account_id_to_break_ties_across_pages() {
        let mut conn = database();
        let mut ids = Vec::new();
        for _ in 0..3 {
            ids.push(
                add_account_with_conn(&mut conn, entry("Same", Some(100)))
                    .unwrap()
                    .id,
            );
        }
        conn.execute("UPDATE accounts SET created_at = '2026-01-01 00:00:00'", [])
            .unwrap();
        for field in ["name", "createdAt", "balance"] {
            for direction in ["ASC", "DESC"] {
                for (offset, id) in ids.iter().enumerate() {
                    let query = serde_json::from_value(json!({
                        "sort": { "field": field, "direction": direction },
                        "pagination": { "limit": 1, "offset": offset },
                    }))
                    .unwrap();
                    let page = get_accounts_with_conn(&conn, query).unwrap();
                    assert_eq!(page.items[0].id, *id);
                }
            }
        }
    }

    #[test]
    fn crud_maps_view_aliases_and_keeps_large_amounts_as_json_numbers() {
        let mut conn = database();
        let amount = i64::from(i32::MAX) + 123;
        let data: AddAccount = serde_json::from_value(json!({
            "name": "Checking", "accountType": "checking", "currencyCode": "USD",
            "description": "Initial description", "initialBalance": amount,
        }))
        .unwrap();
        let account = add_account_with_conn(&mut conn, data).unwrap();
        assert_eq!(account.name, "Checking");
        assert_eq!(account.account_type, "checking");
        assert_eq!(account.currency_code, "USD");
        assert_eq!(account.description.as_deref(), Some("Initial description"));
        assert!(account.is_active);
        assert!(!account.created_at.is_empty());
        assert!(!account.updated_at.is_empty());
        assert_eq!(account.balance, amount);
        assert_eq!(serde_json::to_value(&account).unwrap()["balance"], amount);
        assert_eq!(scalar(&conn, "SELECT amount FROM movements"), amount);
        let kind: String = conn
            .query_row("SELECT type FROM movements", [], |r| r.get(0))
            .unwrap();
        assert_eq!(kind, "initial_balance");
        let updated = update_account_with_conn(
            &mut conn,
            i64::from(account.id),
            UpdateAccount {
                name: "Renamed".into(),
                account_type: AccountType::Savings,
                description: None,
            },
        )
        .unwrap();
        assert_eq!(updated.name, "Renamed");
        assert_eq!(updated.account_type, "savings");
        assert_eq!(updated.description, None);
        assert_eq!(updated.currency_code, "USD");
        assert_eq!(updated.balance, amount);
        let page = get_accounts_with_conn(&conn, filter(None, 50, 0)).unwrap();
        assert_eq!(
            serde_json::to_value(&page).unwrap()["items"][0]["balance"],
            amount
        );
        let worth = get_net_worth_with_conn(&conn).unwrap();
        assert_eq!(worth[0].total_balance, amount);
        assert_eq!(
            serde_json::to_value(&worth).unwrap()[0]["totalBalance"],
            amount
        );
        let archived = delete_account_with_conn(&mut conn, i64::from(account.id)).unwrap();
        assert!(!archived.is_active);
        assert_eq!(serde_json::to_value(&archived).unwrap()["balance"], amount);
    }

    #[test]
    fn zero_and_null_initial_balances_do_not_create_movements() {
        let mut conn = database();
        for balance in [json!(0), json!(null)] {
            let data = serde_json::from_value(json!({
                "name": "Empty", "accountType": "cash", "currencyCode": "USD",
                "initialBalance": balance,
            }))
            .unwrap();
            assert_eq!(add_account_with_conn(&mut conn, data).unwrap().balance, 0);
        }
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM accounts"), 2);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM movements"), 0);
    }

    #[test]
    fn initial_balance_accepts_safe_maximum_and_rejects_invalid_values_without_writes() {
        let mut conn = database();
        let account =
            add_account_with_conn(&mut conn, entry("Maximum", Some(MAX_SAFE_INTEGER))).unwrap();
        assert_eq!(account.balance, MAX_SAFE_INTEGER);
        for balance in [-1, i64::MIN, MAX_SAFE_INTEGER + 1, i64::MAX] {
            assert!(matches!(
                add_account_with_conn(&mut conn, entry("Invalid", Some(balance))),
                Err(AppError::Validation(_))
            ));
        }
        assert!(serde_json::from_value::<AddAccount>(json!({
            "name": "Fractional", "accountType": "cash", "currencyCode": "USD",
            "initialBalance": 1.5,
        }))
        .is_err());
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM accounts"), 1);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM movements"), 1);
    }

    #[test]
    fn unknown_and_inactive_currencies_reject_new_accounts_without_partial_rows() {
        let mut conn = database();
        conn.execute("UPDATE currencies SET is_active = 0 WHERE code = 'EUR'", [])
            .unwrap();
        for code in ["UNKNOWN", "EUR"] {
            for initial_balance in [None, Some(0), Some(100)] {
                let data = AddAccount {
                    currency_code: code.into(),
                    ..entry("Invalid", initial_balance)
                };
                assert!(matches!(
                    add_account_with_conn(&mut conn, data),
                    Err(AppError::Validation(_))
                ));
                assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM accounts"), 0);
                assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM movements"), 0);
                assert!(conn.is_autocommit());
            }
        }
    }

    #[test]
    fn initial_movement_failure_rolls_back_account_and_trigger_side_effects() {
        let mut conn = database();
        conn.execute_batch(
            "CREATE TRIGGER fail_initial BEFORE INSERT ON movements
            WHEN NEW.type = 'initial_balance'
            BEGIN SELECT RAISE(ABORT, 'injected initial balance failure'); END;",
        )
        .unwrap();
        assert!(matches!(
            add_account_with_conn(&mut conn, entry("Rollback", Some(100))),
            Err(AppError::Constraint(_))
        ));
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM accounts"), 0);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM movements"), 0);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM audit_log"), 0);
        assert!(conn.is_autocommit());
    }

    #[test]
    fn unsafe_create_response_rolls_back_account_and_movements() {
        let mut conn = database();
        conn.execute_batch(
            "CREATE TRIGGER unsafe_balance AFTER INSERT ON accounts
            BEGIN INSERT INTO movements (account_id, type, amount, currency_code, date)
            VALUES (NEW.id, 'income', 9007199254740991, NEW.currency_code, '2026-10-18'); END;",
        )
        .unwrap();
        assert!(matches!(
            add_account_with_conn(&mut conn, entry("Rollback", Some(1))),
            Err(AppError::Database(_))
        ));
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM accounts"), 0);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM movements"), 0);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM audit_log"), 0);
    }

    #[test]
    fn negative_safe_balance_serializes_exactly_and_unsafe_account_sum_fails() {
        let mut conn = database();
        let account = add_account_with_conn(&mut conn, entry("Debt", None)).unwrap();
        movement(&conn, &account, "expense", MAX_SAFE_INTEGER);
        let page = get_accounts_with_conn(&conn, filter(None, 50, 0)).unwrap();
        assert_eq!(page.items[0].balance, -MAX_SAFE_INTEGER);
        assert_eq!(
            serde_json::to_value(&page).unwrap()["items"][0]["balance"],
            -MAX_SAFE_INTEGER
        );
        assert_eq!(
            get_net_worth_with_conn(&conn).unwrap()[0].total_balance,
            -MAX_SAFE_INTEGER
        );
        movement(&conn, &account, "expense", 1);
        assert!(matches!(
            get_accounts_with_conn(&conn, filter(None, 50, 0)),
            Err(AppError::Database(_))
        ));
    }

    #[test]
    fn archive_preserves_ledger_history_and_excludes_only_archived_accounts_from_net_worth() {
        let mut conn = database();
        let archived = add_account_with_conn(&mut conn, entry("Archive", Some(500))).unwrap();
        movement(&conn, &archived, "income", 80);
        movement(&conn, &archived, "expense", 30);
        add_account_with_conn(&mut conn, entry("Keep", Some(200))).unwrap();
        add_account_with_conn(
            &mut conn,
            AddAccount {
                currency_code: "EUR".into(),
                ..entry("Euro", Some(300))
            },
        )
        .unwrap();
        let before: String = conn.query_row("SELECT json_group_array(json_object('id', id, 'account', account_id, 'type', type, 'amount', amount, 'currency', currency_code, 'date', date)) FROM (SELECT * FROM movements ORDER BY id)", [], |r| r.get(0)).unwrap();
        let worth = get_net_worth_with_conn(&conn).unwrap();
        assert_eq!(
            worth
                .iter()
                .map(|w| (w.currency_code.as_str(), w.total_balance))
                .collect::<Vec<_>>(),
            [("EUR", 300), ("USD", 750)]
        );
        let result = delete_account_with_conn(&mut conn, i64::from(archived.id)).unwrap();
        assert_eq!(result.balance, 550);
        assert!(!result.is_active);
        let after: String = conn.query_row("SELECT json_group_array(json_object('id', id, 'account', account_id, 'type', type, 'amount', amount, 'currency', currency_code, 'date', date)) FROM (SELECT * FROM movements ORDER BY id)", [], |r| r.get(0)).unwrap();
        assert_eq!(before, after);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM accounts"), 3);
        assert_eq!(
            get_accounts_with_conn(&conn, filter(None, 50, 0))
                .unwrap()
                .total,
            2
        );
        let mut all = filter(None, 50, 0);
        all.active_only = Some(false);
        let page = get_accounts_with_conn(&conn, all).unwrap();
        assert_eq!(page.total, 3);
        assert_eq!(
            page.items
                .iter()
                .find(|a| a.id == archived.id)
                .unwrap()
                .balance,
            550
        );
        let worth = get_net_worth_with_conn(&conn).unwrap();
        assert_eq!(
            worth
                .iter()
                .map(|w| (w.currency_code.as_str(), w.total_balance))
                .collect::<Vec<_>>(),
            [("EUR", 300), ("USD", 200)]
        );
        delete_account_with_conn(&mut conn, i64::from(archived.id)).unwrap();
    }

    #[test]
    fn inactive_currencies_remain_readable_for_existing_accounts() {
        let mut conn = database();
        let account = add_account_with_conn(&mut conn, entry("Existing", Some(100))).unwrap();
        conn.execute("UPDATE currencies SET is_active = 0 WHERE code = 'USD'", [])
            .unwrap();
        assert_eq!(
            get_accounts_with_conn(&conn, filter(None, 50, 0))
                .unwrap()
                .items[0]
                .balance,
            100
        );
        assert_eq!(
            get_net_worth_with_conn(&conn).unwrap()[0].total_balance,
            100
        );
        update_account_with_conn(
            &mut conn,
            i64::from(account.id),
            UpdateAccount {
                name: "Still editable".into(),
                account_type: AccountType::Cash,
                description: None,
            },
        )
        .unwrap();
        delete_account_with_conn(&mut conn, i64::from(account.id)).unwrap();
    }

    #[test]
    fn unsafe_account_outputs_are_rejected_and_failed_writes_are_rolled_back() {
        for amount in [MAX_SAFE_INTEGER + 1, -(MAX_SAFE_INTEGER + 1)] {
            let mut conn = database();
            let account = add_account_with_conn(&mut conn, entry("Original", None)).unwrap();
            movement(
                &conn,
                &account,
                if amount > 0 { "income" } else { "expense" },
                amount.abs(),
            );
            assert!(matches!(
                get_accounts_with_conn(&conn, filter(None, 50, 0)),
                Err(AppError::Database(_))
            ));
            assert!(matches!(
                get_net_worth_with_conn(&conn),
                Err(AppError::Database(_))
            ));
            assert!(matches!(
                update_account_with_conn(
                    &mut conn,
                    i64::from(account.id),
                    UpdateAccount {
                        name: "Must roll back".into(),
                        account_type: AccountType::Savings,
                        description: None,
                    }
                ),
                Err(AppError::Database(_))
            ));
            assert!(matches!(
                delete_account_with_conn(&mut conn, i64::from(account.id)),
                Err(AppError::Database(_))
            ));
            let stored: (String, String, bool) = conn
                .query_row(
                    "SELECT name, type, is_active FROM accounts WHERE id = ?1",
                    [account.id],
                    |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
                )
                .unwrap();
            assert_eq!(stored, ("Original".into(), "checking".into(), true));
            assert!(conn.is_autocommit());
        }
    }

    #[test]
    fn net_worth_rejects_unsafe_sums_of_individually_safe_balances() {
        let mut conn = database();
        add_account_with_conn(&mut conn, entry("Maximum", Some(MAX_SAFE_INTEGER))).unwrap();
        add_account_with_conn(&mut conn, entry("One", Some(1))).unwrap();
        assert_eq!(
            get_accounts_with_conn(&conn, filter(None, 50, 0))
                .unwrap()
                .total,
            2
        );
        assert!(matches!(
            get_net_worth_with_conn(&conn),
            Err(AppError::Database(_))
        ));
    }

    #[test]
    fn invalid_names_and_missing_accounts_follow_existing_errors() {
        let mut conn = database();
        assert!(matches!(
            add_account_with_conn(&mut conn, entry(" \t ", None)),
            Err(AppError::Validation(_))
        ));
        let account = add_account_with_conn(&mut conn, entry("Original", None)).unwrap();
        for (id, name, validation) in [(i64::from(account.id), "  ", true), (999, "Missing", false)]
        {
            let error = update_account_with_conn(
                &mut conn,
                id,
                UpdateAccount {
                    name: name.into(),
                    account_type: AccountType::Cash,
                    description: None,
                },
            )
            .unwrap_err();
            if validation {
                assert!(matches!(error, AppError::Validation(_)));
            } else {
                assert!(matches!(error, AppError::NotFound(_)));
            }
        }
        assert!(matches!(
            delete_account_with_conn(&mut conn, 999),
            Err(AppError::NotFound(_))
        ));
        assert_eq!(
            get_accounts_with_conn(&conn, filter(None, 50, 0))
                .unwrap()
                .items[0]
                .name,
            "Original"
        );
    }
}
