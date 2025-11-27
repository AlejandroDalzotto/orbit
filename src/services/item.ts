import type { Response } from "@/lib/types";
import {
  Item,
  RequestCreateItem,
  RequestEditItem,
  RequestIsSpendingLeak,
} from "@/models/item";
import { invoke } from "@tauri-apps/api/core";

export class ItemService {
  async listItems(): Response<Item[]> {
    try {
      const items = (await invoke<Item[]>("list_items")) as Item[];
      return [null, items];
    } catch (e) {
      return [{ message: (e as Error).message }, null];
    }
  }

  async getItemById(id: string): Promise<Item | null> {
    const item = (await invoke("get_item_by_id", { id })) as Item | null;
    if (!item) {
      return null;
    }
    return item;
  }

  async addItem(entry: RequestCreateItem): Response<Item> {
    // Basic validation
    if (!entry.name || entry.name.trim().length === 0) {
      return [{ message: "Item name is required." }, null];
    }

    try {
      const result = (await invoke<Item>("add_item", {
        entry,
      })) as Item;
      return [null, result];
    } catch (e) {
      return [{ message: (e as Error).message }, null];
    }
  }
  async editItem(id: string, newValues: RequestEditItem): Response<Item> {
    try {
      const result = (await invoke<Item>("edit_item", {
        id,
        newValues,
      })) as Item;
      return [null, result];
    } catch (e) {
      return [{ message: (e as Error).message }, null];
    }
  }

  async editIsSpendingLeak(values: RequestIsSpendingLeak): Response<Item> {
    try {
      const result = (await invoke<Item>("edit_is_spending_leak", {
        values,
      })) as Item;
      return [null, result];
    } catch (e) {
      return [{ message: (e as Error).message }, null];
    }
  }

  async deleteItem(id: string): Response<Item> {
    try {
      const result = (await invoke<Item>("delete_item", { id })) as Item;
      return [null, result];
    } catch (e) {
      return [{ message: (e as Error).message }, null];
    }
  }
}
