use crate::{models::sync::*, sync::state::SyncServerState};
use std::collections::HashMap;
use std::sync::Arc;
use tauri::{Manager, State};

#[tauri::command]
pub async fn start_sync_server(app: tauri::AppHandle, port: Option<u16>) -> Result<String, String> {
    let port = port.unwrap_or(8080);
    let state = Arc::new(SyncServerState::new(port));

    let pin = SyncServerState::generate_pin();
    let now = chrono::Utc::now().timestamp_millis() as u64;
    let expires_at = now + (10 * 60 * 1000); // 10 minutos para token

    let session = SyncSession {
        pin: pin.clone(),
        token: None,
        created_at: now,
        expires_at,
        is_active: true,
        device_name: None,
    };

    state.sessions.lock().unwrap().insert(pin.clone(), session);
    *state.started_at.lock().unwrap() = Some(now);

    app.manage(state.clone());

    let state_clone = state.clone();
    tokio::spawn(async move {
        if let Err(e) = crate::sync::server::start_sync_server(state_clone).await {
            eprintln!("Sync server error: {}", e);
        }
    });

    let local_ip = get_local_ip().unwrap_or_else(|_| "localhost".to_string());

    Ok(serde_json::json!({
        "pin": pin,
        "url": format!("http://{}:{}", local_ip, port),
        "expires_in": 600, // 10 minutos en segundos
        "auto_close_in": 900, // 15 minutos en segundos
    })
    .to_string())
}

#[tauri::command]
pub async fn stop_sync_server(state: State<'_, Arc<SyncServerState>>) -> Result<(), String> {
    // Enviar señal de shutdown al servidor
    if let Some(tx) = state.shutdown_tx.lock().unwrap().take() {
        tx.send(()).map_err(|_| "Failed to send shutdown signal")?;
    }

    *state.server_running.lock().unwrap() = false;
    state.sessions.lock().unwrap().clear();
    state.pending_data.lock().unwrap().clear();
    *state.started_at.lock().unwrap() = None;

    Ok(())
}

#[tauri::command]
pub async fn get_sync_remaining_time(
    state: State<'_, Arc<SyncServerState>>,
) -> Result<u64, String> {
    state
        .get_remaining_time()
        .ok_or_else(|| "Server not running".to_string())
}

#[tauri::command]
pub async fn get_pending_sync_data(
    state: State<'_, Arc<SyncServerState>>,
) -> Result<Vec<PendingSyncData>, String> {
    let pending = state.pending_data.lock().unwrap();
    Ok(pending.values().cloned().collect())
}

#[tauri::command]
pub async fn approve_sync_data(
    sync_id: String,
    approved: bool,
    resolutions: HashMap<String, ConflictResolution>,
    _app: tauri::AppHandle,
    state: State<'_, Arc<SyncServerState>>,
) -> Result<(), String> {
    let mut pending = state.pending_data.lock().unwrap();

    let _sync_data = pending.remove(&sync_id).ok_or("Sync data not found")?;

    if !approved {
        return Ok(());
    }

    // todo: process all transactions here

    Ok(())
}

#[tauri::command]
pub async fn get_sync_status(
    state: State<'_, Arc<SyncServerState>>,
) -> Result<serde_json::Value, String> {
    let sessions = state.sessions.lock().unwrap();
    let pending = state.pending_data.lock().unwrap();
    let running = *state.server_running.lock().unwrap();

    Ok(serde_json::json!({
        "running": running,
        "active_sessions": sessions.len(),
        "pending_approvals": pending.len(),
        "port": state.port,
    }))
}

fn get_local_ip() -> Result<String, std::io::Error> {
    use std::net::UdpSocket;

    let socket = UdpSocket::bind("0.0.0.0:0")?;
    socket.connect("8.8.8.8:80")?;
    let addr = socket.local_addr()?;
    Ok(addr.ip().to_string())
}
