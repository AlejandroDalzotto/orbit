use rusqlite::{
    params, params_from_iter,
    types::{FromSql, FromSqlError, FromSqlResult, ToSqlOutput, Value, ValueRef},
    ToSql,
};
use serde::{Deserialize, Serialize};

use crate::errors::OrbitError;

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

// ───────────────────────── Enums de dominio ─────────────────────────
// (estos ya los tenías; los dejo para contexto del FromSql de abajo)

/// Tipo de movimiento
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MovementType {
    Income,
    Expense,
    Transfer,
}

impl MovementType {
    /// Representación tal cual se guarda en la columna `mov_type`.
    pub fn as_db_str(self) -> &'static str {
        match self {
            MovementType::Income => "income",
            MovementType::Expense => "expense",
            MovementType::Transfer => "transfer",
        }
    }
}

/// Moneda del movimiento
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

/// Tipo de cotización usada en la conversión
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RateType {
    Blue,
    Oficial,
    Mep,
    Ccl,
    Cripto,
}

impl ToSql for Currency {
    fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
        let s: &str = match self {
            Currency::USD => "USD",
            Currency::ARS => "ARS",
        };
        Ok(ToSqlOutput::from(s))
    }
}

impl ToSql for MovementType {
    fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
        let s: &str = match self {
            MovementType::Income => "income",
            MovementType::Expense => "expense",
            MovementType::Transfer => "transfer",
        };
        Ok(ToSqlOutput::from(s))
    }
}

impl ToSql for RateType {
    fn to_sql(&self) -> rusqlite::Result<ToSqlOutput<'_>> {
        let s: &str = match self {
            RateType::Blue => "blue",
            RateType::Oficial => "oficial",
            RateType::Mep => "mep",
            RateType::Ccl => "ccl",
            RateType::Cripto => "cripto",
        };
        Ok(ToSqlOutput::from(s))
    }
}

impl FromSql for MovementType {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        value.as_str().and_then(|s| match s {
            "income" => Ok(MovementType::Income),
            "expense" => Ok(MovementType::Expense),
            "transfer" => Ok(MovementType::Transfer),
            other => Err(FromSqlError::Other(
                format!("mov_type inválido en la base de datos: {other:?}").into(),
            )),
        })
    }
}

impl FromSql for Currency {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        value.as_str().and_then(|s| match s {
            "ARS" => Ok(Currency::ARS),
            "USD" => Ok(Currency::USD),
            other => Err(FromSqlError::Other(
                format!("currency inválida en la base de datos: {other:?}").into(),
            )),
        })
    }
}

impl FromSql for RateType {
    fn column_result(value: ValueRef<'_>) -> FromSqlResult<Self> {
        value.as_str().and_then(|s| match s {
            "blue" => Ok(RateType::Blue),
            "oficial" => Ok(RateType::Oficial),
            "mep" => Ok(RateType::Mep),
            "ccl" => Ok(RateType::Ccl),
            "cripto" => Ok(RateType::Cripto),
            other => Err(FromSqlError::Other(
                format!("rate_type inválido en la base de datos: {other:?}").into(),
            )),
        })
    }
}

// ───────────────────────── Tipos de filtros ─────────────────────────
// Equivalen a las interfaces de TS. El front manda camelCase, así que
// usamos `rename_all = "camelCase"` en el struct contenedor.

/// `Period = "1m" | "3m" | "1y"`
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Period {
    #[serde(rename = "1m")]
    OneMonth,
    #[serde(rename = "3m")]
    ThreeMonths,
    #[serde(rename = "1y")]
    OneYear,
}

impl Period {
    /// Modificador para `date('now', ?)` de SQLite.
    fn sqlite_modifier(self) -> &'static str {
        match self {
            Period::OneMonth => "-1 month",
            Period::ThreeMonths => "-3 months",
            Period::OneYear => "-1 year",
        }
    }
}

/// `SortField = "date" | "details" | "amount"`
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SortField {
    Date,
    Details,
    Amount,
}

impl SortField {
    /// Columna real (whitelist). NUNCA interpolamos texto del usuario:
    /// solo devolvemos literales fijos y seguros para el `ORDER BY`.
    fn column(self) -> &'static str {
        match self {
            SortField::Date => "date",
            SortField::Details => "details",
            SortField::Amount => "ars_amount",
        }
    }
}

/// `SortOrder = "ASC" | "DESC"`
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum SortOrder {
    Asc,
    Desc,
}

impl SortOrder {
    fn keyword(self) -> &'static str {
        match self {
            SortOrder::Asc => "ASC",
            SortOrder::Desc => "DESC",
        }
    }
}

/// `SortCriteria { field, order }`
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct SortCriteria {
    pub field: SortField,
    pub order: SortOrder,
}

impl Default for SortCriteria {
    fn default() -> Self {
        // Orden por defecto: fecha descendente (lo más nuevo primero).
        SortCriteria {
            field: SortField::Date,
            order: SortOrder::Desc,
        }
    }
}

/// `MovementTypeFilter = "all" | MovementType`
/// Lo aplanamos a un solo enum: "all" | "income" | "expense" | "transfer".
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MovementTypeFilter {
    All,
    Income,
    Expense,
    Transfer,
}

impl MovementTypeFilter {
    /// `None` => sin filtro de tipo; `Some(t)` => filtra por ese tipo.
    fn as_movement_type(self) -> Option<MovementType> {
        match self {
            MovementTypeFilter::All => None,
            MovementTypeFilter::Income => Some(MovementType::Income),
            MovementTypeFilter::Expense => Some(MovementType::Expense),
            MovementTypeFilter::Transfer => Some(MovementType::Transfer),
        }
    }
}

/// `MovementFilters` — matchea con el objeto `filters` del front.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MovementFilters {
    /// Campos opcionales: si el front no los manda, quedan en `None`.
    #[serde(default)]
    pub period: Option<Period>,
    #[serde(default)]
    pub sort: Option<SortCriteria>,

    pub limit: i64,
    pub offset: i64,

    /// `number | null` y además puede venir ausente => doble default.
    #[serde(default)]
    pub category_id: Option<i64>,
    #[serde(default)]
    pub group_id: Option<i64>,

    #[serde(default)]
    pub query: Option<String>,

    /// Requerido en el front (siempre manda al menos "all").
    pub r#type: MovementTypeFilter,
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

#[derive(Debug, Serialize)]
pub struct MovementList {
    pub movements: Vec<Movement>,
    pub total: i64,
}

#[tauri::command]
pub fn get_movements(
    state: tauri::State<crate::AppState>,
    filters: MovementFilters,
) -> Result<MovementList, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    // Construimos SOLO el WHERE primero: lo compartimos entre la query
    // de conteo y la de datos. Todo valor va como parámetro (?).
    let mut conditions: Vec<&str> = Vec::new();
    let mut params: Vec<Value> = Vec::new();

    // ── type ("all" no filtra) ──
    if let Some(t) = filters.r#type.as_movement_type() {
        conditions.push("mov_type = ?");
        params.push(Value::Text(t.as_db_str().to_string()));
    }

    // ── period (date >= now - intervalo) ──
    if let Some(period) = filters.period {
        conditions.push("date >= date('now', ?)");
        params.push(Value::Text(period.sqlite_modifier().to_string()));
    }

    // ── category_id ──
    if let Some(cat) = filters.category_id {
        conditions.push("category_id = ?");
        params.push(Value::Integer(cat));
    }

    // ── group_id (relación N:M vía movements_groups) ──
    if let Some(group) = filters.group_id {
        conditions.push("id IN (SELECT mov_id FROM movements_groups WHERE group_id = ?)");
        params.push(Value::Integer(group));
    }

    // ── query (búsqueda en details) ──
    if let Some(q) = filters.query.as_deref().map(str::trim) {
        if !q.is_empty() {
            conditions.push("details LIKE ?");
            params.push(Value::Text(format!("%{q}%")));
        }
    }

    // Cláusula WHERE reutilizable (vacía si no hay condiciones).
    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!(" WHERE {}", conditions.join(" AND "))
    };

    // ── 1) TOTAL: cuenta TODO lo filtrado, sin LIMIT/OFFSET ──
    // Clonamos los params del WHERE porque params_from_iter los consume.
    let count_sql = format!("SELECT COUNT(*) FROM movements{where_clause}");
    let total: i64 = conn
        .query_row(&count_sql, params_from_iter(params.clone()), |row| {
            row.get(0)
        })
        .map_err(|e| e.to_string())?;

    // ── 2) DATOS: misma base + ORDER BY + LIMIT/OFFSET ──
    let mut sql = format!(
        "SELECT id, details, date, created_at, mov_type, currency, \
         original_amount, ars_amount, exchange_rate, rate_type, account_id, category_id \
         FROM movements{where_clause}",
    );

    // ── ORDER BY (whitelist, seguro) + desempate estable por id ──
    let sort = filters.sort.unwrap_or_default();
    sql.push_str(&format!(
        " ORDER BY {} {}, id {}",
        sort.field.column(),
        sort.order.keyword(),
        sort.order.keyword(),
    ));

    // ── LIMIT / OFFSET (agregamos al final, solo para esta query) ──
    sql.push_str(" LIMIT ? OFFSET ?");
    params.push(Value::Integer(filters.limit));
    params.push(Value::Integer(filters.offset));

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(params_from_iter(params), |row| {
            Ok(Movement {
                id: row.get(0)?,
                details: row.get(1)?,
                date: row.get(2)?,
                created_at: row.get(3)?,
                mov_type: row.get(4)?, // usa FromSql<MovementType>
                currency: row.get(5)?, // usa FromSql<Currency>
                original_amount: row.get(6)?,
                ars_amount: row.get(7)?,
                exchange_rate: row.get(8)?,
                rate_type: row.get(9)?, // Option<RateType>, maneja NULL
                account_id: row.get(10)?,
                category_id: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let movements = rows
        .collect::<Result<Vec<Movement>, _>>()
        .map_err(|e| e.to_string())?;

    #[cfg(dev)]
    {
        println!("retrieving {} of {} movements", movements.len(), total);
    }

    Ok(MovementList { movements, total })
}

#[tauri::command]
pub fn get_movements_by_account_id(
    state: tauri::State<crate::AppState>,
    acc_id: i64,
) -> Vec<Movement> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT id, details, date, created_at, mov_type, currency, original_amount, ars_amount, exchange_rate, rate_type, account_id, category_id FROM movements WHERE account_id = ?1"
        )
        .unwrap();
    let rows = stmt
        .query_map([acc_id], |row| {
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

// ---------------------------------------------------------------------------
// Agregar estas structs y el comando a movements.rs
// ---------------------------------------------------------------------------

/// An item with its purchase context for a specific movement.
/// Used to display "what was bought" in a movement detail view.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemWithPurchase {
    /// Purchase fields
    pub purchase_id: i64,
    pub price: i64,
    pub quantity: i64,
    /// Item fields
    pub item_id: i64,
    pub item_name: String,
    pub item_brand: Option<String>,
    /// Store fields (optional)
    pub store_id: Option<i64>,
    pub store_name: Option<String>,
}

/// Returns all items purchased within a given movement.
#[tauri::command]
pub fn items_by_movement(
    state: tauri::State<crate::AppState>,
    mov_id: i64,
) -> Vec<ItemWithPurchase> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn
        .prepare(
            "SELECT p.id, p.price, p.quantity,
                    i.id, i.name, i.brand,
                    s.id, s.name
             FROM purchases p
             JOIN  items   i ON i.id = p.item_id
             LEFT JOIN stores s ON s.id = p.store_id
             WHERE p.mov_id = ?1
             ORDER BY p.id ASC",
        )
        .unwrap();

    stmt.query_map(params![mov_id], |row| {
        Ok(ItemWithPurchase {
            purchase_id: row.get(0)?,
            price: row.get(1)?,
            quantity: row.get(2)?,
            item_id: row.get(3)?,
            item_name: row.get(4)?,
            item_brand: row.get(5)?,
            store_id: row.get(6)?,
            store_name: row.get(7)?,
        })
    })
    .unwrap()
    .map(|r| r.unwrap())
    .collect()
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MovementStats {
    pub total_income: f64,
    pub total_expense: f64,
    pub total_net: f64,
}

#[tauri::command]
pub fn get_movements_stats(
    state: tauri::State<crate::AppState>,
    filters: MovementFilters,
) -> Result<MovementStats, OrbitError> {
    let conn = state.conn.lock().unwrap();

    // Mismo armado de WHERE que get_movements (todo parametrizado).
    // NO usamos limit/offset: las stats son sobre TODO lo filtrado.
    let mut conditions: Vec<&str> = Vec::new();
    let mut params: Vec<Value> = Vec::new();

    // ── type ("all" no filtra) ──
    if let Some(t) = filters.r#type.as_movement_type() {
        conditions.push("mov_type = ?");
        params.push(Value::Text(t.as_db_str().to_string()));
    }

    // ── period ──
    if let Some(period) = filters.period {
        conditions.push("date >= date('now', ?)");
        params.push(Value::Text(period.sqlite_modifier().to_string()));
    }

    // ── category_id ──
    if let Some(cat) = filters.category_id {
        conditions.push("category_id = ?");
        params.push(Value::Integer(cat));
    }

    // ── group_id (relación N:M vía movements_groups) ──
    if let Some(group) = filters.group_id {
        conditions.push("id IN (SELECT mov_id FROM movements_groups WHERE group_id = ?)");
        params.push(Value::Integer(group));
    }

    // ── query (búsqueda en details) ──
    if let Some(q) = filters.query.as_deref().map(str::trim) {
        if !q.is_empty() {
            conditions.push("details LIKE ?");
            params.push(Value::Text(format!("%{q}%")));
        }
    }

    // Agregamos en una sola pasada con SUM condicional.
    // COALESCE evita NULL cuando no hay filas que matcheen.
    let mut sql = String::from(
        "SELECT \
         COALESCE(SUM(CASE WHEN mov_type = 'income'  THEN ars_amount ELSE 0 END), 0) AS total_income, \
         COALESCE(SUM(CASE WHEN mov_type = 'expense' THEN ars_amount ELSE 0 END), 0) AS total_expense \
         FROM movements",
    );

    if !conditions.is_empty() {
        sql.push_str(" WHERE ");
        sql.push_str(&conditions.join(" AND "));
    }

    let (total_income, total_expense): (f64, f64) = conn
        .query_row(&sql, params_from_iter(params), |row| {
            Ok((row.get(0)?, row.get(1)?))
        })
        .map_err(|e| OrbitError::Database(e))?;

    Ok(MovementStats {
        total_income,
        total_expense,
        total_net: total_income - total_expense,
    })
}
