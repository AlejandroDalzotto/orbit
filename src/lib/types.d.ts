export type OperationType = "income" | "expense";

export type Operation = {
  id: string;
  date: string;
  amount: number;
  type: OperationType;
};

export type AppLink = {
  id: string;
  href: string;
  label: string;
};