import { Transaction, TransactionCategory } from "@/models/transaction";
import { Building2, ShoppingCart, Shovel } from "lucide-react";

export const renderSpecificInformation = (transaction: Transaction) => {
  switch (transaction.category) {
    case TransactionCategory.Salary:
      return (
        <>
          <p
            title={transaction.job || "n/s"}
            className="flex items-center gap-x-2 text-sm text-neutral-500"
          >
            <Shovel className="w-3 h-3" />
            {transaction.job || "n/s"}
          </p>
          {transaction.employer ? (
            <p
              title={transaction.employer || "n/s"}
              className="flex items-center gap-x-2 text-sm text-neutral-500"
            >
              <Building2 className="w-3 h-3" />
              {transaction.employer || "n/s"}
            </p>
          ) : null}
        </>
      );

    case TransactionCategory.Freelance:
      return (
        <>
          {transaction.client ? (
            <p
              title={transaction.client || "n/s"}
              className="flex items-center gap-x-2 text-sm text-neutral-500"
            >
              <span className="w-1 h-1 rounded-full bg-neutral-600" />
              {transaction.client || "n/s"}
            </p>
          ) : null}
          {transaction.project ? (
            <p
              title={transaction.project || "n/s"}
              className="flex items-center gap-x-2 text-sm text-neutral-500"
            >
              <Building2 className="w-3 h-3" />
              {transaction.project || "n/s"}
            </p>
          ) : null}
        </>
      );
    case TransactionCategory.Supermarket:
      return (
        <>
          <p
            title={transaction.storeName || "n/s"}
            className="flex truncate items-center gap-x-2 text-sm text-neutral-500"
          >
            <ShoppingCart className="w-3 h-3" />
            {transaction.storeName || "n/s"}
          </p>
          <p className="flex items-center gap-x-2 text-sm text-neutral-500">
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
            {transaction.items.length}{" "}
            {transaction.items.length === 1 ? "item" : "items"}
          </p>
        </>
      );
    default:
      return null;
  }
};
