
export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  date: string; // ISO format
  amount: number;
  category: string;
  description: string;
  type: TransactionType;
}

export type TimePeriod = 'week' | 'month' | 'year';

export interface CategorySummary {
  name: string;
  amount: number;
}

export interface PeriodComparison {
  current: number;
  previous: number;
  percentageChange: number;
}

export interface AIInsight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  type: 'saving' | 'trend' | 'alert';
}
