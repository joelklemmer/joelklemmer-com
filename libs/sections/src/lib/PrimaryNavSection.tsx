'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';

export interface PrimaryNavItem {
  href: string;
  label: string;
}

export interface PrimaryNavSectionProps {
  items: PrimaryNavItem[];
}

export function PrimaryNavSection({ items }: PrimaryNavSectionProps) {
  const pathname = usePathname();
  const common = useTranslations('common');
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
          focusedIndex !== null ? focusedIndex : e.key === 'ArrowDown' ? -1 : items.length;
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

  // Focus first item when opening
  useEffect(() => {
    if (isOpen && itemRefs.current[0]) {
      requestAnimationFrame(() => {
        itemRefs.current[0]?.focus();
        setFocusedIndex(0);
      });
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !menuRef.current) return;

      const focusableElements = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        )
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleFocusTrap);
    return () => {
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === pathname) return true;
    // Handle home page
    if (href.endsWith('/') && pathname === href.slice(0, -1)) return true;
    if (!href.endsWith('/') && pathname === `${href}/`) return true;
    return false;
  };

  const navItems = (
    <>
      {items.map((item, index) => {
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`${focusRingClass} rounded-sm px-1 py-0.5 text-sm transition-colors motion-reduce:transition-none ${
                active
                  ? 'font-semibold text-accent border-b border-accent'
                  : 'text-muted hover:text-text'
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop: horizontal nav */}
      <ul className="hidden md:flex flex-wrap items-center gap-4 text-sm text-muted">
        {navItems}
      </ul>

      {/* Mobile: menu button and panel */}
      <div className="md:hidden relative">
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={menuId}
          aria-haspopup="true"
          aria-label={common('a11y.navLabel')}
          onClick={handleToggle}
          className={`${focusRingClass} flex items-center justify-center w-8 h-8 rounded-sm text-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
          title={common('a11y.navLabel')}
        >
          <span aria-hidden="true">{isOpen ? '✕' : '☰'}</span>
          <span className={visuallyHiddenClass}>
            {isOpen ? 'Close navigation' : 'Open navigation'}
          </span>
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-labelledby={triggerId}
            onKeyDown={handleKeyDown}
            className="absolute end-0 top-full mt-1 min-w-[12rem] rounded-md border border-border bg-surface shadow-lg z-50 p-2"
          >
            <ul className="flex flex-col gap-1" role="none">
              {items.map((item, index) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href} role="none">
                    <Link
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      href={item.href}
                      role="menuitem"
                      aria-current={active ? 'page' : undefined}
                      onClick={handleClose}
                      className={`${focusRingClass} block w-full px-4 py-2 text-sm text-left rounded-sm transition-colors motion-reduce:transition-none ${
                        active
                          ? 'bg-accent/10 text-accent font-semibold'
                          : 'text-text hover:bg-muted/50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
