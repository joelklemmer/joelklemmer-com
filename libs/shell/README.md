# Shell

Server-first shell and client controls island for the web app. Reduces main-thread work before LCP by rendering masthead, nav links, main, and footer as server HTML; only interactive header controls (mobile nav, theme, language, cookie, a11y) hydrate as a single client island.

- **ServerShell**: Server Component. Renders skip link, header (wordmark, static desktop nav links), slot for client controls, main, footer. No `use client`.
- **ClientShellControls**: Client Component. Wraps only the header controls in Theme/Contrast/ACP/Evaluator/Density providers and renders Nav (mobile only), LanguageSwitcherPopover, ThemeToggle, CookiePreferencesTrigger, AccessibilityPanel.

Used by the locale layout. Tag: `type:lib`, `scope:shell`.
