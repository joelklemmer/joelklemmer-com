'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import type { MediaAsset } from '@joelklemmer/content';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';
import { CopyLinkButton } from './CopyLinkButton';
import { CopySha256Button } from './CopySha256Button';

const MEDIA_KINDS = ['portrait', 'speaking', 'author', 'identity'] as const;
type MediaKind = (typeof MEDIA_KINDS)[number];

function getDescriptorDisplayLabel(
  asset: MediaAsset,
  labels: Record<string, string>,
): string {
  if (asset.descriptorDisplayLabel) return asset.descriptorDisplayLabel;
  return labels[asset.descriptor] ?? asset.descriptor.replace(/-/g, ' ');
}

/** UI-only labels for recommendedUse values (internal schema → restrained display). */
const RECOMMENDED_USE_DISPLAY: Record<string, string> = {
  hero: 'Hero',
  avatar: 'Avatar',
  card: 'Card',
  press: 'Press',
  books: 'Books',
};

function getRecommendedUseDisplay(uses: string[]): string {
  return uses
    .map((u) => RECOMMENDED_USE_DISPLAY[u] ?? u)
    .filter(Boolean)
    .join(', ');
}

/** List thumbnails use thumb derivative only (convention: base.webp → base__thumb.webp); no master fallback. */
function getMediaThumbPath(asset: MediaAsset): string {
  return asset.file.replace(/\.webp$/, '__thumb.webp');
}

const THUMB_SIZE_PX = 48;

export interface MediaLibraryClientLabels {
  filterByKind: string;
  filterAll: string;
  kindPortrait: string;
  kindSpeaking: string;
  kindAuthor: string;
  kindIdentity: string;
  dimensions: string;
  recommendedUse: string;
  sha256Disclosure: string;
  copySha256: string;
  viewImage: string;
  copyLink: string;
  noResults: string;
  authorityDetails: string;
  descriptorLabels: Record<string, string>;
}

export interface MediaLibraryClientProps {
  assets: MediaAsset[];
  initialKind?: string | null;
  manifestSize?: number;
  basePath: string;
  siteBase: string;
  labels: MediaLibraryClientLabels;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
}

export function MediaLibraryClient({
  assets,
  initialKind = null,
  manifestSize = 0,
  basePath,
  siteBase,
  labels,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
}: MediaLibraryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kind = searchParams.get('kind') ?? initialKind;
  const pageParam = searchParams.get('page');
  const currentPageFromUrl = pageParam ? parseInt(pageParam, 10) : currentPage;
  const [missingThumb, setMissingThumb] = useState<Set<string>>(new Set());
  const renderStartRef = useRef<number>(
    typeof performance !== 'undefined' ? performance.now() : 0,
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    const ttfRender =
      (performance?.now?.() ?? Date.now()) - renderStartRef.current;
    console.log(
      '[media-library]',
      'manifestSize:',
      manifestSize,
      'renderedCount:',
      assets.length,
      'timeToFirstRender:',
      `${ttfRender.toFixed(1)}ms`,
    );
  }, [manifestSize, assets.length]);

  const setKind = useCallback(
    (newKind: string | null) => {
      const path = `${basePath}/media${newKind ? `?kind=${encodeURIComponent(newKind)}` : ''}`;
      router.replace(path, { scroll: false });
    },
    [basePath, router],
  );

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams();
      if (kind) params.set('kind', kind);
      if (newPage > 1) params.set('page', newPage.toString());
      const queryString = params.toString();
      const path = `${basePath}/media${queryString ? `?${queryString}` : ''}`;
      router.replace(path, { scroll: false });
    },
    [basePath, router, kind],
  );

  const handleThumbError = useCallback((assetId: string) => {
    setMissingThumb((prev) => new Set(prev).add(assetId));
  }, []);

  return (
    <section className="section-shell" aria-labelledby="media-filter-heading">
      <Container className="section-shell">
        <h2 id="media-filter-heading" className="sr-only">
          {labels.filterByKind}
        </h2>
        <nav
          className="flex flex-wrap gap-2 mb-6"
          aria-label={labels.filterByKind}
          role="navigation"
        >
          <button
            type="button"
            onClick={() => setKind(null)}
            className={`${focusRingClass} rounded border px-3 py-1.5 text-sm ${
              !kind
                ? 'border-accent bg-accent/10 text-accent-strong'
                : 'border-border text-muted hover:text-text'
            }`}
            aria-pressed={!kind}
            aria-label={labels.filterAll}
          >
            {labels.filterAll}
          </button>
          {MEDIA_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`${focusRingClass} rounded border px-3 py-1.5 text-sm capitalize ${
                kind === k
                  ? 'border-accent bg-accent/10 text-accent-strong'
                  : 'border-border text-muted hover:text-text'
              }`}
              aria-pressed={kind === k}
              aria-label={
                k === 'portrait'
                  ? labels.kindPortrait
                  : k === 'speaking'
                    ? labels.kindSpeaking
                    : k === 'author'
                      ? labels.kindAuthor
                      : labels.kindIdentity
              }
            >
              {k === 'portrait'
                ? labels.kindPortrait
                : k === 'speaking'
                  ? labels.kindSpeaking
                  : k === 'author'
                    ? labels.kindAuthor
                    : labels.kindIdentity}
            </button>
          ))}
        </nav>
        <ul className="space-y-8 list-none p-0 m-0" role="list">
          {assets.map((asset, index) => {
            const thumbPath = getMediaThumbPath(asset);
            const showPlaceholder = missingThumb.has(asset.id);
            const isFirstViewport = index < 4;
            return (
              <li
                key={asset.id}
                id={asset.id}
                className="media-list-item flex flex-col sm:flex-row gap-6 sm:gap-8 border-b border-border pb-8 last:border-0"
              >
                <div className="media-thumb-rail shrink-0">
                  <div className="media-thumb-frame rounded-lg overflow-hidden border border-border bg-muted/50 shadow-sm ring-1 ring-black/5">
                    {showPlaceholder ? (
                      <div
                        className="media-thumb-placeholder"
                        aria-hidden
                        title=""
                      />
                    ) : (
                      <Link
                        href={asset.file}
                        className={`block w-full h-full ${focusRingClass} focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg`}
                        aria-label={asset.alt}
                      >
                        <Image
                          src={thumbPath}
                          alt={asset.alt}
                          width={THUMB_SIZE_PX}
                          height={THUMB_SIZE_PX}
                          className="media-thumb-img object-cover w-full h-full transition-transform duration-200 hover:scale-[1.02] motion-reduce:transition-none"
                          sizes="(min-width: 768px) 64px, (min-width: 640px) 56px, 48px"
                          loading={isFirstViewport ? 'eager' : 'lazy'}
                          decoding="async"
                          priority={isFirstViewport}
                          onError={() => handleThumbError(asset.id)}
                        />
                      </Link>
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {getDescriptorDisplayLabel(asset, labels.descriptorLabels)}
                  </p>
                  <p className="text-base text-text leading-relaxed mt-0">
                    {asset.alt}
                  </p>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                    <dt className="text-muted font-medium">
                      {labels.dimensions}
                    </dt>
                    <dd className="text-text">
                      {`${asset.width} × ${asset.height}`}
                    </dd>
                  </dl>
                  <details className="mt-1 media-authority-details">
                    <summary
                      className={`${focusRingClass} cursor-pointer text-xs text-muted hover:text-text rounded py-1`}
                    >
                      {labels.authorityDetails}
                    </summary>
                    <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted">
                      {asset.authorityTier && (
                        <>
                          <span>Tier</span>
                          <span>{asset.authorityTier}</span>
                        </>
                      )}
                      {asset.personaSignal && (
                        <>
                          <span>Persona</span>
                          <span>{asset.personaSignal}</span>
                        </>
                      )}
                      {asset.environmentSignal && (
                        <>
                          <span>Environment</span>
                          <span>{asset.environmentSignal}</span>
                        </>
                      )}
                      {asset.formalityLevel && (
                        <>
                          <span>Formality</span>
                          <span>{asset.formalityLevel}</span>
                        </>
                      )}
                      {asset.visualTone && (
                        <>
                          <span>Visual tone</span>
                          <span>{asset.visualTone}</span>
                        </>
                      )}
                      {asset.recommendedUse &&
                        asset.recommendedUse.length > 0 && (
                          <>
                            <span>{labels.recommendedUse}</span>
                            <span>
                              {getRecommendedUseDisplay(asset.recommendedUse)}
                            </span>
                          </>
                        )}
                    </div>
                  </details>
                  <details className="mt-1">
                    <summary
                      className={`${focusRingClass} cursor-pointer text-xs text-muted hover:text-text rounded py-1`}
                    >
                      {labels.sha256Disclosure}
                    </summary>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <code className="text-xs break-all font-mono text-muted">
                        {asset.sha256}
                      </code>
                      <CopySha256Button
                        sha256={asset.sha256}
                        copyLabel={labels.copySha256}
                      />
                    </div>
                  </details>
                  <div className="mt-auto pt-2 flex flex-wrap gap-4">
                    <Link
                      href={asset.file}
                      className={`${focusRingClass} text-sm font-medium underline underline-offset-4 text-text hover:text-muted rounded focus-visible:ring-2 focus-visible:ring-offset-2`}
                    >
                      {labels.viewImage}
                    </Link>
                    <CopyLinkButton
                      url={
                        asset.file.startsWith('http')
                          ? asset.file
                          : `${siteBase}${asset.file}`
                      }
                      label={labels.copyLink}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {assets.length === 0 && (
          <p className="text-muted text-sm">{labels.noResults}</p>
        )}
        {totalPages > 1 && (
          <nav
            className="mt-8 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            <button
              type="button"
              onClick={() => setPage(currentPageFromUrl - 1)}
              disabled={currentPageFromUrl === 1}
              className={`${focusRingClass} rounded border px-3 py-1.5 text-sm ${
                currentPageFromUrl === 1
                  ? 'border-border text-muted opacity-50 cursor-not-allowed'
                  : 'border-border text-muted hover:text-text'
              }`}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-sm text-muted">
              Page {currentPageFromUrl} of {totalPages} ({totalItems} total)
            </span>
            <button
              type="button"
              onClick={() => setPage(currentPageFromUrl + 1)}
              disabled={currentPageFromUrl >= totalPages}
              className={`${focusRingClass} rounded border px-3 py-1.5 text-sm ${
                currentPageFromUrl >= totalPages
                  ? 'border-border text-muted opacity-50 cursor-not-allowed'
                  : 'border-border text-muted hover:text-text'
              }`}
              aria-label="Next page"
            >
              Next
            </button>
          </nav>
        )}
      </Container>
    </section>
  );
}
