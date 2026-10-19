use std::collections::HashSet;

use rusqlite::{Connection, OptionalExtension, TransactionBehavior};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::{accounts, categories, errors::AppError, items, movements, purchases};

pub const MAX_IMPORT_ROWS: usize = 2_000;
pub const MAX_IMPORT_BYTES: usize = 5 * 1024 * 1024;
const MAX_SAFE_INTEGER: i64 = 9_007_199_254_740_991;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ImportKind {
    Accounts,
    Categories,
    Items,
    Movements,
    Purchases,
}

#[derive(Debug, Deserialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ImportRequest {
    pub kind: ImportKind,
    // A Rust String / JSON string is necessarily UTF-8; no lossy byte decoding.
    pub csv: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ImportDataType {
    Text,
    Integer,
    Decimal,
    Date,
    Enum,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ImportColumn {
    pub name: String,
    pub data_type: ImportDataType,
    pub required: bool,
    pub description: String,
    pub example: String,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ImportTemplate {
    pub kind: ImportKind,
    pub columns: Vec<ImportColumn>,
    pub example_csv: String,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ImportPreview {
    pub kind: ImportKind,
    pub columns: Vec<String>,
    pub rows: Vec<ImportRow>,
    pub total_rows: u32,
    pub valid_rows: u32,
    pub errors: Vec<ImportIssue>,
    pub can_commit: bool,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ImportRow {
    pub row_number: u32,
    pub values: Vec<String>,
    pub errors: Vec<String>,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ImportIssue {
    pub row_number: u32,
    pub message: String,
}

#[derive(Debug, Serialize, TS)]
#[serde(rename_all = "camelCase")]
#[ts(export)]
pub struct ImportResult {
    pub kind: ImportKind,
    pub imported_rows: u32,
    pub created_movements: u32,
    pub created_purchases: u32,
}

type ColumnSpec = (&'static str, bool, &'static str, &'static str);

fn column_data_type(name: &str) -> ImportDataType {
    match name {
        "account_id" | "category_id" | "shop_id" | "to_account_id" | "parent_id"
        | "movement_id" | "item_id" => ImportDataType::Integer,
        "amount" | "to_amount" | "initial_balance" | "unit_price" | "quantity" => {
            ImportDataType::Decimal
        }
        "date" => ImportDataType::Date,
        "type" | "account_type" => ImportDataType::Enum,
        _ => ImportDataType::Text,
    }
}

fn column_specs(kind: ImportKind) -> &'static [ColumnSpec] {
    match kind {
        ImportKind::Accounts => &[
            ("name", true, "Nombre. Reimportar crea duplicados; no hay deduplicación automática.", "Efectivo"),
            ("account_type", true, "cash, checking, savings, credit_card, investment, loan, digital_wallet u other", "cash"),
            ("currency_code", true, "Código exacto de una moneda existente y activa", "USD"),
            ("description", false, "Descripción opcional", "Billetera"),
            ("initial_balance", false, "Importe mayor no negativo; punto o coma decimal, sin miles. Cero no crea movimiento.", "100.00"),
        ],
        ImportKind::Categories => &[
            ("name", true, "Nombre. Reimportar crea duplicados.", "Alimentos"),
            ("type", true, "income, expense o both", "expense"),
            ("parent_id", false, "ID SQLite existente y activo antes de importar. 1 es un ejemplo: reemplazar por un ID válido; importar dependencias en archivos separados.", "1"),
        ],
        ImportKind::Items => &[
            ("name", true, "Nombre. Reimportar crea duplicados.", "Leche"),
            ("brand", false, "Marca opcional", "Marca"),
            ("description", false, "Descripción opcional", "Un litro"),
        ],
        ImportKind::Movements => &[
            ("date", true, "Fecha YYYY-MM-DD. Reimportar crea duplicados.", "2026-01-01"),
            ("type", true, "income, expense, transfer o initial_balance; no usar transfer_out/transfer_in", "expense"),
            ("account_id", true, "ID SQLite de cuenta activa existente. 1 es un ejemplo: reemplazar por un ID válido.", "1"),
            ("amount", true, "Importe mayor positivo en moneda de origen; punto o coma decimal, sin miles", "12.50"),
            ("currency_code", false, "Se infiere de la cuenta; si se indica debe coincidir exactamente", "USD"),
            ("description", false, "Descripción opcional", "Compra"),
            ("notes", false, "Notas opcionales", "Importado de CSV"),
            ("category_id", false, "ID SQLite existente, activo y compatible. 1 es un ejemplo: reemplazar por un ID válido.", "1"),
            ("shop_id", false, "ID SQLite de comercio existente, solo gastos. 1 es un ejemplo: reemplazar por un ID válido.", "1"),
            ("to_account_id", false, "ID SQLite de cuenta destino activa, solo transferencias. 2 es un ejemplo: reemplazar por un ID válido.", "2"),
            ("to_amount", false, "Importe mayor positivo en moneda destino; obligatorio entre monedas distintas", "12.50"),
        ],
        ImportKind::Purchases => &[
            ("movement_id", true, "ID SQLite de gasto existente. 1 es un ejemplo: reemplazar por un ID válido. Reimportar crea duplicados.", "1"),
            ("item_id", true, "ID SQLite de ítem existente no archivado. 1 es un ejemplo: reemplazar por un ID válido.", "1"),
            ("quantity", true, "Cantidad finita positiva; punto o coma decimal, sin miles ni exponentes", "1.5"),
            ("unit_price", true, "Precio mayor no negativo en moneda del gasto; punto o coma decimal, sin miles. Total fraccional truncado como en compras normales.", "2.50"),
            ("notes", false, "Notas opcionales", "Importado de CSV"),
        ],
    }
}

#[tauri::command]
pub fn get_import_templates() -> Vec<ImportTemplate> {
    [
        ImportKind::Accounts,
        ImportKind::Categories,
        ImportKind::Items,
        ImportKind::Movements,
        ImportKind::Purchases,
    ]
    .into_iter()
    .map(|kind| {
        let columns: Vec<_> = column_specs(kind)
            .iter()
            .map(|&(name, required, description, example)| ImportColumn {
                name: name.into(),
                data_type: column_data_type(name),
                required,
                description: description.into(),
                example: example.into(),
            })
            .collect();
        // Leave optional references empty so the example never invents dependencies.
        let example_values: Vec<_> = columns
            .iter()
            .map(|column| {
                if !column.required
                    && matches!(
                        column.name.as_str(),
                        "parent_id" | "category_id" | "shop_id" | "to_account_id" | "to_amount"
                    )
                {
                    ""
                } else {
                    column.example.as_str()
                }
            })
            .collect();
        let example_csv = format!(
            "{}\n{}\n",
            columns
                .iter()
                .map(|c| c.name.as_str())
                .collect::<Vec<_>>()
                .join(","),
            example_values.join(",")
        );
        ImportTemplate {
            kind,
            columns,
            example_csv,
        }
    })
    .collect()
}

fn validation(message: impl Into<String>) -> AppError {
    AppError::Validation(message.into())
}

// Count delimiters in the first logical record, not inside quoted header fields.
fn delimiter(csv: &str) -> u8 {
    let mut quoted = false;
    let mut commas = 0;
    let mut semicolons = 0;
    let mut bytes = csv.bytes().peekable();
    while let Some(byte) = bytes.next() {
        match byte {
            b'"' if quoted && bytes.peek() == Some(&b'"') => {
                bytes.next();
            }
            b'"' => quoted = !quoted,
            b'\r' | b'\n' if !quoted => break,
            b',' if !quoted => commas += 1,
            b';' if !quoted => semicolons += 1,
            _ => {}
        }
    }
    if semicolons > commas {
        b';'
    } else {
        b','
    }
}

// csv deliberately accepts malformed quoting. Reject it rather than silently
// changing a truncated/mistyped field; decoding records still belongs to csv.
fn invalid_quote_rows(text: &str, delimiter: u8) -> HashSet<u32> {
    let mut invalid = HashSet::new();
    let mut bytes = text.bytes().peekable();
    let mut row = 1;
    let mut field_start = true;
    let mut quoted = false;
    let mut after_quote = false;
    let mut has_content = false;
    while let Some(byte) = bytes.next() {
        if quoted {
            if byte == b'"' {
                if bytes.peek() == Some(&b'"') {
                    bytes.next();
                } else {
                    quoted = false;
                    after_quote = true;
                }
            }
            continue;
        }
        match byte {
            b'\r' | b'\n' => {
                if byte == b'\r' && bytes.peek() == Some(&b'\n') {
                    bytes.next();
                }
                if has_content {
                    row += 1;
                }
                field_start = true;
                after_quote = false;
                has_content = false;
            }
            byte if byte == delimiter => {
                field_start = true;
                after_quote = false;
                has_content = true;
            }
            b'"' if field_start => {
                quoted = true;
                field_start = false;
                has_content = true;
            }
            byte => {
                if byte == b'"' || after_quote {
                    invalid.insert(row);
                }
                field_start = false;
                has_content = true;
            }
        }
    }
    if quoted {
        invalid.insert(row);
    }
    invalid
}

fn parse(request: &ImportRequest) -> Result<ImportPreview, AppError> {
    if request.csv.len() > MAX_IMPORT_BYTES {
        return Err(validation("El CSV excede el límite de 5 MiB en UTF-8."));
    }
    let text = request.csv.strip_prefix('\u{feff}').unwrap_or(&request.csv);
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(false)
        .flexible(true)
        .delimiter(delimiter(text))
        .from_reader(text.as_bytes());
    let mut records = reader.records();
    let mut preview = ImportPreview {
        kind: request.kind,
        columns: Vec::new(),
        rows: Vec::new(),
        total_rows: 0,
        valid_rows: 0,
        errors: Vec::new(),
        can_commit: false,
    };
    match records.next() {
        Some(Ok(header)) => preview.columns = header.iter().map(|s| s.trim().to_owned()).collect(),
        Some(Err(error)) => preview.errors.push(ImportIssue {
            row_number: 1,
            message: format!("Encabezado CSV inválido: {error}"),
        }),
        None => preview.errors.push(ImportIssue {
            row_number: 1,
            message: "El CSV está vacío; falta el encabezado.".into(),
        }),
    }
    let specs = column_specs(request.kind);
    let mut seen = HashSet::new();
    for column in &preview.columns {
        let message = if column.is_empty() {
            Some("El encabezado contiene una columna vacía.".into())
        } else if !seen.insert(column.as_str()) {
            Some(format!("Columna duplicada: {column}."))
        } else if !specs.iter().any(|spec| spec.0 == column) {
            Some(format!("Columna desconocida: {column}."))
        } else {
            None
        };
        if let Some(message) = message {
            preview.errors.push(ImportIssue {
                row_number: 1,
                message,
            });
        }
    }
    for &(name, required, _, _) in specs {
        if required && !seen.contains(name) {
            preview.errors.push(ImportIssue {
                row_number: 1,
                message: format!("Falta la columna obligatoria {name}."),
            });
        }
    }
    for record in records {
        if preview.rows.len() == MAX_IMPORT_ROWS {
            return Err(validation(format!(
                "El CSV excede el límite de {MAX_IMPORT_ROWS} filas de datos."
            )));
        }
        // Number logical CSV records (header = 1), not physical lines inside
        // quoted fields. This also avoids CRLF parser positions on the prior LF.
        let row_number = preview.rows.len() as u32 + 2;
        let row = match record {
            Ok(record) => {
                let values: Vec<_> = record.iter().map(|s| s.trim().to_owned()).collect();
                let mut errors = Vec::new();
                if values.len() != preview.columns.len() {
                    errors.push(format!(
                        "Se esperaban {} campos y se encontraron {}.",
                        preview.columns.len(),
                        values.len()
                    ));
                }
                ImportRow {
                    row_number,
                    values,
                    errors,
                }
            }
            Err(error) => ImportRow {
                row_number,
                values: Vec::new(),
                errors: vec![format!("CSV inválido: {error}")],
            },
        };
        preview.rows.push(row);
    }
    for row_number in invalid_quote_rows(text, delimiter(text)) {
        let message = "Comillas CSV inválidas: usá campos entre comillas dobles completas y duplicá las comillas interiores.".to_owned();
        if row_number == 1 {
            preview.errors.push(ImportIssue {
                row_number,
                message,
            });
        } else if let Some(row) = preview.rows.get_mut(row_number as usize - 2) {
            row.errors.push(message);
        }
    }
    preview.total_rows = preview.rows.len() as u32;
    if preview.total_rows == 0 {
        preview.errors.push(ImportIssue {
            row_number: 1,
            message: "El CSV no contiene filas de datos.".into(),
        });
    }
    Ok(preview)
}

struct Fields<'a> {
    columns: &'a [String],
    values: &'a [String],
}

impl Fields<'_> {
    fn get(&self, name: &str) -> &str {
        self.columns
            .iter()
            .position(|column| column == name)
            .and_then(|index| self.values.get(index))
            .map_or("", String::as_str)
    }

    fn optional(&self, name: &str) -> Option<String> {
        let value = self.get(name);
        (!value.is_empty()).then(|| value.to_owned())
    }

    fn id(&self, name: &str) -> Result<i64, AppError> {
        parse_id(self.get(name), name)
    }

    fn optional_id(&self, name: &str) -> Result<Option<i64>, AppError> {
        self.optional(name)
            .map(|value| parse_id(&value, name))
            .transpose()
    }

    fn enumeration<T: serde::de::DeserializeOwned>(&self, name: &str) -> Result<T, AppError> {
        serde_json::from_value(serde_json::Value::String(self.get(name).into()))
            .map_err(|_| validation(format!("Valor inválido para {name}: {}.", self.get(name))))
    }
}

fn parse_id(value: &str, field: &str) -> Result<i64, AppError> {
    if !value.is_empty() && value.bytes().all(|b| b.is_ascii_digit()) {
        if let Ok(id) = value.parse::<i64>() {
            if (1..=MAX_SAFE_INTEGER).contains(&id) {
                return Ok(id);
            }
        }
    }
    Err(validation(format!(
        "{field} debe ser un ID entero positivo seguro, solo dígitos."
    )))
}

fn decimal_parts(value: &str) -> Option<(&str, &str)> {
    let mut split = value.split(['.', ',']);
    let whole = split.next()?;
    let fraction = split.next();
    if whole.is_empty() || !whole.bytes().all(|b| b.is_ascii_digit()) || split.next().is_some() {
        return None;
    }
    match fraction {
        Some(fraction) if fraction.is_empty() || !fraction.bytes().all(|b| b.is_ascii_digit()) => {
            None
        }
        _ => Some((whole, fraction.unwrap_or(""))),
    }
}

// Convert major units with integer arithmetic only; never round or pass money through f64.
fn parse_money(value: &str, decimals: u32, allow_zero: bool, field: &str) -> Result<i64, AppError> {
    let invalid = || {
        validation(format!("{field}: importe {} con hasta {decimals} decimales, punto o coma decimal, sin miles, signos ni exponentes; máximo seguro en unidades menores.", if allow_zero { "no negativo" } else { "positivo" }))
    };
    let (whole, fraction) = decimal_parts(value).ok_or_else(invalid)?;
    if decimals > 8 || fraction.len() > decimals as usize {
        return Err(invalid());
    }
    let scale = 10_i64.pow(decimals);
    let whole = whole.parse::<i64>().map_err(|_| invalid())?;
    let fractional = if fraction.is_empty() {
        0
    } else {
        fraction.parse::<i64>().map_err(|_| invalid())?
    };
    let amount = whole
        .checked_mul(scale)
        .and_then(|whole| {
            fractional
                .checked_mul(10_i64.pow(decimals - fraction.len() as u32))
                .and_then(|fraction| whole.checked_add(fraction))
        })
        .filter(|amount| (i64::from(!allow_zero)..=MAX_SAFE_INTEGER).contains(amount))
        .ok_or_else(invalid)?;
    Ok(amount)
}

fn parse_quantity(value: &str) -> Result<f64, AppError> {
    let invalid = || {
        validation("quantity debe ser un decimal finito positivo, sin miles, signos ni exponentes.")
    };
    decimal_parts(value).ok_or_else(invalid)?;
    let quantity = value
        .replace(',', ".")
        .parse::<f64>()
        .map_err(|_| invalid())?;
    if !quantity.is_finite() || quantity <= 0.0 {
        return Err(invalid());
    }
    Ok(quantity)
}

fn currency_precision(conn: &Connection, code: &str) -> Result<u32, AppError> {
    conn.query_row(
        "SELECT decimal_places FROM currencies WHERE code = ?1",
        [code],
        |row| row.get(0),
    )
    .optional()?
    .ok_or_else(|| validation(format!("La moneda {code} no existe.")))
}

fn account_currency(conn: &Connection, id: i64) -> Result<String, AppError> {
    conn.query_row(
        "SELECT currency_code FROM accounts WHERE id = ?1",
        [id],
        |row| row.get(0),
    )
    .optional()?
    .ok_or_else(|| validation(format!("La cuenta {id} no existe.")))
}

#[derive(Default)]
struct Counts {
    movements: u32,
    purchases: u32,
}

fn apply_row(
    conn: &Connection,
    kind: ImportKind,
    fields: Fields<'_>,
    existing_category_max: i64,
) -> Result<Counts, AppError> {
    let mut counts = Counts::default();
    match kind {
        ImportKind::Accounts => {
            let currency_code = fields.get("currency_code").to_owned();
            let initial_balance = fields
                .optional("initial_balance")
                .map(|value| {
                    parse_money(
                        &value,
                        currency_precision(conn, &currency_code)?,
                        true,
                        "initial_balance",
                    )
                })
                .transpose()?;
            let has_opening = initial_balance.is_some_and(|amount| amount > 0);
            accounts::create_account_in_transaction(
                conn,
                accounts::AddAccount {
                    name: fields.get("name").into(),
                    account_type: fields.enumeration("account_type")?,
                    currency_code,
                    description: fields.optional("description"),
                    initial_balance,
                },
            )?;
            counts.movements = u32::from(has_opening);
        }
        ImportKind::Categories => {
            let parent_id = fields.optional_id("parent_id")?;
            // AUTOINCREMENT IDs above this watermark did not exist before this file.
            if parent_id.is_some_and(|id| id > existing_category_max) {
                return Err(validation("parent_id debe existir antes de importar; importá las dependencias en archivos separados."));
            }
            categories::create_category_in_transaction(
                conn,
                categories::CategoryEntry {
                    name: fields.get("name").into(),
                    r#type: fields.enumeration("type")?,
                    parent_id,
                },
            )?;
        }
        ImportKind::Items => {
            items::create_item_in_transaction(
                conn,
                items::ItemEntry {
                    name: fields.get("name").into(),
                    brand: fields.optional("brand"),
                    description: fields.optional("description"),
                },
            )?;
        }
        ImportKind::Movements => {
            let account_id = fields.id("account_id")?;
            let account_code = account_currency(conn, account_id)?;
            let currency_code = fields
                .optional("currency_code")
                .unwrap_or(account_code.clone());
            if currency_code != account_code {
                return Err(validation(
                    "currency_code debe coincidir con la moneda de account_id.",
                ));
            }
            let amount = parse_money(
                fields.get("amount"),
                currency_precision(conn, &currency_code)?,
                false,
                "amount",
            )?;
            let to_account_id = fields.optional_id("to_account_id")?;
            let to_amount = fields
                .optional("to_amount")
                .map(|value| {
                    let id = to_account_id
                        .ok_or_else(|| validation("to_amount requiere to_account_id."))?;
                    let code = account_currency(conn, id)?;
                    parse_money(&value, currency_precision(conn, &code)?, false, "to_amount")
                })
                .transpose()?;
            let movement_type: movements::MovementType = fields.enumeration("type")?;
            counts.movements = if movement_type == movements::MovementType::Transfer {
                2
            } else {
                1
            };
            movements::create_movement_in_transaction(
                conn,
                movements::MovementEntry {
                    account_id,
                    r#type: movement_type,
                    amount,
                    currency_code,
                    date: fields.get("date").into(),
                    description: fields.get("description").into(),
                    notes: fields.optional("notes"),
                    category_id: fields.optional_id("category_id")?,
                    shop_id: fields.optional_id("shop_id")?,
                    to_account_id,
                    to_amount,
                },
            )?;
        }
        ImportKind::Purchases => {
            let movement_id = fields.id("movement_id")?;
            let currency_code: String = conn
                .query_row(
                    "SELECT currency_code FROM movements WHERE id = ?1",
                    [movement_id],
                    |row| row.get(0),
                )
                .optional()?
                .ok_or_else(|| validation(format!("El movimiento {movement_id} no existe.")))?;
            purchases::create_purchase_in_transaction(
                conn,
                purchases::PurchaseEntry {
                    movement_id,
                    item_id: fields.id("item_id")?,
                    quantity: parse_quantity(fields.get("quantity"))?,
                    unit_price: parse_money(
                        fields.get("unit_price"),
                        currency_precision(conn, &currency_code)?,
                        true,
                        "unit_price",
                    )?,
                    notes: fields.optional("notes"),
                },
            )?;
            counts.purchases = 1;
        }
    }
    Ok(counts)
}

fn row_error(error: AppError) -> Result<String, AppError> {
    match error {
        AppError::NotFound(message) | AppError::Validation(message) => Ok(message),
        AppError::Constraint(_) => {
            Ok("No se puede crear la fila porque hay datos relacionados o inválidos.".into())
        }
        // Infrastructure failures are not misleadingly presented as bad CSV data.
        error => Err(error),
    }
}

fn execute_import(
    conn: &mut Connection,
    request: ImportRequest,
    commit: bool,
) -> Result<(ImportPreview, ImportResult), AppError> {
    let mut preview = parse(&request)?;
    let mut result = ImportResult {
        kind: request.kind,
        imported_rows: 0,
        created_movements: 0,
        created_purchases: 0,
    };
    let headers_valid = preview.errors.iter().all(|issue| issue.row_number != 1);
    let mut tx = conn.transaction_with_behavior(TransactionBehavior::Immediate)?;
    let existing_category_max: i64 =
        tx.query_row("SELECT COALESCE(MAX(id), 0) FROM categories", [], |row| {
            row.get(0)
        })?;
    for row in &mut preview.rows {
        if headers_valid && row.errors.is_empty() {
            let fields = Fields {
                columns: &preview.columns,
                values: &row.values,
            };
            for &(name, required, _, _) in column_specs(request.kind) {
                if required && fields.get(name).is_empty() {
                    row.errors.push(format!("{name} es obligatorio."));
                }
            }
            if row.errors.is_empty() {
                let savepoint = tx.savepoint()?;
                match apply_row(&savepoint, request.kind, fields, existing_category_max) {
                    Ok(counts) => {
                        savepoint.commit()?;
                        preview.valid_rows += 1;
                        result.imported_rows += 1;
                        result.created_movements += counts.movements;
                        result.created_purchases += counts.purchases;
                    }
                    Err(error) => {
                        // Explicit rollback also reports rollback failures instead of ignoring them.
                        savepoint.finish()?;
                        row.errors.push(row_error(error)?);
                    }
                }
            }
        }
        for message in &row.errors {
            preview.errors.push(ImportIssue {
                row_number: row.row_number,
                message: message.clone(),
            });
        }
    }
    preview.can_commit = preview.total_rows > 0
        && preview.errors.is_empty()
        && preview.valid_rows == preview.total_rows;
    if commit && preview.can_commit {
        tx.commit()?;
    } else {
        tx.rollback()?;
        if commit {
            let message = preview
                .errors
                .iter()
                .map(|issue| format!("Fila {}: {}", issue.row_number, issue.message))
                .collect::<Vec<_>>()
                .join("\n");
            return Err(validation(format!("No se importó ninguna fila. {message}")));
        }
    }
    Ok((preview, result))
}

#[tauri::command]
pub fn preview_csv_import(
    state: tauri::State<crate::AppState>,
    request: ImportRequest,
) -> Result<ImportPreview, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    execute_import(&mut conn, request, false).map(|(preview, _)| preview)
}

#[tauri::command]
pub fn commit_csv_import(
    state: tauri::State<crate::AppState>,
    request: ImportRequest,
) -> Result<ImportResult, AppError> {
    let mut conn = state
        .conn
        .lock()
        .map_err(|_| AppError::Internal("database mutex poisoned".into()))?;
    execute_import(&mut conn, request, true).map(|(_, result)| result)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(kind: ImportKind, csv: &str) -> ImportRequest {
        ImportRequest {
            kind,
            csv: csv.into(),
        }
    }

    fn database() -> Result<Connection, AppError> {
        let mut conn = Connection::open_in_memory()?;
        crate::database::initialize(&mut conn).map_err(|e| AppError::Internal(e.to_string()))?;
        Ok(conn)
    }

    fn commit(
        conn: &mut Connection,
        kind: ImportKind,
        csv: &str,
    ) -> Result<ImportResult, AppError> {
        execute_import(conn, request(kind, csv), true).map(|(_, result)| result)
    }

    fn preview(
        conn: &mut Connection,
        kind: ImportKind,
        csv: &str,
    ) -> Result<ImportPreview, AppError> {
        execute_import(conn, request(kind, csv), false).map(|(preview, _)| preview)
    }

    fn seeded() -> Result<Connection, AppError> {
        let mut conn = database()?;
        commit(
            &mut conn,
            ImportKind::Accounts,
            "name,account_type,currency_code\nCash,cash,USD\nBank,checking,USD\nYen,cash,JPY",
        )?;
        commit(&mut conn, ImportKind::Categories, "name,type\nFood,expense")?;
        commit(&mut conn, ImportKind::Items, "name\nMilk")?;
        commit(
            &mut conn,
            ImportKind::Movements,
            "date,type,account_id,amount\n2026-01-01,expense,1,100.00",
        )?;
        Ok(conn)
    }

    // Include sqlite_sequence, audit_log, the FTS virtual table AND its shadow
    // tables: checking only entity counts would miss persistent preview effects.
    fn snapshot(conn: &Connection) -> Result<Vec<(String, Vec<String>)>, AppError> {
        let tables = conn
            .prepare("SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name")?
            .query_map([], |row| row.get::<_, String>(0))?
            .collect::<rusqlite::Result<Vec<_>>>()?;
        let mut snapshot = Vec::new();
        for table in tables {
            let mut statement =
                conn.prepare(&format!("SELECT * FROM \"{}\"", table.replace('"', "\"\"")))?;
            let width = statement.column_count();
            let mut rows = statement
                .query_map([], |row| {
                    let values = (0..width)
                        .map(|index| row.get::<_, rusqlite::types::Value>(index))
                        .collect::<rusqlite::Result<Vec<_>>>()?;
                    Ok(format!("{values:?}"))
                })?
                .collect::<rusqlite::Result<Vec<_>>>()?;
            rows.sort();
            snapshot.push((table, rows));
        }
        Ok(snapshot)
    }

    fn scalar(conn: &Connection, sql: &str) -> Result<i64, AppError> {
        Ok(conn.query_row(sql, [], |row| row.get(0))?)
    }

    #[test]
    fn parser_handles_bom_crlf_semicolon_quotes_and_multiline_values() -> Result<(), AppError> {
        let mut conn = database()?;
        let csv = "\u{feff}\"name\";brand;description\r\n\" Milk; \"\"\"; Brand ;\" line one\r\nline two \"\r\n";
        let result = preview(&mut conn, ImportKind::Items, csv)?;
        assert!(result.can_commit, "{:?}", result.errors);
        assert_eq!(result.columns, ["name", "brand", "description"]);
        assert_eq!(
            result.rows[0].values,
            ["Milk; \"", "Brand", "line one\r\nline two"]
        );
        assert_eq!(result.rows[0].row_number, 2);
        assert_eq!(delimiter("\"unknown,header\";name\n"), b';');
        assert_eq!(delimiter("\"unknown;header\",name\n"), b',');
        assert_eq!(delimiter("\"unknown\"\",;header\";name\n"), b';');
        let comma = preview(
            &mut conn,
            ImportKind::Items,
            "description,name\n\"A, B\",\" A \"\n",
        )?;
        assert!(comma.can_commit);
        assert_eq!(comma.columns, ["description", "name"]);
        assert_eq!(comma.rows[0].values, ["A, B", "A"]);
        Ok(())
    }

    #[test]
    fn money_is_exact_for_every_supported_precision_and_safe_boundary() -> Result<(), AppError> {
        assert_eq!(
            parse_money("90071992547409.91", 2, false, "amount")?,
            MAX_SAFE_INTEGER
        );
        assert_eq!(
            parse_money("90071992,54740991", 8, false, "amount")?,
            MAX_SAFE_INTEGER
        );
        assert_eq!(
            parse_money("9007199254740991", 0, false, "amount")?,
            MAX_SAFE_INTEGER
        );
        assert_eq!(parse_money("00012.3", 2, false, "amount")?, 1230);
        assert_eq!(parse_money("0", 8, true, "price")?, 0);
        for decimals in 0..=8 {
            assert_eq!(
                parse_money("1", decimals, false, "amount")?,
                10_i64.pow(decimals)
            );
        }
        for value in [
            "",
            "-1",
            "+1",
            "1e2",
            "1_000",
            "1 000",
            "1,000.00",
            "1.000,00",
            "1.2.3",
            "1.",
            ".1",
            "NaN",
            "inf",
            "1/2",
            "90071992547409.92",
            "9223372036854775808",
            "0",
            "0.001",
        ] {
            assert!(parse_money(value, 2, false, "amount").is_err(), "{value}");
        }
        assert!(parse_money("1.0", 0, false, "amount").is_err());
        assert_eq!(parse_id("9007199254740991", "id")?, MAX_SAFE_INTEGER);
        for value in [
            "0",
            "-1",
            "+1",
            "1.0",
            "1e1",
            "1x",
            "1 2",
            " 1",
            "9007199254740992",
            "9223372036854775808",
            "",
        ] {
            assert!(parse_id(value, "id").is_err(), "{value}");
        }
        assert_eq!(parse_quantity("1,25")?, 1.25);
        for value in ["NaN", "inf", "-1", "+1", "0", "1e2", "1,000.2"] {
            assert!(parse_quantity(value).is_err(), "{value}");
        }
        assert!(parse_quantity(&"9".repeat(400)).is_err());
        Ok(())
    }

    #[test]
    fn headers_missing_fields_empty_files_and_limits_are_actionable() -> Result<(), AppError> {
        let mut conn = database()?;
        for csv in [
            "",
            "name\n",
            "name,name\nA,B",
            "name,typo\nA,B",
            "name,\nA,B",
            "brand\nA",
        ] {
            let result = preview(&mut conn, ImportKind::Items, csv)?;
            assert!(!result.can_commit, "{csv}");
            assert!(result.errors.iter().any(|issue| issue.row_number == 1));
            assert_eq!(result.valid_rows, 0);
            assert!(commit(&mut conn, ImportKind::Items, csv).is_err());
        }
        for csv in [
            "name\n\"Unclosed",
            "name\nBad\"quote",
            "name\n\"Closed\"junk",
        ] {
            let result = preview(&mut conn, ImportKind::Items, csv)?;
            assert!(!result.can_commit, "{csv}");
            assert_eq!(result.errors[0].row_number, 2);
        }
        let result = preview(
            &mut conn,
            ImportKind::Items,
            "name,brand\n,Brand\nA,B,C\nValid,\n",
        )?;
        assert_eq!((result.total_rows, result.valid_rows), (3, 1));
        assert_eq!(result.errors[0].row_number, 2);
        assert_eq!(result.errors[1].row_number, 3);
        assert!(!result.can_commit);
        let limit = format!("name\n{}", "A\n".repeat(MAX_IMPORT_ROWS));
        assert_eq!(
            parse(&request(ImportKind::Items, &limit))?.total_rows,
            MAX_IMPORT_ROWS as u32
        );
        let too_many = format!("{limit}A\n");
        assert!(matches!(
            parse(&request(ImportKind::Items, &too_many)),
            Err(AppError::Validation(_))
        ));
        let oversized = "é".repeat(MAX_IMPORT_BYTES / 2 + 1);
        assert!(matches!(
            parse(&request(ImportKind::Items, &oversized)),
            Err(AppError::Validation(_))
        ));
        assert!(snapshot(&conn)?
            .iter()
            .any(|(name, _)| name == "sqlite_sequence"));
        Ok(())
    }

    #[test]
    fn all_five_kinds_preview_without_any_persistent_side_effect() -> Result<(), AppError> {
        let mut conn = seeded()?;
        let before = snapshot(&conn)?;
        for (kind, csv) in [
            (
                ImportKind::Accounts,
                "name,account_type,currency_code,initial_balance\nNew,cash,USD,1.23",
            ),
            (
                ImportKind::Categories,
                "name,type,parent_id\nChild,expense,1",
            ),
            (ImportKind::Items, "name,description\nNew,Searchable"),
            (
                ImportKind::Movements,
                "date,type,account_id,amount,to_account_id\n2026-01-02,transfer,1,2.34,2",
            ),
            (
                ImportKind::Purchases,
                "movement_id,item_id,quantity,unit_price\n1,1,1.5,2.51",
            ),
        ] {
            let result = preview(&mut conn, kind, csv)?;
            assert!(result.can_commit, "{kind:?}: {:?}", result.errors);
            assert_eq!((result.total_rows, result.valid_rows), (1, 1));
            assert_eq!(snapshot(&conn)?, before, "{kind:?}");
        }
        assert!(before
            .iter()
            .any(|(name, _)| name.contains("fts") && name.ends_with("_data")));
        Ok(())
    }

    #[test]
    fn commits_each_kind_using_existing_validation_and_generated_totals() -> Result<(), AppError> {
        let mut conn = database()?;
        let result = commit(&mut conn, ImportKind::Accounts, "name,account_type,currency_code,initial_balance\nCash,cash,USD,12.50\nBank,checking,USD,0\nYen,cash,JPY,")?;
        assert_eq!(
            (
                result.imported_rows,
                result.created_movements,
                result.created_purchases
            ),
            (3, 1, 0)
        );
        assert_eq!(
            scalar(&conn, "SELECT amount FROM movements WHERE id = 1")?,
            1250
        );
        let categories = commit(&mut conn, ImportKind::Categories, "name,type\nFood,expense")?;
        assert_eq!(categories.imported_rows, 1);
        commit(
            &mut conn,
            ImportKind::Categories,
            "parent_id,type,name\n1,expense,Milk",
        )?;
        let items = commit(
            &mut conn,
            ImportKind::Items,
            "description,name,brand\nOne litre,Milk,Brand",
        )?;
        assert_eq!(items.imported_rows, 1);
        let movements = commit(
            &mut conn,
            ImportKind::Movements,
            "date,type,account_id,amount,category_id\n2026-01-02,expense,1,10.00,2",
        )?;
        assert_eq!(
            (movements.imported_rows, movements.created_movements),
            (1, 1)
        );
        let purchases = commit(
            &mut conn,
            ImportKind::Purchases,
            "movement_id;item_id;quantity;unit_price\n2;1;1,5;2,51\n2;1;2;0",
        )?;
        assert_eq!(
            (
                purchases.imported_rows,
                purchases.created_purchases,
                purchases.created_movements
            ),
            (2, 2, 0)
        );
        assert_eq!(
            scalar(&conn, "SELECT total_price FROM purchases WHERE id = 1")?,
            376
        );
        assert_eq!(
            scalar(&conn, "SELECT unit_price FROM purchases WHERE id = 1")?,
            251
        );
        assert_eq!(
            scalar(&conn, "SELECT total_price FROM purchases WHERE id = 2")?,
            0
        );
        let duplicate = commit(&mut conn, ImportKind::Items, "name\nMilk")?;
        assert_eq!(duplicate.imported_rows, 1);
        assert_eq!(
            scalar(&conn, "SELECT COUNT(*) FROM items WHERE name = 'Milk'")?,
            2
        );
        Ok(())
    }

    #[test]
    fn transfers_count_both_legs_and_use_destination_currency_precision() -> Result<(), AppError> {
        let mut conn = seeded()?;
        let result = commit(&mut conn, ImportKind::Movements, "date,type,account_id,amount,to_account_id,to_amount\n2026-01-02,transfer,1,1.25,2,\n2026-01-02,transfer,1,1.25,3,180")?;
        assert_eq!((result.imported_rows, result.created_movements), (2, 4));
        assert_eq!(
            scalar(
                &conn,
                "SELECT COUNT(*) FROM movements WHERE type = 'transfer_out'"
            )?,
            2
        );
        assert_eq!(
            scalar(
                &conn,
                "SELECT COUNT(*) FROM movements WHERE type = 'transfer_in'"
            )?,
            2
        );
        assert_eq!(
            scalar(&conn, "SELECT amount FROM movements WHERE account_id = 3")?,
            180
        );
        for tail in [
            "transfer,1,1.25,3,180.1",
            "transfer,1,1.25,3,",
            "transfer,1,1.25,2,2.00",
            "transfer_out,1,1.25,2,",
            "transfer_in,1,1.25,2,",
        ] {
            let csv =
                format!("date,type,account_id,amount,to_account_id,to_amount\n2026-01-02,{tail}");
            assert!(
                !preview(&mut conn, ImportKind::Movements, &csv)?.can_commit,
                "{tail}"
            );
        }
        Ok(())
    }

    #[test]
    fn late_row_errors_rollback_every_table_and_report_each_invalid_row() -> Result<(), AppError> {
        let mut conn = seeded()?;
        let before = snapshot(&conn)?;
        let csv = "date,type,account_id,amount,description\n2026-01-02,income,1,1.00,Searchable\n2026-01-02,expense,999,1.00,Missing\n2026-02-30,expense,1,1.00,Bad date";
        let result = preview(&mut conn, ImportKind::Movements, csv)?;
        assert_eq!((result.total_rows, result.valid_rows), (3, 1));
        assert_eq!(
            result
                .errors
                .iter()
                .map(|issue| issue.row_number)
                .collect::<Vec<_>>(),
            [3, 4]
        );
        assert_eq!(snapshot(&conn)?, before);
        assert!(matches!(
            commit(&mut conn, ImportKind::Movements, csv),
            Err(AppError::Validation(_))
        ));
        assert_eq!(snapshot(&conn)?, before);
        // A failure after writing the outgoing leg must also undo the first row.
        conn.execute_batch("CREATE TRIGGER fail_import_leg BEFORE INSERT ON movements WHEN NEW.type = 'transfer_in' BEGIN SELECT RAISE(ABORT, 'test destination failure'); END;")?;
        let before = snapshot(&conn)?;
        let csv = "date,type,account_id,amount,to_account_id\n2026-01-02,income,1,1.00,\n2026-01-02,transfer,1,1.00,2";
        let result = preview(&mut conn, ImportKind::Movements, csv)?;
        assert_eq!(result.valid_rows, 1);
        assert!(!result.can_commit);
        assert_eq!(snapshot(&conn)?, before);
        assert!(commit(&mut conn, ImportKind::Movements, csv).is_err());
        assert_eq!(snapshot(&conn)?, before);
        Ok(())
    }

    #[test]
    fn every_resource_rolls_back_when_a_later_row_fails() -> Result<(), AppError> {
        let mut conn = seeded()?;
        let before = snapshot(&conn)?;
        for (kind, csv) in [
            (ImportKind::Accounts, "name,account_type,currency_code,initial_balance\nGood,cash,USD,1.00\nBad,cash,ZZZ,1.00"),
            (ImportKind::Categories, "name,type\nGood,expense\nBad,wrong"),
            (ImportKind::Items, "name,description\nGood,Searchable\n\" \",Invalid"),
            (ImportKind::Purchases, "movement_id,item_id,quantity,unit_price\n1,1,1.5,2.51\n1,999,1,1.00"),
        ] {
            let result = preview(&mut conn, kind, csv)?;
            assert_eq!((result.total_rows, result.valid_rows), (2, 1), "{kind:?}");
            assert_eq!(result.errors[0].row_number, 3);
            assert_eq!(snapshot(&conn)?, before);
            assert!(commit(&mut conn, kind, csv).is_err());
            assert_eq!(snapshot(&conn)?, before, "{kind:?}");
        }
        Ok(())
    }

    #[test]
    fn failed_opening_balance_rolls_back_account_before_next_row() -> Result<(), AppError> {
        let mut conn = database()?;
        conn.execute_batch("CREATE TRIGGER fail_import_opening BEFORE INSERT ON movements BEGIN SELECT RAISE(ABORT, 'test opening failure'); END;")?;
        let before = snapshot(&conn)?;
        let csv =
            "name,account_type,currency_code,initial_balance\nBad,cash,USD,1\nGood,cash,USD,0";
        let result = preview(&mut conn, ImportKind::Accounts, csv)?;
        assert_eq!((result.total_rows, result.valid_rows), (2, 1));
        assert_eq!(result.errors[0].row_number, 2);
        assert_eq!(snapshot(&conn)?, before);
        assert!(commit(&mut conn, ImportKind::Accounts, csv).is_err());
        assert_eq!(snapshot(&conn)?, before);
        Ok(())
    }

    #[test]
    fn stale_references_are_revalidated_and_same_file_parent_ids_are_rejected(
    ) -> Result<(), AppError> {
        let mut conn = seeded()?;
        let csv = "movement_id,item_id,quantity,unit_price\n1,1,1,1.00";
        assert!(preview(&mut conn, ImportKind::Purchases, csv)?.can_commit);
        conn.execute("UPDATE items SET is_archived = 1 WHERE id = 1", [])?;
        let before = snapshot(&conn)?;
        assert!(commit(&mut conn, ImportKind::Purchases, csv).is_err());
        assert_eq!(snapshot(&conn)?, before);
        let csv = "name,type,parent_id\nNew,expense,\nChild,expense,2";
        let result = preview(&mut conn, ImportKind::Categories, csv)?;
        assert_eq!(result.valid_rows, 1);
        assert!(!result.can_commit);
        assert!(result.errors[0].message.contains("antes de importar"));
        assert!(commit(&mut conn, ImportKind::Categories, csv).is_err());
        assert_eq!(snapshot(&conn)?, before);
        let csv = "date,type,account_id,amount\n2026-01-02,income,1,1.00";
        assert!(preview(&mut conn, ImportKind::Movements, csv)?.can_commit);
        conn.execute("UPDATE accounts SET is_active = 0 WHERE id = 1", [])?;
        let before = snapshot(&conn)?;
        assert!(commit(&mut conn, ImportKind::Movements, csv).is_err());
        assert_eq!(snapshot(&conn)?, before);
        Ok(())
    }

    #[test]
    fn imports_do_not_bypass_resource_rules() -> Result<(), AppError> {
        let mut conn = seeded()?;
        let before = snapshot(&conn)?;
        for (kind, csv) in [
            (
                ImportKind::Accounts,
                "name,account_type,currency_code\nBad,invalid,USD",
            ),
            (
                ImportKind::Accounts,
                "name,account_type,currency_code\nBad,cash,ZZZ",
            ),
            (
                ImportKind::Accounts,
                "name,account_type,currency_code,initial_balance\nBad,cash,USD,-1",
            ),
            (ImportKind::Categories, "name,type,parent_id\nBad,income,1"),
            (
                ImportKind::Categories,
                "name,type,parent_id\nBad,expense,999",
            ),
            (ImportKind::Items, "name\n\" \""),
            (
                ImportKind::Movements,
                "date,type,account_id,amount,currency_code\n2026-01-01,expense,1,1.00,EUR",
            ),
            (
                ImportKind::Movements,
                "date,type,account_id,amount,category_id\n2026-01-01,income,1,1.00,1",
            ),
            (
                ImportKind::Movements,
                "date,type,account_id,amount\n2026-01-01,expense,1x,1.00",
            ),
            (
                ImportKind::Purchases,
                "movement_id,item_id,quantity,unit_price\n1,999,1,1.00",
            ),
            (
                ImportKind::Purchases,
                "movement_id,item_id,quantity,unit_price\n1,1,2,90071992547409.91",
            ),
        ] {
            let result = preview(&mut conn, kind, csv)?;
            assert!(!result.can_commit, "{kind:?}: {csv}");
            assert!(!result.errors.is_empty());
            assert!(commit(&mut conn, kind, csv).is_err());
            assert_eq!(snapshot(&conn)?, before);
        }
        Ok(())
    }

    #[test]
    fn templates_expose_serialized_data_types_for_every_column() -> Result<(), AppError> {
        for template in get_import_templates() {
            for column in template.columns {
                let expected = match column.name.as_str() {
                    "account_id" | "category_id" | "shop_id" | "to_account_id" | "parent_id"
                    | "movement_id" | "item_id" => "integer",
                    "amount" | "to_amount" | "initial_balance" | "unit_price" | "quantity" => {
                        "decimal"
                    }
                    "date" => "date",
                    "type" | "account_type" => "enum",
                    "name" | "brand" | "description" | "notes" | "currency_code" => "text",
                    name => panic!("Missing expected type for {name}"),
                };
                let json = serde_json::to_value(&column)
                    .map_err(|error| AppError::Internal(error.to_string()))?;
                assert_eq!(json["dataType"], expected, "{}", column.name);
            }
        }
        Ok(())
    }

    #[test]
    fn dto_and_template_contracts_match_frontend_exactly() -> Result<(), AppError> {
        let templates = get_import_templates();
        assert_eq!(templates.len(), 5);
        let json =
            serde_json::to_value(&templates).map_err(|e| AppError::Internal(e.to_string()))?;
        assert_eq!(json[0]["kind"], "accounts");
        assert!(json[0]["exampleCsv"].is_string());
        for (template, expected) in templates.iter().zip([
            "name,account_type,currency_code,description,initial_balance",
            "name,type,parent_id", "name,brand,description",
            "date,type,account_id,amount,currency_code,description,notes,category_id,shop_id,to_account_id,to_amount",
            "movement_id,item_id,quantity,unit_price,notes",
        ]) {
            assert_eq!(template.columns.iter().map(|c| c.name.as_str()).collect::<Vec<_>>().join(","), expected);
            let parsed = parse(&request(template.kind, &template.example_csv))?;
            assert!(parsed.errors.is_empty(), "{:?}", parsed.errors);
            assert_eq!(parsed.total_rows, 1);
            assert_eq!(parsed.rows[0].values.len(), parsed.columns.len());
        }
        let input: ImportRequest =
            serde_json::from_value(serde_json::json!({"kind":"items","csv":"name\nA"}))
                .map_err(|e| AppError::Internal(e.to_string()))?;
        let mut conn = database()?;
        let (preview, result) = execute_import(&mut conn, input, false)?;
        let preview =
            serde_json::to_value(preview).map_err(|e| AppError::Internal(e.to_string()))?;
        assert_eq!(preview["totalRows"], 1);
        assert_eq!(preview["validRows"], 1);
        assert_eq!(preview["canCommit"], true);
        assert_eq!(preview["rows"][0]["rowNumber"], 2);
        let result = serde_json::to_value(result).map_err(|e| AppError::Internal(e.to_string()))?;
        assert_eq!(result["importedRows"], 1);
        assert_eq!(result["createdMovements"], 0);
        assert_eq!(result["createdPurchases"], 0);
        let config = ts_rs::Config::default();
        assert!(!ImportKind::decl(&config).contains("\"initial_balance\""));
        assert!(ImportTemplate::decl(&config).contains("exampleCsv: string"));
        assert!(ImportPreview::decl(&config).contains("totalRows: number"));
        assert!(!ImportResult::decl(&config).contains("bigint"));
        Ok(())
    }
}
