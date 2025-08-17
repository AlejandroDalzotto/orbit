use std::collections::HashMap;

use crate::models::{
    enums::{SchemaVersion, Transaction},
    transaction::{FinancialSummary, TransactionDB},
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
