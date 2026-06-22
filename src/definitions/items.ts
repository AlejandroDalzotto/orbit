export interface Item {
  id: number;
  name: string;
  brand?: string | null;
  created_at: string;
  purchase_count: number;
  last_purchased_at?: string | null; // should be a string like "2 days ago" | "4 weeks ago"
  last_price_registered?: number;
}

export type AddItem = {
  name: string;
  brand?: string | null;
};

export type UpdateItem = {
  name: string;
  brand?: string | null;
};

export interface Store {
  id: number;
  name: string;
  color?: string | null;
  created_at: string;
  total_purchases: number;
  total_expenses: number;
}

// TODO: The backend should return the actual information rather than just the IDs.
// e.g. the mov_information instead of just the mov_id.
// This should be easy-to-implement using JOINS in SQL.
export interface PurchaseWithDetails {
  id: number;
  price: number;
  quantity: number;
  created_at: string;
  /**
   * Movement this purchase belongs to
   */
  mov_id: number;
  mov_date: string;
  mov_currency: string;
  /**
   * Store where the item was purchased (optional)
   */
  store_id?: number;
  store_name?: string;
}

export type AddPurchase = {
  price: number;
  quantity: number;
  mov_id: number;
  item_id: number;
  /**
   * Store name. Auto-created if it doesn't exist, NULL if not provided.
   */
  store_name?: string | null;
};

/**
 * An item with its purchase context for a specific movement.
 * Used to display "what was bought" in a movement detail view.
 */
export type ItemWithPurchase = {
  /// Purchase fields
  purchase_id: number;
  price: number;
  quantity: number;
  /// Item fields
  item_id: number;
  item_name: string;
  item_brand?: string | null;
  /// Store fields (optional)
  store_id?: number | null;
  store_name?: string | null;
};
