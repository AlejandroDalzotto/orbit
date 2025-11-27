"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

/**
 * Dropdown menu provider that supports per-menu IDs.
 *
 * Usage:
 *  - Wrap your layout with <DropdownMenuProvider>
 *  - In a Dropdown component, call:
 *      const { isMenuOpen, toggleMenu, openMenu, closeMenu } = useDropdownMenu();
 *      const id = "some-unique-id-for-this-menu";
 *      isOpen = isMenuOpen(id);
 *      toggleMenu(id);
 *
 * Backwards compatibility:
 *  - If you call the methods without an `id`, a single global menu id is used
 *    so existing code that doesn't yet pass ids will still work.
 */

const GLOBAL_MENU_ID = "__GLOBAL_DROPDOWN_MENU_ID__";

type DropdownMenuApi = {
  /**
   * Open the menu with the given id (or the global one if omitted).
   */
  openMenu: (id?: string) => void;
  /**
   * Close the menu with the given id (or the global one if omitted).
   */
  closeMenu: (id?: string) => void;
  /**
   * Toggle the menu with the given id (or the global one if omitted).
   */
  toggleMenu: (id?: string) => void;
  /**
   * Returns whether the menu with the given id (or the global one if omitted) is open.
   */
  isMenuOpen: (id?: string) => boolean;
  /**
   * Currently open menu id, or null if none open.
   * Useful for debugging or advanced behavior.
   */
  currentOpenMenuId: string | null;
};

const noop = () => {};
const defaultContext: DropdownMenuApi = {
  openMenu: noop,
  closeMenu: noop,
  toggleMenu: noop,
  isMenuOpen: () => false,
  currentOpenMenuId: null,
};

export const DropdownMenuContext =
  createContext<DropdownMenuApi>(defaultContext);

export const DropdownMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const openMenu = useCallback((id?: string) => {
    const target = id ?? GLOBAL_MENU_ID;
    setOpenMenuId(target);
  }, []);

  const closeMenu = useCallback((id?: string) => {
    const target = id ?? GLOBAL_MENU_ID;
    // only close if the currently open menu matches the target
    setOpenMenuId((prev) => (prev === target ? null : prev));
  }, []);

  const toggleMenu = useCallback((id?: string) => {
    const target = id ?? GLOBAL_MENU_ID;
    setOpenMenuId((prev) => (prev === target ? null : target));
  }, []);

  const isMenuOpen = useCallback(
    (id?: string) => {
      const target = id ?? GLOBAL_MENU_ID;
      return openMenuId === target;
    },
    [openMenuId],
  );

  const api: DropdownMenuApi = {
    openMenu,
    closeMenu,
    toggleMenu,
    isMenuOpen,
    currentOpenMenuId: openMenuId,
  };

  return (
    <DropdownMenuContext.Provider value={api}>
      {children}
    </DropdownMenuContext.Provider>
  );
};

export const useDropdownMenu = (): DropdownMenuApi => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    // Fallback, though createContext default ensures we never get undefined.
    throw new Error(
      "useDropdownMenu must be used within a DropdownMenuProvider",
    );
  }
  return context;
};
