/**
 * Validates .well-known/security.txt per RFC 9116.
 * Required: Contact, Expires. Expires must be a future date.
 */
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

function findSecurityTxtPath(): string {
  const cwds = [process.cwd(), path.join(process.cwd(), '..')];
  for (const cwd of cwds) {
    const p = path.join(
      cwd,
      'apps',
      'web',
      'public',
      '.well-known',
      'security.txt',
    );
    if (existsSync(p)) return p;
  }
  return path.join(
    process.cwd(),
    'apps',
    'web',
    'public',
    '.well-known',
    'security.txt',
  );
}

const filePath = findSecurityTxtPath();

function parseSecurityTxt(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed
      .slice(idx + 1)
      .trim()
      .replace(/\uFEFF/g, '');
    if (key && value) out[key] = value;
  }
  return out;
}

function main(): number {
  if (!existsSync(filePath)) {
    console.error('security.txt not found at', filePath);
    return 1;
  }
  const content = readFileSync(filePath, 'utf-8');
  const fields = parseSecurityTxt(content);

  if (!fields.Contact) {
    console.error('security.txt: missing required field "Contact"');
    return 1;
  }
  if (!fields.Expires) {
    console.error('security.txt: missing required field "Expires"');
    return 1;
  }
  const expiresDate = new Date(fields.Expires);
  if (Number.isNaN(expiresDate.getTime())) {
    console.error('security.txt: "Expires" must be a valid date (RFC 3339)');
    return 1;
  }
  const now = new Date();
  if (expiresDate.getTime() <= now.getTime() + 60000) {
    console.error(
      'security.txt: "Expires" must be a future date (at least 1 minute from now)',
    );
    return 1;
  }
  console.log(
    'security.txt: valid (Contact, Expires present; Expires in future)',
  );
  return 0;
}

process.exit(main());
