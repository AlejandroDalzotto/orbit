use crate::{
    models::{items::ItemsDB, sync::*, transaction::Transaction, wallet::WalletDB},
    traits::database::DatabaseOperations,
};

pub struct SyncValidator {
    wallet_db: WalletDB,
    items_db: ItemsDB,
}

impl SyncValidator {
    pub fn new(app: &tauri::AppHandle) -> Result<Self, String> {
        Ok(Self {
            wallet_db: WalletDB::read(app)?,
            items_db: ItemsDB::read(app)?,
        })
    }

    pub fn validate_transactions(&self, transactions: &[Transaction]) -> Vec<SyncConflict> {
        let mut conflicts = Vec::new();

        for tx in transactions {
            // Validar balance
            if let Some(conflict) = self.check_balance_conflict(tx) {
                conflicts.push(conflict);
            }

            // Validar items
            if let Some(items_conflicts) = self.check_items_conflicts(tx) {
                conflicts.extend(items_conflicts);
            }
        }

        conflicts
    }

    fn check_balance_conflict(&self, tx: &Transaction) -> Option<SyncConflict> {
        if !tx.affects_balance || tx.is_income() {
            return None;
        }

        let account = self.wallet_db.accounts.get(&tx.account_id)?;

        if tx.amount > account.balance {
            Some(SyncConflict {
                conflict_type: ConflictType::InsufficientBalance {
                    account_id: account.id.clone(),
                    account_name: account.name.clone(),
                    current_balance: account.balance,
                    required: tx.amount,
                },
                transaction_id: tx.id.clone(),
                description: format!(
                    "Transaction amount ${:.2} exceeds account '{}' balance ${:.2}",
                    tx.amount, account.name, account.balance
                ),
                suggestion: Some(format!(
                    "Reduce amount to ${:.2} or select a different account",
                    account.balance
                )),
            })
        } else {
            None
        }
    }

    fn check_items_conflicts(&self, tx: &Transaction) -> Option<Vec<SyncConflict>> {
        let items = tx.items.as_ref()?;
        let mut conflicts = Vec::new();

        for item_ref in items {
            // Si no tiene item_id, intentar encontrar coincidencias
            if item_ref.item_id.is_none() {
                let matches = self.find_similar_items(&item_ref.name);

                if !matches.is_empty() {
                    conflicts.push(SyncConflict {
                        conflict_type: ConflictType::UnknownItem {
                            item_name: item_ref.name.clone(),
                            suggested_matches: matches,
                        },
                        transaction_id: tx.id.clone(),
                        description: format!(
                            "Item '{}' not found in database. Possible matches found.",
                            item_ref.name
                        ),
                        suggestion: Some("Map to existing item or create new one".to_string()),
                    });
                }
            }
        }

        if conflicts.is_empty() {
            None
        } else {
            Some(conflicts)
        }
    }

    fn find_similar_items(&self, name: &str) -> Vec<ItemMatch> {
        let name_lower = name.to_lowercase();
        let mut matches = Vec::new();

        for item in self.items_db.data.values() {
            let similarity = calculate_similarity(&name_lower, &item.name.to_lowercase());

            if similarity > 0.6 {
                matches.push(ItemMatch {
                    item_id: item.id.clone(),
                    name: item.name.clone(),
                    brand: item.brand.clone(),
                    similarity_score: similarity,
                });
            }
        }

        matches.sort_by(|a, b| {
            b.similarity_score
                .partial_cmp(&a.similarity_score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        matches.truncate(5); // Top 5 matches
        matches
    }
}

// Algoritmo de similitud de Levenshtein simplificado
fn calculate_similarity(s1: &str, s2: &str) -> f32 {
    let len1 = s1.len();
    let len2 = s2.len();

    if len1 == 0 {
        return if len2 == 0 { 1.0 } else { 0.0 };
    }

    let mut matrix = vec![vec![0; len2 + 1]; len1 + 1];

    for i in 0..=len1 {
        matrix[i][0] = i;
    }
    for j in 0..=len2 {
        matrix[0][j] = j;
    }

    for (i, c1) in s1.chars().enumerate() {
        for (j, c2) in s2.chars().enumerate() {
            let cost = if c1 == c2 { 0 } else { 1 };
            matrix[i + 1][j + 1] = *[
                matrix[i][j + 1] + 1,
                matrix[i + 1][j] + 1,
                matrix[i][j] + cost,
            ]
            .iter()
            .min()
            .unwrap();
        }
    }

    let distance = matrix[len1][len2];
    let max_len = len1.max(len2);
    1.0 - (distance as f32 / max_len as f32)
}
