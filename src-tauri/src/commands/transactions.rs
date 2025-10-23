use crate::{
    models::{
        index::PaginationResult,
        transaction::{
            FinancialSummary, RequestCreateTransaction, RequestEditTransaction, Transaction,
            TransactionDB,
        },
        wallet::WalletDB,
    },
    utils::atomic_write,
};
use tauri::Manager;

fn load_db(app: &tauri::AppHandle) -> Result<TransactionDB, String> {
    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir")
        .join("transactions.json");

    // If file doesn't exist, return a new TransactionDB
    if !file_path.exists() {
        return Ok(TransactionDB::new());
    }

    // Read file content
    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read transactions file: {}", e))?;

    // Parse JSON into TransactionDB
    let transaction_db: TransactionDB = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse transactions file: {}", e))?;

    Ok(transaction_db)
}

#[tauri::command]
pub async fn get_transactions(
    app: tauri::AppHandle,
    limit: usize,
    offset: usize,
) -> Result<PaginationResult<Transaction>, String> {
    // Load all transactions
    let db = load_db(&app)?;

    let transactions: Vec<Transaction> = db.data.into_values().collect();

    let paginated_results = PaginationResult::from(transactions, limit, offset);

    Ok(paginated_results)
}

#[tauri::command]
pub async fn get_financial_summary(app: tauri::AppHandle) -> Result<FinancialSummary, String> {
    let db = load_db(&app)?;

    let summary = FinancialSummary {
        net_balance: db.net_balance,
        total_income: db.total_income,
        total_expenses: db.total_expenses,
        transactions_count: db.data.len(),
    };

    Ok(summary)
}

#[tauri::command]
pub async fn get_transaction_by_id(
    id: String,
    app: tauri::AppHandle,
) -> Result<Transaction, String> {
    let db = load_db(&app)?;

    if let Some(transaction) = db.data.get(&id) {
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
    let mut db = load_db(&app)?;

    let new_transaction = Transaction::new_from_request(entry);

    db.data
        .insert(new_transaction.id.clone(), new_transaction.clone());

    if new_transaction.is_income() {
        db.total_income += new_transaction.amount;
    } else {
        db.total_expenses += new_transaction.amount;
    }

    db.net_balance = db.total_income - db.total_expenses;

    if new_transaction.affects_balance {
        let wallet_path = app
            .path()
            .app_local_data_dir()
            .expect("Could not get app data dir")
            .join("wallet.json");

        if wallet_path.exists() {
            // read original wallet and keep backup for rollback
            let original_wallet_content = std::fs::read_to_string(&wallet_path)
                .map_err(|e| format!("Failed to read wallet file: {}", e))?;

            let mut wallet_db: WalletDB = serde_json::from_str(&original_wallet_content)
                .map_err(|e| format!("Failed to parse wallet file: {}", e))?;

            // validate account exists & funds
            let acc = wallet_db
                .accounts
                .get_mut(&new_transaction.account_id)
                .ok_or_else(|| "Account not found in wallet".to_string())?;

            if !new_transaction.is_income() && new_transaction.amount > acc.balance {
                return Err(format!(
                    "The transaction's amount exceeds the current balance of the wallet {}.",
                    acc.name
                ));
            }

            // apply in-memory wallet changes but DON'T write yet
            if new_transaction.is_income() {
                acc.balance += new_transaction.amount;
                wallet_db.total_balance += new_transaction.amount;
            } else {
                acc.balance -= new_transaction.amount;
                wallet_db.total_balance -= new_transaction.amount;
            }
            acc.transactions_count += 1;
            acc.transactions_id.push(new_transaction.id.clone());

            let updated_wallet_content = serde_json::to_string_pretty(&wallet_db)
                .map_err(|e| format!("Failed to serialize wallet: {}", e))?;

            // prepare transactions content and keep backup
            let transactions_path = app
                .path()
                .app_local_data_dir()
                .expect("Could not get app data dir")
                .join("transactions.json");

            let original_tx_content = if transactions_path.exists() {
                std::fs::read_to_string(&transactions_path).ok()
            } else {
                None
            };

            let updated_tx_content = serde_json::to_string_pretty(&db)
                .map_err(|e| format!("Failed to serialize transactions: {}", e))?;

            // Write transactions first, then wallet. If wallet write fails, restore transactions from backup.
            atomic_write(&transactions_path, &updated_tx_content)
                .map_err(|e| format!("Failed to write transactions file: {}", e))?;

            if let Err(e) = atomic_write(&wallet_path, &updated_wallet_content) {
                // attempt rollback of transactions file
                if let Some(orig) = original_tx_content {
                    let _ = atomic_write(&transactions_path, &orig);
                }
                return Err(format!("Failed to write wallet file: {}", e));
            }
        } else {
            return Err("Wallet file not found while transaction affects balance".to_string());
        }
    }

    let updated_content = serde_json::to_string_pretty(&db)
        .map_err(|e| format!("Failed to serialize transactions: {}", e))?;

    let file_path = app
        .path()
        .app_local_data_dir()
        .expect("Could not get app data dir")
        .join("transactions.json");

    atomic_write(&file_path, &updated_content)
        .map_err(|e| format!("Failed to write transactions file: {}", e))?;

    Ok(new_transaction)
}

#[tauri::command]
pub async fn delete_transaction(id: String, app: tauri::AppHandle) -> Result<Transaction, String> {
    let mut db = load_db(&app)?;

    if let Some(removed_transaction) = db.data.remove(&id) {
        if removed_transaction.is_income() {
            db.total_income -= removed_transaction.amount;
        } else {
            db.total_expenses -= removed_transaction.amount;
        }

        db.net_balance = db.total_income - db.total_expenses;

        let updated_content = serde_json::to_string_pretty(&db)
            .map_err(|e| format!("Failed to serialize transactions: {}", e))?;

        let db_path = app
            .path()
            .app_local_data_dir()
            .expect("Could not get app data dir")
            .join("transactions.json");

        atomic_write(&db_path, &updated_content)
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
    limit: usize,
    offset: usize,
) -> Result<PaginationResult<Transaction>, String> {
    let db = load_db(&app)?;

    let query_lower = query.to_lowercase();

    let filtered_transactions: Vec<Transaction> = db.data
        .into_values()
        .filter(|transaction| {
            // Search in details
            transaction.details.to_lowercase().contains(&query_lower) ||
            // Search in category
            transaction.category.to_lowercase().contains(&query_lower) ||
            // Search in specific fields based on transaction type
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
        .collect();

    let paginated_transactions = PaginationResult::from(filtered_transactions, limit, offset);

    Ok(paginated_transactions)
}

#[tauri::command]
pub async fn edit_transaction(
    id: String,
    new_values: RequestEditTransaction,
    app: tauri::AppHandle,
) -> Result<Transaction, String> {
    let mut db = load_db(&app)?;

    if let Some(existing_transaction) = db.data.get_mut(&id) {
        // If the original transaction does affect the balance, then we need to update the wallet's balance.
        if existing_transaction.affects_balance {
            let wallet_path = app
                .path()
                .app_local_data_dir()
                .expect("Could not get app data dir")
                .join("wallet.json");

            if wallet_path.exists() {
                // read original wallet and keep backup for rollback
                let original_wallet_content = std::fs::read_to_string(&wallet_path)
                    .map_err(|e| format!("Failed to read wallet file: {}", e))?;

                let mut wallet_db: WalletDB = serde_json::from_str(&original_wallet_content)
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

                    let updated_wallet_content = serde_json::to_string_pretty(&wallet_db)
                        .map_err(|e| format!("Failed to serialize wallet: {}", e))?;

                    atomic_write(&wallet_path, &updated_wallet_content)
                        .map_err(|e| format!("Failed to write wallet file: {}", e))?;
                }
            }
        }

        // Previous amount is discounted to recalculate totals with new information.
        if existing_transaction.is_income() {
            db.total_income -= existing_transaction.amount;
        } else {
            db.total_expenses -= existing_transaction.amount;
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
            db.total_income += existing_transaction.amount;
        } else {
            db.total_expenses += existing_transaction.amount;
        }

        // Recalculate net balance
        db.net_balance = db.total_income - db.total_expenses;
        let result = existing_transaction.clone();

        let transactions_path = app
            .path()
            .app_local_data_dir()
            .expect("Could not get app data dir")
            .join("transactions.json");

        let updated_content = serde_json::to_string_pretty(&db)
            .map_err(|e| format!("Failed to serialize transactions: {}", e))?;

        atomic_write(&transactions_path, &updated_content)
            .map_err(|e| format!("Failed to write transactions file: {}", e))?;

        Ok(result)
    } else {
        Err("Transaction not found".to_string())
    }
}

#[tauri::command]
pub async fn get_transactions_by_account_id(
    id: String,
    limit: usize,
    offset: usize,
    app: tauri::AppHandle,
) -> Result<PaginationResult<Transaction>, String> {
    let db = load_db(&app)?;

    if db.data.len() > 0 {
        let transactions: Vec<Transaction> = db
            .data
            .into_values()
            .filter(|tx| tx.account_id == id)
            .collect();

        let paginated_results = PaginationResult::from(transactions, limit, offset);

        Ok(paginated_results)
    } else {
        Ok(PaginationResult::new())
    }
}

#[tauri::command]
pub async fn get_transactions_by_category(
    category: String,
    limit: usize,
    offset: usize,
    app: tauri::AppHandle,
) -> Result<PaginationResult<Transaction>, String> {
    let db = load_db(&app)?;

    if db.data.len() > 0 {
        let transactions = db
            .data
            .into_values()
            .filter(|tx| tx.category == category)
            .collect();

        let paginated_results = PaginationResult::from(transactions, limit, offset);

        Ok(paginated_results)
    } else {
        Ok(PaginationResult::new())
    }
}
