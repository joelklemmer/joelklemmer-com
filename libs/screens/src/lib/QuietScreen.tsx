import type { ReactNode } from 'react';
import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { createPageMetadata } from '@joelklemmer/seo';
import { HeroSection, MdxSection } from '@joelklemmer/sections';

export type QuietPageKey =
  | 'press'
  | 'mediaKit'
  | 'bio'
  | 'faq'
  | 'now'
  | 'privacy'
  | 'terms'
  | 'accessibility'
  | 'security';

export interface QuietScreenProps {
  pageKey: QuietPageKey;
  content?: ReactNode;
  notice?: ReactNode;
  supplemental?: ReactNode;
}

export async function createQuietMetadata(pageKey: QuietPageKey) {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t(`${pageKey}.title`),
    description: t(`${pageKey}.description`),
    locale,
    pathname: `/${pageKey}`,
  });
}

export async function QuietScreen({
  pageKey,
  content,
  notice,
  supplemental,
}: QuietScreenProps) {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['quiet']);
  const t = createScopedTranslator(locale, messages, 'quiet');

  return (
    <>
      {notice}
      <HeroSection title={t(`${pageKey}.title`)} lede={t(`${pageKey}.lede`)} />
      {supplemental}
      {content ? <MdxSection>{content}</MdxSection> : null}
    </>
  );
}
