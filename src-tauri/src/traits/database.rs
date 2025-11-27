use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::Manager;

use crate::utils::atomic_write;

/// Trait for entities that can be persisted
pub trait Persistable: Serialize + for<'de> Deserialize<'de> {
    /// File name where it is persisted (e.g., "wallet.json")
    fn filename() -> &'static str;

    /// Create an empty/default instance
    fn empty() -> Self;
}

/// Trait for basic CRUD operations
pub trait DatabaseOperations: Persistable + Sized {
    /// Read the DB from the file
    fn read(app: &tauri::AppHandle) -> Result<Self, String> {
        let file_path = Self::get_file_path(app)?;

        if !file_path.exists() {
            return Ok(Self::empty());
        }

        let content = std::fs::read_to_string(&file_path)
            .map_err(|e| format!("Failed to read {}: {}", Self::filename(), e))?;

        serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse {}: {}", Self::filename(), e))
    }

    /// Write the DB to the file
    fn write(&self, app: &tauri::AppHandle) -> Result<(), String> {
        let file_path = Self::get_file_path(app)?;

        let content = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize {}: {}", Self::filename(), e))?;

        atomic_write(&file_path, &content)
            .map_err(|e| format!("Failed to write {}: {}", Self::filename(), e))?;

        Ok(())
    }

    /// Helper for getting the file path
    fn get_file_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
        let data_dir = app
            .path()
            .app_local_data_dir()
            .map_err(|e| format!("Could not get app data dir: {}", e))?;

        Ok(data_dir.join(Self::filename()))
    }
}

/// Trait for entities that have timestamps
pub trait Timestamped {
    fn created_at(&self) -> u64;
    fn updated_at(&self) -> u64;
    fn set_updated_at(&mut self, timestamp: u64);

    fn update_timestamp(&mut self) {
        self.set_updated_at(chrono::Utc::now().timestamp_millis() as u64);
    }
}

/// Trait for entities that have an ID
pub trait Identifiable {
    fn id(&self) -> &str;
    fn set_id(&mut self, id: String);

    fn generate_id(&mut self) {
        self.set_id(uuid::Uuid::new_v4().to_string());
    }
}
