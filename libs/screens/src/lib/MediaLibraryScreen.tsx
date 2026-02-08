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
}

const defaultBaseUrl = 'http://localhost:3000';

const DESCRIPTOR_DISPLAY_LABELS: Record<string, string> = {
  'executive-studio': 'Executive studio',
  'formal-board': 'Formal board',
  'institutional-identity': 'Institutional identity',
  'statesman-portrait': 'Statesman portrait',
  'policy-profile': 'Policy profile',
  'press-headshot': 'Press headshot',
  'leadership-profile': 'Leadership profile',
  'speaking-address': 'Speaking address',
  'author-environment': 'Author environment',
  'keynote-podium': 'Keynote address',
  'bookstore-stack': 'Author portrait',
  'startup-founder': 'Startup founder',
  'city-vogue': 'City',
  'luxury-hotel': 'Luxury hotel',
  'fine-dining': 'Fine dining',
  'outdoor-adventure': 'Outdoor',
  winter: 'Winter',
  luxury: 'Luxury',
  'hot-air-balloon': 'Hot air balloon',
};

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
  const basePath = `/${locale}`;
  const baseUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL) ||
    defaultBaseUrl;
  const siteBase = baseUrl.replace(/\/+$/, '');
  const tierAForStructuredData = getMediaManifestTierAOnly(manifest);

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
        assets={tierAForStructuredData.map((a) => ({
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
          assets={filtered}
          initialKind={kind}
          manifestSize={manifest.assets.length}
          basePath={basePath}
          siteBase={siteBase}
          labels={labels}
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
            className={`${focusRingClass} text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-strong rounded focus-visible:ring-2 focus-visible:ring-offset-2`}
          >
            {tQuiet('media.pressUsageTermsLink')}
          </Link>
        </Container>
      </section>
    </>
  );
}
