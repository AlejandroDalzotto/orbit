use crate::models::enums::LeakDateRange;
use crate::traits::database::{DatabaseOperations, Identifiable, Persistable, Timestamped};
use crate::utils;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PurchaseHistoryInfo {
    pub id: String,
    pub price: f32,
    pub date: u64,
    pub transaction_name: String,
    pub quantity: u32,
}

impl Identifiable for PurchaseHistoryInfo {
    fn id(&self) -> &str {
        &self.id
    }

    fn set_id(&mut self, id: String) {
        self.id = id;
    }

    fn generate_id(&mut self) {
        self.set_id(utils::random_string(14));
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Item {
    pub id: String,
    pub name: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub brand: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_warranty: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_spending_leak: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub has_exceeded_spend_money_limit: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spend_money_limit: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spend_amount_limit: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub leak_date_range: Option<LeakDateRange>,

    pub purchase_history: Vec<PurchaseHistoryInfo>,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Identifiable for Item {
    fn id(&self) -> &str {
        &self.id
    }

    fn set_id(&mut self, id: String) {
        self.id = id;
    }
}

impl Timestamped for Item {
    fn created_at(&self) -> u64 {
        self.created_at
    }

    fn updated_at(&self) -> u64 {
        self.updated_at
    }

    fn set_updated_at(&mut self, timestamp: u64) {
        self.updated_at = timestamp;
    }
}

impl Item {
    /// Añade una entrada al historial de compras
    pub fn add_purchase(&mut self, info: PurchaseHistoryInfo) {
        self.purchase_history.push(info);
        self.update_timestamp();
    }

    /// Verifica si el item es un gasto hormiga
    pub fn is_spending_leak(&self) -> bool {
        self.is_spending_leak.unwrap_or(false)
    }

    /// Obtiene el rango de fecha para el límite, por defecto es Month
    pub fn get_leak_date_range(&self) -> LeakDateRange {
        self.leak_date_range.clone().unwrap_or(LeakDateRange::Month)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestCreateItem {
    pub name: String,
    #[serde(default)]
    pub brand: Option<String>,
    #[serde(default)]
    pub has_warranty: Option<bool>,
}

impl RequestCreateItem {
    pub fn into_item(self) -> Item {
        let now = chrono::Utc::now().timestamp_millis() as u64;
        let mut item = Item {
            id: String::new(),
            name: self.name,
            brand: self.brand,
            has_warranty: self.has_warranty,
            purchase_history: Vec::new(),
            is_spending_leak: Some(false),
            spend_money_limit: None,
            spend_amount_limit: None,
            has_exceeded_spend_money_limit: None,
            leak_date_range: None,
            created_at: now,
            updated_at: now,
        };
        item.generate_id();
        item
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestEditItem {
    pub name: Option<String>,
    pub brand: Option<String>,
    pub has_warranty: Option<bool>,
}

impl RequestEditItem {
    pub fn apply_to(&self, item: &mut Item) {
        if let Some(name) = &self.name {
            item.name = name.clone();
        }
        if let Some(brand) = &self.brand {
            item.brand = Some(brand.clone());
        }
        if let Some(has_warranty) = self.has_warranty {
            item.has_warranty = Some(has_warranty);
        }
        item.update_timestamp();
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestIsSpendingLeak {
    pub item_id: String,
    pub is_spending_leak: bool,
    pub spend_money_limit: Option<u32>,
    pub spend_amount_limit: Option<u32>,
    pub leak_date_range: Option<LeakDateRange>,
}

impl RequestIsSpendingLeak {
    pub fn apply_to(&self, item: &mut Item) {
        item.is_spending_leak = Some(self.is_spending_leak);
        item.spend_money_limit = self.spend_money_limit;
        item.spend_amount_limit = self.spend_amount_limit;
        item.leak_date_range = self.leak_date_range.clone();
        item.update_timestamp();
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ItemLimitWarning {
    pub item_id: String,
    pub item_name: String,
    pub limit_type: LimitType,
    pub limit: f32,
    pub current: f32,
    pub exceeded: f32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum LimitType {
    Money,
    Quantity,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ItemsDB {
    pub data: HashMap<String, Item>,
}

impl Persistable for ItemsDB {
    fn filename() -> &'static str {
        "items.json"
    }

    fn empty() -> Self {
        Self {
            data: HashMap::new(),
        }
    }
}

impl DatabaseOperations for ItemsDB {}

impl ItemsDB {
    pub fn new() -> Self {
        Self::empty()
    }

    /// Añade un item a la base de datos
    pub fn add_item(&mut self, request: RequestCreateItem) -> Item {
        let item = request.into_item();
        self.data.insert(item.id.clone(), item.clone());
        item
    }

    /// Elimina un item de la base de datos
    pub fn remove_item(&mut self, id: &str) -> Result<Item, String> {
        self.data
            .remove(id)
            .ok_or_else(|| "Item not found".to_string())
    }

    /// Edita un item existente
    pub fn edit_item(&mut self, id: &str, edit: RequestEditItem) -> Result<Item, String> {
        let item = self
            .data
            .get_mut(id)
            .ok_or_else(|| "Item not found".to_string())?;

        edit.apply_to(item);
        Ok(item.clone())
    }

    /// Actualiza la configuración de gasto hormiga de un item
    pub fn update_spending_leak(&mut self, request: RequestIsSpendingLeak) -> Result<Item, String> {
        let item = self
            .data
            .get_mut(&request.item_id)
            .ok_or_else(|| "Item not found".to_string())?;

        request.apply_to(item);
        Ok(item.clone())
    }

    /// Obtiene todos los items ordenados por nombre
    pub fn get_all_sorted(&self) -> Vec<Item> {
        let mut items: Vec<Item> = self.data.values().cloned().collect();
        items.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
        items
    }

    /// Añade una compra al historial de un item
    pub fn add_purchase_to_item(
        &mut self,
        item_id: &str,
        purchase: PurchaseHistoryInfo,
    ) -> Result<(), String> {
        let item = self
            .data
            .get_mut(item_id)
            .ok_or_else(|| format!("Item with id '{}' not found", item_id))?;

        item.add_purchase(purchase);
        Ok(())
    }
}
