use crate::models::{
    enums::LeakDateRange,
    items::{Item, ItemLimitWarning, LimitType, PurchaseHistoryInfo},
};

/// Trait para items que pueden tener límites de gasto
pub trait ItemLimits {
    /// Verifica si el item excede sus límites dado un nuevo gasto
    fn check_limits(&self, new_quantity: u32, new_price: f64) -> Vec<ItemLimitWarning>;
}

impl ItemLimits for Item {
    fn check_limits(&self, new_quantity: u32, new_price: f64) -> Vec<ItemLimitWarning> {
        let mut warnings = Vec::new();

        // Solo verificar si es gasto hormiga
        if !self.is_spending_leak() {
            return warnings;
        }

        let date_range = self.get_leak_date_range();
        let transaction_total = new_quantity as f32 * new_price as f32;

        // Verificar límite de dinero
        if let Some(money_limit) = self.spend_money_limit {
            let current_spending = calculate_current_spending(
                date_range.clone(),
                &self.purchase_history,
                transaction_total,
            );

            if current_spending > money_limit as f32 {
                warnings.push(ItemLimitWarning {
                    item_id: self.id.clone(),
                    item_name: self.name.clone(),
                    limit_type: LimitType::Money,
                    limit: money_limit as f32,
                    current: current_spending,
                    exceeded: current_spending - money_limit as f32,
                });
            }
        }

        // Verificar límite de cantidad
        if let Some(quantity_limit) = self.spend_amount_limit {
            let current_quantity =
                calculate_current_quantity(date_range, &self.purchase_history, new_quantity);

            if current_quantity > quantity_limit {
                warnings.push(ItemLimitWarning {
                    item_id: self.id.clone(),
                    item_name: self.name.clone(),
                    limit_type: LimitType::Quantity,
                    limit: quantity_limit as f32,
                    current: current_quantity as f32,
                    exceeded: (current_quantity - quantity_limit) as f32,
                });
            }
        }

        warnings
    }
}

/// Calcula el gasto actual en un rango de fechas
pub fn calculate_current_spending(
    range: LeakDateRange,
    purchase_history: &[PurchaseHistoryInfo],
    new_amount: f32,
) -> f32 {
    if purchase_history.is_empty() {
        return new_amount;
    }

    let last_date = purchase_history.last().unwrap().date;
    let range_edge = get_range_edge(last_date, range);

    let current_total: f32 = purchase_history
        .iter()
        .filter(|p| p.date >= range_edge)
        .map(|p| p.price)
        .sum();

    current_total + new_amount
}

/// Calcula la cantidad actual en un rango de fechas
pub fn calculate_current_quantity(
    range: LeakDateRange,
    purchase_history: &[PurchaseHistoryInfo],
    new_quantity: u32,
) -> u32 {
    if purchase_history.is_empty() {
        return new_quantity;
    }

    let last_date = purchase_history.last().unwrap().date;
    let range_edge = get_range_edge(last_date, range);

    let current_total: u32 = purchase_history
        .iter()
        .filter(|p| p.date >= range_edge)
        .map(|p| p.quantity)
        .sum();

    current_total + new_quantity
}

/// Helper para calcular el borde del rango de fechas
fn get_range_edge(last_date: u64, range: LeakDateRange) -> u64 {
    match range {
        LeakDateRange::Week => last_date.saturating_sub(7 * 24 * 60 * 60 * 1000),
        LeakDateRange::Month => last_date.saturating_sub(30 * 24 * 60 * 60 * 1000),
        LeakDateRange::Year => last_date.saturating_sub(365 * 24 * 60 * 60 * 1000),
    }
}
