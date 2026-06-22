import { StateCreator } from "zustand";
import { GlobalStoreState, GroupSlice } from "../types";
import { invoke } from "@tauri-apps/api/core";
import { AddGroup, GroupWithMovements, UpdateGroup } from "../../definitions/groups";

export const createGroupsSlice: StateCreator<GlobalStoreState, [], [], GroupSlice> = (set, get) => ({
  groups: [],
  initGroups: async () => {
    const groups = await invoke<GroupWithMovements[]>("get_groups");
    set({ groups });
  },

  addGroup: async (group: AddGroup) => {
    const _created = await invoke<GroupWithMovements>("add_group", { group });

    get().initGroups();
  },

  updateGroup: async (id: number, group: UpdateGroup) => {
    const _updated = await invoke<GroupWithMovements>("update_group", { id, group });

    get().initGroups();
  },

  deleteGroup: async (id: number) => {
    await invoke("delete_group", { id });
    get().initGroups();
  },
});
