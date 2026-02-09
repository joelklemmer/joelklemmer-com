'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import { useTranslations } from 'next-intl';

export interface NavItem {
  href: string;
  label: string;
}

export interface NavProps {
  items: NavItem[];
}

export function Nav({ items }: NavProps) {
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

  // Desktop: horizontal nav with understated active state (no bright boxes)
  const desktopNav = (
    <ul className="hidden md:flex flex-wrap items-center gap-1 text-sm min-h-[var(--masthead-bar-height)]">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.href} className="flex items-center h-full">
            <Link
              href={item.href}
              className={`${focusRingClass} rounded-sm px-3 py-1.5 h-full flex items-center transition-colors motion-reduce:transition-none relative text-muted hover:text-text ${
                isActive ? 'text-text font-medium border-b-2 border-border' : ''
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
        aria-haspopup="true"
        aria-label={a11y('a11y.navLabel')}
        onClick={handleToggle}
        className={`${focusRingClass} masthead-touch-target flex items-center justify-center rounded-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
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
                  className={`${focusRingClass} block w-full px-4 py-2.5 text-sm text-start transition-colors motion-reduce:transition-none relative ${
                    isActive
                      ? 'text-text font-medium bg-muted/30 border-s-2 border-border'
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
    <nav aria-label={a11y('a11y.navLabel')} className="flex items-center">
      {desktopNav}
      {mobileNav}
    </nav>
  );
}
