/**
 * Media manifest validation: completeness audit (alt, descriptor, canonical prefix),
 * sitemap eligibility, denylist. Uses content/validate manifest auditing.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-media-manifest.ts
 */
import {
  auditManifestCompleteness,
  getMediaManifest,
  getMediaManifestSitemapEligible,
} from '@joelklemmer/content/validate';

const manifest = getMediaManifest();
const audit = auditManifestCompleteness(manifest);

if (!audit.ok) {
  throw new Error(
    `Media manifest validation failed:\n- ${audit.errors.join('\n- ')}`,
  );
}

const sitemapEligible = getMediaManifestSitemapEligible(manifest);

console.log(
  `Media manifest validation passed: ${manifest.assets.length} assets, ${sitemapEligible.length} sitemap-eligible.`,
);
