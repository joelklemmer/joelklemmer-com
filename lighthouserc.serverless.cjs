/**
 * Lighthouse CI config when server is already running (started by tools/run-lighthouse.ts).
 * No startServerCommand; URLs use LHCI_BASE_URL (e.g. http://127.0.0.1:3000).
 *
 * Default audits only /en and /en/brief.
 * To include /en/media: set LH_INCLUDE_MEDIA=1.
 * To increase runs: set LH_RUNS=3.
 */
const os = require('node:os');
const path = require('node:path');
const base = process.env.LHCI_BASE_URL || 'http://127.0.0.1:3000';
const baseClean = base.replace(/\/$/, '');
const runs = Number(process.env.LH_RUNS || 1);
const includeMedia = process.env.LH_INCLUDE_MEDIA === '1';

module.exports = {
  ci: {
    collect: {
      numberOfRuns: runs,
      url: [
        `${baseClean}/en`,
        `${baseClean}/en/brief`,
        ...(includeMedia ? [`${baseClean}/en/media`] : []),
      ],
      settings: {
        formFactor: 'desktop',
        throttlingMethod: 'provided',
        chromeFlags: [
          '--headless=new',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-extensions',
          '--disable-component-update',
          '--disable-background-networking',
          '--disable-sync',
          '--metrics-recording-only',
          '--disable-features=ChromeWhatsNewUI,PrivacySandboxSettings4',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          `--user-data-dir=${path.join(os.tmpdir(), `lhci-profile-${process.pid}`)}`,
        ],
      },
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'aria-allowed-role': ['error', { minScore: 0.9 }],
        'meta-description': ['error', { minScore: 0.9 }],
        canonical: ['error', { minScore: 0.9 }],
        'target-size': ['error', { minScore: 0.9 }],
        'bf-cache': ['error', { minScore: 0.9 }],
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
