# Contact subsystem

## Purpose and anti-spam rationale

The `/contact` page is a **controlled intake** channel for an authority-verification site. It is not a marketing contact form. Goals:

- Provide clear pathways: executive recruiting / CPO, board / advisory, media / press, public record correction, general.
- Reduce spam without CAPTCHAs or new external services: primary method is **mailto** with structured subject lines and required-help text. No email provider or CAPTCHA integration.
- Minimal surface, precise, accessible, localized (en / uk / es / he).

## Pathway registry structure

Contact pathways are governed configuration in **`libs/content/src/lib/contact.ts`**.

- **Exports:** `contactPathways`, `getContactPathways()`, `CONTACT_PATHWAY_IDS`, `ContactPathwayEntry`, `ContactPathwayId`.
- **Stable ids:** `recruiting`, `board`, `media`, `publicRecord`, `general`.
- Each entry has:
  - `id`, `labelKey`, `descriptionKey`, `subjectTemplateKey` (i18n keys; subject templates must not use apostrophes),
  - `recommendedFields` (e.g. `name`, `organization`, `role`, `reason`, `links`),
  - `ctaKey`, `priorityOrder`.

Validation (hard fail):

- **content-validate:** Exactly these ids, unique, sorted by `priorityOrder`.
- **i18n-validate:** `contactSchema` plus every pathway’s `labelKey`, `descriptionKey`, `subjectTemplateKey`, `ctaKey` must exist in all locales’ `contact.json`.

## How to adjust subject templates and guidance

1. **Subject templates:** Edit the string values in `libs/i18n/src/messages/{en,uk,es,he}/contact.json` under `pathways.<id>.subjectTemplate`. Keep them short and role-appropriate; avoid apostrophes in values.
2. **Guidance bullets:** Edit `contact.json` → `guidance.bullets` in each locale.
3. **Pathway labels/descriptions/cta:** Edit the corresponding keys under `pathways.<id>` in each locale.
4. After edits, run `nx run web:content-validate` and `nx run web:i18n-validate`.

## Accessibility notes

- Pathway selector is a **keyboard-accessible radio group** (`role="radiogroup"`), with each option as a labeled card.
- Labels, descriptions, and focus management: each radio has an `aria-describedby` to its description; section headings use `id` and `aria-labelledby`.
- **Focus visible:** Links and controls use `focusRingClass` from `@joelklemmer/a11y`.
- **Reduced motion:** Pathway cards use `motion-reduce:transition-none` so transitions are disabled when the user prefers reduced motion.
- Mailto section uses `aria-live="polite"` so updates (e.g. when changing pathway) are announced when the primary contact method link updates.

## Quality gates to run

- `pnpm nx format:check --all`
- `pnpm nx run web:content-validate`
- `pnpm nx run web:governance-validate`
- `pnpm nx run web:i18n-validate`
- `pnpm nx run web:verify --verbose`

Then ensure repo is clean: `git status --porcelain` (must be empty).

## Optional contact email

To set a pre-filled “To” address for mailto links, configure **`NEXT_PUBLIC_CONTACT_EMAIL`** in the environment. If unset, the mailto link uses `mailto:?subject=...&body=...` so the user’s client opens with subject and body prefilled and no recipient.
