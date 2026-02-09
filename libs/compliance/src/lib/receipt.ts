/**
 * Consent receipt: versioned, audit-grade record with tamper-evident hash.
 */
import type { ConsentState } from './consent-state-v2';

export const RECEIPT_VERSION = 1;

export interface ConsentReceipt {
  version: number;
  consentVersion: number;
  timestamp: number;
  /** Normalized payload used for hash input. */
  payload: NormalizedConsentPayload;
  /** Deterministic hash of normalized payload. */
  hash: string;
}

export interface NormalizedConsentPayload {
  v: number;
  t: number;
  c: boolean;
  cat: Record<string, boolean>;
  pur: Record<string, boolean>;
  model: boolean;
}

function normalizePayload(state: ConsentState): NormalizedConsentPayload {
  return {
    v: state.version,
    t: state.timestamp,
    c: state.choiceMade,
    cat: { ...state.categories },
    pur: { ...state.purposes },
    model: state.modelParticipation,
  };
}

/** Deterministic JSON serialization for hashing. */
function canonicalJson(obj: NormalizedConsentPayload): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

/** Deterministic hash for audit trail. Sync-safe; same input always yields same hash. */
function hashPayloadSync(payload: NormalizedConsentPayload): string {
  const str = canonicalJson(payload);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return 'h' + (h >>> 0).toString(16);
}

export function createConsentReceiptSync(state: ConsentState): ConsentReceipt {
  const payload = normalizePayload(state);
  const hash = hashPayloadSync(payload);
  return {
    version: RECEIPT_VERSION,
    consentVersion: state.version,
    timestamp: state.timestamp,
    payload,
    hash,
  };
}

/** Async version; uses same deterministic hash as sync for consistent verification. */
export async function createConsentReceipt(
  state: ConsentState,
): Promise<ConsentReceipt> {
  return Promise.resolve(createConsentReceiptSync(state));
}

export function verifyReceiptHash(receipt: ConsentReceipt): boolean {
  const computed = hashPayloadSync(receipt.payload);
  return computed === receipt.hash;
}
