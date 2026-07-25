'use client';

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import styles from './AppShell.module.css';
import type { SidebarProps } from './types';

export function Sidebar({
  items,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  brandName = 'nexcore',
  brandBadge = 'Kernel Shell',
}: SidebarProps) {
  const onCloseMobileRef = useRef(onCloseMobile);

  useEffect(() => {
    onCloseMobileRef.current = onCloseMobile;
  }, [onCloseMobile]);

  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseMobileRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  const sidebarClasses = [
    styles.sidebar,
    isCollapsed ? styles.collapsed : '',
    isMobileOpen ? styles.mobileOpen : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {isMobileOpen && (
        <div
          className={styles.backdrop}
          onClick={onCloseMobile}
          role="presentation"
        />
      )}

      <aside className={sidebarClasses} aria-label="Main Navigation">
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <span className={styles.logo}>{brandName}</span>
            <span className={styles.badge}>{brandBadge}</span>
          </div>

          <button
            type="button"
            className={styles.closeMobileButton}
            onClick={onCloseMobile}
            aria-label="Close navigation drawer"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className={styles.navSection}>
          <ul className={styles.navList}>
            {items.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href ?? '#'}
                  className={[
                    styles.navItem,
                    item.isActive ? styles.active : '',
                  ].join(' ')}
                  onClick={(e) => {
                    if (!item.href || item.href === '#') {
                      e.preventDefault();
                    }
                    if (isMobileOpen) {
                      onCloseMobile();
                    }
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {item.badge && (
                    <span className={styles.navBadge}>{item.badge}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} aria-hidden="true" />
            ) : (
              <ChevronLeft size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
