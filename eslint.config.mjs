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
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
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
  // Enforce thin route files: apps/web route segments only compose from @screens and @sections
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
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@ui', '@ui/*', '@tokens', '@tokens/*', '@i18n', '@i18n/*', '@content', '@content/*', '@seo', '@seo/*', '@a11y', '@a11y/*'],
              message: 'Route files must only compose from @screens and @sections. Use screens and sections libs instead.',
            },
          ],
        },
      ],
    },
  },
];
