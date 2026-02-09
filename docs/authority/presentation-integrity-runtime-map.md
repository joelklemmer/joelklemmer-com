# Presentation Integrity Layer — Runtime Map

This document describes the **actual** execution paths and integration points for the Presentation Integrity Layer (Phase 2 self-policing). It reflects real code and CI behavior only.

## Overview

The layer automatically detects and fails CI when:

- **A)** Token drift (literal colors, non-token Tailwind, unapproved CSS variables)
- **B)** Theme flicker / incorrect theme pre-paint
- **C)** Layout instability (horizontal scroll, masthead/hero/portrait) across breakpoints
- **D)** Visual regression on critical surfaces
- **E)** RTL regressions (dir, alignment, focus ring)
- **F)** i18n string overflows causing layout breaks
- **G)** Masthead touch-target or focus-ring regressions

## 1. Token drift (A)

| Item                                 | Location / behavior                                                                                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Validator                            | `tools/validate-token-drift.ts`                                                                                                                                               |
| Nx target                            | `web:token-drift-validate` (apps/web/project.json)                                                                                                                            |
| Invocation                           | `npx tsx --tsconfig tsconfig.base.json tools/validate-token-drift.ts`                                                                                                         |
| Integration                          | In `web:validate` and `web:verify`; in `ci:validate` (package.json) and CI workflow (verify-fast job)                                                                         |
| Scanned dirs                         | `apps/web`, `libs` (recursive; excludes node_modules, .next, .git)                                                                                                            |
| File types                           | `.tsx`, `.ts`, `.jsx`, `.js`, `.css`                                                                                                                                          |
| Allowed literal colors               | Only under `libs/tokens/`                                                                                                                                                     |
| Allowed CSS variables outside tokens | Governance list in validator: masthead, content-lane, readable-line-length-app, container-padding-x, typography/text/base/sm/lg, bp-_, lane-_, gutter-inline-_, nav-primary-_ |
| Output                               | File:line + message + snippet; process exit 1 on any violation                                                                                                                |

## 2. Theme pre-paint (B)

| Item       | Location / behavior                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| Tests      | `apps/web-e2e/src/presentation-integrity/theme-prepaint.spec.ts`                                                           |
| Config     | `apps/web-e2e/playwright.visual.config.ts` (testDir: presentation-integrity)                                               |
| Nx target  | `web-e2e:visual`                                                                                                           |
| Route      | `/en`                                                                                                                      |
| Assertions | `data-theme` set before first paint (light + dark colorScheme); background unchanged after ~800ms; no flip after hydration |
| Runtime    | Playwright; colorScheme: 'light' and 'dark' via browser.newContext                                                         |

## 3. Responsive layout stability (C)

| Item        | Location / behavior                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tests       | `apps/web-e2e/src/presentation-integrity/responsive-layout.spec.ts`                                                                                                      |
| Routes      | `/en`, `/en/brief`, `/he`, `/he/brief`                                                                                                                                   |
| Breakpoints | 360×800, 768×1024, 1024×768, 1280×800, 1600×900, 1920×1080                                                                                                               |
| Assertions  | `documentElement.scrollWidth <= clientWidth + 50`; header height bounds; hero title + CTA visible; RTL `html[dir="rtl"]` and `direction: rtl`; main#main-content visible |

## 4. Visual regression (D)

| Item      | Location / behavior                                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Tests     | `apps/web-e2e/src/presentation-integrity/visual-regression.spec.ts`                                                                |
| Snapshots | `apps/web-e2e/__screenshots__/` (home-viewport.png, masthead.png, brief-viewport.png, rtl-home-viewport.png, media-filter-row.png) |
| Config    | `reducedMotion: 'reduce'` per test; viewport 1280×800; clip for full-page shots                                                    |
| Surfaces  | Home top viewport, masthead region, brief top viewport, RTL home, media library filter row                                         |

## 5. RTL and masthead focus (E, G)

| Item       | Location / behavior                                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RTL        | `responsive-layout.spec.ts` (RTL dir + alignment); `i18n-rtl-stress.spec.ts` (en/es/uk/he × viewports, no horizontal scroll; RTL for he; LTR for en/es/uk) |
| Focus ring | `i18n-rtl-stress.spec.ts`: focus ring visible and not clipped on masthead control (mobile + desktop/ultrawide)                                             |

## 6. i18n overflow (F)

| Item       | Location / behavior                                                                                                                     |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Tests      | `apps/web-e2e/src/presentation-integrity/i18n-overflow.spec.ts`                                                                         |
| Locales    | en, uk, es, he                                                                                                                          |
| Assertions | Masthead nav no overflow (360px); primary CTA and hero lede visible and no overlap; no horizontal scroll at 360×800, 768×1024, 1280×800 |

## 7. CI and Nx wiring

| Script / job   | Behavior                                                                                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci:validate`  | format:check, lint, security-validate, then all content/governance/…/token-drift-validate/authority-program-validate/authority-constitution-validate, test |
| `ci:build`     | `nx run web:build`                                                                                                                                         |
| `ci:a11y`      | `nx run web:a11y`                                                                                                                                          |
| `ci:visual`    | `nx run web-e2e:visual`                                                                                                                                    |
| `ci:all`       | ci:validate → ci:build → ci:a11y → ci:visual (sequential)                                                                                                  |
| `ci:verify`    | frozen lockfile + `nx run web:verify --verbose` (authoritative full pipeline)                                                                              |
| GitHub Actions | verify-fast (validators incl. token-drift), build, a11y (needs build), visual (needs build); parallel where possible                                       |

## 8. How to extend

- **New allowed CSS variable:** Add to `ALLOWED_NON_TOKEN_CSS_VARS` in `tools/validate-token-drift.ts` and document in this file or design-constitution.
- **New visual surface:** Add test in `visual-regression.spec.ts` and snapshot under `__screenshots__/`; keep set minimal and high-signal.
- **New breakpoint/route:** Add to `responsive-layout.spec.ts` BREAKPOINTS/ROUTES and to i18n/overflow tests if needed.

## 9. How to validate locally

```bash
pnpm nx run web:token-drift-validate
pnpm nx run web-e2e:visual   # requires port 3000 free or BASE_URL to running app
pnpm run ci:validate
pnpm run ci:all
pnpm run ci:verify
```

For `ci:visual` and `ci:a11y`: ensure port 3000 is free, or set `BASE_URL` to an already-running instance. In CI, each job starts its own server.
