use rusqlite::Error as SqliteError;
use serde::Serialize;
use ts_rs::TS;

/// Error interno de la aplicación. Nunca se serializa directamente:
/// el frontend solo ve el resultado de `user_message()`, vía `ErrorPayload`.
/// El `Display` (inglés, técnico) es solo para logs de desarrollo.
#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    Validation(String),
    Constraint(String),
    Database(String),
    Internal(String),
}

impl AppError {
    fn user_message(&self) -> String {
        match self {
            AppError::NotFound(msg) => msg.clone(),
            AppError::Validation(msg) => msg.clone(),
            AppError::Constraint(_) => {
                "No se puede completar la acción porque hay datos relacionados o inválidos.".into()
            }
            AppError::Database(_) => {
                "Ocurrió un error al acceder a la base de datos. Intentá de nuevo.".into()
            }
            AppError::Internal(_) => "Ocurrió un error inesperado.".into(),
        }
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::NotFound(m) => write!(f, "not found: {m}"),
            AppError::Validation(m) => write!(f, "validation error: {m}"),
            AppError::Constraint(m) => write!(f, "constraint violation: {m}"),
            AppError::Database(m) => write!(f, "database error: {m}"),
            AppError::Internal(m) => write!(f, "internal error: {m}"),
        }
    }
}

// El único punto donde AppError se convierte en algo que viaja al frontend.
// Solo expone user_message(); el detalle técnico queda en el log de eprintln!.
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        #[derive(Serialize)]
        struct ErrorPayload {
            message: String,
        }
        ErrorPayload {
            message: self.user_message(),
        }
        .serialize(serializer)
    }
}

// Forma que ts-rs exporta para que el frontend tipe el error correctamente.
#[derive(Serialize, TS)]
#[ts(export)]
pub struct ErrorPayload {
    pub message: String,
}

impl From<SqliteError> for AppError {
    fn from(err: SqliteError) -> Self {
        if let SqliteError::SqliteFailure(ffi_err, _) = &err {
            if ffi_err.code == rusqlite::ErrorCode::ConstraintViolation {
                eprintln!("[db constraint] {err}");
                return AppError::Constraint(err.to_string());
            }
        }
        eprintln!("[db error] {err}");
        AppError::Database(err.to_string())
    }
}
