use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use tauri::{Manager};
use uuid::Uuid;

use crate::utils::atomic_write;

/// La versión del esquema
#[derive(Serialize, Deserialize, Debug)]
pub enum SchemaVersion {
    V1,
    V2,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum AccountType {
    Cash,
    #[serde(rename = "online wallet")]
    OnlineWallet,
    #[serde(rename = "bank account")]
    BankAccount,
    #[serde(rename = "credit card")]
    CreditCard,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Currency {
    USD,
    ARS,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    pub id: String,
    pub name: String,
    pub r#type: AccountType,
    pub balance: f64,
    pub currency: Currency,
    pub created_at: u64,
    pub updated_at: u64,
    pub transactions_count: i32,
    pub transactions_id: Vec<String>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NewAccount {
    pub name: String,
    pub r#type: AccountType,
    pub balance: f64,
    pub currency: Currency,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WalletDB {
    pub total_balance: f64,
    pub accounts: HashMap<String, Account>,
    pub schema_version: SchemaVersion,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum TransactionType {
    Income,
    Expense,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "category")]
pub enum Transaction {
    Basic {
        id: String,
        amount: f64,
        currency: Currency,
        date: u64,
        created_at: u64,
        updated_at: u64,
        details: Option<String>,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
    },
    Supermarket {
        id: String,
        amount: f64,
        currency: Currency,
        date: u64,
        created_at: u64,
        updated_at: u64,
        details: Option<String>,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
        store_name: String,
        items: Vec<Item>,
    },
    Salary {
        id: String,
        amount: f64,
        currency: Currency,
        date: u64,
        created_at: u64,
        updated_at: u64,
        details: Option<String>,
        r#type: TransactionType,
        affects_balance: bool,
        // todo: Create DTOs to avoid using String ids directly and provide useful information.
        account_id: String,
        job: String,
        payment_date: u64,
        employer: Option<String>,
        extra_details: Option<String>,
    },
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Item {
    name: String,
    quantity: Option<u32>,
    price: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TransactionDB {
    pub data: HashMap<String, Transaction>,
    pub net_balance: f64,
    pub total_income: f64,
    pub total_expenses: f64,
    pub schema_version: SchemaVersion,
}

#[tauri::command]
pub async fn get_total_balance(app: tauri::AppHandle) -> Result<f64, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("wallet.json");

    if !file_path.exists() {
        return Ok(0.0);
    }

    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read wallet file: {}", e))?;

    let wallet: WalletDB = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse wallet file: {}", e))?;

    Ok(wallet.total_balance)
}

#[tauri::command]
pub async fn get_accounts(app: tauri::AppHandle) -> Result<Vec<Account>, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("wallet.json");

    if !file_path.exists() {
        return Ok(Vec::new());
    }

    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read wallet file: {}", e))?;

    let wallet: WalletDB = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse wallet file: {}", e))?;

    Ok(wallet.accounts.iter()
        .map(|(_, account)| account.clone())
        .collect()
    )
}

#[tauri::command]
pub async fn get_account_history(
    id: String,
    app: tauri::AppHandle,
) -> Result<Vec<Transaction>, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("wallet.json");

    if !file_path.exists() {
        return Err("Wallet file does not exist".to_string());
    }

    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read wallet file: {}", e))?;

    let wallet: WalletDB = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse wallet file: {}", e))?;

    let account = wallet.accounts.get(id.as_str());

    if let Some(account) = account {
        let transaction_file_path = file_path
            .parent()
            .ok_or("Could not get parent directory")?
            .join("transactions.json");

        if !transaction_file_path.exists() {
            return Ok(Vec::new());
        }

        let transaction_content = std::fs::read_to_string(&transaction_file_path)
            .map_err(|e| format!("Failed to read transactions file: {}", e))?;

        let transaction_db: TransactionDB = serde_json::from_str(&transaction_content)
            .map_err(|e| format!("Failed to parse transactions file: {}", e))?;

        let transactions: Vec<Transaction> = account
            .transactions_id
            .iter()
            .filter_map(|transaction_id| {
                transaction_db
                    .data
                    .get(transaction_id)
                    .cloned()
            })
            .collect();

        Ok(transactions)
    } else {
        Err("Account not found".to_string())
    }
}

#[tauri::command]
pub async fn add_account(
    entry: NewAccount,
    app: tauri::AppHandle,
) -> Result<Account, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("wallet.json");

    let mut wallet: WalletDB = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read wallet file: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse wallet file: {}", e))?
    } else {
        WalletDB {
            total_balance: 0.0,
            accounts: HashMap::new(),
            schema_version: SchemaVersion::V1,
        }
    };

    let id = Uuid::new_v4().to_string();

    let account = Account {
        id: id.clone(),
        name: entry.name.clone(),
        r#type: entry.r#type.clone(),
        balance: entry.balance,
        currency: entry.currency.clone(),
        created_at: chrono::Utc::now().timestamp_millis() as u64,
        updated_at: chrono::Utc::now().timestamp_millis() as u64,
        transactions_count: 0,
        transactions_id: Vec::new(),
    };

    wallet.accounts.insert(id, account.clone());
    wallet.total_balance += entry.balance;

    let content = serde_json::to_string_pretty(&wallet)
            .map_err(|e| format!("Failed to serialize wallet: {}", e))?;

    atomic_write(
        &file_path,
        &content
    )
    .map_err(|e| format!("Failed to write wallet file: {}", e))?;

    Ok(account)
}

#[tauri::command]
pub async fn delete_account(
    id: String,
    app: tauri::AppHandle,
) -> Result<Account, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("wallet.json");

    if !file_path.exists() {
        return Err("Wallet file does not exist".to_string());
    }

    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read wallet file: {}", e))?;

    let mut wallet: WalletDB = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse wallet file: {}", e))?;

    if let Some(account) = wallet.accounts.remove(&id) {
        wallet.total_balance -= account.balance;

        let updated_content = serde_json::to_string_pretty(&wallet)
            .map_err(|e| format!("Failed to serialize wallet: {}", e))?;

        atomic_write(
            &file_path,
            &updated_content
        )
        .map_err(|e| format!("Failed to write wallet file: {}", e))?;

        Ok(account)
    } else {
        Err("Account not found".to_string())
    }
}

#[tauri::command]
pub async fn edit_account(
    id: String,
    entry: NewAccount,
    app: tauri::AppHandle,
) -> Result<Account, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("wallet.json");

    if !file_path.exists() {
        return Err("Wallet file does not exist".to_string());
    }

    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read wallet file: {}", e))?;

    let mut wallet: WalletDB = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse wallet file: {}", e))?;

    if let Some(account) = wallet.accounts.get_mut(&id) {
        wallet.total_balance -= account.balance;
        
        account.name = entry.name.clone();
        account.r#type = entry.r#type.clone();
        account.balance = entry.balance;
        account.currency = entry.currency.clone();
        account.updated_at = chrono::Utc::now().timestamp_millis() as u64;

        wallet.total_balance += entry.balance;

        // Clone the account before ending the mutable borrow
        let updated_account = account.clone();

        let updated_content = serde_json::to_string_pretty(&wallet)
            .map_err(|e| format!("Failed to serialize wallet: {}", e))?;

        atomic_write(
            &file_path,
            &updated_content
        )
        .map_err(|e| format!("Failed to write wallet file: {}", e))?;

        Ok(updated_account)
    } else {
        Err("Account not found".to_string())
    }
}