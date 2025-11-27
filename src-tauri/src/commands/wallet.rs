use crate::{
    models::{
        transaction::{Transaction, TransactionDB},
        wallet::{Account, EditAccount, NewAccount, WalletDB},
    },
    traits::database::DatabaseOperations,
};

#[tauri::command]
pub async fn get_total_balance(app: tauri::AppHandle) -> Result<f64, String> {
    let wallet = WalletDB::read(&app)?;
    Ok(wallet.total_balance)
}

#[tauri::command]
pub async fn get_accounts_count(app: tauri::AppHandle) -> Result<u32, String> {
    let wallet = WalletDB::read(&app)?;
    Ok(wallet.accounts_count())
}

#[tauri::command]
pub async fn get_accounts(app: tauri::AppHandle) -> Result<Vec<Account>, String> {
    let wallet = WalletDB::read(&app)?;
    Ok(wallet.get_accounts())
}

#[tauri::command]
pub async fn get_account_history(
    id: String,
    app: tauri::AppHandle,
) -> Result<Vec<Transaction>, String> {
    let wallet = WalletDB::read(&app)?;

    let account = wallet
        .accounts
        .get(&id)
        .ok_or_else(|| "Account not found".to_string())?;

    let transaction_db = TransactionDB::read(&app)?;

    let transactions: Vec<Transaction> = account
        .transactions_id
        .iter()
        .filter_map(|id| transaction_db.data.get(id).cloned())
        .collect();

    Ok(transactions)
}

#[tauri::command]
pub async fn add_account(entry: NewAccount, app: tauri::AppHandle) -> Result<Account, String> {
    let mut wallet = WalletDB::read(&app)?;
    let account = wallet.add_account(entry);
    wallet.write(&app)?;
    Ok(account)
}

#[tauri::command]
pub async fn delete_account(id: String, app: tauri::AppHandle) -> Result<Account, String> {
    let mut wallet = WalletDB::read(&app)?;
    let account = wallet.remove_account(&id)?;
    wallet.write(&app)?;
    Ok(account)
}

#[tauri::command]
pub async fn edit_account(
    id: String,
    entry: EditAccount,
    app: tauri::AppHandle,
) -> Result<Account, String> {
    let mut wallet = WalletDB::read(&app)?;
    let account = wallet.edit_account(&id, entry)?;
    wallet.write(&app)?;
    Ok(account)
}
