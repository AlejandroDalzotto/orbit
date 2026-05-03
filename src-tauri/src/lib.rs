use rusqlite::Connection;
use std::sync::Mutex;

use tauri::Manager;

pub mod accounts;
pub mod categories;
pub mod groups;
pub mod movements;

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
            movements::add_movement,
            movements::update_movement,
            movements::delete_movement,
            groups::get_groups,
            groups::add_group,
            groups::delete_group,
            groups::update_group,
        ])
        .setup(|app| {
            // let db_path = app.path().app_data_dir()?.join("app.db");

            let conn = Connection::open_in_memory()?;

            // conn.execute_batch("PRAGMA foreign_keys = ON;")?;

            // MIGRATIONS.to_latest(&mut conn).unwrap();

            let schema = include_str!("../schema.sql");

            // initialize database with schema.sql
            match conn.execute_batch(schema) {
                Ok(_) => println!("Base de datos inicializada correctamente"),
                Err(e) => println!("Error al inicializar la base de datos: {:?}", e),
            }

            // WARNING: this is only used in development to populate with initial data. Do not use in production.
            // populate with initial data
            let data = include_str!("../data.sql");
            match conn.execute_batch(data) {
                Ok(_) => println!("Datos iniciales cargados correctamente"),
                Err(e) => println!("Error al cargar datos iniciales: {:?}", e),
            }

            app.manage(AppState {
                conn: Mutex::new(conn),
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
