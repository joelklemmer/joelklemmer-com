import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  defaultLocale,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import { getMediaKit, getMediaManifest, renderMdx } from '@joelklemmer/content';
import {
  CardGridSection,
  FallbackNoticeSection,
  ListSection,
} from '@joelklemmer/sections';
import { QuietScreen, createQuietMetadata } from './QuietScreen';

export async function generateMetadata() {
  return createQuietMetadata('mediaKit');
}

export const mediaKitMetadata = generateMetadata;

export async function MediaKitScreen() {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getMediaKit(locale);
  const content = entry ? await renderMdx(entry.content) : null;
  const messages = await loadMessages(locale, ['quiet', 'common']);
  const t = createScopedTranslator(locale, messages, 'quiet');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const notice = entry?.isFallback ? (
    <FallbackNoticeSection
      title={tCommon('fallbackNotice.title')}
      body={tCommon('fallbackNotice.body')}
      linkLabel={tCommon('fallbackNotice.linkLabel')}
      href={`/${defaultLocale}/media-kit`}
    />
  ) : null;

  const manifest = await getMediaManifest();
  const assetsSection = manifest.assets.length ? (
    <CardGridSection
      title={t('mediaKit.assetsTitle')}
      lede={t('mediaKit.assetsLede')}
      items={manifest.assets.map((asset) => ({
        title: asset.title,
        description: asset.usageNotes,
        meta: t('mediaKit.assetMeta', {
          type: asset.type,
          version: asset.version,
          date: asset.date,
        }),
        href: `/media/${asset.filename}`,
      }))}
    />
  ) : (
    <ListSection
      title={t('mediaKit.assetsTitle')}
      items={[t('mediaKit.assetsEmpty')]}
    />
  );

  return (
    <QuietScreen
      pageKey="mediaKit"
      content={content ?? undefined}
      notice={notice}
      supplemental={assetsSection}
    />
  );
}
