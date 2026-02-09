/**
 * Media governance validation: alt doctrine, filenames, master/variant rules.
 * Fails on missing required alt, invalid filenames, or manifest entries pointing at variants.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-media-governance.ts
 * Wired in web:verify after media-authority-validate.
 */
import {
  getMediaManifest,
  validateMediaGovernanceMasterFilename,
  validateMediaGovernanceAlt,
} from '@joelklemmer/content/validate';

function main() {
  const manifest = getMediaManifest();
  const errors: string[] = [];

  for (const asset of manifest.assets) {
    const altError = validateMediaGovernanceAlt(asset.alt, asset.id);
    if (altError) errors.push(altError);

    const fileError = validateMediaGovernanceMasterFilename(asset.file);
    if (fileError) errors.push(`[${asset.id}] ${fileError}`);
  }

  if (errors.length) {
    throw new Error(
      `Media governance validation failed:\n- ${errors.join('\n- ')}`,
    );
  }

  console.log(
    `Media governance validation passed: ${manifest.assets.length} assets (alt doctrine, filenames, master-only).`,
  );
}

main();
