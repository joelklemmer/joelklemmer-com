import '../global.css';

import type { ReactNode } from 'react';

import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

/* Locale layout is the single composition point for shell; allowed to import i18n/ui. */
// eslint-disable-next-line no-restricted-imports -- layout composes shell
import { defaultLocale } from '@joelklemmer/i18n';
// eslint-disable-next-line no-restricted-imports -- layout composes shell
import { LanguageSwitcher, Shell } from '@joelklemmer/ui';
import {
  EvaluatorModeProvider,
  resolveEvaluatorMode,
} from '@joelklemmer/evaluator-mode';
import { DensityViewProvider } from '@joelklemmer/authority-density';
import {
  FooterSection,
  HeaderSection,
  PrimaryNavSection,
} from '@joelklemmer/sections';

import { routing } from '../../i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/* eslint-disable max-lines-per-function -- layout composes shell and sections in one place */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  const resolvedLocale = routing.locales.includes(locale as never)
    ? (locale as typeof defaultLocale)
    : defaultLocale;

  setRequestLocale(resolvedLocale);
  const cookieStore = await cookies();
  const initialEvaluatorMode = resolveEvaluatorMode({
    cookies: cookieStore.toString(),
    isDev: process.env.NODE_ENV !== 'production',
  });
  const common = await getTranslations('common');
  const nav = await getTranslations('nav');
  const footer = await getTranslations('footer');
  const messages = await getMessages();

  const navItems = [
    { href: `/${resolvedLocale}`, label: nav('home') },
    { href: `/${resolvedLocale}/brief`, label: nav('brief') },
    { href: `/${resolvedLocale}/work`, label: nav('work') },
    { href: `/${resolvedLocale}/writing`, label: nav('writing') },
    { href: `/${resolvedLocale}/proof`, label: nav('proof') },
    { href: `/${resolvedLocale}/contact`, label: nav('contact') },
  ];
  const footerItems = [
    'media-kit',
    'press',
    'bio',
    'faq',
    'now',
    'privacy',
    'terms',
    'accessibility',
    'security',
  ].map((slug) => ({
    href: `/${resolvedLocale}/${slug}`,
    label: footer(`links.${slug}`),
  }));

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
      <EvaluatorModeProvider initialMode={initialEvaluatorMode}>
        <DensityViewProvider syncWithHash>
          <Shell
            headerContent={
              <HeaderSection
                wordmark={common('wordmark')}
                homeHref={`/${resolvedLocale}`}
                languageSwitcher={<LanguageSwitcher />}
              />
            }
            navContent={<PrimaryNavSection items={navItems} />}
            footerContent={
              <FooterSection label={footer('label')} links={footerItems} />
            }
          >
            {children}
          </Shell>
        </DensityViewProvider>
      </EvaluatorModeProvider>
    </NextIntlClientProvider>
  );
}
