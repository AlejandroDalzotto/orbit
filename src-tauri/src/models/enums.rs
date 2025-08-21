use serde::{Deserialize, Serialize};

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
