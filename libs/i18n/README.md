# @joelklemmer/i18n

## System role

Locale and message infrastructure: supported locales, default locale, RTL detection, next-intl message namespaces, and message loading/merge/translator helpers. No UI; consumed by `screens`, `sections`, `ui`, and app layout for routing and translations.

## Architectural boundaries

- **Tag:** `type:lib`. May depend only on other `type:lib` libraries.
- **No deep imports:** Use `@joelklemmer/i18n` only.
- **Boundary:** Locale list, message namespaces, and loader/translator utilities only. Message copy lives in `src/messages/{locale}/*.json`; this lib does not own content doctrine—only structure and loading. Route files must not import this lib directly; they use `screens`/`sections`.

## Public interfaces

- **Root** (`src/index.ts`): Re-exports `locales` and `messages`.
- **locales:** `locales`, `defaultLocale`, `AppLocale`, `isRtlLocale`.
- **messages:** `messageNamespaces`, `MessageNamespace`, `loadMessages`, `mergeMessages`, `createScopedTranslator`.

## Dependency constraints

- Depends only on `type:lib` (e.g. `next-intl`). No dependency on `content`, `screens`, or app routes.

## Example usage

```ts
import { locales, defaultLocale, type AppLocale } from '@joelklemmer/i18n';
import { loadMessages, messageNamespaces } from '@joelklemmer/i18n';

const msgs = await loadMessages('en', messageNamespaces);
```

## Interaction with verify pipeline

- **i18n-validate** (`tools/validate-i18n.ts`): Uses `locales` and content/validate for claim/contact keys.
- **seo-validate, sitemap-validate, validate-home, validate-frameworks, validate-content-os, validate-pgf, verify-proof-attachments**: Use `locales` or `defaultLocale` from this lib.
- Changing `locales` or `messageNamespaces` may require validator and sitemap/SEO updates.
