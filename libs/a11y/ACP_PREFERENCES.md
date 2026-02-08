# Accessibility Control Panel (ACP) - Preference Storage & Application

## Overview

The Accessibility Control Panel (ACP) is a deterministic, persisted, keyboard-first, WCAG-safe subsystem for managing accessibility preferences. All preferences are stored in `localStorage` and applied consistently across page reloads.

## Preference Storage

All preferences are stored in browser `localStorage` with the following keys:

| Preference      | Storage Key                   | Values                          | Default     |
| --------------- | ----------------------------- | ------------------------------- | ----------- |
| Theme           | `joelklemmer-theme`           | `'light'`, `'dark'`, `'system'` | `'system'`  |
| Contrast        | `joelklemmer-contrast`        | `'default'`, `'high'`           | `'default'` |
| Motion          | `joelklemmer-motion`          | `'default'`, `'reduced'`        | `'default'` |
| Text Size       | `joelklemmer-text-size`       | `'default'`, `'large'`          | `'default'` |
| Underline Links | `joelklemmer-underline-links` | `'true'`, `'false'`             | `'false'`   |

## Application Mechanism

### 1. Initial Application (SSR-Safe)

Preferences are applied immediately via an inline script in `<head>` before CSS loads to prevent flash of unstyled content (FOUC):

**Location**: `apps/web/src/app/layout.tsx`  
**Script**: `apps/web/src/app/theme-script.ts`

The script:

1. Reads all preferences from `localStorage`
2. Applies them to `document.documentElement` as attributes/classes
3. Handles `'system'` theme by detecting OS preference

### 2. Runtime Application

After hydration, React providers maintain and apply preferences:

- **Theme**: `libs/ui/src/lib/ThemeProvider.tsx`
- **Contrast**: `libs/ui/src/lib/ContrastProvider.tsx`
- **ACP Preferences** (Motion, Text Size, Underline Links): `libs/a11y/src/lib/acp-provider.tsx`

Each provider:

1. Initializes from `localStorage` on mount
2. Applies preferences to `document.documentElement`
3. Persists changes to `localStorage` immediately

## CSS Application

Preferences are applied via data attributes and classes on `html` element:

### Theme

- **Attribute**: `data-theme="light"` or `data-theme="dark"`
- **System theme**: No attribute (relies on `@media (prefers-color-scheme: dark)`)
- **CSS**: Theme-aware tokens via `:root[data-theme]` selectors

### Contrast

- **Attribute**: `data-contrast="high"`
- **Default**: No attribute (relies on `@media (prefers-contrast: more)`)
- **CSS**: `:root[data-contrast='high']` selectors

### Motion Reduction

- **Attribute**: `data-motion="reduced"`
- **Class**: `motion-reduce-force` (for compatibility)
- **CSS**:
  - `html[data-motion='reduced'] *` - Reduces all animations/transitions
  - `html.motion-reduce-force *` - Force override for all elements
- **Location**: `apps/web/src/styles/10-base.css` and `apps/web/src/styles/40-utilities.css`

### Text Size

- **Attribute**: `data-text-size="large"`
- **CSS**: `:root[data-text-size='large']` - Updates CSS custom properties
- **Location**: `apps/web/src/styles/40-utilities.css`
- **Tokens Updated**:
  - `--body-analytical-size`
  - `--display-heading-size`
  - `--section-heading-size`
  - `--text-base`, `--text-sm`, `--text-lg`

### Underline Links

- **Attribute**: `data-underline-links="true"`
- **CSS**: `html[data-underline-links='true'] a:not([class*='no-underline'])`
- **Location**: `apps/web/src/styles/10-base.css`
- **Behavior**: Adds `text-decoration: underline` to all links except those with `no-underline` in class name

## Deterministic Application Flow

1. **Page Load**:
   - Inline script in `<head>` applies stored preferences immediately
   - Prevents FOUC

2. **Hydration**:
   - React providers read from `localStorage`
   - Sync state with DOM attributes
   - Listen for system preference changes (theme, contrast)

3. **User Changes**:
   - User toggles preference in ACP
   - Provider updates state
   - Effect applies to DOM immediately
   - Effect persists to `localStorage` immediately

4. **Page Reload**:
   - Cycle repeats from step 1

## Keyboard Navigation

The ACP is fully keyboard accessible:

- **Opening**: Focus moves to first control (theme select)
- **Closing**: Focus returns to trigger button
- **ESC**: Closes panel and returns focus to trigger
- **Tab/Shift+Tab**: Focus wraps within panel (focus trap)
- **All controls**: Accessible via keyboard (selects, checkboxes)

## RTL Support

The ACP works correctly in RTL locales (e.g., Hebrew):

- Panel positioning uses `end-0` (logical property)
- Focus management works identically
- All preferences apply globally regardless of text direction

## Testing

To verify preferences persist:

1. Open ACP (`/en` or `/he`)
2. Toggle each preference
3. Reload page
4. Verify preferences remain applied
5. Check `localStorage` in DevTools to confirm storage

## Files Involved

### Core ACP Logic

- `libs/a11y/src/lib/acp.ts` - Storage and application utilities
- `libs/a11y/src/lib/acp-provider.tsx` - React provider
- `libs/ui/src/lib/AccessibilityPanel.tsx` - UI component

### Theme/Contrast (Separate Providers)

- `libs/ui/src/lib/ThemeProvider.tsx`
- `libs/ui/src/lib/ContrastProvider.tsx`

### Initialization

- `apps/web/src/app/layout.tsx` - Root layout with inline script
- `apps/web/src/app/theme-script.ts` - SSR-safe initialization script

### CSS Application

- `apps/web/src/styles/10-base.css` - Base styles, motion reduction, underline links
- `apps/web/src/styles/40-utilities.css` - Motion reduction override, text size tokens
