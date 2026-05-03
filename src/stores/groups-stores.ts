import { create } from "zustand";
import { GroupWithMovements, AddGroup, UpdateGroup } from "../definitions/groups";
import { addGroup, deleteGroup, getGroups, updateGroup } from "../commands/groups";

type GroupStore = {
  items: GroupWithMovements[];
  actions: {
    initialize: () => Promise<void>;
    addGroup: (group: AddGroup) => Promise<void>;
    updateGroup: (id: number, group: UpdateGroup) => Promise<void>;
    deleteGroup: (id: number) => Promise<void>;
  };
};

const useGroupStore = create<GroupStore>((set) => ({
  items: [],
  actions: {
    initialize: async () => {
      const items = await getGroups();
      set({ items });
    },

    addGroup: async (group: AddGroup) => {
      const created = await addGroup(group);
      set((s) => ({ items: [...s.items, created] }));
    },

    updateGroup: async (id: number, group: UpdateGroup) => {
      const updated = await updateGroup(id, group);
      set((s) => ({ items: s.items.map((g) => (g.id === id ? updated : g)) }));
    },

    deleteGroup: async (id: number) => {
      await deleteGroup(id);
      set((s) => ({ items: s.items.filter((g) => g.id !== id) }));
    },
  },
}));

export const useGroups = () => useGroupStore((s) => s.items);
export const useGroupActions = () => useGroupStore((s) => s.actions);
