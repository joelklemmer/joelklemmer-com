# @joelklemmer/ui

## System role

Shared UI primitives: layout (Box, Container, FullBleed, PageFrame), shell (Header, Nav, Shell), theme (ThemeProvider, ThemeToggle, ContrastProvider), language (LanguageSwitcher, LanguageSwitcherPopover), and authority/briefing surfaces (AuthoritySurface, PortraitImage, AccessibilityPanel, ContextualPanel, ClaimProofMapView, WhatMattersBlock). No route-level screens; consumed by `sections` and `screens`. User-facing strings must use next-intl (enforced by lint); no hardcoded copy in this lib.

## Architectural boundaries

- **Tags:** `type:lib`, `type:ui`. May depend only on other `type:lib` libraries.
- **No deep imports:** Consumers use `@joelklemmer/ui` only. Route files in `apps/web` must not import this lib; they compose only `@joelklemmer/screens` and `@joelklemmer/sections`.
- **Boundary:** Presentational and layout components plus theme/a11y/language controls. No content loading, no route definitions. Responsiveness and lanes follow `docs/authority/responsiveness-constitution.md` and `docs/authority/responsive-contract.md`.

## Public interfaces

- **Root** (`src/index.ts`): Re-exports `./lib/ui`.
- **ui.ts:** Box, AuthoritySurface, Container, FullBleed, Header, LanguageSwitcher, LanguageSwitcherPopover, Nav, PageFrame, Shell, ThemeProvider, ThemeToggle, ContrastProvider, AccessibilityPanel, PortraitImage, ContextualPanel, ClaimProofMapView, WhatMattersBlock (and their prop types).

## Dependency constraints

- Depends only on `type:lib` (e.g. `tokens`, `i18n`, `a11y`). No dependency on `content`, `screens`, or `sections` to avoid circular dependency; sections/screens depend on ui.

## Example usage

```tsx
import { Shell, Header, Container, ThemeProvider } from '@joelklemmer/ui';

<ThemeProvider>
  <Shell>
    <Header />
    <Container variant="readable">{children}</Container>
  </Shell>
</ThemeProvider>;
```

## Interaction with verify pipeline

- No validator in `tools/` imports this lib directly. Verify runs lint (which enforces no hardcoded user-facing strings and route-file import rules), build, and a11y; UI is exercised indirectly. Changing component contracts may affect sections/screens and e2e/presentation-integrity tests.
