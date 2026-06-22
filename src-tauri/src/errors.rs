#[derive(Debug, thiserror::Error)]
pub enum OrbitError {
    #[error("Error en la base de datos: {0}")]
    Database(#[from] rusqlite::Error),

    #[error("Validación fallida: {0}")]
    ValidationError(String),

    #[error("Registro no encontrado: {0}")]
    NotFound(String),
}

// Convertimos el error en String al serializar para que Tauri lo maneje en el frontend
impl serde::Serialize for OrbitError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
