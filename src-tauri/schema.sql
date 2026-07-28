-- ============================================================================
-- PRAGMAS & SETUP
-- ============================================================================
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- ============================================================================
-- CURRENCIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS currencies (
    code            TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    symbol          TEXT NOT NULL,
    decimal_places  INTEGER NOT NULL DEFAULT 2 CHECK(decimal_places BETWEEN 0 AND 8),
    is_active       INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1))
) STRICT;

-- ============================================================================
-- ACCOUNTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS accounts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    type            TEXT NOT NULL CHECK(type IN (
                        'cash', 'checking', 'savings', 'credit_card',
                        'investment', 'loan', 'digital_wallet', 'other'
                    )),
    currency_code   TEXT NOT NULL REFERENCES currencies(code),
    description     TEXT,
    is_active       INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active) WHERE is_active = 1;

-- ============================================================================
-- CATEGORIES (Hierarchical, User-Defined)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL CHECK(type IN ('income', 'expense', 'both')),
    parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    is_active   INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK(parent_id != id)
) STRICT;

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = 1;

-- ============================================================================
-- TAGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS tags (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE,
    color       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

-- ============================================================================
-- ITEMS (Product/Service catalog for price tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    brand       TEXT,
    is_archived INTEGER NOT NULL DEFAULT 0, -- 0 = Activo, 1 = Archivado (Soft Delete)
    description TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

-- ============================================================================
-- Shops
-- ============================================================================
CREATE TABLE IF NOT EXISTS shops (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    address         TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

-- ============================================================================
-- movements
-- ============================================================================
CREATE TABLE IF NOT EXISTS movements (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id          INTEGER NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    type                TEXT NOT NULL CHECK(type IN ('income', 'expense', 'transfer_out', 'transfer_in')),
    amount              INTEGER NOT NULL CHECK(amount > 0),
    currency_code       TEXT NOT NULL REFERENCES currencies(code),
    date                TEXT NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    notes               TEXT,
    category_id         INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    shop_id             INTEGER REFERENCES shops(id) ON DELETE SET NULL,
    transfer_group_id   TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK (shop_id IS NULL OR type = 'expense')
) STRICT;

CREATE INDEX IF NOT EXISTS idx_movements_account_date ON movements(account_id, date DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_movements_date ON movements(date);
CREATE INDEX IF NOT EXISTS idx_movements_category ON movements(category_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_movements_transfer_group ON movements(transfer_group_id) WHERE transfer_group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_movements_pure ON movements(account_id, date DESC) WHERE transfer_group_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_movements_shop ON movements(shop_id) WHERE shop_id IS NOT NULL;

-- ============================================================================
-- movement ITEMS (Many-to-Many: movements <> items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchases (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    movement_id  INTEGER NOT NULL REFERENCES movements(id) ON DELETE CASCADE,
    item_id         INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity        REAL NOT NULL DEFAULT 1 CHECK(quantity > 0),
    unit_price      INTEGER NOT NULL CHECK(unit_price >= 0),
    total_price     INTEGER GENERATED ALWAYS AS (CAST(quantity * unit_price AS INTEGER)) STORED,
    notes           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE INDEX IF NOT EXISTS idx_purchases_movement ON purchases(movement_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item ON purchases(item_id);

-- ============================================================================
-- movement TAGS (Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS movement_tags (
    movement_id  INTEGER NOT NULL REFERENCES movements(id) ON DELETE CASCADE,
    tag_id          INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (movement_id, tag_id)
) WITHOUT ROWID, STRICT;

-- ============================================================================
-- ATTACHMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS attachments (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    movement_id  INTEGER NOT NULL REFERENCES movements(id) ON DELETE CASCADE,
    file_name       TEXT NOT NULL,
    file_path       TEXT NOT NULL,
    file_size       INTEGER,
    mime_type       TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE INDEX IF NOT EXISTS idx_attachments_movement ON attachments(movement_id);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name  TEXT NOT NULL,
    record_id   INTEGER NOT NULL,
    operation   TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data    TEXT,
    new_data    TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
) STRICT;

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name, record_id, created_at DESC);

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE VIEW IF NOT EXISTS v_account_balances AS
SELECT
    a.id AS account_id,
    a.name AS account_name,
    a.type AS account_type,
    a.currency_code,
    a.is_active,
    COALESCE(SUM(
        CASE t.type
            WHEN 'income'        THEN  t.amount
            WHEN 'transfer_in'   THEN  t.amount
            WHEN 'expense'       THEN -t.amount
            WHEN 'transfer_out'  THEN -t.amount
            ELSE 0
        END
    ), 0) AS balance,
    COUNT(t.id) AS movement_count
FROM accounts a
LEFT JOIN movements t ON a.id = t.account_id
GROUP BY a.id;

CREATE VIEW IF NOT EXISTS v_account_running_balances AS
SELECT
    t.id,
    t.account_id,
    t.type,
    t.amount,
    t.currency_code,
    t.date,
    t.description,
    t.category_id,
    t.transfer_group_id,
    t.created_at,
    SUM(
        CASE t.type
            WHEN 'income'        THEN  t.amount
            WHEN 'transfer_in'   THEN  t.amount
            WHEN 'expense'       THEN -t.amount
            WHEN 'transfer_out'  THEN -t.amount
            ELSE 0
        END
    ) OVER (
        PARTITION BY t.account_id
        ORDER BY t.date, t.datetime, t.id
    ) AS running_balance
FROM movements t
ORDER BY t.account_id, t.date, t.datetime, t.id;

CREATE VIEW IF NOT EXISTS v_net_worth AS
SELECT
    currency_code,
    SUM(balance) AS total_balance
FROM v_account_balances
WHERE is_active = 1
GROUP BY currency_code;

CREATE VIEW IF NOT EXISTS v_monthly_summary AS
SELECT
    strftime('%Y-%m', date) AS month,
    currency_code,
    SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
    SUM(CASE WHEN type = 'income'  THEN amount ELSE -amount END) AS net
FROM movements
WHERE transfer_group_id IS NULL
GROUP BY strftime('%Y-%m', date), currency_code
ORDER BY month DESC;

CREATE VIEW IF NOT EXISTS v_category_spending AS
SELECT
    c.id AS category_id,
    c.name AS category_name,
    c.type AS category_type,
    t.currency_code,
    strftime('%Y-%m', t.date) AS month,
    SUM(t.amount) AS total_amount,
    COUNT(t.id) AS movement_count
FROM categories c
JOIN movements t ON c.id = t.category_id
WHERE t.transfer_group_id IS NULL
GROUP BY c.id, t.currency_code, strftime('%Y-%m', t.date);

CREATE VIEW IF NOT EXISTS v_transfer_pairs AS
SELECT
    t_out.transfer_group_id,
    t_out.id AS from_movement_id,
    t_out.account_id AS from_account_id,
    a_out.name AS from_account_name,
    t_out.amount AS from_amount,
    t_out.currency_code AS from_currency,
    t_in.id AS to_movement_id,
    t_in.account_id AS to_account_id,
    a_in.name AS to_account_name,
    t_in.amount AS to_amount,
    t_in.currency_code AS to_currency,
    t_out.date,
    t_out.description,
    t_out.created_at,
    CASE
        WHEN t_out.currency_code != t_in.currency_code
        THEN ROUND(CAST(t_out.amount AS REAL) / NULLIF(t_in.amount, 0), 6)
        ELSE NULL
    END AS exchange_rate
FROM movements t_out
JOIN accounts a_out ON t_out.account_id = a_out.id
JOIN movements t_in ON t_out.transfer_group_id = t_in.transfer_group_id
JOIN accounts a_in ON t_in.account_id = a_in.id
WHERE t_out.type = 'transfer_out'
  AND t_in.type = 'transfer_in'
  AND t_out.id < t_in.id;

  CREATE VIEW IF NOT EXISTS v_movement_details AS
  SELECT
      t.id,
      t.account_id,
      a.name AS account_name,
      a.type AS account_type,
      a.currency_code AS account_currency,
      t.type,
      t.amount,
      t.currency_code AS movement_currency,
      t.date,
      t.description,
      t.notes,
      t.transfer_group_id,
      t.created_at,
      c.id AS category_id,
      c.name AS category_name,
      s.id AS shop_id,
      s.name AS shop_name,
      GROUP_CONCAT(DISTINCT tg.name) AS tags,
      (SELECT GROUP_CONCAT(i.name, ', ')
       FROM purchases ti
       JOIN items i ON ti.item_id = i.id
       WHERE ti.movement_id = t.id) AS items
  FROM movements t
  JOIN accounts a ON t.account_id = a.id
  LEFT JOIN categories c ON t.category_id = c.id
  LEFT JOIN shops s ON t.shop_id = s.id
  LEFT JOIN movement_tags tt ON t.id = tt.movement_id
  LEFT JOIN tags tg ON tt.tag_id = tg.id
  GROUP BY t.id
  ORDER BY t.date DESC, t.id DESC;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS trg_accounts_updated_at
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    UPDATE accounts SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_categories_updated_at
AFTER UPDATE ON categories
FOR EACH ROW
BEGIN
    UPDATE categories SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_movements_insert
AFTER INSERT ON movements
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, operation, new_data, created_at)
    VALUES ('movements', NEW.id, 'INSERT', json_object(
        'account_id', NEW.account_id,
        'type', NEW.type,
        'amount', NEW.amount,
        'currency_code', NEW.currency_code,
        'date', NEW.date,
        'description', NEW.description,
        'category_id', NEW.category_id,
        'transfer_group_id', NEW.transfer_group_id
    ), datetime('now'));
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_movements_update
AFTER UPDATE ON movements
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, operation, old_data, new_data, created_at)
    VALUES ('movements', NEW.id, 'UPDATE', json_object(
        'account_id', OLD.account_id,
        'type', OLD.type,
        'amount', OLD.amount,
        'currency_code', OLD.currency_code,
        'date', OLD.date,
        'description', OLD.description,
        'category_id', OLD.category_id,
        'transfer_group_id', OLD.transfer_group_id
    ), json_object(
        'account_id', NEW.account_id,
        'type', NEW.type,
        'amount', NEW.amount,
        'currency_code', NEW.currency_code,
        'date', NEW.date,
        'description', NEW.description,
        'category_id', NEW.category_id,
        'transfer_group_id', NEW.transfer_group_id
    ), datetime('now'));
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_movements_delete
AFTER DELETE ON movements
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, operation, old_data, created_at)
    VALUES ('movements', OLD.id, 'DELETE', json_object(
        'account_id', OLD.account_id,
        'type', OLD.type,
        'amount', OLD.amount,
        'currency_code', OLD.currency_code,
        'date', OLD.date,
        'description', OLD.description,
        'category_id', OLD.category_id,
        'transfer_group_id', OLD.transfer_group_id
    ), datetime('now'));
END;

-- ============================================================================
-- FULL-TEXT SEARCH
-- ============================================================================
CREATE VIRTUAL TABLE IF NOT EXISTS movements_fts USING fts5(
    description,
    notes,
    content='movements',
    content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS trg_fts_movements_insert
AFTER INSERT ON movements
BEGIN
    INSERT INTO movements_fts (rowid, description, notes)
    VALUES (NEW.id, NEW.description, COALESCE(NEW.notes, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_fts_movements_update
AFTER UPDATE ON movements
BEGIN
    INSERT INTO movements_fts (movements_fts, rowid, description, notes)
    VALUES ('delete', OLD.id, OLD.description, COALESCE(OLD.notes, ''));
    INSERT INTO movements_fts (rowid, description, notes)
    VALUES (NEW.id, NEW.description, COALESCE(NEW.notes, ''));
END;

CREATE TRIGGER IF NOT EXISTS trg_fts_movements_delete
AFTER DELETE ON movements
BEGIN
    INSERT INTO movements_fts (movements_fts, rowid, description, notes)
    VALUES ('delete', OLD.id, OLD.description, COALESCE(OLD.notes, ''));
END;
