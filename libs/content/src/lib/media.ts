import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { z } from 'zod';

const recommendedUseSchema = z.enum([
  'hero',
  'avatar',
  'card',
  'press',
  'books',
]);
const mediaAssetSchema = z.object({
  id: z.string().min(1),
  file: z.string().min(1),
  kind: z.enum(['portrait', 'speaking', 'author', 'identity']),
  descriptor: z.string().min(1),
  recommendedUse: z.array(recommendedUseSchema),
  aspectRatio: z.number(),
  width: z.number(),
  height: z.number(),
  sha256: z.string().min(1),
  alt: z.string().min(1),
});

const mediaManifestSchema = z.object({
  assets: z.array(mediaAssetSchema),
});

export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type MediaManifest = z.infer<typeof mediaManifestSchema>;

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

export function getMediaManifest() {
  const publicRoot = resolvePublicRoot();
  const manifestPath = path.join(publicRoot, 'media', 'manifest.json');
  const manifest = readJsonFile<unknown>(manifestPath);
  const parsed = mediaManifestSchema.safeParse(manifest);
  if (!parsed.success) {
    const issues = formatIssues(parsed.error).join('; ');
    throw new Error(`Invalid media manifest ${manifestPath}: ${issues}`);
  }

  const errors: string[] = [];
  const releaseReady = process.env.RELEASE_READY === '1';

  parsed.data.assets.forEach((asset) => {
    const relativePath = asset.file.startsWith('/')
      ? asset.file.slice(1)
      : asset.file;
    const assetPath = path.join(publicRoot, relativePath);
    if (!existsSync(assetPath)) {
      if (releaseReady) {
        errors.push(`Missing media asset file: ${assetPath}`);
      } else {
        console.warn(
          `[dev] Media asset file missing: ${assetPath} (id: ${asset.id})`,
        );
      }
      return;
    }
    if (releaseReady) {
      const actual = sha256ForFile(assetPath);
      if (actual !== asset.sha256) {
        errors.push(
          `Checksum mismatch for ${assetPath} (expected ${asset.sha256}, got ${actual})`,
        );
      }
    }
  });

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  return parsed.data;
}
