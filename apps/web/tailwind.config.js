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
        'surface-elevated':
          'hsl(var(--color-surface-elevated) / <alpha-value>)',
        'surface-field': 'hsl(var(--color-surface-field) / <alpha-value>)',
        'surface-inset': 'hsl(var(--color-surface-inset) / <alpha-value>)',
        text: 'hsl(var(--color-text) / <alpha-value>)',
        muted: 'hsl(var(--color-muted) / <alpha-value>)',
        border: 'hsl(var(--color-border) / <alpha-value>)',
        'border-subtle': 'hsl(var(--color-border-subtle) / <alpha-value>)',
        accent: 'hsl(var(--color-accent) / <alpha-value>)',
        'accent-strong': 'hsl(var(--color-accent-strong) / <alpha-value>)',
        'accent-muted': 'hsl(var(--color-accent-muted) / <alpha-value>)',
        'text-on-accent': 'hsl(var(--color-text-on-accent) / <alpha-value>)',
        focus: 'hsl(var(--color-focus) / <alpha-value>)',
        neutral: {
          50: 'hsl(var(--color-neutral-50) / <alpha-value>)',
          100: 'hsl(var(--color-neutral-100) / <alpha-value>)',
          200: 'hsl(var(--color-neutral-200) / <alpha-value>)',
          300: 'hsl(var(--color-neutral-300) / <alpha-value>)',
          400: 'hsl(var(--color-neutral-400) / <alpha-value>)',
          500: 'hsl(var(--color-neutral-500) / <alpha-value>)',
        },
      },
      maxWidth: {
        container: 'var(--container-max-width)',
        readable: 'var(--readable-max-width)',
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
        /* Figma Make: sm/base/lg align with Figma site typography */
        sm: [
          'var(--text-sm)',
          { lineHeight: 'var(--text-body-small-line, 1.5)' },
        ],
        base: [
          'var(--text-base)',
          { lineHeight: 'var(--text-body-line, 1.65)' },
        ],
        lg: [
          'var(--text-lg)',
          { lineHeight: 'var(--text-body-large-line, 1.65)' },
        ],
        body: ['var(--text-base)', { lineHeight: 'var(--leading-normal)' }],
        title: ['var(--text-2xl)', { lineHeight: 'var(--leading-tight)' }],
        display: ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)' }],
        small: ['var(--text-sm)', { lineHeight: 'var(--leading-normal)' }],
        /* Visual Authority typography system */
        'display-heading': [
          'var(--display-heading-size)',
          {
            lineHeight: 'var(--display-heading-line)',
            letterSpacing: 'var(--display-heading-spacing)',
          },
        ],
        'section-heading': [
          'var(--section-heading-size)',
          {
            lineHeight: 'var(--section-heading-line)',
            letterSpacing: 'var(--section-heading-letter-spacing)',
          },
        ],
        'body-analytical': [
          'var(--body-analytical-size)',
          {
            lineHeight: 'var(--body-analytical-line)',
            letterSpacing: 'var(--body-analytical-spacing)',
          },
        ],
        'meta-label': [
          'var(--meta-label-size)',
          {
            lineHeight: 'var(--meta-label-line)',
            letterSpacing: 'var(--meta-label-spacing)',
          },
        ],
      },
      /* Figma Make: rectangular UI (https://pages-tile-41445691.figma.site/) */
      borderRadius: {
        DEFAULT: 'var(--radius, 0)',
        none: '0',
        sm: 'var(--radius-sm, 0)',
        md: 'var(--radius-md, 0)',
        lg: 'var(--radius-lg, 0)',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        card: 'var(--radius-card, 0)',
      },
      boxShadow: {
        'authority-elevation': 'var(--authority-surface-elevation)',
        'authority-depth': 'var(--authority-surface-depth)',
        'authority-glow': 'var(--authority-soft-glow)',
        'authority-layer2': 'var(--authority-surface-layer2)',
        'authority-layer1': 'var(--authority-depth-layer1)',
        'authority-layer2-depth': 'var(--authority-depth-layer2)',
        'authority-layer3': 'var(--authority-depth-layer3)',
        'authority-card': 'var(--authority-card-elevation)',
        'authority-card-glow': 'var(--authority-card-glow)',
        'authority-hero': 'var(--authority-hero-depth)',
        'authority-glow-controlled': 'var(--authority-controlled-glow)',
      },
      padding: {
        'container-x': 'var(--container-padding-x)',
        'container-x-wide': 'var(--container-padding-x-wide)',
        'container-x-start':
          'calc(var(--container-padding-x) + var(--optical-inset))',
        'optical-inset': 'var(--optical-inset)',
      },
      gap: {
        'content-rhythm': 'var(--content-rhythm)',
        'column-cadence': 'var(--column-cadence)',
        'row-cadence': 'var(--row-cadence)',
        'grid-base': 'var(--grid-gap-base)',
        'grid-wide': 'var(--grid-gap-wide)',
        'grid-tight': 'var(--grid-gap-tight)',
      },
      transitionDuration: {
        fast: 'var(--transition-duration-fast)',
        normal: 'var(--transition-duration-normal)',
        feedback: 'var(--motion-duration-feedback)',
      },
      transitionTimingFunction: {
        authority: 'var(--ease-authority)',
        'authority-out': 'var(--ease-authority-out)',
        'ease-out': 'var(--motion-ease-out)',
      },
      fontWeight: {
        meta: 'var(--font-weight-meta)',
        body: 'var(--font-weight-body)',
        label: 'var(--font-weight-label)',
        section: 'var(--font-weight-section)',
        hero: 'var(--font-weight-hero)',
        'hero-identity': 'var(--font-weight-hero-identity)',
        'display-heading': 'var(--display-heading-weight)',
        'section-heading': 'var(--section-heading-weight)',
      },
    },
  },
  plugins: [],
};
