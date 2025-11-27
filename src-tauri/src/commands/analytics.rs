use chrono::TimeZone;
use std::collections::HashMap;

use crate::{
    models::transaction::{
        AnalyticsData, CategoryAggregate, ExpenseInsights, IncomeSourceAggregate, MonthlyAmount,
        MostPurchasedItem, TransactionDB,
    },
    traits::database::DatabaseOperations,
};

#[tauri::command]
pub async fn get_analytics(app: tauri::AppHandle) -> Result<AnalyticsData, String> {
    let db = TransactionDB::read(&app)?;

    let mut monthly_income: HashMap<String, f64> = HashMap::new();
    let mut monthly_expenses: HashMap<String, f64> = HashMap::new();
    let mut category_agg: HashMap<String, (usize, f64)> = HashMap::new();
    let mut income_sources: HashMap<String, (f64, usize)> = HashMap::new();
    let mut purchased_items: HashMap<String, (String, usize, f64, f64)> = HashMap::new();
    let mut highest_single_expense: f64 = 0.0;

    // Process each transaction
    for tx in db.data.values() {
        let month_key = get_month_key(tx.date);

        if tx.is_income() {
            process_income_transaction(tx, &month_key, &mut monthly_income, &mut income_sources);
        } else {
            process_expense_transaction(
                tx,
                &month_key,
                &mut monthly_expenses,
                &mut category_agg,
                &mut purchased_items,
                &mut highest_single_expense,
            );
        }
    }

    // Build results
    let months = get_sorted_months(&monthly_income, &monthly_expenses);

    Ok(AnalyticsData {
        monthly_income: build_monthly_series(&months, &monthly_income),
        monthly_expenses: build_monthly_series(&months, &monthly_expenses),
        monthly_expense_trend: build_monthly_series(&months, &monthly_expenses),
        most_used_categories: build_category_aggregates(category_agg),
        expense_insights: build_expense_insights(&monthly_expenses, highest_single_expense),
        income_sources: build_income_sources(income_sources),
        most_purchased_items: build_purchased_items(purchased_items),
    })
}

// Helper functions for analytics

fn get_month_key(date_millis: u64) -> String {
    let dt = match chrono::Utc.timestamp_opt(
        (date_millis / 1000) as i64,
        ((date_millis % 1000) * 1_000_000) as u32,
    ) {
        chrono::LocalResult::Single(dt) => dt,
        _ => chrono::Utc.timestamp_opt(0, 0).single().unwrap(),
    };
    dt.format("%Y-%m").to_string()
}

fn process_income_transaction(
    tx: &crate::models::transaction::Transaction,
    month_key: &str,
    monthly_income: &mut HashMap<String, f64>,
    income_sources: &mut HashMap<String, (f64, usize)>,
) {
    *monthly_income.entry(month_key.to_string()).or_insert(0.0) += tx.amount;

    let source_label = tx
        .employer
        .as_ref()
        .or(tx.client.as_ref())
        .or(tx.job.as_ref())
        .or(tx.project.as_ref())
        .map(|s| s.clone())
        .unwrap_or_else(|| tx.details.clone());

    let entry = income_sources.entry(source_label).or_insert((0.0, 0));
    entry.0 += tx.amount;
    entry.1 += 1;
}

fn process_expense_transaction(
    tx: &crate::models::transaction::Transaction,
    month_key: &str,
    monthly_expenses: &mut HashMap<String, f64>,
    category_agg: &mut HashMap<String, (usize, f64)>,
    purchased_items: &mut HashMap<String, (String, usize, f64, f64)>,
    highest_single_expense: &mut f64,
) {
    *monthly_expenses.entry(month_key.to_string()).or_insert(0.0) += tx.amount;

    let entry = category_agg.entry(tx.category.clone()).or_insert((0, 0.0));
    entry.0 += 1;
    entry.1 += tx.amount;

    if tx.amount > *highest_single_expense {
        *highest_single_expense = tx.amount;
    }

    // Procesar items de supermercado
    if tx.category == "supermarket" {
        if let Some(items) = &tx.items {
            for item_ref in items {
                let key = item_ref
                    .item_id
                    .as_ref()
                    .map(|id| id.clone())
                    .unwrap_or_else(|| item_ref.name.clone());

                let quantity = item_ref.quantity.map(|q| q as f64).unwrap_or(1.0);
                let price = item_ref.price.unwrap_or(0.0);
                let spent = quantity * price;

                let entry =
                    purchased_items
                        .entry(key)
                        .or_insert((item_ref.name.clone(), 0, 0.0, 0.0));
                entry.1 += 1;
                entry.2 += quantity;
                entry.3 += spent;
            }
        }
    }
}

fn get_sorted_months(
    monthly_income: &HashMap<String, f64>,
    monthly_expenses: &HashMap<String, f64>,
) -> Vec<String> {
    let mut months: Vec<String> = monthly_income
        .keys()
        .chain(monthly_expenses.keys())
        .cloned()
        .collect();
    months.sort();
    months.dedup();
    months
}

fn build_monthly_series(months: &[String], data: &HashMap<String, f64>) -> Vec<MonthlyAmount> {
    months
        .iter()
        .map(|m| MonthlyAmount {
            month: m.clone(),
            total: *data.get(m).unwrap_or(&0.0),
        })
        .collect()
}
fn build_category_aggregates(
    category_agg: HashMap<String, (usize, f64)>,
) -> Vec<CategoryAggregate> {
    let mut result: Vec<CategoryAggregate> = category_agg
        .into_iter()
        .map(|(category, (count, total))| CategoryAggregate {
            category,
            transactions_count: count,
            total_amount: total,
        })
        .collect();
    result.sort_by(|a, b| b.transactions_count.cmp(&a.transactions_count));
    result
}
fn build_expense_insights(
    monthly_expenses: &HashMap<String, f64>,
    highest_single_expense: f64,
) -> ExpenseInsights {
    let total_expenses: f64 = monthly_expenses.values().sum();
    let months_count = monthly_expenses.len().max(1) as f64;
    ExpenseInsights {
        average_monthly_expenses: total_expenses / months_count,
        highest_single_expense,
    }
}
fn build_income_sources(
    income_sources: HashMap<String, (f64, usize)>,
) -> Vec<IncomeSourceAggregate> {
    let mut result: Vec<IncomeSourceAggregate> = income_sources
        .into_iter()
        .map(|(source, (total, count))| IncomeSourceAggregate {
            source,
            total_amount: total,
            transactions_count: count,
        })
        .collect();
    result.sort_by(|a, b| {
        b.total_amount
            .partial_cmp(&a.total_amount)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    result
}
fn build_purchased_items(
    purchased_items: HashMap<String, (String, usize, f64, f64)>,
) -> Vec<MostPurchasedItem> {
    let mut result: Vec<MostPurchasedItem> = purchased_items
        .into_iter()
        .map(|(_, (name, count, quantity, spent))| MostPurchasedItem {
            item_id: None,
            name,
            total_quantity: quantity,
            transactions_count: count,
            total_spent: spent,
        })
        .collect();
    result.sort_by(|a, b| {
        b.transactions_count.cmp(&a.transactions_count).then(
            b.total_quantity
                .partial_cmp(&a.total_quantity)
                .unwrap_or(std::cmp::Ordering::Equal),
        )
    });

    result
}
