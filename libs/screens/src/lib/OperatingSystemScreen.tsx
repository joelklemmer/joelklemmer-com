import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getOperatingSystem, renderMdx } from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import { HeroSection, MdxSection } from '@joelklemmer/sections';

export async function generateMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('operatingSystem.title'),
    description: t('operatingSystem.description'),
    locale,
    pathname: '/operating-system',
  });
}

export const operatingSystemMetadata = generateMetadata;

export async function OperatingSystemScreen() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['operatingSystem']);
  const t = createScopedTranslator(locale, messages, 'operatingSystem');
  const entry = await getOperatingSystem(locale);

  return (
    <>
      <HeroSection title={t('hero.title')} lede={t('hero.lede')} />
      {entry ? <MdxSection>{await renderMdx(entry.content)}</MdxSection> : null}
    </>
  );
}
