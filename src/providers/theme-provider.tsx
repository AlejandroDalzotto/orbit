import { useEffect, type ReactNode } from "react";
import { command } from "../lib/commands";
import { useQuery } from "@tanstack/react-query";
import { applyAppearance } from "../lib/appearance";

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: command.settings.get });
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data } = useSettings();
  useEffect(() => { if (data) applyAppearance(data); }, [data]);
  return children;
}
