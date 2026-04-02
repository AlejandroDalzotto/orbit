import { invoke } from "@tauri-apps/api/core";
import { Category } from "../definitions/categories";

export async function getCategories() {
  const categories = await invoke<Category[]>("get_categories");
  return categories;
}

export async function addCategory(name: string) {
  const category = await invoke<Category>("add_category", { name });
  return category;
}

export async function deleteCategory(id: number) {
  const result = await invoke<boolean>("delete_category", { id });
  return result;
}

export async function updateCategory(id: number, name: string) {
  const result = await invoke<Category>("update_category", { id, name });
  return result;
}
