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
  getStoredUnderlineLinks,
  setUnderlineLinks,
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

function SettingsIcon() {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`${focusRingClass} masthead-touch-target masthead-icon flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm p-1 text-muted transition-colors hover:text-text motion-reduce:transition-none`}
        aria-label={common('a11y.languageSwitcherLabel')}
      >
        <GlobeIcon />
        <span className={visuallyHiddenClass}>
          {common('a11y.languageSwitcherLabel')}
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
  }, []);

  if (!mounted) {
    const contrast = getStoredContrast();
    const motion = getStoredMotion();
    const textSize = getStoredTextSize();
    const underlineLinks = getStoredUnderlineLinks();
    applyDocumentAttrs({ contrast, motion, textSize, underlineLinks });
  }

  const contrast = mounted ? getStoredContrast() : 'default';
  const motion = mounted ? getStoredMotion() : 'default';
  const textSize = mounted ? getStoredTextSize() : 'default';
  const underlineLinks = mounted ? getStoredUnderlineLinks() : false;

  const handleContrast = (value: ContrastMode) => {
    setContrast(value);
  };

  const handleMotion = (checked: boolean) => {
    setMotion(checked ? 'reduced' : 'default');
  };

  const handleTextSize = (value: TextSizePreference) => {
    setTextSize(value);
  };

  const handleUnderlineLinks = (checked: boolean) => {
    setUnderlineLinks(checked);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`${focusRingClass} masthead-touch-target masthead-icon flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm p-1 text-muted transition-colors hover:text-text motion-reduce:transition-none`}
        aria-label={common('a11y.accessibilityPanelLabel')}
      >
        <SettingsIcon />
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
        <DropdownMenuLabel>{common('a11y.motionLabel')}</DropdownMenuLabel>
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
        <DropdownMenuLabel>
          {common('a11y.underlineLinksLabel')}
        </DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={underlineLinks}
          onCheckedChange={handleUnderlineLinks}
        >
          {common('a11y.underlineLinksLabel')}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
  timeZone,
}: HeaderControlsClientProps) {
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
