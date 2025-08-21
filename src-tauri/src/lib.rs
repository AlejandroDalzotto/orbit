mod utils;

mod commands;
mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      commands::wallet::get_total_balance,
      commands::wallet::get_accounts,
      commands::wallet::get_account_history,
      commands::wallet::add_account,
      commands::wallet::delete_account,
      commands::wallet::edit_account,

      commands::transactions::get_transactions,
      commands::transactions::get_financial_summary,
      commands::transactions::get_transaction_by_id,
      commands::transactions::add_transaction,
      commands::transactions::delete_transaction,
      commands::transactions::search_transactions,
      commands::transactions::edit_transaction,
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
