import { create } from "zustand";
import { AppView } from "../definitions/consts";

interface NavigationState {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  currentView: "billetera",
  setCurrentView: (view: AppView) => set({ currentView: view }),
}));
