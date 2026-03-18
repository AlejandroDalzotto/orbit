-- =============================================================
--  Personal Finance App — Database Schema
--  Conventions:
--    - Monetary values stored as INTEGER (cents / centavos)
--    - Dates stored as TEXT in ISO 8601 format (YYYY-MM-DD)
--    - created_at as TEXT datetime
-- =============================================================

PRAGMA foreign_keys = ON;

-- -------------------------------------------------------------
--  ACCOUNTS
--  No balance column: derived via balance_snapshots + movements
-- -------------------------------------------------------------
CREATE TABLE accounts (
    id         INTEGER PRIMARY KEY NOT NULL,
    name       TEXT    NOT NULL,
    acc_type   TEXT    NOT NULL,
    currency   TEXT    NOT NULL DEFAULT 'ARS',
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- -------------------------------------------------------------
--  BALANCE SNAPSHOTS
--  Anchor points for account balance calculation.
--  "On date X, account Y had balance Z."
--  Saldo actual = último snapshot + SUM de movimientos posteriores.
-- -------------------------------------------------------------
CREATE TABLE balance_snapshots (
    id            INTEGER PRIMARY KEY NOT NULL,
    account_id    INTEGER NOT NULL,
    balance       INTEGER NOT NULL, -- en centavos
    snapshot_date TEXT    NOT NULL,
    note          TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (account_id) REFERENCES accounts (id)
);

-- -------------------------------------------------------------
--  CATEGORIES
--  Completamente administradas por el usuario, sin categorías fijas.
-- -------------------------------------------------------------
CREATE TABLE categories (
    id         INTEGER PRIMARY KEY NOT NULL,
    name       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -------------------------------------------------------------
--  MOVEMENTS
--  Tres tipos posibles: income, expense, transfer.
--  Las transferencias internas se vinculan mediante la tabla transfers.
--
--  Multi-moneda:
--    - original_amount: monto en la moneda original (centavos)
--    - ars_amount:      monto convertido a ARS al momento del registro (centavos)
--    - exchange_rate:   tasa usada, NULL si currency = 'ARS'
--    - rate_type:       cotización usada ('blue', 'oficial', 'mep', etc.), NULL si ARS
--
--  Para movimientos en ARS: original_amount == ars_amount, exchange_rate y rate_type NULL.
--  Todos los gráficos y reportes usan ars_amount.
-- -------------------------------------------------------------
CREATE TABLE movements (
    id              INTEGER PRIMARY KEY NOT NULL,
    details         TEXT    NOT NULL,
    date            TEXT    NOT NULL,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
    mov_type        TEXT    NOT NULL CHECK (mov_type IN ('income', 'expense', 'transfer')),
    currency        TEXT    NOT NULL CHECK (currency IN ('ARS', 'USD')) DEFAULT 'ARS',
    original_amount INTEGER NOT NULL, -- en centavos, moneda original
    ars_amount      INTEGER NOT NULL, -- en centavos, convertido a ARS al registrar
    exchange_rate   INTEGER,          -- tasa de conversión, NULL si ARS
    rate_type       TEXT    CHECK (rate_type IN ('blue', 'oficial', 'mep', 'ccl', 'cripto', NULL)),
    account_id      INTEGER NOT NULL,
    category_id     INTEGER,
    FOREIGN KEY (account_id)  REFERENCES accounts    (id),
    FOREIGN KEY (category_id) REFERENCES categories  (id)
);

-- -------------------------------------------------------------
--  TRANSFERS
--  Vincula los dos movimientos de una transferencia interna.
--  debit_mov_id:  movimiento de egreso en la cuenta origen
--  credit_mov_id: movimiento de ingreso en la cuenta destino
-- -------------------------------------------------------------
-- CREATE TABLE transfers (
--     id             INTEGER PRIMARY KEY NOT NULL,
--     debit_mov_id   INTEGER NOT NULL UNIQUE,
--     credit_mov_id  INTEGER NOT NULL UNIQUE,
--     created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
--     FOREIGN KEY (debit_mov_id)  REFERENCES movements (id),
--     FOREIGN KEY (credit_mov_id) REFERENCES movements (id)
-- );

-- -------------------------------------------------------------
--  GROUPS
--  Agrupaciones manuales de movimientos.
-- -------------------------------------------------------------
CREATE TABLE groups (
    id          INTEGER PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Relación N:M entre movements y groups
CREATE TABLE movements_groups (
    id       INTEGER PRIMARY KEY NOT NULL,
    mov_id   INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    FOREIGN KEY (mov_id)   REFERENCES movements (id),
    FOREIGN KEY (group_id) REFERENCES groups    (id),
    UNIQUE (mov_id, group_id)
);

-- -------------------------------------------------------------
--  ITEMS & STORES
--  Para registrar el detalle de compras (qué se compró, dónde).
-- -------------------------------------------------------------
CREATE TABLE items (
    id         INTEGER PRIMARY KEY NOT NULL,
    name       TEXT NOT NULL,
    brand      TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE stores (
    id         INTEGER PRIMARY KEY NOT NULL,
    name       TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -------------------------------------------------------------
--  PURCHASES
--  Detalle de ítems dentro de un movimiento.
--  El precio se almacena en la misma moneda que el movimiento padre.
--  store_id es nullable: no siempre es relevante registrar la tienda.
-- -------------------------------------------------------------
CREATE TABLE purchases (
    id         INTEGER PRIMARY KEY NOT NULL,
    price      INTEGER NOT NULL, -- en centavos, misma moneda que el movimiento
    quantity   INTEGER NOT NULL DEFAULT 1,
    mov_id     INTEGER NOT NULL,
    item_id    INTEGER NOT NULL,
    store_id   INTEGER,          -- nullable
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (mov_id)   REFERENCES movements (id),
    FOREIGN KEY (item_id)  REFERENCES items     (id),
    FOREIGN KEY (store_id) REFERENCES stores    (id)
);

-- =============================================================
--  INDEXES
-- =============================================================
CREATE INDEX idx_movements_account_id        ON movements        (account_id);
CREATE INDEX idx_movements_category_id       ON movements        (category_id);
CREATE INDEX idx_movements_date              ON movements        (date);
CREATE INDEX idx_movements_groups_mov        ON movements_groups (mov_id);
CREATE INDEX idx_movements_groups_group      ON movements_groups (group_id);
CREATE INDEX idx_purchases_mov               ON purchases        (mov_id);
CREATE INDEX idx_purchases_item              ON purchases        (item_id);
CREATE INDEX idx_purchases_store             ON purchases        (store_id);
CREATE INDEX idx_balance_snapshots_account   ON balance_snapshots (account_id, snapshot_date);
-- CREATE INDEX idx_transfers_debit             ON transfers        (debit_mov_id);
-- CREATE INDEX idx_transfers_credit            ON transfers        (credit_mov_id);

-- =============================================================
--  VIEWS
-- =============================================================

-- Detalle completo de un movimiento en una sola consulta
CREATE VIEW v_movement_details AS
SELECT
    m.id,
    m.date,
    m.details,
    m.mov_type,
    m.currency,
    m.original_amount,
    m.ars_amount,
    m.exchange_rate,
    m.rate_type,
    a.name AS account_name,
    c.name AS category_name
FROM movements m
JOIN  accounts   a ON m.account_id  = a.id
LEFT JOIN categories c ON m.category_id = c.id;

-- Gastos mensuales agrupados por categoría (en ARS)
-- Solo incluye mov_type = 'expense'
CREATE VIEW v_monthly_expenses_by_category AS
SELECT
    strftime('%Y-%m', m.date) AS month,
    COALESCE(c.name, 'Sin categoría') AS category,
    SUM(m.ars_amount) AS total_ars
FROM movements m
LEFT JOIN categories c ON m.category_id = c.id
WHERE m.mov_type = 'expense'
GROUP BY month, c.name;

-- Ingresos mensuales agrupados por categoría (en ARS)
CREATE VIEW v_monthly_income_by_category AS
SELECT
    strftime('%Y-%m', m.date) AS month,
    COALESCE(c.name, 'Sin categoría') AS category,
    SUM(m.ars_amount) AS total_ars
FROM movements m
LEFT JOIN categories c ON m.category_id = c.id
WHERE m.mov_type = 'income'
GROUP BY month, c.name;

-- Historial de compras con detalle de ítem y tienda
CREATE VIEW v_purchase_history AS
SELECT
    m.date,
    m.currency,
    p.price,
    p.quantity,
    i.name  AS item_name,
    i.brand,
    s.name  AS store_name,
    m.ars_amount AS movement_total_ars
FROM purchases p
JOIN items     i ON p.item_id  = i.id
JOIN movements m ON p.mov_id   = m.id
LEFT JOIN stores s ON p.store_id = s.id;

-- Balance actual por cuenta
-- Uso: filtrar por account_id en la aplicación.
CREATE VIEW v_account_balance AS
SELECT
    a.id   AS account_id,
    a.name AS account_name,
    a.currency,
    bs.balance + COALESCE(SUM(
        CASE
            WHEN m.mov_type = 'income'   THEN  m.ars_amount
            WHEN m.mov_type = 'expense'  THEN -m.ars_amount
            ELSE 0
        END
    ), 0) AS current_balance_ars
FROM accounts a
JOIN balance_snapshots bs
    ON  bs.account_id    = a.id
    AND bs.snapshot_date = (
        SELECT MAX(snapshot_date)
        FROM balance_snapshots
        WHERE account_id = a.id
    )
LEFT JOIN movements m
    ON  m.account_id = a.id
    AND m.date > bs.snapshot_date
GROUP BY a.id, bs.balance;

-- Obtener todas las cuentas con su respectivo balance calculado (respetando valor original de cada moneda).
-- Uso: wallet view, donde se quiere mostrar el balance en la moneda de la cuenta.
CREATE VIEW v_account_balance_original AS
SELECT
    a.id   AS account_id,
    a.name AS account_name,
    a.acc_type,
    a.currency,
    a.created_at,
    bs.balance + COALESCE(SUM(
        CASE
            WHEN m.mov_type = 'income'   THEN  m.original_amount
            WHEN m.mov_type = 'expense'  THEN -m.original_amount
            ELSE 0
        END
    ), 0) AS current_balance_original
FROM accounts a
JOIN balance_snapshots bs
    ON  bs.account_id    = a.id
    AND bs.snapshot_date = (
        SELECT MAX(snapshot_date)
        FROM balance_snapshots
        WHERE account_id = a.id
    )
LEFT JOIN movements m
    ON  m.account_id = a.id
    AND m.date > bs.snapshot_date
GROUP BY a.id, bs.balance;
