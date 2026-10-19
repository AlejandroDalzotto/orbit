import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { command } from "../lib/commands";
import { mutationInvalidationKeys } from "../lib/query-keys";

export function useImportTemplates() {
  return useQuery({ queryKey: ["imports", "templates"], queryFn: command.imports.templates, staleTime: Infinity });
}

export function usePreviewImport() {
  return useMutation({ mutationFn: command.imports.preview, retry: false });
}

export function useCommitImport() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: command.imports.commit,
    // A commit is never retried automatically: importing the same CSV creates new records.
    retry: false,
    onSuccess: () => Promise.all(mutationInvalidationKeys.movements.map((queryKey) => client.invalidateQueries({ queryKey }))),
  });
}
