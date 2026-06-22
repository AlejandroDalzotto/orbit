import { StateCreator } from "zustand";
import { GlobalStoreState, AppSlice } from "../types";

export const createAppSlice: StateCreator<GlobalStoreState, [], [], AppSlice> = (set, get) => ({
  isInitialized: false,

  initApp: async () => {
    try {
      // Disparamos todas las queries IPC en paralelo hacia Tauri/SQLite
      await Promise.all([
        get().initAccounts(),
        get().initCategories(),
        get().initMovements(), // asumiendo que agregás este método en el slice de movimientos
        get().initGroups(),
        get().initItems(),
        get().initStores(),
        get().initPurchases(),
      ]);

      // Una vez que TODO se cargó con éxito, liberamos la UI
      set({ isInitialized: true });
    } catch (error) {
      console.error("Error crítico al inicializar la base de datos en Orbit:", error);
      // Acá podrías manejar un estado de error global si la DB se corrompe
    }
  },
});
