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
#[serde(rename_all = "UPPERCASE")]
pub enum Currency {
    USD,
    ARS,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum TransactionType {
    Income,
    Expense,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "category", rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum Transaction {
    Basic {
        id: String,
        amount: f64,
        currency: Currency,
        date: u64,
        created_at: u64,
        updated_at: u64,
        details: String,
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
        details: String,
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
        details: String,
        r#type: TransactionType,
        affects_balance: bool,
        // todo: Create DTOs to avoid using String ids directly and provide useful information.
        account_id: String,
        job: String,
        employer: Option<String>,
        extra_details: Option<String>,
    },
    Freelance {
        id: String,
        created_at: u64,
        updated_at: u64,
        amount: f64,
        currency: Currency,
        date: u64,
        details: String,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
        client: Option<String>,
        project: Option<String>,
    },
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "category", rename_all = "camelCase", rename_all_fields = "camelCase")]
pub enum NewTransaction {
    Basic {
        amount: f64,
        currency: Currency,
        date: u64,
        details: String,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
    },
    Salary {
        amount: f64,
        currency: Currency,
        date: u64,
        details: String,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
        job: String,
        employer: Option<String>,
        extra_details: Option<String>,
    },
    Supermarket {
        amount: f64,
        currency: Currency,
        date: u64,
        details: String,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
        store_name: String,
        items: Vec<Item>,
    },
    Freelance {
        amount: f64,
        currency: Currency,
        date: u64,
        details: String,
        r#type: TransactionType,
        affects_balance: bool,
        account_id: String,
        client: Option<String>,
        project: Option<String>,
    },
}

impl Transaction {
    pub fn is_income(&self) -> bool {
        let result = match &self {
            Transaction::Basic { r#type, .. }
            | Transaction::Supermarket { r#type, .. }
            | Transaction::Freelance { r#type, .. }
            | Transaction::Salary { r#type, .. } => r#type == &TransactionType::Income,
        };
        result
    }

    pub fn get_details(&self) -> String {
        match self {
            Transaction::Basic { details, .. }
            | Transaction::Supermarket { details, .. }
            | Transaction::Freelance { details, .. }
            | Transaction::Salary { details, .. } => details.clone(),
        }
    }

    pub fn get_category(&self) -> String {
        match self {
            Transaction::Basic { .. } => String::from("basic"),
            Transaction::Supermarket { .. } => String::from("supermarket"),
            Transaction::Freelance { .. } => String::from("freelance"),
            Transaction::Salary { .. }=> String::from("salary"),
        }
    }

    pub fn get_amount(&self) -> f64 {
        match self {
            Transaction::Basic { amount, .. }
            | Transaction::Supermarket { amount, .. }
            | Transaction::Freelance { amount, .. }
            | Transaction::Salary { amount, .. } => *amount,
        }
    }

    pub fn get_id(&self) -> String {
        match self {
            Transaction::Basic { id, .. }
            | Transaction::Supermarket { id, .. }
            | Transaction::Freelance { id, .. }
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
                employer,
                extra_details,
            },
            NewTransaction::Freelance {
                amount,
                currency,
                date,
                details,
                r#type,
                affects_balance,
                account_id,
                client,
                project,
            } => Transaction::Freelance {
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
                client,
                project,
            },
        }
    }
}
