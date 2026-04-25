import { invoke } from "@tauri-apps/api/core";
import { Movement, AddMovement, UpdateMovement } from "../definitions/movements";

export async function getMovements(): Promise<Movement[]> {
  try {
    const movements = await invoke<Movement[]>("get_movements");
    console.log({ movements });
    return movements;
  } catch (err) {
    console.error("Failed to get movements:", err);
    return [];
  }
}

export async function addMovement(newValues: AddMovement): Promise<Movement | null> {
  try {
    const movement = await invoke<Movement>("add_movement", { movement: newValues });
    return movement;
  } catch (err) {
    console.error("Failed to add movement:", err);
    return null;
  }
}

export async function updateMovement(id: number, movement: UpdateMovement): Promise<Movement | null> {
  try {
    const updated = await invoke<Movement>("update_movement", { id, movement });
    return updated;
  } catch (err) {
    console.error(`Failed to update movement ${id}:`, err);
    return null;
  }
}

export async function deleteMovement(id: number): Promise<boolean> {
  try {
    await invoke("delete_movement", { id });
    return true;
  } catch (err) {
    console.error(`Failed to delete movement ${id}:`, err);
    return false;
  }
}
