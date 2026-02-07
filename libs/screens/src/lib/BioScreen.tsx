import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  defaultLocale,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import {
  getArtifactsManifest,
  getInstitutionalPage,
  renderMdx,
} from '@joelklemmer/content';
import {
  DefinitionListSection,
  FallbackNoticeSection,
} from '@joelklemmer/sections';
import { QuietScreen, createQuietMetadata } from './QuietScreen';
import { focusRingClass } from '@joelklemmer/a11y';

export async function generateMetadata() {
  return createQuietMetadata('bio');
}

export const bioMetadata = generateMetadata;

export async function BioScreen() {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getInstitutionalPage(locale, 'bio');
  const content = entry ? await renderMdx(entry.content) : null;
  const messages = await loadMessages(locale, ['common', 'quiet']);
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const tQuiet = createScopedTranslator(locale, messages, 'quiet');
  const artifacts = await getArtifactsManifest();
  const bioArtifact = artifacts.items.find(
    (item) => item.id === 'executive-bio',
  );
  const notice = entry?.isFallback ? (
    <FallbackNoticeSection
      title={tCommon('fallbackNotice.title')}
      body={tCommon('fallbackNotice.body')}
      linkLabel={tCommon('fallbackNotice.linkLabel')}
      href={`/${defaultLocale}/bio`}
    />
  ) : null;

  const artifactItems = bioArtifact
    ? [
        {
          label: tQuiet('bio.artifactLabel'),
          value: (
            <a
              href={`/artifacts/${bioArtifact.filename}`}
              className={`${focusRingClass} rounded-sm underline underline-offset-4`}
            >
              {tQuiet('bio.artifactLink')}
            </a>
          ),
        },
      ]
    : [];

  return (
    <QuietScreen
      pageKey="bio"
      notice={notice}
      supplemental={
        artifactItems.length ? (
          <DefinitionListSection
            title={tQuiet('bio.artifactsTitle')}
            items={artifactItems}
          />
        ) : null
      }
      content={content ?? undefined}
    />
  );
}
