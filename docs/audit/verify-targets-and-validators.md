# Verify Targets and Validators — Evidence Log

**Source:** `apps/web/project.json`, `package.json` ci:validate / verify, `.github/workflows/ci.yml`.  
**Captured:** Platform State Audit.

## Verify target (full pipeline)

- **Command:** `pnpm run ci:verify` → `pnpm install --frozen-lockfile && pnpm nx run web:verify --verbose`
- **Definition:** `apps/web/project.json` → targets.verify (nx:run-commands)
- **Steps in order:** clear `.next`, format:check, pnpm audit (critical), lint, security-validate, then all \*-validate targets below (including lighthouse-config-validate), test, build, restore next-env.d.ts, a11y (with SKIP_A11Y_BUILD=1), rate-limit-verify (with SKIP_RATE_LIMIT_BUILD=1)

## CI jobs (evidence from .github/workflows/ci.yml)

| Job         | What runs                                                 | Failure if                                            |
| ----------- | --------------------------------------------------------- | ----------------------------------------------------- |
| verify-fast | format:check, lint, all validators below (including lighthouse-config-validate), web:test | Any step exits non-zero                               |
| build       | nx run web:build, restore next-env.d.ts, git status clean | Build fails or uncommitted changes                    |
| a11y        | nx run web:a11y (RATE_LIMIT_MODE=off), then nx run web:rate-limit-verify (SKIP_RATE_LIMIT_BUILD=1) | A11y violations, rate-limit verification failure, or script failure |
| visual      | nx run web-e2e:visual                                     | Visual regression / presentation-integrity specs fail |
| lighthouse  | build then lhci autorun                                   | Performance/accessibility assertions fail             |

## Validators (nx run web:<target>)

Each runs `npx tsx --tsconfig tsconfig.base.json tools/<script>` unless noted.

| Target                           | Script                              | What it validates                                                                                     | Fails when (evidence from tools/\*.ts)                                         |
| -------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| security-validate                | validate-security-txt.ts            | .well-known/security.txt: Contact, Expires present; Expires future                                    | Missing file, missing Contact/Expires, or Expires not in future (process.exit) |
| content-validate                 | validate-content.ts                 | Content frontmatter, slugs, references                                                                | throw new Error with errors (content validation failed)                        |
| docs-integrity-validate          | validate-docs-integrity.ts          | README per lib/app, required root docs, no broken links in docs, VERIFY targets, ARCHITECTURE current | process.exit(1) on missing README/link/target/arch ref                         |
| governance-validate              | validate-governance.ts              | Governance rules over content/repo                                                                    | throw new Error (governance validation failed)                                 |
| i18n-validate                    | validate-i18n.ts                    | Message keys, placeholders, structure                                                                 | throw new Error (i18n validation failed)                                       |
| pgf-validate                     | validate-pgf.ts                     | PGF (no duplicate headings, CTA rules)                                                                | throw new Error (PGF validation failed)                                        |
| intelligence-validate            | validate-intelligence.ts            | Entity graph, semantic index, no orphans                                                              | process.exit(1) on graph/index errors                                          |
| authority-signals-validate       | validate-authority-signals.ts       | Entity→signals mapping, entropy, topology, no severe collapse                                         | process.exit(1) on loadErrors or validation errors                             |
| experience-intelligence-validate | validate-experience-intelligence.ts | Experience/intelligence surface consistency                                                           | process.exit(1)                                                                |
| frameworks-validate              | validate-frameworks.ts              | Framework content and structure                                                                       | process.exit(1) on errors                                                      |
| aec-validate                     | validate-aec.ts                     | AEC (brief) panel and intent consistency                                                              | process.exit(1) (AEC validation failed)                                        |
| orchestration-validate           | validate-orchestration.ts           | Authority orchestration consistency                                                                   | process.exit(1) (Orchestration validation failed)                              |
| content-os-validate              | validate-content-os.ts              | Content OS meta/CTA, no placeholder in default-locale copy                                            | throw new Error (Content OS validation failed)                                 |
| home-validate                    | validate-home.ts                    | Home: no placeholder in home.json, single H1, required links, heading outline, PGF                    | throw new Error (Home subsystem validation failed)                             |
| sitemap-validate                 | validate-sitemap.ts                 | Sitemap: buildSitemapEntries, required URLs, no duplicates                                            | throw new Error (Sitemap validation failed)                                    |
| image-sitemap-validate           | validate-image-sitemap.ts           | Image sitemap: eligible count ≤ limit, required fields, files exist                                   | throw new Error (Image sitemap validation failed)                              |
| media-manifest-validate          | validate-media-manifest.ts          | Manifest completeness (alt, descriptor, prefix), sitemap eligibility                                  | throw new Error (Media manifest validation failed)                             |
| media-derivatives-validate       | validate-media-derivatives.ts       | Media derivatives presence/consistency                                                                | throw new Error (Media derivatives validation failed)                          |
| media-authority-validate         | validate-media-authority.ts         | Tier C excluded from sitemap-eligible, authority rules                                                | throw new Error (Media authority validation failed)                            |
| visual-contract-validate         | validate-visual-contract.ts         | Visual contract (design tokens / layout)                                                              | throw new Error (Visual contract validation failed)                            |
| lighthouse-config-validate      | validate-lighthouse-configs.ts      | ci.assert.assertions match between lighthouserc.cjs and lighthouserc.serverless.cjs                   | process.exit(1) on drift                                                        |
| seo-validate                     | validate-seo.ts                     | SEO: JSON-LD, sameAs, meta; placeholder env if missing                                                | throw new Error (SEO validation failed)                                        |
| tokens-validate                  | validate-tokens.ts                  | Token file exists, required tokens present (25)                                                       | throw new Error (Tokens file not found / Token completeness failed)            |
| token-drift-validate             | validate-token-drift.ts             | No literal colors / non-token Tailwind in components                                                  | throw new Error (Token drift validation failed)                                |
| authority-program-validate       | validate-authority-program.ts       | Program doc exists, required block, required SEO outputs (sitemap, image sitemap)                     | throw new Error (Program doc missing / invalid / failed)                       |
| authority-constitution-validate  | validate-authority-constitution.ts  | Authority constitution docs/rules                                                                     | process.exit(1)                                                                |
| telemetry-scoring-validate       | validate-telemetry-scoring.ts       | Telemetry event names, decisive-action list, signal count, scoring determinism                        | process.exit(1) or throw                                                       |
| test                             | (inline)                            | `node -e "console.log('No web tests configured')"`                                                    | Never fails                                                                    |
| rate-limit-verify                | test-rate-limit.ts                  | 429 under limit, 429 HTML title/lang, dir=rtl for /he/ (RATE_LIMIT_MODE=always)                       | process.exit(1) on assertion failure                                            |

## E2E / runtime checks

- **web-e2e e2e:** Playwright test (apps/web-e2e). CI uses web-e2e:visual for presentation-integrity + screenshots.
- **web a11y:** tools/run-a11y.ts — Playwright + @axe-core/playwright; report tmp/reports/a11y.json.
- **lighthouse:** lighthouserc.cjs — LCP &lt; 1.8s, CLS ≤ 0.05, INP &lt; 200ms, TBT &lt; 300ms, performance ≥ 0.7, accessibility ≥ 0.9.

## Commands run for this audit

```
pnpm nx show projects
pnpm nx graph --file=docs/audit/nx-graph.json
pnpm nx run web:security-validate   → docs/audit/evidence-security-validate.txt
pnpm nx run web:tokens-validate    → docs/audit/evidence-tokens-validate.txt
```
