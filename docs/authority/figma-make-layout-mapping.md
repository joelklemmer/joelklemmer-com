# Figma Make layout mapping plan

**Source:** Figma Make tokens (`libs/tokens/src/lib/generated/figma-make.tokens.patch.css`), `00-tokens.css` overrides, and design comments in `20-layout.css`. Figma MCP returns resource links for Make files rather than node-level design context; this plan derives from imported tokens and documented intent.

---

## 1. Extracted design specs (from tokens + comments)

| Spec                     | Value                       | Source                                                        |
| ------------------------ | --------------------------- | ------------------------------------------------------------- |
| Font family (headings)   | Crimson Pro, Georgia, serif | `--font-serif`                                                |
| Font family (body)       | Inter, system fallbacks     | `--font-sans`                                                 |
| Hero title               | 3rem, line-height 1.15      | `--text-hero`, `--text-hero-line`                             |
| Container max-width      | 1280px                      | `--max-width`                                                 |
| Nav/header height        | 76px                        | `--nav-height`                                                |
| Border radius (portrait) | 0.75rem                     | `--radius-xl` (patch)                                         |
| Hero grid                | 1fr + 480px, gap 5rem       | Comments in 20-layout                                         |
| Background               | Flat, no card               | `--page-frame-stage-bg`, `--page-frame-stage-elevation: none` |
| Frame padding            | Minimal top                 | "flat stage; minimal top padding"                             |

---

## 2. Structural comparison

### Current vs Figma Make intent

| Element                              | Current                                             | Figma Make target           |
| ------------------------------------ | --------------------------------------------------- | --------------------------- |
| page-frame-stage padding-block-start | space-4 / space-5                                   | space-3 / space-4 (tighter) |
| hero-authority padding-block-start   | space-5 / space-6                                   | space-3 / space-4           |
| hero-authority-plate padding         | space-4 / space-6 / space-8                         | space-3 / space-4 / space-6 |
| main top padding                     | pt-4 / pt-5                                         | pt-2 / pt-4                 |
| Hero wrappers                        | hero-authority-visual-frame + hero-portrait-wrapper | Keep (structural for image) |
| Masthead bar height                  | 76px (--nav-height)                                 | 76px ✓ aligned              |

---

## 3. Mapping actions

### Wrappers to remove

- **None.** Hero has no card wrapper; `hero-authority-plate` is layout padding only. Visual frame + portrait wrapper are structural for aspect ratio and shadow.

### Spacing tokens to change

- `page-frame-stage`: padding-block-start space-4→space-3, space-5→space-4
- `hero-authority`: padding-block-start space-5→space-3, space-6→space-4
- `hero-authority-plate`: padding space-4→space-3, space-6→space-4, space-8→space-6

### CSS classes to modify

- `.page-frame-stage` (20-layout.css)
- `.hero-authority` (20-layout.css)
- `.hero-authority-plate` (20-layout.css)

### Main content padding

- `main.vacel-main` uses Tailwind in ServerShell: `pt-4 pb-8 md:pt-5 md:pb-10`
- Change to: `pt-2 pb-8 md:pt-4 md:pb-10` for tighter top

### Masthead spacing

- Already aligned: `--masthead-bar-height: var(--nav-height, 76px)`
- No changes needed

---

## 4. Implementation scope

Minimal structural changes only. No removal of wrappers, no token file edits (spacing values changed in layout CSS only), no HeroSection/HomeScreen component edits.
