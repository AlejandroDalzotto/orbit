// src/models/wallet.rs
use crate::models::enums::{AccountType, Currency, SchemaVersion};
use crate::traits::database::{DatabaseOperations, Identifiable, Persistable, Timestamped};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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

impl Identifiable for Account {
    fn id(&self) -> &str {
        &self.id
    }

    fn set_id(&mut self, id: String) {
        self.id = id;
    }
}

impl Timestamped for Account {
    fn created_at(&self) -> u64 {
        self.created_at
    }

    fn updated_at(&self) -> u64 {
        self.updated_at
    }

    fn set_updated_at(&mut self, timestamp: u64) {
        self.updated_at = timestamp;
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NewAccount {
    pub name: String,
    pub r#type: AccountType,
    pub balance: f64,
    pub currency: Currency,
}

impl NewAccount {
    pub fn into_account(self) -> Account {
        let now = chrono::Utc::now().timestamp_millis() as u64;
        let mut account = Account {
            id: String::new(),
            name: self.name,
            r#type: self.r#type,
            balance: self.balance,
            currency: self.currency,
            created_at: now,
            updated_at: now,
            transactions_count: 0,
            transactions_id: Vec::new(),
        };
        account.generate_id();
        account
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct EditAccount {
    pub name: String,
    pub r#type: AccountType,
    pub balance: f64,
}

impl EditAccount {
    pub fn apply_to(&self, account: &mut Account) {
        account.name = self.name.clone();
        account.r#type = self.r#type.clone();
        account.balance = self.balance;
        account.update_timestamp();
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct WalletDB {
    pub total_balance: f64,
    pub accounts: HashMap<String, Account>,
    pub schema_version: SchemaVersion,
}

impl Persistable for WalletDB {
    fn filename() -> &'static str {
        "wallet.json"
    }

    fn empty() -> Self {
        Self {
            total_balance: 0.0,
            accounts: HashMap::new(),
            schema_version: SchemaVersion::V1,
        }
    }
}

impl DatabaseOperations for WalletDB {}

impl WalletDB {
    /// Añade una cuenta y actualiza el balance total
    pub fn add_account(&mut self, new_account: NewAccount) -> Account {
        let account = new_account.into_account();
        self.total_balance += account.balance;
        self.accounts.insert(account.id.clone(), account.clone());
        account
    }

    /// Elimina una cuenta y actualiza el balance total
    pub fn remove_account(&mut self, id: &str) -> Result<Account, String> {
        self.accounts
            .remove(id)
            .map(|account| {
                self.total_balance -= account.balance;
                account
            })
            .ok_or_else(|| "Account not found".to_string())
    }

    /// Edita una cuenta y actualiza el balance total
    pub fn edit_account(&mut self, id: &str, edit: EditAccount) -> Result<Account, String> {
        let account = self
            .accounts
            .get_mut(id)
            .ok_or_else(|| "Account not found".to_string())?;

        // Actualizar balance total
        self.total_balance -= account.balance;
        self.total_balance += edit.balance;

        // Aplicar cambios
        edit.apply_to(account);

        Ok(account.clone())
    }

    /// Obtiene todas las cuentas como vector
    pub fn get_accounts(&self) -> Vec<Account> {
        self.accounts.values().cloned().collect()
    }

    /// Obtiene el conteo de cuentas
    pub fn accounts_count(&self) -> u32 {
        self.accounts.len() as u32
    }
}
