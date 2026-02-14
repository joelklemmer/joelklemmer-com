# @joelklemmer/behavior-runtime

Shared logic layer for behavioral engines. No UI. Provides typed functions for theme, contrast, density, evaluator mode, motion, text size, and underline links.

- Preserves cookie names (`joelklemmer-theme`, `joelklemmer-contrast`, `joelklemmer-density`, `evaluator_mode`)
- Preserves localStorage keys (`joelklemmer-motion`, `joelklemmer-text-size`, `joelklemmer-underline-links`)
- Preserves `data-*` attributes on `documentElement`
- Callable from client components and small inline initializers
