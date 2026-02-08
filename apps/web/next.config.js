//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
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
      {
        key: 'Content-Security-Policy',
        value:
          "default-src 'self'; " +
          "base-uri 'self'; " +
          "form-action 'self'; " +
          "frame-ancestors 'none'; " +
          "img-src 'self' data: blob: https:; " +
          "font-src 'self' data:; " +
          "style-src 'self' 'unsafe-inline'; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "connect-src 'self' https: ws: wss:;",
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
    return [
      ...mediaCacheHeaders,
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
  withNextIntl,
];

module.exports = composePlugins(...plugins)(nextConfig);
