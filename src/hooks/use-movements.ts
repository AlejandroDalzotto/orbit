import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { command } from "../lib/commands";
import { accountKeys, analyticsKeys, categoryKeys, currencyKeys, movementKeys, mutationInvalidationKeys, purchaseKeys, shopKeys } from "../lib/query-keys";
import type { Account } from "../types/generated/Account";
import type { AccountFilter } from "../types/generated/AccountFilter";
import type { MovementEntry } from "../types/generated/MovementEntry";
import type { MovementFilter } from "../types/generated/MovementFilter";
import type { Purchase } from "../types/generated/Purchase";

const LEDGER_ACCOUNT_FILTER: AccountFilter = {
  activeOnly: false,
  search: null,
  sort: { field: "name", direction: "ASC" },
  pagination: { limit: 200, offset: 0 },
};

export function useMovements(filter: MovementFilter, enabled = true) {
  return useQuery({
    queryKey: movementKeys.list(filter),
    queryFn: () => command.movements.getAll(filter),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useLedgerCurrencies() {
  return useQuery({ queryKey: currencyKeys.catalog(), queryFn: () => command.currencies.getAll() });
}

export function useLedgerChoices() {
  const accounts = useQuery({
    queryKey: accountKeys.choices(LEDGER_ACCOUNT_FILTER),
    queryFn: async ({ signal }) => {
      const result: Account[] = [];
      let offset = 0;
      for (;;) {
        signal.throwIfAborted();
        const filter: AccountFilter = {
          ...LEDGER_ACCOUNT_FILTER,
          pagination: { limit: 200, offset },
        };
        const page = await command.accounts.getAll(filter);
        result.push(...page.items);
        if (!page.hasNextPage) return result;
        if (page.items.length === 0) throw new Error("La paginación de cuentas no avanzó. Reintentá la carga.");
        offset += page.items.length;
      }
    },
  });
  const categories = useQuery({ queryKey: categoryKeys.catalog(), queryFn: () => command.categories.getAll() });
  const shops = useQuery({ queryKey: shopKeys.catalog(), queryFn: () => command.shops.getAll() });
  const currencies = useLedgerCurrencies();
  const queries = [accounts, categories, shops, currencies];
  return {
    accounts: accounts.data ?? [], categories: categories.data ?? [], shops: shops.data ?? [], currencies: currencies.data ?? [],
    isPending: queries.some((query) => query.isPending),
    isFetching: queries.some((query) => query.isFetching),
    error: queries.find((query) => query.error)?.error,
    refetch: () => Promise.all(queries.map((query) => query.refetch())),
  };
}

function useLedgerMutation<T, R>(mutationFn: (variables: T) => Promise<R>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => Promise.all(
      mutationInvalidationKeys.movements.map((queryKey) =>
        client.invalidateQueries({ queryKey }),
      ),
    ),
  });
}

export function useSaveMovement() {
  return useLedgerMutation(({ id, entry }: { id?: number; entry: MovementEntry }) =>
    id === undefined
      ? command.movements.addOne(entry)
      : command.movements.updateOne(id, entry),
  );
}

export function useDeleteMovement() {
  return useLedgerMutation((id: number) => command.movements.deleteOne(id));
}

export function useMovementPurchases(movementId: number) {
  return useQuery<Purchase[]>({
    queryKey: purchaseKeys.byMovement(movementId),
    queryFn: () => command.purchases.byMovement(movementId),
  });
}

export function useAnalytics() {
  return useQuery({ queryKey: analyticsKeys.all, queryFn: () => command.analytics.get() });
}
