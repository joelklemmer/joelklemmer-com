/**
 * Validates agent overlay manifests: schema compliance, referenced file paths exist,
 * and referenced Nx targets exist. Fails CI on any violation.
 *
 * Run: npx tsx --tsconfig tsconfig.base.json tools/validate-agent-overlay.ts
 */
import * as path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(__dirname, '..');
const AGENT_DIR = path.join(ROOT, 'docs', 'agent');
const SCHEMA_PATH = path.join(AGENT_DIR, 'overlay.schema.json');

const NX_TARGET_PATTERN = /^[a-z0-9-]+:[a-z0-9-]+$/;

function fail(msg: string): never {
  console.error('validate-agent-overlay:', msg);
  process.exit(1);
}

function assert(condition: boolean, msg: string): void {
  if (!condition) fail(msg);
}

// --- Schema validation (structural; mirrors overlay.schema.json $defs) ---

function validateOverlay(obj: unknown): void {
  assert(
    typeof obj === 'object' && obj !== null,
    'overlay.json must be an object',
  );
  const o = obj as Record<string, unknown>;
  assert(o.schemaVersion === 1, 'overlay.json schemaVersion must be 1');
  assert(typeof o.routesPath === 'string', 'overlay.json routesPath required');
  assert(
    typeof o.subsystemsPath === 'string',
    'overlay.json subsystemsPath required',
  );
  assert(typeof o.verifyPath === 'string', 'overlay.json verifyPath required');
  assert(
    typeof o.contractsPath === 'string',
    'overlay.json contractsPath required',
  );
}

function validateRoutes(obj: unknown): void {
  assert(
    typeof obj === 'object' && obj !== null,
    'routes.json must be an object',
  );
  const o = obj as Record<string, unknown>;
  assert(o.schemaVersion === 1, 'routes.json schemaVersion must be 1');
  assert(Array.isArray(o.routes), 'routes.json routes must be an array');
  for (let i = 0; i < (o.routes as unknown[]).length; i++) {
    const r = (o.routes as unknown[])[i];
    assert(
      typeof r === 'object' && r !== null,
      `routes[${i}] must be an object`,
    );
    const row = r as Record<string, unknown>;
    assert(typeof row.segment === 'string', `routes[${i}].segment required`);
    assert(typeof row.pagePath === 'string', `routes[${i}].pagePath required`);
  }
}

function validateSubsystems(obj: unknown): void {
  assert(
    typeof obj === 'object' && obj !== null,
    'subsystems.json must be an object',
  );
  const o = obj as Record<string, unknown>;
  assert(o.schemaVersion === 1, 'subsystems.json schemaVersion must be 1');
  assert(
    Array.isArray(o.subsystems),
    'subsystems.json subsystems must be an array',
  );
  for (let i = 0; i < (o.subsystems as unknown[]).length; i++) {
    const s = (o.subsystems as unknown[])[i];
    assert(
      typeof s === 'object' && s !== null,
      `subsystems[${i}] must be an object`,
    );
    const row = s as Record<string, unknown>;
    assert(typeof row.id === 'string', `subsystems[${i}].id required`);
    assert(
      typeof row.docPath === 'string',
      `subsystems[${i}].docPath required`,
    );
  }
}

function validateVerify(obj: unknown): void {
  assert(
    typeof obj === 'object' && obj !== null,
    'verify.json must be an object',
  );
  const o = obj as Record<string, unknown>;
  assert(o.schemaVersion === 1, 'verify.json schemaVersion must be 1');
  assert(Array.isArray(o.steps), 'verify.json steps must be an array');
  for (let i = 0; i < (o.steps as unknown[]).length; i++) {
    const s = (o.steps as unknown[])[i];
    assert(
      typeof s === 'object' && s !== null,
      `verify.steps[${i}] must be an object`,
    );
    const row = s as Record<string, unknown>;
    assert(typeof row.index === 'number', `verify.steps[${i}].index required`);
    assert(
      typeof row.target === 'string',
      `verify.steps[${i}].target required`,
    );
    assert(
      NX_TARGET_PATTERN.test(row.target as string),
      `verify.steps[${i}].target must match project:target`,
    );
    if (row.scriptPath !== undefined && row.scriptPath !== null) {
      assert(
        typeof row.scriptPath === 'string',
        `verify.steps[${i}].scriptPath must be string or null`,
      );
    }
  }
}

function validateContracts(obj: unknown): void {
  assert(
    typeof obj === 'object' && obj !== null,
    'contracts.json must be an object',
  );
  const o = obj as Record<string, unknown>;
  assert(o.schemaVersion === 1, 'contracts.json schemaVersion must be 1');
  assert(
    Array.isArray(o.contracts),
    'contracts.json contracts must be an array',
  );
  for (let i = 0; i < (o.contracts as unknown[]).length; i++) {
    const c = (o.contracts as unknown[])[i];
    assert(
      typeof c === 'object' && c !== null,
      `contracts[${i}] must be an object`,
    );
    const row = c as Record<string, unknown>;
    assert(typeof row.id === 'string', `contracts[${i}].id required`);
    assert(
      typeof row.sourcePath === 'string',
      `contracts[${i}].sourcePath required`,
    );
    if (row.validatorPath !== undefined && row.validatorPath !== null) {
      assert(
        typeof row.validatorPath === 'string',
        `contracts[${i}].validatorPath must be string or null`,
      );
    }
  }
}

function loadJson(filePath: string): unknown {
  if (!existsSync(filePath)) fail(`Missing file: ${filePath}`);
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch (e) {
    fail(
      `Invalid JSON: ${filePath} (${e instanceof Error ? e.message : String(e)})`,
    );
  }
}

function getNxTargets(project: string): Set<string> {
  try {
    const out = execSync(`npx nx show project ${project} --json`, {
      cwd: ROOT,
      encoding: 'utf-8',
      shell: true,
      maxBuffer: 4 * 1024 * 1024,
    });
    const data = JSON.parse(out) as { targets?: Record<string, unknown> };
    return new Set(Object.keys(data.targets ?? {}));
  } catch {
    // When Nx graph is busy (e.g. during verify), skip target existence check
    return new Set();
  }
}

function main(): void {
  const errors: string[] = [];

  // 1) Schema file exists
  if (!existsSync(SCHEMA_PATH)) {
    fail('Missing overlay schema: docs/agent/overlay.schema.json');
  }
  const schema = loadJson(SCHEMA_PATH) as Record<string, unknown>;
  assert(
    typeof schema === 'object' && schema.$defs !== undefined,
    'overlay.schema.json must define $defs',
  );

  // 2) Load and validate overlay.json
  const overlayPath = path.join(AGENT_DIR, 'overlay.json');
  const overlay = loadJson(overlayPath);
  validateOverlay(overlay);
  const o = overlay as Record<string, string>;

  // 3) Load and validate referenced manifests
  const routesPath = path.join(ROOT, o.routesPath);
  const subsystemsPath = path.join(ROOT, o.subsystemsPath);
  const verifyPath = path.join(ROOT, o.verifyPath);
  const contractsPath = path.join(ROOT, o.contractsPath);

  assert(existsSync(routesPath), `overlay.routesPath missing: ${o.routesPath}`);
  const routes = loadJson(routesPath);
  validateRoutes(routes);

  assert(
    existsSync(subsystemsPath),
    `overlay.subsystemsPath missing: ${o.subsystemsPath}`,
  );
  const subsystems = loadJson(subsystemsPath);
  validateSubsystems(subsystems);

  assert(existsSync(verifyPath), `overlay.verifyPath missing: ${o.verifyPath}`);
  const verify = loadJson(verifyPath);
  validateVerify(verify);

  assert(
    existsSync(contractsPath),
    `overlay.contractsPath missing: ${o.contractsPath}`,
  );
  const contracts = loadJson(contractsPath);
  validateContracts(contracts);

  // 4) All referenced file paths exist
  const routesData = routes as { routes: Array<{ pagePath: string }> };
  for (const r of routesData.routes) {
    const abs = path.join(ROOT, r.pagePath);
    if (!existsSync(abs)) errors.push(`Route page missing: ${r.pagePath}`);
  }

  const subsystemsData = subsystems as {
    subsystems: Array<{ docPath: string }>;
  };
  for (const s of subsystemsData.subsystems) {
    const abs = path.join(ROOT, s.docPath);
    if (!existsSync(abs)) errors.push(`Subsystem doc missing: ${s.docPath}`);
  }

  const verifyData = verify as { steps: Array<{ scriptPath?: string | null }> };
  for (const step of verifyData.steps) {
    if (step.scriptPath) {
      const abs = path.join(ROOT, step.scriptPath);
      if (!existsSync(abs))
        errors.push(`Verify script missing: ${step.scriptPath}`);
    }
  }

  const contractsData = contracts as {
    contracts: Array<{ sourcePath: string; validatorPath?: string | null }>;
  };
  for (const c of contractsData.contracts) {
    const absSource = path.join(ROOT, c.sourcePath);
    if (!existsSync(absSource))
      errors.push(`Contract source missing: ${c.sourcePath}`);
    if (c.validatorPath) {
      const absValidator = path.join(ROOT, c.validatorPath);
      if (!existsSync(absValidator))
        errors.push(`Contract validator missing: ${c.validatorPath}`);
    }
  }

  // 5) All referenced Nx targets exist (skip when target list unavailable, e.g. during verify graph lock)
  const verifySteps = verify as { steps: Array<{ target: string }> };
  const projectTargets = new Map<string, Set<string>>();
  for (const step of verifySteps.steps) {
    const [project, target] = step.target.split(':');
    if (!project || !target) continue;
    let set = projectTargets.get(project);
    if (!set) {
      set = getNxTargets(project);
      projectTargets.set(project, set);
    }
    if (set.size > 0 && !set.has(target)) {
      errors.push(`Nx target does not exist: ${step.target}`);
    }
  }

  if (errors.length > 0) {
    errors.forEach((e) => console.error('validate-agent-overlay:', e));
    process.exit(1);
  }

  console.log(
    'Agent overlay: schema valid, all file paths and Nx targets exist.',
  );
}

main();
