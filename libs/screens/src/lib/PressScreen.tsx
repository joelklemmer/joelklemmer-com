import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  defaultLocale,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getPressKit, renderMdx } from '@joelklemmer/content';
import { FallbackNoticeSection } from '@joelklemmer/sections';
import { QuietScreen, createQuietMetadata } from './QuietScreen';

export async function generateMetadata() {
  return createQuietMetadata('press');
}

export const pressMetadata = generateMetadata;

export async function PressScreen() {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getPressKit(locale);
  const content = entry ? await renderMdx(entry.content) : null;
  const messages = await loadMessages(locale, ['common']);
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const notice = entry?.isFallback ? (
    <FallbackNoticeSection
      title={tCommon('fallbackNotice.title')}
      body={tCommon('fallbackNotice.body')}
      linkLabel={tCommon('fallbackNotice.linkLabel')}
      href={`/${defaultLocale}/press`}
    />
  ) : null;

  return <QuietScreen pageKey="press" content={content ?? undefined} notice={notice} />;
}
