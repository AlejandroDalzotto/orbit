use rusqlite::{params, Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::errors::AppError;

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Item {
    #[ts(type = "number")]
    pub id: i64,
    pub name: String,
    pub brand: Option<String>,
    pub description: Option<String>,
    pub is_archived: bool,
    #[ts(type = "number")]
    pub purchase_count: i64,
    pub created_at: String,
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ItemEntry {
    pub name: String,
    pub brand: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Shop {
    #[ts(type = "number")]
    pub id: i64,
    pub name: String,
    pub address: Option<String>,
}

const ITEM_SELECT: &str = "SELECT i.id, i.name, i.brand, i.description, i.is_archived,
    (SELECT COUNT(*) FROM purchases p WHERE p.item_id = i.id) AS purchase_count,
    i.created_at FROM items i";

fn row_to_item(row: &Row<'_>) -> rusqlite::Result<Item> {
    Ok(Item {
        id: row.get("id")?,
        name: row.get("name")?,
        brand: row.get("brand")?,
        description: row.get("description")?,
        is_archived: row.get("is_archived")?,
        purchase_count: row.get("purchase_count")?,
        created_at: row.get("created_at")?,
    })
}

fn row_to_shop(row: &Row<'_>) -> rusqlite::Result<Shop> {
    Ok(Shop {
        id: row.get("id")?,
        name: row.get("name")?,
        address: row.get("address")?,
    })
}

fn validate_name(name: &str) -> Result<(), AppError> {
    if name.trim().is_empty() {
        return Err(AppError::Validation(
            "El nombre no puede estar vacío".into(),
        ));
    }
    Ok(())
}

fn list_items(conn: &Connection) -> Result<Vec<Item>, AppError> {
    let mut stmt = conn.prepare(&format!("{ITEM_SELECT} ORDER BY i.name, i.id"))?;
    let items = stmt
        .query_map([], row_to_item)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(items)
}

fn find_item(conn: &Connection, id: i64) -> Result<Item, AppError> {
    conn.query_row(&format!("{ITEM_SELECT} WHERE i.id = ?1"), [id], row_to_item)
        .optional()?
        .ok_or_else(|| AppError::NotFound("Ítem no encontrado".into()))
}

fn insert_item(conn: &mut Connection, entry: ItemEntry) -> Result<Item, AppError> {
    let tx = conn.transaction()?;
    let item = create_item_in_transaction(&tx, entry)?;
    tx.commit()?;
    Ok(item)
}

/// The caller owns the transaction, including rollback of trigger side effects.
pub(crate) fn create_item_in_transaction(
    tx: &Connection,
    entry: ItemEntry,
) -> Result<Item, AppError> {
    validate_name(&entry.name)?;
    tx.execute(
        "INSERT INTO items (name, brand, description) VALUES (?1, ?2, ?3)",
        params![entry.name.trim(), entry.brand, entry.description],
    )?;
    let item = find_item(tx, tx.last_insert_rowid())?;
    Ok(item)
}

fn edit_item(conn: &mut Connection, id: i64, entry: ItemEntry) -> Result<Item, AppError> {
    validate_name(&entry.name)?;
    let tx = conn.transaction()?;
    let affected = tx.execute(
        "UPDATE items SET name = ?1, brand = ?2, description = ?3 WHERE id = ?4",
        params![entry.name.trim(), entry.brand, entry.description, id],
    )?;
    if affected == 0 {
        return Err(AppError::NotFound("Ítem no encontrado".into()));
    }
    let item = find_item(&tx, id)?;
    tx.commit()?;
    Ok(item)
}

fn archive_item(conn: &Connection, id: i64) -> Result<(), AppError> {
    let affected = conn.execute("UPDATE items SET is_archived = 1 WHERE id = ?1", [id])?;
    if affected == 0 {
        return Err(AppError::NotFound("Ítem no encontrado".into()));
    }
    Ok(())
}

fn list_shops(conn: &Connection) -> Result<Vec<Shop>, AppError> {
    let mut stmt = conn.prepare("SELECT id, name, address FROM shops ORDER BY name, id")?;
    let shops = stmt
        .query_map([], row_to_shop)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(shops)
}

fn insert_shop(
    conn: &mut Connection,
    name: String,
    address: Option<String>,
) -> Result<Shop, AppError> {
    validate_name(&name)?;
    let tx = conn.transaction()?;
    tx.execute(
        "INSERT INTO shops (name, address) VALUES (?1, ?2)",
        params![name.trim(), address],
    )?;
    let shop = tx.query_row(
        "SELECT id, name, address FROM shops WHERE id = ?1",
        [tx.last_insert_rowid()],
        row_to_shop,
    )?;
    tx.commit()?;
    Ok(shop)
}

#[tauri::command]
pub fn get_items(state: tauri::State<crate::AppState>) -> Result<Vec<Item>, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    list_items(&conn)
}

#[tauri::command]
pub fn add_item(state: tauri::State<crate::AppState>, entry: ItemEntry) -> Result<Item, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    insert_item(&mut conn, entry)
}

#[tauri::command]
pub fn update_item(
    state: tauri::State<crate::AppState>,
    id: i64,
    entry: ItemEntry,
) -> Result<Item, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    edit_item(&mut conn, id, entry)
}

#[tauri::command]
pub fn delete_item(state: tauri::State<crate::AppState>, id: i64) -> Result<(), AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    archive_item(&conn, id)
}

#[tauri::command]
pub fn get_shops(state: tauri::State<crate::AppState>) -> Result<Vec<Shop>, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    list_shops(&conn)
}

#[tauri::command]
pub fn add_shop(
    state: tauri::State<crate::AppState>,
    name: String,
    address: Option<String>,
) -> Result<Shop, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    insert_shop(&mut conn, name, address)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn database() -> Result<Connection, AppError> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch(include_str!("../schema.sql"))?;
        Ok(conn)
    }

    fn entry(name: &str) -> ItemEntry {
        ItemEntry {
            name: name.into(),
            brand: None,
            description: None,
        }
    }

    #[test]
    fn item_crud_includes_archived_items_and_preserves_purchase_counts() -> Result<(), AppError> {
        let mut conn = database()?;
        let item = insert_item(&mut conn, entry(" Milk "))?;
        assert_eq!(item.name, "Milk");
        assert_eq!(item.purchase_count, 0);
        assert!(!item.is_archived);
        assert!(item.brand.is_none());
        assert!(item.description.is_none());
        conn.execute_batch(
            "INSERT OR IGNORE INTO currencies (code, name, symbol) VALUES ('USD', 'Dollar', '$');
             INSERT INTO accounts (name, type, currency_code) VALUES ('Cash', 'cash', 'USD');
             INSERT INTO movements (account_id, type, amount, currency_code, date)
             VALUES (1, 'expense', 100, 'USD', '2026-01-01');",
        )?;
        conn.execute(
            "INSERT INTO purchases (movement_id, item_id, quantity, unit_price) VALUES (1, ?1, 1.5, 50)",
            [item.id],
        )?;
        let updated = edit_item(
            &mut conn,
            item.id,
            ItemEntry {
                name: "Whole milk".into(),
                brand: Some("Brand".into()),
                description: Some("One litre".into()),
            },
        )?;
        assert_eq!(updated.purchase_count, 1);
        assert_eq!(updated.brand.as_deref(), Some("Brand"));
        assert_eq!(updated.description.as_deref(), Some("One litre"));
        archive_item(&conn, item.id)?;
        archive_item(&conn, item.id)?;
        let items = list_items(&conn)?;
        assert_eq!(items.len(), 1);
        assert!(items[0].is_archived);
        assert_eq!(items[0].purchase_count, 1);
        let updated = edit_item(&mut conn, item.id, entry("Renamed archived item"))?;
        assert!(updated.is_archived);
        assert!(updated.brand.is_none());
        assert!(updated.description.is_none());
        Ok(())
    }

    #[test]
    fn invalid_item_inputs_and_missing_ids_return_errors() -> Result<(), AppError> {
        let mut conn = database()?;
        assert!(matches!(
            insert_item(&mut conn, entry(" \n")),
            Err(AppError::Validation(_))
        ));
        let item = insert_item(&mut conn, entry("Valid"))?;
        assert!(matches!(
            edit_item(&mut conn, item.id, entry("\t")),
            Err(AppError::Validation(_))
        ));
        assert!(matches!(
            edit_item(&mut conn, 99, entry("Missing")),
            Err(AppError::NotFound(_))
        ));
        assert!(matches!(
            archive_item(&conn, 99),
            Err(AppError::NotFound(_))
        ));
        assert_eq!(find_item(&conn, item.id)?.name, "Valid");
        Ok(())
    }

    #[test]
    fn shops_use_new_schema_and_validate_names() -> Result<(), AppError> {
        let mut conn = database()?;
        assert!(matches!(
            insert_shop(&mut conn, " \t".into(), None),
            Err(AppError::Validation(_))
        ));
        let shop = insert_shop(&mut conn, " Market ".into(), Some("Main Street".into()))?;
        assert_eq!(shop.name, "Market");
        assert_eq!(shop.address.as_deref(), Some("Main Street"));
        let online = insert_shop(&mut conn, "Online".into(), None)?;
        assert!(online.address.is_none());
        let shops = list_shops(&conn)?;
        assert_eq!(shops.len(), 2);
        assert_eq!(shops[0].id, shop.id);
        Ok(())
    }

    #[test]
    fn item_dto_contract_is_camel_case_and_numeric() -> Result<(), AppError> {
        let mut conn = database()?;
        let input: ItemEntry = serde_json::from_value(serde_json::json!({
            "name": "Food", "brand": null, "description": "Description"
        }))
        .map_err(|error| AppError::Internal(error.to_string()))?;
        let item = insert_item(&mut conn, input)?;
        let json =
            serde_json::to_value(item).map_err(|error| AppError::Internal(error.to_string()))?;
        assert_eq!(json["description"], "Description");
        assert_eq!(json["brand"], serde_json::Value::Null);
        assert_eq!(json["isArchived"], false);
        assert_eq!(json["purchaseCount"], 0);
        assert!(json["createdAt"].is_string());
        let config = ts_rs::Config::default();
        let declaration = Item::decl(&config);
        assert!(declaration.contains("purchaseCount: number"));
        assert!(!declaration.contains("bigint"));
        assert!(!Shop::decl(&config).contains("bigint"));
        Ok(())
    }
}
