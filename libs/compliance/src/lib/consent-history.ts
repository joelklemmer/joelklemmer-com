/**
 * Consent history: append-only log of consent and withdrawal events for audit.
 */
export type ConsentHistoryEventType =
  | 'grant'
  | 'withdraw'
  | 'update'
  | 'reject_non_essential'
  | 'accept_all';

export interface ConsentHistoryEntry {
  timestamp: number;
  type: ConsentHistoryEventType;
  /** Receipt hash at time of event, if applicable */
  receiptHash?: string;
  /** GPC/DNT at time of event */
  gpc?: boolean;
  dnt?: boolean;
}

const HISTORY_KEY = 'consent_history';
const MAX_ENTRIES = 100;

function getHistory(): ConsentHistoryEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is ConsentHistoryEntry =>
        e && typeof e.timestamp === 'number' && typeof e.type === 'string',
    );
  } catch {
    return [];
  }
}

function setHistory(entries: ConsentHistoryEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const trimmed = entries.slice(-MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function appendConsentHistory(entry: ConsentHistoryEntry): void {
  const history = getHistory();
  history.push(entry);
  setHistory(history);
}

export function getConsentHistory(): ConsentHistoryEntry[] {
  return getHistory();
}

export function clearConsentHistory(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}
