'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { locales } from '@joelklemmer/i18n';
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
      if (e.key === 'Escape' && isOpen) {
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

  // Focus first item when opened
  useEffect(() => {
    if (isOpen && menuRef.current) {
      requestAnimationFrame(() => {
        const firstItem = Array.from(itemRefs.current.values())[0];
        firstItem?.focus();
      });
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls="language-menu"
        aria-label={common('a11y.languageSwitcherLabel')}
        aria-haspopup="true"
        className={`${focusRingClass} flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted hover:text-text`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 8l6 6" />
          <path d="M4 14l6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="M22 22l-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
        <span className="sr-only">{currentLanguageLabel}</span>
        <span aria-hidden="true" className="hidden sm:inline">
          {currentLanguageLabel}
        </span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id="language-menu"
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 min-w-[10rem] rounded-md border border-border bg-surface shadow-lg"
          onKeyDown={handleKeyDown}
        >
          <div className="py-1" role="none">
            {locales.map((targetLocale) => {
              const restPath = restSegments.length
                ? `/${restSegments.join('/')}`
                : '';
              const href = `/${targetLocale}${restPath}${queryString ? `?${queryString}` : ''}`;
              const isCurrent = targetLocale === locale;
              const languageLabel = common(`languages.${targetLocale}`);

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
                  className={`${focusRingClass} block w-full px-4 py-2 text-left text-sm ${
                    isCurrent
                      ? 'bg-neutral-100 font-semibold text-text'
                      : 'text-muted hover:bg-neutral-50 hover:text-text'
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
