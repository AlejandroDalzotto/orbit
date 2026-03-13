import "./App.css";
import React, { useState } from "react";
import { Settings, Wallet, List, Users, Box, BarChart } from "lucide-react";
import WalletView from "./views/wallet-view";
import { ViewLayout } from "./layouts/view-layout";

function App() {
  const [currentView, setCurrentView] = useState<"billetera" | "movimientos" | "grupos" | "items" | "reportes">("billetera");

  const views: {
    key: "billetera" | "movimientos" | "grupos" | "items" | "reportes";
    label: string;
    Icon: React.ComponentType<any>;
  }[] = [
    { key: "billetera", label: "billetera", Icon: Wallet },
    { key: "movimientos", label: "movimientos", Icon: List },
    { key: "grupos", label: "grupos", Icon: Users },
    { key: "items", label: "items", Icon: Box },
    { key: "reportes", label: "reportes", Icon: BarChart },
  ];

  return (
    <div className="min-h-200 min-w-250 w-screen h-screen bg-neutral-100 grid grid-rows-[auto_1fr]">
      {/* Top navbar */}
      <nav className="flex items-center justify-between px-6 py-3 bg-white shadow-sm">
        {/* Left: Title */}
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-semibold">Orbit</span>
        </div>

        {/* Center: View buttons */}
        <div className="flex items-center space-x-2">
          {views.map(({ key, label, Icon }) => {
            const active = currentView === key;
            return (
              <button
                key={key}
                onClick={() => setCurrentView(key)}
                aria-pressed={active}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-gray-500"}`} />
                <span className="capitalize">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Config gear */}
        <div className="flex items-center">
          <button
            aria-label="config"
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => {
              // keep simple: toggle to a config view if you want to implement later
              // for now, no-op or you could add a "config" view state
              console.log("Config clicked");
            }}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </nav>

      {/* Main content area */}
      <main className="p-6 relative">
        {currentView === "billetera" && <WalletView />}

        {currentView === "movimientos" && (
          <ViewLayout>
            <h2 className="text-xl font-semibold mb-2">Movimientos</h2>
            <p className="text-sm text-gray-600">Aquí van los movimientos.</p>
          </ViewLayout>
        )}

        {currentView === "grupos" && (
          <ViewLayout>
            <h2 className="text-xl font-semibold mb-2">Grupos</h2>
            <p className="text-sm text-gray-600">Aquí va la vista de grupos.</p>
          </ViewLayout>
        )}

        {currentView === "items" && (
          <ViewLayout>
            <h2 className="text-xl font-semibold mb-2">Items</h2>
            <p className="text-sm text-gray-600">Aquí va la vista de items.</p>
          </ViewLayout>
        )}

        {currentView === "reportes" && (
          <ViewLayout>
            <h2 className="text-xl font-semibold mb-2">Reportes</h2>
            <p className="text-sm text-gray-600">Aquí van los reportes.</p>
          </ViewLayout>
        )}
      </main>
    </div>
  );
}

export default App;
