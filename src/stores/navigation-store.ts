import { create } from "zustand";

export type AppView = "billetera" | "movimientos" | "items" | "reportes" | "categories" | "settings";
type MovementsTarget = { accountId: number | null };
interface NavigationState {
  currentView: AppView;
  movementsTarget: MovementsTarget | null;
  setCurrentView: (view: AppView) => void;
  openAccountMovements: (accountId: number) => void;
  consumeMovementsTarget: (target: MovementsTarget) => void;
}
export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: "billetera",
  movementsTarget: null,
  setCurrentView: (currentView) => set({
    currentView,
    movementsTarget: currentView === "movimientos" ? { accountId: null } : null,
  }),
  openAccountMovements: (accountId) => set({ currentView: "movimientos", movementsTarget: { accountId } }),
  // Only acknowledge this request; a newer navigation must not be cleared.
  consumeMovementsTarget: (target) => set((state) => state.movementsTarget === target ? { movementsTarget: null } : state),
}));
