/**
 * Canonical Home route for /[locale]/ (e.g. /en, /he).
 * See: docs/authority/home-implementation-map.md
 * Performance: LCP hero preload via homeMetadata (criticalPreloadLinks in screens).
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HomeScreen, homeMetadata } from '@joelklemmer/screens';

export async function generateMetadata(): Promise<Metadata> {
  return homeMetadata();
}

export default function LocaleIndex() {
  return (
    <Suspense fallback={null}>
      <HomeScreen />
    </Suspense>
  );
}
