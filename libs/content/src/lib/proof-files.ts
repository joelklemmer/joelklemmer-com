import path from 'node:path';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { z } from 'zod';

const proofManifestItemSchema = z.object({
  id: z.string().min(1),
  filename: z.string().min(1),
  sha256: z
    .string()
    .length(64)
    .regex(/^[a-f0-9]{64}$/i, '64 hex chars'),
  kind: z.literal('public-record'),
});

const proofManifestSchema = z.object({
  items: z.array(proofManifestItemSchema),
});

export type ProofManifestItem = z.infer<typeof proofManifestItemSchema>;
export type ProofManifest = z.infer<typeof proofManifestSchema>;

const publicRootCandidates = [
  path.join(process.cwd(), 'apps', 'web', 'public'),
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), '..', '..', 'apps', 'web', 'public'),
];

function resolvePublicRoot() {
  return (
    publicRootCandidates.find((candidate) => existsSync(candidate)) ??
    publicRootCandidates[0]
  );
}

function readJsonFile<T>(filePath: string): T {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function sha256ForFile(filePath: string): string {
  const buffer = readFileSync(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

function formatIssues(err: z.ZodError) {
  return err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

/**
 * Load and validate proof manifest. When RELEASE_READY=1, missing files or
 * checksum mismatch throw. When RELEASE_READY=0, they only warn.
 */
export function getProofManifest(): ProofManifest {
  const publicRoot = resolvePublicRoot();
  const manifestPath = path.join(publicRoot, 'proof', 'manifest.json');
  const manifest = readJsonFile<unknown>(manifestPath);
  const parsed = proofManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    const issues = formatIssues(parsed.error).join('; ');
    throw new Error(`Invalid proof manifest ${manifestPath}: ${issues}`);
  }

  const errors: string[] = [];
  const releaseReady = process.env.RELEASE_READY === '1';
  const filesDir = path.join(publicRoot, 'proof', 'files');

  for (const item of parsed.data.items) {
    const filePath = path.join(filesDir, item.filename);
    if (!existsSync(filePath)) {
      if (releaseReady) {
        errors.push(`Missing proof file: ${filePath} (id: ${item.id})`);
      } else {
        console.warn(`[dev] Proof file missing: ${filePath} (id: ${item.id})`);
      }
      continue;
    }
    const actual = sha256ForFile(filePath);
    if (actual !== item.sha256) {
      if (releaseReady) {
        errors.push(
          `Proof checksum mismatch for ${filePath} (expected ${item.sha256}, got ${actual})`,
        );
      } else {
        console.warn(
          `[dev] Proof checksum mismatch for ${filePath} (id: ${item.id})`,
        );
      }
    }
  }

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  return parsed.data;
}

/** Get proof manifest item by id, or null. Does not validate files (use getProofManifest for that). */
export function getProofManifestById(id: string): ProofManifestItem | null {
  const publicRoot = resolvePublicRoot();
  const manifestPath = path.join(publicRoot, 'proof', 'manifest.json');
  if (!existsSync(manifestPath)) return null;
  const manifest = readJsonFile<unknown>(manifestPath);
  const parsed = proofManifestSchema.safeParse(manifest);
  if (!parsed.success) return null;
  return parsed.data.items.find((item) => item.id === id) ?? null;
}
