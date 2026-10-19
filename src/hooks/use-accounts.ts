import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { command } from "../lib/commands";
import { accountKeys, mutationInvalidationKeys } from "../lib/query-keys";
import type { AccountFilter } from "../types/generated/AccountFilter";
import type { AddAccount } from "../types/generated/AddAccount";
import type { UpdateAccount } from "../types/generated/UpdateAccount";

const DEFAULT_ACCOUNT_FILTER: AccountFilter = { activeOnly: true, sort: null, pagination: { limit: 25, offset: 0 }, search: null };
export function useAccounts(filter: AccountFilter = DEFAULT_ACCOUNT_FILTER) {
  return useQuery({ queryKey: accountKeys.list(filter), queryFn: () => command.accounts.getAll(filter), placeholderData: keepPreviousData });
}
function useAccountMutation<T, R>(mutationFn: (entry: T) => Promise<R>) {
  const client = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => Promise.all(
    mutationInvalidationKeys.accounts.map((queryKey) => client.invalidateQueries({ queryKey })),
  ) });
}
export function useCreateAccount() { return useAccountMutation((entry: AddAccount) => command.accounts.addOne(entry)); }
export function useUpdateAccount() { return useAccountMutation(({ id, entry }: { id: number; entry: UpdateAccount }) => command.accounts.updateOne(id, entry)); }
export function useDeleteAccount() { return useAccountMutation((id: number) => command.accounts.deleteOne(id)); }
