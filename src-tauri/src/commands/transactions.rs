use std::collections::HashMap;

use crate::{
    models::{
        enums::{NewTransaction, SchemaVersion, Transaction},
        transaction::{FinancialSummary, TransactionDB},
    },
    utils::atomic_write,
};
use tauri::Manager;

#[tauri::command]
pub async fn get_transactions(app: tauri::AppHandle) -> Result<Vec<Transaction>, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("transactions.json");

    let transaction_db = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read transactions file: {}", e))?;

        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse transactions file: {}", e))?
    } else {
        TransactionDB {
            data: HashMap::new(),
            net_balance: 0.0,
            total_expenses: 0.0,
            total_income: 0.0,
            schema_version: SchemaVersion::V1,
        }
    };

    let transactions = transaction_db.data.values().cloned().collect();

    Ok(transactions)
}

#[tauri::command]
pub async fn get_financial_summary(app: tauri::AppHandle) -> Result<FinancialSummary, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("transactions.json");

    let transaction_db = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read transactions file: {}", e))?;

        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse transactions file: {}", e))?
    } else {
        TransactionDB {
            data: HashMap::new(),
            net_balance: 0.0,
            total_expenses: 0.0,
            total_income: 0.0,
            schema_version: SchemaVersion::V1,
        }
    };

    let summary = FinancialSummary {
        net_balance: transaction_db.net_balance,
        total_income: transaction_db.total_income,
        total_expenses: transaction_db.total_expenses,
    };

    Ok(summary)
}

#[tauri::command]
pub async fn get_transaction_by_id(
    id: String,
    app: tauri::AppHandle,
) -> Result<Transaction, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("transactions.json");

    let transaction_db = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read transactions file: {}", e))?;

        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse transactions file: {}", e))?
    } else {
        TransactionDB {
            data: HashMap::new(),
            net_balance: 0.0,
            total_expenses: 0.0,
            total_income: 0.0,
            schema_version: SchemaVersion::V1,
        }
    };

    if let Some(transaction) = transaction_db.data.get(&id) {
        Ok(transaction.clone())
    } else {
        Err("Transaction not found".to_string())
    }
}

#[tauri::command]
pub async fn add_transaction(
    entry: NewTransaction,
    app: tauri::AppHandle,
) -> Result<Transaction, String> {
    println!("entry: {:#?}", &entry);

    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("transactions.json");

    let mut transaction_db = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read wallet file: {}", e))?;

        serde_json::from_str(&content).map_err(|e| format!("Failed to parse wallet file: {}", e))?
    } else {
        TransactionDB {
            data: HashMap::new(),
            net_balance: 0.0,
            total_expenses: 0.0,
            total_income: 0.0,
            schema_version: SchemaVersion::V1,
        }
    };

    let new_transaction = Transaction::new_from(entry);

    println!("new entry with all fields: {:#?}", &new_transaction);

    transaction_db
        .data
        .insert(new_transaction.get_id(), new_transaction.clone());

    if new_transaction.is_income() {
        transaction_db.total_income += new_transaction.get_amount();
    } else {
        transaction_db.total_expenses += new_transaction.get_amount();
    }

    transaction_db.net_balance = transaction_db.total_income - transaction_db.total_expenses;

    let updated_content = serde_json::to_string_pretty(&transaction_db)
        .map_err(|e| format!("Failed to serialize wallet: {}", e))?;

    atomic_write(&file_path, &updated_content)
        .map_err(|e| format!("Failed to write wallet file: {}", e))?;

    Ok(new_transaction)
}

#[tauri::command]
pub async fn delete_transaction(id: String, app: tauri::AppHandle) -> Result<Transaction, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("transactions.json");

    if !file_path.exists() {
        return Err("Transaction file does not exist".to_string());
    }

    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read wallet file: {}", e))?;

    let mut transaction_db: TransactionDB = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse wallet file: {}", e))?;

    if let Some(transaction) = transaction_db.data.remove(&id) {
        if transaction.is_income() {
            transaction_db.total_income -= transaction.get_amount();
        } else {
            transaction_db.total_expenses -= transaction.get_amount();
        }

        transaction_db.net_balance = transaction_db.total_income - transaction_db.total_expenses;

        let updated_content = serde_json::to_string_pretty(&transaction_db)
            .map_err(|e| format!("Failed to serialize wallet: {}", e))?;

        atomic_write(&file_path, &updated_content)
            .map_err(|e| format!("Failed to write wallet file: {}", e))?;

        Ok(transaction)
    } else {
        Err("Transaction not found".to_string())
    }
}

#[tauri::command]
pub async fn search_transactions(
    app: tauri::AppHandle,
    query: String,
) -> Result<Vec<Transaction>, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("transactions.json");

    let transaction_db = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read transactions file: {}", e))?;

        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse transactions file: {}", e))?
    } else {
        TransactionDB {
            data: HashMap::new(),
            net_balance: 0.0,
            total_expenses: 0.0,
            total_income: 0.0,
            schema_version: SchemaVersion::V1,
        }
    };

    let query_lower = query.to_lowercase();

    let filtered_transactions: Vec<Transaction> = transaction_db
        .data
        .values()
        .filter(|transaction| {
            // Buscar en descripción
            transaction.get_details().to_lowercase().contains(&query_lower) ||
            // Buscar en categoría
            transaction.get_category().to_lowercase().contains(&query_lower)
        })
        .cloned()
        .collect();

    Ok(filtered_transactions)
}
