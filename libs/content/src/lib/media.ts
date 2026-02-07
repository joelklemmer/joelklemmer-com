import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { z } from 'zod';

const mediaAssetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.string().min(1),
  filename: z.string().min(1),
  version: z.string().min(1),
  date: z.string().min(1),
  sha256: z.string().min(1),
  usageNotes: z.string().min(1),
  altText: z.string().min(1).optional(),
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
    const assetPath = path.join(publicRoot, 'media', asset.filename);
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
    if (asset.type.startsWith('image') && !asset.altText) {
      if (releaseReady) {
        errors.push(`Missing altText for image asset ${asset.id}`);
      } else {
        console.warn(`[dev] Missing altText for image asset ${asset.id}`);
      }
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
