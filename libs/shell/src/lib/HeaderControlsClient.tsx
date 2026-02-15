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
  readAccessibilityPrefs,
  setAccessibilityPref,
  resetAccessibilityPrefs,
  type AccessibilityPrefs,
  type ContrastMode,
} from '@joelklemmer/behavior-runtime';
import { ThemeProvider } from '@joelklemmer/ui';
import { ThemeToggle } from '@joelklemmer/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@joelklemmer/ui';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
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

function CheckIcon() {
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
      className="size-4 shrink-0"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function RadioDotIcon() {
  return (
    <span className="size-2 shrink-0 rounded-full bg-current" aria-hidden />
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

/** Map textScale to radio value for UI */
function textScaleToRadioValue(scale: AccessibilityPrefs['textScale']): string {
  return scale === '1.12' ? 'medium' : scale === '1.25' ? 'large' : 'default';
}

function radioValueToTextScale(value: string): AccessibilityPrefs['textScale'] {
  return value === 'large' ? '1.25' : value === 'medium' ? '1.12' : '1';
}

function AccessibilityDropdown() {
  const common = useTranslations('common');
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(() =>
    readAccessibilityPrefs(),
  );

  useEffect(() => {
    setMounted(true);
    setPrefs(readAccessibilityPrefs());
  }, []);

  const contrast = mounted ? prefs.contrast : 'default';
  const textSize = mounted ? textScaleToRadioValue(prefs.textScale) : 'default';
  const lineHeight = mounted ? prefs.lineHeight === 'comfortable' : false;
  const letterSpacing = mounted ? prefs.letterSpacing === 'increased' : false;
  const dyslexiaFont = mounted ? prefs.dyslexiaFont : false;

  const handleContrast = (value: string) => {
    const v = value as ContrastMode;
    if (v === 'default' || v === 'high') {
      const next = setAccessibilityPref({ contrast: v });
      setPrefs(next);
    }
  };

  const handleTextSize = (value: string) => {
    const next = setAccessibilityPref({
      textScale: radioValueToTextScale(value),
    });
    setPrefs(next);
  };

  const handleLineHeight = (checked: boolean) => {
    const next = setAccessibilityPref({
      lineHeight: checked ? 'comfortable' : 'default',
    });
    setPrefs(next);
  };

  const handleLetterSpacing = (checked: boolean) => {
    const next = setAccessibilityPref({
      letterSpacing: checked ? 'increased' : 'default',
    });
    setPrefs(next);
  };

  const handleDyslexiaFont = (checked: boolean) => {
    const next = setAccessibilityPref({ dyslexiaFont: checked });
    setPrefs(next);
  };

  const handleReset = () => {
    resetAccessibilityPrefs();
    setPrefs(readAccessibilityPrefs());
  };

  const onSelectPreventClose = (e: Event) => e.preventDefault();

  const ROW_CLASS =
    'flex items-center justify-between gap-3 rounded-md px-2 py-2 text-text hover:bg-muted/20 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface cursor-default select-none text-sm ps-2';
  const LABEL_CLASS = 'flex-1 min-w-0 text-start';
  const INDICATOR_AREA_CLASS = 'flex shrink-0 w-6 items-center justify-end';
  const SECTION_LABEL_CLASS = 'text-xs text-muted px-2 py-1';

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        type="button"
        aria-haspopup="menu"
        className={`${focusRingClass} masthead-touch-target masthead-icon flex min-h-[44px] min-w-[44px] items-center justify-center rounded-none p-1 text-muted transition-colors hover:text-text motion-reduce:transition-none cursor-pointer`}
        aria-label={common('a11y.accessibilityPanelLabel')}
      >
        <SlidersHorizontalIcon />
        <span className={visuallyHiddenClass}>
          {common('a11y.accessibilityPanelLabel')}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[22rem] max-h-[min(70vh,560px)] overflow-y-auto rounded-2xl border border-border bg-surface p-3 shadow-sm [scrollbar-gutter:stable]"
      >
        {/* Contrast */}
        <section aria-labelledby="a11y-contrast-heading" className="space-y-1">
          <DropdownMenuLabel
            id="a11y-contrast-heading"
            className={SECTION_LABEL_CLASS}
          >
            {common('a11y.contrastLabel')}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={contrast}
            onValueChange={handleContrast}
          >
            <DropdownMenuRadioItem
              value="default"
              onSelect={onSelectPreventClose}
              className={ROW_CLASS}
            >
              <span className={LABEL_CLASS}>
                {common('a11y.contrastDefault')}
              </span>
              <span className={INDICATOR_AREA_CLASS}>
                <DropdownMenuPrimitive.ItemIndicator>
                  <RadioDotIcon />
                </DropdownMenuPrimitive.ItemIndicator>
              </span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="high"
              onSelect={onSelectPreventClose}
              className={ROW_CLASS}
            >
              <span className={LABEL_CLASS}>{common('a11y.contrastHigh')}</span>
              <span className={INDICATOR_AREA_CLASS}>
                <DropdownMenuPrimitive.ItemIndicator>
                  <RadioDotIcon />
                </DropdownMenuPrimitive.ItemIndicator>
              </span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </section>

        <DropdownMenuSeparator className="my-2 border-border" />

        {/* Motion */}
        <section aria-labelledby="a11y-motion-heading" className="space-y-1">
          <DropdownMenuLabel
            id="a11y-motion-heading"
            className={SECTION_LABEL_CLASS}
          >
            {common('a11y.motionSectionLabel')}
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={prefs.motion === 'reduced'}
            onCheckedChange={(checked) => {
              const isOn = checked === true;
              const next = setAccessibilityPref({
                motion: isOn ? 'reduced' : 'full',
              });
              setPrefs(next);
            }}
            onSelect={onSelectPreventClose}
            className={ROW_CLASS}
          >
            <span className={LABEL_CLASS}>{common('a11y.motionLabel')}</span>
            <span className={INDICATOR_AREA_CLASS}>
              <DropdownMenuPrimitive.ItemIndicator>
                <CheckIcon />
              </DropdownMenuPrimitive.ItemIndicator>
            </span>
          </DropdownMenuCheckboxItem>
        </section>

        <DropdownMenuSeparator className="my-2 border-border" />

        {/* Type */}
        <section aria-labelledby="a11y-type-heading" className="space-y-2">
          <DropdownMenuLabel
            id="a11y-type-heading"
            className={SECTION_LABEL_CLASS}
          >
            {common('a11y.typeSectionLabel')}
          </DropdownMenuLabel>
          <DropdownMenuLabel className={SECTION_LABEL_CLASS}>
            {common('a11y.textSizeLabel')}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={textSize}
            onValueChange={handleTextSize}
          >
            <DropdownMenuRadioItem
              value="default"
              onSelect={onSelectPreventClose}
              className={ROW_CLASS}
            >
              <span className={LABEL_CLASS}>
                {common('a11y.textSizeDefault')}
              </span>
              <span className={INDICATOR_AREA_CLASS}>
                <DropdownMenuPrimitive.ItemIndicator>
                  <RadioDotIcon />
                </DropdownMenuPrimitive.ItemIndicator>
              </span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="medium"
              onSelect={onSelectPreventClose}
              className={ROW_CLASS}
            >
              <span className={LABEL_CLASS}>
                {common('a11y.textSizeMedium')}
              </span>
              <span className={INDICATOR_AREA_CLASS}>
                <DropdownMenuPrimitive.ItemIndicator>
                  <RadioDotIcon />
                </DropdownMenuPrimitive.ItemIndicator>
              </span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value="large"
              onSelect={onSelectPreventClose}
              className={ROW_CLASS}
            >
              <span className={LABEL_CLASS}>
                {common('a11y.textSizeLarge')}
              </span>
              <span className={INDICATOR_AREA_CLASS}>
                <DropdownMenuPrimitive.ItemIndicator>
                  <RadioDotIcon />
                </DropdownMenuPrimitive.ItemIndicator>
              </span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuLabel className={SECTION_LABEL_CLASS}>
            {common('a11y.readingAdjustmentsLabel')}
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={lineHeight}
            onCheckedChange={(c) => handleLineHeight(c === true)}
            onSelect={onSelectPreventClose}
            className={ROW_CLASS}
          >
            <span className={LABEL_CLASS}>
              {common('a11y.lineHeightComfortable')}
            </span>
            <span className={INDICATOR_AREA_CLASS}>
              <DropdownMenuPrimitive.ItemIndicator>
                <CheckIcon />
              </DropdownMenuPrimitive.ItemIndicator>
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={letterSpacing}
            onCheckedChange={(c) => handleLetterSpacing(c === true)}
            onSelect={onSelectPreventClose}
            className={ROW_CLASS}
          >
            <span className={LABEL_CLASS}>
              {common('a11y.letterSpacingIncreased')}
            </span>
            <span className={INDICATOR_AREA_CLASS}>
              <DropdownMenuPrimitive.ItemIndicator>
                <CheckIcon />
              </DropdownMenuPrimitive.ItemIndicator>
            </span>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={dyslexiaFont}
            onCheckedChange={(c) => handleDyslexiaFont(c === true)}
            onSelect={onSelectPreventClose}
            className={ROW_CLASS}
          >
            <span className={LABEL_CLASS}>
              {common('a11y.dyslexiaFontLabel')}
            </span>
            <span className={INDICATOR_AREA_CLASS}>
              <DropdownMenuPrimitive.ItemIndicator>
                <CheckIcon />
              </DropdownMenuPrimitive.ItemIndicator>
            </span>
          </DropdownMenuCheckboxItem>
        </section>

        <DropdownMenuSeparator className="my-2 border-border" />

        {/* Reset */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleReset();
          }}
          className={`${ROW_CLASS} text-muted hover:text-text`}
          aria-label={common('a11y.resetToDefaults')}
        >
          <span className={LABEL_CLASS}>{common('a11y.resetToDefaults')}</span>
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
