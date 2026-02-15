'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { locales } from '@joelklemmer/i18n';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import Link from 'next/link';

function resolvePathname(pathname: string | null, currentLocale: string) {
  const safePathname = pathname ?? `/${currentLocale}`;
  const segments = safePathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const hasLocale = locales.includes(maybeLocale as (typeof locales)[number]);

  return {
    restSegments: hasLocale ? segments.slice(1) : segments,
  };
}

export function LanguageMenu() {
  const common = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { restSegments } = resolvePathname(pathname, locale);
  const queryString = searchParams?.toString();

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const menuId = 'language-menu';
  const triggerId = 'language-menu-trigger';

  const currentLanguageLabel = common(`languages.${locale}`);

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
              : locales.length;
        const nextIndex =
          e.key === 'ArrowDown'
            ? (currentIndex + 1) % locales.length
            : (currentIndex - 1 + locales.length) % locales.length;
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.focus();
      }
    },
    [focusedIndex, handleClose],
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

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="true"
        aria-label={common('a11y.languageSwitcherLabel')}
        onClick={handleToggle}
        className={`${focusRingClass} flex items-center justify-center w-8 h-8 rounded-none text-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
        title={`${common('a11y.languageSwitcherLabel')}: ${currentLanguageLabel}`}
      >
        <span aria-hidden="true">🌐</span>
        <span className="sr-only">{currentLanguageLabel}</span>
      </button>

      {isOpen && (
        <ul
          ref={menuRef}
          id={menuId}
          aria-labelledby={triggerId}
          onKeyDown={handleKeyDown}
          className="absolute end-0 top-full mt-1 min-w-[10rem] rounded-none border border-border bg-surface shadow-lg z-50 list-none py-1 m-0 px-0"
        >
          {locales.map((targetLocale, index) => {
            const restPath = restSegments.length
              ? `/${restSegments.join('/')}`
              : '';
            const href = `/${targetLocale}${restPath}${queryString ? `?${queryString}` : ''}`;
            const isCurrent = targetLocale === locale;
            const languageLabel = common(`languages.${targetLocale}`);

            return (
              <li key={targetLocale}>
                <Link
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  href={href}
                  prefetch={false}
                  lang={targetLocale}
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={common('a11y.languageSwitcherAction', {
                    language: languageLabel,
                  })}
                  className={`${focusRingClass} block w-full px-4 py-2 text-sm text-left transition-colors motion-reduce:transition-none ${
                    isCurrent
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-text hover:bg-muted/50'
                  }`}
                  onClick={handleClose}
                >
                  {languageLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
