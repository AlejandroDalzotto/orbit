//! Connection setup and atomic schema upgrades.
//!
//! Call `initialize(&mut conn)?` for every newly opened connection, before sharing
//! it with commands. Errors must abort startup. Version 1 accepts an empty database
//! or the unversioned current schema, never `old_schema.sql`: snapshots, ambiguous
//! transfers and historical currency conversions need an explicit manual migration.
//! Version 2 adds persistent settings, preserving preferences from earlier builds.
//! Version 3 adds the noise preference without overwriting existing settings.
//! No database is deleted or automatically backed up. Schema/data changes and
//! `user_version` commit together; any migration failure rolls them all back.

use std::{error::Error, fmt};

use rusqlite::{Connection, TransactionBehavior};

pub const SCHEMA_VERSION: i64 = 3;
const SCHEMA: &str = include_str!("../schema.sql");
// Keep v2 separate from the v1 schema: upgrading a versioned database must not
// rerun currency seeds, replace analytics views or rebuild its FTS index.
const SETTINGS_SCHEMA: &str = "CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
) WITHOUT ROWID, STRICT;
INSERT INTO app_settings (key, value) VALUES ('theme', 'dark')
ON CONFLICT(key) DO NOTHING;";
const NOISE_SETTINGS_SCHEMA: &str =
    "INSERT INTO app_settings (key, value) VALUES ('noise_enabled', 'true')
     ON CONFLICT(key) DO NOTHING;";

#[derive(Debug)]
pub enum InitializationError {
    Sqlite(rusqlite::Error),
    Rejected(String),
}

impl fmt::Display for InitializationError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Sqlite(error) => write!(f, "Database initialization failed: {error}."),
            Self::Rejected(reason) => write!(f, "Database initialization refused: {reason}."),
        }?;
        write!(
            f,
            " app.db is retained; no data was deleted. Any schema upgrade was rolled back."
        )
    }
}

impl Error for InitializationError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            Self::Sqlite(error) => Some(error),
            Self::Rejected(_) => None,
        }
    }
}

impl From<rusqlite::Error> for InitializationError {
    fn from(error: rusqlite::Error) -> Self {
        Self::Sqlite(error)
    }
}

/// Configure this connection and upgrade the database before it can be used.
///
/// WAL must be configured outside the migration transaction. In-memory databases
/// use SQLite's `memory` journal instead; file-backed databases must actually use
/// WAL. Foreign keys are enabled and verified on every call, even at the latest version.
pub fn initialize(conn: &mut Connection) -> Result<(), InitializationError> {
    if !conn.is_autocommit() {
        return Err(InitializationError::Rejected(
            "initialization requires a connection outside a transaction".into(),
        ));
    }

    // Refuse legacy files before even changing their persistent journal mode.
    reject_legacy_schema(conn)?;
    check_version(conn)?;

    conn.pragma_update(None, "foreign_keys", true)?;
    let foreign_keys: bool = conn.pragma_query_value(None, "foreign_keys", |row| row.get(0))?;
    if !foreign_keys {
        return Err(InitializationError::Rejected(
            "SQLite could not enable foreign key enforcement".into(),
        ));
    }
    let path: String = conn.query_row(
        "SELECT file FROM pragma_database_list WHERE name = 'main'",
        [],
        |row| row.get(0),
    )?;
    let journal: String = conn.query_row("PRAGMA journal_mode = WAL", [], |row| row.get(0))?;
    if !journal.eq_ignore_ascii_case("wal")
        && !(path.is_empty() && journal.eq_ignore_ascii_case("memory"))
    {
        return Err(InitializationError::Rejected(format!(
            "SQLite could not enable WAL journaling (returned {journal})"
        )));
    }
    conn.pragma_update(None, "synchronous", "NORMAL")?;

    // Serialize the version check and upgrade against other connections opening
    // the same file. The schema script contains no PRAGMAs or transaction control.
    let tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    reject_legacy_schema(&tx)?;
    for version in check_version(&tx)?..SCHEMA_VERSION {
        match version {
            0 => upgrade_to_v1(&tx)?,
            1 => upgrade_to_v2(&tx)?,
            2 => upgrade_to_v3(&tx)?,
            _ => unreachable!("check_version rejects unsupported versions"),
        }
        tx.pragma_update(None, "user_version", version + 1)?;
    }
    tx.commit()?;
    Ok(())
}

fn reject_legacy_schema(conn: &Connection) -> Result<(), InitializationError> {
    let legacy: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM pragma_table_info('accounts') WHERE name = 'acc_type')
             OR EXISTS(SELECT 1 FROM pragma_table_info('movements') WHERE name = 'mov_type')
             OR EXISTS(SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'balance_snapshots')",
        [],
        |row| row.get(0),
    )?;
    if legacy {
        return Err(InitializationError::Rejected(
            "legacy schema detected (accounts.acc_type, movements.mov_type or balance_snapshots). \
             Manual migration is required: balance snapshots, transfer direction and historical \
             currency conversions cannot be inferred safely. Back up app.db before migrating; \
             no automatic legacy conversion is performed"
                .into(),
        ));
    }
    Ok(())
}

fn check_version(conn: &Connection) -> Result<i64, InitializationError> {
    let version: i64 = conn.pragma_query_value(None, "user_version", |row| row.get(0))?;
    if !(0..=SCHEMA_VERSION).contains(&version) {
        return Err(InitializationError::Rejected(format!(
            "unsupported schema version {version}; this application supports up to {SCHEMA_VERSION}"
        )));
    }
    Ok(version)
}

fn upgrade_to_v1(conn: &Connection) -> Result<(), InitializationError> {
    // CREATE VIEW IF NOT EXISTS cannot repair views installed by earlier builds.
    conn.execute_batch(
        "DROP VIEW IF EXISTS v_movement_details;
         DROP VIEW IF EXISTS v_transfer_pairs;
         DROP VIEW IF EXISTS v_category_spending;
         DROP VIEW IF EXISTS v_monthly_summary;
         DROP VIEW IF EXISTS v_net_worth;
         DROP VIEW IF EXISTS v_account_running_balances;
         DROP VIEW IF EXISTS v_account_balances;",
    )?;
    conn.execute_batch(SCHEMA)?;
    validate_existing_data(conn)?;

    // External-content FTS does not automatically index rows that predate its
    // triggers. Rebuild once, atomically with the schema and version marker.
    conn.execute_batch("INSERT INTO movements_fts(movements_fts) VALUES ('rebuild');")?;
    Ok(())
}

fn upgrade_to_v2(conn: &Connection) -> Result<(), InitializationError> {
    conn.execute_batch(SETTINGS_SCHEMA)?;
    // CREATE IF NOT EXISTS must not silently accept an incompatible pre-existing
    // table. Earlier settings::initialize builds created exactly this contract.
    let compatible: bool = conn.query_row(
        "SELECT EXISTS(
            SELECT 1 FROM pragma_table_list
            WHERE schema = 'main' AND name = 'app_settings' AND type = 'table'
                AND strict = 1 AND wr = 1 AND ncol = 2
         ) AND EXISTS(
            SELECT 1 FROM pragma_table_info('app_settings')
            WHERE name = 'key' AND type = 'TEXT' AND pk = 1 AND [notnull] = 1
         ) AND EXISTS(
            SELECT 1 FROM pragma_table_info('app_settings')
            WHERE name = 'value' AND type = 'TEXT' AND pk = 0 AND [notnull] = 1
         )",
        [],
        |row| row.get(0),
    )?;
    if !compatible {
        return Err(InitializationError::Rejected(
            "app_settings must be a STRICT, WITHOUT ROWID key/value TEXT table; \
             manual repair is required before upgrading"
                .into(),
        ));
    }
    validate_existing_data(conn)
}

fn upgrade_to_v3(conn: &Connection) -> Result<(), InitializationError> {
    conn.execute_batch(NOISE_SETTINGS_SCHEMA)?;
    Ok(())
}

fn validate_existing_data(conn: &Connection) -> Result<(), InitializationError> {
    // Do not silently repair or discard existing rows that violate new invariants.
    let invalid: bool = conn.query_row(
        "SELECT EXISTS(
            SELECT 1 FROM movements m LEFT JOIN accounts a ON a.id = m.account_id
            WHERE (m.type IN ('transfer_out', 'transfer_in')) != (m.transfer_group_id IS NOT NULL)
               OR a.id IS NULL OR m.currency_code != a.currency_code
         )",
        [],
        |row| row.get(0),
    )?;
    if invalid {
        return Err(InitializationError::Rejected(
            "existing movement transfer groups or account currencies are inconsistent; \
             manual repair is required before upgrading"
                .into(),
        ));
    }
    let invalid_pairs: bool = conn.query_row(
        "SELECT EXISTS(
            SELECT 1 FROM movements
            WHERE transfer_group_id IS NOT NULL
            GROUP BY transfer_group_id
            HAVING COUNT(*) != 2
                OR SUM(type = 'transfer_out') != 1
                OR SUM(type = 'transfer_in') != 1
                OR COUNT(DISTINCT account_id) != 2
                OR COUNT(DISTINCT date) != 1
                OR (COUNT(DISTINCT currency_code) = 1 AND MIN(amount) != MAX(amount))
         )",
        [],
        |row| row.get(0),
    )?;
    if invalid_pairs {
        return Err(InitializationError::Rejected(
            "existing transfer groups must contain exactly one outgoing and one incoming leg, \
             on distinct accounts with matching dates and equal amounts for the same currency; \
             manual repair is required before upgrading"
                .into(),
        ));
    }
    let mut foreign_keys = conn.prepare("PRAGMA foreign_key_check")?;
    if foreign_keys.query([])?.next()?.is_some() {
        return Err(InitializationError::Rejected(
            "existing data violates foreign key constraints; manual repair is required before upgrading"
                .into(),
        ));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{
        fs,
        path::PathBuf,
        sync::atomic::{AtomicU64, Ordering},
    };

    const ACCOUNTS: &str = "INSERT INTO accounts (id, name, type, currency_code) VALUES
        (1, 'Cash', 'cash', 'USD'), (2, 'Bank', 'checking', 'USD'),
        (3, 'Euro', 'cash', 'EUR');";

    fn database() -> Connection {
        let mut conn = Connection::open_in_memory().unwrap();
        initialize(&mut conn).unwrap();
        conn.execute_batch(ACCOUNTS).unwrap();
        conn
    }

    fn scalar(conn: &Connection, sql: &str) -> i64 {
        conn.query_row(sql, [], |row| row.get(0)).unwrap()
    }

    fn text(conn: &Connection, sql: &str) -> String {
        conn.query_row(sql, [], |row| row.get(0)).unwrap()
    }

    fn schema_snapshot(conn: &Connection) -> Vec<(String, Option<String>)> {
        conn.prepare("SELECT name, sql FROM sqlite_schema ORDER BY name")
            .unwrap()
            .query_map([], |row| Ok((row.get(0)?, row.get(1)?)))
            .unwrap()
            .collect::<rusqlite::Result<Vec<_>>>()
            .unwrap()
    }

    fn version_one_database() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(SCHEMA).unwrap();
        conn.execute_batch(ACCOUNTS).unwrap();
        conn.pragma_update(None, "user_version", 1).unwrap();
        conn
    }

    fn search(conn: &Connection, term: &str) -> i64 {
        conn.query_row(
            "SELECT COUNT(*) FROM movements_fts WHERE movements_fts MATCH ?1",
            [term],
            |row| row.get(0),
        )
        .unwrap()
    }

    // Reproduce the original unversioned schema without the new transfer CHECK,
    // index or integrity triggers. Missing FTS triggers model unindexed old rows.
    fn unversioned_database() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.pragma_update(None, "foreign_keys", false).unwrap();
        let schema = SCHEMA.replace("\r\n", "\n").replace(
            ",\n    CHECK ((type IN ('transfer_out', 'transfer_in')) = (transfer_group_id IS NOT NULL))",
            "",
        );
        conn.execute_batch(&schema).unwrap();
        conn.execute_batch(
            "DROP INDEX idx_movements_transfer_group_type;
             DROP TRIGGER trg_movements_integrity_insert;
             DROP TRIGGER trg_movements_integrity_update;
             DROP TRIGGER trg_accounts_currency_integrity;
             DROP TRIGGER trg_fts_movements_insert;
             DROP TRIGGER trg_fts_movements_update;
             DROP TRIGGER trg_fts_movements_delete;
             DROP VIEW v_monthly_summary;
             CREATE VIEW v_monthly_summary AS SELECT 123 AS obsolete;
             DROP VIEW v_category_spending;
             CREATE VIEW v_category_spending AS SELECT 456 AS obsolete;
             DROP VIEW v_transfer_pairs;
             CREATE VIEW v_transfer_pairs AS SELECT 789 AS obsolete;",
        )
        .unwrap();
        conn.execute_batch(ACCOUNTS).unwrap();
        conn
    }

    struct FileDatabase(PathBuf);

    impl FileDatabase {
        fn new() -> Self {
            static NEXT: AtomicU64 = AtomicU64::new(0);
            let directory = std::env::temp_dir().join(format!(
                "orbit-database-{}-{}-{}",
                std::process::id(),
                std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap()
                    .as_nanos(),
                NEXT.fetch_add(1, Ordering::Relaxed),
            ));
            fs::create_dir(&directory).unwrap();
            Self(directory.join("app.db"))
        }

        fn open(&self) -> Connection {
            Connection::open(&self.0).unwrap()
        }
    }

    impl Drop for FileDatabase {
        fn drop(&mut self) {
            fs::remove_dir_all(self.0.parent().unwrap()).unwrap();
        }
    }

    #[test]
    fn fresh_initialization_seeds_offline_currencies_and_versions_schema() {
        let conn = database();
        assert_eq!(scalar(&conn, "PRAGMA user_version"), SCHEMA_VERSION);
        assert_eq!(scalar(&conn, "PRAGMA foreign_keys"), 1);
        assert_eq!(
            text(&conn, "SELECT value FROM app_settings WHERE key = 'theme'"),
            "dark"
        );
        assert_eq!(
            text(
                &conn,
                "SELECT value FROM app_settings WHERE key = 'noise_enabled'"
            ),
            "true"
        );
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM app_settings"), 2);
        assert_eq!(
            scalar(
                &conn,
                "SELECT strict * wr FROM pragma_table_list WHERE name = 'app_settings'"
            ),
            1
        );
        let currencies = conn
            .prepare("SELECT code, decimal_places FROM currencies ORDER BY code")
            .unwrap()
            .query_map([], |row| {
                Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?))
            })
            .unwrap()
            .collect::<rusqlite::Result<Vec<_>>>()
            .unwrap();
        assert_eq!(
            currencies,
            vec![
                ("ARS".into(), 2),
                ("EUR".into(), 2),
                ("GBP".into(), 2),
                ("JPY".into(), 0),
                ("USD".into(), 2),
            ]
        );
        for currency in ["ARS", "USD", "EUR", "GBP", "JPY"] {
            conn.execute(
                "INSERT INTO accounts(name, type, currency_code) VALUES ('Offline', 'cash', ?1)",
                [currency],
            )
            .unwrap();
        }
        assert!(conn
            .execute(
                "INSERT INTO accounts(name, type, currency_code) VALUES ('Unknown', 'cash', 'ZZZ')",
                [],
            )
            .is_err());
    }

    #[test]
    fn views_exclude_opening_balances_and_transfers_but_keep_uncategorized_expenses() {
        let conn = database();
        conn.execute_batch(
            "INSERT INTO categories(id, name, type) VALUES (1, 'Food', 'expense'), (2, 'Salary', 'income');
             INSERT INTO movements(account_id, type, amount, currency_code, date, category_id, transfer_group_id) VALUES
             (1, 'initial_balance', 10000, 'USD', '2026-01-01', NULL, NULL),
             (1, 'income', 3000, 'USD', '2026-02-01', 2, NULL),
             (1, 'expense', 750, 'USD', '2026-02-02', 1, NULL),
             (1, 'expense', 250, 'USD', '2026-02-03', NULL, NULL),
             (3, 'expense', 200, 'EUR', '2026-02-03', 1, NULL),
             (2, 'transfer_in', 700, 'USD', '2026-02-04', NULL, 'reverse'),
             (1, 'transfer_out', 700, 'USD', '2026-02-04', NULL, 'reverse');",
        ).unwrap();
        let summary: (i64, i64, i64) = conn.query_row(
            "SELECT total_income, total_expenses, net FROM v_monthly_summary WHERE currency_code = 'USD'",
            [], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        ).unwrap();
        assert_eq!(summary, (3000, 1000, 2000));
        assert_eq!(
            scalar(
                &conn,
                "SELECT COUNT(*) FROM v_monthly_summary WHERE month = '2026-01'"
            ),
            0
        );
        assert_eq!(
            scalar(
                &conn,
                "SELECT net FROM v_monthly_summary WHERE currency_code = 'EUR'"
            ),
            -200
        );
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM v_category_spending"), 3);
        assert_eq!(scalar(&conn, "SELECT total_amount FROM v_category_spending WHERE category_id IS NULL AND category_name = 'Sin categoría'"), 250);
        assert_eq!(
            scalar(
                &conn,
                "SELECT COUNT(*) FROM v_category_spending WHERE category_name = 'Salary'"
            ),
            0
        );
        assert_eq!(
            scalar(
                &conn,
                "SELECT COUNT(*) FROM v_transfer_pairs WHERE from_movement_id > to_movement_id"
            ),
            1
        );
        assert_eq!(
            scalar(
                &conn,
                "SELECT total_balance FROM v_net_worth WHERE currency_code = 'USD'"
            ),
            12000
        );
    }

    #[test]
    fn constraints_protect_transfer_groups_and_account_currencies() {
        let conn = database();
        for (kind, group) in [
            ("income", Some("bad")),
            ("expense", Some("bad")),
            ("initial_balance", Some("bad")),
            ("transfer_in", None),
            ("transfer_out", None),
        ] {
            assert!(conn.execute(
                "INSERT INTO movements(account_id, type, amount, currency_code, date, transfer_group_id)
                 VALUES (1, ?1, 100, 'USD', '2026-01-01', ?2)",
                rusqlite::params![kind, group],
            ).is_err());
        }
        conn.execute_batch(
            "INSERT INTO movements(account_id, type, amount, currency_code, date, transfer_group_id)
             VALUES (1, 'transfer_out', 100, 'USD', '2026-01-01', 'pair'),
                    (3, 'transfer_in', 90, 'EUR', '2026-01-01', 'pair');",
        ).unwrap();
        assert!(conn.execute(
            "INSERT INTO movements(account_id, type, amount, currency_code, date, transfer_group_id)
             VALUES (2, 'transfer_out', 100, 'USD', '2026-01-01', 'pair')", [],
        ).is_err());
        assert!(conn
            .execute("UPDATE movements SET type = 'income' WHERE id = 1", [])
            .is_err());
        assert!(conn
            .execute(
                "UPDATE movements SET currency_code = 'EUR' WHERE id = 1",
                []
            )
            .is_err());
        assert!(conn
            .execute("UPDATE movements SET account_id = 3 WHERE id = 1", [])
            .is_err());
        assert!(conn
            .execute("UPDATE accounts SET currency_code = 'EUR' WHERE id = 1", [])
            .is_err());
        assert!(conn
            .execute(
                "INSERT INTO movements(account_id, type, amount, currency_code, date)
             VALUES (1, 'expense', 100, 'EUR', '2026-01-01')",
                [],
            )
            .is_err());
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM v_transfer_pairs"), 1);
    }

    #[test]
    fn purchases_keep_truncating_fractional_generated_totals() {
        let conn = database();
        conn.execute_batch(
            "INSERT INTO movements(account_id, type, amount, currency_code, date)
             VALUES (1, 'expense', 100, 'USD', '2026-01-01');
             INSERT INTO items(name) VALUES ('Fractional');
             INSERT INTO purchases(movement_id, item_id, quantity, unit_price)
             VALUES (1, 1, 1.5, 3);",
        )
        .unwrap();
        assert_eq!(scalar(&conn, "SELECT total_price FROM purchases"), 4);
    }

    #[test]
    fn unversioned_upgrade_replaces_views_rebuilds_fts_and_preserves_content() {
        let mut conn = unversioned_database();
        conn.execute_batch(
            "UPDATE currencies SET name = 'Custom Dollar' WHERE code = 'USD';
             DELETE FROM currencies WHERE code IN ('ARS', 'GBP', 'JPY');
             INSERT INTO movements(account_id, type, amount, currency_code, date, description, notes)
             VALUES (1, 'expense', 150, 'USD', '2026-01-01', 'unindexed groceries', 'organic');",
        ).unwrap();
        assert_eq!(search(&conn, "groceries"), 0);
        let audit_rows = scalar(&conn, "SELECT COUNT(*) FROM audit_log");
        initialize(&mut conn).unwrap();
        assert_eq!(scalar(&conn, "PRAGMA user_version"), SCHEMA_VERSION);
        assert_eq!(search(&conn, "groceries"), 1);
        assert_eq!(search(&conn, "organic"), 1);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM audit_log"), audit_rows);
        assert_eq!(
            scalar(&conn, "SELECT total_expenses FROM v_monthly_summary"),
            150
        );
        assert_eq!(
            scalar(
                &conn,
                "SELECT total_amount FROM v_category_spending WHERE category_id IS NULL"
            ),
            150
        );
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM v_transfer_pairs"), 0);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM currencies"), 5);
        let name: String = conn
            .query_row(
                "SELECT name FROM currencies WHERE code = 'USD'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(name, "Custom Dollar");
        assert!(conn
            .execute("UPDATE movements SET transfer_group_id = 'invalid'", [])
            .is_err());
        conn.execute(
            "UPDATE movements SET description = 'updated market', notes = NULL",
            [],
        )
        .unwrap();
        assert_eq!(search(&conn, "groceries"), 0);
        assert_eq!(search(&conn, "market"), 1);
        conn.execute("DELETE FROM movements", []).unwrap();
        assert_eq!(search(&conn, "market"), 0);
    }

    #[test]
    fn current_version_does_not_reseed_or_rebuild_fts() {
        let mut conn = database();
        conn.execute_batch(
            "INSERT INTO movements(account_id, type, amount, currency_code, date, description)
             VALUES (1, 'income', 100, 'USD', '2026-01-01', 'sentinel');
             INSERT INTO movements_fts(movements_fts) VALUES ('delete-all');
             DELETE FROM currencies WHERE code = 'JPY';
             DELETE FROM app_settings WHERE key IN ('theme', 'noise_enabled');",
        )
        .unwrap();
        let changes = conn.total_changes();
        initialize(&mut conn).unwrap();
        assert_eq!(conn.total_changes(), changes);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM app_settings"), 0);
        assert_eq!(search(&conn, "sentinel"), 0);
        assert_eq!(
            scalar(&conn, "SELECT COUNT(*) FROM currencies WHERE code = 'JPY'"),
            0
        );
    }

    #[test]
    fn file_connections_enable_wal_and_foreign_keys_on_every_open() {
        let file = FileDatabase::new();
        {
            let mut conn = file.open();
            initialize(&mut conn).unwrap();
            conn.execute_batch(ACCOUNTS).unwrap();
            conn.execute_batch(
                "INSERT INTO movements(account_id, type, amount, currency_code, date, description)
                 VALUES (1, 'income', 123, 'USD', '2026-01-01', 'persisted');",
            )
            .unwrap();
        }
        let mut conn = file.open();
        conn.pragma_update(None, "foreign_keys", false).unwrap();
        initialize(&mut conn).unwrap();
        let journal: String = conn
            .pragma_query_value(None, "journal_mode", |row| row.get(0))
            .unwrap();
        assert_eq!(journal, "wal");
        assert_eq!(scalar(&conn, "PRAGMA foreign_keys"), 1);
        assert_eq!(scalar(&conn, "PRAGMA synchronous"), 1);
        assert_eq!(scalar(&conn, "PRAGMA user_version"), SCHEMA_VERSION);
        assert_eq!(scalar(&conn, "SELECT amount FROM movements"), 123);
        assert_eq!(search(&conn, "persisted"), 1);
        assert!(conn
            .execute("DELETE FROM accounts WHERE id = 1", [])
            .is_err());
    }

    #[test]
    fn failed_upgrade_rolls_back_views_seeds_triggers_and_version() {
        let mut conn = unversioned_database();
        conn.execute_batch(
            "DELETE FROM currencies WHERE code = 'JPY';
             INSERT INTO movements(account_id, type, amount, currency_code, date, transfer_group_id)
             VALUES (1, 'income', 100, 'USD', '2026-01-01', 'invalid');",
        )
        .unwrap();
        let error = initialize(&mut conn).unwrap_err().to_string();
        assert!(error.contains("manual repair"), "{error}");
        assert!(conn.is_autocommit());
        assert_eq!(scalar(&conn, "PRAGMA user_version"), 0);
        assert_eq!(scalar(&conn, "SELECT obsolete FROM v_monthly_summary"), 123);
        assert_eq!(
            scalar(&conn, "SELECT COUNT(*) FROM currencies WHERE code = 'JPY'"),
            0
        );
        assert_eq!(scalar(&conn, "SELECT amount FROM movements"), 100);
        assert_eq!(
            scalar(
                &conn,
                "SELECT COUNT(*) FROM sqlite_schema WHERE name = 'trg_movements_integrity_insert'"
            ),
            0
        );
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM sqlite_schema WHERE name = 'idx_movements_transfer_group_type'"), 0);
    }

    #[test]
    fn duplicate_transfer_legs_and_currency_mismatches_require_manual_repair() {
        for rows in [
            "(1, 'transfer_out', 100, 'USD', '2026-01-01', 'dup'), (2, 'transfer_out', 100, 'USD', '2026-01-01', 'dup')",
            "(1, 'income', 100, 'EUR', '2026-01-01', NULL)",
        ] {
            let mut conn = unversioned_database();
            conn.execute_batch(&format!(
                "INSERT INTO movements(account_id, type, amount, currency_code, date, transfer_group_id) VALUES {rows};",
            )).unwrap();
            assert!(initialize(&mut conn).is_err());
            assert_eq!(scalar(&conn, "PRAGMA user_version"), 0);
            assert_eq!(scalar(&conn, "SELECT obsolete FROM v_monthly_summary"), 123);
        }
    }

    #[test]
    fn foreign_key_violations_roll_back_the_upgrade() {
        let mut conn = unversioned_database();
        conn.execute_batch(
            "INSERT INTO categories(id, name, type, parent_id) VALUES (1, 'Orphan', 'expense', 999);",
        ).unwrap();
        let error = initialize(&mut conn).unwrap_err().to_string();
        assert!(error.contains("foreign key"), "{error}");
        assert_eq!(scalar(&conn, "PRAGMA user_version"), 0);
        assert_eq!(scalar(&conn, "SELECT obsolete FROM v_monthly_summary"), 123);
        assert_eq!(
            scalar(&conn, "SELECT parent_id FROM categories WHERE id = 1"),
            999
        );
    }

    #[test]
    fn legacy_file_is_rejected_without_changing_any_bytes() {
        let file = FileDatabase::new();
        {
            let conn = file.open();
            conn.execute_batch(include_str!("../old_schema.sql"))
                .unwrap();
            conn.execute_batch(
                "INSERT INTO accounts(id, name, acc_type) VALUES (1, 'Legacy', 'cash');
                 INSERT INTO balance_snapshots(id, account_id, balance, snapshot_date)
                 VALUES (1, 1, 999, '2026-01-01');
                 INSERT INTO movements(id, details, date, mov_type, original_amount, ars_amount, account_id)
                 VALUES (1, 'Ambiguous transfer', '2026-01-02', 'transfer', 100, 200, 1);",
            ).unwrap();
        }
        let before = fs::read(&file.0).unwrap();
        {
            let mut conn = file.open();
            let error = initialize(&mut conn).unwrap_err().to_string();
            assert!(error.contains("Manual migration is required"), "{error}");
            assert!(error.contains("app.db is retained"), "{error}");
            assert_eq!(scalar(&conn, "SELECT balance FROM balance_snapshots"), 999);
            assert_eq!(scalar(&conn, "SELECT ars_amount FROM movements"), 200);
            assert_eq!(scalar(&conn, "PRAGMA user_version"), 0);
            assert_eq!(
                scalar(
                    &conn,
                    "SELECT COUNT(*) FROM sqlite_schema WHERE name = 'currencies'"
                ),
                0
            );
        }
        assert_eq!(fs::read(&file.0).unwrap(), before);
    }

    #[test]
    fn either_legacy_column_is_sufficient_to_refuse_initialization() {
        for schema in [
            "CREATE TABLE accounts(acc_type TEXT);",
            "CREATE TABLE movements(mov_type TEXT);",
        ] {
            let mut conn = Connection::open_in_memory().unwrap();
            conn.execute_batch(schema).unwrap();
            let error = initialize(&mut conn).unwrap_err().to_string();
            assert!(error.contains("legacy schema detected"), "{error}");
            assert_eq!(scalar(&conn, "PRAGMA user_version"), 0);
        }
    }

    #[test]
    fn v1_upgrade_adds_settings_preserves_dim_and_never_reseeds_or_rebuilds_fts() {
        for existing_settings in [false, true] {
            let mut conn = version_one_database();
            // Insert pairs together just as the command does, including reverse
            // IDs and differing currency amounts.
            conn.execute_batch(
                "INSERT INTO movements(account_id, type, amount, currency_code, date, description, transfer_group_id)
                 VALUES (1, 'initial_balance', 1000, 'USD', '2026-01-01', 'opening', NULL),
                        (3, 'transfer_in', 90, 'EUR', '2026-01-02', 'destination', 'valid'),
                        (1, 'transfer_out', 100, 'USD', '2026-01-02', 'source', 'valid');
                 INSERT INTO movements_fts(movements_fts) VALUES ('delete-all');
                 DELETE FROM currencies WHERE code = 'JPY';
                 UPDATE currencies SET name = 'Custom Dollar' WHERE code = 'USD';",
            ).unwrap();
            if existing_settings {
                conn.execute_batch(SETTINGS_SCHEMA).unwrap();
                conn.execute_batch(
                    "UPDATE app_settings SET value = 'dim' WHERE key = 'theme';
                     INSERT INTO app_settings(key, value) VALUES ('locale', 'es');",
                )
                .unwrap();
            }
            let audit_rows = scalar(&conn, "SELECT COUNT(*) FROM audit_log");
            initialize(&mut conn).unwrap();
            assert_eq!(scalar(&conn, "PRAGMA user_version"), SCHEMA_VERSION);
            assert_eq!(
                text(&conn, "SELECT value FROM app_settings WHERE key = 'theme'"),
                if existing_settings { "dim" } else { "dark" }
            );
            if existing_settings {
                assert_eq!(
                    text(&conn, "SELECT value FROM app_settings WHERE key = 'locale'"),
                    "es"
                );
            }
            assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM movements"), 3);
            assert_eq!(
                scalar(
                    &conn,
                    "SELECT balance FROM v_account_balances WHERE account_id = 1"
                ),
                900
            );
            assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM audit_log"), audit_rows);
            assert_eq!(
                scalar(&conn, "SELECT COUNT(*) FROM currencies WHERE code = 'JPY'"),
                0
            );
            assert_eq!(
                text(&conn, "SELECT name FROM currencies WHERE code = 'USD'"),
                "Custom Dollar"
            );
            assert_eq!(search(&conn, "opening"), 0);
            let changes = conn.total_changes();
            initialize(&mut conn).unwrap();
            assert_eq!(conn.total_changes(), changes);
        }
    }

    #[test]
    fn bad_settings_roll_back_both_migration_paths_without_mutating_existing_data() {
        for version in [0, 1] {
            for bad_settings in [
                "CREATE TABLE app_settings(unrelated TEXT); INSERT INTO app_settings VALUES ('keep');",
                "CREATE TABLE app_settings(key TEXT PRIMARY KEY, value TEXT NOT NULL); \
                 INSERT INTO app_settings VALUES ('theme', 'dim');",
                "CREATE TABLE app_settings(key TEXT PRIMARY KEY, value TEXT NOT NULL CHECK(value = 'dim')) \
                 WITHOUT ROWID, STRICT; INSERT INTO app_settings VALUES ('theme', 'dim');",
            ] {
                let mut conn = if version == 0 { unversioned_database() } else { version_one_database() };
                conn.execute_batch(bad_settings).unwrap();
                conn.execute_batch(
                    "DELETE FROM currencies WHERE code = 'JPY';
                     INSERT INTO movements(account_id, type, amount, currency_code, date, description)
                     VALUES (1, 'initial_balance', 100, 'USD', '2026-01-01', 'unindexed');
                     INSERT INTO movements_fts(movements_fts) VALUES ('delete-all');",
                ).unwrap();
                let schema = schema_snapshot(&conn);
                let error = initialize(&mut conn).unwrap_err().to_string();
                assert!(error.contains("rolled back"), "{error}");
                assert!(conn.is_autocommit());
                assert_eq!(scalar(&conn, "PRAGMA user_version"), version);
                assert_eq!(schema_snapshot(&conn), schema);
                assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM app_settings"), 1);
                if bad_settings.contains("unrelated") {
                    assert_eq!(text(&conn, "SELECT unrelated FROM app_settings"), "keep");
                } else {
                    assert_eq!(text(&conn, "SELECT value FROM app_settings WHERE key = 'theme'"), "dim");
                }
                assert_eq!(scalar(&conn, "SELECT amount FROM movements"), 100);
                assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM currencies WHERE code = 'JPY'"), 0);
                assert_eq!(search(&conn, "unindexed"), 0);
                if version == 0 {
                    assert_eq!(scalar(&conn, "SELECT obsolete FROM v_monthly_summary"), 123);
                }
            }
        }
    }

    #[test]
    fn broken_transfer_pairs_are_rejected_atomically_on_both_upgrade_paths() {
        for version in [0, 1] {
            for rows in [
                "(1, 'transfer_out', 100, 'USD', '2026-01-01', 'broken')",
                "(2, 'transfer_in', 100, 'USD', '2026-01-01', 'broken')",
                "(1, 'transfer_out', 100, 'USD', '2026-01-01', 'broken'), \
                 (1, 'transfer_in', 100, 'USD', '2026-01-01', 'broken')",
                "(1, 'transfer_out', 100, 'USD', '2026-01-01', 'broken'), \
                 (2, 'transfer_in', 100, 'USD', '2026-01-02', 'broken')",
                "(1, 'transfer_out', 100, 'USD', '2026-01-01', 'broken'), \
                 (2, 'transfer_in', 99, 'USD', '2026-01-01', 'broken')",
                "(1, 'transfer_out', 100, 'USD', '2026-01-01', 'broken'), \
                 (2, 'transfer_in', 100, 'USD', '2026-01-01', 'broken'), \
                 (3, 'transfer_in', 90, 'EUR', '2026-01-01', 'broken')",
            ] {
                let mut conn = if version == 0 {
                    unversioned_database()
                } else {
                    version_one_database()
                };
                // Permit the extra-leg fixture even on v1, to exercise the new
                // group validation rather than just its existing unique index.
                if version == 1 {
                    conn.execute_batch("DROP INDEX idx_movements_transfer_group_type;")
                        .unwrap();
                }
                conn.execute_batch(&format!(
                    "INSERT INTO movements(account_id, type, amount, currency_code, date, transfer_group_id) VALUES {rows};",
                )).unwrap();
                let schema = schema_snapshot(&conn);
                let count = scalar(&conn, "SELECT COUNT(*) FROM movements");
                let error = initialize(&mut conn).unwrap_err().to_string();
                assert!(error.contains("app.db is retained"), "{error}");
                assert_eq!(scalar(&conn, "PRAGMA user_version"), version);
                assert_eq!(schema_snapshot(&conn), schema);
                assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM movements"), count);
                assert_eq!(
                    scalar(
                        &conn,
                        "SELECT COUNT(*) FROM sqlite_schema WHERE name = 'app_settings'"
                    ),
                    0
                );
            }
        }
    }

    #[test]
    fn current_file_reopen_preserves_settings_without_reseeding_or_rebuilding_fts() {
        let file = FileDatabase::new();
        {
            let mut conn = file.open();
            initialize(&mut conn).unwrap();
            conn.execute_batch(ACCOUNTS).unwrap();
            conn.execute_batch(
                "UPDATE app_settings SET value = 'dim' WHERE key = 'theme';
                 UPDATE app_settings SET value = 'false' WHERE key = 'noise_enabled';
                 DELETE FROM currencies WHERE code = 'JPY';
                 INSERT INTO movements(account_id, type, amount, currency_code, date, description)
                 VALUES (1, 'income', 100, 'USD', '2026-01-01', 'sentinel');
                 INSERT INTO movements_fts(movements_fts) VALUES ('delete-all');",
            )
            .unwrap();
        }
        let mut conn = file.open();
        initialize(&mut conn).unwrap();
        assert_eq!(conn.total_changes(), 0);
        assert_eq!(scalar(&conn, "PRAGMA user_version"), SCHEMA_VERSION);
        assert_eq!(
            text(&conn, "SELECT value FROM app_settings WHERE key = 'theme'"),
            "dim"
        );
        assert_eq!(
            scalar(&conn, "SELECT COUNT(*) FROM currencies WHERE code = 'JPY'"),
            0
        );
        assert_eq!(search(&conn, "sentinel"), 0);
        assert_eq!(
            text(
                &conn,
                "SELECT value FROM app_settings WHERE key = 'noise_enabled'"
            ),
            "false"
        );
    }

    #[test]
    fn upgrades_from_zero_one_and_two_preserve_preferences_and_seed_only_missing_noise() {
        for version in [0, 1, 2] {
            for noise in [None, Some("false"), Some("true")] {
                let mut conn = if version == 0 {
                    unversioned_database()
                } else {
                    version_one_database()
                };
                conn.execute_batch(SETTINGS_SCHEMA).unwrap();
                conn.execute_batch(
                    "UPDATE app_settings SET value = 'ember' WHERE key = 'theme';
                     INSERT INTO app_settings (key, value) VALUES ('locale', 'es');
                     DELETE FROM currencies WHERE code = 'JPY';
                     INSERT INTO movements(account_id, type, amount, currency_code, date, description)
                     VALUES (1, 'income', 123, 'USD', '2026-01-01', 'sentinel');
                     INSERT INTO movements_fts(movements_fts) VALUES ('delete-all');",
                ).unwrap();
                if let Some(noise) = noise {
                    conn.execute(
                        "INSERT INTO app_settings (key, value) VALUES ('noise_enabled', ?1)",
                        [noise],
                    )
                    .unwrap();
                }
                conn.pragma_update(None, "user_version", version).unwrap();
                let schema = schema_snapshot(&conn);
                let audit_rows = scalar(&conn, "SELECT COUNT(*) FROM audit_log");
                initialize(&mut conn).unwrap();
                assert_eq!(scalar(&conn, "PRAGMA user_version"), 3);
                assert_eq!(
                    text(&conn, "SELECT value FROM app_settings WHERE key = 'theme'"),
                    "ember"
                );
                assert_eq!(
                    text(
                        &conn,
                        "SELECT value FROM app_settings WHERE key = 'noise_enabled'"
                    ),
                    noise.unwrap_or("true")
                );
                assert_eq!(
                    text(&conn, "SELECT value FROM app_settings WHERE key = 'locale'"),
                    "es"
                );
                assert_eq!(scalar(&conn, "SELECT amount FROM movements"), 123);
                assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM audit_log"), audit_rows);
                if version > 0 {
                    assert_eq!(schema_snapshot(&conn), schema);
                    assert_eq!(
                        scalar(&conn, "SELECT COUNT(*) FROM currencies WHERE code = 'JPY'"),
                        0
                    );
                    assert_eq!(search(&conn, "sentinel"), 0);
                }
                let changes = conn.total_changes();
                initialize(&mut conn).unwrap();
                assert_eq!(conn.total_changes(), changes);
            }
        }
    }

    #[test]
    fn failed_v3_upgrade_rolls_back_settings_and_version_without_deleting_data() {
        let mut conn = version_one_database();
        conn.execute_batch(SETTINGS_SCHEMA).unwrap();
        conn.execute_batch(
            "UPDATE app_settings SET value = 'cream' WHERE key = 'theme';
             CREATE TRIGGER reject_noise BEFORE INSERT ON app_settings
             WHEN NEW.key = 'noise_enabled'
             BEGIN SELECT RAISE(ABORT, 'noise seed rejected'); END;",
        )
        .unwrap();
        conn.pragma_update(None, "user_version", 2).unwrap();
        let schema = schema_snapshot(&conn);
        let error = initialize(&mut conn).unwrap_err().to_string();
        assert!(error.contains("rolled back"), "{error}");
        assert!(conn.is_autocommit());
        assert_eq!(scalar(&conn, "PRAGMA user_version"), 2);
        assert_eq!(schema_snapshot(&conn), schema);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM app_settings"), 1);
        assert_eq!(
            text(&conn, "SELECT value FROM app_settings WHERE key = 'theme'"),
            "cream"
        );
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM accounts"), 3);
    }

    #[test]
    fn file_reopen_preserves_all_four_themes_with_noise_on_and_off() {
        use crate::settings::{get_settings_with_conn, update_settings_with_conn, Settings, Theme};

        let file = FileDatabase::new();
        for theme in [Theme::Dark, Theme::Dim, Theme::Cream, Theme::Ember] {
            for noise_enabled in [true, false] {
                let expected = Settings {
                    theme,
                    noise_enabled,
                };
                {
                    let mut conn = file.open();
                    initialize(&mut conn).unwrap();
                    update_settings_with_conn(
                        &conn,
                        Settings {
                            theme,
                            noise_enabled,
                        },
                    )
                    .unwrap();
                }
                let mut reopened = file.open();
                initialize(&mut reopened).unwrap();
                assert_eq!(get_settings_with_conn(&reopened).unwrap(), expected);
                assert_eq!(reopened.total_changes(), 0);
            }
        }
    }

    #[test]
    fn future_versions_and_active_transactions_are_rejected() {
        let mut conn = Connection::open_in_memory().unwrap();
        conn.pragma_update(None, "user_version", SCHEMA_VERSION + 1)
            .unwrap();
        let error = initialize(&mut conn).unwrap_err().to_string();
        assert!(error.contains("unsupported schema version"), "{error}");
        assert_eq!(scalar(&conn, "PRAGMA user_version"), SCHEMA_VERSION + 1);
        assert_eq!(scalar(&conn, "SELECT COUNT(*) FROM sqlite_schema"), 0);
        conn.execute_batch("BEGIN;").unwrap();
        assert!(initialize(&mut conn)
            .unwrap_err()
            .to_string()
            .contains("outside a transaction"));
        assert!(!conn.is_autocommit());
        conn.execute_batch("ROLLBACK;").unwrap();
    }
}
