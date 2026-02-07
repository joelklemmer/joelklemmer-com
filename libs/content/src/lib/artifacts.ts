import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { z } from 'zod';

const artifactSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  filename: z.string().min(1),
  version: z.string().min(1),
  date: z.string().min(1),
  sha256: z.string().min(1),
  required: z.boolean(),
  locale: z.string().optional(),
});

const manifestSchema = z.object({
  items: z.array(artifactSchema),
});

export type ArtifactItem = z.infer<typeof artifactSchema>;
export type ArtifactsManifest = z.infer<typeof manifestSchema>;

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

function readJsonFile<T>(filePath: string) {
  const raw = readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

function sha256ForFile(filePath: string) {
  const buffer = readFileSync(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

function formatIssues(err: z.ZodError) {
  return err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
}

export function getArtifactsManifest() {
  const publicRoot = resolvePublicRoot();
  const manifestPath = path.join(publicRoot, 'artifacts', 'manifest.json');
  const manifest = readJsonFile<unknown>(manifestPath);
  const parsed = manifestSchema.safeParse(manifest);
  if (!parsed.success) {
    const issues = formatIssues(parsed.error).join('; ');
    throw new Error(`Invalid artifacts manifest ${manifestPath}: ${issues}`);
  }

  const errors: string[] = [];
  const releaseReady = process.env.RELEASE_READY === '1';

  parsed.data.items.forEach((item) => {
    const artifactPath = path.join(publicRoot, 'artifacts', item.filename);
    if (!existsSync(artifactPath)) {
      if (releaseReady && item.required) {
        errors.push(`Missing required artifact file: ${artifactPath}`);
      } else if (!releaseReady) {
        console.warn(
          `[dev] Optional artifact file missing: ${artifactPath} (id: ${item.id})`,
        );
      }
      return;
    }
    const actual = sha256ForFile(artifactPath);
    if (actual !== item.sha256) {
      if (releaseReady) {
        errors.push(
          `Checksum mismatch for ${artifactPath} (expected ${item.sha256}, got ${actual})`,
        );
      } else if (item.required) {
        console.warn(
          `[dev] Checksum mismatch for required artifact ${artifactPath}`,
        );
      }
    }
  });

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  return parsed.data;
}

export const EXECUTIVE_BRIEF_ARTIFACT_ID = 'executive-brief-pdf';

/** Get a single artifact by id, or null if not found. */
export function getArtifactById(id: string): ArtifactItem | null {
  const manifest = getArtifactsManifest();
  return manifest.items.find((item) => item.id === id) ?? null;
}

/** Executive Brief PDF from manifest; null if not present (e.g. dev placeholder). */
export function getExecutiveBriefArtifact(): ArtifactItem | null {
  return getArtifactById(EXECUTIVE_BRIEF_ARTIFACT_ID);
}
