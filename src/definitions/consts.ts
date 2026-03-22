import { Box, Boxes, ChartLine, Grid2x2, List, Wallet } from "lucide-react";
import { AccountType } from "./accounts";

export const AVAILABLE_ACCOUNT_TYPES = Object.values(AccountType);

export type AppView = "billetera" | "movimientos" | "grupos" | "items" | "reportes" | "categories";

export const APP_VIEWS: {
  key: AppView;
  label: string;
  Icon: React.ComponentType<any>;
}[] = [
  { key: "billetera", label: "billetera", Icon: Wallet },
  { key: "movimientos", label: "movimientos", Icon: List },
  { key: "grupos", label: "grupos", Icon: Boxes },
  { key: "items", label: "items", Icon: Box },
  { key: "reportes", label: "reportes", Icon: ChartLine },
  { key: "categories", label: "categorías", Icon: Grid2x2 },
];
