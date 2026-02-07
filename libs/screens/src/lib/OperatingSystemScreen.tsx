import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  defaultLocale,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getOperatingSystem, renderMdx } from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import {
  FallbackNoticeSection,
  HeroSection,
  MdxSection,
} from '@joelklemmer/sections';

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
  const messages = await loadMessages(locale, ['operatingSystem', 'common']);
  const t = createScopedTranslator(locale, messages, 'operatingSystem');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const entry = await getOperatingSystem(locale);

  return (
    <>
      {entry?.isFallback ? (
        <FallbackNoticeSection
          title={tCommon('fallbackNotice.title')}
          body={tCommon('fallbackNotice.body')}
          linkLabel={tCommon('fallbackNotice.linkLabel')}
          href={`/${defaultLocale}/operating-system`}
        />
      ) : null}
      <HeroSection title={t('hero.title')} lede={t('hero.lede')} />
      {entry ? <MdxSection>{await renderMdx(entry.content)}</MdxSection> : null}
    </>
  );
}
