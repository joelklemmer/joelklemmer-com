#!/usr/bin/env node
/**
 * Extracts evidence from tmp/lighthouse/custom/*.report.json for the fix report.
 * Outputs: mainthread-work-breakdown (top 5), bootup-time (top 5), unused-javascript (top 5),
 * LCP numericValue and element; plus legacy audits.
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

function shortUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const u = new URL(url);
    return u.pathname || u.href;
  } catch {
    return url.slice(-60);
  }
}

function basename(url) {
  if (!url || typeof url !== 'string') return url;
  const m = url.match(/\/([^/]+\.js)(?:\?|$)/);
  return m ? m[1] : url.slice(-50);
}

// --- Phase 1 summary (first file = /en) ---
const firstFile = path.join(dir, files[0]);
if (fs.existsSync(firstFile)) {
  const lhr = JSON.parse(fs.readFileSync(firstFile, 'utf8'));
  const a = lhr.audits || {};
  console.log('\n=== Phase 1 — Main-thread & JS (from ' + files[0] + ') ===\n');

  const mainthread = a['mainthread-work-breakdown']?.details?.items;
  if (mainthread && Array.isArray(mainthread)) {
    const sorted = [...mainthread].sort(
      (x, y) => (y.duration ?? 0) - (x.duration ?? 0),
    );
    console.log('Top 5 main-thread contributors (ms):');
    sorted.slice(0, 5).forEach((item, i) => {
      console.log(
        `  ${i + 1}. ${item.groupLabel || item.group}: ${Math.round(item.duration ?? 0)}`,
      );
    });
    console.log('');
  }

  const bootup = a['bootup-time']?.details?.items;
  if (bootup && Array.isArray(bootup)) {
    const sorted = [...bootup].sort((x, y) => (y.total ?? 0) - (x.total ?? 0));
    console.log('Top 5 bootup-time by total (ms):');
    sorted.slice(0, 5).forEach((item, i) => {
      console.log(
        `  ${i + 1}. ${basename(item.url)}: ${Math.round(item.total ?? 0)}`,
      );
    });
    console.log('');
  }

  const unused = a['unused-javascript']?.details?.items;
  if (unused && Array.isArray(unused)) {
    const sorted = [...unused].sort(
      (x, y) => (y.wastedBytes ?? 0) - (x.wastedBytes ?? 0),
    );
    console.log('Top 5 unused JavaScript (wastedBytes):');
    sorted.slice(0, 5).forEach((item, i) => {
      console.log(
        `  ${i + 1}. ${basename(item.url)}: ${item.wastedBytes ?? 0} (${Math.round(item.wastedPercent ?? 0)}%)`,
      );
    });
    console.log('');
  }

  const lcp = a['largest-contentful-paint'];
  const lcpEl = a['largest-contentful-paint-element']?.details?.items?.[0];
  if (lcp) {
    console.log('LCP numericValue (ms):', Math.round(lcp.numericValue ?? 0));
    if (lcpEl?.node?.snippet) console.log('LCP element:', lcpEl.node.snippet);
    const debug = lcp.details?.debugData;
    if (debug && typeof debug === 'object') {
      const rd = debug.renderDelay;
      if (rd != null) console.log('Render delay (ms):', rd);
    }
    console.log('');
  }
}

// --- Legacy audits (all files) ---
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
  const url = shortUrl(lhr.finalUrl || lhr.requestedUrl) || file;
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
