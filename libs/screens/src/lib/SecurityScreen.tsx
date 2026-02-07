import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  defaultLocale,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getInstitutionalPage, renderMdx } from '@joelklemmer/content';
import { FallbackNoticeSection } from '@joelklemmer/sections';
import { QuietScreen, createQuietMetadata } from './QuietScreen';

export async function generateMetadata() {
  return createQuietMetadata('security');
}

export const securityMetadata = generateMetadata;

export async function SecurityScreen() {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getInstitutionalPage(locale, 'security');
  const content = entry ? await renderMdx(entry.content) : null;
  const messages = await loadMessages(locale, ['common']);
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const notice = entry?.isFallback ? (
    <FallbackNoticeSection
      title={tCommon('fallbackNotice.title')}
      body={tCommon('fallbackNotice.body')}
      linkLabel={tCommon('fallbackNotice.linkLabel')}
      href={`/${defaultLocale}/security`}
    />
  ) : null;
  return <QuietScreen pageKey="security" content={content} notice={notice} />;
}
