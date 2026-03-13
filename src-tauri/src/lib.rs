use rusqlite::{params, Connection};
use serde::Serialize;
use std::sync::Mutex;
use tauri::Manager;

struct AppState {
    conn: Mutex<Connection>,
}

#[derive(Serialize)]
struct Account {
    id: i64,
    name: String,
    acc_type: String,
    currency: String,
    created_at: String,
}

#[tauri::command]
fn get_accounts(state: tauri::State<AppState>) -> Vec<Account> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT id, name, acc_type, currency, created_at FROM accounts")
        .unwrap();
    let rows = stmt
        .query_map([], |row| {
            Ok(Account {
                id: row.get::<_, i64>(0).unwrap(),
                name: row.get::<_, String>(1).unwrap(),
                acc_type: row.get::<_, String>(2).unwrap(),
                currency: row.get::<_, String>(3).unwrap(),
                created_at: row.get::<_, String>(4).unwrap(),
            })
        })
        .unwrap();
    rows.into_iter().map(|r| r.unwrap()).collect()
}

#[tauri::command]
fn get_account_balance_by_id(state: tauri::State<AppState>, id: i64) -> f64 {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare("SELECT current_balance_ars FROM v_account_balance WHERE account_id = ?1")
        .unwrap();
    let rows = stmt
        .query_map(params![id], |row| Ok(row.get::<_, f64>(0).unwrap()))
        .unwrap();
    rows.into_iter()
        .map(|r| r.unwrap())
        .collect::<Vec<f64>>()
        .first()
        .copied()
        .unwrap_or(0.0)
}

#[tauri::command]
fn add_account(state: tauri::State<AppState>, account: String) {
    let conn = state.conn.lock().unwrap();
    conn.execute(
        "INSERT INTO accounts (name, acc_type) VALUES (?1, ?2)",
        params![account, "checking"],
    )
    .unwrap();
}

#[tauri::command]
fn delete_account(state: tauri::State<AppState>, id: i64) {
    let conn = state.conn.lock().unwrap();
    conn.execute("DELETE FROM accounts WHERE id = ?1", params![id])
        .unwrap();
}

#[tauri::command]
fn update_account(state: tauri::State<AppState>, id: i64, account: String) {
    let conn = state.conn.lock().unwrap();
    conn.execute(
        "UPDATE accounts SET name = ?1 WHERE id = ?2",
        params![account, id],
    )
    .unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_accounts,
            get_account_balance_by_id,
            add_account,
            delete_account,
            update_account
        ])
        .setup(|app| {
            // let db_path = app.path().app_data_dir()?.join("app.db");

            let conn = Connection::open_in_memory()?;

            // conn.execute_batch("PRAGMA foreign_keys = ON;")?;

            // MIGRATIONS.to_latest(&mut conn).unwrap();

            let initial_script = std::fs::read_to_string("schema.sql").unwrap();
            conn.execute_batch(&initial_script).unwrap();

            conn.execute(
                "INSERT INTO accounts (name, acc_type) VALUES (?1, ?2)",
                params!["Example account 1", "checking"],
            )
            .unwrap();

            app.manage(AppState {
                conn: Mutex::new(conn),
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
