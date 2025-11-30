import { dateStringToTimestamp } from "@/lib/utils";
import type {
  FreelanceTransaction,
  ItemRef,
  RequestCreateTransaction,
  RequestUpdateTransaction,
  SalaryTransaction,
  ShoppingTransaction,
  TransactionCategory,
} from "@/models/transaction";

const getString = (fd: FormData, key: string) =>
  (fd.get(key) as string | null) ?? null;

type CategoryFields = {
  [TransactionCategory.Basic]: object;
  [TransactionCategory.Freelance]: Pick<
    FreelanceTransaction,
    "client" | "project"
  >;
  [TransactionCategory.Salary]: Pick<
    SalaryTransaction,
    "employer" | "extraDetails" | "job"
  >;
  [TransactionCategory.Shopping]: Pick<
    ShoppingTransaction,
    "items" | "storeName"
  >;
};

const CATEGORY_SPECIFIC_FIELDS_BUILDER: {
  [K in TransactionCategory]: (fd: FormData) => Partial<CategoryFields[K]>;
} = {
  basic: () => ({}),
  freelance: (fd) => ({
    client: getString(fd, "client"),
    project: getString(fd, "project"),
  }),
  salary: (fd) => ({
    employer: getString(fd, "employer"),
    extraDetails: getString(fd, "extraDetails"),
    job: getString(fd, "job") as string,
  }),
  shopping: (fd) => {
    const items: ItemRef[] = [];
    let index = 0;

    while (fd.has(`items[${index}].name`)) {
      const itemId = fd.get(`items[${index}].itemId`) as string | null;
      const name = (fd.get(`items[${index}].name`) as string) ?? "";
      const quantity = fd.get(`items[${index}].quantity`);
      const price = fd.get(`items[${index}].price`);

      if (name.trim()) {
        // Solo agregar si tiene nombre
        items.push({
          itemId: itemId ? itemId : null,
          name: name.trim(),
          quantity: quantity ? Number(quantity) : null,
          price: price ? Number(price) : null,
        });
      }

      index++;
    }

    return {
      items,
      storeName: fd.get("storeName") as string,
    };
  },
};

export function buildTransactionFromFormData<T extends "create" | "edit">(
  formData: FormData,
  mode: T,
  category: TransactionCategory,
): T extends "create" ? RequestCreateTransaction : RequestUpdateTransaction {
  const result: Record<string, unknown> = {};

  result.amount = Number(formData.get("amount"));
  result.date = dateStringToTimestamp(formData.get("date") as string);
  result.details = formData.get("details") as string;

  if (mode === "create") {
    result.affectsBalance = formData.get("affectsBalance") === "on";
    result.accountId = formData.get("accountId");
    result.type = formData.get("type");
    result.category = category;
  }

  const extraFields = CATEGORY_SPECIFIC_FIELDS_BUILDER[category](formData);

  return { ...result, ...extraFields } as T extends "create"
    ? RequestCreateTransaction
    : RequestUpdateTransaction;
}
