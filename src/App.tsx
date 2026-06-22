import "./App.css";
import { useEffect } from "react";
import WalletView from "./views/wallet-view";
import { ViewLayout } from "./layouts/view-layout";
import { ModalProvider } from "./providers/modal-provider";
import CategoriesView from "./views/categories-view";
import MovementsView from "./views/movements-view";
import ItemsView from "./views/items-view";
import { useGlobalStore } from "./stores/global-data-store";
import { SplashScreen } from "./components/splash-screen";
import Sidebar from "./components/sidebar";
import { useNavigationStore } from "./stores/navigation-store";

function App() {
  const initApp = useGlobalStore((state) => state.initApp);
  const isInitialized = useGlobalStore((state) => state.isInitialized);
  const currentView = useNavigationStore((state) => state.currentView);

  useEffect(() => {
    // Se ejecuta una Sola vez al levantar el proceso de la app.
    initApp();
  }, [initApp]);

  // Si la DB no terminó de escupir los datos iniciales, mostramos un loader limpio
  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-200 font-primary min-w-250 w-screen h-screen bg-neutral-100 grid grid-cols-[auto_1fr]">
      {/* Top navbar */}
      <Sidebar />

      {/* Main content area */}
      <main className="relative h-full overflow-hidden">
        {currentView === "billetera" && <WalletView />}

        {currentView === "movimientos" && <MovementsView />}

        {currentView === "items" && <ItemsView />}

        {currentView === "categories" && <CategoriesView />}

        {currentView === "reportes" && (
          <ViewLayout>
            <h2 className="text-xl font-semibold mb-2">Reportes</h2>
            <p className="text-sm text-neutral-600">Aquí van los reportes.</p>
          </ViewLayout>
        )}
      </main>
      <ModalProvider />
    </div>
  );
}

export default App;
