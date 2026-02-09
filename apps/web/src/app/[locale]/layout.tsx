import '../global.css';
import { Suspense, type ReactNode } from 'react';
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
import {
  LanguageSwitcherPopover,
  Shell,
  ThemeProvider,
  ThemeToggle,
  ContrastProvider,
  AccessibilityPanel,
  Header,
  Nav,
} from '@joelklemmer/ui';
// eslint-disable-next-line no-restricted-imports -- ACP internals (Agent 2 owns)
import { ACPProvider } from '@joelklemmer/a11y';
import {
  EvaluatorModeProvider,
  resolveEvaluatorMode,
} from '@joelklemmer/evaluator-mode';
import { DensityViewProvider } from '@joelklemmer/authority-density';
import { FooterSection } from '@joelklemmer/sections';

import { routing } from '../../i18n/routing';
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
/* eslint-disable max-lines-per-function,max-lines -- layout composes shell and sections */
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
    'media',
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
      <ThemeProvider>
        <ContrastProvider>
          <ACPProvider>
            <EvaluatorModeProvider initialMode={initialEvaluatorMode}>
              <DensityViewProvider syncWithHash>
                <Shell
                  headerContent={
                    <Header
                      wordmark={common('wordmark')}
                      homeHref={`/${resolvedLocale}`}
                      centerContent={
                        <Suspense fallback={<div className="h-10 w-32" />}>
                          <Nav items={navItems} />
                        </Suspense>
                      }
                      headerControls={
                        <>
                          <Suspense
                            fallback={
                              <div className="masthead-touch-target w-11" />
                            }
                          >
                            <LanguageSwitcherPopover />
                          </Suspense>
                          <ThemeToggle />
                          <AccessibilityPanel />
                        </>
                      }
                    />
                  }
                  navContent={null}
                  footerContent={
                    <FooterSection
                      label={footer('label')}
                      links={footerItems}
                    />
                  }
                >
                  {children}
                </Shell>
              </DensityViewProvider>
            </EvaluatorModeProvider>
          </ACPProvider>
        </ContrastProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
