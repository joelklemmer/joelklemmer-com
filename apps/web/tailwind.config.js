// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '../../libs/**/*.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(var(--color-bg) / <alpha-value>)',
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        text: 'hsl(var(--color-text) / <alpha-value>)',
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        border: 'hsl(var(--color-border) / <alpha-value>)',
        accent: 'hsl(var(--color-accent) / <alpha-value>)',
        'accent-strong': 'hsl(var(--color-accent-strong) / <alpha-value>)',
        focus: 'hsl(var(--color-focus) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      spacing: {
        xs: 'var(--space-2)',
        sm: 'var(--space-3)',
        md: 'var(--space-4)',
        lg: 'var(--space-6)',
        xl: 'var(--space-8)',
      },
      fontSize: {
        body: ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        title: ['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
        display: ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        small: ['var(--text-sm)', { lineHeight: 'var(--leading-normal)' }],
      },
      borderRadius: {
        card: '1rem',
      },
    },
  },
  plugins: [],
};
