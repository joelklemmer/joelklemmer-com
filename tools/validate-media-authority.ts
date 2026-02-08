/**
 * Media authority governance: Tier A required metadata, Tier C exclusion, thumb presence.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-media-authority.ts
 */
import * as path from 'path';
import { existsSync, readFileSync } from 'node:fs';
import {
  getMediaManifest,
  getMediaManifestVisible,
  getMediaManifestSitemapEligible,
  getMediaThumbPath,
  isMediaTierA,
  isMediaTierB,
  isMediaTierC,
} from '@joelklemmer/content/validate';

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

function main() {
  const manifest = getMediaManifest();
  const errors: string[] = [];

  for (const asset of manifest.assets) {
    const tierA = isMediaTierA(asset);
    const tierB = isMediaTierB(asset);
    if (!tierA && !tierB) continue;

    if (tierA) {
      if (!asset.alt?.trim())
        errors.push(`[Tier A] ${asset.id}: missing or empty alt.`);
      const caption = (asset.caption ?? asset.alt ?? '').trim();
      if (!caption)
        errors.push(`[Tier A] ${asset.id}: missing or empty caption.`);
      if (!asset.personaSignal?.trim())
        errors.push(`[Tier A] ${asset.id}: missing personaSignal.`);
      if (!asset.formalityLevel?.trim())
        errors.push(`[Tier A] ${asset.id}: missing formalityLevel.`);
      if (!asset.visualTone?.trim())
        errors.push(`[Tier A] ${asset.id}: missing visualTone.`);

      const publicRoot = resolvePublicRoot();
      const thumbPath = getMediaThumbPath(asset);
      const relativeThumb = thumbPath.startsWith('/')
        ? thumbPath.slice(1)
        : thumbPath;
      const absoluteThumb = path.join(publicRoot, relativeThumb);
      const masterRelative = asset.file.startsWith('/')
        ? asset.file.slice(1)
        : asset.file;
      const absoluteMaster = path.join(publicRoot, masterRelative);
      if (!existsSync(absoluteThumb) && !existsSync(absoluteMaster)) {
        errors.push(
          `[Tier A] ${asset.id}: thumb and master missing on disk (${relativeThumb}).`,
        );
      }
    }

    if (tierA || tierB) {
      const sig = asset.signals;
      if (!sig)
        errors.push(
          `[Tier ${tierA ? 'A' : 'B'}] ${asset.id}: missing signals object.`,
        );
      else {
        if (!sig.attire?.trim())
          errors.push(`[Tier A/B] ${asset.id}: signals.attire required.`);
        if (!sig.framing?.trim())
          errors.push(`[Tier A/B] ${asset.id}: signals.framing required.`);
        if (!sig.background?.trim())
          errors.push(`[Tier A/B] ${asset.id}: signals.background required.`);
        if (!sig.expression?.trim())
          errors.push(`[Tier A/B] ${asset.id}: signals.expression required.`);
        if (!sig.purpose?.trim())
          errors.push(`[Tier A/B] ${asset.id}: signals.purpose required.`);
      }
    }
  }

  const visible = getMediaManifestVisible(manifest);
  const sitemapEligible = getMediaManifestSitemapEligible(manifest);
  const tierCInVisible = visible.some((a) => isMediaTierC(a.descriptor));
  const tierCInSitemap = sitemapEligible.some((a) =>
    isMediaTierC(a.descriptor),
  );
  if (tierCInVisible)
    errors.push('Tier C assets must be excluded from visible set.');
  if (tierCInSitemap)
    errors.push('Tier C assets must be excluded from sitemap-eligible set.');

  if (errors.length) {
    throw new Error(
      `Media authority validation failed:\n- ${errors.join('\n- ')}`,
    );
  }

  console.log(
    `Media authority validation passed: ${manifest.assets.length} assets, ${visible.length} visible (Tier A), ${sitemapEligible.length} sitemap-eligible.`,
  );
}

main();
