# Orbit

Private, offline-first personal finance desktop application. Tauri v2 + Rust +
SQLite, with React, TypeScript, Tailwind CSS v4, TanStack Query, Zustand, and
Lightweight Charts. The interface retains the project's Spanish localization.
Orbit records your own bookkeeping; it does not connect to banks or move real money.

## Development

Requirements: Bun, Rust's stable MSVC toolchain, Tauri's platform prerequisites,
and WebView2 on Windows. Vite 7 recommends Node 22.12+ (or 20.19+). Dependencies
must be installed once; the installed desktop application does not require a
network connection.

```sh
bun install --frozen-lockfile
bun run tauri dev
```

`bun run dev` alone serves the frontend, but persistent operations require the
Tauri runtime. Browser tests provide an IPC test double; normal browser mode does
not silently replace SQLite with browser storage or demo data.

```sh
bun run build          # TypeScript and production frontend bundle
bun run typegen        # Generate shared TypeScript DTOs from Rust using ts-rs
bun run test           # Money, analytics, hierarchy, query keys, and hook tests
bun run test:types     # Typecheck test code and browser fixtures
bun run test:e2e       # Browser workflows; uses locally installed Microsoft Edge
bun run tauri build --no-bundle  # Compile the native release executable
```

Run Rust validation from `src-tauri` so Cargo discovers its `.cargo/config.toml`:

```sh
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
cargo test
```

`bun run typegen` sets the working directory correctly on Windows and other
platforms. Do not manually edit `src/types/generated/`. If using the Rust tests
from the repository root, run the typegen script afterwards; Cargo configuration
is discovered from the current directory, not from `--manifest-path`.

The Edge browser tests use mocked Tauri IPC and verify actual DOM interactions,
chart canvases, responsive layouts, modal focus, and offline assets. The Rust
tests independently exercise real SQLite queries, migrations, and transactions.
Neither substitutes for a native desktop acceptance test.

Keep the Tauri JavaScript API and opener plugin on the same major/minor versions
as the locked Rust crates. Their JavaScript ranges are pinned accordingly.

## Views

- **Wallet / Billetera:** account creation and editing, opening balance ledger
  entries, per-currency balances and net worth, search, pagination, archiving,
  and archived history. Each row and account detail has a direct account-filtered
  movement-history action, including archived accounts. Supports all eight account types in the schema.
- **Movements:** income, expense, opening balances, and logical transfers;
  description/notes FTS5 search, account/category/currency/type/date filters,
  server pagination, editing, deletion, and purchase-line details. Open an expense
  and choose **Vincular artículo** to attach an existing item, quantity, and unit price.
- **Categories:** user-defined income/expense/both categories, hierarchy,
  cycle/type validation, editing, searching, and archiving.
- **Items / Artículos:** product/service catalog, editing, archiving,
  fractional-quantity purchase lines on existing expense movements, price
  history charts/tables by currency and shop, and mistaken-line deletion. Charts
  show the last purchase line per date; tables retain every price observation.
- **Analytics:** monthly income/expense/net, category spending, current net
  worth by currency, configurable periods, exact tables, and chart averages.
  Duplicate category names remain separate by ID, with hierarchy paths for labels.
- **Preferences:** four themes (original dark, dim graphite, light cream, and
  burnt-orange ember), a persistent noise switch, a local shop catalog, and CSV
  import. CSV import is also available from Movements.

Purchase lines describe a movement; adding or deleting them **does not change
its amount**. The movement remains the authoritative total, allowing incomplete
receipts, discounts, tax, or unitemized costs. The existing generated-column
policy truncates fractional minor units in purchase totals; it is not changed to
round-to-nearest.

## CSV import

Open **Movimientos → Importar CSV** or **Configuración → Importar CSV**. Select
one record type, consult its column definitions/SQLite reference IDs, and download
an example. Selecting a file automatically maps exact header names to Orbit fields
and shows a paginated preview with row-level validation errors.

Nothing is committed during preview. To import, all rows must be valid and you must
check the review confirmation and select **Confirmar importación**. **Descartar y
cerrar** (or Escape when idle) leaves no imported records. Confirmation revalidates
against the current database and commits the entire file in one transaction.
If any row fails, none are saved. Imports are not retried automatically and a
synchronous submission guard prevents double-clicks from committing twice.

### File format

- UTF-8 (optional BOM), comma or semicolon separator, one header row.
- Column order is arbitrary; names are exact and case-sensitive. Unknown,
  duplicate, missing required, or empty headers are rejected.
- Optional columns can be omitted or left empty. Required values cannot be empty.
- Double-quote fields containing delimiters/newlines; double embedded quotes.
- Up to **2,000 data records and 5 MiB per file**. Preview row numbers count CSV
  records (header = 1), not physical lines inside quoted fields.
- Dates: `YYYY-MM-DD`. IDs: existing positive SQLite integer IDs, not names.
  **Consultar IDs de referencia** shows available account/category/shop/item IDs
  and a searchable, paginated expense list for purchase references.
- Monetary values are **major units**, not cents: `12.50` means 12.50 units.
  Decimal dot or comma is accepted, without thousands separators, currency
  symbols, signs, or exponents. Quote decimal commas in comma-delimited CSVs,
  or use semicolons. Precision follows the account/movement currency (JPY: 0,
  ARS/USD/EUR/GBP: 2). Amounts must fit the safe integer minor-unit range.
- Import dependencies in separate files: accounts/categories/items first, then
  movements, then purchase lines. Category parents must predate their file.
  References are not created automatically or guessed by name.
- These are **new records**, not updates/upserts. Reimporting the same file
  creates duplicates. If a response is lost, inspect records before retrying.

### Columns

| Record type | Required columns | Optional columns |
| --- | --- | --- |
| Accounts | `name`, `account_type`, `currency_code` | `description`, `initial_balance` |
| Categories | `name`, `type` | `parent_id` |
| Items | `name` | `brand`, `description` |
| Movements | `date`, `type`, `account_id`, `amount` | `currency_code`, `description`, `notes`, `category_id`, `shop_id`, `to_account_id`, `to_amount` |
| Purchase lines | `movement_id`, `item_id`, `quantity`, `unit_price` | `notes` |

- Account `account_type`: `cash`, `checking`, `savings`, `credit_card`,
  `investment`, `loan`, `digital_wallet`, or `other`. Currency must exist and be
  active. `initial_balance` is nonnegative; zero/empty creates no ledger row.
  A positive opening balance creates an `initial_balance` movement dated today.
- Category `type`: `income`, `expense`, or `both`. Parent must be active,
  type-compatible, and already exist before the import.
- Movement `type`: `income`, `expense`, `transfer`, or `initial_balance`.
  Amount is positive and its currency is inferred from the account; an explicit
  `currency_code` must match. Categories apply to income/expenses; shops only to
  expenses. Accounts/categories must be active.
- A single `transfer` row creates **both linked ledger legs**. Specify another
  active `to_account_id`; same-currency `to_amount` can be omitted, but if
  supplied must match. Cross-currency transfers require a positive `to_amount`
  in the destination currency. Do not import raw `transfer_out`/`transfer_in` rows.
- Purchases reference an existing **expense** and nonarchived item. Quantity is
  positive and can be fractional. `unit_price` is nonnegative in the expense's
  currency. Date and shop come from the expense; generated totals preserve the
  normal truncation policy. Importing purchase lines does not alter its amount.

For example, after replacing `1` with a valid active account ID:

```csv
date,type,account_id,amount,description,notes
2026-10-01,income,1,1500.00,Salary,Imported history
2026-10-02,expense,1,12.50,"Coffee, milk",Receipt
```

A purchase-line file links an existing item to an existing expense (replace both
example IDs with valid references):

```csv
movement_id,item_id,quantity,unit_price,notes
2,1,1.5,2.50,Fractional quantity
```

## Architecture and invariants

- All persistent data passes through generated DTOs and the typed `command`
  boundary in `src/lib/commands.ts`. IPC rejections become useful `Error`s.
- TanStack Query owns SQLite-backed data. Mutations invalidate all affected
  query roots; no persistent records are mirrored into Zustand or manually
  appended to lists. Query keys include complete filters, including search.
- Zustand owns navigation and optional modal UI only. Local forms and filters
  use React state; these are ephemeral and are not another financial datastore.
- Money is positive integer minor units; its direction is determined by movement
  type. Account balances are calculated by `v_account_balances`; reporting uses
  `v_monthly_summary` and `v_category_spending`. Opening balances and transfers
  are excluded from income/expense reporting.
- Transfers create/update/delete two linked legs in one SQLite transaction.
  Same-currency amounts must match; cross-currency amounts are explicitly
  entered. There are no rates, conversions, or cross-currency grand totals.
- Monetary input is parsed from decimal strings, not multiplied as binary
  floating point. Monetary IPC values are checked against JavaScript's safe
  integer range. Presentation aggregates use BigInt to avoid summation loss.
- Archiving accounts/categories/items preserves history and references. Category
  parents must be active, type-compatible, and cycle-free. Account currency is
  immutable through the app and must match its movements.
- SQLite enables foreign keys and WAL on each connection. Startup migrations
  are versioned and atomic, refresh outdated views, validate existing data,
  rebuild FTS once, and fail startup on errors instead of continuing half-ready.
- Theme and noise preferences live in SQLite and are saved atomically. `localStorage`
  is only a synchronous startup cache (`orbit-theme`, `orbit-noise-enabled`) to
  prevent a flash before React and the first settings query load. Saving one
  preference preserves the other; a failed save leaves the current appearance intact.

## Local storage and old databases

The database is `app.db` in Tauri's application-local-data directory. With the
current Windows identifier this is normally `%LOCALAPPDATA%\\com.orbit.dev\\`.
The application does not upload this database. SQLite is **not encrypted**.
For a manual backup, close Orbit and copy the complete application-data directory;
copying only `app.db` while WAL is active can omit recent writes.

Schema version 3 initializes fresh files and upgrades the unversioned current
schema or versions 1/2 transactionally, without deleting user records. Version 3
adds the noise preference without overwriting existing settings. Offline
currency metadata is seeded for ARS, USD, EUR, GBP, and JPY. No categories or
financial demo data are seeded.

**Legacy files using `accounts.acc_type`, `movements.mov_type`, or
`balance_snapshots` are deliberately not converted automatically.** Startup
refuses them and preserves the file. A separate, explicit migration must decide
how old snapshots, ambiguous transfer direction, and historical ARS conversions
map to the new ledger. Back up the file before that work; do not delete it to make
startup proceed. Inconsistent transfer groups and unsupported future schema
versions are likewise rejected rather than guessed at or discarded.

## Visual system

Tailwind classes use semantic CSS variables for foregrounds, surfaces, borders,
controls, CSV type badges, and charts. Available in **Configuración → Apariencia**:

- **Negro / original:** near-black background and silver editorial accents.
- **Grafito / tenue:** a softer dark graphite palette.
- **Crema / almendra:** `#F6E9C7` paper with dark ink and contrasting chart colors.
- **Brasa / naranja quemado:** `#191816` graphite with a burnt-orange ambient glow.

The **Textura de ruido** switch controls a static, local grayscale SVG grain over
the full UI, including titlebar and modal surfaces. It ignores pointer events and
is independently persisted for future sessions. No animation or network request
is needed. Secondary text uses opaque muted tokens for readable light-theme
contrast rather than opacity levels tuned only for black backgrounds.

Instrument Serif and JetBrains Mono are bundled locally through Fontsource;
there are no runtime font requests. Chart comparison series use monochrome ink,
periwinkle, and amber (darker equivalents in cream), never green. Native chart
primitives provide a coordinate-aligned stipple field, line glow, and staggered
columns. Canvas charts update their palette in place when the theme changes.
Financial counters and chart motion honor reduced-motion preferences. Native
dialogs provide focus trapping, Escape behavior, and focus restoration.

### Custom desktop titlebar

`src/components/titlebar.tsx` follows the
[Tauri window-customization guide](https://tauri.app/learn/window-customization/).
Native decorations are disabled; the theme-transparent header provides drag
regions and minimize, maximize/restore, and close controls through Tauri's Window
API. Interactive controls are excluded from drag regions. Window state follows
native resize events; listeners are cleaned up, actions are guarded against
repeated submission, and failures are shown without losing access to controls.
Only the required explicit window permissions are added for the main window.
SQLite preferences also set the native window background at startup and on save.

Window controls are intentionally disabled in ordinary browser previews. Edge
integration tests exercise real Tauri SDK calls against a window test double;
OS-native dragging and window-manager behavior still require a desktop smoke test.
Custom decorations may differ from native macOS window-management conventions.

## Scope and known limits

The schema retains extension points for tags, attachments, budgets, recurrence,
and audit history. Tags/attachments do not yet have management UI; budgets and
recurrence are not implemented. There is no licensing, bank automation,
exchange-rate service, cloud sync, encryption, or automatic backup service.
Opening balances are nonnegative under the current positive-ledger schema.

The dependency audit still reports transitive development-tool advisories.
Compatible direct dependency updates were applied, but resolving every advisory
may require a deliberate build-tool upgrade or reviewed overrides. This is not
presented as a clean security audit. The only external chart link is attribution;
fonts, rendering, and financial data remain local.
