import { invoke } from "@tauri-apps/api/core";
import { AddGroup, GroupWithMovements, UpdateGroup } from "../definitions/groups";

export async function getGroups(): Promise<GroupWithMovements[]> {
  const groups = await invoke<GroupWithMovements[]>("get_groups");
  return groups;
}

export async function addGroup(group: AddGroup): Promise<GroupWithMovements> {
  return await invoke<GroupWithMovements>("add_group", { group });
}

export async function updateGroup(id: number, group: UpdateGroup): Promise<GroupWithMovements> {
  return await invoke<GroupWithMovements>("update_group", { id, group });
}

export async function deleteGroup(id: number): Promise<void> {
  await invoke("delete_group", { id });
}
