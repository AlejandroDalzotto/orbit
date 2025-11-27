use crate::{
    models::{
        items::{
            Item, ItemLimitWarning, ItemsDB, RequestCreateItem, RequestEditItem,
            RequestIsSpendingLeak,
        },
        transaction::TransactionItemRef,
    },
    traits::{database::DatabaseOperations, item_limit::ItemLimits},
};

#[tauri::command]
pub async fn list_items(app: tauri::AppHandle) -> Result<Vec<Item>, String> {
    let db = ItemsDB::read(&app)?;
    Ok(db.get_all_sorted())
}

#[tauri::command]
pub async fn get_item_by_id(id: String, app: tauri::AppHandle) -> Result<Item, String> {
    let db = ItemsDB::read(&app)?;
    db.data
        .get(&id)
        .cloned()
        .ok_or_else(|| "Item not found".to_string())
}

#[tauri::command]
pub async fn add_item(entry: RequestCreateItem, app: tauri::AppHandle) -> Result<Item, String> {
    let mut db = ItemsDB::read(&app)?;
    let item = db.add_item(entry);
    db.write(&app)?;
    Ok(item)
}

#[tauri::command]
pub async fn edit_item(
    id: String,
    new_values: RequestEditItem,
    app: tauri::AppHandle,
) -> Result<Item, String> {
    let mut db = ItemsDB::read(&app)?;
    let item = db.edit_item(&id, new_values)?;
    db.write(&app)?;
    Ok(item)
}

#[tauri::command]
pub async fn edit_is_spending_leak(
    values: RequestIsSpendingLeak,
    app: tauri::AppHandle,
) -> Result<Item, String> {
    let mut db = ItemsDB::read(&app)?;
    let item = db.update_spending_leak(values)?;
    db.write(&app)?;
    Ok(item)
}

#[tauri::command]
pub async fn delete_item(id: String, app: tauri::AppHandle) -> Result<Item, String> {
    let mut db = ItemsDB::read(&app)?;
    let item = db.remove_item(&id)?;
    db.write(&app)?;
    Ok(item)
}

#[tauri::command]
pub fn check_items_limits(
    items: Vec<TransactionItemRef>,
    app: tauri::AppHandle,
) -> Result<Vec<ItemLimitWarning>, String> {
    let db = ItemsDB::read(&app)?;
    let mut warnings = Vec::new();

    for transaction_item in items {
        if let Some(id) = &transaction_item.item_id {
            let item = db
                .data
                .get(id)
                .ok_or_else(|| format!("Item with id '{}' not found", id))?;

            let item_warnings = item.check_limits(
                transaction_item.quantity.unwrap_or(1),
                transaction_item.price.unwrap_or(0.0),
            );

            warnings.extend(item_warnings);
        }
    }

    Ok(warnings)
}
