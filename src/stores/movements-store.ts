import { create } from "zustand";
import { Movement, AddMovement, UpdateMovement } from "../definitions/movements";
import { getMovements, addMovement as cmdAdd, updateMovement as cmdUpdate, deleteMovement as cmdDelete } from "../commands/movements";

type MovementStore = {
  movements: Movement[];
  actions: {
    initialize: () => Promise<void>;
    addMovement: (movement: AddMovement) => Promise<void>;
    updateMovement: (id: number, movement: UpdateMovement) => Promise<void>;
    deleteMovement: (id: number) => Promise<void>;
  };
};

const useMovementStore = create<MovementStore>((set) => ({
  movements: [],
  actions: {
    initialize: async () => {
      const movements = await getMovements();
      set({ movements });
    },

    addMovement: async (movement: AddMovement) => {
      const newMovement = await cmdAdd(movement);
      if (!newMovement) return;
      set((old) => ({ movements: [...old.movements, newMovement] }));
    },

    updateMovement: async (id: number, movement: UpdateMovement) => {
      const updated = await cmdUpdate(id, movement);
      if (!updated) return;
      set((old) => ({ movements: old.movements.map((m) => (m.id === id ? updated : m)) }));
    },

    deleteMovement: async (id: number) => {
      const ok = await cmdDelete(id);
      if (!ok) return;
      set((old) => ({ movements: old.movements.filter((m) => m.id !== id) }));
    },
  },
}));

export const useMovements = () => useMovementStore((s) => s.movements);
export const useMovementActions = () => useMovementStore((s) => s.actions);
