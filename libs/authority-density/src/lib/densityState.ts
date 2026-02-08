/**
 * Authority Density View: compressed scanning mode for evaluator-grade surfaces.
 * EIL: state + optional URL hash; no route changes.
 */

const DENSITY_HASH = 'density';

export function isDensityHashPresent(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hash === `#${DENSITY_HASH}` ||
    window.location.hash.slice(1) === DENSITY_HASH
  );
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

export function getDensityHash(): string {
  return DENSITY_HASH;
}
