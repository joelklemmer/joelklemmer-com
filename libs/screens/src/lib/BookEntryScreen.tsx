import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { defaultLocale, locales, type AppLocale } from '@joelklemmer/i18n';
import {
  getBookEntry,
  getBookSlugs,
  getPublicRecordId,
  getPublicRecordList,
  renderMdx,
} from '@joelklemmer/content';
import {
  BookJsonLd,
  BreadcrumbJsonLd,
  createPageMetadata,
} from '@joelklemmer/seo';
import { createScopedTranslator, loadMessages } from '@joelklemmer/i18n';
import { focusRingClass } from '@joelklemmer/a11y';
import {
  DefinitionListSection,
  FallbackNoticeSection,
  HeroSection,
  LinkListSection,
  MdxSection,
} from '@joelklemmer/sections';

export async function generateStaticParams() {
  const slugs = await getBookSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export const bookEntryStaticParams = generateStaticParams;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = (await getLocale()) as AppLocale;
  const entry = await getBookEntry(locale, slug);
  if (!entry) {
    notFound();
  }

  return createPageMetadata({
    title: entry.frontmatter.subtitle
      ? `${entry.frontmatter.title}: ${entry.frontmatter.subtitle}`
      : entry.frontmatter.title,
    description: entry.frontmatter.summary,
    locale,
    pathname: `/books/${entry.frontmatter.slug}`,
    canonicalLocale: entry.frontmatter.locale,
    canonicalOverride: entry.frontmatter.canonical,
  });
}

export const bookEntryMetadata = generateMetadata;

export async function BookEntryScreen({ slug }: { slug: string }) {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getBookEntry(locale, slug);
  if (!entry) {
    notFound();
  }
  const messages = await loadMessages(locale, ['books', 'common']);
  const t = createScopedTranslator(locale, messages, 'books');
  const tCommon = createScopedTranslator(locale, messages, 'common');
  const publicRecords = await getPublicRecordList(locale);

  const verifiedRefs = entry.frontmatter.proofRefs
    .map((recordId) => {
      const record = publicRecords.find(
        (r) => getPublicRecordId(r.frontmatter) === recordId,
      );
      if (!record) return null;
      return {
        label: record.frontmatter.title,
        href: `/${locale}/publicrecord/${record.frontmatter.slug}`,
      };
    })
    .filter((r): r is { label: string; href: string } => r != null);

  const showFallbackNotice = entry.frontmatter.locale !== locale;

  const metadataItems = [
    {
      label: t('entry.labels.publicationDate'),
      value: entry.frontmatter.publicationDate,
    },
    ...(entry.frontmatter.publisher
      ? [
          {
            label: t('entry.labels.publisher'),
            value: entry.frontmatter.publisher,
          },
        ]
      : []),
    ...(entry.frontmatter.author
      ? [{ label: t('entry.labels.author'), value: entry.frontmatter.author }]
      : []),
    ...(entry.frontmatter.isbn10
      ? [{ label: t('entry.labels.isbn10'), value: entry.frontmatter.isbn10 }]
      : []),
    ...(entry.frontmatter.isbn13
      ? [{ label: t('entry.labels.isbn13'), value: entry.frontmatter.isbn13 }]
      : []),
    {
      label: t('entry.labels.formats'),
      value: entry.frontmatter.formats.join(', '),
    },
    { label: t('entry.labels.language'), value: entry.frontmatter.language },
  ];

  const bookTitle = entry.frontmatter.subtitle
    ? `${entry.frontmatter.title}: ${entry.frontmatter.subtitle}`
    : entry.frontmatter.title;

  return (
    <>
      <BookJsonLd
        locale={locale}
        pathname={`/books/${entry.frontmatter.slug}`}
        name={bookTitle}
        description={entry.frontmatter.summary}
        author={entry.frontmatter.author}
        publisher={entry.frontmatter.publisher}
        datePublished={entry.frontmatter.publicationDate}
        isbn={entry.frontmatter.isbn13 ?? entry.frontmatter.isbn10}
      />
      <BreadcrumbJsonLd
        locale={locale}
        pathSegments={['books', entry.frontmatter.slug]}
      />
      {showFallbackNotice ? (
        <FallbackNoticeSection
          title={tCommon('fallbackNotice.title')}
          body={tCommon('fallbackNotice.body')}
          linkLabel={tCommon('fallbackNotice.linkLabel')}
          href={`/${defaultLocale}/books/${entry.frontmatter.slug}`}
        />
      ) : null}
      <HeroSection
        title={entry.frontmatter.title}
        lede={entry.frontmatter.subtitle ?? entry.frontmatter.summary}
      />
      <DefinitionListSection
        title={t('entry.sections.metadata')}
        items={metadataItems.map((item) => ({
          label: item.label,
          value: item.value,
        }))}
      />
      <LinkListSection
        title={t('entry.sections.verifiedReferences')}
        items={verifiedRefs}
        emptyMessage={t('entry.verifiedReferencesEmpty')}
      />
      {entry.content.trim() ? (
        <MdxSection>{await renderMdx(entry.content)}</MdxSection>
      ) : null}
    </>
  );
}
