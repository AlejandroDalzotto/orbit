use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::errors::OrbitError;

#[derive(Debug, Deserialize, Serialize)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub created_at: String,
    pub movement_count: Option<i64>,
}

#[tauri::command]
pub fn get_categories(state: tauri::State<crate::AppState>) -> Vec<Category> {
    let conn = state.conn.lock().unwrap();

    let mut stmt = conn
        .prepare(
            "
            SELECT c.id, c.name, c.created_at, COUNT(m.id) as movement_count
            FROM categories c
            LEFT JOIN movements m ON c.id = m.category_id
            GROUP BY c.id",
        )
        .unwrap();

    let rows = stmt
        .query_map([], |row| {
            Ok(Category {
                id: row.get::<_, i64>(0).unwrap(),
                name: row.get::<_, String>(1).unwrap(),
                created_at: row.get::<_, String>(2).unwrap(),
                movement_count: row.get::<_, Option<i64>>(3).unwrap(),
            })
        })
        .unwrap();

    rows.into_iter().map(|c| c.unwrap()).collect::<Vec<_>>()
}

#[tauri::command]
pub fn add_category(state: tauri::State<crate::AppState>, name: String) -> Result<i64, OrbitError> {
    let conn = state.conn.lock().unwrap();

    conn.execute("INSERT INTO categories (name) VALUES (?1)", params![name])?;

    // Recuperamos el ID autoincremental generado por SQLite para esa fila
    let id = conn.last_insert_rowid();

    // Devolvemos el ID en el Ok
    Ok(id)
}

#[tauri::command]
pub fn delete_category(state: tauri::State<crate::AppState>, id: i64) -> Result<(), OrbitError> {
    let conn = state.conn.lock().unwrap();

    let rows_affected = conn.execute("DELETE FROM categories WHERE id = ?1", params![id])?;

    if rows_affected == 0 {
        return Err(OrbitError::NotFound("Categoría no encontrada".into()));
    }

    Ok(())
}

#[tauri::command]
pub fn update_category(
    state: tauri::State<crate::AppState>,
    id: i64,
    name: String,
) -> Result<(), OrbitError> {
    let conn = state.conn.lock().unwrap();

    let rows_affected = conn.execute(
        "UPDATE categories SET name = ? WHERE id = ?",
        [&name, &id.to_string()], // rusqlite pide params mapeados
    )?;

    if rows_affected == 0 {
        return Err(OrbitError::NotFound("Categoría no encontrada".into()));
    }

    Ok(())
}
