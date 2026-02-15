/**
 * Cross-surface consent sync: custom events for same-tab coordination.
 * storage event does not fire in the same tab, so we use CustomEvent.
 */

/** Fire when consent state changes (cookie written/cleared). */
export const EVENT_CONSENT_CHANGED = 'jk:consent-changed';

/** Fire to open the consent banner/dialog programmatically (e.g. from Preferences page). */
export const EVENT_OPEN_CONSENT = 'jk:open-consent';

export function dispatchConsentChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT_CONSENT_CHANGED));
}

export function openConsentBanner(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(EVENT_OPEN_CONSENT));
}
