export enum LeakDateRange {
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export interface PurchaseHistoryInfo {
  id: string;
  price: number;
  date: number;
  transactionName: string;
  quantity: number;
}

export interface Item {
  id: string;
  name: string;

  // optional information
  brand?: string;
  hasWarranty?: boolean;

  // optional fields for tracking spending habits
  isSpendingLeak?: boolean;
  spendMoneyLimit?: number;
  spendAmountLimit?: number;
  hasExceededSpendMoneyLimit?: boolean;
  leakDateRange?: LeakDateRange;

  // optional fields for tracking transaction history
  purchaseHistory: PurchaseHistoryInfo[];
  createdAt: number;
  updatedAt: number;
}

export interface RequestCreateItem {
  name: string;
  brand?: string;
  hasWarranty?: boolean;
}

export interface RequestEditItem {
  name?: string;
  brand?: string;
  hasWarranty?: boolean;
}

export interface RequestIsSpendingLeak {
  itemId: string;
  isSpendingLeak: boolean;
  spendMoneyLimit?: number;
  spendAmountLimit?: number;
  leakDateRange?: LeakDateRange;
}

export interface RequestItemRef {
  name: string;
}
