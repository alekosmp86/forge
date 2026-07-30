'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import styles from './NotificationBell.module.css';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', title: 'Welcome to Forge', message: 'In-App Alerts module successfully active.', isRead: false },
    { id: '2', title: 'System Security', message: 'JWT session cookie generated.', isRead: true },
  ]);

  const unreadCount = notifications.filter((n: NotificationItem) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev: NotificationItem[]) => prev.map((n: NotificationItem) => ({ ...n, isRead: true })));
  };

  return (
    <div className={styles.bellContainer}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={() => setIsOpen((prev: boolean) => !prev)}
        aria-label="Open notifications"
      >
        <Bell size={18} aria-hidden="true" />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', cursor: 'pointer' }}
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.dropdownList}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>No notifications yet</div>
            ) : (
              notifications.map((item: NotificationItem) => (
                <div
                  key={item.id}
                  className={`${styles.item} ${!item.isRead ? styles.unreadItem : ''}`}
                  onClick={() => setNotifications((prev: NotificationItem[]) => prev.map((n: NotificationItem) => (n.id === item.id ? { ...n, isRead: true } : n)))}
                >
                  <div className={styles.itemTitle}>{item.title}</div>
                  <div className={styles.itemMessage}>{item.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
