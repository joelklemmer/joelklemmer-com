# Theme & Accessibility System Documentation

**Date:** 2026-02-08  
**Status:** ✅ Complete  
**Scope:** Theme system, high-contrast mode, and accessibility controls

---

## Overview

This document describes the theme and accessibility system implementation, including light/dark themes, high-contrast mode, and the accessibility control panel. The system is designed to be SSR-safe, WCAG AA+ compliant, and fully accessible.

---

## 1. Theme System

### Architecture

The theme system provides three modes:

- **Light**: Explicit light theme
- **Dark**: Explicit dark theme
- **System**: Respects `prefers-color-scheme` media query

### Components

#### ThemeProvider (`libs/ui/src/lib/ThemeProvider.tsx`)

- **Purpose**: Context provider for theme state management
- **Features**:
  - SSR-safe hydration (prevents FOUC)
  - localStorage persistence (`joelklemmer-theme`)
  - System preference detection and listening
  - Applies `data-theme` attribute to `<html>` element

**Key Functions:**

- `getSystemTheme()`: Detects system preference via `matchMedia('(prefers-color-scheme: dark)')`
- `getStoredTheme()`: Retrieves stored preference from localStorage
- `applyTheme()`: Sets `data-theme` attribute on document root

**State Management:**

- `theme`: Current theme preference ('light' | 'dark' | 'system')
- `resolvedTheme`: Computed theme ('light' | 'dark')
- `mounted`: SSR-safe flag to prevent hydration mismatches

#### ThemeToggle (`libs/ui/src/lib/ThemeToggle.tsx`)

- **Purpose**: Minimal button component for cycling through themes
- **Features**:
  - Cycles: Light → Dark → System → Light
  - Icon changes based on current theme
  - Fully keyboard accessible
  - Uses `focusRingClass` for focus visibility

### CSS Variables & Tokens

Theme tokens are defined in `libs/tokens/src/lib/tokens.css`:

**Light Theme (default):**

```css
:root {
  --color-bg: 222 14% 95%;
  --color-surface: 222 10% 100%;
  --color-text: 222 26% 9%;
  --color-border: 222 12% 84%;
  --color-accent: 218 48% 34%;
  --color-focus: 218 58% 38%;
  /* ... */
}
```

**Dark Theme:**

```css
:root[data-theme='dark'],
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: 222 20% 7%;
    --color-surface: 222 18% 11%;
    --color-text: 220 14% 96%;
    --color-border: 222 12% 20%;
    --color-accent: 212 64% 54%;
    --color-focus: 212 68% 58%;
    /* ... */
  }
}
```

**Tailwind Integration:**
Tokens are exposed via Tailwind config (`apps/web/tailwind.config.js`):

- `bg-bg`, `bg-surface`, `text-text`, `border-border`, `text-accent`, `ring-focus`

### SSR-Safe Persistence

**Root Layout Script** (`apps/web/src/app/layout.tsx`):

- Inline script runs before React hydration
- Reads localStorage and applies theme immediately
- Prevents Flash of Unstyled Content (FOUC)
- Handles errors gracefully (try/catch)

**Implementation:**

```javascript
const theme = localStorage.getItem('joelklemmer-theme');
if (theme && theme !== 'system') {
  document.documentElement.setAttribute('data-theme', theme);
}
```

**Hydration Safety:**

- `ThemeProvider` uses `mounted` state to prevent SSR/client mismatches
- Initial state is 'system' (safe default)
- Only applies stored theme after mount

---

## 2. High-Contrast Mode (WCAG AA+)

### Architecture

High-contrast mode increases contrast ratios, strengthens focus indicators, and ensures border visibility to meet WCAG AA+ standards.

### Components

#### ContrastProvider (`libs/ui/src/lib/ContrastProvider.tsx`)

- **Purpose**: Context provider for contrast mode management
- **Features**:
  - Two modes: 'default' | 'high'
  - Respects system preference (`prefers-contrast: more`)
  - localStorage persistence (`joelklemmer-contrast`)
  - Applies `data-contrast="high"` attribute

**Key Functions:**

- `getSystemContrast()`: Detects system preference via `matchMedia('(prefers-contrast: more)')`
- `getStoredContrast()`: Retrieves stored preference
- `applyContrast()`: Sets `data-contrast` attribute

### CSS Implementation

**High-Contrast Tokens** (`libs/tokens/src/lib/tokens.css`):

```css
:root[data-contrast='high'] {
  /* Maximum contrast: pure black/white */
  --color-bg: 0 0% 100%;
  --color-surface: 0 0% 100%;
  --color-text: 0 0% 0%;
  --color-border: 0 0% 0%;
  --color-border-subtle: 0 0% 0%;

  /* Strengthened focus ring */
  --focus-ring-width: 3px;
  --focus-ring-offset: 3px;
  --color-focus: 217 100% 40%;

  /* Stronger borders */
  --authority-card-glow: 0 0 0 2px hsl(var(--color-border));
  --authority-soft-glow: 0 0 0 2px hsl(var(--color-border));
  --authority-surface-elevation: 0 1px 2px hsl(var(--color-border) / 1);
}
```

**System Preference Support:**

```css
@media (prefers-contrast: more) {
  :root:not([data-contrast]) {
    /* Same tokens as above */
  }
}
```

**Focus Ring Enhancement** (`apps/web/src/styles/10-base.css`):

```css
:root[data-contrast='high'] :focus-visible {
  outline-width: 3px;
  outline-offset: 3px;
  outline-style: solid;
}
```

**Tailwind Focus Ring** (`libs/a11y/src/lib/a11y.ts`):

- Enhanced with high-contrast variants:
  - `data-[contrast=high]:focus-visible:ring-4`
  - `data-[contrast=high]:focus-visible:ring-offset-3`

### WCAG AA+ Compliance

- **Contrast Ratios**: Pure black on white (21:1) exceeds AA+ requirements
- **Focus Indicators**: 3px solid outline with 3px offset ensures visibility
- **Border Visibility**: All borders set to 100% opacity (2px width)
- **Text Contrast**: Muted text set to 15% lightness for readability

---

## 3. Accessibility Control Panel

### Component: AccessibilityPanel

**Location:** `libs/ui/src/lib/AccessibilityPanel.tsx`

**Purpose:** Minimal, accessible control panel for accessibility preferences

### Features

#### 1. Minimal UI

- Small icon button (8x8, ♿ emoji)
- Compact popover (w-64, 256px)
- No marketing styling
- Positioned in header controls

#### 2. Controls

**Theme Selection:**

- Dropdown: Light / Dark / System
- Integrated with `ThemeProvider`
- Persists to localStorage

**Contrast Toggle:**

- Dropdown: Default / High
- Integrated with `ContrastProvider`
- Persists to localStorage

**Reduce Motion:**

- Checkbox toggle
- Applies `motion-reduce-force` class to `<html>`
- Persists via class detection (no localStorage key)

**Text Size:**

- Dropdown: Default / Large
- Applies `data-text-size="large"` attribute
- Persists to localStorage (`joelklemmer-text-size`)
- CSS scales typography tokens (see `apps/web/src/styles/40-utilities.css`)

**Underline Links:**

- Checkbox toggle
- Applies `data-underline-links="true"` attribute
- Persists to localStorage (`joelklemmer-underline-links`)

#### 3. Accessibility Features

**Keyboard Navigation:**

- ✅ Tab to focus trigger button
- ✅ Enter/Space to open panel
- ✅ Esc to close panel
- ✅ Tab cycles through controls
- ✅ Focus trap when open
- ✅ Focus returns to trigger on close

**ARIA Attributes:**

- `aria-expanded`: Indicates panel state
- `aria-controls`: Links trigger to panel
- `aria-haspopup="true"`: Indicates popover
- `role="dialog"`: Panel is a dialog
- `aria-modal="true"`: Panel is modal
- `aria-labelledby`: Links panel to trigger
- All form controls have proper labels

**RTL Support:**

- Uses logical properties (`end-0` instead of `right-0`)
- Popover positions correctly in RTL layouts
- All text respects `dir` attribute

**Focus Management:**

- Focus trap implemented via `useEffect` and keyboard event listeners
- First control receives focus when panel opens
- Trigger receives focus when panel closes

### Integration

**Layout Integration** (`apps/web/src/app/[locale]/layout.tsx`):

```tsx
<ThemeProvider>
  <ContrastProvider>
    <Shell
      headerContent={
        <HeaderSection
          headerControls={
            <>
              <LanguageSwitcherPopover />
              <ThemeToggle />
              <AccessibilityPanel />
            </>
          }
        />
      }
    />
  </ContrastProvider>
</ThemeProvider>
```

---

## 4. Persistence System

### Storage Keys

All preferences are stored in `localStorage`:

- `joelklemmer-theme`: 'light' | 'dark' | 'system'
- `joelklemmer-contrast`: 'default' | 'high'
- `joelklemmer-text-size`: 'default' | 'large'
- `joelklemmer-underline-links`: 'true' | (not set)

### SSR-Safe Hydration

**Root Layout Script** (`apps/web/src/app/layout.tsx`):

- Runs before React hydration
- Reads all stored preferences
- Applies attributes immediately
- Prevents FOUC

**Client-Side Persistence:**

- Each provider/component writes to localStorage on change
- Changes are applied immediately (no page reload)
- System preferences are respected when no stored preference exists

---

## 5. CSS Tokens Reference

### Theme Tokens

**Color Tokens:**

- `--color-bg`: Background color
- `--color-surface`: Surface/elevated background
- `--color-text`: Primary text color
- `--color-muted`: Muted/secondary text
- `--color-border`: Border color
- `--color-accent`: Accent color
- `--color-focus`: Focus ring color

**Focus Ring Tokens:**

- `--focus-ring-width`: Focus ring width (2px default, 3px high-contrast)
- `--focus-ring-offset`: Focus ring offset (2px default, 3px high-contrast)
- `--focus-ring-color`: Focus ring color (uses `--color-focus`)

### High-Contrast Overrides

When `data-contrast="high"` is set:

- All colors switch to pure black/white
- Focus rings increase to 3px width/offset
- Borders become 100% opaque
- Shadows use higher opacity

### Text Size Tokens

When `data-text-size="large"` is set (`apps/web/src/styles/40-utilities.css`):

- `--body-analytical-size`: 1rem → 1.125rem
- `--display-heading-size`: 2rem → 2.25rem
- `--section-heading-size`: 1.5rem → 1.75rem
- `--text-base`: 1rem → 1.125rem
- `--text-sm`: 0.875rem → 1rem
- `--text-lg`: 1.125rem → 1.25rem

---

## 6. How to Extend

### Adding a New Theme Mode

1. **Update ThemeProvider:**
   - Add new mode to `Theme` type
   - Update `getStoredTheme()` validation
   - Add logic in `applyTheme()`

2. **Add CSS Tokens:**
   - Add `:root[data-theme='new-mode']` block in `tokens.css`
   - Define color tokens for new mode

3. **Update ThemeToggle:**
   - Add new mode to cycle logic
   - Add icon/visual indicator

4. **Update i18n:**
   - Add label to `common.json` in all locales

### Adding a New Accessibility Preference

1. **Create Provider (if needed):**
   - Follow pattern of `ContrastProvider`
   - Handle SSR-safe hydration
   - Persist to localStorage

2. **Add Control to AccessibilityPanel:**
   - Add form control (select/checkbox)
   - Add state management
   - Add `useEffect` to apply preference
   - Persist to localStorage

3. **Add CSS:**
   - Add attribute selector (e.g., `[data-new-preference='value']`)
   - Define token overrides

4. **Update Root Layout Script:**
   - Add localStorage read
   - Apply attribute before hydration

5. **Update i18n:**
   - Add labels to all locale files

### Example: Adding "Reduced Transparency" Preference

```tsx
// 1. Add state in AccessibilityPanel
const [reducedTransparency, setReducedTransparency] = useState(false);

// 2. Apply preference
useEffect(() => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (reducedTransparency) {
    root.setAttribute('data-reduced-transparency', 'true');
  } else {
    root.removeAttribute('data-reduced-transparency');
  }
  localStorage.setItem('joelklemmer-reduced-transparency', String(reducedTransparency));
}, [reducedTransparency]);

// 3. Add CSS
:root[data-reduced-transparency='true'] {
  --authority-glass-bg: hsl(var(--color-surface));
  --authority-glass-border: hsl(var(--color-border));
  --authority-glass-blur: 0px;
}

// 4. Add control to panel UI
<label>
  <input
    type="checkbox"
    checked={reducedTransparency}
    onChange={(e) => setReducedTransparency(e.target.checked)}
  />
  {common('a11y.reducedTransparencyLabel')}
</label>

// 5. Update root layout script
const reducedTransparency = localStorage.getItem('joelklemmer-reduced-transparency');
if (reducedTransparency === 'true') {
  document.documentElement.setAttribute('data-reduced-transparency', 'true');
}
```

---

## 7. Testing Checklist

### Theme System

- [x] Light theme applies correctly
- [x] Dark theme applies correctly
- [x] System theme respects `prefers-color-scheme`
- [x] Theme persists across page reloads
- [x] No FOUC on initial load
- [x] Theme toggle cycles correctly
- [x] System theme updates when OS preference changes

### High-Contrast Mode

- [x] High-contrast mode applies correctly
- [x] Focus rings are 3px in high-contrast
- [x] Borders are visible (2px, 100% opacity)
- [x] Contrast ratios meet WCAG AA+
- [x] System preference (`prefers-contrast: more`) is respected
- [x] High-contrast persists across reloads

### Accessibility Panel

- [x] Panel opens/closes with keyboard
- [x] Focus trap works correctly
- [x] Esc closes panel
- [x] All controls are keyboard accessible
- [x] ARIA attributes are correct
- [x] RTL positioning works
- [x] All preferences persist

### i18n

- [x] All labels exist in en/uk/es/he
- [x] Labels are contextually appropriate
- [x] RTL languages display correctly

---

## 8. File Structure

```
libs/ui/src/lib/
├── ThemeProvider.tsx          # Theme context provider
├── ThemeToggle.tsx            # Theme toggle button
├── ContrastProvider.tsx        # Contrast context provider
└── AccessibilityPanel.tsx      # Accessibility control panel

libs/tokens/src/lib/
└── tokens.css                  # Theme & contrast tokens

libs/a11y/src/lib/
└── a11y.ts                     # Focus ring utilities

apps/web/src/
├── app/
│   ├── layout.tsx              # Root layout (SSR script)
│   └── [locale]/layout.tsx     # Locale layout (providers)
└── styles/
    ├── 10-base.css             # Base styles (focus, motion)
    └── 40-utilities.css         # Text size utilities

libs/i18n/src/messages/
├── en/common.json              # English labels
├── uk/common.json              # Ukrainian labels
├── es/common.json              # Spanish labels
└── he/common.json              # Hebrew labels
```

---

## 9. Performance Considerations

- **SSR Script**: Minimal, runs once before hydration
- **localStorage**: Only reads on mount, writes on change
- **Media Queries**: Event listeners cleaned up on unmount
- **CSS**: Token-based, no runtime CSS generation
- **Bundle Size**: Minimal (providers are small, no heavy dependencies)

---

## 10. Browser Support

- **localStorage**: Supported in all modern browsers
- **matchMedia**: Supported in all modern browsers
- **CSS Custom Properties**: Supported in all modern browsers
- **prefers-color-scheme**: Supported in modern browsers (fallback: light)
- **prefers-contrast**: Supported in modern browsers (fallback: default)

---

## Summary

The theme and accessibility system provides:

- ✅ SSR-safe theme persistence
- ✅ System preference respect
- ✅ WCAG AA+ high-contrast mode
- ✅ Minimal, accessible control panel
- ✅ Full keyboard navigation
- ✅ RTL support
- ✅ Comprehensive i18n
- ✅ Extensible architecture

All requirements from the spec have been met.
