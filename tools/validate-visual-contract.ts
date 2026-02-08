/**
 * Visual contract: required CSS layers exist; no new monolith file.
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-visual-contract.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const STYLES_DIR = path.join(ROOT, 'apps', 'web', 'src', 'styles');
const APP_LAYERS = path.join(STYLES_DIR, 'app-layers.css');

const REQUIRED_LAYERS = [
  '10-base.css',
  '20-layout.css',
  '30-components.css',
  '40-utilities.css',
];
const ALLOWED_STYLE_FILES = new Set([
  '00-tokens.css',
  '10-base.css',
  '20-layout.css',
  '30-components.css',
  '40-utilities.css',
  'app-layers.css',
  'index.css',
]);

function main() {
  const errors: string[] = [];

  for (const layer of REQUIRED_LAYERS) {
    const p = path.join(STYLES_DIR, layer);
    if (!fs.existsSync(p)) {
      errors.push(`Missing required layer: ${layer}`);
    }
  }

  const appLayersContent = fs.readFileSync(APP_LAYERS, 'utf-8');
  for (const layer of REQUIRED_LAYERS) {
    if (!appLayersContent.includes(layer)) {
      errors.push(`app-layers.css must @import ${layer}`);
    }
  }

  const files = fs.readdirSync(STYLES_DIR);
  const cssFiles = files.filter((f) => f.endsWith('.css'));
  for (const f of cssFiles) {
    if (!ALLOWED_STYLE_FILES.has(f)) {
      errors.push(
        `Unexpected style file: ${f}. Add to ALLOWED_STYLE_FILES or use existing layers (10/20/30/40).`,
      );
    }
  }

  if (errors.length) {
    throw new Error(
      `Visual contract validation failed:\n- ${errors.join('\n- ')}`,
    );
  }

  console.log(
    `Visual contract validation passed: layers ${REQUIRED_LAYERS.join(', ')} present and imported.`,
  );
}

main();
