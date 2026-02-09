/**
 * GPC (Global Privacy Control) and DNT (Do Not Track) detection and audit capture.
 * Client-side only; record into consent audit when present.
 */
export interface GpcDntAuditEntry {
  timestamp: number;
  gpc: boolean;
  dnt: boolean;
  /** navigator.globalPrivacyControl or equivalent */
  gpcValue?: boolean;
  /** navigator.doNotTrack */
  dntValue?: string | null;
}

/**
 * Detect GPC. In browsers that support it, navigator.globalPrivacyControl is true when user enables GPC.
 */
export function detectGpc(): boolean {
  if (typeof navigator === 'undefined') return false;
  const gpc = (navigator as unknown as { globalPrivacyControl?: boolean })
    .globalPrivacyControl;
  return gpc === true;
}

/**
 * Detect DNT. navigator.doNotTrack can be '1' or 'yes' when user enables DNT.
 */
export function detectDnt(): boolean {
  if (typeof navigator === 'undefined') return false;
  const dnt = navigator.doNotTrack;
  return dnt === '1' || dnt === 'yes' || dnt === 'true';
}

/**
 * Create audit entry for current GPC/DNT state. Call on consent surface load and on consent change.
 */
export function captureGpcDntAudit(): GpcDntAuditEntry {
  const gpc = detectGpc();
  const dnt = detectDnt();
  const dntValue =
    typeof navigator !== 'undefined' ? navigator.doNotTrack : null;
  return {
    timestamp: Date.now(),
    gpc,
    dnt,
    gpcValue: gpc,
    dntValue,
  };
}
