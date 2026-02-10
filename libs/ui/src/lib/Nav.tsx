'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  focusRingClass,
  interactionTransitionClass,
  visuallyHiddenClass,
} from '@joelklemmer/a11y';
import { useTranslations } from 'next-intl';

/** Perceptual rank for cognitive hierarchy (primary = hub, secondary = verification, tertiary = institutional). */
export type NavItemRank = 'primary' | 'secondary' | 'tertiary';

export interface NavItem {
  href: string;
  label: string;
  /** Encodes executive scan hierarchy; omitted = identity (e.g. home). */
  rank?: NavItemRank;
}

export interface NavProps {
  items: NavItem[];
  /** When true, desktop list is omitted (server-rendered elsewhere). Only mobile menu is rendered. */
  desktopRendered?: boolean;
}

export function Nav({ items, desktopRendered = false }: NavProps) {
  const pathname = usePathname();
  const a11y = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const menuId = 'primary-nav-menu';
  const triggerId = 'primary-nav-trigger';

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setFocusedIndex(null);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(null);
    triggerRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex =
          focusedIndex !== null
            ? focusedIndex
            : e.key === 'ArrowDown'
              ? -1
              : items.length;
        const nextIndex =
          e.key === 'ArrowDown'
            ? (currentIndex + 1) % items.length
            : (currentIndex - 1 + items.length) % items.length;
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
      }
    },
    [focusedIndex, handleClose, items.length],
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Focus trap: keep focus within menu when open
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const menu = menuRef.current;
      if (!menu) return;
      const focusable = menu.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Focus first item when opening
  useEffect(() => {
    if (isOpen && itemRefs.current[0]) {
      requestAnimationFrame(() => {
        itemRefs.current[0]?.focus();
        setFocusedIndex(0);
      });
    }
  }, [isOpen]);

  // Close menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Desktop: primary nav — omit when desktopRendered (server shell renders links).
  const desktopNav = desktopRendered ? null : (
    <ul className="nav-primary-list hidden md:flex min-h-[var(--masthead-bar-height)]">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href} className="flex items-center h-full">
            <Link
              href={item.href}
              prefetch={false}
              {...(item.rank && { 'data-nav-rank': item.rank })}
              className={`nav-primary-link ${focusRingClass} rounded-sm h-full flex items-center ${interactionTransitionClass} relative ${
                isActive ? 'nav-primary-link--active' : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  // Mobile: menu button + panel (44×44 touch target per Figma parity)
  const mobileNav = (
    <div className="relative md:hidden flex items-center">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label={a11y('a11y.navLabel')}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            handleClose();
          }
          if (e.key === ' ') e.preventDefault(); // Prevent scroll when activating with Space
        }}
        className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-sm text-muted hover:text-text ${interactionTransitionClass}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className={visuallyHiddenClass}>{a11y('a11y.navLabel')}</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={handleKeyDown}
          className="nav-primary-menu absolute end-0 top-full mt-1 min-w-[12rem] rounded-md border border-border bg-surface shadow-lg z-50 text-start"
        >
          <div className="py-1" role="none">
            {items.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  href={item.href}
                  prefetch={false}
                  lang={undefined}
                  role="menuitem"
                  {...(item.rank && { 'data-nav-rank': item.rank })}
                  aria-current={isActive ? 'page' : undefined}
                  className={`nav-primary-menu-item ${focusRingClass} block w-full text-sm text-start ${interactionTransitionClass} relative ${
                    isActive ? 'nav-primary-menu-item--active' : ''
                  }`}
                  onClick={handleClose}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav
      aria-label={a11y('a11y.navLabel')}
      className="nav-primary flex items-center"
    >
      {desktopNav}
      {mobileNav}
    </nav>
  );
}
