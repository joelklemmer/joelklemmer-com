'use client';

/**
 * Header controls island: theme toggle, language switcher (globe), accessibility (settings).
 * Uses existing @joelklemmer/ui primitives with portal-based dropdowns to avoid clipping.
 * No cookie preferences in header (footer only).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ThemeProvider,
  ContrastProvider,
  ThemeToggle,
  AccessibilityPanel,
} from '@joelklemmer/ui';
import { ACPProvider } from '@joelklemmer/a11y';
import { locales, type AppLocale } from '@joelklemmer/i18n';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import Link from 'next/link';

const LANGUAGE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  uk: 'Ukrainian',
  es: 'Spanish',
  he: 'Hebrew',
};

function GlobeIcon() {
  return (
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  );
}

function resolvePathname(pathname: string | null, currentLocale: string) {
  const safePathname = pathname ?? `/${currentLocale}`;
  const segments = safePathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const hasLocale = locales.includes(maybeLocale as (typeof locales)[number]);
  return {
    restSegments: hasLocale ? segments.slice(1) : segments,
  };
}

export interface HeaderControlsClientProps {
  locale: string;
  messages: Record<string, unknown>;
}

function LanguageDropdown() {
  const common = useTranslations('common');
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    insetInlineEnd: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const { restSegments } = resolvePathname(pathname, locale);
  const queryString = searchParams?.toString() ?? '';

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const isRtl = document.documentElement.dir === 'rtl';
        setMenuPos({
          top: rect.bottom + 4,
          insetInlineEnd: isRtl ? rect.left : window.innerWidth - rect.right,
        });
      } else if (!next) {
        setMenuPos(null);
      }
      return next;
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setMenuPos(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (!isOpen) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = itemRefs.current.findIndex(
          (el) => el === document.activeElement,
        );
        const nextIndex =
          e.key === 'ArrowDown'
            ? currentIndex < itemRefs.current.length - 1
              ? currentIndex + 1
              : 0
            : currentIndex > 0
              ? currentIndex - 1
              : itemRefs.current.length - 1;
        itemRefs.current[nextIndex]?.focus();
      }
    },
    [isOpen, handleClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen && itemRefs.current[0]) {
      requestAnimationFrame(() => itemRefs.current[0]?.focus());
    }
  }, [isOpen]);

  const menuContent = isOpen && menuPos && typeof document !== 'undefined' && (
    <ul
      ref={menuRef}
      id="language-menu-portal"
      role="menu"
      aria-labelledby="language-trigger-portal"
      onKeyDown={handleKeyDown}
      className="fixed z-[9999] min-w-[10rem] list-none rounded-md border border-border bg-surface py-1 shadow-lg m-0 px-0"
      style={{
        top: menuPos.top,
        insetInlineEnd: menuPos.insetInlineEnd,
        insetInlineStart: 'auto',
      }}
    >
      {locales.map((targetLocale, index) => {
        const restPath = restSegments.length
          ? `/${restSegments.join('/')}`
          : '';
        const href = `/${targetLocale}${restPath}${queryString ? `?${queryString}` : ''}`;
        const isCurrent = targetLocale === locale;
        const label = LANGUAGE_LABELS[targetLocale];

        return (
          <li key={targetLocale} role="none">
            <Link
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              href={href}
              prefetch={false}
              lang={targetLocale}
              role="menuitem"
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={common('a11y.languageSwitcherAction', {
                language: label,
              })}
              className={`${focusRingClass} block w-full px-4 py-2 text-start text-sm ${
                isCurrent
                  ? 'bg-accent/10 font-semibold text-accent'
                  : 'text-text hover:bg-muted/50'
              }`}
              onClick={handleClose}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id="language-trigger-portal"
        type="button"
        onClick={handleToggle}
        onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
        aria-expanded={isOpen}
        aria-controls="language-menu-portal"
        aria-haspopup="menu"
        aria-label={common('a11y.languageSwitcherLabel')}
        className={`${focusRingClass} masthead-touch-target masthead-icon flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm p-1 text-muted transition-colors hover:text-text motion-reduce:transition-none`}
      >
        <GlobeIcon />
        <span className={visuallyHiddenClass}>
          {common('a11y.languageSwitcherLabel')}
        </span>
      </button>
      {menuContent ? createPortal(menuContent, document.body) : null}
    </div>
  );
}

function AccessibilityDropdown() {
  return <AccessibilityPanel />;
}

function HeaderControlsInner() {
  return (
    <>
      <ThemeToggle />
      <LanguageDropdown />
      <AccessibilityDropdown />
    </>
  );
}

export function HeaderControlsClient({
  locale,
  messages,
}: HeaderControlsClientProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <ContrastProvider>
          <ACPProvider>
            <HeaderControlsInner />
          </ACPProvider>
        </ContrastProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
