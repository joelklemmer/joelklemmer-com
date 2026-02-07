import '../global.css';

import type { ReactNode } from 'react';

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import { defaultLocale } from '@joelklemmer/i18n';
import { LanguageSwitcher, Shell } from '@joelklemmer/ui';
import {
  FooterSection,
  HeaderSection,
  PrimaryNavSection,
} from '@joelklemmer/sections';

import { routing } from '../../i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
  const common = await getTranslations('common');
  const nav = await getTranslations('nav');
  const footer = await getTranslations('footer');
  const messages = await getMessages();

  const navItems = [
    { href: `/${resolvedLocale}`, label: nav('home') },
    { href: `/${resolvedLocale}/brief`, label: nav('brief') },
    { href: `/${resolvedLocale}/work`, label: nav('work') },
    {
      href: `/${resolvedLocale}/operating-system`,
      label: nav('operatingSystem'),
    },
    { href: `/${resolvedLocale}/writing`, label: nav('writing') },
    { href: `/${resolvedLocale}/contact`, label: nav('contact') },
  ];
  const footerItems = ['press', 'proof', 'bio', 'faq', 'now'].map((slug) => ({
    href: `/${resolvedLocale}/${slug}`,
    label: footer(`links.${slug}`),
  }));

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
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
    </NextIntlClientProvider>
  );
}
