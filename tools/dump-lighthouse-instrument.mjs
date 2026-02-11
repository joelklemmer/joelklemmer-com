/**
 * Writes the effective Lighthouse instrument config to tmp/lighthouse/instrument.json.
 * Run before validate-lighthouse-instrument and collect so the guard can assert apparatus.
 * Usage: node tools/dump-lighthouse-instrument.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  flowConfig,
  getInstrumentSummary,
} from './lighthouse-instrument-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'tmp', 'lighthouse');
const outFile = path.join(outDir, 'instrument.json');

const payload = {
  settings: flowConfig.settings ?? {},
  summary: getInstrumentSummary(),
  dumpedAt: new Date().toISOString(),
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8');
console.log(`dump-lighthouse-instrument: wrote ${outFile}`);
