import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { command } from "../lib/commands";
import { categoryKeys, currencyKeys, itemKeys, movementKeys, mutationInvalidationKeys, purchaseKeys, shopKeys } from "../lib/query-keys";
import type { CategoryEntry } from "../types/generated/CategoryEntry";
import type { ItemEntry } from "../types/generated/ItemEntry";
import type { MovementFilter } from "../types/generated/MovementFilter";
import type { PurchaseEntry } from "../types/generated/PurchaseEntry";

export function useCatalogCategories() {
  return useQuery({ queryKey: categoryKeys.catalog(), queryFn: () => command.categories.getAll() });
}

export function useCatalogItems() {
  return useQuery({ queryKey: itemKeys.catalog(), queryFn: () => command.items.getAll() });
}

export function useCatalogShops() {
  return useQuery({ queryKey: shopKeys.catalog(), queryFn: () => command.shops.getAll() });
}

export function useCatalogCurrencies() {
  return useQuery({ queryKey: currencyKeys.catalog(), queryFn: () => command.currencies.getAll() });
}

export function useCatalogPurchases(itemId: number) {
  return useQuery({
    queryKey: purchaseKeys.byItem(itemId),
    queryFn: () => command.purchases.byItem(itemId),
  });
}

export const CATALOG_EXPENSE_PAGE_SIZE = 200;

export function useCatalogExpenses(search: string, offset: number) {
  const filter: MovementFilter = {
    search: search.trim() || null,
    accountId: null,
    categoryId: null,
    movementType: "expense",
    currencyCode: null,
    dateFrom: null,
    dateTo: null,
    limit: CATALOG_EXPENSE_PAGE_SIZE,
    offset,
  };
  return useQuery({
    queryKey: movementKeys.expenses(filter),
    queryFn: () => command.movements.getAll(filter),
  });
}

// A catalog edit can change labels, purchase counts, and report groupings elsewhere.
function useCatalogMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => Promise.all(
      mutationInvalidationKeys.catalog.map((queryKey) =>
        client.invalidateQueries({ queryKey }),
      ),
    ),
  });
}

export function useSaveCatalogCategory() {
  return useCatalogMutation(({ id, entry }: { id?: number; entry: CategoryEntry }) =>
    id === undefined ? command.categories.addOne(entry) : command.categories.updateOne(id, entry),
  );
}

export function useArchiveCatalogCategory() {
  return useCatalogMutation((id: number) => command.categories.deleteOne(id));
}

export function useSaveCatalogItem() {
  return useCatalogMutation(({ id, entry }: { id?: number; entry: ItemEntry }) =>
    id === undefined ? command.items.addOne(entry) : command.items.updateOne(id, entry),
  );
}

export function useArchiveCatalogItem() {
  return useCatalogMutation((id: number) => command.items.deleteOne(id));
}

export function useAddCatalogPurchase() {
  return useCatalogMutation((entry: PurchaseEntry) => command.purchases.addOne(entry));
}

export function useDeleteCatalogPurchase() {
  return useCatalogMutation((id: number) => command.purchases.deleteOne(id));
}
