use rusqlite::params;
use serde::{Deserialize, Serialize};

use crate::movements::{Currency, Movement, MovementType, RateType};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Group {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
}

/// Group returned with its associated movements embedded.
/// Used by the frontend to avoid a separate fetch per group.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GroupWithMovements {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub created_at: String,
    pub movements: Vec<Movement>,
}

#[derive(Debug, Deserialize)]
pub struct AddGroup {
    pub name: String,
    pub description: Option<String>,
    /// IDs of movements to associate with the group on creation.
    pub movement_ids: Vec<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateGroup {
    pub name: String,
    pub description: Option<String>,
    pub movement_ids: Vec<i64>,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Map a rusqlite Row to a Movement. Shared by get_groups and any future
/// command that needs to hydrate movements from a query.
fn row_to_movement(row: &rusqlite::Row) -> rusqlite::Result<Movement> {
    Ok(Movement {
        id: row.get::<_, i64>(0)?,
        details: row.get::<_, String>(1)?,
        date: row.get::<_, String>(2)?,
        created_at: row.get::<_, String>(3)?,
        mov_type: match row.get::<_, String>(4)?.as_str() {
            "income" => MovementType::Income,
            "expense" => MovementType::Expense,
            "transfer" => MovementType::Transfer,
            _ => MovementType::Expense,
        },
        currency: match row.get::<_, String>(5)?.as_str() {
            "USD" => Currency::USD,
            _ => Currency::ARS,
        },
        original_amount: row.get::<_, i64>(6)?,
        ars_amount: row.get::<_, i64>(7)?,
        exchange_rate: row.get::<_, Option<i64>>(8)?,
        rate_type: match row.get::<_, Option<String>>(9)? {
            Some(rt) => Some(match rt.as_str() {
                "blue" => RateType::Blue,
                "oficial" => RateType::Oficial,
                "mep" => RateType::Mep,
                "ccl" => RateType::Ccl,
                "cripto" => RateType::Cripto,
                _ => RateType::Blue,
            }),
            None => None,
        },
        account_id: row.get::<_, i64>(10)?,
        category_id: row.get::<_, Option<i64>>(11)?,
    })
}

/// Fetch all movements associated with a group by group_id.
fn fetch_movements_for_group(conn: &rusqlite::Connection, group_id: i64) -> Vec<Movement> {
    let mut stmt = conn
        .prepare(
            "SELECT m.id, m.details, m.date, m.created_at, m.mov_type, m.currency,
                    m.original_amount, m.ars_amount, m.exchange_rate, m.rate_type,
                    m.account_id, m.category_id
             FROM movements m
             INNER JOIN movements_groups mg ON mg.mov_id = m.id
             WHERE mg.group_id = ?1
             ORDER BY m.date DESC",
        )
        .unwrap();

    stmt.query_map(params![group_id], |row| row_to_movement(row))
        .unwrap()
        .map(|r| r.unwrap())
        .collect()
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_groups(state: tauri::State<crate::AppState>) -> Vec<GroupWithMovements> {
    let conn = state.conn.lock().unwrap();

    let groups: Vec<Group> = {
        let mut stmt = conn
            .prepare(
                "SELECT id, name, description, created_at FROM groups ORDER BY created_at DESC",
            )
            .unwrap();

        stmt.query_map([], |row| {
            Ok(Group {
                id: row.get::<_, i64>(0)?,
                name: row.get::<_, String>(1)?,
                description: row.get::<_, Option<String>>(2)?,
                created_at: row.get::<_, String>(3)?,
            })
        })
        .unwrap()
        .map(|r| r.unwrap())
        .collect()
    };

    groups
        .into_iter()
        .map(|g| {
            let movements = fetch_movements_for_group(&conn, g.id);
            GroupWithMovements {
                id: g.id,
                name: g.name,
                description: g.description,
                created_at: g.created_at,
                movements,
            }
        })
        .collect()
}

#[tauri::command]
pub fn add_group(state: tauri::State<crate::AppState>, group: AddGroup) -> GroupWithMovements {
    let conn = state.conn.lock().unwrap();

    conn.execute(
        "INSERT INTO groups (name, description) VALUES (?1, ?2)",
        params![group.name, group.description],
    )
    .unwrap();

    let group_id = conn.last_insert_rowid();

    // Asociar movimientos si se pasaron IDs
    for mov_id in &group.movement_ids {
        conn.execute(
            "INSERT INTO movements_groups (mov_id, group_id) VALUES (?1, ?2)",
            params![mov_id, group_id],
        )
        .unwrap();
    }

    let created_at = conn
        .query_row(
            "SELECT created_at FROM groups WHERE id = ?1",
            params![group_id],
            |row| row.get::<_, String>(0),
        )
        .unwrap();

    let movements = fetch_movements_for_group(&conn, group_id);

    GroupWithMovements {
        id: group_id,
        name: group.name,
        description: group.description,
        created_at,
        movements,
    }
}

#[tauri::command]
pub fn update_group(
    state: tauri::State<crate::AppState>,
    id: i64,
    group: UpdateGroup,
) -> GroupWithMovements {
    let conn = state.conn.lock().unwrap();

    conn.execute(
        "UPDATE groups SET name = ?1, description = ?2 WHERE id = ?3",
        params![group.name, group.description, id],
    )
    .unwrap();

    // Delete + re-insert de relaciones
    conn.execute(
        "DELETE FROM movements_groups WHERE group_id = ?1",
        params![id],
    )
    .unwrap();

    for mov_id in &group.movement_ids {
        conn.execute(
            "INSERT INTO movements_groups (mov_id, group_id) VALUES (?1, ?2)",
            params![mov_id, id],
        )
        .unwrap();
    }

    let created_at = conn
        .query_row(
            "SELECT created_at FROM groups WHERE id = ?1",
            params![id],
            |row| row.get::<_, String>(0),
        )
        .unwrap();

    let movements = fetch_movements_for_group(&conn, id);

    GroupWithMovements {
        id,
        name: group.name,
        description: group.description,
        created_at,
        movements,
    }
}

#[tauri::command]
pub fn delete_group(state: tauri::State<crate::AppState>, id: i64) {
    let conn = state.conn.lock().unwrap();

    // movements_groups se limpia automáticamente por ON DELETE CASCADE
    conn.execute("DELETE FROM groups WHERE id = ?1", params![id])
        .unwrap();
}
