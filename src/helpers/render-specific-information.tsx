import { Transaction, TransactionCategory } from "@/models/transaction";

export const renderSpecificInformation = (transaction: Transaction) => {

  switch (transaction.category) {
    case TransactionCategory.Salary:
      return (
        <>
          <p className="flex items-center text-sm text-neutral-700">{transaction.job}</p>
          {transaction.employer ? (
            <p className="flex items-center text-sm text-neutral-700">{transaction.employer}</p>
          ) : null}
        </>
      );

    case TransactionCategory.Freelance:
      return (
        <>
          {transaction.client ? (
            <p className="flex items-center text-sm text-neutral-700">{transaction.client}</p>
          ) : null}
          {transaction.project ? (
            <p className="flex items-center text-sm text-neutral-700">{transaction.project}</p>
          ) : null}
        </>
      );
    case TransactionCategory.Supermarket:
      return (
        <>
          <p className="flex items-center text-sm text-neutral-700">{transaction.storeName}</p>
          <p className="flex items-center text-sm text-neutral-700">{transaction.items.length} {transaction.items.length === 1 ? "item" : "items"}</p>
        </>
      );
    default:
      return null;
  }
}