use crate::models::enums::{SchemaVersion, TransactionType};
use crate::traits::database::{DatabaseOperations, Identifiable, Persistable, Timestamped};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TransactionItemRef {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub item_id: Option<String>,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub quantity: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub price: Option<f64>,
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
    pub category: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub store_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub items: Option<Vec<TransactionItemRef>>,
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

impl Identifiable for Transaction {
    fn id(&self) -> &str {
        &self.id
    }

    fn set_id(&mut self, id: String) {
        self.id = id;
    }
}

impl Timestamped for Transaction {
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

impl Transaction {
    pub fn get_type(&self) -> String {
        match self.r#type {
            TransactionType::Income => String::from("income"),
            TransactionType::Expense => String::from("expense"),
            TransactionType::Transfer => String::from("transfer"),
        }
    }

    pub fn is_income(&self) -> bool {
        self.r#type == TransactionType::Income
    }
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
    pub store_name: Option<String>,
    pub items: Option<Vec<TransactionItemRef>>,
    pub job: Option<String>,
    pub employer: Option<String>,
    pub extra_details: Option<String>,
    pub client: Option<String>,
    pub project: Option<String>,
}

impl RequestCreateTransaction {
    pub fn into_transaction(self) -> Transaction {
        let now = chrono::Utc::now().timestamp_millis() as u64;
        let mut transaction = Transaction {
            id: String::new(),
            amount: self.amount,
            date: self.date,
            created_at: now,
            updated_at: now,
            details: self.details,
            r#type: self.r#type,
            affects_balance: self.affects_balance,
            account_id: self.account_id,
            category: self.category,
            store_name: self.store_name,
            items: self.items,
            job: self.job,
            employer: self.employer,
            extra_details: self.extra_details,
            client: self.client,
            project: self.project,
        };
        transaction.generate_id();
        transaction
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestEditTransaction {
    pub amount: f64,
    pub date: u64,
    pub details: String,
    pub store_name: Option<String>,
    pub items: Option<Vec<TransactionItemRef>>,
    pub job: Option<String>,
    pub employer: Option<String>,
    pub extra_details: Option<String>,
    pub client: Option<String>,
    pub project: Option<String>,
}

impl RequestEditTransaction {
    pub fn apply_to(&self, transaction: &mut Transaction) {
        transaction.amount = self.amount;
        transaction.date = self.date;
        transaction.details = self.details.clone();
        transaction.store_name = self.store_name.clone();
        transaction.items = self.items.clone();
        transaction.job = self.job.clone();
        transaction.employer = self.employer.clone();
        transaction.extra_details = self.extra_details.clone();
        transaction.client = self.client.clone();
        transaction.project = self.project.clone();
        transaction.update_timestamp();
    }
}

// Analytics structures
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MonthlyAmount {
    pub month: String,
    pub total: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CategoryAggregate {
    pub category: String,
    pub transactions_count: usize,
    pub total_amount: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ExpenseInsights {
    pub average_monthly_expenses: f64,
    pub highest_single_expense: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct IncomeSourceAggregate {
    pub source: String,
    pub total_amount: f64,
    pub transactions_count: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MostPurchasedItem {
    pub item_id: Option<String>,
    pub name: String,
    pub total_quantity: f64,
    pub transactions_count: usize,
    pub total_spent: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AnalyticsData {
    pub monthly_income: Vec<MonthlyAmount>,
    pub monthly_expenses: Vec<MonthlyAmount>,
    pub monthly_expense_trend: Vec<MonthlyAmount>,
    pub most_used_categories: Vec<CategoryAggregate>,
    pub expense_insights: ExpenseInsights,
    pub income_sources: Vec<IncomeSourceAggregate>,
    pub most_purchased_items: Vec<MostPurchasedItem>,
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

impl Persistable for TransactionDB {
    fn filename() -> &'static str {
        "transactions.json"
    }

    fn empty() -> Self {
        Self {
            data: HashMap::new(),
            net_balance: 0.0,
            total_income: 0.0,
            total_expenses: 0.0,
            schema_version: SchemaVersion::V1,
        }
    }
}

impl DatabaseOperations for TransactionDB {}

impl TransactionDB {
    pub fn new() -> Self {
        Self::empty()
    }

    /// Añade una transacción y actualiza los totales
    pub fn add_transaction(&mut self, request: RequestCreateTransaction) -> Transaction {
        let transaction = request.into_transaction();

        // Actualizar totales
        if transaction.is_income() {
            self.total_income += transaction.amount;
        } else {
            self.total_expenses += transaction.amount;
        }

        self.net_balance = self.total_income - self.total_expenses;

        self.data
            .insert(transaction.id.clone(), transaction.clone());
        transaction
    }

    /// Elimina una transacción y actualiza los totales
    pub fn remove_transaction(&mut self, id: &str) -> Result<Transaction, String> {
        self.data
            .remove(id)
            .map(|transaction| {
                // Actualizar totales
                if transaction.is_income() {
                    self.total_income -= transaction.amount;
                } else {
                    self.total_expenses -= transaction.amount;
                }

                self.net_balance = self.total_income - self.total_expenses;
                transaction
            })
            .ok_or_else(|| "Transaction not found".to_string())
    }

    /// Edita una transacción y actualiza los totales
    pub fn edit_transaction(
        &mut self,
        id: &str,
        edit: RequestEditTransaction,
    ) -> Result<Transaction, String> {
        let transaction = self
            .data
            .get_mut(id)
            .ok_or_else(|| "Transaction not found".to_string())?;

        // Revertir el monto anterior de los totales
        if transaction.is_income() {
            self.total_income -= transaction.amount;
        } else {
            self.total_expenses -= transaction.amount;
        }

        // Aplicar cambios
        edit.apply_to(transaction);

        // Aplicar el nuevo monto a los totales
        if transaction.is_income() {
            self.total_income += transaction.amount;
        } else {
            self.total_expenses += transaction.amount;
        }

        // Recalcular balance neto
        self.net_balance = self.total_income - self.total_expenses;

        Ok(transaction.clone())
    }

    /// Obtiene el resumen financiero
    pub fn get_financial_summary(&self) -> FinancialSummary {
        FinancialSummary {
            net_balance: self.net_balance,
            total_income: self.total_income,
            total_expenses: self.total_expenses,
            transactions_count: self.data.len(),
        }
    }

    /// Obtiene todas las transacciones como vector
    pub fn get_all_transactions(&self) -> Vec<Transaction> {
        self.data.values().cloned().collect()
    }

    /// Busca transacciones por query
    pub fn search_transactions(&self, query: &str) -> Vec<Transaction> {
        let query_lower = query.to_lowercase();

        if query_lower.is_empty() {
            return self.get_all_transactions();
        }

        self.data
            .values()
            .filter(|tx| {
                tx.details.to_lowercase().contains(&query_lower)
                    || tx.category.to_lowercase().contains(&query_lower)
                    || match tx.get_type().as_str() {
                        "salary" => {
                            tx.job
                                .as_ref()
                                .map_or(false, |j| j.to_lowercase().contains(&query_lower))
                                || tx
                                    .employer
                                    .as_ref()
                                    .map_or(false, |e| e.to_lowercase().contains(&query_lower))
                        }
                        "freelance" => {
                            tx.client
                                .as_ref()
                                .map_or(false, |c| c.to_lowercase().contains(&query_lower))
                                || tx
                                    .project
                                    .as_ref()
                                    .map_or(false, |p| p.to_lowercase().contains(&query_lower))
                        }
                        _ => false,
                    }
            })
            .cloned()
            .collect()
    }

    /// Filtra transacciones por account_id
    pub fn get_by_account(&self, account_id: &str) -> Vec<Transaction> {
        self.data
            .values()
            .filter(|tx| tx.account_id == account_id)
            .cloned()
            .collect()
    }

    /// Filtra transacciones por categoría
    pub fn get_by_category(&self, category: &str) -> Vec<Transaction> {
        self.data
            .values()
            .filter(|tx| tx.category == category)
            .cloned()
            .collect()
    }
}
