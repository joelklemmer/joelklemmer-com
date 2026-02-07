import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  defaultLocale,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getInstitutionalPage, renderMdx } from '@joelklemmer/content';
import { FallbackNoticeSection } from '@joelklemmer/sections';
import { createQuietMetadata } from './QuietScreen';
import { InstitutionalScreen } from './InstitutionalScreen';

export async function generateMetadata() {
  return createQuietMetadata('privacy');
}

export const privacyMetadata = generateMetadata;

export async function PrivacyScreen() {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getInstitutionalPage(locale, 'privacy');
  const content = entry ? await renderMdx(entry.content) : null;
  const messages = await loadMessages(locale, ['common']);
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const notice = entry?.isFallback ? (
    <FallbackNoticeSection
      title={tCommon('fallbackNotice.title')}
      body={tCommon('fallbackNotice.body')}
      linkLabel={tCommon('fallbackNotice.linkLabel')}
      href={`/${defaultLocale}/privacy`}
    />
  ) : null;
  if (!entry) return null;
  return (
    <InstitutionalScreen
      pageKey="privacy"
      frontmatter={entry.frontmatter}
      content={content}
      notice={notice}
    />
  );
}
