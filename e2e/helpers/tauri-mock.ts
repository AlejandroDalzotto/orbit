import type { Account } from "../../src/types/generated/Account";
import type { AccountFilter } from "../../src/types/generated/AccountFilter";
import type { AccountsPage } from "../../src/types/generated/AccountsPage";
import type { AddAccount } from "../../src/types/generated/AddAccount";
import type { Analytics } from "../../src/types/generated/Analytics";
import type { Category } from "../../src/types/generated/Category";
import type { CategoryEntry } from "../../src/types/generated/CategoryEntry";
import type { Currency } from "../../src/types/generated/Currency";
import type { Item } from "../../src/types/generated/Item";
import type { ItemEntry } from "../../src/types/generated/ItemEntry";
import type { Movement } from "../../src/types/generated/Movement";
import type { MovementEntry } from "../../src/types/generated/MovementEntry";
import type { MovementFilter } from "../../src/types/generated/MovementFilter";
import type { MovementsPage } from "../../src/types/generated/MovementsPage";
import type { Purchase } from "../../src/types/generated/Purchase";
import type { PurchaseEntry } from "../../src/types/generated/PurchaseEntry";
import type { Settings } from "../../src/types/generated/Settings";
import type { Shop } from "../../src/types/generated/Shop";
import type { UpdateAccount } from "../../src/types/generated/UpdateAccount";

export interface MockState {
  accounts: Account[];
  categories: Category[];
  currencies: Currency[];
  items: Item[];
  movements: Movement[];
  purchases: Purchase[];
  shops: Shop[];
  settings: Settings;
  nextId: number;
}

export interface IpcCall {
  command: string;
  args: Record<string, unknown>;
}

interface MockWindow extends Window {
  __TAURI_INTERNALS__: {
    invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
  };
  __orbitMock: { calls: IpcCall[]; errors: string[]; state: MockState };
}

// Serialized by addInitScript: keep all runtime dependencies inside this function.
// This is a UI test double, not a replica or a test of Rust/SQLite validation.
export function installTauriMock() {
  const browser = window as unknown as MockWindow;
  const storageKey = "orbit-e2e-ipc-state";
  const createdAt = "2026-01-01T12:00:00";
  const account = (id: number, name: string, currencyCode: string): Account => ({
    id, name, currencyCode, accountType: "checking", description: null,
    isActive: true, balance: 0, createdAt, updatedAt: createdAt,
  });
  const movement = (id: number, entry: Partial<Movement>): Movement => ({
    id, accountId: 1, accountName: "Cuenta diaria", type: "expense", amount: 12345,
    currencyCode: "ARS", date: "2026-02-03", description: "Compra semanal",
    notes: null, categoryId: 1, shopId: 1, toAccountId: null, toAccountName: null,
    toAmount: null, toCurrencyCode: null, transferGroupId: null, createdAt, ...entry,
  });
  const seed: MockState = {
    accounts: [account(1, "Cuenta diaria", "ARS"), account(2, "Dólares", "USD"), account(3, "Ahorro pesos", "ARS")],
    categories: [
      { id: 1, name: "Alimentación", type: "expense", parentId: null, isActive: true, movementCount: 0, createdAt },
      { id: 2, name: "Sueldo", type: "income", parentId: null, isActive: true, movementCount: 0, createdAt },
    ],
    currencies: [
      { code: "ARS", name: "Peso argentino", symbol: "$", decimalPlaces: 2, isActive: true },
      { code: "USD", name: "Dólar estadounidense", symbol: "US$", decimalPlaces: 2, isActive: true },
    ],
    items: [{ id: 1, name: "Café", brand: "Local", description: null, isArchived: false, purchaseCount: 0, createdAt }],
    shops: [{ id: 1, name: "Mercado local", address: "Calle 123" }],
    movements: [
      movement(1, {}),
      movement(2, { type: "income", amount: 200000, categoryId: 2, shopId: null, description: "Sueldo febrero" }),
      movement(3, { date: "2026-01-05", amount: 5000, description: "Compra enero" }),
      movement(4, { accountId: 2, accountName: "Dólares", currencyCode: "USD", type: "income", amount: 50000, categoryId: 2, shopId: null, description: "Ingreso USD" }),
      movement(5, { accountId: 3, accountName: "Ahorro pesos", type: "initial_balance", amount: 50000, categoryId: null, shopId: null, description: "Saldo inicial" }),
    ],
    purchases: [], settings: { theme: "dark", noiseEnabled: true }, nextId: 100,
  };
  const saved = sessionStorage.getItem(storageKey);
  const state: MockState = saved ? JSON.parse(saved) : seed;
  const calls: IpcCall[] = [];
  const errors: string[] = [];
  browser.__orbitMock = { calls, errors, state };

  function find<T extends { id: number }>(rows: T[], id: number): T {
    const row = rows.find((entry) => entry.id === id);
    if (!row) throw new Error(`Mock record #${id} not found`);
    return row;
  }
  function page<T>(items: T[], limit: number, offset: number) {
    return { items: items.slice(offset, offset + limit), total: items.length, hasNextPage: offset + limit < items.length, hasPreviousPage: offset > 0 };
  }
  function refreshDerivedFields() {
    for (const row of state.accounts) {
      row.balance = state.movements.reduce((sum, entry) => sum
        + (entry.accountId === row.id ? (entry.type === "expense" || entry.type === "transfer" ? -entry.amount : entry.amount) : 0)
        + (entry.toAccountId === row.id ? entry.toAmount ?? 0 : 0), 0);
    }
    for (const row of state.categories) row.movementCount = state.movements.filter((entry) => entry.categoryId === row.id).length;
    for (const row of state.items) row.purchaseCount = state.purchases.filter((entry) => entry.itemId === row.id).length;
    for (const row of state.movements) {
      row.accountName = find(state.accounts, row.accountId).name;
      row.toAccountName = row.toAccountId === null ? null : find(state.accounts, row.toAccountId).name;
    }
  }
  function netWorth() {
    return state.currencies.flatMap(({ code }) => {
      const accounts = state.accounts.filter((row) => row.isActive && row.currencyCode === code);
      return accounts.length ? [{ currencyCode: code, totalBalance: accounts.reduce((sum, row) => sum + row.balance, 0) }] : [];
    });
  }
  function listMovements(filter: MovementFilter | null, accountId?: number): MovementsPage {
    const f = filter;
    const items = state.movements.filter((row) => {
      const account = accountId ?? f?.accountId;
      return (account == null || row.accountId === account || row.toAccountId === account)
        && (f?.categoryId == null || row.categoryId === f.categoryId)
        && (!f?.movementType || row.type === f.movementType)
        && (!f?.currencyCode || row.currencyCode === f.currencyCode || row.toCurrencyCode === f.currencyCode)
        && (!f?.dateFrom || row.date >= f.dateFrom) && (!f?.dateTo || row.date <= f.dateTo)
        && (!f?.search || `${row.description} ${row.notes ?? ""}`.toLocaleLowerCase().includes(f.search.toLocaleLowerCase()));
    }).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    return page(items, f?.limit ?? 25, f?.offset ?? 0);
  }
  function saveMovement(entry: MovementEntry, id = state.nextId++): Movement {
    const destination = entry.toAccountId === null ? null : find(state.accounts, entry.toAccountId);
    const row: Movement = {
      ...entry, id, createdAt, accountName: find(state.accounts, entry.accountId).name,
      toAccountName: destination?.name ?? null, toCurrencyCode: destination?.currencyCode ?? null,
      transferGroupId: entry.type === "transfer" ? `mock-transfer-${id}` : null,
    };
    state.movements = [...state.movements.filter((item) => item.id !== id), row];
    return row;
  }

  // Signatures follow src/lib/commands.ts; DTO imports are type-only so no app code is replaced.
  const handlers = {
    get_settings: (): Settings => state.settings,
    update_settings: ({ entry }: { entry: Settings }): Settings => (state.settings = { ...entry }),
    get_currencies: (): Currency[] => state.currencies,
    get_accounts: ({ filter }: { filter: AccountFilter }): AccountsPage => {
      const rows = state.accounts.filter((row) => (!filter.activeOnly || row.isActive)
        && (!filter.search || row.name.toLocaleLowerCase().includes(filter.search.toLocaleLowerCase())));
      const field = filter.sort?.field ?? "name";
      rows.sort((a, b) => {
        const left = a[field], right = b[field];
        const order = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right), "es");
        return filter.sort?.direction === "DESC" ? -order : order;
      });
      return page(rows, filter.pagination.limit, filter.pagination.offset);
    },
    get_net_worth: netWorth,
    add_account: ({ entry }: { entry: AddAccount }): Account => {
      const { initialBalance, ...fields } = entry;
      const row: Account = { ...fields, id: state.nextId++, balance: 0, isActive: true, createdAt, updatedAt: createdAt };
      state.accounts.push(row);
      if (initialBalance) saveMovement({ accountId: row.id, type: "initial_balance", amount: initialBalance, currencyCode: row.currencyCode, date: "2026-02-03", description: "Saldo inicial", notes: null, categoryId: null, shopId: null, toAccountId: null, toAmount: null });
      return row;
    },
    update_account: ({ id, entry }: { id: number; entry: UpdateAccount }): Account => Object.assign(find(state.accounts, id), entry),
    delete_account: ({ id }: { id: number }): Account => Object.assign(find(state.accounts, id), { isActive: false }),
    get_categories: (): Category[] => state.categories,
    add_category: ({ entry }: { entry: CategoryEntry }): Category => {
      const row: Category = { ...entry, id: state.nextId++, isActive: true, movementCount: 0, createdAt };
      state.categories.push(row); return row;
    },
    update_category: ({ id, entry }: { id: number; entry: CategoryEntry }): Category => Object.assign(find(state.categories, id), entry),
    delete_category: ({ id }: { id: number }): void => { find(state.categories, id).isActive = false; },
    get_items: (): Item[] => state.items,
    add_item: ({ entry }: { entry: ItemEntry }): Item => {
      const row: Item = { ...entry, id: state.nextId++, isArchived: false, purchaseCount: 0, createdAt };
      state.items.push(row); return row;
    },
    update_item: ({ id, entry }: { id: number; entry: ItemEntry }): Item => Object.assign(find(state.items, id), entry),
    delete_item: ({ id }: { id: number }): void => { find(state.items, id).isArchived = true; },
    get_shops: (): Shop[] => state.shops,
    add_shop: ({ name, address }: { name: string; address: string | null }): Shop => {
      const row: Shop = { id: state.nextId++, name, address };
      state.shops.push(row); return row;
    },
    get_movements: ({ filter }: { filter: MovementFilter }): MovementsPage => listMovements(filter),
    get_movements_by_account_id: ({ accountId, filter }: { accountId: number; filter: MovementFilter | null }): MovementsPage => listMovements(filter, accountId),
    add_movement: ({ entry }: { entry: MovementEntry }): Movement => saveMovement(entry),
    update_movement: ({ id, entry }: { id: number; entry: MovementEntry }): Movement => saveMovement(entry, id),
    delete_movement: ({ id }: { id: number }): void => {
      find(state.movements, id);
      state.movements = state.movements.filter((row) => row.id !== id);
      state.purchases = state.purchases.filter((row) => row.movementId !== id);
    },
    get_purchases: (): Purchase[] => state.purchases,
    purchases_by_item: ({ itemId }: { itemId: number }): Purchase[] => state.purchases.filter((row) => row.itemId === itemId),
    purchases_by_movement: ({ movementId }: { movementId: number }): Purchase[] => state.purchases.filter((row) => row.movementId === movementId),
    add_purchase: ({ entry }: { entry: PurchaseEntry }): Purchase => {
      const expense = find(state.movements, entry.movementId);
      if (expense.type !== "expense") throw new Error("Mock purchases require an expense");
      const row: Purchase = {
        ...entry, id: state.nextId++, itemName: find(state.items, entry.itemId).name,
        totalPrice: Math.trunc(entry.quantity * entry.unitPrice), currencyCode: expense.currencyCode,
        date: expense.date, shopName: expense.shopId === null ? null : find(state.shops, expense.shopId).name,
      };
      state.purchases.push(row); return row;
    },
    delete_purchase: ({ id }: { id: number }): void => {
      find(state.purchases, id);
      state.purchases = state.purchases.filter((row) => row.id !== id);
    },
    get_analytics: (): Analytics => {
      const monthly = new Map<string, Analytics["monthly"][number]>();
      const categories = new Map<string, Analytics["categories"][number]>();
      for (const row of state.movements) {
        if (row.type !== "income" && row.type !== "expense") continue;
        const month = row.date.slice(0, 7);
        const key = `${month}:${row.currencyCode}`;
        const summary = monthly.get(key) ?? { month, currencyCode: row.currencyCode, totalIncome: 0, totalExpenses: 0, net: 0 };
        if (row.type === "income") summary.totalIncome += row.amount;
        else summary.totalExpenses += row.amount;
        summary.net = summary.totalIncome - summary.totalExpenses;
        monthly.set(key, summary);
        if (row.type === "expense") {
          const categoryName = state.categories.find((category) => category.id === row.categoryId)?.name ?? "Sin categoría";
          const categoryKey = `${key}:${row.categoryId ?? "uncategorized"}`;
          const spending = categories.get(categoryKey) ?? { month, currencyCode: row.currencyCode, categoryId: row.categoryId, categoryName, totalAmount: 0 };
          spending.totalAmount += row.amount;
          categories.set(categoryKey, spending);
        }
      }
      return { monthly: [...monthly.values()], categories: [...categories.values()], netWorth: netWorth() };
    },
  };
  refreshDerivedFields();
  // @tauri-apps/api/core.js invoke delegates directly to this method (also used by mockIPC).
  browser.__TAURI_INTERNALS__ = {
    async invoke(command, args = {}) {
      calls.push({ command, args: structuredClone(args) });
      try {
        if (!Object.hasOwn(handlers, command)) throw new Error(`Unmocked Tauri command: ${command}`);
        const handler = handlers[command as keyof typeof handlers] as (args: Record<string, unknown>) => unknown;
        const result = handler(args);
        refreshDerivedFields();
        sessionStorage.setItem(storageKey, JSON.stringify(state));
        return structuredClone(result);
      } catch (error) {
        errors.push(`${command}: ${String(error)}`);
        throw error;
      }
    },
  };
}
