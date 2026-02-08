import Link from 'next/link';
import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import {
  createScopedTranslator,
  loadMessages,
  type AppLocale,
} from '@joelklemmer/i18n';
import {
  getMediaManifest,
  getMediaManifestVisible,
  getMediaManifestSitemapEligible,
  getMediaThumbPath,
  type MediaAsset,
} from '@joelklemmer/content';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';
import { HeroSection } from '@joelklemmer/sections';
import { createPageMetadata, MediaPageJsonLd } from '@joelklemmer/seo';
import { CopyLinkButton } from './CopyLinkButton';
import { CopySha256Button } from './CopySha256Button';

const MEDIA_KINDS = ['portrait', 'speaking', 'author', 'identity'] as const;
type MediaKind = (typeof MEDIA_KINDS)[number];

/**
 * Presentation-only: descriptor → executive display label.
 * Phase II: semantic descriptors only; fallback title-cases unknown.
 */
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

function getDescriptorDisplayLabel(descriptor: string): string {
  return DESCRIPTOR_DISPLAY_LABELS[descriptor] ?? descriptor.replace(/-/g, ' ');
}

function filterByKind(assets: MediaAsset[], kind: string | null): MediaAsset[] {
  if (!kind || !MEDIA_KINDS.includes(kind as MediaKind)) return assets;
  return assets.filter((a) => a.kind === kind);
}

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

export interface MediaLibraryScreenProps {
  kind?: string | null;
}

const defaultBaseUrl = 'http://localhost:3000';

export async function MediaLibraryScreen({ kind }: MediaLibraryScreenProps) {
  const locale = (await getLocale()) as AppLocale;
  const messages = await loadMessages(locale, ['quiet', 'meta']);
  const tQuiet = createScopedTranslator(locale, messages, 'quiet');
  const manifest = getMediaManifest();
  const visible = getMediaManifestVisible(manifest);
  const filtered = filterByKind(visible, kind ?? null);
  const basePath = `/${locale}`;
  const baseUrl =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL) ||
    defaultBaseUrl;
  const siteBase = baseUrl.replace(/\/+$/, '');
  const sitemapEligible = getMediaManifestSitemapEligible(manifest);

  return (
    <>
      <MediaPageJsonLd
        baseUrl={baseUrl}
        locale={locale}
        pathname="/media"
        assets={sitemapEligible.map((a) => ({
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
      <section className="section-shell" aria-labelledby="media-filter-heading">
        <Container className="section-shell">
          <h2 id="media-filter-heading" className="sr-only">
            {tQuiet('media.filterByKind')}
          </h2>
          <nav
            className="flex flex-wrap gap-2 mb-6"
            aria-label={tQuiet('media.filterByKind')}
          >
            <Link
              href={`${basePath}/media`}
              className={`${focusRingClass} rounded border px-3 py-1.5 text-sm ${
                !kind
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:text-text'
              }`}
            >
              {tQuiet('media.filterAll')}
            </Link>
            {MEDIA_KINDS.map((k) => (
              <Link
                key={k}
                href={`${basePath}/media?kind=${k}`}
                className={`${focusRingClass} rounded border px-3 py-1.5 text-sm capitalize ${
                  kind === k
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border text-muted hover:text-text'
                }`}
              >
                {tQuiet(`media.kind.${k}`)}
              </Link>
            ))}
          </nav>
          <ul className="space-y-8 list-none p-0 m-0" role="list">
            {filtered.map((asset, index) => {
              const thumbPath = getMediaThumbPath(asset);
              const isFirstViewport = index < 4;
              return (
                <li
                  key={asset.id}
                  className="flex flex-col sm:flex-row gap-6 sm:gap-8 border-b border-border pb-8 last:border-0 [content-visibility:auto] [contain-intrinsic-size:auto_280px]"
                >
                  <div className="shrink-0 w-full sm:w-52 h-64 sm:h-[272px] relative rounded-lg overflow-hidden border border-border bg-muted/50 shadow-sm ring-1 ring-black/5">
                    <Link
                      href={asset.file}
                      className={`block w-full h-full ${focusRingClass} focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg`}
                      aria-label={asset.alt}
                    >
                      <Image
                        src={thumbPath}
                        alt={asset.alt}
                        width={208}
                        height={272}
                        className="object-cover w-full h-full transition-transform duration-200 hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, 208px"
                        loading={isFirstViewport ? 'eager' : 'lazy'}
                        decoding="async"
                        priority={isFirstViewport}
                      />
                    </Link>
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {getDescriptorDisplayLabel(asset.descriptor)}
                    </p>
                    <p className="text-base text-text leading-relaxed mt-0">
                      {asset.alt}
                    </p>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                      <dt className="text-muted font-medium">
                        {tQuiet('media.dimensions')}
                      </dt>
                      <dd className="text-text">
                        {`${asset.width} × ${asset.height}`}
                      </dd>
                      <dt className="text-muted font-medium">
                        {tQuiet('media.recommendedUse')}
                      </dt>
                      <dd className="text-text">
                        {asset.recommendedUse.join(', ')}
                      </dd>
                    </dl>
                    <details className="mt-1">
                      <summary
                        className={`${focusRingClass} cursor-pointer text-xs text-muted hover:text-text rounded py-1`}
                      >
                        {tQuiet('media.sha256Disclosure')}
                      </summary>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <code className="text-xs break-all font-mono text-muted">
                          {asset.sha256}
                        </code>
                        <CopySha256Button
                          sha256={asset.sha256}
                          copyLabel={tQuiet('media.copySha256')}
                        />
                      </div>
                    </details>
                    <div className="mt-auto pt-2 flex flex-wrap gap-4">
                      <Link
                        href={asset.file}
                        className={`${focusRingClass} text-sm font-medium underline underline-offset-4 text-text hover:text-muted rounded focus-visible:ring-2 focus-visible:ring-offset-2`}
                      >
                        {tQuiet('media.viewImage')}
                      </Link>
                      <CopyLinkButton
                        url={
                          asset.file.startsWith('http')
                            ? asset.file
                            : `${siteBase}${asset.file}`
                        }
                        label={tQuiet('media.copyLink')}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 && (
            <p className="text-muted text-sm">{tQuiet('media.noResults')}</p>
          )}
        </Container>
      </section>
    </>
  );
}
