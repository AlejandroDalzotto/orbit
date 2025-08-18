import { TransactionCategory, TransactionType } from "@/models/transaction";

const categories: Record<TransactionType, TransactionCategory[]> = {
  'income': [TransactionCategory.Salary, TransactionCategory.Freelance, TransactionCategory.Basic],
  'expense': [
    TransactionCategory.Supermarket,
    TransactionCategory.Food,
    TransactionCategory.Housing,
    TransactionCategory.Transportation,
    TransactionCategory.Healthcare,
    TransactionCategory.Utilities,
    TransactionCategory.Entertainment,
    TransactionCategory.Basic,
  ],
}

export default function CategoryField({
  fieldPrefix,
  type
}: {
  fieldPrefix: string,
  type: TransactionType
}) {

  return (
    <div>
      <label htmlFor={`${fieldPrefix}category`}>category</label>
      <select name="category" id={`${fieldPrefix}category`}>
        {categories[type].map(category => {

          return (
            <option key={category} value={category}>
              {category}
            </option>
          )

        })}
      </select>
    </div>
  )
}
