use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::errors::OrbitError;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Item {
    pub id: i64,
    pub name: String,
    pub brand: Option<String>,
    pub created_at: String,
    pub purchase_count: i64,
    pub last_purchased_at: Option<String>, // should be a string like "2 days ago" | "4 weeks ago"
    pub last_price_registered: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Store {
    pub id: i64,
    pub name: String,
    pub color: Option<String>,
    pub created_at: String,
    pub total_purchases: i64,
    pub total_expenses: i64,
}

#[derive(Debug, Deserialize)]
pub struct AddItem {
    pub name: String,
    pub brand: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateItem {
    pub name: String,
    pub brand: Option<String>,
}

fn row_to_item(row: &rusqlite::Row) -> rusqlite::Result<Item> {
    Ok(Item {
        id: row.get(0)?,
        name: row.get(1)?,
        brand: row.get(2)?,
        created_at: row.get(3)?,
        purchase_count: row.get(4)?,
        last_purchased_at: row.get(5)?,
        last_price_registered: row.get(6)?,
    })
}

// ---------------------------------------------------------------------------
// Item commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_items(state: tauri::State<crate::AppState>) -> Result<Vec<Item>, OrbitError> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT
            i.id,
            i.name,
            i.brand,
            i.created_at,
            COALESCE(COUNT(p.id), 0) AS purchase_count,
            CASE
                WHEN last_mov.date IS NOT NULL THEN
                    CASE
                        WHEN julianday('now') - julianday(last_mov.date) < 1 THEN 'today'
                        WHEN julianday('now') - julianday(last_mov.date) < 2 THEN '1 day ago'
                        WHEN julianday('now') - julianday(last_mov.date) < 7 THEN
                            CAST(CAST(julianday('now') - julianday(last_mov.date) AS INTEGER) AS TEXT) || ' days ago'
                        WHEN julianday('now') - julianday(last_mov.date) < 30 THEN
                            CAST(CAST((julianday('now') - julianday(last_mov.date)) / 7 AS INTEGER) AS TEXT) || ' weeks ago'
                        ELSE
                            CAST(CAST((julianday('now') - julianday(last_mov.date)) / 30 AS INTEGER) AS TEXT) || ' months ago'
                    END
                ELSE NULL
            END AS last_purchased_at,
            last_mov.price AS last_price_registered
        FROM items i
        LEFT JOIN purchases p ON p.item_id = i.id
        LEFT JOIN (
            SELECT p2.item_id, p2.price, m2.date
            FROM purchases p2
            JOIN movements m2 ON m2.id = p2.mov_id
            WHERE m2.date = (
                SELECT MAX(m3.date)
                FROM purchases p3
                JOIN movements m3 ON m3.id = p3.mov_id
                WHERE p3.item_id = p2.item_id
            )
            AND p2.id = (
                SELECT MAX(p4.id)
                FROM purchases p4
                JOIN movements m4 ON m4.id = p4.mov_id
                WHERE p4.item_id = p2.item_id
                AND m4.date = m2.date
            )
        ) last_mov ON last_mov.item_id = i.id
        GROUP BY i.id, i.name, i.brand, i.created_at
        ORDER BY i.name ASC"
    )?;

    // Eliminamos los .unwrap() encadenados usando la inversión del collect
    let items = stmt
        .query_map([], row_to_item)?
        .collect::<Result<Vec<Item>, rusqlite::Error>>()?;

    #[cfg(dev)]
    {
        println!("retrieving {} items", items.len());
    }

    Ok(items)
}

#[tauri::command]
pub fn add_item(state: tauri::State<crate::AppState>, item: AddItem) -> Result<Item, OrbitError> {
    if item.name.trim().is_empty() {
        return Err(OrbitError::ValidationError(
            "El nombre del ítem no puede estar vacío".into(),
        ));
    }

    let conn = state.conn.lock().unwrap();

    conn.execute(
        "INSERT INTO items (name, brand) VALUES (?1, ?2)",
        params![item.name, item.brand],
    )?;

    let item_id = conn.last_insert_rowid();

    let item = conn.query_row(
        "SELECT id, name, brand, created_at FROM items WHERE id = ?1",
        params![item_id],
        |row| {
            Ok(Item {
                id: row.get(0)?,
                name: row.get(1)?,
                brand: row.get(2)?,
                created_at: row.get(3)?,
                purchase_count: 0,
                last_purchased_at: None,
                last_price_registered: None,
            })
        },
    )?;

    Ok(item)
}

#[tauri::command]
pub fn update_item(
    state: tauri::State<crate::AppState>,
    id: i64,
    item: UpdateItem,
) -> Result<Item, OrbitError> {
    if item.name.trim().is_empty() {
        return Err(OrbitError::ValidationError(
            "El nombre del ítem no puede estar vacío".into(),
        ));
    }

    let conn = state.conn.lock().unwrap();

    let rows_affected = conn.execute(
        "UPDATE items SET name = ?1, brand = ?2 WHERE id = ?3",
        params![item.name, item.brand, id],
    )?;

    // Si afectó 0 filas significa que el ID enviado desde el frontend no existe
    if rows_affected == 0 {
        return Err(OrbitError::NotFound(format!(
            "No se encontró el ítem con ID {}",
            id
        )));
    }

    let updated_item = conn.query_row(
        "SELECT
            i.id,
            i.name,
            i.brand,
            i.created_at,
            COUNT(p.id) AS purchase_count,
            CASE
                WHEN last_mov.date IS NOT NULL THEN
                    CASE
                        WHEN CAST(julianday('now') - julianday(last_mov.date) AS INTEGER) < 1 THEN 'today'
                        WHEN CAST(julianday('now') - julianday(last_mov.date) AS INTEGER) < 2 THEN '1 day ago'
                        WHEN CAST(julianday('now') - julianday(last_mov.date) AS INTEGER) < 7 THEN
                            CAST(CAST(julianday('now') - julianday(last_mov.date) AS INTEGER) AS TEXT) || ' days ago'
                        WHEN CAST(julianday('now') - julianday(last_mov.date) AS INTEGER) < 30 THEN
                            CAST(CAST((julianday('now') - julianday(last_mov.date)) / 7 AS INTEGER) AS TEXT) || ' weeks ago'
                        ELSE
                            CAST(CAST((julianday('now') - julianday(last_mov.date)) / 30 AS INTEGER) AS TEXT) || ' months ago'
                    END
                ELSE NULL
            END AS last_purchased_at,
            last_mov.price AS last_price_registered
        FROM items i
        LEFT JOIN purchases p ON p.item_id = i.id
        LEFT JOIN (
            SELECT p2.item_id, p2.price, m2.date
            FROM purchases p2
            JOIN movements m2 ON m2.id = p2.mov_id
            WHERE m2.date = (
                SELECT MAX(m3.date)
                FROM purchases p3
                JOIN movements m3 ON m3.id = p3.mov_id
                WHERE p3.item_id = p2.item_id
            )
            AND p2.id = (
                SELECT MAX(p4.id)
                FROM purchases p4
                JOIN movements m4 ON m4.id = p4.mov_id
                WHERE p4.item_id = p2.item_id
                AND m4.date = m2.date
            )
        ) last_mov ON last_mov.item_id = i.id
        WHERE i.id = ?1
        GROUP BY i.id, i.name, i.brand, i.created_at",
        params![id],
        |row| row_to_item(row),
    )?;

    Ok(updated_item)
}

#[tauri::command]
pub fn delete_item(state: tauri::State<crate::AppState>, id: i64) -> Result<(), OrbitError> {
    let conn = state.conn.lock().unwrap();

    // Hacemos un borrado lógico (Soft Delete)
    let rows_affected = conn.execute(
        "UPDATE items SET is_archived = 1 WHERE id = ?1 AND is_archived = 0",
        params![id],
    )?;

    if rows_affected == 0 {
        return Err(OrbitError::NotFound(format!(
            "No se encontró el ítem activo con ID {}",
            id
        )));
    }

    Ok(())
}

#[tauri::command]
pub fn get_stores(state: tauri::State<crate::AppState>) -> Result<Vec<Store>, OrbitError> {
    let conn = state.conn.lock().unwrap();
    let mut stmt = conn.prepare(
        "
        SELECT
            s.id,
            s.name,
            s.color,
            s.created_at,
            COUNT(DISTINCT p.mov_id) AS total_purchases,
            COALESCE(SUM(p.price * p.quantity), 0) AS total_expenses
        FROM stores s
        LEFT JOIN purchases p ON p.store_id = s.id
        GROUP BY s.id
        ORDER BY s.name ASC",
    )?;

    let stores = stmt
        .query_map([], |row| {
            Ok(Store {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                created_at: row.get(3)?,
                total_purchases: row.get(4)?,
                total_expenses: row.get(5)?,
            })
        })?
        .collect::<Result<Vec<Store>, rusqlite::Error>>()?;

    Ok(stores)
}
