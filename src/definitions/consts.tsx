import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Box, ChartLine, Grid2x2, List, Wallet } from "lucide-react";
import { AccountType } from "./accounts";
import type { MovementFilters, MovementType } from "./movements";

export const AVAILABLE_ACCOUNT_TYPES = Object.values(AccountType);

export const ITEMS_PER_PAGE = 30;

export const DEFAULT_MOVEMENTS_FILTERS: MovementFilters = {
  period: "1m",
  sort: { field: "date", order: "DESC" },
  limit: ITEMS_PER_PAGE,
  offset: 0,
  type: "all",
};

export type AppView = "billetera" | "movimientos" | "items" | "reportes" | "categories";

export const APP_VIEWS: {
  key: AppView;
  label: string;
  Icon: React.ComponentType<any>;
  title: string;
}[] = [
  { key: "billetera", label: "bil", Icon: Wallet, title: "Tu cartera y cuentas" },
  { key: "movimientos", label: "mov", Icon: List, title: "Registro del movimiento de tu dinero" },
  { key: "items", label: "art", Icon: Box, title: "Información sobre tus compras" },
  { key: "reportes", label: "rep", Icon: ChartLine, title: "Análisis y reportes" },
  { key: "categories", label: "cat", Icon: Grid2x2, title: "Organización de categorías" },
];

export type MovTypeConfig = {
  label: string;
  icon: React.ReactNode;
  color: string;
  statColor: string;
  lineColor: string;
};

export const MOV_TYPE_CONFIG: Record<MovementType, MovTypeConfig> = {
  income: {
    label: "Ingreso",
    icon: <ArrowDownLeft className="w-3.5 h-3.5" />,
    color: "text-emerald-600 bg-emerald-50",
    statColor: "text-emerald-600",
    lineColor: "#10b981",
  },
  expense: {
    label: "Egreso",
    icon: <ArrowUpRight className="w-3.5 h-3.5" />,
    color: "text-red-500 bg-red-50",
    statColor: "text-red-500",
    lineColor: "#ef4444",
  },
  transfer: {
    label: "Transferencia",
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    color: "text-blue-500 bg-blue-50",
    statColor: "text-blue-500",
    lineColor: "#3b82f6",
  },
};
