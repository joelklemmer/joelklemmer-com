#!/usr/bin/env node
/**
 * Extracts evidence from tmp/lighthouse/custom/*.report.json for the fix report.
 * Outputs: mainthread-work-breakdown (top 10), bootup-time (top 10), unused-javascript (top 10),
 * LCP numericValue and element; plus legacy audits.
 * Usage:
 *   node tools/extract-lhr-evidence.mjs
 *   node tools/extract-lhr-evidence.mjs tmp/lighthouse/custom/en.report.json
 *   node tools/extract-lhr-evidence.mjs tmp/lighthouse/custom/en-brief.report.json
 *   node tools/extract-lhr-evidence.mjs tmp/lighthouse/custom/en-media.report.json
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

function emitPhase1ForLhr(lhr, label) {
  const a = lhr.audits || {};
  console.log('\n=== ' + label + ' ===\n');

  const mainthread = a['mainthread-work-breakdown']?.details?.items;
  if (mainthread && Array.isArray(mainthread)) {
    const sorted = [...mainthread].sort(
      (x, y) => (y.duration ?? 0) - (x.duration ?? 0),
    );
    console.log('Top 10 main-thread contributors (ms):');
    sorted.slice(0, 10).forEach((item, i) => {
      console.log(
        `  ${i + 1}. ${item.groupLabel || item.group}: ${Math.round(item.duration ?? 0)}`,
      );
    });
    console.log('');
  }

  const bootup = a['bootup-time']?.details?.items;
  if (bootup && Array.isArray(bootup)) {
    const sorted = [...bootup].sort((x, y) => (y.total ?? 0) - (x.total ?? 0));
    console.log('Top 10 bootup-time by total (ms):');
    sorted.slice(0, 10).forEach((item, i) => {
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
    console.log('Top 10 unused JavaScript (wastedBytes):');
    sorted.slice(0, 10).forEach((item, i) => {
      console.log(
        `  ${i + 1}. ${basename(item.url)}: ${item.wastedBytes ?? 0} (${Math.round(item.wastedPercent ?? 0)}%)`,
      );
    });
    console.log('');
  }

  const lcp = a['largest-contentful-paint'];
  const lcpElAudit = a['largest-contentful-paint-element']?.details;
  // Lighthouse 12: details can be list of tables; first table has node, second has phases
  const listItems = lcpElAudit?.items;
  const firstTable =
    Array.isArray(listItems) && listItems[0]?.type === 'table'
      ? listItems[0]
      : null;
  const phaseTable =
    Array.isArray(listItems) && listItems[1]?.type === 'table'
      ? listItems[1]
      : null;
  const node = firstTable?.items?.[0]?.node ?? lcpElAudit?.items?.[0]?.node;
  const phases = phaseTable?.items ?? [];
  const renderDelayItem = phases.find((p) => p.phase === 'Render Delay');
  if (lcp) {
    console.log('LCP numericValue (ms):', Math.round(lcp.numericValue ?? 0));
    if (renderDelayItem?.timing != null) {
      console.log('Render delay (ms):', Math.round(renderDelayItem.timing));
    }
    if (node) {
      console.log(
        'LCP element:',
        node.selector || node.snippet?.slice(0, 120) || node.nodeLabel || '',
      );
      if (node.snippet && /src(set)?=/.test(node.snippet)) {
        const srcMatch = node.snippet.match(/src="([^"]+)"/);
        if (srcMatch) console.log('LCP resource URL:', srcMatch[1]);
      }
    }
    console.log('');
  }
}

const singlePath = process.argv[2];
if (singlePath) {
  const fp = path.isAbsolute(singlePath)
    ? singlePath
    : path.join(process.cwd(), singlePath);
  if (!fs.existsSync(fp)) {
    console.error('File not found:', fp);
    process.exit(1);
  }
  const lhr = JSON.parse(fs.readFileSync(fp, 'utf8'));
  const label =
    shortUrl(lhr.finalUrl || lhr.requestedUrl) ||
    path.basename(fp, '.report.json');
  emitPhase1ForLhr(lhr, label);
  process.exit(0);
}

// --- Phase 1 summary (first file = /en) ---
const firstFile = path.join(dir, files[0]);
if (fs.existsSync(firstFile)) {
  const lhr = JSON.parse(fs.readFileSync(firstFile, 'utf8'));
  emitPhase1ForLhr(lhr, 'Phase 1 — Main-thread & JS (from ' + files[0] + ')');
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
