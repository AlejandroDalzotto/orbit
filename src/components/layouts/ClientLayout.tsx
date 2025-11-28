"use client";

import { AutoHideSidebar } from "@/components/AutoHideSidebar";
import { DropdownMenuProvider } from "@/context/dropdown-menu-provider";
import { useWalletStore } from "@/stores/walletStore";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showIndicator, setShowIndicator] = useState(true);
  const [mouseX, setMouseX] = useState(0);
  const loadPersistedAccounts = useWalletStore(
    (state) => state.loadPersistedAccounts,
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      // Hide indicator when sidebar is likely to be shown (cursor near left edge)
      if (e.clientX < 50) {
        setShowIndicator(false);
      } else if (e.clientX > 200) {
        setShowIndicator(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    const handleMinimize = () => {
      appWindow.minimize();
    };

    const handleMaximize = () => {
      appWindow.toggleMaximize();
    };

    const handleClose = () => {
      appWindow.close();
    };

    document
      .getElementById("titlebar-minimize")
      ?.addEventListener("click", handleMinimize);
    document
      .getElementById("titlebar-maximize")
      ?.addEventListener("click", handleMaximize);
    document
      .getElementById("titlebar-close")
      ?.addEventListener("click", handleClose);

    return () => {
      document.removeEventListener("click", handleMinimize);
      document.removeEventListener("click", handleMaximize);
      document.removeEventListener("click", handleClose);
    };
  }, []);

  // load persisted accounts on mount
  useEffect(() => {
    void loadPersistedAccounts();
  }, [loadPersistedAccounts]);

  return (
    <div className="h-screen mt-8 relative overflow-y-auto">
      <DropdownMenuProvider>
        <AutoHideSidebar />

        {/* Elegant sidebar indicator */}
        <motion.div
          className="fixed left-0 z-40 -translate-y-1/2 pointer-events-none top-1/2"
          initial={{ opacity: 0 }}
          animate={{
            opacity: showIndicator ? 0.4 : 0,
            x: showIndicator ? 0 : -20,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="flex items-center">
            {/* Subtle line indicator */}
            <motion.div
              className="w-0.5 h-12 bg-neutral-600"
              animate={{
                height: mouseX < 100 ? 16 : 12,
                backgroundColor: mouseX < 100 ? "#a3a3a3" : "#525252",
              }}
              transition={{ duration: 0.2 }}
            />

            <motion.div
              className="flex flex-col items-center ml-2"
              animate={{
                opacity: mouseX < 100 ? 0.8 : 0.3,
                x: mouseX < 100 ? 4 : 0,
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Vertical "sidebar" text */}
              <div
                className="font-mono text-xs tracking-wider text-neutral-500"
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                }}
              >
                sidebar
              </div>

              {/* Small arrow hint */}
              <div className="mt-2 font-mono text-xs text-neutral-500">→</div>
            </motion.div>
          </div>
        </motion.div>

        <div className="relative min-h-screen">
          <main className="p-8 pt-12">{children}</main>
        </div>

        <Toaster />
      </DropdownMenuProvider>
    </div>
  );
}
