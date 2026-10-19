import { Box, ChartLine, Grid2x2, List, Settings, Wallet } from "lucide-react";
import { useNavigationStore, type AppView } from "../stores/navigation-store";

const views = [
  { key: "billetera", label: "Billetera", Icon: Wallet },
  { key: "movimientos", label: "Movimientos", Icon: List },
  { key: "categories", label: "Categorías", Icon: Grid2x2 },
  { key: "items", label: "Artículos", Icon: Box },
  { key: "reportes", label: "Analytics", Icon: ChartLine },
] as const;

export default function Sidebar() {
  const currentView = useNavigationStore((state) => state.currentView);
  const setView = useNavigationStore((state) => state.setCurrentView);
  const navButton = (key: AppView, label: string, Icon: typeof Wallet) => (
    <button
      key={key}
      title={label}
      aria-label={label}
      aria-current={currentView === key ? "page" : undefined}
      onClick={() => setView(key)}
      className={`flex w-full items-center gap-3 border-l px-4 py-3 text-left text-xs transition-colors ${currentView === key ? "border-primary bg-primary/5 text-primary" : "border-transparent text-muted hover:text-primary"}`}
    >
      <Icon size={16} strokeWidth={1.3} />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
  return (
    <nav aria-label="Navegación principal" className="flex w-14 shrink-0 flex-col justify-between border-r border-hairline py-6 lg:w-48">
      <div>
        <p className="mb-8 px-4 text-[9px] tracking-widest text-muted">
          <span className="lg:hidden">01</span>
          <span className="hidden lg:inline">ESPACIO PERSONAL</span>
        </p>
        {views.map(({ key, label, Icon }) => navButton(key, label, Icon))}
      </div>
      <div>
        {navButton("settings", "Configuración", Settings)}
        <p className="mt-6 hidden px-4 text-[9px] leading-5 text-muted lg:block">
          v0.1
        </p>
      </div>
    </nav>
  );
}
