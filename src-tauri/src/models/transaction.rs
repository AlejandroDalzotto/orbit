use std::collections::HashMap;

use serde::{Deserialize, Serialize};

use crate::models::enums::{SchemaVersion, Transaction};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Item {
    name: String,
    quantity: Option<u32>,
    price: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FinancialSummary {
    pub net_balance: f64,
    pub total_income: f64,
    pub total_expenses: f64,
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

