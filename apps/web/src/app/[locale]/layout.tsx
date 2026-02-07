import '../global.css';

import type { ReactNode } from 'react';

import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from 'next-intl/server';

import { defaultLocale } from '@i18n';
import { LanguageSwitcher, Shell } from '@ui';
import { FooterSection, PrimaryNavSection } from '@sections';

import { routing } from '../../i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata() {
  const t = await getTranslations('common');

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
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
  const nav = await getTranslations('nav');
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

  return (
    <NextIntlClientProvider locale={resolvedLocale} messages={messages}>
      <Shell
        headerContent={<LanguageSwitcher />}
        navContent={<PrimaryNavSection items={navItems} />}
        footerContent={<FooterSection />}
      >
        {children}
      </Shell>
    </NextIntlClientProvider>
  );
}
