# Figma color verification — exact hex values

**Source:** https://pages-tile-41445691.figma.site/  
**Extracted from:** `libs/tokens/src/lib/generated/figma-make.tokens.json` (Figma Make theme.css export)  
**Rule:** LOCAL must use identical hex — no approximations.

---

## Light theme (data-theme="light" / prefers-color-scheme: light)

| Element                 | Figma HSL         | Exact Hex | Token                                                      |
| ----------------------- | ----------------- | --------- | ---------------------------------------------------------- |
| Body background         | 60 11% 96%        | `#F6F6F4` | `--color-bg`                                               |
| Header background       | 0 0% 0% (spec)    | `#000000` | `--masthead-bg` (when black per spec)                      |
| Header background       | 0 0% 100% (patch) | `#FFFFFF` | `--masthead-bg` (from tokens = surface)                    |
| Divider line            | 36 6% 84%         | `#D9D7D4` | `--color-border-subtle`                                    |
| Headline text           | 0 0% 7%           | `#121212` | `--color-text`                                             |
| Paragraph text          | 0 0% 42%          | `#6B6B6B` | `--color-text-tertiary`                                    |
| Primary button bg       | 211 34% 17%       | `#1D2B3A` | `--color-accent`                                           |
| Secondary button border | 36 4% 76%         | `#C4C2BF` | `--color-border`                                           |
| Nav link color          | 0 0% 7%           | `#121212` | `--color-text` (light header) or `0 0% 95%` (black header) |

---

## Implementation

1. **Do not override** `--color-bg` in 55-figma-parity — use figma-make patch `60 11% 96%` (#F6F6F4).
2. **Paragraph (hero lede):** Use `hsl(var(--color-text-tertiary))` → #6B6B6B.
3. **Divider (masthead-border):** Use `hsl(var(--color-border-subtle))` → #D9D7D4.
4. **Secondary button border:** Use `hsl(var(--color-border))` → #C4C2BF.
5. **Primary button:** Uses `--color-accent` → #1D2B3A.
6. **All values** must match the hex above; HSL in tokens produces these exactly.

---

## Header note

- **figma-site-design-spec.md:** "Background (light mode): Black" — `#000000`.
- **figma-make.tokens.patch.css:** Uses `--color-surface` (white) for masthead.
- If live Figma shows black header, override `--masthead-bg` to `0 0% 0%` in 55-figma-parity and set `--masthead-text` / `--masthead-text-muted` to light values.
- If live Figma shows white header, keep current patch.

---

_Last updated from figma-make.tokens.json conversion._
