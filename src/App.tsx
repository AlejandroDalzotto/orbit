import "./App.css";
import { lazy, Suspense } from "react";
import { Titlebar } from "./components/titlebar";
import { NoiseOverlay } from "./components/noise-overlay";
import WalletView from "./views/wallet-view";
import Sidebar from "./components/sidebar";
import { useNavigationStore } from "./stores/navigation-store";
import { ThemeProvider } from "./providers/theme-provider";
const MovementsView = lazy(() => import("./views/movements-view"));
const CategoriesView = lazy(() => import("./views/categories-view"));
const ItemsView = lazy(() => import("./views/items-view"));
const AnalyticsView = lazy(() => import("./views/analytics-view"));
const SettingsView = lazy(() => import("./views/settings-view"));

export default function App() {
  const view = useNavigationStore((state) => state.currentView);

  return <ThemeProvider><div className="orbit-atmosphere flex h-dvh min-h-0 flex-col overflow-hidden text-sm">
    <NoiseOverlay />
    <Titlebar />
    <div className="flex min-h-0 flex-1"><Sidebar /><main id="main-content" className="min-w-0 flex-1 overflow-hidden"><Suspense fallback={<p className="p-10 text-muted" role="status">Cargando vista…</p>}>
      {view === "billetera" && <WalletView />}{view === "movimientos" && <MovementsView />}{view === "categories" && <CategoriesView />}{view === "items" && <ItemsView />}{view === "reportes" && <AnalyticsView />}{view === "settings" && <SettingsView />}
    </Suspense></main></div>
  </div></ThemeProvider>;
}
