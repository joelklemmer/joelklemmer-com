export {
  CONSENT_VERSION,
  createDefaultConsentState,
  createAcceptedAllConsentState,
  createRejectNonEssentialConsentState,
  isConsentStateValid,
} from './lib/consent-state';
export type { ConsentState, ConsentCategory } from './lib/consent-state';

export {
  getConsentFromCookie,
  readConsentFromDocument,
  writeConsentToDocument,
  clearConsentCookie,
} from './lib/consent-store';
export type { ConsentStoreOptions } from './lib/consent-store';

export {
  requiresExplicitConsent,
  canLoadAnalytics,
  canLoadFunctional,
  canLoadMarketing,
  canLoadNonEssential,
} from './lib/policy-adapter';
export type { RegionHint } from './lib/policy-adapter';

export { ConsentProvider, useConsent } from './lib/ConsentContext';
export type {
  ConsentContextValue,
  ConsentProviderProps,
} from './lib/ConsentContext';

export { ScriptLoader } from './lib/ScriptLoader';
export type { ScriptLoaderProps, ScriptCategory } from './lib/ScriptLoader';

export { CookiePreferencesModal } from './lib/CookiePreferencesModal';
export { CookiePreferencesTrigger } from './lib/CookiePreferencesTrigger';
export { ConsentPreferencesForm } from './lib/ConsentPreferencesForm';
