use crate::{errors::AppError, AppState};
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::str::FromStr;
use tauri::Manager;
use ts_rs::TS;

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Currency {
    pub code: String,
    pub name: String,
    pub symbol: String,
    pub decimal_places: u8,
    pub is_active: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum Theme {
    Dark,
    Dim,
    Cream,
    Ember,
}

impl Theme {
    fn as_str(self) -> &'static str {
        match self {
            Self::Dark => "dark",
            Self::Dim => "dim",
            Self::Cream => "cream",
            Self::Ember => "ember",
        }
    }

    fn background_color(self) -> tauri::window::Color {
        let (r, g, b) = match self {
            Self::Dark => (0x09, 0x09, 0x09),
            Self::Dim => (0x14, 0x14, 0x14),
            Self::Cream => (0xf6, 0xe9, 0xc7),
            Self::Ember => (0x19, 0x18, 0x16),
        };
        tauri::window::Color(r, g, b, 255)
    }
}

impl FromStr for Theme {
    type Err = AppError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value {
            "dark" => Ok(Self::Dark),
            "dim" => Ok(Self::Dim),
            "cream" => Ok(Self::Cream),
            "ember" => Ok(Self::Ember),
            _ => Err(AppError::Validation("Tema no válido.".into())),
        }
    }
}

#[derive(Debug, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct Settings {
    pub theme: Theme,
    #[serde(default = "default_noise_enabled")]
    pub noise_enabled: bool,
}

fn default_noise_enabled() -> bool {
    true
}

pub(crate) fn sync_window_background<R: tauri::Runtime>(app: &tauri::AppHandle<R>, theme: Theme) {
    for window in app.webview_windows().values() {
        if let Err(error) = window.set_background_color(Some(theme.background_color())) {
            eprintln!("[settings] could not update native window background: {error}");
        }
    }
}

pub fn initialize(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY, value TEXT NOT NULL
    ) WITHOUT ROWID, STRICT;
    INSERT INTO app_settings (key, value) VALUES ('theme', 'dark'), ('noise_enabled', 'true')
    ON CONFLICT(key) DO NOTHING;",
    )
}

#[tauri::command]
pub fn get_currencies(state: tauri::State<AppState>) -> Result<Vec<Currency>, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    get_currencies_with_conn(&conn)
}

fn get_currencies_with_conn(conn: &Connection) -> Result<Vec<Currency>, AppError> {
    let mut stmt = conn.prepare(
        "SELECT code, name, symbol, decimal_places, is_active FROM currencies ORDER BY code",
    )?;
    let rows = stmt
        .query_map([], |row| {
            Ok(Currency {
                code: row.get("code")?,
                name: row.get("name")?,
                symbol: row.get("symbol")?,
                decimal_places: row.get("decimal_places")?,
                is_active: row.get("is_active")?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(rows)
}

#[tauri::command]
pub fn get_settings(state: tauri::State<AppState>) -> Result<Settings, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    get_settings_with_conn(&conn)
}

pub(crate) fn get_settings_with_conn(conn: &Connection) -> Result<Settings, AppError> {
    let (theme, noise_enabled): (String, String) = conn.query_row(
        "SELECT
            (SELECT value FROM app_settings WHERE key = 'theme'),
            (SELECT value FROM app_settings WHERE key = 'noise_enabled')",
        [],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )?;
    Ok(Settings {
        theme: theme.parse()?,
        noise_enabled: noise_enabled.parse().map_err(|_| {
            AppError::Validation("El ajuste de ruido guardado no es válido.".into())
        })?,
    })
}

#[tauri::command]
pub fn update_settings(
    app: tauri::AppHandle,
    state: tauri::State<AppState>,
    entry: Settings,
) -> Result<Settings, AppError> {
    let conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    let settings = update_settings_with_conn(&conn, entry)?;
    sync_window_background(&app, settings.theme);
    Ok(settings)
}

pub(crate) fn update_settings_with_conn(
    conn: &Connection,
    entry: Settings,
) -> Result<Settings, AppError> {
    let tx = conn.unchecked_transaction()?;
    tx.execute(
        "INSERT INTO app_settings (key, value) VALUES ('theme', ?1), ('noise_enabled', ?2)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![entry.theme.as_str(), entry.noise_enabled.to_string()],
    )?;
    tx.commit()?;
    Ok(entry)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn settings_are_initialized_once_and_preserved_without_changing_schema_version() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::database::initialize(&mut conn).unwrap();
        initialize(&conn).unwrap();
        assert_eq!(
            get_settings_with_conn(&conn).unwrap(),
            Settings {
                theme: Theme::Dark,
                noise_enabled: true
            }
        );
        let entry = Settings {
            theme: Theme::Dim,
            noise_enabled: false,
        };
        update_settings_with_conn(&conn, entry).unwrap();
        initialize(&conn).unwrap();
        crate::database::initialize(&mut conn).unwrap();
        initialize(&conn).unwrap();
        assert_eq!(
            get_settings_with_conn(&conn).unwrap(),
            Settings {
                theme: Theme::Dim,
                noise_enabled: false
            }
        );
        let count: i64 = conn
            .query_row("SELECT COUNT(*) FROM app_settings", [], |r| r.get(0))
            .unwrap();
        assert_eq!(count, 2);
        let version: i64 = conn
            .pragma_query_value(None, "user_version", |r| r.get(0))
            .unwrap();
        assert_eq!(version, crate::database::SCHEMA_VERSION);
    }

    #[test]
    fn settings_json_round_trips_all_themes_and_noise_states() {
        let conn = Connection::open_in_memory().unwrap();
        initialize(&conn).unwrap();
        for theme in ["dark", "dim", "cream", "ember"] {
            for noise_enabled in [true, false] {
                let input = json!({ "theme": theme, "noiseEnabled": noise_enabled });
                let result = update_settings_with_conn(
                    &conn,
                    serde_json::from_value(input.clone()).unwrap(),
                )
                .unwrap();
                assert_eq!(serde_json::to_value(result).unwrap(), input);
                assert_eq!(
                    serde_json::to_value(get_settings_with_conn(&conn).unwrap()).unwrap(),
                    input
                );
            }
        }
    }

    #[test]
    fn old_payloads_default_noise_to_true_but_export_requires_the_field() {
        let conn = Connection::open_in_memory().unwrap();
        initialize(&conn).unwrap();
        let entry = serde_json::from_value(json!({ "theme": "dim" })).unwrap();
        let result = update_settings_with_conn(&conn, entry).unwrap();
        assert_eq!(
            serde_json::to_value(result).unwrap(),
            json!({ "theme": "dim", "noiseEnabled": true })
        );
        let declaration = Settings::decl(&ts_rs::Config::default());
        assert!(declaration.contains("noiseEnabled: boolean"));
        assert!(!declaration.contains("noiseEnabled?:"));
    }

    #[test]
    fn invalid_payloads_and_stored_values_are_rejected_without_rewriting_settings() {
        let conn = Connection::open_in_memory().unwrap();
        initialize(&conn).unwrap();
        for theme in [
            "",
            "light",
            "Dark",
            " dark ",
            "dim\"; DROP TABLE app_settings;--",
        ] {
            assert!(serde_json::from_value::<Settings>(json!({ "theme": theme })).is_err());
            conn.execute(
                "UPDATE app_settings SET value = ?1 WHERE key = 'theme'",
                [theme],
            )
            .unwrap();
            assert!(matches!(
                get_settings_with_conn(&conn),
                Err(AppError::Validation(_))
            ));
            let stored: String = conn
                .query_row(
                    "SELECT value FROM app_settings WHERE key = 'theme'",
                    [],
                    |row| row.get(0),
                )
                .unwrap();
            assert_eq!(stored, theme);
        }
        conn.execute(
            "UPDATE app_settings SET value = 'dark' WHERE key = 'theme'",
            [],
        )
        .unwrap();
        for value in [
            json!({}),
            json!({"theme": null}),
            json!({"theme": 1}),
            json!({"theme": "dark", "noiseEnabled": null}),
            json!({"theme": "dark", "noiseEnabled": "false"}),
            json!({"theme": "dark", "noiseEnabled": 1}),
        ] {
            assert!(serde_json::from_value::<Settings>(value).is_err());
        }
        for value in ["", "1", "0", "TRUE", " false ", "invalid"] {
            conn.execute(
                "UPDATE app_settings SET value = ?1 WHERE key = 'noise_enabled'",
                [value],
            )
            .unwrap();
            assert!(matches!(
                get_settings_with_conn(&conn),
                Err(AppError::Validation(_))
            ));
            let stored: String = conn
                .query_row(
                    "SELECT value FROM app_settings WHERE key = 'noise_enabled'",
                    [],
                    |row| row.get(0),
                )
                .unwrap();
            assert_eq!(stored, value);
        }
        conn.execute("DELETE FROM app_settings WHERE key = 'noise_enabled'", [])
            .unwrap();
        assert!(matches!(
            get_settings_with_conn(&conn),
            Err(AppError::Database(_))
        ));
    }

    #[test]
    fn failed_noise_write_rolls_back_theme_and_leaves_connection_usable() {
        let conn = Connection::open_in_memory().unwrap();
        initialize(&conn).unwrap();
        conn.execute_batch(
            "CREATE TRIGGER reject_noise BEFORE UPDATE ON app_settings
             WHEN NEW.key = 'noise_enabled'
             BEGIN SELECT RAISE(ABORT, 'noise write rejected'); END;",
        )
        .unwrap();
        assert!(update_settings_with_conn(
            &conn,
            Settings {
                theme: Theme::Cream,
                noise_enabled: false
            }
        )
        .is_err());
        assert!(conn.is_autocommit());
        assert_eq!(
            get_settings_with_conn(&conn).unwrap(),
            Settings {
                theme: Theme::Dark,
                noise_enabled: true
            }
        );
        conn.execute_batch("DROP TRIGGER reject_noise;").unwrap();
        update_settings_with_conn(
            &conn,
            Settings {
                theme: Theme::Ember,
                noise_enabled: false,
            },
        )
        .unwrap();
        assert_eq!(
            get_settings_with_conn(&conn).unwrap(),
            Settings {
                theme: Theme::Ember,
                noise_enabled: false
            }
        );
    }

    #[test]
    fn native_background_colors_match_themes() {
        for (theme, rgb) in [
            (Theme::Dark, (0x09, 0x09, 0x09)),
            (Theme::Dim, (0x14, 0x14, 0x14)),
            (Theme::Cream, (0xf6, 0xe9, 0xc7)),
            (Theme::Ember, (0x19, 0x18, 0x16)),
        ] {
            let color = theme.background_color();
            assert_eq!((color.0, color.1, color.2), rgb);
            assert_eq!(color.3, 255);
        }
    }

    #[test]
    fn currencies_map_named_columns_and_keep_inactive_metadata_for_history() {
        let mut conn = Connection::open_in_memory().unwrap();
        crate::database::initialize(&mut conn).unwrap();
        conn.execute("UPDATE currencies SET is_active = 0 WHERE code = 'JPY'", [])
            .unwrap();
        let currencies = get_currencies_with_conn(&conn).unwrap();
        assert_eq!(
            currencies
                .iter()
                .map(|c| c.code.as_str())
                .collect::<Vec<_>>(),
            ["ARS", "EUR", "GBP", "JPY", "USD"]
        );
        let yen = currencies.iter().find(|c| c.code == "JPY").unwrap();
        assert_eq!(yen.name, "Japanese Yen");
        assert_eq!(yen.symbol, "¥");
        assert_eq!(yen.decimal_places, 0);
        assert!(!yen.is_active);
        assert_eq!(
            serde_json::to_value(yen).unwrap(),
            json!({
                "code": "JPY", "name": "Japanese Yen", "symbol": "¥",
                "decimalPlaces": 0, "isActive": false,
            })
        );
    }
}
