import type React from 'react';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { defaultLocale, locales, type AppLocale } from '@joelklemmer/i18n';
import {
  getWritingPost,
  getWritingSlugs,
  renderMdx,
} from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import { createScopedTranslator, loadMessages } from '@joelklemmer/i18n';
import { focusRingClass } from '@joelklemmer/a11y';
import {
  DefinitionListSection,
  FallbackNoticeSection,
  HeroSection,
  MdxSection,
} from '@joelklemmer/sections';

export async function generateStaticParams() {
  const slugs = await getWritingSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export const writingPostStaticParams = generateStaticParams;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const entry = await getWritingPost(locale, slug);
  if (!entry) {
    notFound();
  }

  return createPageMetadata({
    title: entry.frontmatter.title,
    description: entry.frontmatter.summary,
    locale,
    pathname: `/writing/${entry.frontmatter.slug}`,
    canonicalLocale: entry.frontmatter.locale,
  });
}

export const writingPostMetadata = generateMetadata;

export async function WritingPostScreen({ slug }: { slug: string }) {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getWritingPost(locale, slug);
  if (!entry) {
    notFound();
  }
  const messages = await loadMessages(locale, ['writing', 'common']);
  const t = createScopedTranslator(locale, messages, 'writing');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const showFallbackNotice = entry.frontmatter.locale !== locale;
  const metadataItems = [
    entry.frontmatter.publicationContext
      ? {
          label: t('metadata.labels.context'),
          value: entry.frontmatter.publicationContext,
        }
      : null,
    entry.frontmatter.isbn
      ? { label: t('metadata.labels.isbn'), value: entry.frontmatter.isbn }
      : null,
    entry.frontmatter.publisher
      ? {
          label: t('metadata.labels.publisher'),
          value: entry.frontmatter.publisher,
        }
      : null,
    entry.frontmatter.distribution?.length
      ? {
          label: t('metadata.labels.distribution'),
          value: (
            <ul className="grid gap-1">
              {entry.frontmatter.distribution.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    className={`${focusRingClass} rounded-sm underline underline-offset-4`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ),
        }
      : null,
    entry.frontmatter.excerpt
      ? {
          label: t('metadata.labels.excerpt'),
          value: entry.frontmatter.excerpt,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string | React.ReactNode;
  }>;

  return (
    <>
      {showFallbackNotice ? (
        <FallbackNoticeSection
          title={tCommon('fallbackNotice.title')}
          body={tCommon('fallbackNotice.body')}
          linkLabel={tCommon('fallbackNotice.linkLabel')}
          href={`/${defaultLocale}/writing/${entry.frontmatter.slug}`}
        />
      ) : null}
      <HeroSection
        title={entry.frontmatter.title}
        lede={entry.frontmatter.summary}
      />
      {metadataItems.length ? (
        <DefinitionListSection
          title={t('metadata.title')}
          items={metadataItems}
        />
      ) : null}
      <MdxSection>{await renderMdx(entry.content)}</MdxSection>
    </>
  );
}
