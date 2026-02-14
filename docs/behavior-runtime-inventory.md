# Behavior Runtime Inventory (Step 0 + Step 1)

## 0) REPO REALITY CHECK

### a) Header shell/nav layout

| File                                                         | Responsibility                                                                                                                                             |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `libs/shell/src/lib/ServerShell.tsx`                         | Masthead bar, nav links (desktop + mobile), main, footer. Grid layout `grid-cols-[auto,1fr,auto]`. Mobile uses native `<details>/<summary>` for hamburger. |
| `apps/web/src/app/[locale]/layout.tsx`                       | Composes ServerShell; passes navItems, footerContent, headerDeferredSlot. Does NOT import client modules directly.                                         |
| `apps/web/src/app/[locale]/_deferred/HeaderDeferredSlot.tsx` | Server wrapper; fetches messages and passes to HeaderControlsClient.                                                                                       |

### b) Header controls (theme/language/accessibility)

| File                                          | Responsibility                                                                                           |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `libs/shell/src/lib/HeaderControlsClient.tsx` | Client island: ThemeToggle, LanguageDropdown (portal), AccessibilityDropdown (wraps AccessibilityPanel). |
| `libs/ui/src/lib/ThemeProvider.tsx`           | Theme state; delegates to BehaviorRuntime.                                                               |
| `libs/ui/src/lib/ContrastProvider.tsx`        | Contrast state; delegates to BehaviorRuntime.                                                            |
| `libs/ui/src/lib/ThemeToggle.tsx`             | Sun/Moon icon per resolved theme.                                                                        |
| `libs/ui/src/lib/AccessibilityPanel.tsx`      | Settings icon; contrast, motion, text size, underline links. Inline dropdown (not portal).               |
| `libs/a11y/src/lib/acp-provider.tsx`          | Motion, text size, underline links; delegates to BehaviorRuntime.                                        |

### c) Consent banner SSR and client wiring

| File                                                             | Responsibility                                                                  |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `libs/compliance/src/lib/ConsentBannerSSR.tsx`                   | Server-rendered banner with data-consent-action buttons.                        |
| `apps/web/public/deferred/islands.js`                            | Delegated click handlers for accept/reject/details.                             |
| `apps/web/src/app/[locale]/layout.tsx`                           | Conditionally renders ConsentBannerSSR when `!initialConsentState?.choiceMade`. |
| `apps/web/src/app/[locale]/_deferred/DeferredIslands.server.tsx` | Injects islands.js script; exposes `__INITIAL_ANALYTICS_CONSENT__`.             |

### d) islands.js (current behavior engines)

| File                                  | Responsibility                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | ------ | ------------------------------------- |
| `apps/web/public/deferred/islands.js` | **Consent only.** No theme, language, or accessibility. Binds `[data-consent-action="accept | reject | details"]`; masthead focus-in scroll. |

### UI primitives available (no new dependencies)

| Primitive                    | Location           | Use                                                                            |
| ---------------------------- | ------------------ | ------------------------------------------------------------------------------ |
| `createPortal`               | `react-dom`        | Portals content to `document.body`. Used by LanguageDropdown.                  |
| Native `<details>/<summary>` | ServerShell        | Mobile nav hamburger (zero-JS open/close).                                     |
| Inline `absolute` dropdown   | AccessibilityPanel | Contrast/motion/text/underline panel. **Causes clipping**; should be portaled. |

**shadcn DropdownMenu and Sheet:** NOT in repo. Use `createPortal` for menus; mobile nav already uses `<details>`. No Radix/shadcn in package.json.

---

## 1) INVENTORY: Keys and data-\* attributes

### islands.js

| Key                     | Type      | Value / Notes                           |
| ----------------------- | --------- | --------------------------------------- |
| `consent`               | Cookie    | v2 base64 JSON: `{v,t,c,cat,pur,model}` |
| `BANNER_ID`             | DOM id    | `consent-banner`                        |
| `MAIN_CONTENT_ID`       | DOM id    | `main-content`                          |
| `data-consent-action`   | data-attr | `accept`, `reject`, `details`           |
| `data-preferences-href` | data-attr | Preferences page URL                    |

**documentElement data-\*:** None (consent does not set root attributes).

### Root layout (apps/web/src/app/layout.tsx)

| Cookie                 | data-\* attribute                |
| ---------------------- | -------------------------------- |
| `joelklemmer-theme`    | `data-theme` (light/dark/system) |
| `joelklemmer-contrast` | `data-contrast` (high or absent) |
| `joelklemmer-density`  | `data-density` (on/off)          |
| `evaluator_mode`       | `data-evaluator`                 |

### ACP (libs/a11y, libs/behavior-runtime)

| Storage      | Key                           | data-\* attribute                          |
| ------------ | ----------------------------- | ------------------------------------------ |
| localStorage | `joelklemmer-motion`          | `data-motion`, `motion-reduce-force` class |
| localStorage | `joelklemmer-text-size`       | `data-text-size`                           |
| localStorage | `joelklemmer-underline-links` | `data-underline-links`                     |

### Compliance (consent v2)

| Storage      | Key               |
| ------------ | ----------------- |
| Cookie       | `consent`         |
| localStorage | `consent_receipt` |

---

## Preserved key map (BehaviorRuntime)

| Purpose         | Cookie                 | localStorage                   | data-\*                              |
| --------------- | ---------------------- | ------------------------------ | ------------------------------------ |
| Theme           | `joelklemmer-theme`    | —                              | `data-theme`                         |
| Contrast        | `joelklemmer-contrast` | —                              | `data-contrast`                      |
| Density         | `joelklemmer-density`  | —                              | `data-density`                       |
| Evaluator       | `evaluator_mode`       | —                              | `data-evaluator`                     |
| Motion          | —                      | `joelklemmer-motion`           | `data-motion`, `motion-reduce-force` |
| Text size       | —                      | `joelklemmer-text-size`        | `data-text-size`                     |
| Underline links | —                      | `joelklemmer-underline-links`  | `data-underline-links`               |
| Consent         | `consent`              | `consent_receipt` (compliance) | —                                    |
