use rusqlite::{params, ToSql};
use serde::{Deserialize, Serialize};

use crate::AppState;

#[derive(Debug, Deserialize, Serialize)]
pub enum CurrentupportedCurrencies {
    USD,
    ARS,
}

impl ToSql for CurrentupportedCurrencies {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        let s: &str = match self {
            CurrentupportedCurrencies::USD => "USD",
            CurrentupportedCurrencies::ARS => "ARS",
        };
        Ok(rusqlite::types::ToSqlOutput::from(s))
    }
}

#[derive(Serialize, Debug)]
pub struct Account {
    id: i64,
    name: String,
    acc_type: String,
    currency: String,
    created_at: String,
    notes: Option<String>,
    balance: f64,
}

#[tauri::command]
pub fn get_accounts(state: tauri::State<AppState>) -> Vec<Account> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT account_id, account_name, acc_type, currency, created_at, notes, current_balance_original FROM v_account_balance_original")
        .unwrap();
    let rows = stmt
        .query_map([], |row| {
            Ok(Account {
                id: row.get::<_, i64>(0).unwrap(),
                name: row.get::<_, String>(1).unwrap(),
                acc_type: row.get::<_, String>(2).unwrap(),
                currency: row.get::<_, String>(3).unwrap(),
                created_at: row.get::<_, String>(4).unwrap(),
                notes: row.get::<_, Option<String>>(5).unwrap(),
                balance: row.get::<_, f64>(6).unwrap(),
            })
        })
        .unwrap();

    let accounts = rows
        .into_iter()
        .map(|r| r.unwrap())
        .collect::<Vec<Account>>();

    #[cfg(dev)]
    {
        println!("retriving {} accounts", accounts.len());
    }

    accounts
}

#[derive(Debug, Deserialize)]
pub struct AddAccount {
    name: String,
    acc_type: String,
    currency: CurrentupportedCurrencies,
    initial_balance: f64,
    notes: Option<String>,
}

#[tauri::command]
pub fn add_account(state: tauri::State<AppState>, account: AddAccount) -> Account {
    let conn = state.conn.lock().unwrap();

    conn.execute(
        "INSERT INTO accounts (name, acc_type, currency, notes) VALUES (?1, ?2, ?3, ?4)",
        params![
            account.name,
            account.acc_type,
            account.currency,
            account.notes
        ],
    )
    .unwrap();

    let account_id = conn.last_insert_rowid();
    let initial_balance_in_cents = (account.initial_balance * 100.0) as i64;
    let now = chrono::Local::now().format("%d-%m-%Y").to_string();

    conn.execute(
        "INSERT INTO balance_snapshots (account_id, balance, snapshot_date) VALUES (?1, ?2, ?3)",
        params![account_id, initial_balance_in_cents, now],
    )
    .unwrap();

    conn.query_row(
        "SELECT a.id, a.name, a.acc_type, a.currency, a.created_at, a.notes,
                COALESCE(SUM(bs.balance), 0) as balance
         FROM accounts a
         LEFT JOIN balance_snapshots bs ON bs.account_id = a.id
         WHERE a.id = ?1
         GROUP BY a.id",
        params![account_id],
        |row| {
            Ok(Account {
                id: row.get(0)?,
                name: row.get(1)?,
                acc_type: row.get(2)?,
                currency: row.get(3)?,
                created_at: row.get(4)?,
                notes: row.get(5)?,
                balance: row.get(6)?,
            })
        },
    )
    .unwrap()
}

#[tauri::command]
pub fn delete_account(state: tauri::State<AppState>, id: i64) {
    let conn = state.conn.lock().unwrap();

    // First we delete all snapshots for this account
    // WARNING: if you try to delete the account first and skip this step, you'll get a foreign key constraint violation, therefore the app will crash
    conn.execute(
        "DELETE FROM balance_snapshots WHERE account_id = ?1",
        params![id],
    )
    .unwrap();

    // Then we delete the account itself
    conn.execute("DELETE FROM accounts WHERE id = ?1", params![id])
        .unwrap();
}

#[derive(Debug, Deserialize)]
pub struct UpdateAccount {
    name: String,
    acc_type: String,
    notes: Option<String>,
}

#[tauri::command]
pub fn update_account(state: tauri::State<AppState>, id: i64, account: UpdateAccount) -> Account {
    let conn = state.conn.lock().unwrap();

    conn.execute(
        "UPDATE accounts SET name = ?1, acc_type = ?2, notes = ?3 WHERE id = ?4",
        params![account.name, account.acc_type, account.notes, id],
    )
    .unwrap();

    conn.query_row(
        "SELECT a.id, a.name, a.acc_type, a.currency, a.created_at, a.notes,
                COALESCE(SUM(bs.balance), 0) as balance
         FROM accounts a
         LEFT JOIN balance_snapshots bs ON bs.account_id = a.id
         WHERE a.id = ?1
         GROUP BY a.id",
        params![id],
        |row| {
            Ok(Account {
                id: row.get(0)?,
                name: row.get(1)?,
                acc_type: row.get(2)?,
                currency: row.get(3)?,
                created_at: row.get(4)?,
                notes: row.get(5)?,
                balance: row.get(6)?,
            })
        },
    )
    .unwrap()
}
