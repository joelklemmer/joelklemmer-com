/**
 * Authority Density View: compressed scanning mode for evaluator-grade surfaces.
 * EIL: state + optional URL hash + cookie for SSR; no route changes.
 */

const DENSITY_HASH = 'density';
const DENSITY_COOKIE = 'joelklemmer-density';
const DENSITY_COOKIE_MAX_AGE_DAYS = 365;

export function isDensityHashPresent(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hash === `#${DENSITY_HASH}` ||
    window.location.hash.slice(1) === DENSITY_HASH
  );
}

export function isDensityOnFromSSR(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-density') === 'on';
}

export function setDensityHash(on: boolean): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (on) {
    url.hash = DENSITY_HASH;
  } else {
    url.hash = '';
  }
  window.history.replaceState(null, '', url.toString());
}

export function setDensityCookie(on: boolean): void {
  try {
    if (typeof document === 'undefined') return;
    const value = on ? 'on' : 'off';
    document.cookie = `${DENSITY_COOKIE}=${value}; path=/; max-age=${
      DENSITY_COOKIE_MAX_AGE_DAYS * 86400
    }; SameSite=Lax`;
    document.documentElement.setAttribute('data-density', value);
  } catch {
    // Ignore
  }
}

export function getDensityHash(): string {
  return DENSITY_HASH;
}
