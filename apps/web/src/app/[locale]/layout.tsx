import '../global.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

/* Locale layout is the single composition point for shell; allowed to import i18n/shell/sections. */
// eslint-disable-next-line no-restricted-imports -- layout composes shell and needs i18n for locale/messages
import { defaultLocale, loadMessages, type AppLocale } from '@joelklemmer/i18n';
import { PRIMARY_NAV_ENTRIES } from '@joelklemmer/sections';
import { ServerShell, MobileNavSlot } from '@joelklemmer/shell';
import {
  getConsentFromCookieV2,
  canLoadAnalyticsV2,
} from '@joelklemmer/compliance';
import { FooterSection } from '@joelklemmer/sections';

import { routing } from '../../i18n/routing';
import { DeferredIslandsScript } from './_deferred/DeferredIslands.server';
import { HeaderDeferredSlot } from './_deferred/HeaderDeferredSlot';
import { ConsentDeferredSlot } from './_deferred/ConsentDeferredSlot';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Deterministic default title and description per locale so document meta is never empty (LHCI meta-description). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const appLocale: AppLocale = routing.locales.includes(locale as never)
    ? (locale as AppLocale)
    : defaultLocale;
  const messages = await loadMessages(appLocale, ['meta']);
  const meta = messages.meta as {
    defaultTitle?: string;
    defaultDescription?: string;
  };
  const defaultTitle = meta?.defaultTitle ?? 'Joel R. Klemmer';
  const defaultDescription =
    meta?.defaultDescription ??
    'Authority verification ecosystem for executive evaluation and institutional review.';
  return {
    title: {
      default: defaultTitle,
      template: `%s | ${defaultTitle}`,
    },
    description: defaultDescription,
  };
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
  const common = await getTranslations('common');
  const nav = await getTranslations('nav');
  const footer = await getTranslations('footer');

  const navItems = PRIMARY_NAV_ENTRIES.map((entry) => ({
    href: entry.path
      ? `/${resolvedLocale}/${entry.path}`
      : `/${resolvedLocale}`,
    label: nav(entry.labelKey),
    ...(entry.rank && { rank: entry.rank }),
  }));
  const initialConsentState = getConsentFromCookieV2(cookieStore.toString());
  const initialAnalyticsConsent = canLoadAnalyticsV2(
    initialConsentState ?? null,
  );

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
    <>
      <ServerShell
        skipLabel={common('a11y.skipToContent')}
        headerLabel={common('a11y.headerLabel')}
        navLabel={common('a11y.navLabel')}
        footerLabel={common('a11y.footerLabel')}
        wordmark={common('wordmark')}
        homeHref={`/${resolvedLocale}`}
        navItems={navItems}
        footerContent={
          <FooterSection label={footer('label')} links={footerItems} />
        }
        languageLinksSlot={null}
        headerDeferredSlot={<HeaderDeferredSlot locale={resolvedLocale} />}
        mobileNavSlot={
          <MobileNavSlot
            navItems={navItems}
            navLabel={common('a11y.navLabel')}
          />
        }
        consentSlot={
          <ConsentDeferredSlot
            showBanner={!initialConsentState?.choiceMade}
            preferencesHref={`/${resolvedLocale}/preferences`}
            locale={resolvedLocale}
          />
        }
      >
        {children}
      </ServerShell>
      <DeferredIslandsScript
        initialAnalyticsConsent={initialAnalyticsConsent}
      />
    </>
  );
}
