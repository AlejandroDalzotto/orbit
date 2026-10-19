import { useEffect, useRef, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Copy, LockKeyhole, Minus, Square, X } from "lucide-react";
import { useNavigationStore } from "../stores/navigation-store";
import { normalizeCommandError } from "../lib/command-utils";

const noDrag = "[app-region:no-drag] [-webkit-app-region:no-drag]";
const windowButton = `${noDrag} inline-flex h-full w-11 items-center justify-center text-muted transition-colors hover:bg-primary/10 hover:text-primary focus-visible:-outline-offset-4 disabled:opacity-25 sm:w-12`;

type WindowAction = "minimize" | "maximize" | "close";

export function Titlebar() {
  const setView = useNavigationStore((state) => state.setCurrentView);
  const native = isTauri();
  const [maximized, setMaximized] = useState(false);
  const [pending, setPending] = useState<WindowAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actionLock = useRef(false);

  useEffect(() => {
    if (!native) return;
    let disposed = false;
    let unlisten: (() => void) | undefined;
    const appWindow = getCurrentWindow();
    async function syncMaximized() {
      try {
        const value = await appWindow.isMaximized();
        if (!disposed) setMaximized(value);
      } catch (cause) {
        if (!disposed) setError(normalizeCommandError(cause).message);
      }
    }
    void syncMaximized();
    void appWindow
      .onResized(() => void syncMaximized())
      .then((stop) => {
        if (disposed) stop();
        else unlisten = stop;
      })
      .catch((cause) => {
        if (!disposed) setError(normalizeCommandError(cause).message);
      });
    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [native]);

  async function run(action: WindowAction) {
    if (!native || actionLock.current) return;
    actionLock.current = true;
    setPending(action);
    setError(null);
    try {
      const appWindow = getCurrentWindow();
      if (action === "minimize") await appWindow.minimize();
      else if (action === "close") await appWindow.close();
      else {
        await appWindow.toggleMaximize();
        setMaximized(await appWindow.isMaximized());
      }
    } catch (cause) {
      setError(normalizeCommandError(cause).message);
    } finally {
      actionLock.current = false;
      setPending(null);
    }
  }

  return (
    <header
      aria-label="Barra de título"
      data-tauri-drag-region
      className="relative flex h-16 shrink-0 select-none items-center justify-between border-b border-hairline bg-transparent pl-5 [app-region:drag] [-webkit-app-region:drag] lg:pl-9"
    >
      <button
        type="button"
        onClick={() => setView("billetera")}
        aria-label="Orbit, ir a billetera"
        className={`${noDrag} flex shrink-0 items-baseline gap-3`}
      >
        <div className="flex items-center gap-x-2">
          <img src="/orbit-logo.svg" className="w-10 h-10 bg-white rounded-lg select-none pointer-events-none" />
          <span className="pointer-events-none font-display text-4xl italic tracking-tight">Orbit</span>
        </div>
        <span className="pointer-events-none hidden text-[9px] uppercase tracking-[.25em] text-muted xl:inline">Personal finance / offline</span>
      </button>
      <div
        data-tauri-drag-region
        className="flex h-full min-w-0 flex-1 items-center justify-end gap-5 pl-3 [app-region:drag] [-webkit-app-region:drag]"
      >
        <span data-tauri-drag-region className="hidden items-center gap-2 text-[10px] text-muted lg:flex">
          <LockKeyhole size={12} className="pointer-events-none" />
          Solo en este equipo
        </span>
        <button type="button" className={`${noDrag} hidden text-[10px] text-muted hover:text-primary sm:block`} onClick={() => setView("settings")}>
          Preferencias ↗
        </button>
        <div aria-label="Controles de ventana" role="group" className={`${noDrag} flex h-full shrink-0 border-l border-hairline`}>
          <button
            type="button"
            aria-label="Minimizar ventana"
            title={native ? "Minimizar" : "Disponible en la aplicación de escritorio"}
            disabled={!native || pending !== null}
            onClick={() => void run("minimize")}
            className={windowButton}
          >
            <Minus size={15} className="pointer-events-none" />
          </button>
          <button
            type="button"
            aria-label={maximized ? "Restaurar ventana" : "Maximizar ventana"}
            title={native ? (maximized ? "Restaurar" : "Maximizar") : "Disponible en la aplicación de escritorio"}
            disabled={!native || pending !== null}
            onClick={() => void run("maximize")}
            className={windowButton}
          >
            {maximized ? <Copy size={13} className="pointer-events-none" /> : <Square size={13} className="pointer-events-none" />}
          </button>
          <button
            type="button"
            aria-label="Cerrar ventana"
            title={native ? "Cerrar Orbit" : "Disponible en la aplicación de escritorio"}
            disabled={!native || pending !== null}
            onClick={() => void run("close")}
            className={`${windowButton} hover:bg-error/15 hover:text-error`}
          >
            <X size={17} className="pointer-events-none" />
          </button>
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className={`${noDrag} absolute top-full right-3 z-40 mt-2 flex max-w-sm items-start gap-3 border border-error/35 bg-surface p-3 text-xs text-error`}
        >
          <p>No se pudo controlar la ventana: {error}</p>
          <button type="button" aria-label="Descartar error de ventana" onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}
    </header>
  );
}
