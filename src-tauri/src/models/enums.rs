use serde::{Deserialize, Serialize};

use crate::models::transaction::Item;

/// La versión del esquema
#[derive(Serialize, Deserialize, Debug)]
pub enum SchemaVersion {
    V1,
    V2,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum AccountType {
    Cash,
    #[serde(rename = "online wallet")]
    OnlineWallet,
    #[serde(rename = "bank account")]
    BankAccount,
    #[serde(rename = "credit card")]
    CreditCard,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Currency {
    USD,
    ARS,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum TransactionType {
    Income,
    Expense,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "category")]
pub enum Transaction {
    Basic {
        id: String,
        amount: f64,
        currency: Currency,
        date: u64,
        created_at: u64,
        updated_at: u64,
        details: Option<String>,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
    },
    Supermarket {
        id: String,
        amount: f64,
        currency: Currency,
        date: u64,
        created_at: u64,
        updated_at: u64,
        details: Option<String>,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
        store_name: String,
        items: Vec<Item>,
    },
    Salary {
        id: String,
        amount: f64,
        currency: Currency,
        date: u64,
        created_at: u64,
        updated_at: u64,
        details: Option<String>,
        r#type: TransactionType,
        affects_balance: bool,
        // todo: Create DTOs to avoid using String ids directly and provide useful information.
        account_id: String,
        job: String,
        payment_date: u64,
        employer: Option<String>,
        extra_details: Option<String>,
    },
}