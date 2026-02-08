/**
 * Add a proof attachment: copy file to apps/web/public/proof/files/,
 * compute SHA-256, update manifest. Deterministic filenames (lowercase, hyphenated, no spaces).
 * Usage: npx tsx --tsconfig tsconfig.base.json tools/proof/add-proof-attachment.ts --file <path> --recordId <id> --labelKey <key> [--output-filename <name>] [--allow-duplicate-sha]
 */
import path from 'node:path';
import {
  existsSync,
  readFileSync,
  copyFileSync,
  mkdirSync,
  writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';

const repoRoot = process.cwd();
const proofFilesDir = path.join(
  repoRoot,
  'apps',
  'web',
  'public',
  'proof',
  'files',
);
const manifestPath = path.join(
  repoRoot,
  'apps',
  'web',
  'public',
  'proof',
  'manifest.json',
);

function sha256(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function sanitizeFilename(name: string): string {
  const base = path.basename(name);
  const ext = path.extname(base);
  const stem = path.basename(base, ext) || 'file';
  const safe = stem
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '');
  return (safe || 'file') + (ext ? ext.toLowerCase() : '');
}

function parseArgs(): {
  file: string;
  recordId: string;
  labelKey: string;
  outputFilename?: string;
  allowDuplicateSha: boolean;
} {
  const args = process.argv.slice(2);
  let file = '';
  let recordId = '';
  let labelKey = '';
  let outputFilename: string | undefined;
  let allowDuplicateSha = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) file = args[++i];
    else if (args[i] === '--recordId' && args[i + 1]) recordId = args[++i];
    else if (args[i] === '--labelKey' && args[i + 1]) labelKey = args[++i];
    else if (args[i] === '--output-filename' && args[i + 1])
      outputFilename = args[++i];
    else if (args[i] === '--allow-duplicate-sha') allowDuplicateSha = true;
  }
  if (!file || !recordId || !labelKey) {
    console.error(
      'Usage: npx tsx tools/proof/add-proof-attachment.ts --file <path> --recordId <id> --labelKey <key> [--output-filename <name>] [--allow-duplicate-sha]',
    );
    process.exit(1);
  }
  return { file, recordId, labelKey, outputFilename, allowDuplicateSha };
}

function main() {
  const { file, recordId, labelKey, outputFilename, allowDuplicateSha } =
    parseArgs();
  const absFile = path.isAbsolute(file) ? file : path.join(repoRoot, file);
  if (!existsSync(absFile)) {
    console.error(`File not found: ${absFile}`);
    process.exit(1);
  }

  const hash = sha256(absFile);
  const filename = outputFilename
    ? sanitizeFilename(outputFilename)
    : sanitizeFilename(path.basename(absFile));

  const manifest: {
    items: Array<{
      id: string;
      filename: string;
      sha256: string;
      labelKey?: string;
      recordIds?: string[];
    }>;
  } = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, 'utf-8'))
    : { items: [] };

  const existingBySha = manifest.items.find((i) => i.sha256 === hash);
  if (existingBySha && !allowDuplicateSha) {
    console.error(
      `Duplicate SHA-256: file matches existing manifest item id="${existingBySha.id}". Use --allow-duplicate-sha to add anyway.`,
    );
    process.exit(1);
  }

  const id = `${recordId}-${labelKey}`;
  const existing = manifest.items.find((i) => i.id === id);
  if (existing) {
    if (existing.sha256 !== hash) {
      console.error(
        `Manifest already has item id="${id}" with different SHA-256. Use a different id (e.g. different labelKey).`,
      );
      process.exit(1);
    }
    if (!existing.recordIds?.includes(recordId)) {
      existing.recordIds = [...(existing.recordIds ?? []), recordId];
      mkdirSync(proofFilesDir, { recursive: true });
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
      console.log(`Updated recordIds for existing attachment id="${id}".`);
    }
    return;
  }

  const destPath = path.join(proofFilesDir, filename);
  mkdirSync(proofFilesDir, { recursive: true });
  copyFileSync(absFile, destPath);
  manifest.items.push({
    id,
    filename,
    sha256: hash,
    labelKey,
    recordIds: [recordId],
    kind: 'public-record',
  });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    `Added attachment id="${id}" -> ${filename} (SHA-256: ${hash.slice(0, 16)}…).`,
  );
}

main();
