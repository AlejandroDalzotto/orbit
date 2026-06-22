import { Settings } from "lucide-react";
import OrbitLogo from "./orbit-logo";
import { useNavigationStore } from "../stores/navigation-store";
import { APP_VIEWS } from "../definitions/consts";

export default function Sidebar() {
  const currentView = useNavigationStore((state) => state.currentView);
  const setCurrentView = useNavigationStore((state) => state.setCurrentView);

  return (
    <nav
      aria-label="Navegación principal"
      className="flex h-screen w-14 flex-col items-center justify-between border-r border-[oklch(1_0_0/0.08)] bg-[oklch(0.12_0_0)] py-5 md:w-16"
    >
      {/* Brand mark */}
      <OrbitLogo size="small" color="white" />

      {/* Items */}
      <ul className="flex flex-1 flex-col items-center justify-center gap-2">
        {APP_VIEWS.map((item) => {
          const active = currentView === item.key;
          return (
            <li key={item.key} className="w-full">
              <button
                aria-current={active ? "page" : undefined}
                onClick={() => setCurrentView(item.key)}
                className="group relative flex flex-col items-center gap-3 py-4 px-3"
              >
                {/* active accent bar */}
                <span
                  className={`absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r transition-all duration-300 ${
                    active ? "bg-[oklch(0.97_0_0)] opacity-100" : "bg-[oklch(0.97_0_0)] opacity-0 group-hover:opacity-40"
                  }`}
                />
                {/* hover span that displays on group hover at the right of the button as a popover */}
                <span
                  className={`absolute left-10 z-40 top-1/2 font-bold -translate-y-1/2 w-fit text-sm py-2 pr-2 pl-4 bg-white text-black whitespace-nowrap rounded-xs transition-opacity duration-150 pointer-events-none ${
                    active ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <span
                    className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 bg-white clip-path-polygon"
                    style={{ clipPath: "polygon(100% 0%, 0% 50%, 100% 100%)" }}
                  />
                  {item.title}
                </span>

                <span
                  className={`font-mono text-[11px] transition-colors ${
                    active ? "text-[oklch(0.97_0_0)]" : "text-[oklch(0.45_0_0)] group-hover:text-[oklch(0.75_0_0)]"
                  }`}
                >
                  <item.Icon className="h-4 w-4" />
                </span>
                {/* vertical label */}
                <span
                  className={`text-[10px] uppercase tracking-[0.25em] [writing-mode:vertical-rl] transition-colors ${
                    active ? "text-[oklch(0.85_0_0)]" : "text-[oklch(0.4_0_0)] group-hover:text-[oklch(0.65_0_0)]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer tick - Config button */}
      <button
        aria-current={currentView === null ? "page" : undefined}
        // onClick={() => setCurrentView(item.key)}
        className="group relative flex flex-col items-center gap-3 py-4 px-3"
      >
        {/* active accent bar */}
        <span
          className={`absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r transition-all duration-300 ${
            currentView === null ? "bg-[oklch(0.97_0_0)] opacity-100" : "bg-[oklch(0.97_0_0)] opacity-0 group-hover:opacity-40"
          }`}
        />
        {/* hover span that displays on group hover at the right of the button as a popover */}
        <span
          className={`absolute left-10 z-40 top-1/2 font-bold -translate-y-1/2 w-fit text-sm py-2 pr-2 pl-4 bg-white text-black whitespace-nowrap rounded-xs transition-opacity duration-150 pointer-events-none ${
            currentView === null ? "opacity-0" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <span
            className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 bg-white clip-path-polygon"
            style={{ clipPath: "polygon(100% 0%, 0% 50%, 100% 100%)" }}
          />
          Ajusta las configuraciones de Orbit
        </span>

        <span
          className={`font-mono text-[11px] transition-colors ${
            currentView === null ? "text-[oklch(0.97_0_0)]" : "text-[oklch(0.45_0_0)] group-hover:text-[oklch(0.75_0_0)]"
          }`}
        >
          <Settings className="h-4 w-4" />
        </span>

        {/* vertical label */}
        <span
          className={`text-[10px] uppercase tracking-[0.25em] [writing-mode:vertical-rl] transition-colors ${
            currentView === null ? "text-[oklch(0.85_0_0)]" : "text-[oklch(0.4_0_0)] group-hover:text-[oklch(0.65_0_0)]"
          }`}
        >
          Con
        </span>
      </button>
    </nav>
  );
}
