use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::models::enums::{AccountType, Currency, SchemaVersion};

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