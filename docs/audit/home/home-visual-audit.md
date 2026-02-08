# Home Page Visual Audit: Fortune 10 / Statesman Briefing Interface

**Date:** February 8, 2026  
**Objective:** Transform Home page to match Fortune 10 / statesman briefing interface standards with intentional composition, proper hierarchy, and polished presentation.

## Before/After Screenshot Instructions

### Where to Look

1. **Hero Section** (`/` route, top of page)
   - **Before:** Check at 100% zoom - portrait may overlap name/content, awkward spacing
   - **After:** Portrait never overlaps name, proper grid alignment, intentional composition

2. **Header & Navigation** (top of every page)
   - **Before:** Inconsistent baseline alignment, no active state indicators
   - **After:** Aligned baselines, active state indicator bar, proper spacing

3. **Vertical Rhythm** (entire Home page)
   - **Before:** Excessive dead space between sections, inconsistent card padding
   - **After:** Tighter, intentional spacing, reduced dead space, consistent card styles

4. **Responsive Behavior**
   - **Mobile (320px-767px):** Portrait stacks above content, never overlaps
   - **Tablet (768px-1023px):** Portrait beside content, constrained sizing
   - **Desktop (1024px+):** Optimal portrait sizing, proper grid proportions

## What Changed and Why

### 1. Hero Composition Fixes

**Problem:** Portrait could overlap name/content, especially at certain zoom levels and viewport sizes.

**Solution:**

- Changed grid from `1.2fr 1fr` to `minmax(0, 1.5fr) minmax(0, 1fr)` to prevent overflow
- Added `min-width: 0` and `overflow-wrap: break-word` to content column
- Mobile: Portrait stacks above content with `order: -1`
- Desktop: Portrait constrained to max-width with proper aspect ratio
- Visual column uses `justify-content: flex-end` for proper alignment

**Files Modified:**

- `apps/web/src/styles/20-layout.css` - Hero grid and portrait composition rules

**Tokens Added:**

- None (used existing `--hero-inline-gap`, `--hero-block-gap`)

### 2. Home Page Vertical Rhythm

**Problem:** Excessive dead space between sections, inconsistent card padding, no clear hierarchy.

**Solution:**

- Added Home-specific spacing tokens: `--home-section-gap`, `--home-section-gap-md`
- Reduced section spacing from `--space-8` to `--space-6` (mobile) and `--space-7` (desktop)
- Standardized card padding via `--home-card-padding` tokens
- Applied consistent padding to all card components (ListSection, StartHereSection, CardGridSection, FrameworkCard)

**Files Modified:**

- `libs/tokens/src/lib/tokens.css` - Added Home-specific spacing tokens
- `apps/web/src/styles/20-layout.css` - Applied Home page spacing rules
- `apps/web/src/styles/30-components.css` - Standardized card padding
- `libs/sections/src/lib/ListSection.tsx` - Removed inline padding, uses token
- `libs/sections/src/lib/StartHereSection.tsx` - Removed inline padding, uses token
- `libs/sections/src/lib/CardGridSection.tsx` - Removed inline padding, uses token
- `libs/sections/src/lib/FrameworkCard.tsx` - Removed inline padding, uses token

**Tokens Added:**

- `--home-section-gap: var(--space-6)`
- `--home-section-gap-md: var(--space-7)`
- `--home-card-padding: var(--space-5)`
- `--home-card-padding-md: var(--space-6)`
- `--home-card-gap: var(--space-4)`

### 3. Header and Navigation Polish

**Problem:** Inconsistent baseline alignment, no visual active state, spacing felt unfinished.

**Solution:**

- Aligned header and nav items to baseline using `items-baseline`
- Added active state indicator: 2px accent-colored bar below active nav item
- Standardized header/nav padding via tokens
- Improved wordmark alignment with baseline offset
- Header controls use `flex-shrink-0` to prevent compression

**Files Modified:**

- `libs/ui/src/lib/Shell.tsx` - Removed inline padding, uses CSS rules
- `libs/sections/src/lib/HeaderSection.tsx` - Changed to `items-baseline`, added flex-shrink
- `libs/sections/src/lib/PrimaryNavSection.tsx` - Changed to `items-baseline`, improved padding
- `apps/web/src/styles/20-layout.css` - Added header/nav styling rules

**Tokens Added:**

- `--header-padding-y: var(--space-4)`
- `--header-padding-y-md: var(--space-5)`
- `--nav-padding-y: var(--space-3)`
- `--nav-padding-y-md: var(--space-4)`
- `--nav-item-gap: var(--space-4)`
- `--nav-item-padding-x: var(--space-2)`
- `--nav-item-padding-y: var(--space-1)`
- `--nav-active-indicator-height: 2px`
- `--header-baseline-offset: 0.125em`

### 4. Responsive Behavior

**Problem:** Portrait sizing inconsistent across breakpoints, potential overlap issues.

**Solution:**

- **Mobile (≤767px):** Portrait max-width 320px, max-height 50vh, stacks above content
- **Tablet (768px-1023px):** Portrait max-height 60vh, constrained to column width
- **Desktop (1024px+):** Portrait max-width 420px, max-height 65vh
- **Large Desktop (1280px+):** Portrait max-width 450px, max-height 70vh
- All breakpoints maintain 4:5 aspect ratio
- Hero plate padding scales: `--space-6` (mobile) → `--space-8` (tablet) → `--space-10` (desktop)

**Files Modified:**

- `apps/web/src/styles/20-layout.css` - Responsive portrait sizing and hero plate padding

**Tokens Added:**

- None (used existing spacing scale)

## Intended Hierarchy

### Visual Hierarchy (Top to Bottom)

1. **Header** (fixed at top)
   - Wordmark (left) + Controls (right)
   - Baseline-aligned, minimal padding

2. **Navigation** (below header)
   - Horizontal nav items with active indicator
   - Baseline-aligned, consistent spacing

3. **Hero Section** (main content start)
   - Name (H1) → Lede → CTA → Portrait (desktop) / Portrait → Name → Lede → CTA (mobile)
   - Typographic dominance: `clamp(2.75rem, 6vw + 1.5rem, 3.5rem)`
   - Portrait never overlaps content

4. **Start Here Section**
   - Brief call-to-action card
   - Elevated surface, minimal padding

5. **Primary Routes Section**
   - 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
   - Card-based navigation

6. **Claim Summary Section**
   - Bulleted list in card
   - Analytical presentation

7. **Doctrine Section**
   - 3-column framework cards
   - Visual anchor at top

### Typography Scale

- **Hero Display:** `clamp(2.75rem, 6vw + 1.5rem, 3.5rem)` / 1.1 line-height / -0.04em letter-spacing / 660 weight
- **Section Headings:** `1.5rem` / 1.3 line-height / -0.02em letter-spacing / 600 weight
- **Body Text:** `1rem` / 1.6 line-height / 0 letter-spacing
- **Card Titles:** `1.125rem` / 1.2 line-height / 600 weight
- **Card Descriptions:** `0.875rem` / relaxed line-height

### Spacing Scale (Home Page)

- **Section Gap:** `--space-6` (mobile) → `--space-7` (desktop)
- **Card Padding:** `--space-5` (mobile) → `--space-6` (desktop)
- **Card Gap:** `--space-4`
- **Hero Block Gap:** `--space-6`
- **Hero Inline Gap:** `--space-8`

### Card Styles

All cards use:

- `authority-card` class with standardized padding tokens
- Border: `1px solid hsl(var(--color-border))`
- Border radius: `0.5rem`
- Background: `hsl(var(--color-surface) / var(--authority-surface-translucency))`
- Shadow: `--authority-card-elevation` + `--authority-card-glow`
- Hover: Enhanced shadow elevation

## Testing Checklist

- [ ] Hero portrait never overlaps name at 100% zoom
- [ ] Hero portrait never overlaps name at 33% zoom
- [ ] Hero portrait never overlaps name at 200% zoom
- [ ] Mobile: Portrait stacks above content
- [ ] Tablet: Portrait beside content, proper sizing
- [ ] Desktop: Portrait optimal size, no overlap
- [ ] Header baseline alignment consistent
- [ ] Nav active state indicator visible
- [ ] Section spacing reduced, no excessive dead space
- [ ] Card padding consistent across all card types
- [ ] Typography hierarchy clear and intentional
- [ ] No dev-scaffold appearance
- [ ] Responsive breakpoints work correctly

## Files Changed Summary

### CSS Files

- `apps/web/src/styles/20-layout.css` - Hero composition, header/nav, spacing
- `apps/web/src/styles/30-components.css` - Card padding standardization
- `libs/tokens/src/lib/tokens.css` - Home-specific tokens

### Component Files

- `libs/ui/src/lib/Shell.tsx` - Header/nav structure
- `libs/sections/src/lib/HeaderSection.tsx` - Baseline alignment
- `libs/sections/src/lib/PrimaryNavSection.tsx` - Baseline alignment, active states
- `libs/sections/src/lib/ListSection.tsx` - Token-based padding
- `libs/sections/src/lib/StartHereSection.tsx` - Token-based padding
- `libs/sections/src/lib/CardGridSection.tsx` - Token-based padding
- `libs/sections/src/lib/FrameworkCard.tsx` - Token-based padding

## Design Principles Applied

1. **Intentional Composition:** Every element positioned with purpose, no accidental overlaps
2. **Visual Hierarchy:** Clear typographic and spacing hierarchy guides the eye
3. **Reduced Dead Space:** Tighter spacing creates briefing interface density
4. **Consistent Patterns:** All cards use same padding tokens, all sections use same spacing
5. **Baseline Alignment:** Text elements align to baseline for professional appearance
6. **Responsive First:** Mobile-first approach ensures portrait never overlaps at any breakpoint
7. **Token-Driven:** All spacing and sizing uses design tokens for consistency

## Notes

- Language popover not implemented in this pass (as requested) but visual space reserved
- All changes maintain WCAG accessibility standards
- Design tokens follow existing naming conventions
- No breaking changes to component APIs
