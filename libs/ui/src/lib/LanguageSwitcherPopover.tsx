'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
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

export function LanguageSwitcherPopover() {
  const common = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);

  const { restSegments } = resolvePathname(pathname, locale);
  const queryString = searchParams?.toString();

  const currentLanguageLabel = common(`languages.${locale}`);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      buttonRef.current?.focus();
    });
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
        const menu = menuRef.current;
        if (!menu) return;

        const items = Array.from(
          menu.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]'),
        );
        if (items.length === 0) return;

        const currentIndex = items.findIndex((item) =>
          item === document.activeElement,
        );
        let nextIndex: number;

        if (e.key === 'ArrowDown') {
          nextIndex =
            currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }

        items[nextIndex]?.focus();
      }
    },
    [handleClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    requestAnimationFrame(() => {
      firstItemRef.current?.focus();
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  const menuId = 'language-switcher-menu';
  const buttonId = 'language-switcher-button';

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-haspopup="true"
        aria-label={common('a11y.languageSwitcherLabel')}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={`${focusRingClass} flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
      >
        <svg
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span className={visuallyHiddenClass}>
          {common('a11y.languageSwitcherLabel')}
        </span>
        <span aria-hidden="true">{currentLanguageLabel}</span>
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={buttonId}
          onKeyDown={handleKeyDown}
          className="absolute top-full mt-1 min-w-[10rem] rounded-md border border-border bg-surface shadow-lg z-50 py-1"
          style={{ insetInlineEnd: 0 }}
        >
          {locales.map((targetLocale) => {
            const restPath = restSegments.length
              ? `/${restSegments.join('/')}`
              : '';
            const href = `/${targetLocale}${restPath}${queryString ? `?${queryString}` : ''}`;
            const isCurrent = targetLocale === locale;
            const languageLabel = common(`languages.${targetLocale}`);
            const itemRef = isCurrent ? firstItemRef : undefined;

            return (
              <Link
                key={targetLocale}
                ref={itemRef}
                href={href}
                lang={targetLocale}
                role="menuitem"
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={common('a11y.languageSwitcherAction', {
                  language: languageLabel,
                })}
                className={`${focusRingClass} block px-3 py-2 text-sm transition-colors motion-reduce:transition-none ${
                  isCurrent
                    ? 'font-semibold text-text bg-surface-elevated'
                    : 'text-muted hover:text-text hover:bg-surface-elevated'
                }`}
                onClick={handleClose}
              >
                {languageLabel}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
