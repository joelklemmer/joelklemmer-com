# @joelklemmer/a11y

## System role

Provides accessibility utilities and Accessible Content Preferences (ACP): contrast, motion, and reduced-motion support. Used by the app shell and components to respect user preferences and WCAG-aligned behavior. Does not implement route-level UI; consumed by `ui` and app layout.

## Architectural boundaries

- **Tag:** `type:lib`. May depend only on other `type:lib` libraries (see repo boundary enforcement in root `eslint.config.mjs`).
- **No deep imports:** Consumers must import from `@joelklemmer/a11y` only, not `@joelklemmer/a11y/*`.
- **Scope:** A11y helpers and ACP provider/context. No content, no routing, no SEO.

## Public interfaces

- **Root** (`src/index.ts`): `a11y` helpers, `acp` utilities, `ACPProvider`, `useACP`.

## Dependency constraints

- Depends only on libraries tagged `type:lib` (e.g. React, next-intl if used). No dependency on `content`, `screens`, `sections`, or app routes.

## Example usage

```tsx
import { ACPProvider, useACP } from '@joelklemmer/a11y';

// In layout
<ACPProvider>
  <App />
</ACPProvider>;

// In component
const { reducedMotion } = useACP();
```

## Interaction with verify pipeline

- **`web:a11y`** runs Playwright a11y tests against the built site; it does not import this library directly (tests run in browser). The app composes `ACPProvider` and a11y-aware components from `@joelklemmer/ui` that use this lib.
- No dedicated validator in `tools/` for this lib; accessibility is enforced by `web:a11y` and PGF/governance validators that assume a11y contracts are satisfied by usage.
