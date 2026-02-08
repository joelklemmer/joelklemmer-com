/**
 * Media derivatives validation: Tier A visible assets must have thumb (and hero/card when used).
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-media-derivatives.ts
 * Wired after media-manifest-validate in web:verify.
 */
import * as path from 'path';
import { existsSync, readFileSync } from 'node:fs';
import {
  getMediaManifest,
  getMediaManifestVisible,
  getMediaThumbPath,
  resolveMediaDerivativePath,
  isMediaTierA,
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
  const visible = getMediaManifestVisible(manifest);
  const publicRoot = resolvePublicRoot();
  const errors: string[] = [];

  for (const asset of manifest.assets) {
    if (!isMediaTierA(asset)) continue;
    const isVisible = visible.some((v) => v.id === asset.id);
    if (!isVisible) continue;

    const thumbPath = getMediaThumbPath(asset);
    const relativeThumb = thumbPath.startsWith('/')
      ? thumbPath.slice(1)
      : thumbPath;
    const absoluteThumb = path.join(publicRoot, relativeThumb);
    if (!existsSync(absoluteThumb)) {
      errors.push(
        `[Tier A visible] ${asset.id}: thumb missing (${relativeThumb}).`,
      );
    }

    const usesHero = asset.recommendedUse?.includes('hero');
    const usesCard = asset.recommendedUse?.includes('card');
    if (usesHero) {
      const heroPath = resolveMediaDerivativePath(asset.file, 'hero');
      const relHero = heroPath.startsWith('/') ? heroPath.slice(1) : heroPath;
      if (!existsSync(path.join(publicRoot, relHero))) {
        errors.push(
          `[Tier A visible] ${asset.id}: hero derivative missing (${relHero}).`,
        );
      }
    }
    if (usesCard) {
      const cardPath = resolveMediaDerivativePath(asset.file, 'card');
      const relCard = cardPath.startsWith('/') ? cardPath.slice(1) : cardPath;
      if (!existsSync(path.join(publicRoot, relCard))) {
        errors.push(
          `[Tier A visible] ${asset.id}: card derivative missing (${relCard}).`,
        );
      }
    }
  }

  if (errors.length) {
    throw new Error(
      `Media derivatives validation failed:\n- ${errors.join('\n- ')}`,
    );
  }

  console.log(
    `Media derivatives validation passed: thumb/hero/card present for ${visible.length} Tier A visible assets.`,
  );
}

main();
