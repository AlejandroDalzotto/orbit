import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider, hashKey, type QueryKey } from "@tanstack/react-query";
import { normalizeCommandError } from "../src/lib/command-utils";
import { command } from "../src/lib/commands";
import {
  accountKeys, analyticsKeys, categoryKeys, currencyKeys, itemKeys, movementKeys,
  mutationInvalidationKeys, netWorthKeys, purchaseKeys, settingsKeys, shopKeys,
} from "../src/lib/query-keys";
import { useAccounts, useDeleteAccount } from "../src/hooks/use-accounts";
import {
  CATALOG_EXPENSE_PAGE_SIZE, useArchiveCatalogCategory, useCatalogCategories,
  useCatalogCurrencies, useCatalogExpenses, useCatalogItems, useCatalogPurchases, useCatalogShops,
} from "../src/hooks/use-catalog";
import { useAnalytics, useDeleteMovement, useLedgerChoices, useMovements } from "../src/hooks/use-movements";
import { useNetWorth } from "../src/hooks/use-net-worth";
import type { Account } from "../src/types/generated/Account";
import type { AccountFilter } from "../src/types/generated/AccountFilter";
import type { MovementFilter } from "../src/types/generated/MovementFilter";

const clients: QueryClient[] = [];
const restoreSpies: (() => void)[] = [];

afterEach(() => {
  for (const restore of restoreSpies.splice(0)) restore();
  for (const client of clients.splice(0)) client.clear();
});

function createClient() {
  const client = new QueryClient({ defaultOptions: {
    queries: { retry: false, gcTime: Infinity },
    mutations: { retry: false, gcTime: Infinity },
  } });
  clients.push(client);
  return client;
}

function renderHook<T>(client: QueryClient, useHook: () => T): T {
  let result: T;
  function Probe() {
    result = useHook();
    return null;
  }
  renderToString(createElement(QueryClientProvider, { client }, createElement(Probe)));
  return result!;
}

const accountFilter: AccountFilter = {
  activeOnly: true, search: "cash", sort: { field: "name", direction: "ASC" },
  pagination: { limit: 25, offset: 0 },
};
const movementFilter: MovementFilter = {
  search: "coffee", accountId: 1, categoryId: 2, movementType: "expense", currencyCode: "USD",
  dateFrom: "2026-01-01", dateTo: "2026-12-31", limit: 25, offset: 0,
};
const account: Account = {
  id: 1, name: "Cash", accountType: "cash", currencyCode: "USD", description: null,
  isActive: true, createdAt: "2026-01-01", updatedAt: "2026-01-01", balance: 0,
};

function findQuery(client: QueryClient, queryKey: QueryKey) {
  const query = client.getQueryCache().find({ queryKey, exact: true });
  expect(query).toBeDefined();
  return query!;
}

describe("IPC error normalization", () => {
  test("preserves Error identity, stack, and subclass", () => {
    const error = new TypeError("IPC unavailable");
    expect(normalizeCommandError(error)).toBe(error);
  });

  test.each([
    ["plain rejection", "plain rejection"],
    [{ message: "La cuenta está inactiva." }, "La cuenta está inactiva."],
  ])("converts rejection %j to an Error with its original message", (input: unknown, message: string) => {
    const error = normalizeCommandError(input);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
  });

  test.each([null, undefined, 42, {}, { message: 42 }])("handles malformed rejection %j without a cast", (input: unknown) => {
    expect(normalizeCommandError(input)).toBeInstanceOf(Error);
    expect(normalizeCommandError(input).message).toBe("Error desconocido al ejecutar el comando.");
  });
});

describe("query filter identity", () => {
  test("account keys retain search, activity, sorting, and pagination", () => {
    const variants: AccountFilter[] = [
      { ...accountFilter, search: "bank" },
      { ...accountFilter, activeOnly: false },
      { ...accountFilter, sort: { field: "name", direction: "DESC" } },
      { ...accountFilter, pagination: { limit: 50, offset: 0 } },
      { ...accountFilter, pagination: { limit: 25, offset: 25 } },
    ];
    for (const makeKey of [accountKeys.list, accountKeys.choices]) {
      expect(makeKey(accountFilter).at(-1)).toEqual(accountFilter);
      for (const filter of variants) expect(hashKey(makeKey(filter))).not.toBe(hashKey(makeKey(accountFilter)));
    }
  });

  test("ledger and expense-picker keys include every movement filter", () => {
    const variants: MovementFilter[] = [
      { ...movementFilter, search: "tea" },
      { ...movementFilter, accountId: 3 },
      { ...movementFilter, categoryId: 4 },
      { ...movementFilter, movementType: "income" },
      { ...movementFilter, currencyCode: "ARS" },
      { ...movementFilter, dateFrom: "2026-02-01" },
      { ...movementFilter, dateTo: "2026-11-30" },
      { ...movementFilter, limit: 50 },
      { ...movementFilter, offset: 25 },
    ];
    for (const makeKey of [movementKeys.list, movementKeys.expenses]) {
      expect(makeKey(movementFilter).at(-1)).toEqual(movementFilter);
      for (const filter of variants) expect(hashKey(makeKey(filter))).not.toBe(hashKey(makeKey(movementFilter)));
    }
    expect(hashKey(movementKeys.list(movementFilter))).not.toBe(hashKey(movementKeys.expenses(movementFilter)));
    expect(purchaseKeys.byItem(1)).not.toEqual(purchaseKeys.byItem(2));
  });
});

describe("hook command routing", () => {
  test("account and movement query functions pass complete filters to commands", async () => {
    const client = createClient();
    const accounts = spyOn(command.accounts, "getAll").mockResolvedValue({ items: [], total: 0, hasNextPage: false, hasPreviousPage: false });
    const movements = spyOn(command.movements, "getAll").mockResolvedValue({ items: [], total: 0, hasNextPage: false, hasPreviousPage: false });
    restoreSpies.push(() => accounts.mockRestore(), () => movements.mockRestore());
    renderHook(client, () => useAccounts(accountFilter));
    renderHook(client, () => useMovements(movementFilter));
    await findQuery(client, accountKeys.list(accountFilter)).fetch();
    await findQuery(client, movementKeys.list(movementFilter)).fetch();
    expect(accounts).toHaveBeenCalledWith(accountFilter);
    expect(movements).toHaveBeenCalledWith(movementFilter);
  });

  test("catalog queries, analytics, and net worth share the typed command boundary", async () => {
    const client = createClient();
    const spies = [
      spyOn(command.categories, "getAll").mockResolvedValue([]),
      spyOn(command.items, "getAll").mockResolvedValue([]),
      spyOn(command.shops, "getAll").mockResolvedValue([]),
      spyOn(command.currencies, "getAll").mockResolvedValue([]),
      spyOn(command.purchases, "byItem").mockResolvedValue([]),
      spyOn(command.analytics, "get").mockResolvedValue({ monthly: [], categories: [], netWorth: [] }),
      spyOn(command.accounts, "getNetWorth").mockResolvedValue([]),
    ];
    restoreSpies.push(...spies.map((spy) => () => spy.mockRestore()));
    renderHook(client, () => {
      useCatalogCategories(); useCatalogItems(); useCatalogShops(); useCatalogCurrencies();
      useCatalogPurchases(7); useAnalytics(); useNetWorth();
    });
    await Promise.all(client.getQueryCache().getAll().map((query) => query.fetch()));
    for (const spy of spies) expect(spy).toHaveBeenCalledTimes(1);
    expect(spies[4]).toHaveBeenCalledWith(7);
  });

  test("expense picker trims search and keeps offset and all filters in the key", async () => {
    const client = createClient();
    const spy = spyOn(command.movements, "getAll").mockResolvedValue({ items: [], total: 0, hasNextPage: false, hasPreviousPage: false });
    restoreSpies.push(() => spy.mockRestore());
    renderHook(client, () => useCatalogExpenses(" coffee ", 200));
    const filter: MovementFilter = {
      search: "coffee", accountId: null, categoryId: null, movementType: "expense", currencyCode: null,
      dateFrom: null, dateTo: null, limit: CATALOG_EXPENSE_PAGE_SIZE, offset: 200,
    };
    await findQuery(client, movementKeys.expenses(filter)).fetch();
    expect(spy).toHaveBeenCalledWith(filter);
  });

  test("ledger account choices load every page through command.accounts", async () => {
    const client = createClient();
    const spy = spyOn(command.accounts, "getAll")
      .mockResolvedValueOnce({ items: [account], total: 2, hasNextPage: true, hasPreviousPage: false })
      .mockResolvedValueOnce({ items: [{ ...account, id: 2 }], total: 2, hasNextPage: false, hasPreviousPage: true });
    restoreSpies.push(() => spy.mockRestore());
    renderHook(client, useLedgerChoices);
    const query = client.getQueryCache().find({ queryKey: accountKeys.all, exact: false })!;
    expect(await query.fetch()).toHaveLength(2);
    expect(spy.mock.calls.map(([filter]: [AccountFilter]) => filter.pagination.offset)).toEqual([0, 1]);
    expect(query.queryKey.at(-1)).toEqual({
      activeOnly: false, search: null, sort: { field: "name", direction: "ASC" }, pagination: { limit: 200, offset: 0 },
    });
  });

  test("ledger account pagination rejects a non-advancing page", async () => {
    const client = createClient();
    const spy = spyOn(command.accounts, "getAll").mockResolvedValue({ items: [], total: 1, hasNextPage: true, hasPreviousPage: false });
    restoreSpies.push(() => spy.mockRestore());
    renderHook(client, useLedgerChoices);
    await expect(client.getQueryCache().find({ queryKey: accountKeys.all, exact: false })!.fetch()).rejects.toThrow("La paginación de cuentas no avanzó");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

const seededKeys = [
  accountKeys.list(accountFilter), accountKeys.choices(accountFilter), accountKeys.detail(1),
  netWorthKeys.all, categoryKeys.catalog(), itemKeys.catalog(), shopKeys.catalog(), currencyKeys.catalog(),
  purchaseKeys.byItem(1), purchaseKeys.byMovement(1), movementKeys.list(movementFilter),
  movementKeys.expenses(movementFilter), analyticsKeys.all, settingsKeys.all,
];

function seedQueries(client: QueryClient) {
  for (const queryKey of seededKeys) client.setQueryData(queryKey, []);
}

function expectInvalidation(client: QueryClient, roots: readonly QueryKey[]) {
  for (const queryKey of seededKeys) {
    const expected = roots.some((root) => queryKey[0] === root[0]);
    expect(findQuery(client, queryKey).state.isInvalidated).toBe(expected);
  }
}

describe("mutation invalidation", () => {
  test("movement deletion refreshes balances, category counts, and cascading purchase/item data", async () => {
    const client = createClient();
    seedQueries(client);
    const spy = spyOn(command.movements, "deleteOne").mockResolvedValue(undefined);
    restoreSpies.push(() => spy.mockRestore());
    await renderHook(client, useDeleteMovement).mutateAsync(5);
    expect(spy).toHaveBeenCalledWith(5);
    expect(mutationInvalidationKeys.movements).toEqual([
      movementKeys.all, accountKeys.all, netWorthKeys.all, analyticsKeys.all,
      categoryKeys.all, itemKeys.all, purchaseKeys.all,
    ]);
    expectInvalidation(client, mutationInvalidationKeys.movements);
  });

  test("category edits refresh every catalog/report root", async () => {
    const client = createClient();
    seedQueries(client);
    const spy = spyOn(command.categories, "deleteOne").mockResolvedValue(undefined);
    restoreSpies.push(() => spy.mockRestore());
    await renderHook(client, useArchiveCatalogCategory).mutateAsync(5);
    expectInvalidation(client, [categoryKeys.all, itemKeys.all, purchaseKeys.all, movementKeys.all, analyticsKeys.all]);
  });

  test("account mutations refresh lists, choices, details, balances, ledger, and analytics", async () => {
    const client = createClient();
    seedQueries(client);
    const spy = spyOn(command.accounts, "deleteOne").mockResolvedValue(account);
    restoreSpies.push(() => spy.mockRestore());
    await renderHook(client, useDeleteAccount).mutateAsync(1);
    expectInvalidation(client, [accountKeys.all, netWorthKeys.all, movementKeys.all, analyticsKeys.all]);
  });

  test("failed mutations expose the useful Error and do not invalidate successful data", async () => {
    const client = createClient();
    seedQueries(client);
    const error = normalizeCommandError({ message: "No se puede eliminar el movimiento." });
    const spy = spyOn(command.movements, "deleteOne").mockRejectedValue(error);
    restoreSpies.push(() => spy.mockRestore());
    await expect(renderHook(client, useDeleteMovement).mutateAsync(5)).rejects.toBe(error);
    expect(client.getMutationCache().getAll()[0].state.error).toBe(error);
    expectInvalidation(client, []);
  });
});
