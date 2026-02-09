/**
 * Architecture documentation generator.
 *
 * Generates:
 * - docs/architecture/nx-graph.html (via nx graph)
 * - docs/architecture/workspace-map.json (projects and dependencies)
 * - docs/architecture/workspace-map.md (summary)
 * - docs/architecture/.stamp.json (workspace hash and tool versions)
 *
 * Run: npx tsx --tsconfig tsconfig.base.json tools/docs/generate-architecture.ts
 * Check only: npx tsx --tsconfig tsconfig.base.json tools/docs/generate-architecture.ts --check
 */
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = process.cwd();
const ARCH_DIR = path.join(repoRoot, 'docs', 'architecture');
const NX_GRAPH_HTML = path.join(ARCH_DIR, 'nx-graph.html');
const WORKSPACE_MAP_JSON = path.join(ARCH_DIR, 'workspace-map.json');
const WORKSPACE_MAP_MD = path.join(ARCH_DIR, 'workspace-map.md');
const STAMP_JSON = path.join(ARCH_DIR, '.stamp.json');

const CHECK = process.argv.includes('--check');

function workspaceHash(): string {
  const h = createHash('sha256');
  for (const file of ['nx.json', 'package.json', 'pnpm-lock.yaml']) {
    const p = path.join(repoRoot, file);
    if (existsSync(p)) h.update(readFileSync(p, 'utf8'));
  }
  return h.digest('hex');
}

function getToolVersions(): { node: string; pnpm: string; nx: string } {
  const node = process.version;
  let pnpm = '';
  let nx = '';
  try {
    pnpm = execSync('pnpm -v', { encoding: 'utf8', cwd: repoRoot }).trim();
  } catch {
    pnpm = 'unknown';
  }
  try {
    nx = execSync('nx --version', { encoding: 'utf8', cwd: repoRoot }).trim();
  } catch {
    nx = 'unknown';
  }
  return { node, pnpm, nx };
}

interface GraphNode {
  name: string;
  type: string;
  data?: { root?: string; targets?: Record<string, unknown> };
}

interface GraphDep {
  source: string;
  target: string;
  type: string;
}

interface NxGraphJson {
  graph?: {
    nodes?: Record<string, GraphNode>;
    dependencies?: Record<string, GraphDep[]>;
  };
}

function generate(): void {
  if (!existsSync(ARCH_DIR)) mkdirSync(ARCH_DIR, { recursive: true });

  const tempGraphJson = path.join(ARCH_DIR, '.graph-temp.json');

  const tempPath = path.resolve(tempGraphJson);
  execSync(`nx graph --file="${tempPath}"`, {
    cwd: repoRoot,
    stdio: 'inherit',
    encoding: 'utf8',
    shell: true,
  });

  const raw = readFileSync(tempGraphJson, 'utf8');
  const graphData = JSON.parse(raw) as NxGraphJson;
  const { nodes = {}, dependencies = {} } = graphData.graph ?? {};

  const projects = Object.entries(nodes).map(([name, node]) => ({
    name,
    type: node.type ?? 'unknown',
    root: node.data?.root ?? '',
    targetCount: Object.keys(node.data?.targets ?? {}).length,
  }));

  const depList: { source: string; target: string; type: string }[] = [];
  for (const deps of Object.values(dependencies)) {
    for (const d of deps)
      depList.push({ source: d.source, target: d.target, type: d.type });
  }

  const workspaceMap = {
    generatedAt: new Date().toISOString(),
    projects: projects.sort((a, b) => a.name.localeCompare(b.name)),
    dependencies: depList.sort((a, b) =>
      a.source !== b.source
        ? a.source.localeCompare(b.source)
        : a.target.localeCompare(b.target),
    ),
    stats: { projectCount: projects.length, dependencyCount: depList.length },
  };

  writeFileSync(
    WORKSPACE_MAP_JSON,
    JSON.stringify(workspaceMap, null, 2),
    'utf8',
  );

  const md: string[] = [
    '# Workspace map',
    '',
    `Generated at ${workspaceMap.generatedAt}.`,
    '',
    '## Summary',
    '',
    `- **Projects:** ${workspaceMap.stats.projectCount}`,
    `- **Dependencies:** ${workspaceMap.stats.dependencyCount}`,
    '',
    '## Projects',
    '',
    '| Name | Type | Root | Targets |',
    '|------|------|------|---------|',
    ...projects.map(
      (p) => `| ${p.name} | ${p.type} | ${p.root} | ${p.targetCount} |`,
    ),
    '',
    '## Dependencies',
    '',
    '| Source | Target | Type |',
    '|--------|--------|------|',
    ...workspaceMap.dependencies.map(
      (d) => `| ${d.source} | ${d.target} | ${d.type} |`,
    ),
    '',
  ];
  writeFileSync(WORKSPACE_MAP_MD, md.join('\n'), 'utf8');

  const htmlPath = path.resolve(NX_GRAPH_HTML);
  execSync(`nx graph --file="${htmlPath}"`, {
    cwd: repoRoot,
    stdio: 'inherit',
    encoding: 'utf8',
    shell: true,
  });

  const hash = workspaceHash();
  const tools = getToolVersions();
  const stamp = {
    workspaceHash: hash,
    generatedAt: new Date().toISOString(),
    tools,
    outputs: ['nx-graph.html', 'workspace-map.json', 'workspace-map.md'],
  };
  writeFileSync(STAMP_JSON, JSON.stringify(stamp, null, 2), 'utf8');

  try {
    unlinkSync(tempGraphJson);
  } catch {
    // ignore
  }
}

function check(): boolean {
  const required = [
    NX_GRAPH_HTML,
    WORKSPACE_MAP_JSON,
    WORKSPACE_MAP_MD,
    STAMP_JSON,
  ];
  for (const p of required) {
    if (!existsSync(p)) {
      console.error(`Missing output: ${path.relative(repoRoot, p)}`);
      return false;
    }
  }
  const stamp = JSON.parse(readFileSync(STAMP_JSON, 'utf8'));
  const currentHash = workspaceHash();
  if (stamp.workspaceHash !== currentHash) {
    console.error(
      `Architecture outputs are stale: stamp workspaceHash ${stamp.workspaceHash.slice(0, 16)}... != current ${currentHash.slice(0, 16)}.... Run: nx run docs:arch`,
    );
    return false;
  }
  return true;
}

if (CHECK) {
  process.exit(check() ? 0 : 1);
} else {
  generate();
}
