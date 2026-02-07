import type { ReactNode } from 'react';

import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LanguageSwitcher, Shell } from '@ui';
import { FooterSection, PrimaryNavSection } from '@sections';

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
  const t = await getTranslations('shell');
  const nav = await getTranslations('navigation');

  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  setRequestLocale(locale);

  const navItems = [
    { href: `/${locale}`, label: nav('home') },
    { href: `/${locale}/brief`, label: nav('brief') },
    { href: `/${locale}/work`, label: nav('work') },
    { href: `/${locale}/operating-system`, label: nav('operatingSystem') },
    { href: `/${locale}/writing`, label: nav('writing') },
    { href: `/${locale}/contact`, label: nav('contact') },
  ];

  return (
    <Shell
      skipToContentLabel={t('skipToContent')}
      headerLabel={t('headerLabel')}
      navLabel={t('navLabel')}
      footerLabel={t('footerLabel')}
      headerContent={<LanguageSwitcher />}
      navContent={<PrimaryNavSection items={navItems} />}
      footerContent={<FooterSection />}
    >
      {children}
    </Shell>
  );
}
