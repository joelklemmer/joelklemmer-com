/**
 * Media manifest validation: alt, caption (descriptor), sitemap eligibility, denylist.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-media-manifest.ts
 */
import {
  getMediaManifest,
  getMediaManifestSitemapEligible,
  isMediaTierC,
} from '@joelklemmer/content/validate';

const errors: string[] = [];

const manifest = getMediaManifest();

for (const asset of manifest.assets) {
  if (!asset.alt || String(asset.alt).trim() === '') {
    errors.push(`Media asset ${asset.id}: missing or empty alt.`);
  }
  if (!asset.descriptor || String(asset.descriptor).trim() === '') {
    errors.push(
      `Media asset ${asset.id}: missing or empty descriptor (caption).`,
    );
  }
}

const sitemapEligible = getMediaManifestSitemapEligible(manifest);
const tierCInSitemap = sitemapEligible.filter((a) =>
  isMediaTierC(a.descriptor),
);
if (tierCInSitemap.length > 0) {
  errors.push(
    `Denylist violation: ${tierCInSitemap.length} Tier C asset(s) included in sitemap eligibility: ${tierCInSitemap.map((a) => a.id).join(', ')}`,
  );
}

if (errors.length > 0) {
  throw new Error(
    `Media manifest validation failed:\n- ${errors.join('\n- ')}`,
  );
}

console.log(
  `Media manifest validation passed: ${manifest.assets.length} assets, ${sitemapEligible.length} sitemap-eligible.`,
);
