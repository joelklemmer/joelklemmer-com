'use client';

import { useTheme } from './ThemeProvider';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';
import { useTranslations } from 'next-intl';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

const THEME_ORDER: Theme[] = ['system', 'light', 'dark'];

const MENU_ID = 'theme-menu';
const TRIGGER_ID = 'theme-menu-trigger';

function SunIcon({ className }: { className?: string }) {
  return (
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
      aria-hidden
      className={`shrink-0 ${className ?? ''}`}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
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
      aria-hidden
      className={`shrink-0 ${className ?? ''}`}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function SystemIcon({ className }: { className?: string }) {
  return (
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
      aria-hidden
      className={`shrink-0 ${className ?? ''}`}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 12h.01" />
      <path d="M12 12h.01" />
      <path d="M16 12h.01" />
      <path d="M8 8h.01" />
      <path d="M12 8h.01" />
      <path d="M16 8h.01" />
      <path d="M8 16h.01" />
      <path d="M12 16h.01" />
      <path d="M16 16h.01" />
    </svg>
  );
}

function ThemeIcon({
  theme,
  resolvedTheme,
}: {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
}) {
  const className = 'shrink-0';
  if (theme === 'light') return <SunIcon className={className} />;
  if (theme === 'dark') return <MoonIcon className={className} />;
  return resolvedTheme === 'dark' ? (
    <MoonIcon className={className} />
  ) : (
    <SunIcon className={className} />
  );
}

export function ThemeToggle() {
  const common = useTranslations('common');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<Theme, HTMLButtonElement>>(new Map());

  const handleClose = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
        return;
      }

      if (!isOpen) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = THEME_ORDER.map((t) => itemRefs.current.get(t)).filter(
          (el): el is HTMLButtonElement => el != null,
        );
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

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const handleTabKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
        'button[type="button"], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      requestAnimationFrame(() => {
        const first = itemRefs.current.get(THEME_ORDER[0]);
        first?.focus();
      });
    }
  }, [isOpen]);

  const triggerLabel =
    theme === 'system'
      ? `${common('a11y.themeLabel')}: ${common('a11y.themeSystem')} (${common(resolvedTheme === 'dark' ? 'a11y.themeDark' : 'a11y.themeLight')})`
      : `${common('a11y.themeLabel')}: ${theme === 'light' ? common('a11y.themeLight') : common('a11y.themeDark')}`;

  const optionLabel = (t: Theme): string => {
    if (t === 'system') return common('a11y.themeSystem');
    return t === 'light' ? common('a11y.themeLight') : common('a11y.themeDark');
  };

  const renderOption = (t: Theme, icon: ReactNode) => (
    <button
      key={t}
      ref={(el) => {
        if (el) itemRefs.current.set(t, el);
        else itemRefs.current.delete(t);
      }}
      type="button"
      role="menuitemradio"
      aria-checked={theme === t}
      aria-label={optionLabel(t)}
      className={`${focusRingClass} masthead-touch-target flex w-full min-h-[var(--masthead-touch-min)] items-center gap-2 px-4 py-2 text-start text-sm transition-colors motion-reduce:transition-none ${
        theme === t
          ? 'bg-accent/10 text-accent font-semibold'
          : 'text-text hover:bg-muted/50'
      }`}
      onClick={() => {
        setTheme(t);
        handleClose();
      }}
    >
      {icon}
      <span>{optionLabel(t)}</span>
    </button>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        id={TRIGGER_ID}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={MENU_ID}
        aria-haspopup="true"
        aria-label={triggerLabel}
        title={triggerLabel}
        className={`${focusRingClass} masthead-touch-target masthead-icon flex items-center justify-center rounded-sm text-muted hover:text-text transition-colors motion-reduce:transition-none`}
      >
        <ThemeIcon theme={theme} resolvedTheme={resolvedTheme} />
        <span className={visuallyHiddenClass}>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={MENU_ID}
          role="menu"
          aria-labelledby={TRIGGER_ID}
          aria-label={common('a11y.themeLabel')}
          className="absolute end-0 top-full z-50 mt-1 min-w-[10rem] rounded-md border border-border bg-surface shadow-lg"
          onKeyDown={handleKeyDown}
        >
          <div className="py-1" role="none">
            {renderOption('system', <SystemIcon className="shrink-0" />)}
            {renderOption('light', <SunIcon className="shrink-0" />)}
            {renderOption('dark', <MoonIcon className="shrink-0" />)}
          </div>
        </div>
      )}
    </div>
  );
}
