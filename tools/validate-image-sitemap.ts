/**
 * Image sitemap correctness: eligible count within limit, required fields present.
 * If eligible > IMAGE_SITEMAP_MAX, build must implement split (multiple sitemap files + index).
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-image-sitemap.ts
 */
import {
  getMediaManifest,
  getMediaManifestSitemapEligible,
} from '@joelklemmer/content/validate';

const IMAGE_SITEMAP_MAX = 50000;

function main() {
  const manifest = getMediaManifest();
  const eligible = getMediaManifestSitemapEligible(manifest);
  const errors: string[] = [];

  if (eligible.length > IMAGE_SITEMAP_MAX) {
    errors.push(
      `Image sitemap eligible count ${eligible.length} exceeds ${IMAGE_SITEMAP_MAX}. Implement sitemap split (multiple image sitemap files + index).`,
    );
  }

  for (const asset of eligible) {
    if (!asset.file?.trim()) {
      errors.push(`Sitemap-eligible asset ${asset.id}: missing file.`);
    }
    if (!asset.alt?.trim()) {
      errors.push(`Sitemap-eligible asset ${asset.id}: missing alt.`);
    }
  }

  if (errors.length) {
    throw new Error(
      `Image sitemap validation failed:\n- ${errors.join('\n- ')}`,
    );
  }

  console.log(
    `Image sitemap validation passed: ${eligible.length} eligible (limit ${IMAGE_SITEMAP_MAX}).`,
  );
}

main();
