use serde::{Deserialize, Serialize};
use uuid::Uuid;

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

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
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

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase", tag = "category")]
pub enum NewTransaction {
    Basic {
        amount: f64,
        currency: Currency,
        date: u64,
        details: Option<String>,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
    },
    Supermarket {
        amount: f64,
        currency: Currency,
        date: u64,
        details: Option<String>,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
        store_name: String,
        items: Vec<Item>,
    },
    Salary {
        amount: f64,
        currency: Currency,
        date: u64,
        details: Option<String>,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
        job: String,
        payment_date: u64,
        employer: Option<String>,
        extra_details: Option<String>,
    },
}

impl Transaction {
    pub fn is_income(&self) -> bool {
        let result = match &self {
            Transaction::Basic { r#type, .. }
            | Transaction::Supermarket { r#type, .. }
            | Transaction::Salary { r#type, .. } => r#type == &TransactionType::Income,
        };
        result
    }

    pub fn get_amount(&self) -> f64 {
        match self {
            Transaction::Basic { amount, .. }
            | Transaction::Supermarket { amount, .. }
            | Transaction::Salary { amount, .. } => *amount,
        }
    }

    pub fn get_id(&self) -> String {
        match self {
            Transaction::Basic { id, .. }
            | Transaction::Supermarket { id, .. }
            | Transaction::Salary { id, .. } => id.clone(),
        }
    }

    pub fn new_from(new_tx: NewTransaction) -> Self {
        let id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now().timestamp_millis() as u64;

        match new_tx {
            NewTransaction::Basic {
                amount,
                currency,
                date,
                details,
                r#type,
                affects_balance,
                account_id,
            } => Transaction::Basic {
                id,
                amount,
                currency,
                date,
                created_at: now,
                updated_at: now,
                details,
                r#type,
                affects_balance,
                account_id,
            },
            NewTransaction::Supermarket {
                amount,
                currency,
                date,
                details,
                r#type,
                affects_balance,
                account_id,
                store_name,
                items,
            } => Transaction::Supermarket {
                id,
                amount,
                currency,
                date,
                created_at: now,
                updated_at: now,
                details,
                r#type,
                affects_balance,
                account_id,
                store_name,
                items,
            },
            NewTransaction::Salary {
                amount,
                currency,
                date,
                details,
                r#type,
                affects_balance,
                account_id,
                job,
                payment_date,
                employer,
                extra_details,
            } => Transaction::Salary {
                id,
                amount,
                currency,
                date,
                created_at: now,
                updated_at: now,
                details,
                r#type,
                affects_balance,
                account_id,
                job,
                payment_date,
                employer,
                extra_details,
            },
        }
    }
}
