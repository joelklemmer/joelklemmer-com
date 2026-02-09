/**
 * Lighthouse CI: performance and Core Web Vitals — build fails when budgets exceeded.
 * Targets: LCP < 1.8s, CLS ≤ 0.05, INP < 200ms, TBT < 300ms, FCP < 1.8s, TTFB < 600ms;
 * performance ≥ 0.7, accessibility ≥ 0.9; total-byte-weight ≤ 2.5MB.
 * Pipeline: .github/workflows/ci.yml runs this after build; reports in tmp/lighthouse.
 * Run: pnpm exec lhci autorun --config=./lighthouserc.cjs
 */
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: 'pnpm nx start web',
      startServerReadyPattern: 'Ready in|started server',
      startServerReadyTimeout: 120000,
      url: [
        'http://localhost:3000/en',
        'http://localhost:3000/en/brief',
        'http://localhost:3000/en/media',
      ],
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'interaction-to-next-paint': ['error', { maxNumericValue: 200 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'server-response-time': ['error', { maxNumericValue: 600 }],
        'total-byte-weight': ['error', { maxNumericValue: 2500000 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: 'tmp/lighthouse',
    },
  },
};
