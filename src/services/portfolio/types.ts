import type { AssetKey } from '../market/types';

export type HoldingsMap = Record<AssetKey, number>;

export type TransactionType = 'buy' | 'sell' | 'income' | 'expense' | 'transfer' | 'withdrawal' | 'deposit';

export type TransactionStatus = 'expected' | 'completed' | 'cancelled';

export type AccountType = 'bank' | 'cash' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  balance?: number; // Cached or computed balance
  currency: 'TRY' | 'USD' | 'EUR';
  bankName?: string;
  icon?: string;
  color?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  color?: string;
  monthlyBudget?: number;
  active: boolean;
  createdAt: number;
}

export type RecurringFrequency = 'monthly' | 'weekly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  name: string;
  categoryId: string;
  amount: number;
  frequency: RecurringFrequency;
  dayOfMonth: number;
  accountId: string;
  startDate: string;
  nextOccurrence?: string; // e.g. "2026-10-01" or "1 Ekim 2026"
  endDate?: string;
  installmentCurrent?: number; // e.g. 5
  installmentTotal?: number; // e.g. 8
  installmentRemaining?: number;
  autoComplete?: boolean;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export type CashflowCategory = 
  | 'salary' 
  | 'freelance' 
  | 'bonus'
  | 'investment' 
  | 'refund'
  | 'rent' 
  | 'grocery' 
  | 'bills' 
  | 'phone'
  | 'internet'
  | 'transport' 
  | 'fuel'
  | 'dining' 
  | 'entertainment' 
  | 'health' 
  | 'shopping'
  | 'subscription'
  | 'installment'
  | 'education'
  | 'other';

export interface Transaction {
  id: string;
  assetKey?: AssetKey;
  quantity?: number;
  type: TransactionType;
  unitPrice?: number;
  totalValue: number;
  purchasePrice?: number;
  // Transaction date & time (when actual buy/sell happened)
  date: string; // e.g. "12 Eylül 2026" or "Bugün, 14:30"
  timestamp: number;
  transactionDate?: string; // e.g. "12 Eylül 2026"
  transactionTime?: string; // e.g. "15:20"
  // System entry date & time (when user recorded it in AURUM)
  createdAt?: number;
  createdDateStr?: string; // e.g. "18 Eylül 2026 • 19:10"
  marketPriceAtTransaction?: number;
  category?: CashflowCategory | string;
  categoryId?: string;
  title?: string;
  name?: string;
  note?: string;
  // Account connections
  accountId?: string; // Source account (for expense, transfer from, or asset buy source)
  targetAccountId?: string; // Destination account (for transfer to, or asset sell proceeds)
  status?: TransactionStatus; // 'expected' | 'completed' | 'cancelled'
  recurringTransactionId?: string;
  installmentCurrent?: number;
  installmentTotal?: number;
}

export type GoalCategory = 'car' | 'house' | 'vacation' | 'tech' | 'education' | 'wedding' | 'target' | 'other';

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // e.g. "18 Eylül 2027"
  icon: string; // Emoji or identifier
  imageUrl?: string; // Optional custom uploaded photo/image
  category: GoalCategory;
  createdAt: number;
  note?: string;
}

// Personal Finance Notes & Todos
export type NoteType = 'note' | 'todo';
export type TodoPriority = 'low' | 'medium' | 'high' | 'today' | 'week' | 'later';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  tags: string[];
  completed?: boolean;
  priority?: TodoPriority;
  dueDate?: string;
  createdAt: number | string;
  updatedAt?: number | string;
  color?: string;
}

// Custom Asset Metadata overrides (e.g. customized image, name, or description)
export interface CustomAssetMeta {
  name?: string;
  customName?: string;
  description?: string;
  customDescription?: string;
  imageUrl?: string;
  customImage?: string;
  note?: string;
  updatedAt?: number;
}
export type CustomAssetMap = Partial<Record<AssetKey, CustomAssetMeta>>;

export type PerformancePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface PeriodPerformance {
  amount: number;
  percent: number;
  isPositive: boolean;
  periodLabel: string;
}

export interface PortfolioSnapshot {
  timestamp: number;
  dateStr: string;
  totalValue: number;
  investedCapital: number;
}

export interface UserPreferences {
  name: string;
  currency: 'TRY' | 'USD' | 'EUR';
  isBalanceHidden: boolean;
  autoRefreshEnabled: boolean;
  refreshIntervalSeconds: number;
  performancePeriod: PerformancePeriod;
}
