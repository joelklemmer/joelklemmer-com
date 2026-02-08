import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { z } from 'zod';

const recommendedUseSchema = z.enum([
  'hero',
  'avatar',
  'card',
  'press',
  'books',
]);
const personaSignalSchema = z.enum([
  'executive',
  'statesman',
  'author',
  'speaker',
  'institutional',
]);
const environmentSignalSchema = z.enum([
  'studio',
  'podium',
  'office',
  'architectural',
  'literary',
]);
const formalityLevelSchema = z.enum(['high', 'elevated', 'moderate']);
const visualToneSchema = z.enum([
  'commanding',
  'approachable',
  'scholarly',
  'strategic',
  'decisive',
]);
const mediaAssetSchema = z.object({
  id: z.string().min(1),
  file: z.string().min(1),
  kind: z.enum(['portrait', 'speaking', 'author', 'identity']),
  descriptor: z.string().min(1),
  recommendedUse: z.array(recommendedUseSchema),
  aspectRatio: z.number(),
  width: z.number(),
  height: z.number(),
  sha256: z.string().min(1),
  alt: z.string().min(1),
  // Phase II semantic enrichment (optional for backward compat)
  authorityTier: z.enum(['A', 'B', 'C']).optional(),
  personaSignal: personaSignalSchema.optional(),
  environmentSignal: environmentSignalSchema.optional(),
  formalityLevel: formalityLevelSchema.optional(),
  visualTone: visualToneSchema.optional(),
  caption: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
});

const mediaManifestSchema = z.object({
  assets: z.array(mediaAssetSchema),
});

export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type MediaManifest = z.infer<typeof mediaManifestSchema>;

/** Authority Core: visible on media page, indexable, in sitemap. Semantic descriptors only. */
export const MEDIA_TIER_A_VISIBLE_DESCRIPTORS = [
  'executive-studio',
  'formal-board',
  'institutional-identity',
  'statesman-portrait',
  'policy-profile',
  'press-headshot',
  'leadership-profile',
  'speaking-address',
  'author-environment',
] as const;

/** Authority Core (other): indexable, in sitemap, not shown on media page. */
export const MEDIA_TIER_A_DESCRIPTORS = [
  ...MEDIA_TIER_A_VISIBLE_DESCRIPTORS,
  'startup-founder',
  'city-vogue',
  'luxury-hotel',
  'fine-dining',
] as const;

/** Authority Adjacent: indexable, in sitemap, not visible on page. */
export const MEDIA_TIER_B_DESCRIPTORS = [
  'outdoor-adventure',
  'winter',
  'luxury',
  'hot-air-balloon',
] as const;

/** Authority Dilution: flag for removal; exclude from manifest/sitemap. */
export const MEDIA_TIER_C_DESCRIPTORS = [
  'cozy-home',
  'easter',
  'glamour',
  'glamour-photos',
  'modeling',
  'luxury-cruise',
  'casual',
  'party',
  'social',
] as const;

const tierASet = new Set(MEDIA_TIER_A_DESCRIPTORS);
const tierBSet = new Set(MEDIA_TIER_B_DESCRIPTORS);
const tierCSet = new Set(MEDIA_TIER_C_DESCRIPTORS);
const visibleSet = new Set(MEDIA_TIER_A_VISIBLE_DESCRIPTORS);

export function isMediaTierC(descriptor: string): boolean {
  return tierCSet.has(descriptor as (typeof MEDIA_TIER_C_DESCRIPTORS)[number]);
}

export function isMediaSitemapEligible(asset: MediaAsset): boolean {
  return !isMediaTierC(asset.descriptor);
}

export function isMediaVisibleOnPage(asset: MediaAsset): boolean {
  return visibleSet.has(
    asset.descriptor as (typeof MEDIA_TIER_A_VISIBLE_DESCRIPTORS)[number],
  );
}

/**
 * Derived thumbnail path (convention: base.webp → base__thumb.webp).
 * Use for list/grid thumbnails to avoid loading full-res in the UI.
 */
export function getMediaThumbPath(asset: MediaAsset): string {
  return asset.file.replace(/\.webp$/, '__thumb.webp');
}

/** Filter manifest to assets eligible for sitemap and structured data (Tier A + B). */
export function getMediaManifestSitemapEligible(
  manifest: MediaManifest,
): MediaAsset[] {
  return manifest.assets.filter(isMediaSitemapEligible);
}

/** Filter manifest to assets visible on the media archive page (visible descriptors only). */
export function getMediaManifestVisible(manifest: MediaManifest): MediaAsset[] {
  return manifest.assets.filter(isMediaVisibleOnPage);
}

/** Crawl eligibility classification for governance and sitemap decisions. */
export type MediaCrawlEligibility = 'indexable' | 'excluded';

export function getMediaCrawlEligibility(
  asset: MediaAsset,
): MediaCrawlEligibility {
  return isMediaSitemapEligible(asset) ? 'indexable' : 'excluded';
}

/**
 * Authority scoring engine: 0–1 score from tier and optional semantic signals.
 * Tier A visible = 1, Tier A = 0.95, Tier B = 0.7, Tier C = 0 (excluded).
 */
export function authorityScoreForAsset(asset: MediaAsset): number {
  if (isMediaTierC(asset.descriptor)) return 0;
  if (isMediaVisibleOnPage(asset)) return 1;
  if (
    tierASet.has(asset.descriptor as (typeof MEDIA_TIER_A_DESCRIPTORS)[number])
  )
    return 0.95;
  if (
    tierBSet.has(asset.descriptor as (typeof MEDIA_TIER_B_DESCRIPTORS)[number])
  )
    return 0.7;
  return 0.5;
}

/**
 * Manifest completeness audit: schema-level and governance checks.
 * Use for reporting; getMediaManifest() already validates schema and files.
 */
export function auditManifestCompleteness(manifest: MediaManifest): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const CANONICAL_PREFIX = 'joel-klemmer';
  for (const asset of manifest.assets) {
    if (!asset.alt?.trim())
      errors.push(`Asset ${asset.id}: missing or empty alt.`);
    if (!asset.descriptor?.trim())
      errors.push(`Asset ${asset.id}: missing or empty descriptor.`);
    const filename = asset.file.split('/').pop() ?? asset.file;
    if (!filename.includes(CANONICAL_PREFIX))
      errors.push(
        `Asset ${asset.id}: filename must include "${CANONICAL_PREFIX}" (got ${filename}).`,
      );
  }
  return { ok: errors.length === 0, errors };
}

const publicRootCandidates = [
  path.join(process.cwd(), 'apps', 'web', 'public'),
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), '..', '..', 'apps', 'web', 'public'),
];

function resolvePublicRoot() {
  return (
    publicRootCandidates.find((candidate) => existsSync(candidate)) ??
    publicRootCandidates[0]
  );
}

function readJsonFile<T>(filePath: string) {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function sha256ForFile(filePath: string) {
  const buffer = readFileSync(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

function formatIssues(err: z.ZodError) {
  return err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

export function getMediaManifest() {
  const publicRoot = resolvePublicRoot();
  const manifestPath = path.join(publicRoot, 'media', 'manifest.json');
  const manifest = readJsonFile<unknown>(manifestPath);
  const parsed = mediaManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    const issues = formatIssues(parsed.error).join('; ');
    throw new Error(`Invalid media manifest ${manifestPath}: ${issues}`);
  }

  const errors: string[] = [];
  const releaseReady = process.env.RELEASE_READY === '1';

  parsed.data.assets.forEach((asset) => {
    const relativePath = asset.file.startsWith('/')
      ? asset.file.slice(1)
      : asset.file;
    const assetPath = path.join(publicRoot, relativePath);
    if (!existsSync(assetPath)) {
      if (releaseReady) {
        errors.push(`Missing media asset file: ${assetPath}`);
      } else {
        console.warn(
          `[dev] Media asset file missing: ${assetPath} (id: ${asset.id})`,
        );
      }
      return;
    }
    if (releaseReady) {
      const actual = sha256ForFile(assetPath);
      if (actual !== asset.sha256) {
        errors.push(
          `Checksum mismatch for ${assetPath} (expected ${asset.sha256}, got ${actual})`,
        );
      }
    }
  });

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  return parsed.data;
}
