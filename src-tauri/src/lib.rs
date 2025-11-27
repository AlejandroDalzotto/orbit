mod utils;

mod commands;
mod models;
mod sync;
mod traits;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // wallet commands
            commands::wallet::get_accounts_count,
            commands::wallet::get_total_balance,
            commands::wallet::get_accounts,
            commands::wallet::get_account_history,
            commands::wallet::add_account,
            commands::wallet::delete_account,
            commands::wallet::edit_account,
            // transactions commands
            commands::transactions::get_financial_summary,
            commands::transactions::get_transaction_by_id,
            commands::transactions::add_transaction,
            commands::transactions::delete_transaction,
            commands::transactions::search_transactions,
            commands::transactions::edit_transaction,
            commands::transactions::get_transactions_by_account_id,
            commands::transactions::get_transactions_by_category,
            // items module commands
            commands::items::list_items,
            commands::items::get_item_by_id,
            commands::items::add_item,
            commands::items::edit_item,
            commands::items::delete_item,
            commands::items::edit_is_spending_leak,
            commands::items::check_items_limits,
            // analytics module commands
            commands::analytics::get_analytics,
            // sync module commands
            commands::sync::start_sync_server,
            commands::sync::get_sync_status,
            commands::sync::stop_sync_server,
            commands::sync::get_sync_remaining_time,
            commands::sync::get_pending_sync_data,
            commands::sync::approve_sync_data,
            commands::sync::get_sync_status,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
