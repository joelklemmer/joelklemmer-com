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

/** Thumb path convention: base.webp → base__thumb.webp. List uses thumb ONLY; master only on error. */
function getThumbPath(asset: MediaAsset): string {
  return asset.file.replace(/\.webp$/, '__thumb.webp');
}

/** Token default 56px; responsive 64/72. Used for Next/Image width/height (pixels). */
const THUMB_SIZE_PX = 56;
const THUMB_ASPECT = 125 / 96;

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
}

export function MediaLibraryClient({
  assets,
  initialKind = null,
  manifestSize = 0,
  basePath,
  siteBase,
  labels,
}: MediaLibraryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kind = searchParams.get('kind') ?? initialKind;
  const [thumbFallback, setThumbFallback] = useState<Set<string>>(new Set());
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

  const handleThumbError = useCallback((assetId: string) => {
    setThumbFallback((prev) => new Set(prev).add(assetId));
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
                ? 'border-accent bg-accent/10 text-accent'
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
                  ? 'border-accent bg-accent/10 text-accent'
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
            const thumbPath = getThumbPath(asset);
            const useMaster = thumbFallback.has(asset.id);
            const src = useMaster ? asset.file : thumbPath;
            const isFirstViewport = index < 4;
            return (
              <li
                key={asset.id}
                id={asset.id}
                className="flex flex-col sm:flex-row gap-6 sm:gap-8 border-b border-border pb-8 last:border-0 [content-visibility:auto] [contain-intrinsic-size:auto_180px]"
              >
                <div className="shrink-0 relative rounded-lg overflow-hidden border border-border bg-muted/50 shadow-sm ring-1 ring-black/5 media-thumb-frame">
                  <Link
                    href={asset.file}
                    className={`block w-full h-full ${focusRingClass} focus-visible:ring-2 focus-visible:ring-offset-2 rounded-lg`}
                    aria-label={asset.alt}
                  >
                    <Image
                      src={src}
                      alt={asset.alt}
                      width={THUMB_SIZE_PX}
                      height={Math.round(THUMB_SIZE_PX * THUMB_ASPECT)}
                      className="object-cover w-full h-full transition-transform duration-200 hover:scale-[1.02] motion-reduce:transition-none"
                      sizes="56px"
                      loading={isFirstViewport ? 'eager' : 'lazy'}
                      decoding="async"
                      priority={isFirstViewport}
                      onError={() => handleThumbError(asset.id)}
                    />
                  </Link>
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
                    <dt className="text-muted font-medium">
                      {labels.recommendedUse}
                    </dt>
                    <dd className="text-text">
                      {asset.recommendedUse.join(', ')}
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
      </Container>
    </section>
  );
}
