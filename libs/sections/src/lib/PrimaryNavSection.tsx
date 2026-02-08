'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import { useTranslations } from 'next-intl';

export interface PrimaryNavItem {
  href: string;
  label: string;
}

export interface PrimaryNavSectionProps {
  items: PrimaryNavItem[];
}

export function PrimaryNavSection({ items }: PrimaryNavSectionProps) {
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

  // Desktop: horizontal nav
  const desktopNav = (
    <ul className="hidden md:flex flex-wrap items-center gap-4 text-sm text-muted">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${focusRingClass} rounded-sm px-1 py-0.5 transition-colors motion-reduce:transition-none ${
                isActive ? 'text-text font-semibold' : 'hover:text-text'
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

  // Mobile: menu button + panel
  const mobileNav = (
    <div className="relative md:hidden">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="true"
        aria-label={a11y('a11y.navLabel')}
        onClick={handleToggle}
        className={`${focusRingClass} flex items-center gap-2 rounded-sm px-2 py-1 text-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
      >
        <span aria-hidden="true">☰</span>
        <span className="sr-only">{a11y('a11y.navLabel')}</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={handleKeyDown}
          className="absolute end-0 top-full mt-1 min-w-[12rem] rounded-md border border-border bg-surface shadow-lg z-50"
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
                  lang={undefined}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  className={`${focusRingClass} block w-full px-4 py-2 text-sm text-left transition-colors motion-reduce:transition-none ${
                    isActive
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-text hover:bg-muted/50'
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
    <>
      {desktopNav}
      {mobileNav}
    </>
  );
}
