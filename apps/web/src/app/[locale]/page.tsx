/**
 * Canonical Home route for /[locale]/ (e.g. /en, /he).
 * See: docs/authority/home-implementation-map.md
 */
import { HomeScreen, homeMetadata } from '@joelklemmer/screens';

export const generateMetadata = homeMetadata;

export default function LocaleIndex() {
  return <HomeScreen />;
}
