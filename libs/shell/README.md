# Shell

Server-first shell and client controls for the web app. Reduces main-thread work before LCP by rendering masthead, nav links, main, and footer as server HTML. Header controls are split into critical (immediate) and deferred (after first paint) islands.

- **ServerShell**: Server Component. Renders skip link, header (wordmark, static desktop nav links), two slots for client controls, main, footer. No `use client`.
- **headerCriticalSlot**: Rendered immediately. Use **ClientShellCritical** (Nav mobile + LanguageSwitcherPopover only). No Theme/Contrast/ACP/Evaluator/Density providers.
- **headerDeferredSlot**: Reserved container; content mounted after first paint. Use **ShellDeferredControls** (wraps **DeferMount** + **ClientShellDeferred**). ClientShellDeferred includes ThemeToggle, CookiePreferencesTrigger, AccessibilityPanel, and full provider stack (Theme, Contrast, ACP, Evaluator, Density).

Theme, contrast, density, and evaluator mode are applied from server-set `data-*` attributes on `<html>` (from cookies). Deferred controls update cookies and DOM when the user changes preferences.

Used by the locale layout. Tag: `type:lib`, `scope:shell`.
