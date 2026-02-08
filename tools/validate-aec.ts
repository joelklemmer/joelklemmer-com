/**
 * AEC validation: no hardcoded user-facing strings in aec lib, all responses structured,
 * no external model calls, only graph/index retrieval used.
 * Additive verify stage: run after frameworks-validate.
 */

import path from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';

const AEC_ROOT = path.join(process.cwd(), 'libs', 'aec', 'src');

/** Patterns that indicate external model/API usage (not comments). */
const FORBIDDEN_PATTERNS = [
  /\b(fetch|axios|got)\s*\(/,
  /(?:^|[^\w])(openai|anthropic|createOpenAI|createAnthropic)(?:[^\w]|$)/,
  /\b(generateText|streamText|generateObject)\s*\(/,
  /api\.openai|api\.anthropic/,
];

/** User-facing strings that must not appear in aec lib (PGF: no marketing). */
const FORBIDDEN_PHRASES = [
  /guarantee|guaranteed/i,
  /!\s*$/m,
  /best in class|#1|number one/i,
  /click here|sign up now|limited time/i,
];

function getTsFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'node_modules')
      files.push(...getTsFiles(full));
    else if (e.isFile() && (e.name.endsWith('.ts') || e.name.endsWith('.tsx')))
      files.push(full);
  }
  return files;
}

const errors: string[] = [];

const files = getTsFiles(AEC_ROOT);
for (const filePath of files) {
  const content = readFileSync(filePath, 'utf-8');
  const rel = path.relative(process.cwd(), filePath);

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(
        `[AEC] Forbidden pattern (no external model/API calls): ${pattern.source} in ${rel}`,
      );
    }
  }

  for (const phrase of FORBIDDEN_PHRASES) {
    if (phrase.test(content)) {
      errors.push(
        `[AEC] Forbidden phrase (PGF tone): ${phrase.source} in ${rel}`,
      );
    }
  }
}

// Ensure retrievalEngine only uses entity graph and semantic index (no other data sources)
const retrievalPath = path.join(AEC_ROOT, 'lib', 'retrievalEngine.ts');
const normalizedRetrievalPath = path.normalize(retrievalPath);
const hasRetrieval = files.some(
  (f) => path.normalize(f) === normalizedRetrievalPath,
);
if (hasRetrieval) {
  const retrievalContent = readFileSync(retrievalPath, 'utf-8');
  if (
    !retrievalContent.includes('EntityGraph') ||
    !retrievalContent.includes('SemanticIndexEntry')
  ) {
    errors.push(
      '[AEC] retrievalEngine must use only EntityGraph and SemanticIndexEntry from @joelklemmer/intelligence.',
    );
  }
  if (
    retrievalContent.includes('fetch(') ||
    retrievalContent.includes('await fetch')
  ) {
    errors.push('[AEC] retrievalEngine must not call fetch.');
  }
}

// Ensure responseFormatter returns structured result (summary, bullets, entityLinks)
const formatterPath = path.join(AEC_ROOT, 'lib', 'responseFormatter.ts');
const hasFormatter = files.some(
  (f) => path.normalize(f) === path.normalize(formatterPath),
);
if (hasFormatter) {
  const formatterContent = readFileSync(formatterPath, 'utf-8');
  if (
    !formatterContent.includes('AECFormattedResult') ||
    !formatterContent.includes('entityLinks') ||
    !formatterContent.includes('bullets')
  ) {
    errors.push(
      '[AEC] responseFormatter must return structured AECFormattedResult with summary, bullets, entityLinks.',
    );
  }
}

if (errors.length > 0) {
  console.error(
    'AEC validation failed:\n' + errors.map((e) => `  ${e}`).join('\n'),
  );
  process.exit(1);
}

console.info(
  '[AEC] Validation passed: no external model calls, structured responses only, graph/index retrieval only.',
);
