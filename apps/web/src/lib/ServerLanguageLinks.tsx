/**
 * Server-rendered language links for first paint (no popover JS).
 * Replaced or hidden when deferred LanguageSwitcherPopover mounts.
 */
import Link from 'next/link';
import { locales } from '@joelklemmer/i18n';
import { focusRingClass } from '@joelklemmer/a11y';

export interface ServerLanguageLinksProps {
  currentLocale: string;
  /** Label per locale key, e.g. { en: 'English', uk: 'Ukrainian' } */
  labels: Record<string, string>;
  /** Separator between links (from i18n common.languageSeparator). */
  separator: string;
}

export function ServerLanguageLinks({
  currentLocale,
  labels,
  separator,
}: ServerLanguageLinksProps) {
  return (
    <span className="flex flex-nowrap items-center gap-1 shrink-0">
      {locales.map((locale, index) => {
        const href = `/${locale}`;
        const label = labels[locale] ?? (locale as string);
        const isCurrent = locale === currentLocale;
        return (
          <span key={locale}>
            {index > 0 ? (
              <span className="text-muted mx-0.5" aria-hidden>
                {separator}
              </span>
            ) : null}
            <Link
              href={href}
              prefetch={false}
              lang={locale}
              aria-current={isCurrent ? 'page' : undefined}
              className={`${focusRingClass} rounded-sm px-1 py-0.5 text-sm text-muted hover:text-text ${isCurrent ? 'font-semibold text-text' : ''}`}
            >
              {label}
            </Link>
          </span>
        );
      })}
    </span>
  );
}
