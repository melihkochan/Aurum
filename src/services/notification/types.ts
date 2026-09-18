export type NotificationType = 
  | 'GOAL' 
  | 'INCOME' 
  | 'EXPENSE' 
  | 'MARKET' 
  | 'PORTFOLIO' 
  | 'SECURITY' 
  | 'SYSTEM' 
  | 'REMINDER';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string; // e.g. "2 dakika önce" or ISO date
  timestamp: number;
  read: boolean;
  action?: string;
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  goals: boolean;
  recurringIncome: boolean;
  recurringExpense: boolean;
  portfolio: boolean;
  market: boolean;
  security: boolean;
  system: boolean;
  browserNotifications: boolean;
}
