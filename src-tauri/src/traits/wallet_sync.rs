// src/traits/wallet_sync.rs
use crate::models::{transaction::Transaction, wallet::WalletDB};

/// Trait para transacciones que afectan el balance del wallet
pub trait WalletSyncable {
    /// Aplica los cambios de la transacción al wallet
    fn apply_to_wallet(&self, wallet: &mut WalletDB) -> Result<(), String>;

    /// Revierte los cambios de la transacción del wallet
    fn revert_from_wallet(&self, wallet: &mut WalletDB) -> Result<(), String>;
}

impl WalletSyncable for Transaction {
    fn apply_to_wallet(&self, wallet: &mut WalletDB) -> Result<(), String> {
        if !self.affects_balance {
            return Ok(());
        }

        let account = wallet
            .accounts
            .get_mut(&self.account_id)
            .ok_or_else(|| "Account not found in wallet".to_string())?;

        // Validar fondos para gastos
        if !self.is_income() && self.amount > account.balance {
            return Err(format!(
                "The transaction's amount exceeds the current balance of the wallet {}.",
                account.name
            ));
        }

        // Aplicar cambios
        if self.is_income() {
            account.balance += self.amount;
            wallet.total_balance += self.amount;
        } else {
            account.balance -= self.amount;
            wallet.total_balance -= self.amount;
        }

        account.transactions_count += 1;
        account.transactions_id.push(self.id.clone());

        Ok(())
    }

    fn revert_from_wallet(&self, wallet: &mut WalletDB) -> Result<(), String> {
        if !self.affects_balance {
            return Ok(());
        }

        let account = wallet
            .accounts
            .get_mut(&self.account_id)
            .ok_or_else(|| "Account not found in wallet".to_string())?;

        // Revertir cambios
        if self.is_income() {
            account.balance -= self.amount;
            wallet.total_balance -= self.amount;
        } else {
            account.balance += self.amount;
            wallet.total_balance += self.amount;
        }

        if account.transactions_count > 0 {
            account.transactions_count -= 1;
        }

        account.transactions_id.retain(|id| id != &self.id);

        Ok(())
    }
}

/// Helper para actualizar wallet cuando se edita una transacción
pub fn update_wallet_on_edit(
    old_transaction: &Transaction,
    new_amount: f64,
    wallet: &mut WalletDB,
) -> Result<(), String> {
    if !old_transaction.affects_balance {
        return Ok(());
    }

    let account = wallet
        .accounts
        .get_mut(&old_transaction.account_id)
        .ok_or_else(|| "Account not found in wallet".to_string())?;

    // Revertir monto anterior
    if old_transaction.is_income() {
        account.balance -= old_transaction.amount;
        wallet.total_balance -= old_transaction.amount;
    } else {
        account.balance += old_transaction.amount;
        wallet.total_balance += old_transaction.amount;
    }

    // Aplicar nuevo monto
    if old_transaction.is_income() {
        account.balance += new_amount;
        wallet.total_balance += new_amount;
    } else {
        account.balance -= new_amount;
        wallet.total_balance -= new_amount;
    }

    Ok(())
}
