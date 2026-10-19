use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Deserialize, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Pagination {
    #[serde(default = "default_limit")]
    pub limit: u8,
    #[serde(default)]
    pub offset: u32,
}

fn default_limit() -> u8 {
    50
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            limit: default_limit(),
            offset: 0,
        }
    }
}

#[derive(Debug, Deserialize, Serialize, TS)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[ts(export)]
pub enum SortDirection {
    Asc,
    Desc,
}

impl SortDirection {
    pub fn as_sql(&self) -> &'static str {
        match self {
            SortDirection::Asc => "ASC",
            SortDirection::Desc => "DESC",
        }
    }
}

/// Cada recurso filtrable define su propio enum de campos ordenables
/// e implementa esto. La conversión a nombre de columna SQL vive
/// solo acá — el string crudo del frontend nunca llega a un ORDER BY.
pub trait SortColumn {
    fn column(&self) -> &'static str;
}
