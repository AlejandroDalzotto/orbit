import { useQuery } from "@tanstack/react-query";
import { command } from "../lib/commands";
import { netWorthKeys } from "../lib/query-keys";

export function useNetWorth() {
  return useQuery({
    queryKey: netWorthKeys.all,
    queryFn: () => command.accounts.getNetWorth(),
  });
}
