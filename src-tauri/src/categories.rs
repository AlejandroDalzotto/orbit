use rusqlite::{params, Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::errors::AppError;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum CategoryType {
    Income,
    Expense,
    Both,
}

impl CategoryType {
    fn as_sql(self) -> &'static str {
        match self {
            Self::Income => "income",
            Self::Expense => "expense",
            Self::Both => "both",
        }
    }
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Category {
    #[ts(type = "number")]
    pub id: i64,
    pub name: String,
    pub r#type: CategoryType,
    #[ts(type = "number | null")]
    pub parent_id: Option<i64>,
    pub is_active: bool,
    #[ts(type = "number")]
    pub movement_count: i64,
    pub created_at: String,
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct CategoryEntry {
    pub name: String,
    pub r#type: CategoryType,
    #[ts(type = "number | null")]
    pub parent_id: Option<i64>,
}

const CATEGORY_SELECT: &str = "SELECT c.id, c.name, c.type, c.parent_id, c.is_active,
    (SELECT COUNT(*) FROM movements m WHERE m.category_id = c.id) AS movement_count,
    c.created_at FROM categories c";

fn row_to_category(row: &Row<'_>) -> rusqlite::Result<Category> {
    let category_type: String = row.get("type")?;
    let category_type = match category_type.as_str() {
        "income" => CategoryType::Income,
        "expense" => CategoryType::Expense,
        "both" => CategoryType::Both,
        _ => {
            return Err(rusqlite::Error::FromSqlConversionFailure(
                row.as_ref().column_index("type")?,
                rusqlite::types::Type::Text,
                Box::new(std::io::Error::new(
                    std::io::ErrorKind::InvalidData,
                    "invalid category type",
                )),
            ));
        }
    };
    Ok(Category {
        id: row.get("id")?,
        name: row.get("name")?,
        r#type: category_type,
        parent_id: row.get("parent_id")?,
        is_active: row.get("is_active")?,
        movement_count: row.get("movement_count")?,
        created_at: row.get("created_at")?,
    })
}

fn list_categories(conn: &Connection) -> Result<Vec<Category>, AppError> {
    let mut stmt = conn.prepare(&format!("{CATEGORY_SELECT} ORDER BY c.name, c.id"))?;
    let categories = stmt
        .query_map([], row_to_category)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(categories)
}

fn find_category(conn: &Connection, id: i64) -> Result<Category, AppError> {
    conn.query_row(
        &format!("{CATEGORY_SELECT} WHERE c.id = ?1"),
        [id],
        row_to_category,
    )
    .optional()?
    .ok_or_else(|| AppError::NotFound("Categoría no encontrada".into()))
}

fn validate_entry(
    conn: &Connection,
    id: Option<i64>,
    entry: &CategoryEntry,
) -> Result<(), AppError> {
    if entry.name.trim().is_empty() {
        return Err(AppError::Validation(
            "El nombre de la categoría no puede estar vacío".into(),
        ));
    }

    if let Some(parent_id) = entry.parent_id {
        // UNION terminates even if a pre-existing hierarchy is already cyclic.
        let cycle: bool = conn.query_row(
            "WITH RECURSIVE ancestors(id, parent_id) AS (
                SELECT id, parent_id FROM categories WHERE id = ?1
                UNION
                SELECT c.id, c.parent_id FROM categories c
                JOIN ancestors a ON c.id = a.parent_id
             ) SELECT EXISTS(SELECT 1 FROM ancestors WHERE id = ?2)",
            params![parent_id, id],
            |row| row.get(0),
        )?;
        if cycle {
            return Err(AppError::Validation(
                "La jerarquía de categorías no puede contener ciclos".into(),
            ));
        }
        let parent = find_category(conn, parent_id)?;
        if !parent.is_active {
            return Err(AppError::Validation(
                "La categoría padre debe estar activa".into(),
            ));
        }
        if parent.r#type != CategoryType::Both && parent.r#type != entry.r#type {
            return Err(AppError::Validation(
                "El tipo de categoría no es compatible con su categoría padre".into(),
            ));
        }
    }

    if let Some(id) = id {
        let incompatible_children: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM categories
             WHERE parent_id = ?1 AND is_active = 1 AND ?2 != 'both' AND type != ?2)",
            params![id, entry.r#type.as_sql()],
            |row| row.get(0),
        )?;
        if incompatible_children {
            return Err(AppError::Validation(
                "El tipo de categoría no es compatible con sus subcategorías activas".into(),
            ));
        }
        let incompatible_movements: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM movements WHERE category_id = ?1
             AND (type NOT IN ('income', 'expense') OR (?2 != 'both' AND type != ?2)))",
            params![id, entry.r#type.as_sql()],
            |row| row.get(0),
        )?;
        if incompatible_movements {
            return Err(AppError::Validation(
                "El tipo de categoría no es compatible con sus movimientos existentes".into(),
            ));
        }
    }
    Ok(())
}

fn insert_category(conn: &mut Connection, entry: CategoryEntry) -> Result<Category, AppError> {
    let tx = conn.transaction()?;
    let category = create_category_in_transaction(&tx, entry)?;
    tx.commit()?;
    Ok(category)
}

/// The caller owns the transaction, including rollback of trigger side effects.
pub(crate) fn create_category_in_transaction(
    tx: &Connection,
    entry: CategoryEntry,
) -> Result<Category, AppError> {
    validate_entry(tx, None, &entry)?;
    tx.execute(
        "INSERT INTO categories (name, type, parent_id) VALUES (?1, ?2, ?3)",
        params![entry.name.trim(), entry.r#type.as_sql(), entry.parent_id],
    )?;
    let category = find_category(tx, tx.last_insert_rowid())?;
    Ok(category)
}

fn edit_category(
    conn: &mut Connection,
    id: i64,
    entry: CategoryEntry,
) -> Result<Category, AppError> {
    let tx = conn.transaction()?;
    find_category(&tx, id)?;
    validate_entry(&tx, Some(id), &entry)?;
    tx.execute(
        "UPDATE categories SET name = ?1, type = ?2, parent_id = ?3,
         updated_at = datetime('now') WHERE id = ?4",
        params![
            entry.name.trim(),
            entry.r#type.as_sql(),
            entry.parent_id,
            id
        ],
    )?;
    let category = find_category(&tx, id)?;
    tx.commit()?;
    Ok(category)
}

fn archive_category(conn: &mut Connection, id: i64) -> Result<(), AppError> {
    let tx = conn.transaction()?;
    find_category(&tx, id)?;
    let active_children: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM categories WHERE parent_id = ?1 AND is_active = 1)",
        [id],
        |row| row.get(0),
    )?;
    if active_children {
        return Err(AppError::Validation(
            "Archivá o mové las subcategorías activas antes de archivar esta categoría".into(),
        ));
    }
    tx.execute(
        "UPDATE categories SET is_active = 0, updated_at = datetime('now') WHERE id = ?1",
        [id],
    )?;
    tx.commit()?;
    Ok(())
}

#[tauri::command]
pub fn get_categories(state: tauri::State<crate::AppState>) -> Result<Vec<Category>, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    list_categories(&conn)
}

#[tauri::command]
pub fn add_category(
    state: tauri::State<crate::AppState>,
    entry: CategoryEntry,
) -> Result<Category, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    insert_category(&mut conn, entry)
}

#[tauri::command]
pub fn update_category(
    state: tauri::State<crate::AppState>,
    id: i64,
    entry: CategoryEntry,
) -> Result<Category, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    edit_category(&mut conn, id, entry)
}

#[tauri::command]
pub fn delete_category(state: tauri::State<crate::AppState>, id: i64) -> Result<(), AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    archive_category(&mut conn, id)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn database() -> Result<Connection, AppError> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch(include_str!("../schema.sql"))?;
        Ok(conn)
    }

    fn entry(name: &str, category_type: CategoryType, parent_id: Option<i64>) -> CategoryEntry {
        CategoryEntry {
            name: name.into(),
            r#type: category_type,
            parent_id,
        }
    }

    #[test]
    fn category_crud_keeps_archived_categories_and_movement_counts() -> Result<(), AppError> {
        let mut conn = database()?;
        let category = insert_category(&mut conn, entry(" Food ", CategoryType::Expense, None))?;
        assert_eq!(category.name, "Food");
        assert_eq!(category.movement_count, 0);
        conn.execute_batch(
            "INSERT OR IGNORE INTO currencies (code, name, symbol) VALUES ('USD', 'Dollar', '$');
             INSERT INTO accounts (name, type, currency_code) VALUES ('Cash', 'cash', 'USD');",
        )?;
        conn.execute(
            "INSERT INTO movements (account_id, type, amount, currency_code, date, category_id)
             VALUES (1, 'expense', 100, 'USD', '2026-01-01', ?1)",
            [category.id],
        )?;
        let updated = edit_category(
            &mut conn,
            category.id,
            entry("Groceries", CategoryType::Expense, None),
        )?;
        assert_eq!(updated.name, "Groceries");
        assert_eq!(updated.movement_count, 1);
        assert!(matches!(
            edit_category(
                &mut conn,
                category.id,
                entry("Wrong", CategoryType::Income, None)
            ),
            Err(AppError::Validation(_))
        ));
        archive_category(&mut conn, category.id)?;
        archive_category(&mut conn, category.id)?;
        let all = list_categories(&conn)?;
        assert_eq!(all.len(), 1);
        assert!(!all[0].is_active);
        assert_eq!(all[0].movement_count, 1);
        assert_eq!(all[0].r#type, CategoryType::Expense);
        Ok(())
    }

    #[test]
    fn hierarchy_rejects_cycles_inactive_parents_and_incompatible_types() -> Result<(), AppError> {
        let mut conn = database()?;
        let root = insert_category(&mut conn, entry("Root", CategoryType::Both, None))?;
        let child = insert_category(
            &mut conn,
            entry("Child", CategoryType::Expense, Some(root.id)),
        )?;
        let leaf = insert_category(
            &mut conn,
            entry("Leaf", CategoryType::Expense, Some(child.id)),
        )?;
        for parent in [root.id, child.id, leaf.id] {
            assert!(matches!(
                edit_category(
                    &mut conn,
                    root.id,
                    entry("Root", CategoryType::Both, Some(parent))
                ),
                Err(AppError::Validation(_))
            ));
        }
        assert!(matches!(
            archive_category(&mut conn, root.id),
            Err(AppError::Validation(_))
        ));
        assert!(matches!(
            edit_category(
                &mut conn,
                root.id,
                entry("Root", CategoryType::Income, None)
            ),
            Err(AppError::Validation(_))
        ));
        for category_type in [CategoryType::Income, CategoryType::Both] {
            assert!(matches!(
                insert_category(&mut conn, entry("Wrong", category_type, Some(child.id))),
                Err(AppError::Validation(_))
            ));
        }
        archive_category(&mut conn, leaf.id)?;
        assert!(matches!(
            insert_category(
                &mut conn,
                entry("Wrong", CategoryType::Expense, Some(leaf.id))
            ),
            Err(AppError::Validation(_))
        ));
        archive_category(&mut conn, child.id)?;
        archive_category(&mut conn, root.id)?;
        Ok(())
    }

    #[test]
    fn invalid_names_and_missing_categories_do_not_write() -> Result<(), AppError> {
        let mut conn = database()?;
        assert!(matches!(
            insert_category(&mut conn, entry(" \n", CategoryType::Both, None)),
            Err(AppError::Validation(_))
        ));
        assert!(matches!(
            insert_category(&mut conn, entry("Child", CategoryType::Both, Some(99))),
            Err(AppError::NotFound(_))
        ));
        assert!(matches!(
            edit_category(&mut conn, 99, entry("Missing", CategoryType::Both, None)),
            Err(AppError::NotFound(_))
        ));
        assert!(matches!(
            archive_category(&mut conn, 99),
            Err(AppError::NotFound(_))
        ));
        assert!(list_categories(&conn)?.is_empty());
        Ok(())
    }

    #[test]
    fn category_dto_contract_is_camel_case_and_numeric() -> Result<(), AppError> {
        let mut conn = database()?;
        let input: CategoryEntry = serde_json::from_value(serde_json::json!({
            "name": "Food", "type": "expense", "parentId": null
        }))
        .map_err(|error| AppError::Internal(error.to_string()))?;
        let category = insert_category(&mut conn, input)?;
        let json = serde_json::to_value(category)
            .map_err(|error| AppError::Internal(error.to_string()))?;
        assert_eq!(json["type"], "expense");
        assert_eq!(json["parentId"], serde_json::Value::Null);
        assert_eq!(json["isActive"], true);
        assert_eq!(json["movementCount"], 0);
        assert!(json["createdAt"].is_string());
        let config = ts_rs::Config::default();
        let declaration = Category::decl(&config);
        assert!(declaration.contains("id: number"));
        assert!(declaration.contains("parentId: number | null"));
        assert!(!declaration.contains("bigint"));
        assert!(!CategoryEntry::decl(&config).contains("bigint"));
        Ok(())
    }
}
