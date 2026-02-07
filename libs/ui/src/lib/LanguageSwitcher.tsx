'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
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

export function LanguageSwitcher() {
  const common = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { restSegments } = resolvePathname(pathname, locale);
  const queryString = searchParams?.toString();

  return (
    <nav aria-label={common('a11y.languageSwitcherLabel')}>
      <ul className="flex gap-3 text-sm text-muted">
        {locales.map((targetLocale) => {
          const restPath = restSegments.length
            ? `/${restSegments.join('/')}`
            : '';
          const href = `/${targetLocale}${restPath}${queryString ? `?${queryString}` : ''}`;
          const isCurrent = targetLocale === locale;
          const languageLabel = common(`languages.${targetLocale}`);

          return (
            <li key={targetLocale}>
              <Link
                href={href}
                lang={targetLocale}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={common('a11y.languageSwitcherAction', {
                  language: languageLabel,
                })}
                className={`${focusRingClass} ${
                  isCurrent
                    ? 'font-semibold text-text underline'
                    : 'hover:text-text'
                }`}
              >
                {languageLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
