//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');
// Bundle analyzer: pnpm run build:analyze (ANALYZE=true) to inspect bundle size and heavy imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  // Deterministic build/start path: Nx outputPath is apps/web, so distDir resolves to apps/web/.next; next start (cwd=apps/web) finds the same path.
  distDir: '.next',
  // Reduce JS on critical routes: tree-shake barrel imports from workspace libs (cognitive load reduction).
  experimental: {
    optimizePackageImports: [
      '@joelklemmer/ui',
      '@joelklemmer/sections',
      '@joelklemmer/a11y',
      '@joelklemmer/seo',
    ],
  },
  images: {
    qualities: [75, 90],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000,
  },
  // Strategic prefetch: Next.js prefetches Link by default in viewport; no over-prefetch config needed
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value:
          'accelerometer=(), autoplay=(), camera=(), cross-origin-isolated=(), ' +
          'display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), ' +
          'gyroscope=(), magnetometer=(), microphone=(), midi=(), ' +
          'payment=(), picture-in-picture=(), publickey-credentials-get=(), ' +
          'screen-wake-lock=(), usb=(), web-share=(), xr-spatial-tracking=()',
      },
      // CSP: strict where possible. script/style unsafe-inline/unsafe-eval required for Next.js;
      // for stricter policy use nonces (Next.js supports middleware nonce injection).
      {
        key: 'Content-Security-Policy',
        value:
          "default-src 'self'; " +
          "base-uri 'self'; " +
          "object-src 'none'; " +
          "form-action 'self'; " +
          "frame-ancestors 'none'; " +
          "frame-src 'none'; " +
          "img-src 'self' data: blob: https:; " +
          "font-src 'self' data:; " +
          "style-src 'self' 'unsafe-inline'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "connect-src 'self' https: ws: wss:; " +
          'upgrade-insecure-requests;',
      },
    ];

    if (process.env.NODE_ENV === 'production') {
      securityHeaders.unshift({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });
    }

    const mediaCacheHeaders = [
      {
        source: '/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
    const staticAssetCacheHeaders = [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
    const sitemapCacheHeaders = [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/sitemap-images',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
    const immutablePublicAssets = [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/.well-known/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
    return [
      ...staticAssetCacheHeaders,
      ...mediaCacheHeaders,
      ...sitemapCacheHeaders,
      ...immutablePublicAssets,
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

const plugins = [withBundleAnalyzer, withNx, withNextIntl];

module.exports = composePlugins(...plugins)(nextConfig);
