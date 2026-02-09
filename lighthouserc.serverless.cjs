/**
 * Lighthouse CI config when server is already running (started by tools/run-lighthouse.ts).
 * No startServerCommand; URLs use LHCI_BASE_URL (e.g. http://127.0.0.1:3000).
 */
const base = process.env.LHCI_BASE_URL || 'http://127.0.0.1:3000';
const baseClean = base.replace(/\/$/, '');

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        `${baseClean}/en`,
        `${baseClean}/en/brief`,
        `${baseClean}/en/media`,
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
