use crate::{
    models::{
        enums::{SortOption, TransactionType},
        index::PaginationResult,
        items::ItemsDB,
        transaction::{
            FinancialSummary, RequestCreateTransaction, RequestEditTransaction, Transaction,
            TransactionDB,
        },
        wallet::WalletDB,
    },
    traits::{
        transaction_items::TransactionItems,
        wallet_sync::{update_wallet_on_edit, WalletSyncable},
    },
};

use crate::traits::database::DatabaseOperations;

#[tauri::command]
pub async fn get_financial_summary(app: tauri::AppHandle) -> Result<FinancialSummary, String> {
    let db = TransactionDB::read(&app)?;
    Ok(db.get_financial_summary())
}

#[tauri::command]
pub async fn get_transaction_by_id(
    id: String,
    app: tauri::AppHandle,
) -> Result<Transaction, String> {
    let db = TransactionDB::read(&app)?;

    db.data
        .get(&id)
        .cloned()
        .ok_or_else(|| "Transaction not found".to_string())
}

#[tauri::command]
pub async fn add_transaction(
    entry: RequestCreateTransaction,
    app: tauri::AppHandle,
) -> Result<Transaction, String> {
    let mut tx_db = TransactionDB::read(&app)?;
    let affects_balance = entry.affects_balance;

    // Crear la transacción
    let new_transaction = tx_db.add_transaction(entry);

    // Sincronizar items (si es una transacción de shopping)
    let mut items_db = ItemsDB::read(&app)?;
    new_transaction.sync_items_to_db(&mut items_db)?;
    items_db.write(&app)?;

    // Si afecta el balance, sincronizar con wallet
    if affects_balance {
        let mut wallet_db = WalletDB::read(&app)?;
        new_transaction.apply_to_wallet(&mut wallet_db)?;
        wallet_db.write(&app)?;
    }

    // Escribir transactions
    tx_db.write(&app)?;

    Ok(new_transaction)
}

#[tauri::command]
pub async fn delete_transaction(id: String, app: tauri::AppHandle) -> Result<Transaction, String> {
    let mut tx_db = TransactionDB::read(&app)?;

    // Remover la transacción (actualiza totales automáticamente)
    let removed_transaction = tx_db.remove_transaction(&id)?;

    // Si afecta el balance, sincronizar con wallet
    if removed_transaction.affects_balance {
        let mut wallet_db = WalletDB::read(&app)?;

        // Revertir cambios del wallet
        removed_transaction.revert_from_wallet(&mut wallet_db)?;

        // Escribir wallet primero
        wallet_db.write(&app)?;
    }

    // Escribir transactions
    tx_db.write(&app)?;

    Ok(removed_transaction)
}

#[tauri::command]
pub async fn edit_transaction(
    id: String,
    new_values: RequestEditTransaction,
    app: tauri::AppHandle,
) -> Result<Transaction, String> {
    let mut tx_db = TransactionDB::read(&app)?;

    // Obtener la transacción original para comparar
    let original = tx_db
        .data
        .get(&id)
        .cloned()
        .ok_or_else(|| "Transaction not found".to_string())?;

    // Si afecta el balance, actualizar wallet
    if original.affects_balance {
        let mut wallet_db = WalletDB::read(&app)?;

        // Actualizar balance del wallet
        update_wallet_on_edit(&original, new_values.amount, &mut wallet_db)?;

        // Escribir wallet primero
        wallet_db.write(&app)?;
    }

    // Editar la transacción (actualiza totales automáticamente)
    let updated_transaction = tx_db.edit_transaction(&id, new_values)?;

    // Escribir transactions
    tx_db.write(&app)?;

    Ok(updated_transaction)
}
// Continuación de src/commands/transaction.rs

#[tauri::command]
pub async fn search_transactions(
    app: tauri::AppHandle,
    query: String,
    limit: usize,
    offset: usize,
    sort_by: SortOption,
) -> Result<PaginationResult<Transaction>, String> {
    let db = TransactionDB::read(&app)?;

    // Buscar transacciones
    let mut transactions = db.search_transactions(&query);

    // Aplicar sorting
    apply_sort(&mut transactions, sort_by);

    // Paginar
    Ok(PaginationResult::from(transactions, limit, offset))
}

#[tauri::command]
pub async fn get_transactions_by_account_id(
    id: String,
    limit: usize,
    offset: usize,
    app: tauri::AppHandle,
) -> Result<PaginationResult<Transaction>, String> {
    let db = TransactionDB::read(&app)?;

    let mut transactions = db.get_by_account(&id);

    // Ordenar por fecha más reciente
    transactions.sort_by(|a, b| b.date.cmp(&a.date));

    Ok(PaginationResult::from(transactions, limit, offset))
}

#[tauri::command]
pub async fn get_transactions_by_category(
    category: String,
    limit: usize,
    offset: usize,
    app: tauri::AppHandle,
) -> Result<PaginationResult<Transaction>, String> {
    let db = TransactionDB::read(&app)?;

    let mut transactions = db.get_by_category(&category);

    // Ordenar por fecha más reciente
    transactions.sort_by(|a, b| b.date.cmp(&a.date));

    Ok(PaginationResult::from(transactions, limit, offset))
}

/// Helper for applying sorting to transactions
fn apply_sort(transactions: &mut Vec<Transaction>, sort_by: SortOption) {
    match sort_by {
        SortOption::Latest => {
            transactions.sort_by(|a, b| b.date.cmp(&a.date));
        }
        SortOption::Oldest => {
            transactions.sort_by(|a, b| a.date.cmp(&b.date));
        }
        SortOption::MostExpensive => {
            transactions.sort_by(|a, b| {
                b.amount
                    .partial_cmp(&a.amount)
                    .unwrap_or(std::cmp::Ordering::Equal)
            });
        }
        SortOption::Cheapest => {
            transactions.sort_by(|a, b| {
                a.amount
                    .partial_cmp(&b.amount)
                    .unwrap_or(std::cmp::Ordering::Equal)
            });
        }
        SortOption::Income => {
            transactions.retain(|t| t.is_income());
            transactions.sort_by(|a, b| {
                b.amount
                    .partial_cmp(&a.amount)
                    .unwrap_or(std::cmp::Ordering::Equal)
            });
        }
        SortOption::Expenses => {
            transactions.retain(|t| !t.is_income());
            transactions.sort_by(|a, b| {
                a.amount
                    .partial_cmp(&b.amount)
                    .unwrap_or(std::cmp::Ordering::Equal)
            });
        }
        SortOption::Transfers => {
            transactions.retain(|t| t.r#type == TransactionType::Transfer);
            transactions.sort_by(|a, b| {
                a.amount
                    .partial_cmp(&b.amount)
                    .unwrap_or(std::cmp::Ordering::Equal)
            });
        }
    }
}
