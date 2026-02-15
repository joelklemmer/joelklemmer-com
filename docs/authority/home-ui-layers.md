# Home UI layer structure

Documents the container hierarchy and layout flow for the home page. Use for debugging alignment, responsiveness, and Figma design parity.

**Figma reference:** [Institutional Executive Website Design](https://pages-tile-41445691.figma.site/)

---

## Layer hierarchy (top to bottom)

```
layout-root (min-h-screen, overflow-x: clip)
├── header (sticky)
│   └── Container variant="full" (masthead-outer)
│       └── masthead-bar (max-w container-max-width, mx-auto)
│           ├── masthead-identity (wordmark)
│           ├── masthead-nav (primary nav)
│           └── masthead-utilities (theme, language, a11y)
├── main (vacel-main)
│   └── PageFrame contentStage
│       └── HomeScreen
│           └── Container variant="wide" (home-content-band)
│               └── content-lane-grid
│                   ├── HeroSection
│                   │   └── section.hero-authority
│                   │       ├── hero-authority-atmosphere (aria-hidden)
│                   │       └── div.hero-authority-inner.hero-authority-plate
│                   │           └── hero-authority-grid
│                   │               ├── hero-authority-content (h1, lede, CTAs)
│                   │               └── hero-authority-visual (portrait)
│                   ├── InstitutionalDomainsSection
│                   └── SelectedWorkSection
└── footer
    └── Container variant="wide"
        └── FooterSection
```

---

## Alignment contract

| Element      | Max width                      | Horizontal inset                           |
| ------------ | ------------------------------ | ------------------------------------------ |
| Masthead bar | 1280px (--container-max-width) | Container full padding (ps/pe container-x) |
| Home content | 1280px (Container wide)        | Same ps/pe container-x                     |
| Footer       | 1280px (Container wide)        | Same ps/pe container-x                     |

All three use the same lane (--container-max-width = 1280px) and padding tokens, so they align at all breakpoints.

---

## Responsive breakpoints

- **Mobile (0–639px):** Hero stacks (portrait above content); single-column sections
- **Tablet (768px+):** Hero two-column; domains 2-col, selected-work single
- **Desktop (1024px+):** Hero 1fr + 400px portrait; domains 3-col
- **XL (1280px+):** Hero 1fr + 480px portrait
- **Ultrawide (1600px+):** Same 1280px lane; no further widening

---

## Key classes

| Class                | Role                                             |
| -------------------- | ------------------------------------------------ |
| home-content-band    | Semantic wrapper; min-width: 0 for grid safety   |
| content-lane-grid    | Vertical stack of sections; gap from tokens      |
| hero-authority-plate | Hero inner padding (space-3/4/6 by breakpoint)   |
| hero-authority-grid  | Two-column: content (1fr) + portrait (280–480px) |

---

## Simplified structure (post-refactor)

- **Single Container** for entire home: one lane + padding for masthead/content/footer alignment
- **No per-section Containers**: Hero, Domains, SelectedWork get width from parent
- **Fewer wrappers**: Removed redundant Container nesting in each section
