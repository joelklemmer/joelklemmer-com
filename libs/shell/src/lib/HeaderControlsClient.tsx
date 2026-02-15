'use client';

/**
 * Header controls island: theme toggle, language dropdown, accessibility dropdown.
 * Uses shadcn DropdownMenu for menus (portal-based, no clipping).
 * BehaviorRuntime for all preferences. No cookie preferences in header (footer only).
 */
import { useEffect, useState } from 'react';
import { NextIntlClientProvider, useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getStoredContrast,
  setContrast,
  getStoredMotion,
  setMotion,
  getStoredTextSize,
  setTextSize,
  applyDocumentAttrs,
  type ContrastMode,
  type MotionPreference,
  type TextSizePreference,
} from '@joelklemmer/behavior-runtime';
import { ThemeProvider } from '@joelklemmer/ui';
import { ThemeToggle } from '@joelklemmer/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@joelklemmer/ui';
import { locales, type AppLocale } from '@joelklemmer/i18n';
import { focusRingClass, visuallyHiddenClass } from '@joelklemmer/a11y';

const LANGUAGE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  es: 'Español',
  uk: 'Українська',
  he: 'עברית',
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

function SlidersHorizontalIcon() {
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
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="2" y1="14" x2="6" y2="14" />
      <line x1="10" y1="8" x2="14" y2="8" />
      <line x1="18" y1="16" x2="22" y2="16" />
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
  timeZone?: string;
}

function LanguageDropdown() {
  const common = useTranslations('common');
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { restSegments } = resolvePathname(pathname, locale);
  const queryString = searchParams?.toString() ?? '';

  const currentLabel = LANGUAGE_LABELS[locale];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        type="button"
        className={`${focusRingClass} masthead-touch-target masthead-icon flex min-h-[44px] min-w-[44px] items-center justify-center rounded-none p-1 text-muted transition-colors hover:text-text motion-reduce:transition-none cursor-pointer`}
        aria-label={common('a11y.languageSwitcherLabel')}
      >
        <GlobeIcon />
        <span className={visuallyHiddenClass}>
          {common('a11y.languageSwitcherLabel')} ({currentLabel})
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((targetLocale) => {
          const restPath = restSegments.length
            ? `/${restSegments.join('/')}`
            : '';
          const href = `/${targetLocale}${restPath}${queryString ? `?${queryString}` : ''}`;
          const isCurrent = targetLocale === locale;
          const label = LANGUAGE_LABELS[targetLocale];
          return (
            <DropdownMenuItem key={targetLocale} asChild>
              <Link
                href={href}
                prefetch={false}
                lang={targetLocale}
                aria-label={common('a11y.languageSwitcherAction', {
                  language: label,
                })}
                className={isCurrent ? 'bg-accent/10 font-semibold' : ''}
              >
                {label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccessibilityDropdown() {
  const common = useTranslations('common');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const contrast = getStoredContrast();
    const motion = getStoredMotion();
    const textSize = getStoredTextSize();
    applyDocumentAttrs({ contrast, motion, textSize });
  }, []);

  const contrast = mounted ? getStoredContrast() : 'default';
  const motion = mounted ? getStoredMotion() : 'default';
  const textSize = mounted ? getStoredTextSize() : 'default';

  const handleContrast = (value: ContrastMode) => {
    setContrast(value);
  };

  const handleMotion = (checked: boolean) => {
    setMotion(checked ? 'reduced' : 'default');
  };

  const handleTextSize = (value: TextSizePreference) => {
    setTextSize(value);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        type="button"
        className={`${focusRingClass} masthead-touch-target masthead-icon flex min-h-[44px] min-w-[44px] items-center justify-center rounded-none p-1 text-muted transition-colors hover:text-text motion-reduce:transition-none cursor-pointer`}
        aria-label={common('a11y.accessibilityPanelLabel')}
      >
        <SlidersHorizontalIcon />
        <span className={visuallyHiddenClass}>
          {common('a11y.accessibilityPanelLabel')}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem]">
        <DropdownMenuLabel>{common('a11y.contrastLabel')}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleContrast('default')}>
          {common('a11y.contrastDefault')}
          {contrast === 'default' && ' ✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleContrast('high')}>
          {common('a11y.contrastHigh')}
          {contrast === 'high' && ' ✓'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          {common('a11y.motionSectionLabel')}
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={motion === 'reduced'}
          onCheckedChange={handleMotion}
        >
          {common('a11y.motionLabel')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{common('a11y.textSizeLabel')}</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleTextSize('default')}>
          {common('a11y.textSizeDefault')}
          {textSize === 'default' && ' ✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleTextSize('large')}>
          {common('a11y.textSizeLarge')}
          {textSize === 'large' && ' ✓'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setContrast('default');
            setMotion('default');
            setTextSize('default');
          }}
        >
          {common('a11y.resetToDefaults')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* Figma Make order: Globe (language), Moon (theme), Sliders (accessibility) */
function HeaderControlsInner() {
  return (
    <>
      <LanguageDropdown />
      <ThemeToggle />
      <AccessibilityDropdown />
    </>
  );
}

/* Placeholder to reserve masthead space; avoids CLS when deferred slot mounts. */
function HeaderControlsPlaceholder() {
  return (
    <div
      className="masthead-deferred-slot-placeholder flex flex-nowrap items-center gap-2 min-h-[var(--masthead-bar-height)]"
      aria-hidden
    >
      <span className="w-[44px] h-[44px]" />
      <span className="w-[44px] h-[44px]" />
      <span className="w-[44px] h-[44px]" />
    </div>
  );
}

export function HeaderControlsClient({
  locale,
  messages,
  timeZone,
}: HeaderControlsClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <HeaderControlsPlaceholder />;
  }

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
    >
      <ThemeProvider>
        <HeaderControlsInner />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
