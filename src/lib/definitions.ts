type Currency = "ARS" | "USD";

type Category = "Online subscriptions"
| "Supermarket"
| "Transport"
| "Online shopping"
| "Utilities"
| "Education"
| "Clothing" 
| "Health"
| "Dining out"
| "Rent"
| "Home services"
| "Shopping"
| "Gifts"
| "Personal care"
| "Insurance"
| "Investments"
| "Taxes"
| "Miscellaneous"
| "Salary"
| "Refund"
| "Cash withdrawal"
| "Credit card payment"
| "Other";

export type Transaction = {
  id: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  description: string;
  category: Category;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}