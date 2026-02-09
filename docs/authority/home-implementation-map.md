# Home Implementation Map

**Purpose:** Canonical reference for the Home page at `/[locale]/` (e.g. `/en`, `/he`). Use this map when changing Home content, structure, or styling so agents and contributors edit the correct files.

**Scope:** Identification and documentation only. No redesign, tokens, header UI, or routing changes implied.

---

## 1. Route file (canonical Home)

| Item              | Path                                          |
| ----------------- | --------------------------------------------- |
| **Route segment** | `apps/web/src/app/[locale]/`                  |
| **Page file**     | `apps/web/src/app/[locale]/page.tsx`          |
| **Renders**       | `<HomeScreen />` from `@joelklemmer/screens`  |
| **Metadata**      | `homeMetadata` (re-exported from same screen) |

The page component is `LocaleIndex`; it delegates all content to `HomeScreen`.

---

## 2. Screen and section modules

| Layer                     | Module        | File path                                 |
| ------------------------- | ------------- | ----------------------------------------- |
| **Screen**                | HomeScreen    | `libs/screens/src/lib/HomeScreen.tsx`     |
| **Sections used by Home** | HeroSection   | `libs/sections/src/lib/HeroSection.tsx`   |
|                           | ListSection   | `libs/sections/src/lib/ListSection.tsx`   |
|                           | FrameworkCard | `libs/sections/src/lib/FrameworkCard.tsx` |

Home also contains **inline sections** (no separate section file): `#routes` (Executive Brief + verification rails) and `#doctrine` (framework cards). Both are defined inside `HomeScreen.tsx`.

---

## 3. Masthead / header (shell, not Home content)

The header is **not** part of the Home page component. It is composed in the locale layout and wraps all locale routes, including Home.

| Component                                                    | File path                    |
| ------------------------------------------------------------ | ---------------------------- |
| **Shell** (layout wrapper: header + nav + footer + children) | `libs/ui/src/lib/Shell.tsx`  |
| **Header** (masthead: wordmark, home link, controls)         | `libs/ui/src/lib/Header.tsx` |
| **Nav** (primary nav below header)                           | `libs/ui/src/lib/Nav.tsx`    |

Composition: `apps/web/src/app/[locale]/layout.tsx` → `<Shell headerContent={<Header ... />} navContent={<Nav ... />} footerContent={<FooterSection ... />}>` → `{children}` (Home when at `/[locale]/`).

---

## 4. Home content component tree (top 2–3 levels)

```
[locale]/page.tsx (LocaleIndex)
└── HomeScreen (libs/screens)
    ├── WebSiteJsonLd / PersonJsonLd (SEO)
    └── div.content-lane.content-lane-grid
        ├── HeroSection (libs/sections) — hero
        ├── section#routes (inline) — Executive Brief + verification rails
        ├── ListSection (libs/sections) — claims
        └── section#doctrine (inline) — FrameworkCard × N (libs/sections)
```

**Section order (HOME_IA_ORDER):** `hero` → `routes` → `claims` → `doctrine`.

---

## 5. CSS lane files that affect Home

Home uses the **global app styles**; there is no Home-specific CSS module.

| Entry          | Path                                    | Role                                               |
| -------------- | --------------------------------------- | -------------------------------------------------- |
| **App entry**  | `apps/web/src/app/global.css`           | Imports styles (included by `[locale]/layout.tsx`) |
| **CAS index**  | `apps/web/src/styles/index.css`         | Tokens + Tailwind (base/components/utilities)      |
| **App layers** | `apps/web/src/styles/app-layers.css`    | Imports the lanes below                            |
| **Lanes**      | `apps/web/src/styles/00-tokens.css`     | App token overrides                                |
|                | `apps/web/src/styles/10-base.css`       | Base elements                                      |
|                | `apps/web/src/styles/20-layout.css`     | Layout                                             |
|                | `apps/web/src/styles/30-components.css` | Components                                         |
|                | `apps/web/src/styles/40-utilities.css`  | Utilities                                          |

`index.css` also imports `libs/tokens/src/lib/tokens.css`. All of the above apply to every page under `[locale]`, including Home.

---

## 6. Quick reference

| Concern                             | Primary file(s)                                                  |
| ----------------------------------- | ---------------------------------------------------------------- |
| Change what route renders for `/en` | `apps/web/src/app/[locale]/page.tsx`                             |
| Change Home content / sections      | `libs/screens/src/lib/HomeScreen.tsx`                            |
| Change hero block                   | `libs/sections/src/lib/HeroSection.tsx`                          |
| Change claims list                  | `libs/sections/src/lib/ListSection.tsx`                          |
| Change doctrine cards               | `HomeScreen.tsx` + `libs/sections/src/lib/FrameworkCard.tsx`     |
| Change routes block (Brief + rails) | `libs/screens/src/lib/HomeScreen.tsx` (inline)                   |
| Change header / masthead            | `libs/ui/src/lib/Header.tsx`, `Shell.tsx`, `[locale]/layout.tsx` |
| Change global styles affecting Home | `apps/web/src/styles/*.css` (see table above)                    |
