use crate::{errors::OrbitError, utils::random_hex_color};
use rusqlite::params;
use serde::{Deserialize, Serialize};

/// A purchase record enriched with movement and store context.
/// Used by purchases_by_item to show the price history of an item.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PurchaseWithDetails {
    pub id: i64,
    pub price: i64,
    pub quantity: i64,
    pub created_at: String,
    /// Movement this purchase belongs to
    pub mov_id: i64,
    pub mov_date: String,
    pub mov_currency: String,
    /// Store where the item was purchased (optional)
    pub store_id: Option<i64>,
    pub store_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct AddPurchase {
    pub price: i64,
    pub quantity: i64,
    pub mov_id: i64,
    pub item_id: i64,
    /// Store name — auto-created if it doesn't exist, NULL if not provided.
    pub store_name: Option<String>,
}

/// Busca una tienda por nombre. Si no existe, la crea de forma segura.
fn find_or_create_store(conn: &rusqlite::Connection, name: &str) -> Result<i64, OrbitError> {
    // Validación básica antes de operar
    if name.trim().is_empty() {
        return Err(OrbitError::ValidationError(
            "El nombre de la tienda no puede estar vacío".into(),
        ));
    }

    let query_result = conn.query_row(
        "SELECT id FROM stores WHERE name = ?1",
        params![name],
        |row| row.get(0),
    );

    match query_result {
        // Caso 1: La tienda ya existe, devolvemos el ID mapeado a Ok
        Ok(id) => Ok(id),

        // Caso 2: No se encontró (Error esperado), la insertamos
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            let color = random_hex_color();
            conn.execute(
                "INSERT INTO stores (name, color) VALUES (?1, ?2)",
                params![name, color],
            )?;
            Ok(conn.last_insert_rowid())
        }

        // Caso 3: Cualquier otro error de SQLite (DB bloqueada, disco lleno, etc.) se propaga
        Err(e) => Err(OrbitError::Database(e)),
    }
}

#[tauri::command]
pub fn get_purchases(
    state: tauri::State<crate::AppState>,
) -> Result<Vec<PurchaseWithDetails>, OrbitError> {
    let conn = state.conn.lock().unwrap();

    let mut stmt = conn.prepare(
        "SELECT p.id, p.price, p.quantity, p.created_at,
                m.id, m.date, m.currency,
                s.id, s.name
         FROM purchases p
         JOIN movements m ON m.id = p.mov_id
         LEFT JOIN stores s ON s.id = p.store_id
         ORDER BY m.date DESC, p.id DESC
        ",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(PurchaseWithDetails {
            id: row.get(0)?,
            price: row.get(1)?,
            quantity: row.get(2)?,
            created_at: row.get(3)?,
            mov_id: row.get(4)?,
            mov_date: row.get(5)?,
            mov_currency: row.get(6)?,
            // Estos dos absorben el NULL del LEFT JOIN de forma segura
            store_id: row.get(7)?,
            store_name: row.get(8)?,
        })
    })?;

    // El operador ? final convierte limpiamente el rusqlite::Error a OrbitError
    let purchases = rows.collect::<Result<Vec<PurchaseWithDetails>, rusqlite::Error>>()?;

    Ok(purchases)
}

/// Devuelve todas las compras de un ítem, ordenadas por fecha de movimiento descendente.
#[tauri::command]
pub fn purchases_by_item(
    state: tauri::State<crate::AppState>,
    item_id: i64,
) -> Result<Vec<PurchaseWithDetails>, OrbitError> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT p.id, p.price, p.quantity, p.created_at,
                m.id, m.date, m.currency,
                s.id, s.name
         FROM purchases p
         JOIN  movements m ON m.id = p.mov_id
         LEFT JOIN stores s ON s.id = p.store_id
         WHERE p.item_id = ?1
         ORDER BY m.date DESC",
    )?;

    let purchases = stmt
        .query_map(params![item_id], |row| {
            Ok(PurchaseWithDetails {
                id: row.get(0)?,
                price: row.get(1)?,
                quantity: row.get(2)?,
                created_at: row.get(3)?,
                mov_id: row.get(4)?,
                mov_date: row.get(5)?,
                mov_currency: row.get(6)?,
                store_id: row.get(7)?,
                store_name: row.get(8)?,
            })
        })?
        .collect::<Result<Vec<PurchaseWithDetails>, rusqlite::Error>>()?;

    Ok(purchases)
}

/// Registra una compra. Si se provee tienda y no existe, se crea automáticamente.
#[tauri::command]
pub fn add_purchase(
    state: tauri::State<crate::AppState>,
    purchase: AddPurchase,
) -> Result<PurchaseWithDetails, OrbitError> {
    // Validaciones defensivas de negocio
    if purchase.quantity <= 0 {
        return Err(OrbitError::ValidationError(
            "La cantidad comprada debe ser mayor a cero".into(),
        ));
    }
    if purchase.price < 0 {
        return Err(OrbitError::ValidationError(
            "El precio del ítem no puede ser negativo".into(),
        ));
    }

    let conn = state.conn.lock().unwrap();

    // El truco del .transpose() para resolver la firma de find_or_create_store
    let store_id: Option<i64> = purchase
        .store_name
        .as_deref()
        .filter(|s| !s.trim().is_empty())
        .map(|name| find_or_create_store(&conn, name))
        .transpose()?; // Si falla la DB al crear la tienda, intercepta y sale acá con Err

    conn.execute(
        "INSERT INTO purchases (price, quantity, mov_id, item_id, store_id) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            purchase.price,
            purchase.quantity,
            purchase.mov_id,
            purchase.item_id,
            store_id
        ],
    )?;

    let purchase_id = conn.last_insert_rowid();

    let purchase_details = conn.query_row(
        "SELECT p.id, p.price, p.quantity, p.created_at,
                m.id, m.date, m.currency,
                s.id, s.name
         FROM purchases p
         JOIN  movements m ON m.id = p.mov_id
         LEFT JOIN stores s ON s.id = p.store_id
         WHERE p.id = ?1",
        params![purchase_id],
        |row| {
            Ok(PurchaseWithDetails {
                id: row.get(0)?,
                price: row.get(1)?,
                quantity: row.get(2)?,
                created_at: row.get(3)?,
                mov_id: row.get(4)?,
                mov_date: row.get(5)?,
                mov_currency: row.get(6)?,
                store_id: row.get(7)?,
                store_name: row.get(8)?,
            })
        },
    )?;

    Ok(purchase_details)
}
