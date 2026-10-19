import type React from "react";
import { create } from "zustand";

interface ModalStore {
  modal: React.ReactNode | null;
  open: (content: React.ReactNode) => void;
  close: () => void;
  shouldDisableEsc: boolean;
  setShouldDisableEsc: (shouldDisable: boolean) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modal: null,
  open: (content) => set({ modal: content, shouldDisableEsc: false }),
  close: () => set({ modal: null, shouldDisableEsc: false }),
  shouldDisableEsc: false,
  setShouldDisableEsc: (shouldDisable) => set({ shouldDisableEsc: shouldDisable }),
}));
