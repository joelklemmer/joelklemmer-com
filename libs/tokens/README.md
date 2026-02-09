# @joelklemmer/tokens

## System role

Design tokens: CSS custom properties for color, spacing, typography, and layout (e.g. `--color-bg`, `--container-max-width`, `--readable-max-width`). Single source of truth for authority calibration and layout consistency. Consumed by `ui` and global styles; no components, no content.

## Architectural boundaries

- **Tag:** `type:lib`. May depend only on other `type:lib` libraries.
- **No deep imports:** Use `@joelklemmer/tokens` only.
- **Boundary:** Token definitions and CSS only. No React, no routing, no content. Design doctrine is documented in `docs/authority/design-constitution.md`; this lib is the token implementation.

## Public interfaces

- **Root** (`src/index.ts`): Re-exports `./lib/tokens` (typed token API if any).
- **CSS:** `lib/tokens.css` — required token groups (color foundations, spacing, typography) used by validators and app styles.

## Dependency constraints

- No runtime dependencies on other workspace libs. May be imported by `ui` and referenced by `apps/web` styles and `tools/validate-tokens.ts` (file path only).

## Example usage

```ts
import '@joelklemmer/tokens'; // or ensure tokens.css is included in app global styles
```

```css
/* In app or ui */
@import '@joelklemmer/tokens';
/* or reference libs/tokens/src/lib/tokens.css */
```

## Interaction with verify pipeline

- **tokens-validate** (`tools/validate-tokens.ts`): Reads `libs/tokens/src/lib/tokens.css` and asserts required token groups and variables exist. Does not import the lib package.
- **token-drift-validate**: Checks token consistency. Changing token names or groups requires updating validators and design docs.
