#!/usr/bin/env node
/**
 * Extracts evidence from tmp/lighthouse/custom/*.report.json for the fix report.
 * Usage: node tools/extract-lhr-evidence.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'tmp', 'lighthouse', 'custom');
const files = [
  'en.report.json',
  'en-brief.report.json',
  'en-media.report.json',
];

const audits = [
  'aria-allowed-role',
  'target-size',
  'bf-cache',
  'largest-contentful-paint',
  'largest-contentful-paint-element',
];

for (const file of files) {
  const fp = path.join(dir, file);
  if (!fs.existsSync(fp)) continue;
  const raw = fs.readFileSync(fp, 'utf8');
  const lhr = JSON.parse(raw);
  const url = lhr.finalUrl || lhr.requestedUrl || file;
  console.log('\n=== ' + url + ' ===\n');
  for (const id of audits) {
    const audit = lhr.audits?.[id];
    if (!audit) {
      console.log(id + ': (missing)\n');
      continue;
    }
    console.log(id + ':');
    if (audit.numericValue !== undefined)
      console.log('  numericValue:', audit.numericValue);
    if (audit.score !== undefined) console.log('  score:', audit.score);
    if (audit.details?.items?.length) {
      console.log(
        '  details.items:',
        JSON.stringify(audit.details.items, null, 2)
          .split('\n')
          .map((l) => '  ' + l)
          .join('\n'),
      );
    } else if (audit.details?.items) {
      console.log('  details.items:', audit.details.items);
    }
    if (audit.details?.debugData) {
      console.log(
        '  debugData:',
        JSON.stringify(audit.details.debugData, null, 2).slice(0, 800),
      );
    }
    if (
      id === 'largest-contentful-paint-element' &&
      audit.details?.items?.[0]
    ) {
      const node = audit.details.items[0].node;
      console.log('  node snippet:', node?.snippet || node);
    }
    console.log('');
  }
}
