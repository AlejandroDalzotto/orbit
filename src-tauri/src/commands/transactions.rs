use std::collections::HashMap;

use crate::{
    models::{
        enums::SchemaVersion,
        transaction::{
            FinancialSummary, RequestCreateTransaction, RequestEditTransaction, Transaction,
            TransactionDB,
        },
        wallet::WalletDB,
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
        transactions_count: transaction_db.data.len(),
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
    entry: RequestCreateTransaction,
    app: tauri::AppHandle,
) -> Result<Transaction, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("transactions.json");

    let mut transaction_db = if file_path.exists() {
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

    let new_transaction = Transaction::new_from_request(entry);

    transaction_db
        .data
        .insert(new_transaction.id.clone(), new_transaction.clone());

    if new_transaction.is_income() {
        transaction_db.total_income += new_transaction.amount;
    } else {
        transaction_db.total_expenses += new_transaction.amount;
    }

    transaction_db.net_balance = transaction_db.total_income - transaction_db.total_expenses;

    if new_transaction.affects_balance {
        let file_path = file_path
            .parent()
            .ok_or("Could not get parent directory")?
            .join("wallet.json");

        if file_path.exists() {
            let content = std::fs::read_to_string(&file_path)
                .map_err(|e| format!("Failed to read wallet file: {}", e))?;

            let mut wallet_db: WalletDB = serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse wallet file: {}", e))?;

            if let Some(acc) = wallet_db.accounts.get_mut(&new_transaction.account_id) {
                if !new_transaction.is_income() && new_transaction.amount > acc.balance {
                    return Err(String::from(format!(
                        "The transaction's amount exceeds the current balance of the wallet {}.",
                        acc.name
                    )));
                }

                if new_transaction.is_income() {
                    acc.balance += new_transaction.amount;
                    wallet_db.total_balance += new_transaction.amount;
                } else {
                    acc.balance -= new_transaction.amount;
                    wallet_db.total_balance -= new_transaction.amount;
                }

                acc.transactions_count += 1;
                acc.transactions_id.push(new_transaction.id.clone());

                let updated_content = serde_json::to_string_pretty(&wallet_db)
                    .map_err(|e| format!("Failed to serialize wallet: {}", e))?;

                atomic_write(&file_path, &updated_content)
                    .map_err(|e| format!("Failed to write wallet file: {}", e))?;
            }
        }
    }

    let updated_content = serde_json::to_string_pretty(&transaction_db)
        .map_err(|e| format!("Failed to serialize transactions: {}", e))?;

    atomic_write(&file_path, &updated_content)
        .map_err(|e| format!("Failed to write transactions file: {}", e))?;

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
        .map_err(|e| format!("Failed to read transactions file: {}", e))?;

    let mut transaction_db: TransactionDB = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse transactions file: {}", e))?;

    if let Some(removed_transaction) = transaction_db.data.remove(&id) {
        if removed_transaction.is_income() {
            transaction_db.total_income -= removed_transaction.amount;
        } else {
            transaction_db.total_expenses -= removed_transaction.amount;
        }

        transaction_db.net_balance = transaction_db.total_income - transaction_db.total_expenses;

        let updated_content = serde_json::to_string_pretty(&transaction_db)
            .map_err(|e| format!("Failed to serialize transactions: {}", e))?;

        atomic_write(&file_path, &updated_content)
            .map_err(|e| format!("Failed to write transactions file: {}", e))?;

        Ok(removed_transaction)
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
            // Buscar en detalles
            transaction.details.to_lowercase().contains(&query_lower) ||
            // Buscar en categoría
            transaction.category.to_lowercase().contains(&query_lower) ||
            // Buscar en campos específicos según el tipo de transacción
            match transaction.get_type().as_str() {
                "salary" => {
                    transaction.job.as_ref().map_or(false, |job| job.to_lowercase().contains(&query_lower)) ||
                    transaction.employer.as_ref().map_or(false, |employer| employer.to_lowercase().contains(&query_lower))
                },
                "freelance" => {
                    transaction.client.as_ref().map_or(false, |client| client.to_lowercase().contains(&query_lower)) ||
                    transaction.project.as_ref().map_or(false, |project| project.to_lowercase().contains(&query_lower))
                },
                _ => false
            }
        })
        .cloned()
        .collect();

    Ok(filtered_transactions)
}

#[tauri::command]
pub async fn edit_transaction(
    id: String,
    new_values: RequestEditTransaction,
    app: tauri::AppHandle,
) -> Result<Transaction, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("transactions.json");

    let mut transaction_db = if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read transaction file: {}", e))?;

        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse transaction file: {}", e))?
    } else {
        TransactionDB {
            data: HashMap::new(),
            net_balance: 0.0,
            total_expenses: 0.0,
            total_income: 0.0,
            schema_version: SchemaVersion::V1,
        }
    };

    if let Some(existing_transaction) = transaction_db.data.get_mut(&id) {

        // If the original transaction does affect the balance, then we need to update the wallet's balance.
        if existing_transaction.affects_balance {
            let file_path = file_path
                .parent()
                .ok_or("Could not get parent directory")?
                .join("wallet.json");

            if file_path.exists() {
                let content = std::fs::read_to_string(&file_path)
                    .map_err(|e| format!("Failed to read wallet file: {}", e))?;

                let mut wallet_db: WalletDB = serde_json::from_str(&content)
                    .map_err(|e| format!("Failed to parse wallet file: {}", e))?;

                if let Some(acc) = wallet_db.accounts.get_mut(&existing_transaction.account_id) {

                    if existing_transaction.is_income() {

                        acc.balance -= existing_transaction.amount;
                        wallet_db.total_balance -= existing_transaction.amount;

                        acc.balance += new_values.amount;
                        wallet_db.total_balance += new_values.amount;
                    } else {
                        acc.balance += existing_transaction.amount;
                        wallet_db.total_balance += existing_transaction.amount;

                        acc.balance -= new_values.amount;
                        wallet_db.total_balance -= new_values.amount;
                    }

                    let updated_content = serde_json::to_string_pretty(&wallet_db)
                        .map_err(|e| format!("Failed to serialize wallet: {}", e))?;

                    atomic_write(&file_path, &updated_content)
                        .map_err(|e| format!("Failed to write wallet file: {}", e))?;
                }
            }
        }

        // Previous amount is discounted to recalculate totals with new information.
        if existing_transaction.is_income() {
            transaction_db.total_income -= existing_transaction.amount;
        } else {
            transaction_db.total_expenses -= existing_transaction.amount;
        }

        let now = chrono::Utc::now().timestamp_millis() as u64;

        existing_transaction.amount = new_values.amount;
        existing_transaction.date = new_values.date;
        existing_transaction.updated_at = now;
        existing_transaction.details = new_values.details;
        existing_transaction.store_name = new_values.store_name;
        existing_transaction.items = new_values.items;
        existing_transaction.job = new_values.job;
        existing_transaction.employer = new_values.employer;
        existing_transaction.extra_details = new_values.extra_details;
        existing_transaction.client = new_values.client;
        existing_transaction.project = new_values.project;

        if existing_transaction.is_income() {
            transaction_db.total_income += existing_transaction.amount;
        } else {
            transaction_db.total_expenses += existing_transaction.amount;
        }

        // Recalculate net balance
        transaction_db.net_balance = transaction_db.total_income - transaction_db.total_expenses;
        let result = existing_transaction.clone();
        let updated_content = serde_json::to_string_pretty(&transaction_db)
            .map_err(|e| format!("Failed to serialize transactions: {}", e))?;

        atomic_write(&file_path, &updated_content)
            .map_err(|e| format!("Failed to write transactions file: {}", e))?;

        Ok(result)
    } else {
        Err("Transaction not found".to_string())
    }
}

#[tauri::command]
pub async fn get_transactions_by_account_id(
    id: String,
    app: tauri::AppHandle,
) -> Result<Vec<Transaction>, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("transactions.json");

    if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read transaction file: {}", e))?;

        let transaction_db: TransactionDB = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse transaction file: {}", e))?;

        let transactions = transaction_db
            .data
            .values()
            .filter(|tx| tx.account_id == id)
            .cloned()
            .collect();

        Ok(transactions)
    } else {
        Ok(Vec::new())
    }
}

#[tauri::command]
pub async fn get_transactions_by_category(
    category: String,
    app: tauri::AppHandle,
) -> Result<Vec<Transaction>, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir");

    let file_path = file_path.join("transactions.json");

    if file_path.exists() {
        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read transaction file: {}", e))?;

        let transaction_db: TransactionDB = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse transaction file: {}", e))?;

        let transactions = transaction_db
            .data
            .values()
            .filter(|tx| tx.category == category)
            .cloned()
            .collect();

        Ok(transactions)
    } else {
        Ok(Vec::new())
    }
}