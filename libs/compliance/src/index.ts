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
export {
  CookiePreferencesOpenProvider,
  useCookiePreferencesOpen,
} from './lib/CookiePreferencesOpenContext';
export type { CookiePreferencesOpenContextValue } from './lib/CookiePreferencesOpenContext';

export type {
  ConsentCategory as ConsentCategoryV2,
  PurposeScope,
  DataSensitivity,
} from './lib/categories';
export {
  CONSENT_CATEGORIES,
  PURPOSE_SCOPES,
  DATA_SENSITIVITY_LEVELS,
  ESSENTIAL_CATEGORY,
  isEssentialCategory,
  isNonEssentialCategory,
} from './lib/categories';

export {
  CONSENT_VERSION as CONSENT_VERSION_V2,
  createDefaultConsentState as createDefaultConsentStateV2,
  createAcceptedAllConsentState as createAcceptedAllConsentStateV2,
  createRejectNonEssentialConsentState as createRejectNonEssentialConsentStateV2,
  isConsentStateValid as isConsentStateValidV2,
  migrateStateFromV1,
} from './lib/consent-state-v2';
export type { ConsentState as ConsentStateV2 } from './lib/consent-state-v2';

export {
  createConsentReceiptSync,
  createConsentReceipt,
  verifyReceiptHash,
} from './lib/receipt';
export type { ConsentReceipt, NormalizedConsentPayload } from './lib/receipt';

export {
  appendConsentHistory,
  getConsentHistory,
  clearConsentHistory,
} from './lib/consent-history';
export type {
  ConsentHistoryEntry,
  ConsentHistoryEventType,
} from './lib/consent-history';

export {
  resolveRegionPolicy,
  mayLoadNonEssentialWithoutConsent,
} from './lib/region-resolver';
export type { RegionCode, RegionPolicy } from './lib/region-resolver';

export { detectGpc, detectDnt, captureGpcDntAudit } from './lib/gpc-dnt';
export type { GpcDntAuditEntry } from './lib/gpc-dnt';

export { resolveAllowedVendors, cascadeDisable } from './lib/dependency-graph';
export type { VendorRegistryEntry } from './lib/dependency-graph';

export {
  registerRevocationHook,
  runRevocationHooks,
} from './lib/revocation-hooks';

export {
  getConsentFromCookieV2,
  readConsentFromDocumentV2,
  writeConsentToDocumentV2,
  clearConsentCookieV2,
  saveConsentWithReceipt,
  persistReceipt,
  readStoredReceipt,
  clearStoredReceipt,
} from './lib/consent-store-v2';

export {
  canLoadCategoryV2,
  canLoadAnalyticsV2,
  canLoadFunctionalV2,
  canLoadMarketingV2,
  canLoadExperienceV2,
  canLoadNonEssentialV2,
  hasPurpose,
  canUsePersonalization,
} from './lib/policy-adapter-v2';

export { ConsentProviderV2, useConsentV2 } from './lib/ConsentContextV2';
export type {
  ConsentContextValueV2,
  ConsentProviderV2Props,
} from './lib/ConsentContextV2';

export { EmbedGate } from './lib/EmbedGate';
export type { EmbedGateProps } from './lib/EmbedGate';

export { ScriptLoaderV2 } from './lib/ScriptLoaderV2';
export type {
  ScriptLoaderV2Props,
  ScriptCategoryV2,
} from './lib/ScriptLoaderV2';

export { ConsentSurfaceV2 } from './lib/ConsentSurfaceV2';
export type { ConsentSurfaceV2Props } from './lib/ConsentSurfaceV2';

export { ConsentBannerSSR } from './lib/ConsentBannerSSR';
export type { ConsentBannerSSRProps } from './lib/ConsentBannerSSR';
export { ConsentBannerSlot } from './lib/ConsentBannerSlot';
export type { ConsentBannerSlotProps } from './lib/ConsentBannerSlot';
export { ConsentActionsIsland } from './lib/ConsentActionsIsland';
export { ConsentClient } from './lib/ConsentClient';
export type { ConsentClientProps } from './lib/ConsentClient';

export { ConsentPreferencesForm } from './lib/ConsentPreferencesForm';
