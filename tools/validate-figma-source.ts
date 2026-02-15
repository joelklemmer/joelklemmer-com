#!/usr/bin/env npx tsx
/**
 * Validates that figma-make tokens are from the canonical Figma site.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-figma-source.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const FIGMA_SITE_URL = 'https://pages-tile-41445691.figma.site/';
const TOKENS_JSON = path.join(
  process.cwd(),
  'libs/tokens/src/lib/generated/figma-make.tokens.json',
);

function main(): void {
  if (!fs.existsSync(TOKENS_JSON)) {
    console.error(
      '[validate-figma-source] tokens file not found:',
      TOKENS_JSON,
    );
    process.exit(1);
  }

  const content = fs.readFileSync(TOKENS_JSON, 'utf-8');
  let json: { meta?: { figmaSiteUrl?: string } };
  try {
    json = JSON.parse(content);
  } catch {
    console.error('[validate-figma-source] invalid JSON:', TOKENS_JSON);
    process.exit(1);
  }

  const url = json.meta?.figmaSiteUrl;
  if (!url || url !== FIGMA_SITE_URL) {
    console.error(
      `[validate-figma-source] tokens must be from ${FIGMA_SITE_URL}`,
    );
    console.error(`  Current meta.figmaSiteUrl: ${url ?? '(missing)'}`);
    console.error(
      '  Re-import from the correct project: Code tab → Download code → npx tsx tools/import-figma-make.ts [path]',
    );
    process.exit(1);
  }

  console.log('[validate-figma-source] OK — source:', url);
}

main();
