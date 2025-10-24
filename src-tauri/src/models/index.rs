use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PaginationResult<T> {
    pub items: Vec<T>,
    pub total: usize,
    pub page: usize,
    pub limit: usize,
    pub total_pages: usize,
    pub has_next: bool,
    pub has_previous: bool,
}

impl<T> PaginationResult<T> {
    pub fn from(items: Vec<T>, limit: usize, offset: usize) -> Self {
        let total = items.len();

        // Calculate pagination
        let page = (offset / limit) + 1;
        let total_pages = (total as f64 / limit as f64).ceil() as usize;

        // Slice the data
        let items: Vec<T> = items.into_iter().skip(offset).take(limit).collect();

        PaginationResult {
            items,
            total,
            page,
            limit,
            total_pages,
            has_next: offset + limit < total,
            has_previous: offset > 0,
        }
    }

    pub fn new() -> Self {
      PaginationResult {
        items: Vec::new(),
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0,
        has_next: false,
        has_previous: false,
      }
    }
}
