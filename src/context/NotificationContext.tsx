import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { AppNotification, NotificationPreferences } from '../services/notification/types';
import { NotificationService } from '../services/notification/notificationService';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'timestamp' | 'read'> & { dedupKey?: string }) => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  requestBrowserPermission: () => Promise<NotificationPermission>;
  browserPermission: NotificationPermission;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => NotificationService.getNotifications());
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => NotificationService.getPreferences());
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    const updated = NotificationService.markAsRead(id);
    setNotifications(updated);
  }, []);

  const markAllAsRead = useCallback(() => {
    const updated = NotificationService.markAllAsRead();
    setNotifications(updated);
  }, []);

  const clearAll = useCallback(() => {
    const updated = NotificationService.clearAll();
    setNotifications(updated);
  }, []);

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'createdAt' | 'timestamp' | 'read'> & { dedupKey?: string }) => {
    const created = NotificationService.addNotification(notif);
    if (created) {
      setNotifications((prev) => [created, ...prev]);
    }
  }, []);

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    const newPrefs = { ...preferences, ...updates };
    NotificationService.savePreferences(newPrefs);
    setPreferences(newPrefs);
  }, [preferences]);

  const requestBrowserPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        updatePreferences({ browserNotifications: true });
      }
      return perm;
    } catch {
      return 'denied';
    }
  }, [updatePreferences]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
        updatePreferences,
        requestBrowserPermission,
        browserPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
