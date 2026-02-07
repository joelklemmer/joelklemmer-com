import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/.next'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['type:lib'],
            },
            {
              sourceTag: 'type:lib',
              onlyDependOnLibsWithTags: ['type:lib'],
            },
          ],
        },
      ],
    },
  },
  // Prevent deep imports across libs; use public API only.
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@joelklemmer/ui/*',
                '@joelklemmer/tokens/*',
                '@joelklemmer/i18n/*',
                '@joelklemmer/content/*',
                '@joelklemmer/seo/*',
                '@joelklemmer/a11y/*',
                '@joelklemmer/screens/*',
                '@joelklemmer/sections/*',
              ],
              message:
                'Import from the library root (e.g. @joelklemmer/ui), not deep paths.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
  // Enforce thin route files: apps/web routes only compose from @joelklemmer/screens and @joelklemmer/sections
  {
    files: [
      'apps/web/src/app/**/page.{ts,tsx}',
      'apps/web/src/app/**/layout.{ts,tsx}',
      'apps/web/src/app/**/loading.{ts,tsx}',
      'apps/web/src/app/**/error.{ts,tsx}',
      'apps/web/src/app/**/not-found.{ts,tsx}',
      'apps/web/src/app/**/template.{ts,tsx}',
      'apps/web/src/app/**/default.{ts,tsx}',
    ],
    rules: {
      'max-lines': [
        'error',
        {
          max: 120,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-lines-per-function': [
        'error',
        {
          max: 60,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@joelklemmer/ui',
                '@joelklemmer/ui/*',
                '@joelklemmer/tokens',
                '@joelklemmer/tokens/*',
                '@joelklemmer/i18n',
                '@joelklemmer/i18n/*',
                '@joelklemmer/content',
                '@joelklemmer/content/*',
                '@joelklemmer/seo',
                '@joelklemmer/seo/*',
                '@joelklemmer/a11y',
                '@joelklemmer/a11y/*',
              ],
              message:
                'Route files must only compose from @joelklemmer/screens and @joelklemmer/sections.',
            },
          ],
        },
      ],
    },
  },
  // Disallow hardcoded user-facing strings in apps/web and libs/ui
  {
    files: ['apps/web/src/**/*.tsx', 'libs/ui/src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXText[value=/\\S/]',
          message: 'Use next-intl or MDX for user-facing strings.',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(aria-label|aria-labelledby|aria-describedby|title|alt|placeholder)$/] > Literal',
          message: 'Use next-intl for user-facing strings.',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(aria-label|aria-labelledby|aria-describedby|title|alt|placeholder)$/] > JSXExpressionContainer > Literal',
          message: 'Use next-intl for user-facing strings.',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(aria-label|aria-labelledby|aria-describedby|title|alt|placeholder)$/] > JSXExpressionContainer > TemplateLiteral',
          message: 'Use next-intl for user-facing strings.',
        },
      ],
    },
  },
];
