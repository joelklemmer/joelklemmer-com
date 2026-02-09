# Module 01 — Environment

Node version, package manager, repo layout, and how the verify chain runs. Complete this before making code or content changes.

## Commands to run

```bash
node -v
```

Must report v20.19.0 or higher (and below 21). See `package.json` `engines.node`.

```bash
pnpm --version
```

Expect 10.28.2 (or version in `packageManager` in `package.json`).

```bash
pnpm install --frozen-lockfile
```

Install dependencies. Use `--frozen-lockfile` for CI parity; fails if lockfile is out of sync.

```bash
pnpm nx run web:verify --verbose
```

Full verify chain (clean, format, audit, lint, all validators, test, build, restore next-env.d.ts, a11y). Run from repo root.

## Expected outputs

- `node -v`: e.g. `v20.19.0` (no error).
- `pnpm install --frozen-lockfile`: `Done in …`; exit code 0. If lockfile is dirty, exit non-zero and error mentions lockfile.
- `nx run web:verify`: Each step logs; final step is a11y. Success: exit 0. No “skipped” steps; pipeline is sequential.

## Failure modes and corrective actions

| Failure                                | Cause                                  | Corrective action                                                                                                                    |
| -------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `node -v` wrong                        | Wrong Node version                     | Install Node 20.19+ (nvm: `nvm use` per `.nvmrc`, or install from nodejs.org).                                                       |
| `pnpm` not found                       | pnpm not installed                     | `npm install -g pnpm@10.28.2` or use corepack: `corepack enable && corepack prepare pnpm@10.28.2 --activate`.                        |
| `pnpm install` fails (frozen-lockfile) | Lockfile out of sync with package.json | Run `pnpm install` (no frozen) to update lockfile, then commit; or fix package.json and run again.                                   |
| Verify fails at format                 | Prettier/Nx format drift               | Run `pnpm nx format:write` then re-run verify.                                                                                       |
| Verify fails at lint                   | ESLint errors in web app               | Fix reported files per `nx run web:lint`; re-run verify.                                                                             |
| Verify fails at a validator            | Script threw or exited non-zero        | Read the validator output (script name in error). Fix the reported paths/keys/content; run that target alone: `nx run web:<target>`. |
| Verify fails at build                  | Next.js build error                    | Fix TypeScript or build errors in apps/web; ensure env vars used at build time are set (e.g. NEXT_PUBLIC_SITE_URL).                  |
| Verify fails at a11y                   | Axe violations or run-a11y failure     | Address a11y issues reported in tmp/reports/a11y.json or console; re-run `nx run web:a11y` (with prior build).                       |

## Verify targets to run

After environment setup, run the full chain once:

- `nx run web:verify`

No single-target substitute for “environment OK”; verify is the source of truth.

## Documentation updates required

- None for environment-only setup. If you change Node/pnpm requirements, update `package.json` engines and `packageManager`, and [VERIFY.md](../../VERIFY.md) “Environment” section.
