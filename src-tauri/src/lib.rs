use rusqlite::Connection;
use std::{fs, sync::Mutex};

use tauri::Manager;

pub mod accounts;
pub mod categories;
pub mod errors;
pub mod groups;
pub mod items;
pub mod movements;
pub mod purchases;
pub mod utils;

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
            categories::get_categories,
            categories::add_category,
            categories::delete_category,
            categories::update_category,
            movements::get_movements,
            movements::get_movements_stats,
            movements::get_movements_by_account_id,
            movements::add_movement,
            movements::update_movement,
            movements::delete_movement,
            movements::items_by_movement,
            groups::get_groups,
            groups::add_group,
            groups::delete_group,
            groups::update_group,
            items::get_items,
            items::add_item,
            items::delete_item,
            items::update_item,
            items::get_stores,
            purchases::get_purchases,
            purchases::purchases_by_item,
            purchases::add_purchase,
        ])
        .setup(|app| {
            let app_data_dir = app.path().app_local_data_dir()?;

            // Ensure the directory exists (creates all missing parent dirs, no-op if present)
            fs::create_dir_all(&app_data_dir)?;

            let db_path = app_data_dir.join("app.db");
            let conn = Connection::open(&db_path)?;

            let schema = include_str!("../schema.sql");
            match conn.execute_batch(schema) {
                Ok(_) => println!("Base de datos inicializada correctamente"),
                Err(e) => println!("Error al inicializar la base de datos: {:?}", e),
            }

            app.manage(AppState {
                conn: Mutex::new(conn),
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
