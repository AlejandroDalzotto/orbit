import type { Account, AddAccount, UpdateAccount } from "../definitions/accounts";
import type { Category } from "../definitions/categories";
import type { AddGroup, GroupWithMovements, UpdateGroup } from "../definitions/groups";
import type { AddItem, Item, ItemWithPurchase, PurchaseWithDetails, Store, UpdateItem } from "../definitions/items";
import type {
  AddMovement,
  Movement,
  MovementFilters,
  MovementStats,
  MovementTypeFilter,
  Period,
  SortCriteria,
  UpdateMovement,
} from "../definitions/movements";

export interface AppSlice {
  isInitialized: boolean;
  initApp: () => Promise<void>;
}

export interface CategorySlice {
  /**
   * It asks for all the categories from the server, and updates the `categories` state with the response.
   */
  initCategories: () => Promise<void>;
  categories: Category[];
  addCategory: (name: string) => Promise<number>;
  deleteCategory: (id: number) => Promise<void>;
  updateCategory: (id: number, name: string) => Promise<void>;
}

export interface AccountSlice {
  /**
   * It asks for all the accounts from the server, and updates the `accounts` state with the response.
   */
  initAccounts: () => Promise<void>;
  accounts: Account[];
  addAccount: (account: AddAccount) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  updateAccount: (id: number, account: UpdateAccount) => Promise<void>;
}

export interface MovementSlice {
  stats: MovementStats;
  filters: MovementFilters;
  changeType: (type: MovementTypeFilter) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  changePeriod: (period: Period) => void;
  filterByCategoryId: (categoryId: number | null) => void;
  filterByGroupId: (groupId: number | null) => void;
  changeSort: (sort: SortCriteria) => void;
  filterByQuery: (query: string) => void;
  movements: Movement[];
  totalMovements: number;
  initMovements: () => Promise<void>;
  addMovement: (movement: AddMovement) => Promise<void>;
  updateMovement: (id: number, movement: UpdateMovement) => Promise<void>;
  deleteMovement: (id: number) => Promise<void>;
  getItemsByMovementId: (id: number) => Promise<ItemWithPurchase[]>;
  getMovementsByAccount: (id: number) => Promise<Movement[]>;
  setStats: () => void;
}

export interface ItemSlice {
  items: Item[];
  initItems: () => Promise<void>;
  addItem: (item: AddItem) => Promise<void>;
  updateItem: (id: number, item: UpdateItem) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
}

export interface StoreSlice {
  stores: Store[];
  initStores: () => Promise<void>;
  // addStore: (store: AddStore) => Promise<void>;
  // updateStore: (id: number, store: UpdateStore) => Promise<void>;
  // deleteStore: (id: number) => Promise<void>;
}

export interface GroupSlice {
  groups: GroupWithMovements[];
  initGroups: () => Promise<void>;
  addGroup: (group: AddGroup) => Promise<void>;
  updateGroup: (id: number, group: UpdateGroup) => Promise<void>;
  deleteGroup: (id: number) => Promise<void>;
}

export interface PurchaseSlice {
  purchases: PurchaseWithDetails[];
  initPurchases: () => Promise<void>;
  getPurchasesByItemId: (itemId: number) => Promise<PurchaseWithDetails[]>;
}

export type GlobalStoreState = CategorySlice & AccountSlice & AppSlice & MovementSlice & ItemSlice & StoreSlice & GroupSlice & PurchaseSlice;
