// src/models/sync.rs
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use crate::models::transaction::Transaction;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SyncSession {
    pub pin: String,
    pub token: Option<String>,
    pub created_at: u64,
    pub expires_at: u64,
    pub is_active: bool,
    pub device_name: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SyncAuthRequest {
    pub pin: String,
    pub device_name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SyncAuthResponse {
    pub success: bool,
    pub token: Option<String>,
    pub expires_in: Option<u64>, // segundos
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SyncDataPayload {
    pub transactions: Vec<Transaction>,
    pub device_name: String,
    pub timestamp: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SyncDataResponse {
    pub success: bool,
    pub pending_approval: bool,
    pub conflicts: Vec<SyncConflict>,
    pub message: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SyncConflict {
    pub conflict_type: ConflictType,
    pub transaction_id: String,
    pub description: String,
    pub suggestion: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum ConflictType {
    InsufficientBalance {
        account_id: String,
        account_name: String,
        current_balance: f64,
        required: f64,
    },
    UnknownItem {
        item_name: String,
        suggested_matches: Vec<ItemMatch>,
    },
    DuplicateTransaction,
    InvalidAccount,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ItemMatch {
    pub item_id: String,
    pub name: String,
    pub brand: Option<String>,
    pub similarity_score: f32, // 0.0 - 1.0
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PendingSyncData {
    pub id: String,
    pub payload: SyncDataPayload,
    pub conflicts: Vec<SyncConflict>,
    pub received_at: u64,
    pub device_name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SyncApprovalRequest {
    pub sync_id: String,
    pub approved: bool,
    pub conflict_resolutions: HashMap<String, ConflictResolution>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub enum ConflictResolution {
    SkipTransaction,
    AdjustAmount { new_amount: f64 },
    MapItem { item_id: String },
    CreateNewItem,
}
