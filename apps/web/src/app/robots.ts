import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const normalizedBase = baseUrl.replace(/\/+$/, '');

/**
 * robots.txt: full site crawlable; API and build artifacts disallowed.
 * Canonical host is inferred by crawlers from metadata canonical URLs and NEXT_PUBLIC_SITE_URL.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', '/_next', '/api/'],
      },
    ],
    sitemap: [
      `${normalizedBase}/sitemap.xml`,
      `${normalizedBase}/sitemap-images`,
    ],
  };
}
