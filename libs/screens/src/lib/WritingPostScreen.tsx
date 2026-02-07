import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { locales, type AppLocale } from '@joelklemmer/i18n';
import {
  getWritingPost,
  getWritingSlugs,
  renderMdx,
} from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import { HeroSection, MdxSection } from '@joelklemmer/sections';

export async function generateStaticParams() {
  const slugs = await getWritingSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export const writingPostStaticParams = generateStaticParams;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getWritingPost(locale, params.slug);
  if (!entry) {
    notFound();
  }

  return createPageMetadata({
    title: entry.frontmatter.title,
    description: entry.frontmatter.summary,
    locale,
    pathname: `/writing/${entry.frontmatter.slug}`,
  });
}

export const writingPostMetadata = generateMetadata;

export async function WritingPostScreen({ slug }: { slug: string }) {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getWritingPost(locale, slug);
  if (!entry) {
    notFound();
  }

  return (
    <>
      <HeroSection
        title={entry.frontmatter.title}
        lede={entry.frontmatter.summary}
      />
      <MdxSection>{await renderMdx(entry.content)}</MdxSection>
    </>
  );
}
