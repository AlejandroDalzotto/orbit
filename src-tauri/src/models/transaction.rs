use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::enums::{SchemaVersion, TransactionType};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Item {
    name: String,
    quantity: Option<u32>,
    price: Option<f64>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Transaction {
    pub id: String,
    pub amount: f64,
    pub date: u64,
    pub created_at: u64,
    pub updated_at: u64,
    pub details: String,
    pub r#type: TransactionType,
    pub affects_balance: bool,
    pub account_id: String,
    pub category: String, // "basic", "supermarket", "salary", "freelance", etc.

    // Optional fields for different transaction types
    #[serde(skip_serializing_if = "Option::is_none")]
    pub store_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub items: Option<Vec<Item>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub job: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub employer: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub extra_details: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub client: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub project: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestCreateTransaction {
    pub amount: f64,
    pub date: u64,
    pub details: String,
    pub r#type: TransactionType,
    pub affects_balance: bool,
    pub account_id: String,
    pub category: String,

    // Optional fields
    pub store_name: Option<String>,
    pub items: Option<Vec<Item>>,
    pub job: Option<String>,
    pub employer: Option<String>,
    pub extra_details: Option<String>,
    pub client: Option<String>,
    pub project: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestEditTransaction {
    pub amount: f64,
    pub date: u64,
    pub details: String,

    // Optional fields
    pub store_name: Option<String>,
    pub items: Option<Vec<Item>>,

    pub job: Option<String>,
    pub employer: Option<String>,
    pub extra_details: Option<String>,

    pub client: Option<String>,
    pub project: Option<String>,
}

impl Transaction {
    pub fn new_from_request(request: RequestCreateTransaction) -> Self {
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now().timestamp_millis() as u64;

        Transaction {
            id,
            amount: request.amount,
            date: request.date,
            created_at: now,
            updated_at: now,
            details: request.details,
            r#type: request.r#type,
            affects_balance: request.affects_balance,
            account_id: request.account_id,
            category: request.category,
            store_name: request.store_name,
            items: request.items,
            job: request.job,
            employer: request.employer,
            extra_details: request.extra_details,
            client: request.client,
            project: request.project,
        }
    }

    pub fn get_type(&self) -> String {
        match self.r#type {
            TransactionType::Income => String::from("income"),
            TransactionType::Expense => String::from("expense"),
        }
    }

    pub fn is_income(&self) -> bool {
        self.r#type == TransactionType::Income
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FinancialSummary {
    pub net_balance: f64,
    pub total_income: f64,
    pub total_expenses: f64,
    pub transactions_count: usize,
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

impl TransactionDB {
    pub fn new() -> Self {
        TransactionDB {
            data: HashMap::new(),
            net_balance: 0.0,
            total_income: 0.0,
            total_expenses: 0.0,
            schema_version: SchemaVersion::V1,
        }
    }
}
