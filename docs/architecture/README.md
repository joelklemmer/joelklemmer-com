# Architecture documentation

This directory holds **auto-generated** architecture outputs. Do not edit these files by hand; they are produced by the `docs:arch` Nx target.

## Outputs

| File                 | Description                                                                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nx-graph.html`      | Interactive project graph (from `nx graph --file=...`). Open in a browser to explore project and dependency graph.                                                                       |
| `workspace-map.json` | Structured list of projects and dependencies: `projects`, `dependencies`, `stats`, and `generatedAt`.                                                                                    |
| `workspace-map.md`   | Human-readable summary: project table, dependency table, and counts.                                                                                                                     |
| `.stamp.json`        | Build stamp: `workspaceHash` (hash of `nx.json`, `package.json`, `pnpm-lock.yaml`), `generatedAt`, and `tools` (node, pnpm, nx versions). Used by `docs:arch:check` to detect staleness. |

## Rules

1. **Generation:** Run `nx run docs:arch` (or `pnpm nx run docs:arch`) to (re)generate all outputs. Requires Node and Nx in the repo.
2. **Freshness:** Run `nx run docs:arch:check` to verify outputs exist and are not stale. Fails if any output is missing or if `workspaceHash` does not match the current workspace (e.g. after changing dependencies or Nx config). Used in the verify chain and CI.
3. **Commit:** Generated files are committed so that CI can run `docs:arch:check` without generating. After changing `nx.json`, `package.json`, or `pnpm-lock.yaml`, run `nx run docs:arch` and commit the updated outputs.

## Nx targets

- **`docs:arch`** — Generates `nx-graph.html`, `workspace-map.json`, `workspace-map.md`, and `.stamp.json` under `docs/architecture/`.
- **`docs:arch:check`** — Exits 0 only if all four outputs exist and `.stamp.json`’s `workspaceHash` matches the current workspace; otherwise exits 1. Part of the verify chain (`web:verify`) and CI.

## Tool

The generator script is `tools/docs/generate-architecture.ts`. It runs `nx graph` for HTML and JSON, derives the workspace map from the graph, and writes the stamp. Check-only mode: `npx tsx --tsconfig tsconfig.base.json tools/docs/generate-architecture.ts --check`.
