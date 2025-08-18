import { Transaction, TransactionCategory } from "@/models/transaction"

export const renderSpecificFields = (transaction: Transaction) => {
  const category = transaction.category

  switch (category) {
    case TransactionCategory.Salary:
      return (
        <>

        </>
      );

    case TransactionCategory.Freelance:
      return (
        <>

        </>
      );
    case TransactionCategory.Entertainment:
      return (
        <>

        </>
      );
    case TransactionCategory.Food:
      return (
        <>

        </>
      );
    case TransactionCategory.Healthcare:
      return (
        <>

        </>
      );
    case TransactionCategory.Housing:
      return (
        <>

        </>
      );
    case TransactionCategory.Supermarket:
      return (
        <>

        </>
      );
    case TransactionCategory.Transportation:
      return (
        <>

        </>
      );
    case TransactionCategory.Utilities:
      return (
        <>

        </>
      );
    default:
      return (
        <>

        </>
      );
  }
}