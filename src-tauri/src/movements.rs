use serde::{Deserialize, Serialize};

/// Represents the type of financial movement
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MovementType {
    Income,
    Expense,
    Transfer,
}

/// Represents the currency of a movement
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum Currency {
    ARS,
    USD,
}

impl Default for Currency {
    fn default() -> Self {
        Currency::ARS
    }
}

/// Represents the exchange rate type used for currency conversion
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RateType {
    Blue,
    Oficial,
    Mep,
    Ccl,
    Cripto,
}

/// Represents a financial movement in the personal finance application.
///
/// A movement can be income, expense, or transfer. Multi-currency support is included,
/// with all amounts stored in cents and automatically converted to ARS at registration time.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Movement {
    pub id: i64,
    /// Brief description of the movement
    pub details: String,
    /// Date of the movement in ISO 8601 format (YYYY-MM-DD)
    pub date: String,
    /// Timestamp when the movement was created (datetime format)
    pub created_at: String,
    /// Type of movement: income, expense, or transfer
    pub mov_type: MovementType,
    /// Currency of the original amount (ARS or USD)
    pub currency: Currency,
    /// Amount in the original currency, stored in cents
    pub original_amount: i64,
    /// Amount converted to ARS at registration time, stored in cents
    /// Used for all reports and analytics
    pub ars_amount: i64,
    /// Exchange rate used for conversion (None if currency is ARS)
    pub exchange_rate: Option<i64>,
    /// Type of exchange rate used ('blue', 'oficial', 'mep', 'ccl', 'cripto')
    pub rate_type: Option<RateType>,
    /// Reference to the account this movement belongs to
    pub account_id: i64,
    /// Reference to the category (optional)
    pub category_id: Option<i64>,
}

impl ToSql for Currency {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        let s: &str = match self {
            Currency::USD => "USD",
            Currency::ARS => "ARS",
        };
        Ok(rusqlite::types::ToSqlOutput::from(s))
    }
}

impl ToSql for MovementType {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        let s: &str = match self {
            MovementType::Income => "income",
            MovementType::Expense => "expense",
            MovementType::Transfer => "transfer",
        };
        Ok(rusqlite::types::ToSqlOutput::from(s))
    }
}

impl ToSql for RateType {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        let s: &str = match self {
            RateType::Blue => "blue",
            RateType::Oficial => "oficial",
            RateType::Mep => "mep",
            RateType::Ccl => "ccl",
            RateType::Cripto => "cripto",
        };
        Ok(rusqlite::types::ToSqlOutput::from(s))
    }
}

#[derive(Debug, Deserialize)]
pub struct AddMovement {
    pub details: String,
    pub date: String,
    pub mov_type: MovementType,
    pub currency: Currency,
    pub original_amount: i64,
    pub ars_amount: i64,
    pub exchange_rate: Option<i64>,
    pub rate_type: Option<RateType>,
    pub account_id: i64,
    pub category_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMovement {
    pub details: String,
    pub date: String,
    pub mov_type: MovementType,
    pub currency: Currency,
    pub original_amount: i64,
    pub ars_amount: i64,
    pub exchange_rate: Option<i64>,
    pub rate_type: Option<RateType>,
    pub category_id: Option<i64>,
}

use rusqlite::{params, ToSql};

#[tauri::command]
pub fn get_movements(state: tauri::State<crate::AppState>) -> Vec<Movement> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT id, details, date, created_at, mov_type, currency, original_amount, ars_amount, exchange_rate, rate_type, account_id, category_id FROM movements"
        )
        .unwrap();
    let rows = stmt
        .query_map([], |row| {
            Ok(Movement {
                id: row.get::<_, i64>(0)?,
                details: row.get::<_, String>(1)?,
                date: row.get::<_, String>(2)?,
                created_at: row.get::<_, String>(3)?,
                mov_type: match row.get::<_, String>(4)?.as_str() {
                    "income" => MovementType::Income,
                    "expense" => MovementType::Expense,
                    "transfer" => MovementType::Transfer,
                    _ => MovementType::Expense,
                },
                currency: match row.get::<_, String>(5)?.as_str() {
                    "USD" => Currency::USD,
                    _ => Currency::ARS,
                },
                original_amount: row.get::<_, i64>(6)?,
                ars_amount: row.get::<_, i64>(7)?,
                exchange_rate: row.get::<_, Option<i64>>(8)?,
                rate_type: match row.get::<_, Option<String>>(9)? {
                    Some(rt) => Some(match rt.as_str() {
                        "blue" => RateType::Blue,
                        "oficial" => RateType::Oficial,
                        "mep" => RateType::Mep,
                        "ccl" => RateType::Ccl,
                        "cripto" => RateType::Cripto,
                        _ => RateType::Blue,
                    }),
                    None => None,
                },
                account_id: row.get::<_, i64>(10)?,
                category_id: row.get::<_, Option<i64>>(11)?,
            })
        })
        .unwrap();

    let movements = rows
        .into_iter()
        .map(|r| r.unwrap())
        .collect::<Vec<Movement>>();

    #[cfg(dev)]
    {
        println!("retrieving {} movements", movements.len());
    }

    movements
}

#[tauri::command]
pub fn add_movement(state: tauri::State<crate::AppState>, movement: AddMovement) -> Movement {
    let conn = state.conn.lock().unwrap();

    conn.execute(
        "INSERT INTO movements (details, date, mov_type, currency, original_amount, ars_amount, exchange_rate, rate_type, account_id, category_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            movement.details,
            movement.date,
            movement.mov_type,
            movement.currency,
            movement.original_amount,
            movement.ars_amount,
            movement.exchange_rate,
            movement.rate_type,
            movement.account_id,
            movement.category_id
        ],
    )
    .unwrap();

    let movement_id = conn.last_insert_rowid();

    conn.query_row(
        "SELECT id, details, date, created_at, mov_type, currency, original_amount, ars_amount, exchange_rate, rate_type, account_id, category_id FROM movements WHERE id = ?1",
        params![movement_id],
        |row| {
            Ok(Movement {
                id: row.get::<_, i64>(0)?,
                details: row.get::<_, String>(1)?,
                date: row.get::<_, String>(2)?,
                created_at: row.get::<_, String>(3)?,
                mov_type: match row.get::<_, String>(4)?.as_str() {
                    "income" => MovementType::Income,
                    "expense" => MovementType::Expense,
                    "transfer" => MovementType::Transfer,
                    _ => MovementType::Expense,
                },
                currency: match row.get::<_, String>(5)?.as_str() {
                    "USD" => Currency::USD,
                    _ => Currency::ARS,
                },
                original_amount: row.get::<_, i64>(6)?,
                ars_amount: row.get::<_, i64>(7)?,
                exchange_rate: row.get::<_, Option<i64>>(8)?,
                rate_type: match row.get::<_, Option<String>>(9)? {
                    Some(rt) => Some(match rt.as_str() {
                        "blue" => RateType::Blue,
                        "oficial" => RateType::Oficial,
                        "mep" => RateType::Mep,
                        "ccl" => RateType::Ccl,
                        "cripto" => RateType::Cripto,
                        _ => RateType::Blue,
                    }),
                    None => None,
                },
                account_id: row.get::<_, i64>(10)?,
                category_id: row.get::<_, Option<i64>>(11)?,
            })
        },
    )
    .unwrap()
}

#[tauri::command]
pub fn update_movement(
    state: tauri::State<crate::AppState>,
    id: i64,
    movement: UpdateMovement,
) -> Movement {
    let conn = state.conn.lock().unwrap();

    conn.execute(
        "UPDATE movements SET details = ?1, date = ?2, mov_type = ?3, currency = ?4, original_amount = ?5, ars_amount = ?6, exchange_rate = ?7, rate_type = ?8, category_id = ?9 WHERE id = ?10",
        params![
            movement.details,
            movement.date,
            movement.mov_type,
            movement.currency,
            movement.original_amount,
            movement.ars_amount,
            movement.exchange_rate,
            movement.rate_type,
            movement.category_id,
            id
        ],
    )
    .unwrap();

    conn.query_row(
        "SELECT id, details, date, created_at, mov_type, currency, original_amount, ars_amount, exchange_rate, rate_type, account_id, category_id FROM movements WHERE id = ?1",
        params![id],
        |row| {
            Ok(Movement {
                id: row.get::<_, i64>(0)?,
                details: row.get::<_, String>(1)?,
                date: row.get::<_, String>(2)?,
                created_at: row.get::<_, String>(3)?,
                mov_type: match row.get::<_, String>(4)?.as_str() {
                    "income" => MovementType::Income,
                    "expense" => MovementType::Expense,
                    "transfer" => MovementType::Transfer,
                    _ => MovementType::Expense,
                },
                currency: match row.get::<_, String>(5)?.as_str() {
                    "USD" => Currency::USD,
                    _ => Currency::ARS,
                },
                original_amount: row.get::<_, i64>(6)?,
                ars_amount: row.get::<_, i64>(7)?,
                exchange_rate: row.get::<_, Option<i64>>(8)?,
                rate_type: match row.get::<_, Option<String>>(9)? {
                    Some(rt) => Some(match rt.as_str() {
                        "blue" => RateType::Blue,
                        "oficial" => RateType::Oficial,
                        "mep" => RateType::Mep,
                        "ccl" => RateType::Ccl,
                        "cripto" => RateType::Cripto,
                        _ => RateType::Blue,
                    }),
                    None => None,
                },
                account_id: row.get::<_, i64>(10)?,
                category_id: row.get::<_, Option<i64>>(11)?,
            })
        },
    )
    .unwrap()
}

#[tauri::command]
pub fn delete_movement(state: tauri::State<crate::AppState>, id: i64) {
    let conn = state.conn.lock().unwrap();

    conn.execute("DELETE FROM movements WHERE id = ?1", params![id])
        .unwrap();
}
