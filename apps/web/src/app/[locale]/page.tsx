/**
 * Canonical Home route for /[locale]/ (e.g. /en, /he).
 * See: docs/authority/home-implementation-map.md
 * Performance: LCP hero preload via homeMetadata (criticalPreloadLinks in screens).
 * Metadata uses getMetadataBaseUrl() so page can be cacheable (bf-cache); CI sets NEXT_PUBLIC_SITE_URL.
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HomeScreen, homeMetadata } from '@joelklemmer/screens';
import { getMetadataBaseUrl } from '../../lib/requestBaseUrl';

export async function generateMetadata(): Promise<Metadata> {
  return homeMetadata({ baseUrl: getMetadataBaseUrl() });
}

export default function LocaleIndex() {
  return (
    <Suspense fallback={null}>
      <HomeScreen />
    </Suspense>
  );
}
