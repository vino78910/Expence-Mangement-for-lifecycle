export interface Expense {
  id: string;
  amount: number;
  group: string;
  category: string;
  paymentMode: string;
  note: string | null;
  date: string;
}

export interface BudgetInfo {
  month: string;
  amount: number;
}

export interface GroupTotal {
  name: string;
  value: number;
  color: string;
}

export interface CategoryTotal {
  category: string;
  group: string;
  amount: number;
  pct: number;
}

export interface WeekBucket {
  label: string;
  range: string;
  total: number;
  entries: number;
  topCategory: string;
}
