use crate::{models::sync::*, sync::state::SyncServerState};
use axum::{
    extract::{Json, State},
    http::{HeaderMap, StatusCode},
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tokio::time::{sleep, Duration};
use tower_http::cors::{Any, CorsLayer};

pub async fn start_sync_server(
    state: Arc<SyncServerState>,
) -> Result<(), Box<dyn std::error::Error>> {
    let app = Router::new()
        .route("/sync/ping", get(ping_handler))
        .route("/sync/auth", post(auth_handler))
        .route("/sync/data", post(data_handler))
        .route("/sync/status", get(status_handler))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(state.clone());

    let addr = format!("0.0.0.0:{}", state.port);
    println!("🚀 Sync server listening on {}", addr);

    *state.server_running.lock().unwrap() = true;

    let listener = tokio::net::TcpListener::bind(&addr).await?;

    // Crear canal para shutdown
    let (shutdown_tx, shutdown_rx) = tokio::sync::oneshot::channel::<()>();
    *state.shutdown_tx.lock().unwrap() = Some(shutdown_tx);

    // Spawn auto-shutdown timer (15 minutos)
    let state_auto_close = state.clone();
    tokio::spawn(async move {
        sleep(Duration::from_secs(15 * 60)).await;
        println!("⏰ Auto-closing sync server after 15 minutes");

        // Enviar señal de shutdown
        if let Some(tx) = state_auto_close.shutdown_tx.lock().unwrap().take() {
            let _ = tx.send(());
        }

        *state_auto_close.server_running.lock().unwrap() = false;
        state_auto_close.sessions.lock().unwrap().clear();
        state_auto_close.pending_data.lock().unwrap().clear();
    });

    // Iniciar servidor con graceful shutdown
    axum::serve(listener, app)
        .with_graceful_shutdown(async {
            shutdown_rx.await.ok();
            println!("🛑 Sync server shutting down gracefully...");
        })
        .await?;

    println!("✅ Sync server stopped");
    Ok(())
}

async fn ping_handler() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "service": "orbit-sync",
        "version": "1.0.0"
    }))
}

async fn auth_handler(
    State(state): State<Arc<SyncServerState>>,
    Json(payload): Json<SyncAuthRequest>,
) -> Result<Json<SyncAuthResponse>, StatusCode> {
    let mut sessions = state.sessions.lock().unwrap();

    let session = sessions
        .values_mut()
        .find(|s| s.pin == payload.pin && s.is_active);

    match session {
        Some(session) => {
            let now = chrono::Utc::now().timestamp_millis() as u64;

            if session.expires_at < now {
                session.is_active = false;
                return Ok(Json(SyncAuthResponse {
                    success: false,
                    token: None,
                    expires_in: None,
                    message: "PIN expired".to_string(),
                }));
            }

            if session.token.is_none() {
                let token = SyncServerState::generate_token(&session.pin);
                session.token = Some(token.clone());
                session.device_name = Some(payload.device_name);
            }

            let expires_in = (session.expires_at - now) / 1000;

            Ok(Json(SyncAuthResponse {
                success: true,
                token: session.token.clone(),
                expires_in: Some(expires_in),
                message: "Authentication successful".to_string(),
            }))
        }
        None => Ok(Json(SyncAuthResponse {
            success: false,
            token: None,
            expires_in: None,
            message: "Invalid PIN".to_string(),
        })),
    }
}

async fn data_handler(
    State(state): State<Arc<SyncServerState>>,
    headers: HeaderMap,
    Json(payload): Json<SyncDataPayload>,
) -> Result<Json<SyncDataResponse>, StatusCode> {
    let token = headers
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let _session = state
        .validate_token(token)
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let conflicts = validate_sync_data(&payload);

    let sync_id = uuid::Uuid::new_v4().to_string();
    let pending = PendingSyncData {
        id: sync_id.clone(),
        payload: payload.clone(),
        conflicts: conflicts.clone(),
        received_at: chrono::Utc::now().timestamp_millis() as u64,
        device_name: payload.device_name.clone(),
    };

    state.pending_data.lock().unwrap().insert(sync_id, pending);

    Ok(Json(SyncDataResponse {
        success: true,
        pending_approval: true,
        conflicts,
        message: "Data received, pending user approval".to_string(),
    }))
}

async fn status_handler(State(state): State<Arc<SyncServerState>>) -> Json<serde_json::Value> {
    let sessions = state.sessions.lock().unwrap();
    let pending = state.pending_data.lock().unwrap();

    Json(serde_json::json!({
        "active": *state.server_running.lock().unwrap(),
        "active_sessions": sessions.len(),
        "pending_data": pending.len(),
    }))
}

fn validate_sync_data(_payload: &SyncDataPayload) -> Vec<SyncConflict> {
    Vec::new()
}
