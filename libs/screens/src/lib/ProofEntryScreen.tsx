import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { locales, type AppLocale } from '@joelklemmer/i18n';
import { getProofEntry, getProofSlugs, renderMdx } from '@joelklemmer/content';
import { createPageMetadata } from '@joelklemmer/seo';
import { HeroSection, MdxSection } from '@joelklemmer/sections';

export async function generateStaticParams() {
  const slugs = await getProofSlugs();
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export const proofEntryStaticParams = generateStaticParams;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getProofEntry(locale, params.slug);
  if (!entry) {
    notFound();
  }

  return createPageMetadata({
    title: entry.frontmatter.claim,
    description: entry.frontmatter.summary,
    locale,
    pathname: `/proof/${entry.frontmatter.slug}`,
  });
}

export const proofEntryMetadata = generateMetadata;

export async function ProofEntryScreen({ slug }: { slug: string }) {
  const locale = (await getLocale()) as AppLocale;
  const entry = await getProofEntry(locale, slug);
  if (!entry) {
    notFound();
  }

  return (
    <>
      <HeroSection
        title={entry.frontmatter.claim}
        lede={entry.frontmatter.summary}
      />
      <MdxSection>{await renderMdx(entry.content)}</MdxSection>
    </>
  );
}
