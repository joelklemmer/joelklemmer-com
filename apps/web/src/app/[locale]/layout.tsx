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
import { PRIMARY_NAV_ENTRIES } from '@joelklemmer/sections';
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
import { TelemetryProvider } from '@joelklemmer/authority-telemetry';
import {
  getConsentFromCookie,
  ConsentProvider,
  canLoadAnalytics,
  CookiePreferencesTrigger,
} from '@joelklemmer/compliance';
import { FooterSection } from '@joelklemmer/sections';

import {
  RouteViewTracker,
  AuthorityTelemetryListener,
} from '../../lib/telemetry';
import { SyncConsentToTelemetry } from '../../lib/SyncConsentToTelemetry';
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

  const navItems = PRIMARY_NAV_ENTRIES.map((entry) => ({
    href: entry.path
      ? `/${resolvedLocale}/${entry.path}`
      : `/${resolvedLocale}`,
    label: nav(entry.labelKey),
    ...(entry.rank && { rank: entry.rank }),
  }));
  const initialConsentState = getConsentFromCookie(cookieStore.toString());
  const initialAnalyticsConsent = canLoadAnalytics(initialConsentState ?? null);

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
    'cookies',
    'preferences',
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
                <ConsentProvider initialConsentState={initialConsentState}>
                  <Shell
                    headerContent={
                      <Header
                        wordmark={common('wordmark')}
                        homeHref={`/${resolvedLocale}`}
                        centerContent={
                          <Suspense
                            fallback={
                              <div
                                className="min-h-[var(--masthead-bar-height)] w-32"
                                aria-hidden
                              />
                            }
                          >
                            <Nav items={navItems} />
                          </Suspense>
                        }
                        headerControls={
                          <>
                            <Suspense
                              fallback={
                                <div
                                  className="masthead-touch-target w-11 min-h-[var(--masthead-bar-height)]"
                                  aria-hidden
                                />
                              }
                            >
                              <LanguageSwitcherPopover />
                            </Suspense>
                            <ThemeToggle />
                            <CookiePreferencesTrigger />
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
                    <TelemetryProvider
                      initialConsent={initialAnalyticsConsent}
                      trackInputMode
                      persistToStorage={false}
                    >
                      <SyncConsentToTelemetry />
                      <RouteViewTracker />
                      <AuthorityTelemetryListener />
                      {children}
                    </TelemetryProvider>
                  </Shell>
                </ConsentProvider>
              </DensityViewProvider>
            </EvaluatorModeProvider>
          </ACPProvider>
        </ContrastProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
