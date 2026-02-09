/**
 * Documentation Integrity Validator (Agent 6).
 *
 * Enforces:
 * - README existence for each libs/* and apps/*
 * - Required root docs presence (README, ARCHITECTURE, VERIFY, AGENTS, CONTRIBUTING)
 * - No broken relative links in docs/**
 * - VERIFY.md only references existing Nx targets (web)
 * - docs/architecture outputs exist and are current (ARCHITECTURE.md + libs/apps it references)
 * - docs/agent overlays validate and resolve (included in docs/** link check)
 *
 * Run with: npx tsx --tsconfig tsconfig.base.json tools/validate-docs-integrity.ts
 * Exit code 1 on any violation (CI fails).
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const join = path.join;
const resolve = path.resolve;
const dirname = path.dirname;
const normalize = path.normalize;
const sep = path.sep;

const repoRoot = process.cwd();
const errors: string[] = [];

// --- 1. README for each libs/* and apps/* ---
function getDirectories(parent: string): string[] {
  if (!existsSync(parent)) return [];
  return readdirSync(parent, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => join(parent, e.name));
}

const libDirs = getDirectories(join(repoRoot, 'libs'));
const appDirs = getDirectories(join(repoRoot, 'apps'));

for (const dir of [...libDirs, ...appDirs]) {
  const readme = join(dir, 'README.md');
  if (!existsSync(readme)) {
    const rel = dir.replace(repoRoot, '').replace(/^[/\\]/, '');
    errors.push(`Missing README: ${rel} (expected README.md)`);
  }
}

// --- 2. Required root docs ---
const requiredRootDocs = [
  'README.md',
  'ARCHITECTURE.md',
  'VERIFY.md',
  'AGENTS.md',
  'CONTRIBUTING.md',
];
for (const name of requiredRootDocs) {
  const full = join(repoRoot, name);
  if (!existsSync(full)) {
    errors.push(`Missing required root doc: ${name}`);
  }
}

// --- 3. Collect all markdown under docs (and root docs) ---
function collectMarkdownFiles(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name.startsWith('.')
    )
      continue;
    if (entry.isDirectory()) {
      out.push(...collectMarkdownFiles(full));
    } else if (entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

const docsDir = join(repoRoot, 'docs');
const docsMd = collectMarkdownFiles(docsDir);
const rootMd = requiredRootDocs
  .map((f) => join(repoRoot, f))
  .filter((p) => existsSync(p));
const allMd = [...rootMd, ...docsMd];

function extractLinks(content: string): string[] {
  const hrefs: string[] = [];
  const re = /\]\s*\(\s*([^)\s]+)(?:\s+["'][^"']*["'])?\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    hrefs.push(m[1].trim());
  }
  return hrefs;
}

// --- 4. No broken relative links in docs/** (and root docs) ---
for (const mdPath of allMd) {
  const content = readFileSync(mdPath, 'utf-8');
  const hrefs = extractLinks(content);
  const fromDir = dirname(mdPath);
  const relativePath = mdPath.replace(repoRoot, '').replace(/^[/\\]/, '');

  for (const href of hrefs) {
    if (/^https?:\/\//i.test(href) || href.startsWith('#')) continue;
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
    if (/^[a-zA-Z]+$/.test(href) && !href.endsWith('.md')) continue;

    const resolved = resolve(fromDir, decodeURIComponent(href));
    const normalized = normalize(resolved);
    let targetPath = normalized;
    const hashIdx = targetPath.indexOf('#');
    if (hashIdx !== -1) targetPath = targetPath.slice(0, hashIdx);

    if (!existsSync(targetPath)) {
      const targetRel = targetPath.replace(repoRoot, '').replace(/^[/\\]/, '');
      errors.push(
        `Broken link in ${relativePath}: ${href} → ${targetRel} (file not found)`,
      );
    }
  }
}

// --- 5. VERIFY.md only references existing Nx targets ---
const verifyPath = join(repoRoot, 'VERIFY.md');
const webProjectPath = join(repoRoot, 'apps', 'web', 'project.json');

if (existsSync(verifyPath) && existsSync(webProjectPath)) {
  const verifyContent = readFileSync(verifyPath, 'utf-8');
  const projectJson = JSON.parse(readFileSync(webProjectPath, 'utf-8')) as {
    targets?: Record<string, unknown>;
  };
  const webTargets = new Set(Object.keys(projectJson.targets ?? {}));

  // Step lines: "5. **security-validate**" or "32. **build**" or "4. **Lint:**" (target is "lint")
  const stepRe = /^\d+\.\s+\*\*([a-z0-9-]+)\*\*/im;
  const lines = verifyContent.split('\n');
  const mentionedTargets = new Set<string>();

  for (const line of lines) {
    const m = line.match(stepRe);
    if (!m) continue;
    const name = m[1];
    // Normalize: "Lint" in text might be "lint" as target
    const targetName = name.toLowerCase();
    if (['clean', 'format', 'audit'].includes(targetName)) continue; // not Nx web targets
    if (targetName === 'lint') {
      mentionedTargets.add('lint');
      continue;
    }
    mentionedTargets.add(name);
  }

  // Also catch "nx run web:XXX" mentions
  const runRe = /nx run web:([a-z0-9-]+)/g;
  let runM: RegExpExecArray | null;
  while ((runM = runRe.exec(verifyContent)) !== null) {
    mentionedTargets.add(runM[1]);
  }

  // Nx plugins can infer targets (e.g. lint from @nx/eslint) not in project.json
  const inferredTargets = new Set(['lint']);
  for (const target of mentionedTargets) {
    if (inferredTargets.has(target) || webTargets.has(target)) continue;
    errors.push(
      `VERIFY.md references Nx target '${target}' but apps/web has no such target`,
    );
  }
}

// --- 6. docs/architecture outputs exist and are current ---
const archPath = join(repoRoot, 'ARCHITECTURE.md');
const docsArchDir = join(repoRoot, 'docs', 'architecture');

if (existsSync(archPath)) {
  const archContent = readFileSync(archPath, 'utf-8');
  // "Current": any libs/<name> or apps/<name> referenced must exist
  const pathRefRe = /(?:libs|apps)\/([a-z0-9-]+)/g;
  const mentioned = new Set<string>();
  let refM: RegExpExecArray | null;
  while ((refM = pathRefRe.exec(archContent)) !== null) {
    mentioned.add(refM[1]);
  }
  for (const name of mentioned) {
    const libPath = join(repoRoot, 'libs', name);
    const appPath = join(repoRoot, 'apps', name);
    if (!existsSync(libPath) && !existsSync(appPath)) {
      errors.push(
        `ARCHITECTURE.md references project '${name}' but neither libs/${name} nor apps/${name} exists`,
      );
    }
  }
}

if (existsSync(docsArchDir)) {
  const entries = readdirSync(docsArchDir, { withFileTypes: true });
  const mdInArch = entries.filter((e) => e.isFile() && e.name.endsWith('.md'));
  for (const e of mdInArch) {
    const full = join(docsArchDir, e.name);
    if (!existsSync(full)) {
      errors.push(`docs/architecture output missing or invalid: ${e.name}`);
    }
  }
}

// --- 7. docs/agent overlays: validate and resolve (already covered by docs/** link check above) ---
// Explicit pass over docs/agent/** and **/agent*.md under docs for clarity (same link rules apply)
const agentOverlayDirs = [join(docsDir, 'agent')];
for (const d of agentOverlayDirs) {
  if (existsSync(d)) {
    const agentMd = collectMarkdownFiles(d);
    for (const mdPath of agentMd) {
      const content = readFileSync(mdPath, 'utf-8');
      const hrefs = extractLinks(content);
      const fromDir = dirname(mdPath);
      const relativePath = mdPath.replace(repoRoot, '').replace(/^[/\\]/, '');
      for (const href of hrefs) {
        if (/^https?:\/\//i.test(href) || href.startsWith('#')) continue;
        if (/^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
        const resolved = resolve(fromDir, decodeURIComponent(href));
        let targetPath = resolved;
        const hashIdx = targetPath.indexOf('#');
        if (hashIdx !== -1) targetPath = targetPath.slice(0, hashIdx);
        if (!existsSync(targetPath)) {
          const targetRel = targetPath
            .replace(repoRoot, '')
            .replace(/^[/\\]/, '');
          errors.push(
            `Broken link in agent overlay ${relativePath}: ${href} → ${targetRel}`,
          );
        }
      }
    }
  }
}

// --- 8. Root README layout table: paths listed must exist ---
const readmePath = join(repoRoot, 'README.md');
if (existsSync(readmePath)) {
  const readme = readFileSync(readmePath, 'utf-8');
  const layoutMatch = readme.match(
    /##\s*Repository layout\s*\n\n\|[^\n]+\|[^\n]+\|\n\|[^\n]+\|[^\n]+\|\n((?:\|[^\n]+\|[^\n]+\|\n)*)/,
  );
  if (layoutMatch) {
    const rows = layoutMatch[1].trim().split('\n');
    for (const row of rows) {
      const cellMatch = row.match(/\|\s*`([^`]+)`\s*\|/);
      if (!cellMatch) continue;
      const pathSpec = cellMatch[1].trim();
      const dirPath = join(
        repoRoot,
        pathSpec.replace(/\*$/, '').split('/').join(sep),
      );
      if (pathSpec.endsWith('/*')) {
        if (!existsSync(dirPath)) {
          errors.push(
            `README Repository layout references non-existent path: ${pathSpec}`,
          );
        }
      } else {
        if (!existsSync(dirPath)) {
          errors.push(
            `README Repository layout references non-existent path: ${pathSpec}`,
          );
        }
      }
    }
  }
}

// --- Report and exit ---
if (errors.length > 0) {
  console.error('Documentation integrity violations:\n');
  for (const e of errors) console.error(' -', e);
  console.error('\nFix the above and re-run. CI will fail on violation.');
  process.exit(1);
}

console.log(
  'Documentation integrity OK: READMEs present, required root docs present, no broken doc links, VERIFY.md targets exist, architecture current.',
);
process.exit(0);
