'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { locales, type AppLocale } from '@joelklemmer/i18n';
import { focusRingClass } from '@joelklemmer/a11y';
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

// Native language names (always displayed in their native form)
const nativeLanguageNames: Record<AppLocale, string> = {
  en: 'English',
  uk: 'Українська',
  es: 'Español',
  he: 'עברית',
};

export function LanguageSwitcherPopover() {
  const common = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const { restSegments } = resolvePathname(pathname, locale);
  const queryString = searchParams?.toString();

  const currentLanguageLabel =
    nativeLanguageNames[locale as AppLocale] ?? nativeLanguageNames.en;

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
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
        return;
      }

      if (!isOpen) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = Array.from(itemRefs.current.values());
        const currentIndex = items.findIndex(
          (el) => el === document.activeElement,
        );
        let nextIndex: number;

        if (e.key === 'ArrowDown') {
          nextIndex =
            currentIndex === -1 || currentIndex === items.length - 1
              ? 0
              : currentIndex + 1;
        } else {
          nextIndex =
            currentIndex === -1 || currentIndex === 0
              ? items.length - 1
              : currentIndex - 1;
        }

        items[nextIndex]?.focus();
      }
    },
    [isOpen, handleClose],
  );

  // Close on outside click
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Focus trap: keep focus within menu when open
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = menuRef.current?.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

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

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Focus first item when opened
  useEffect(() => {
    if (isOpen && menuRef.current) {
      requestAnimationFrame(() => {
        const firstItem = Array.from(itemRefs.current.values())[0];
        firstItem?.focus();
      });
    }
  }, [isOpen]);

  const menuId = 'language-menu';
  const triggerId = 'language-menu-trigger';

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id={triggerId}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={common('a11y.languageSwitcherLabel')}
        aria-haspopup="true"
        className={`${focusRingClass} masthead-touch-target flex items-center justify-center rounded-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
        title={`${common('a11y.languageSwitcherLabel')}: ${currentLanguageLabel}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="sr-only">{currentLanguageLabel}</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          className="absolute end-0 top-full z-50 mt-1 min-w-[10rem] rounded-md border border-border bg-surface shadow-lg"
          onKeyDown={handleKeyDown}
        >
          <div className="py-1" role="none">
            {locales.map((targetLocale) => {
              const restPath = restSegments.length
                ? `/${restSegments.join('/')}`
                : '';
              const href = `/${targetLocale}${restPath}${queryString ? `?${queryString}` : ''}`;
              const isCurrent = targetLocale === locale;
              const languageLabel = nativeLanguageNames[targetLocale];

              return (
                <Link
                  key={targetLocale}
                  ref={(el) => {
                    if (el) {
                      itemRefs.current.set(targetLocale, el);
                    } else {
                      itemRefs.current.delete(targetLocale);
                    }
                  }}
                  href={href}
                  lang={targetLocale}
                  role="menuitem"
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={common('a11y.languageSwitcherAction', {
                    language: languageLabel,
                  })}
                  className={`${focusRingClass} block w-full px-4 py-2 text-sm text-start transition-colors motion-reduce:transition-none ${
                    isCurrent
                      ? 'bg-accent/10 text-accent font-semibold'
                      : 'text-text hover:bg-muted/50'
                  }`}
                  onClick={handleClose}
                >
                  {languageLabel}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
