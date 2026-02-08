/**
 * Verify proof attachments: manifest files exist, SHA-256 match, labelKeys exist in all locales,
 * and every manifest attachment id is referenced by at least one public record entry.
 * Run as part of content-validate; RELEASE_READY=1 enforces file existence and checksum.
 */
import path from 'node:path';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import matter from 'gray-matter';
import {
  getProofManifest,
  getPublicRecordId,
  publicRecordFrontmatterSchema,
} from '@joelklemmer/content/validate';
import { locales } from '@joelklemmer/i18n';

const repoRoot = process.cwd();
const contentRoot = path.join(repoRoot, 'content');
const publicRecordDir = existsSync(path.join(contentRoot, 'public-record'))
  ? path.join(contentRoot, 'public-record')
  : path.join(contentRoot, 'proof');
const messagesRoot = path.join(repoRoot, 'libs', 'i18n', 'src', 'messages');

function getMdxFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((e) => e.endsWith('.mdx'))
    .map((e) => path.join(dir, e));
}

function loadPublicRecordEntries(): Array<{
  slug: string;
  recordId: string;
  attachmentIds: string[];
  labelKeys: string[];
}> {
  const files = getMdxFiles(publicRecordDir);
  const result: Array<{
    slug: string;
    recordId: string;
    attachmentIds: string[];
    labelKeys: string[];
  }> = [];
  for (const filePath of files) {
    const raw = readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);
    const parsed = publicRecordFrontmatterSchema.safeParse(data);
    if (!parsed.success) continue;
    const recordId = getPublicRecordId(parsed.data);
    const attachments = parsed.data.attachments ?? [];
    result.push({
      slug: parsed.data.slug,
      recordId,
      attachmentIds: attachments.map((a) => a.id),
      labelKeys: attachments.map((a) => a.labelKey),
    });
  }
  return result;
}

function getLabelKeysFromMessages(locale: string): Set<string> {
  const filePath = path.join(messagesRoot, locale, 'publicRecord.json');
  if (!existsSync(filePath)) return new Set();
  const data = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<
    string,
    unknown
  >;
  const labels = (data?.attachments as Record<string, unknown>)?.labels as
    | Record<string, string>
    | undefined;
  if (!labels || typeof labels !== 'object') return new Set();
  return new Set(Object.keys(labels));
}

export function runVerifyProofAttachments(): void {
  const errors: string[] = [];

  let manifest;
  try {
    manifest = getProofManifest();
  } catch (e) {
    errors.push((e as Error).message);
    if (errors.length)
      throw new Error(
        `Proof attachments verification failed:\n- ${errors.join('\n- ')}`,
      );
    return;
  }

  const entries = loadPublicRecordEntries();
  const referencedIds = new Set<string>();
  const usedLabelKeys = new Set<string>();
  for (const e of entries) {
    e.attachmentIds.forEach((id) => referencedIds.add(id));
    e.labelKeys.forEach((k) => usedLabelKeys.add(k));
  }

  for (const item of manifest.items) {
    if (!referencedIds.has(item.id)) {
      errors.push(
        `Proof manifest item id "${item.id}" is not referenced by any public record entry.`,
      );
    }
  }

  for (const entry of entries) {
    for (const labelKey of entry.labelKeys) {
      for (const locale of locales) {
        const keys = getLabelKeysFromMessages(locale);
        if (!keys.has(labelKey)) {
          errors.push(
            `Public record "${entry.slug}" attachment labelKey "${labelKey}" missing in locale "${locale}".`,
          );
        }
      }
    }
  }

  if (errors.length) {
    throw new Error(
      `Proof attachments verification failed:\n- ${errors.join('\n- ')}`,
    );
  }
}

const isRunAsScript = process.argv[1]?.endsWith('verify-proof-attachments.ts');
if (isRunAsScript) {
  try {
    runVerifyProofAttachments();
    console.log('Proof attachments verification passed.');
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
}
