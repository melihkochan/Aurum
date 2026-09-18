import type { AppNotification, NotificationPreferences } from './types';

const STORAGE_KEYS = {
  NOTIFICATIONS: 'aurum_notifications_v1',
  PREFERENCES: 'aurum_notification_prefs_v1',
  DEDUP_SET: 'aurum_notification_dedup_v1',
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  goals: true,
  recurringIncome: true,
  recurringExpense: true,
  portfolio: true,
  market: true,
  security: true,
  system: false,
  browserNotifications: false,
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'GOAL',
    title: 'Yeni Araba hedefin tamamlandı',
    message: '₺750.000 hedefinin üzerine çıktın.',
    createdAt: '2 dakika önce',
    timestamp: Date.now() - 2 * 60 * 1000,
    read: false,
    metadata: { goalId: 'goal-car', percentage: 105 },
  },
  {
    id: 'notif-2',
    type: 'INCOME',
    title: 'Düzenli gelirin eklendi',
    message: 'Freelance • +₺57.700',
    createdAt: 'Bugün',
    timestamp: Date.now() - 4 * 3600 * 1000,
    read: false,
    metadata: { amount: 57700, account: 'Garanti BBVA' },
  },
  {
    id: 'notif-3',
    type: 'PORTFOLIO',
    title: 'Portföyün yükseldi',
    message: 'Portföy değerin bugün %2,4 arttı.',
    createdAt: 'Bugün',
    timestamp: Date.now() - 6 * 3600 * 1000,
    read: false,
    metadata: { changePercent: 2.4 },
  },
  {
    id: 'notif-4',
    type: 'SECURITY',
    title: 'Yeni giriş yapıldı',
    message: 'Windows • Chrome üzerinden güvenli oturum açıldı.',
    createdAt: 'Dün',
    timestamp: Date.now() - 24 * 3600 * 1000,
    read: true,
  },
];

export class NotificationService {
  public static getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to parse notifications:', e);
    }
    // Initialize with default realistic notifications
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }

  public static saveNotifications(list: AppNotification[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  }

  public static getPreferences(): NotificationPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to parse notification preferences:', e);
    }
    return DEFAULT_PREFERENCES;
  }

  public static savePreferences(prefs: NotificationPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.error('Failed to save notification preferences:', e);
    }
  }

  // Deduplication check: returns true if event was already notified
  public static hasEventBeenNotified(eventKey: string): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DEDUP_SET);
      const set: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      return !!set[eventKey];
    } catch {
      return false;
    }
  }

  public static recordNotifiedEvent(eventKey: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DEDUP_SET);
      const set: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      set[eventKey] = true;
      localStorage.setItem(STORAGE_KEYS.DEDUP_SET, JSON.stringify(set));
    } catch (e) {
      console.error('Failed to record notified event:', e);
    }
  }

  public static addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'timestamp' | 'read'> & { dedupKey?: string }): AppNotification | null {
    if (notif.dedupKey && this.hasEventBeenNotified(notif.dedupKey)) {
      return null;
    }

    const currentList = this.getNotifications();
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      createdAt: 'Az önce',
      timestamp: Date.now(),
      read: false,
      action: notif.action,
      metadata: notif.metadata,
    };

    const updated = [newNotif, ...currentList].slice(0, 50); // keep up to 50
    this.saveNotifications(updated);

    if (notif.dedupKey) {
      this.recordNotifiedEvent(notif.dedupKey);
    }

    // Trigger browser notification if allowed
    this.trySendBrowserNotification(newNotif.title, newNotif.message);

    return newNotif;
  }

  public static markAsRead(id: string): AppNotification[] {
    const list = this.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications(list);
    return list;
  }

  public static markAllAsRead(): AppNotification[] {
    const list = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.saveNotifications(list);
    return list;
  }

  public static clearAll(): AppNotification[] {
    this.saveNotifications([]);
    return [];
  }

  private static trySendBrowserNotification(title: string, body: string): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    const prefs = this.getPreferences();
    if (!prefs.browserNotifications) return;

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch (e) {
        console.error('Browser notification could not be shown:', e);
      }
    }
  }
}
