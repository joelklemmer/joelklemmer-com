# Navigation Language System

## Overview

The language switching system provides a production-level UX for switching between supported locales (English, Українська, Español, עברית) with full keyboard accessibility, focus management, and RTL support.

## Component: LanguageSwitcherPopover

**Location**: `libs/ui/src/lib/LanguageSwitcherPopover.tsx`

### Visual Design

- **Trigger**: Single globe icon button (🌐) in header controls
- **Icon**: SVG globe icon (16x16px) with proper semantic markup (`aria-hidden="true"`)
- **Popover**: Dropdown menu positioned using logical properties (`end-0`) for RTL compatibility
- **Styling**: Uses design tokens (`accent/10`, `muted/50`) instead of arbitrary values

### Interaction Spec

#### Opening the Menu

- **Click**: Toggle menu open/closed
- **Keyboard**: Button receives focus via Tab, Enter/Space opens menu
- **Visual feedback**: Button shows hover state, menu appears below trigger

#### Menu Items

- **Display**: Native language names always shown:
  - English
  - Українська
  - Español
  - עברית
- **Current language**: Highlighted with `bg-accent/10` and `font-semibold`
- **Selection**: Clicking any item switches locale and closes menu

#### Closing the Menu

- **Click outside**: Menu closes, focus returns to trigger button
- **ESC key**: Closes menu, returns focus to trigger
- **Item selection**: Menu closes after navigation

### Keyboard Navigation

#### Arrow Keys (Required)

- **ArrowDown**: Move focus to next item (wraps to first)
- **ArrowUp**: Move focus to previous item (wraps to last)
- **First item**: Automatically focused when menu opens

#### Tab Navigation (Focus Trap)

- **Tab**: Cycles through menu items only (cannot tab outside menu)
- **Shift+Tab**: Cycles backward through menu items
- **Trap boundary**: Focus wraps from last item to first, first to last

#### ESC Key

- **Behavior**: Closes menu immediately
- **Focus management**: Returns focus to trigger button

### Accessibility Features

#### ARIA Attributes

- `aria-expanded`: Indicates menu open/closed state
- `aria-controls`: Links button to menu (`language-menu`)
- `aria-haspopup="true"`: Indicates popup menu behavior
- `aria-label`: Descriptive label for screen readers
- `aria-labelledby`: Links menu to trigger button
- `aria-current="page"`: Indicates current language selection
- `role="menu"` / `role="menuitem"`: Proper menu semantics

#### Screen Reader Support

- **Trigger button**: Announces "Language options" and current language
- **Menu items**: Announces "Switch language to [language name]"
- **Current selection**: Announces as current page

#### Focus Management

- **On open**: First menu item receives focus
- **On close**: Trigger button receives focus
- **Focus trap**: Prevents tabbing outside menu when open
- **Focus visible**: All interactive elements show focus indicators

### RTL Support

#### Alignment

- **Popover positioning**: Uses `end-0` (logical property) instead of `right-0`
- **Text direction**: Inherits from root `dir` attribute (set in `apps/web/src/app/layout.tsx`)
- **Hebrew locale**: Automatically renders RTL when `locale="he"`

#### Implementation

- Root layout sets `dir="rtl"` for Hebrew locale via `isRtlLocale()` helper
- Popover uses logical CSS properties (`end` instead of `right`)
- Menu items use `text-left` which respects RTL direction

### Routing & Locale Structure

#### Path Preservation

- **Current path**: Preserved when switching languages
- **Query parameters**: Preserved in new locale URL
- **Implementation**: `resolvePathname()` extracts non-locale segments

#### URL Structure

- **Format**: `/{locale}/{path}?{query}`
- **Example**: `/en/brief` → `/he/brief` (preserves `/brief`)
- **Query strings**: Maintained across language switches

#### Locale Detection

- **Current locale**: Detected from URL pathname
- **Fallback**: Defaults to `en` if invalid locale detected
- **Validation**: Uses `locales` array from `@joelklemmer/i18n`

### Mobile Navigation

#### Primary Navigation

- **Component**: `PrimaryNavSection` (`libs/sections/src/lib/PrimaryNavSection.tsx`)
- **Mobile behavior**: Hamburger menu (☰) shown on screens < `md` breakpoint
- **Features**:
  - Popover menu with same keyboard navigation
  - Outside click to close
  - ESC key support
  - RTL alignment (`end-0`)

#### Language Switcher on Mobile

- **Position**: Header controls (always visible)
- **Behavior**: Same popover behavior as desktop
- **Touch targets**: Minimum 44x44px (meets WCAG 2.2 AA)

### Implementation Details

#### Focus Trap

```typescript
// Traps Tab key within menu when open
useEffect(() => {
  if (!isOpen || !menuRef.current) return;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    // Wrap focus from last to first, first to last
  };

  document.addEventListener('keydown', handleTabKey);
  return () => document.removeEventListener('keydown', handleTabKey);
}, [isOpen]);
```

#### Native Language Names

```typescript
// Always displays native names regardless of current locale
const nativeLanguageNames: Record<AppLocale, string> = {
  en: 'English',
  uk: 'Українська',
  es: 'Español',
  he: 'עברית',
};
```

#### Outside Click Detection

```typescript
// Closes menu when clicking outside trigger or menu
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };
  // ...
}, [isOpen, handleClose]);
```

### Testing Checklist

#### Keyboard Accessibility

- [x] Tab navigates to trigger button
- [x] Enter/Space opens menu
- [x] Arrow keys navigate menu items
- [x] Tab cycles within menu (focus trap)
- [x] ESC closes menu and returns focus

#### Visual & Interaction

- [x] Globe icon displays correctly
- [x] Menu opens below trigger
- [x] Current language highlighted
- [x] Native language names displayed
- [x] Click outside closes menu
- [x] Click item switches language

#### RTL Support

- [x] Popover aligns correctly in RTL (Hebrew)
- [x] Text direction respects `dir="rtl"`
- [x] Menu items display correctly in RTL

#### Mobile

- [x] Touch targets meet minimum size
- [x] Menu accessible on mobile viewports
- [x] No layout issues on small screens

### Browser Compatibility

- **Modern browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Screen readers**: Tested with NVDA, JAWS, VoiceOver
- **Keyboard only**: Fully operable without mouse
- **Touch devices**: Works on iOS and Android

### Performance

- **No runtime warnings**: Component uses stable React patterns
- **Minimal re-renders**: `useCallback` and `useRef` prevent unnecessary updates
- **Accessible immediately**: No hydration issues, works with SSR

### Future Enhancements

Potential improvements (not currently required):

- Add focus trap to mobile navigation menu
- Consider adding `aria-orientation` if menu becomes horizontal
- Add transition animations (respecting `prefers-reduced-motion`)

## Related Components

- **HeaderSection**: Contains language switcher in `headerControls`
- **PrimaryNavSection**: Mobile navigation menu (separate from language switcher)
- **Root Layout**: Sets `dir` attribute for RTL support

## References

- [WCAG 2.2 Keyboard Accessible](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)
- [ARIA Menu Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [Logical Properties for RTL](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
