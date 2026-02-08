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
 * Does not change filenames or manifest; applied only in UI.
 */
const DESCRIPTOR_DISPLAY_LABELS: Record<string, string> = {
  'studio-graphite': 'Studio portrait',
  'studio-formal': 'Formal portrait',
  'studio-tight': 'Identity portrait',
  'keynote-podium': 'Keynote address',
  'bookstore-stack': 'Author portrait',
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
          <ul className="space-y-6 list-none p-0 m-0" role="list">
            {filtered.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-col sm:flex-row gap-4 border-b border-border pb-6 last:border-0 [content-visibility:auto] [contain-intrinsic-size:auto_200px]"
              >
                <div className="shrink-0 w-32 h-40 relative rounded overflow-hidden border border-border bg-muted">
                  <Image
                    src={asset.file}
                    alt={asset.alt}
                    width={128}
                    height={160}
                    className="object-cover w-full h-full"
                    sizes="128px"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted font-medium">
                    {getDescriptorDisplayLabel(asset.descriptor)}
                  </p>
                  <p className="text-base text-text mt-0.5">{asset.alt}</p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-text">
                      {tQuiet('media.dimensions')}
                    </dt>
                    <dd className="text-base text-muted">
                      {`${asset.width} × ${asset.height}`}
                    </dd>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-text">
                      {tQuiet('media.recommendedUse')}
                    </dt>
                    <dd className="text-base text-muted">
                      {asset.recommendedUse.join(', ')}
                    </dd>
                  </dl>
                  <details className="mt-2">
                    <summary
                      className={`${focusRingClass} cursor-pointer text-xs text-muted hover:text-text`}
                    >
                      {tQuiet('media.sha256Disclosure')}
                    </summary>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <code className="text-xs break-all font-mono">
                        {asset.sha256}
                      </code>
                      <CopySha256Button
                        sha256={asset.sha256}
                        copyLabel={tQuiet('media.copySha256')}
                      />
                    </div>
                  </details>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                      href={asset.file}
                      className={`${focusRingClass} text-sm underline underline-offset-4 hover:text-accent`}
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
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="text-muted text-sm">{tQuiet('media.noResults')}</p>
          )}
        </Container>
      </section>
    </>
  );
}
