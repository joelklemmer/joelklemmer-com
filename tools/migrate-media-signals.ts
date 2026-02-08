/**
 * One-time migration: backfill manifest assets (Tier A and Tier B) with deterministic
 * signals (attire, framing, background, expression, purpose). Run from repo root:
 *   npx tsx --tsconfig tsconfig.base.json tools/migrate-media-signals.ts
 */
import * as path from 'path';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import {
  getMediaManifest,
  isMediaTierA,
  isMediaTierB,
  type MediaAsset,
  type MediaSignals,
} from '@joelklemmer/content/validate';

type Attire = MediaSignals['attire'];
type Framing = MediaSignals['framing'];
type Background = MediaSignals['background'];
type Expression = MediaSignals['expression'];
type Purpose = MediaSignals['purpose'];

function deriveAttire(asset: MediaAsset): Attire {
  const level = asset.formalityLevel;
  if (level === 'high') return 'suit';
  if (level === 'elevated') return 'business';
  if (level === 'moderate') return 'casual';
  return 'business';
}

function deriveFraming(asset: MediaAsset): Framing {
  if (asset.kind === 'identity') return 'headshot';
  if (asset.kind === 'portrait') return 'headshot';
  if (asset.kind === 'speaking') {
    if (asset.descriptor === 'speaking-address') return 'full';
    return 'half';
  }
  if (asset.kind === 'author') return 'half';
  return 'headshot';
}

function deriveBackground(asset: MediaAsset): Background {
  const env = asset.environmentSignal;
  if (env === 'studio') return 'studio';
  if (env === 'podium') return 'stage';
  if (env === 'office' || env === 'architectural' || env === 'literary')
    return 'environment';
  return 'studio';
}

function deriveExpression(asset: MediaAsset): Expression {
  return asset.visualTone === 'approachable' ? 'speaking' : 'neutral';
}

function derivePurpose(asset: MediaAsset): Purpose {
  const use = asset.recommendedUse;
  if (use.includes('press')) return 'press';
  if (use.includes('hero')) return 'hero';
  if (use.includes('card')) return 'card';
  if (use.includes('books')) return 'bio';
  if (use.includes('avatar')) return 'identity';
  return 'press';
}

function deriveSignals(asset: MediaAsset): MediaSignals {
  return {
    attire: deriveAttire(asset),
    framing: deriveFraming(asset),
    background: deriveBackground(asset),
    expression: deriveExpression(asset),
    purpose: derivePurpose(asset),
  };
}

const publicRootCandidates = [
  path.join(process.cwd(), 'apps', 'web', 'public'),
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), '..', '..', 'apps', 'web', 'public'),
];

function resolvePublicRoot() {
  return (
    publicRootCandidates.find((c) => existsSync(c)) ?? publicRootCandidates[0]
  );
}

function main() {
  const manifest = getMediaManifest();
  const publicRoot = resolvePublicRoot();
  const manifestPath = path.join(publicRoot, 'media', 'manifest.json');

  let backfilled = 0;
  const assets = manifest.assets.map((asset) => {
    if (!isMediaTierA(asset) && !isMediaTierB(asset)) return asset;
    if (asset.signals) return asset;
    backfilled++;
    return { ...asset, signals: deriveSignals(asset) };
  });

  const next = { assets };
  writeFileSync(manifestPath, JSON.stringify(next, null, 2), 'utf-8');
  console.log(
    `migrate-media-signals: backfilled signals for ${backfilled} Tier A/B assets. Manifest written to ${manifestPath}.`,
  );
}

main();
