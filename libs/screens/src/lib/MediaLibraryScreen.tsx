import { Suspense } from 'react';
import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import {
  getMediaManifest,
  getMediaManifestVisible,
  getMediaManifestTierAOnly,
} from '@joelklemmer/content';
import Link from 'next/link';
import { HeroSection } from '@joelklemmer/sections';
import { createPageMetadata, MediaPageJsonLd } from '@joelklemmer/seo';
import { Container } from '@joelklemmer/ui';
import { focusRingClass } from '@joelklemmer/a11y';
import { MediaLibraryClient } from './MediaLibraryClient';

export async function createMediaLibraryMetadata() {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['meta']);
  const t = createScopedTranslator(locale, messages, 'meta');
  return createPageMetadata({
    title: t('media.title'),
    description: t('media.description'),
    locale,
    pathname: '/media',
    ogImageSlug: 'media',
  });
}

export const mediaLibraryMetadata = createMediaLibraryMetadata;

const MEDIA_KINDS = ['portrait', 'speaking', 'author', 'identity'] as const;

export interface MediaLibraryScreenProps {
  kind?: string | null;
  page?: number;
}

const defaultBaseUrl = 'http://localhost:3000';

const DESCRIPTOR_DISPLAY_LABELS: Record<string, string> = {
  'executive-studio': 'Official portrait',
  'formal-board': 'Official portrait',
  'institutional-identity': 'Official portrait',
  'statesman-portrait': 'Official portrait',
  'policy-profile': 'Official portrait',
  'press-headshot': 'Press photo',
  'leadership-profile': 'Official portrait',
  'speaking-address': 'Keynote photo',
  'author-environment': 'Author portrait',
  'keynote-podium': 'Keynote photo',
  'bookstore-stack': 'Author portrait',
  'startup-founder': 'Official portrait',
  'city-vogue': 'Official portrait',
  'luxury-hotel': 'Official portrait',
  'fine-dining': 'Official portrait',
  'outdoor-adventure': 'Official portrait',
  winter: 'Official portrait',
  luxury: 'Official portrait',
  'hot-air-balloon': 'Official portrait',
};

const ITEMS_PER_PAGE = 20;

export async function MediaLibraryScreen(_props: MediaLibraryScreenProps) {
  const devTimerStart =
    typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
      ? Date.now()
      : 0;

  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['quiet', 'meta']);
  const tQuiet = createScopedTranslator(locale, messages, 'quiet');
  const manifest = getMediaManifest();
  const visible = getMediaManifestVisible(manifest);
  const kind = _props.kind ?? null;
  const filtered =
    kind && MEDIA_KINDS.includes(kind as (typeof MEDIA_KINDS)[number])
      ? visible.filter((a) => a.kind === kind)
      : visible;

  const page = Math.max(1, _props.page ?? 1);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, totalPages || 1);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAssets = filtered.slice(startIndex, endIndex);
  const basePath = `/${locale}`;
  const baseUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL) ||
    defaultBaseUrl;
  const siteBase = baseUrl.replace(/\/+$/, '');
  const tierAForStructuredData = getMediaManifestTierAOnly(manifest);
  // Limit JSON-LD to prevent bloat: max 50 ImageObjects per page
  const MAX_JSON_LD_IMAGES = 50;
  const tierAForStructuredDataLimited = tierAForStructuredData.slice(
    0,
    MAX_JSON_LD_IMAGES,
  );

  if (devTimerStart && typeof process !== 'undefined') {
    const elapsed = Date.now() - devTimerStart;
    console.log(
      '[media-library] initial server render',
      elapsed,
      'ms',
      'visible:',
      filtered.length,
    );
  }

  const labels = {
    filterByKind: tQuiet('media.filterByKind'),
    filterAll: tQuiet('media.filterAll'),
    kindPortrait: tQuiet('media.kind.portrait'),
    kindSpeaking: tQuiet('media.kind.speaking'),
    kindAuthor: tQuiet('media.kind.author'),
    kindIdentity: tQuiet('media.kind.identity'),
    dimensions: tQuiet('media.dimensions'),
    recommendedUse: tQuiet('media.recommendedUse'),
    sha256Disclosure: tQuiet('media.sha256Disclosure'),
    copySha256: tQuiet('media.copySha256'),
    viewImage: tQuiet('media.viewImage'),
    copyLink: tQuiet('media.copyLink'),
    noResults: tQuiet('media.noResults'),
    authorityDetails: tQuiet('media.authorityDetails'),
    descriptorLabels: DESCRIPTOR_DISPLAY_LABELS,
  };

  return (
    <>
      <MediaPageJsonLd
        baseUrl={baseUrl}
        locale={locale}
        pathname="/media"
        assets={tierAForStructuredDataLimited.map((a) => ({
          id: a.id,
          file: a.file,
          alt: a.alt,
          descriptor: a.descriptor,
          width: a.width,
          height: a.height,
          caption: a.caption,
          seoKeywords: a.seoKeywords,
        }))}
      />
      <HeroSection title={tQuiet('media.title')} lede={tQuiet('media.lede')} />
      <Suspense
        fallback={
          <section className="section-shell">
            <div className="animate-pulse flex flex-col gap-4 max-w-2xl mx-auto px-4">
              <div className="h-10 bg-muted/50 rounded w-48" />
              <div className="h-24 bg-muted/50 rounded" />
              <div className="h-24 bg-muted/50 rounded" />
            </div>
          </section>
        }
      >
        <MediaLibraryClient
          assets={paginatedAssets}
          initialKind={kind}
          manifestSize={manifest.assets.length}
          basePath={basePath}
          siteBase={siteBase}
          labels={labels}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
        />
      </Suspense>
      <section
        className="section-shell"
        aria-labelledby="media-press-usage-heading"
      >
        <Container className="section-shell">
          <h2
            id="media-press-usage-heading"
            className="calc-section-heading text-text"
          >
            {tQuiet('media.pressUsageTitle')}
          </h2>
          <p className="text-base text-text leading-relaxed mt-0 mb-4">
            {tQuiet('media.pressUsageBody')}
          </p>
          <Link
            href={`${basePath}/terms`}
            className={`${focusRingClass} text-sm font-medium text-accent-strong underline underline-offset-4 hover:opacity-90 rounded focus-visible:ring-2 focus-visible:ring-offset-2`}
          >
            {tQuiet('media.pressUsageTermsLink')}
          </Link>
        </Container>
      </section>
    </>
  );
}
