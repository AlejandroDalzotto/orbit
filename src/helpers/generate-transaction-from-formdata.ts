import { FreelanceTransaction, Item, RequestCreateTransaction, RequestEditTransaction, SalaryTransaction, SupermarketTransaction, TransactionCategory } from "@/models/transaction"

function dateStringToTimestamp(str: string) {
  const date = new Date(str)
  const timestamp = date.getTime() + (date.getTimezoneOffset() * 60000)

  return timestamp
}

export const generateTransactionFromFormdata = (formData: FormData): RequestCreateTransaction => {
  const transaction = Object.fromEntries(formData) as unknown as RequestCreateTransaction

  transaction.affectsBalance = formData.get('affectsBalance') === 'on';
  transaction.amount = Number(formData.get('amount'));
  transaction.date = dateStringToTimestamp(formData.get('date') as string);
  transaction.details = formData.get('details') as string;

  switch (transaction.category) {
    case TransactionCategory.Supermarket: {

      transaction.storeName = formData.get('storeName') as string;

      // Extraer items del FormData
      const items: Item[] = [];
      let index = 0;

      while (formData.has(`items[${index}].name`)) {
        const name = formData.get(`items[${index}].name`) as string;
        const quantity = formData.get(`items[${index}].quantity`);
        const price = formData.get(`items[${index}].price`);

        if (name.trim()) { // Solo agregar si tiene nombre
          items.push({
            name: name.trim(),
            quantity: quantity ? Number(quantity) : null,
            price: price ? Number(price) : null
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (transaction as any)[`items[${index}].name`];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (transaction as any)[`items[${index}].quantity`];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (transaction as any)[`items[${index}].price`];

        index++;
      }

      transaction.items = items;
      break;
    }

    case TransactionCategory.Salary: {
      transaction.extraDetails = formData.get('extraDetails') as string || null;
      break;
    }

    case TransactionCategory.Freelance: {
      transaction.client = formData.get('client') as string || null;
      transaction.project = formData.get('project') as string || null;
      break;
    }
  }

  return transaction
}

export const generateEditTransactionFromFormdata = (formData: FormData, category: TransactionCategory): RequestEditTransaction => {
  const transaction: Partial<RequestEditTransaction> = {}

  transaction.amount = Number(formData.get('amount'));
  transaction.date = dateStringToTimestamp(formData.get('date') as string);
  transaction.details = formData.get('details') as string;

  switch (category) {
    case TransactionCategory.Supermarket: {

      (transaction as SupermarketTransaction).storeName = formData.get('storeName') as string;

      // Extraer items del FormData
      const items: Item[] = [];
      let index = 0;

      while (formData.has(`items[${index}].name`)) {
        const name = formData.get(`items[${index}].name`) as string;
        const quantity = formData.get(`items[${index}].quantity`);
        const price = formData.get(`items[${index}].price`);

        if (name.trim()) { // Solo agregar si tiene nombre
          items.push({
            name: name.trim(),
            quantity: quantity ? Number(quantity) : null,
            price: price ? Number(price) : null
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (transaction as any)[`items[${index}].name`];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (transaction as any)[`items[${index}].quantity`];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (transaction as any)[`items[${index}].price`];

        index++;
      }

      (transaction as SupermarketTransaction).items = items;
      break;
    }

    case TransactionCategory.Salary: {
      (transaction as SalaryTransaction).extraDetails = formData.get('extraDetails') as string || null;
      break;
    }

    case TransactionCategory.Freelance: {
      (transaction as FreelanceTransaction).client = formData.get('client') as string || null;
      (transaction as FreelanceTransaction).project = formData.get('project') as string || null;
      break;
    }
  }

  return transaction as RequestEditTransaction
}