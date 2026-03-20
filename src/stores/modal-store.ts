import type React from "react";
import { create } from "zustand";

interface ModalStore {
  modal: React.ReactNode | null;
  open: (content: React.ReactNode) => void;
  close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modal: null,
  open: (content) => set({ modal: content }),
  close: () => set({ modal: null }),
}));
