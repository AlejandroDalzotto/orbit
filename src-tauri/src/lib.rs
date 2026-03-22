use rusqlite::{params, Connection};
use std::sync::Mutex;

use tauri::Manager;

pub mod accounts;
pub mod categories;

pub struct AppState {
    conn: Mutex<Connection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            accounts::get_accounts,
            accounts::add_account,
            accounts::delete_account,
            accounts::update_account,
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
                params!["Cuenta inicial de ejemplo", "Banco"],
            ).unwrap();

            let account_id = conn.last_insert_rowid();
            conn.execute(
                "INSERT INTO balance_snapshots (account_id, balance, snapshot_date) VALUES (?1, ?2, ?3)",
                params![account_id, 0, "2025-01-01"],
            ).unwrap();

            app.manage(AppState {
                conn: Mutex::new(conn),
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
