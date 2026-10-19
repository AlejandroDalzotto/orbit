use rusqlite::Connection;
use serde::Serialize;
use ts_rs::TS;

use crate::{errors::AppError, movements::read_number, AppState};

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct MonthlySummary {
    pub month: String,
    pub currency_code: String,
    #[ts(type = "number")]
    pub total_income: i64,
    #[ts(type = "number")]
    pub total_expenses: i64,
    #[ts(type = "number")]
    pub net: i64,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct CategorySpending {
    pub month: String,
    pub currency_code: String,
    #[ts(type = "number | null")]
    pub category_id: Option<i64>,
    pub category_name: String,
    #[ts(type = "number")]
    pub total_amount: i64,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct AnalyticsNetWorth {
    pub currency_code: String,
    #[ts(type = "number")]
    pub total_balance: i64,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Analytics {
    pub monthly: Vec<MonthlySummary>,
    pub categories: Vec<CategorySpending>,
    pub net_worth: Vec<AnalyticsNetWorth>,
}

fn query_analytics(conn: &Connection) -> Result<Analytics, AppError> {
    let tx = conn.unchecked_transaction()?;

    let monthly = {
        let mut stmt = tx.prepare(
            "SELECT month, currency_code, total_income, total_expenses, net
             FROM v_monthly_summary
             ORDER BY month DESC, currency_code",
        )?;
        let rows = stmt
            .query_map([], |row| {
                Ok(MonthlySummary {
                    month: row.get("month")?,
                    currency_code: row.get("currency_code")?,
                    total_income: read_number(row, "total_income")?,
                    total_expenses: read_number(row, "total_expenses")?,
                    net: read_number(row, "net")?,
                })
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        rows
    };
    let categories = {
        let mut stmt = tx.prepare(
            "SELECT month, currency_code, category_id, category_name, total_amount
             FROM v_category_spending
             ORDER BY month DESC, currency_code, total_amount DESC, category_name, category_id",
        )?;
        let rows = stmt
            .query_map([], |row| {
                Ok(CategorySpending {
                    month: row.get("month")?,
                    currency_code: row.get("currency_code")?,
                    category_id: row
                        .get::<_, Option<i64>>("category_id")?
                        .map(|_| read_number(row, "category_id"))
                        .transpose()?,
                    category_name: row.get("category_name")?,
                    total_amount: read_number(row, "total_amount")?,
                })
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        rows
    };
    let net_worth = {
        let mut stmt = tx.prepare(
            "SELECT currency_code, total_balance FROM v_net_worth ORDER BY currency_code",
        )?;
        let rows = stmt
            .query_map([], |row| {
                Ok(AnalyticsNetWorth {
                    currency_code: row.get("currency_code")?,
                    total_balance: read_number(row, "total_balance")?,
                })
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        rows
    };
    tx.commit()?;
    Ok(Analytics {
        monthly,
        categories,
        net_worth,
    })
}

#[tauri::command]
pub fn get_analytics(state: tauri::State<AppState>) -> Result<Analytics, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    query_analytics(&conn)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn database() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(include_str!("../schema.sql")).unwrap();
        conn.execute_batch(
            "INSERT OR IGNORE INTO currencies (code, name, symbol) VALUES
            ('USD', 'Dollar', '$'), ('EUR', 'Euro', '€');
            INSERT INTO accounts (name, type, currency_code, is_active) VALUES
            ('Cash', 'cash', 'USD', 1), ('Bank', 'checking', 'USD', 1),
            ('Euro', 'cash', 'EUR', 1), ('Inactive', 'cash', 'USD', 0);
            INSERT INTO categories (name, type) VALUES ('Food', 'expense'), ('Salary', 'income');",
        )
        .unwrap();
        conn
    }

    #[test]
    fn analytics_are_read_only_currency_separated_and_exclude_initial_and_transfers() {
        let conn = database();
        conn.execute_batch(
            "INSERT INTO movements
            (account_id, type, amount, currency_code, date, category_id, transfer_group_id) VALUES
            (1, 'initial_balance', 10000, 'USD', '2026-01-01', 1, NULL),
            (3, 'initial_balance', 500, 'EUR', '2026-01-01', NULL, NULL),
            (4, 'initial_balance', 999999, 'USD', '2026-01-01', NULL, NULL),
            (1, 'income', 3000, 'USD', '2026-02-01', 2, NULL),
            (1, 'expense', 750, 'USD', '2026-02-02', 1, NULL),
            (1, 'expense', 250, 'USD', '2026-02-02', NULL, NULL),
            (3, 'expense', 200, 'EUR', '2026-02-02', 1, NULL),
            (1, 'transfer_out', 700, 'USD', '2026-02-03', NULL, 'same'),
            (2, 'transfer_in', 700, 'USD', '2026-02-03', NULL, 'same'),
            (1, 'transfer_out', 1500, 'USD', '2026-02-04', NULL, 'cross'),
            (3, 'transfer_in', 1300, 'EUR', '2026-02-04', NULL, 'cross'),
            (1, 'income', 400, 'USD', '2026-03-01', NULL, NULL);",
        )
        .unwrap();
        let changes = conn.total_changes();
        conn.pragma_update(None, "query_only", true).unwrap();
        let analytics = query_analytics(&conn).unwrap();
        assert_eq!(conn.total_changes(), changes);
        assert_eq!(analytics.monthly.len(), 3);
        assert_eq!(analytics.monthly[0].month, "2026-03");
        assert_eq!(analytics.monthly[0].net, 400);
        let usd = analytics
            .monthly
            .iter()
            .find(|m| m.month == "2026-02" && m.currency_code == "USD")
            .unwrap();
        assert_eq!(
            (usd.total_income, usd.total_expenses, usd.net),
            (3000, 1000, 2000)
        );
        let eur = analytics
            .monthly
            .iter()
            .find(|m| m.currency_code == "EUR")
            .unwrap();
        assert_eq!(
            (eur.total_income, eur.total_expenses, eur.net),
            (0, 200, -200)
        );
        assert_eq!(analytics.categories.len(), 3);
        let food_usd = analytics
            .categories
            .iter()
            .find(|c| c.category_name == "Food" && c.currency_code == "USD")
            .unwrap();
        assert_eq!(food_usd.total_amount, 750);
        assert!(analytics
            .categories
            .iter()
            .any(|c| c.category_name == "Sin categoría" && c.total_amount == 250));
        assert!(!analytics
            .categories
            .iter()
            .any(|c| c.category_name == "Salary"));
        assert_eq!(analytics.net_worth.len(), 2);
        assert_eq!(analytics.net_worth[0].currency_code, "EUR");
        assert_eq!(analytics.net_worth[0].total_balance, 1600);
        assert_eq!(analytics.net_worth[1].currency_code, "USD");
        assert_eq!(analytics.net_worth[1].total_balance, 10900);
        let json = serde_json::to_value(analytics).unwrap();
        assert!(json["netWorth"][0]["totalBalance"].is_number());
        assert!(json["monthly"][0]["totalIncome"].is_number());
    }

    #[test]
    fn category_spending_preserves_distinct_ids_for_duplicate_names_and_null_for_uncategorized() {
        let conn = database();
        conn.execute(
            "INSERT INTO categories (name, type) VALUES ('Travel', 'expense')",
            [],
        )
        .unwrap();
        let parent_id = conn.last_insert_rowid();
        conn.execute(
            "INSERT INTO categories (name, type, parent_id) VALUES ('Food', 'expense', ?1)",
            [parent_id],
        )
        .unwrap();
        let nested_category_id = conn.last_insert_rowid();
        conn.execute(
            "INSERT INTO movements (account_id, type, amount, currency_code, date, category_id)
             VALUES (1, 'expense', 150, 'USD', '2026-02-01', 1),
                    (1, 'expense', 275, 'USD', '2026-02-01', ?1),
                    (1, 'expense', 50, 'USD', '2026-02-01', NULL)",
            [nested_category_id],
        )
        .unwrap();

        let analytics = query_analytics(&conn).unwrap();
        assert_eq!(analytics.categories.len(), 3);
        for (category_id, amount) in [(1, 150), (nested_category_id, 275)] {
            let category = analytics
                .categories
                .iter()
                .find(|category| category.category_id == Some(category_id))
                .unwrap();
            assert_eq!(category.category_name, "Food");
            assert_eq!(category.total_amount, amount);
            assert_eq!(category.month, "2026-02");
            assert_eq!(category.currency_code, "USD");
            assert_eq!(
                serde_json::to_value(category).unwrap()["categoryId"],
                category_id
            );
        }
        let uncategorized = analytics
            .categories
            .iter()
            .find(|category| category.category_id.is_none())
            .unwrap();
        assert_eq!(uncategorized.category_name, "Sin categoría");
        assert_eq!(uncategorized.total_amount, 50);
        assert!(serde_json::to_value(uncategorized).unwrap()["categoryId"].is_null());
        let declaration = CategorySpending::decl(&ts_rs::Config::default());
        assert!(declaration.contains("categoryId: number | null"));
        assert!(!declaration.contains("bigint"));
    }

    #[test]
    fn category_ids_outside_the_javascript_safe_range_are_rejected() {
        let conn = database();
        conn.execute_batch(
            "INSERT INTO categories (id, name, type)
             VALUES (9007199254740992, 'Unsafe ID', 'expense');
             INSERT INTO movements (account_id, type, amount, currency_code, date, category_id)
             VALUES (1, 'expense', 1, 'USD', '2026-02-01', 9007199254740992);",
        )
        .unwrap();
        assert!(query_analytics(&conn).is_err());
    }

    #[test]
    fn empty_ledger_has_no_cash_flow_and_zero_active_account_balances() {
        let conn = database();
        let analytics = query_analytics(&conn).unwrap();
        assert!(analytics.monthly.is_empty());
        assert!(analytics.categories.is_empty());
        assert_eq!(analytics.net_worth.len(), 2);
        assert!(analytics.net_worth.iter().all(|n| n.total_balance == 0));
    }

    #[test]
    fn aggregate_amounts_outside_the_javascript_safe_range_are_rejected() {
        let conn = database();
        conn.execute_batch(
            "INSERT INTO movements (account_id, type, amount, currency_code, date)
            VALUES (1, 'income', 9007199254740991, 'USD', '2026-01-01'),
                   (1, 'income', 1, 'USD', '2026-01-01');",
        )
        .unwrap();
        assert!(query_analytics(&conn).is_err());
    }
}
