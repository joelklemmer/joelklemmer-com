# Playbook — Change tokens

Change design tokens in `libs/tokens/src/lib/tokens.css` without breaking tokens-validate or token-drift-validate. Add, rename, or change CSS variables used by the design system.

## 1. Token file location

- **Path:** `libs/tokens/src/lib/tokens.css`. Validators resolve it from process.cwd() (repo root); see `tools/validate-tokens.ts` for candidate paths.
- **Format:** CSS custom properties. Example: `--color-accent: 217 91% 52%;` (space-separated for alpha in some setups). No literal hex in components; use tokens or theme-backed Tailwind.

---

## 2. Required token groups (do not remove)

`tools/validate-tokens.ts` enforces these groups. Changing a variable’s value is fine; removing or renaming a required variable fails.

**Required groups:**

- **color foundations:** `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-border`, `--color-accent`, `--color-focus`
- **spacing:** `--space-4`, `--space-6`, `--container-max-width`, `--readable-max-width`
- **typography:** `--font-sans`, `--display-heading-size`, `--section-heading-size`, `--body-analytical-size`, `--text-base`
- **authority signal:** `--authority-spacing-density`, `--authority-hierarchy-emphasis`, `--authority-motion-restraint`, `--ease-authority`
- **motion:** `--transition-duration-fast`, `--transition-duration-normal`, `--motion-duration-feedback`, `--motion-ease-out`
- **media list thumb:** `--media-thumb-size`

**Commands:**

```bash
nx run web:tokens-validate
```

**Expected output:** Exit 0 (script throws if file missing or any required var missing).

**Failure:** “Token completeness failed” or “Tokens file not found”. **Corrective action:** Restore the variable or fix the path; do not remove a variable that is in REQUIRED_TOKEN_GROUPS unless you update the validator (playbook-add-validator).

---

## 3. Token drift (no literals in components)

`tools/validate-token-drift.ts` scans components for literal colors and non-token Tailwind usage. When you change a token:

- **Use tokens in CSS:** Reference tokens via `var(--token-name)` in stylesheets or Tailwind theme that points to tokens.
- **Do not introduce literals:** No hex/rgb/hsl in component files for colors; no Tailwind arbitrary color values that bypass the theme. If you add a new token and want components to use it, add it to the Tailwind theme in `apps/web/tailwind.config.js` (or equivalent) so classes use the token.

**Commands:**

```bash
nx run web:token-drift-validate
```

**Expected output:** Exit 0; no literal color or disallowed class reported.

**Failure:** Literal color or non-token class in scanned path. **Corrective action:** Replace with token reference or theme-backed class; or extend the validator’s allowlist if the usage is intentional and documented.

---

## 4. Adding a new token (optional)

- Add the variable to `libs/tokens/src/lib/tokens.css`. If it should be required for every build, add it to `REQUIRED_TOKEN_GROUPS` in `tools/validate-tokens.ts` and run tokens-validate.
- If components should use it via Tailwind, add it to the theme in `apps/web/tailwind.config.js` (e.g. `colors`, `spacing`, `fontSize`) so that Tailwind classes resolve to the token and token-drift does not flag them.

**Commands:**

```bash
nx run web:tokens-validate
nx run web:token-drift-validate
```

---

## Verify targets to run

```bash
nx run web:tokens-validate
nx run web:token-drift-validate
nx run web:verify
```

---

## Documentation updates required

- **New required token:** Update REQUIRED_TOKEN_GROUPS in `tools/validate-tokens.ts` and document in [docs/quality-gates.md](../quality-gates.md). Semantic meaning in [libs/tokens README](../../libs/tokens/README.md) or [docs/authority/theme-spec.md](../authority/theme-spec.md).
- **Removed or renamed token:** Update all consumers (styles, Tailwind theme, components); then update validate-tokens if the variable was required. Document in theme-spec or tokens README.
