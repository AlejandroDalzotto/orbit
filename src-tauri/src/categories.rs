use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::AppState;

#[derive(Debug, Deserialize, Serialize)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub created_at: String,
}

#[tauri::command]
pub fn get_categories(state: tauri::State<AppState>) -> Vec<Category> {
    let conn = state.conn.lock().unwrap();

    let mut stmt = conn
        .prepare("SELECT id, name, created_at FROM categories")
        .unwrap();

    let rows = stmt
        .query_map([], |row| {
            Ok(Category {
                id: row.get::<_, i64>(0).unwrap(),
                name: row.get::<_, String>(1).unwrap(),
                created_at: row.get::<_, String>(2).unwrap(),
            })
        })
        .unwrap();

    rows.into_iter().map(|c| c.unwrap()).collect::<Vec<_>>()
}

#[tauri::command]
pub fn add_category(state: tauri::State<AppState>, name: String) -> Category {
    let conn = state.conn.lock().unwrap();
    let category = conn
        .query_one(
            "INSERT INTO categories (name) VALUES (?1) RETURNING id, name, created_at",
            params![name],
            |row| {
                Ok(Category {
                    id: row.get::<_, i64>(0).unwrap(),
                    name: row.get::<_, String>(1).unwrap(),
                    created_at: row.get::<_, String>(2).unwrap(),
                })
            },
        )
        .unwrap();
    category
}

#[tauri::command]
pub fn delete_category(state: tauri::State<AppState>, id: i64) -> bool {
    let conn = state.conn.lock().unwrap();
    let result = conn.execute("DELETE FROM categories WHERE id = ?1", params![id]);
    result.is_ok()
}

#[tauri::command]
pub fn update_category(state: tauri::State<AppState>, id: i64, name: String) -> Category {
    let conn = state.conn.lock().unwrap();
    let category = conn
        .query_one(
            "UPDATE categories SET name = ?1 WHERE id = ?2 RETURNING id, name, created_at",
            params![name, id],
            |row| {
                Ok(Category {
                    id: row.get::<_, i64>(0).unwrap(),
                    name: row.get::<_, String>(1).unwrap(),
                    created_at: row.get::<_, String>(2).unwrap(),
                })
            },
        )
        .unwrap();
    category
}
