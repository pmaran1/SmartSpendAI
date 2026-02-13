
export type TransactionType = 'expense' | 'income';
export type Frequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type LoginMethod = 'google' | 'email' | 'guest';

export interface Transaction {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  amount: number;
  category: string;
  description: string;
  type: TransactionType;
  isRecurring?: boolean;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: TransactionType;
  frequency: Frequency;
  startDate: string;
  lastExecutedDate: string; // ISO date of last time this rule created a transaction
  isActive: boolean;
}

export type TimePeriod = 'week' | 'month' | 'year';

export interface AIInsight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  type: 'saving' | 'trend' | 'alert';
}

export interface Budget {
  category: string;
  limit: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
  isGuest?: boolean;
  loginMethod: LoginMethod;
  savingsGoal: number;
  joinDate: string;
  bio?: string;
  streak: number;
  level: number;
}
