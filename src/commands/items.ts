import { invoke } from "@tauri-apps/api/core";
import { PurchaseWithDetails } from "../definitions/items";

export async function purchasesByItemId(itemId: number): Promise<PurchaseWithDetails[]> {
  return await invoke<PurchaseWithDetails[]>("purchases_by_item", { itemId });
}
