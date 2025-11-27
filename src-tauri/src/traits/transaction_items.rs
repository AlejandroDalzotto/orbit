use crate::{
    models::{
        items::{ItemsDB, PurchaseHistoryInfo},
        transaction::{Transaction, TransactionItemRef},
    },
    traits::database::Identifiable,
};

/// Trait para transacciones que contienen items
pub trait TransactionItems {
    /// Sincroniza los items de la transacción con la base de datos de items
    fn sync_items_to_db(&self, items_db: &mut ItemsDB) -> Result<(), String>;
}

impl TransactionItems for Transaction {
    fn sync_items_to_db(&self, items_db: &mut ItemsDB) -> Result<(), String> {
        // Solo procesar si tiene items (transacciones de tipo Shopping)
        let items = match &self.items {
            Some(items) => items,
            None => return Ok(()),
        };

        for item_ref in items {
            sync_single_item(item_ref, self, items_db)?;
        }

        Ok(())
    }
}

/// Sincroniza un item individual con la DB
fn sync_single_item(
    item_ref: &TransactionItemRef,
    transaction: &Transaction,
    items_db: &mut ItemsDB,
) -> Result<(), String> {
    match &item_ref.item_id {
        Some(id) => {
            // Item ya existe, actualizar historial
            if items_db.data.contains_key(id) {
                if let Some(price) = item_ref.price {
                    let mut purchase = PurchaseHistoryInfo {
                        id: String::new(),
                        date: transaction.date,
                        price: price as f32,
                        transaction_name: transaction.details.clone(),
                        quantity: item_ref.quantity.unwrap_or(1),
                    };
                    purchase.generate_id();

                    items_db.add_purchase_to_item(id, purchase)?;
                }
            }
        }
        None => {
            // Item nuevo, crear en la DB
            let now = chrono::Utc::now().timestamp_millis() as u64;
            let mut new_item = crate::models::items::Item {
                id: uuid::Uuid::new_v4().to_string(),
                name: item_ref.name.clone(),
                brand: None,
                has_warranty: None,
                purchase_history: Vec::new(),
                is_spending_leak: Some(false),
                spend_money_limit: None,
                spend_amount_limit: None,
                has_exceeded_spend_money_limit: None,
                leak_date_range: None,
                created_at: now,
                updated_at: now,
            };

            // Añadir al historial si hay precio
            if let Some(price) = item_ref.price {
                let mut purchase = PurchaseHistoryInfo {
                    id: String::new(),
                    date: transaction.date,
                    price: price as f32,
                    transaction_name: transaction.details.clone(),
                    quantity: item_ref.quantity.unwrap_or(1),
                };
                purchase.generate_id();
                dbg!(&purchase);
                new_item.add_purchase(purchase);
            }

            items_db.data.insert(new_item.id.clone(), new_item);
        }
    }

    Ok(())
}
