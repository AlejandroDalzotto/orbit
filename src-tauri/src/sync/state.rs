use crate::models::sync::{PendingSyncData, SyncSession};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::sync::oneshot;

pub struct SyncServerState {
    pub sessions: Arc<Mutex<HashMap<String, SyncSession>>>,
    pub pending_data: Arc<Mutex<HashMap<String, PendingSyncData>>>,
    pub server_running: Arc<Mutex<bool>>,
    pub shutdown_tx: Arc<Mutex<Option<oneshot::Sender<()>>>>,
    pub port: u16,
    pub started_at: Arc<Mutex<Option<u64>>>,
}

impl SyncServerState {
    pub fn new(port: u16) -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            pending_data: Arc::new(Mutex::new(HashMap::new())),
            server_running: Arc::new(Mutex::new(false)),
            shutdown_tx: Arc::new(Mutex::new(None)),
            port,
            started_at: Arc::new(Mutex::new(None)),
        }
    }

    pub fn generate_pin() -> String {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        format!("{:06}", rng.gen_range(100000..999999))
    }

    pub fn generate_token(pin: &str) -> String {
        use sha2::{Digest, Sha256};
        let timestamp = chrono::Utc::now().timestamp_millis();
        let data = format!("{}-{}-{}", pin, timestamp, uuid::Uuid::new_v4());
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn validate_token(&self, token: &str) -> Option<SyncSession> {
        let sessions = self.sessions.lock().unwrap();
        let now = chrono::Utc::now().timestamp_millis() as u64;

        sessions
            .values()
            .find(|s| {
                s.token.as_ref() == Some(&token.to_string()) && s.is_active && s.expires_at > now
            })
            .cloned()
    }

    pub fn get_remaining_time(&self) -> Option<u64> {
        let started_at = self.started_at.lock().unwrap();
        if let Some(start) = *started_at {
            let now = chrono::Utc::now().timestamp_millis() as u64;
            let elapsed = now - start;
            let total_duration = 15 * 60 * 1000; // 15 minutos en ms

            if elapsed < total_duration {
                Some(total_duration - elapsed)
            } else {
                Some(0)
            }
        } else {
            None
        }
    }
}
