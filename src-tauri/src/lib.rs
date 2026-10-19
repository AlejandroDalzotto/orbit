use rusqlite::Connection;
use std::{fs, sync::Mutex};

use tauri::Manager;

pub mod accounts;
pub mod analytics;
pub mod categories;
pub mod database;
pub mod errors;
pub mod filters;
pub mod imports;
pub mod items;
pub mod movements;
pub mod purchases;
pub mod settings;
pub mod utils;

pub struct AppState {
    conn: Mutex<Connection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            accounts::get_net_worth,
            settings::get_currencies,
            settings::get_settings,
            settings::update_settings,
            analytics::get_analytics,
            accounts::get_accounts,
            accounts::add_account,
            accounts::delete_account,
            accounts::update_account,
            categories::get_categories,
            categories::add_category,
            categories::delete_category,
            categories::update_category,
            movements::get_movements,
            movements::get_movements_by_account_id,
            movements::add_movement,
            movements::update_movement,
            movements::delete_movement,
            items::get_items,
            items::add_item,
            items::delete_item,
            items::update_item,
            items::get_shops,
            items::add_shop,
            purchases::get_purchases,
            purchases::purchases_by_item,
            purchases::add_purchase,
            purchases::purchases_by_movement,
            purchases::delete_purchase,
            imports::get_import_templates,
            imports::preview_csv_import,
            imports::commit_csv_import,
        ])
        .setup(|app| {
            let app_data_dir = app.path().app_local_data_dir()?;

            // Ensure the directory exists (creates all missing parent dirs, no-op if present)
            fs::create_dir_all(&app_data_dir)?;

            let db_path = app_data_dir.join("app.db");
            let mut conn = Connection::open(&db_path)?;
            database::initialize(&mut conn)?;
            let preferences = settings::get_settings_with_conn(&conn)
                .map_err(|error| std::io::Error::other(error.to_string()))?;
            settings::sync_window_background(app.handle(), preferences.theme);

            app.manage(AppState {
                conn: Mutex::new(conn),
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
