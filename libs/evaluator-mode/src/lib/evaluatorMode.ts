/**
 * Evaluator Mode: context modulation for authority signal resolution.
 * EIL: Experience Intelligence Layer. Silent context; no visible UI in this wave.
 */

export const EVALUATOR_MODES = [
  'executive',
  'board',
  'public_service',
  'investor',
  'media',
  'default',
] as const;

export type EvaluatorMode = (typeof EVALUATOR_MODES)[number];

export const DEFAULT_EVALUATOR_MODE: EvaluatorMode = 'default';

const VALID_MODES = new Set<string>(EVALUATOR_MODES);

function parseMode(value: string | null | undefined): EvaluatorMode | null {
  if (!value || typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return VALID_MODES.has(normalized) ? (normalized as EvaluatorMode) : null;
}

export interface ResolveEvaluatorModeRequest {
  /** Cookie header or document.cookie-style string. */
  cookies?: string | Record<string, string>;
  /** Query/search param for ?mode= (honored only when isDev is true in production). */
  searchParams?: Record<string, string | string[] | undefined>;
  /** When false, query param mode is ignored (production gate). */
  isDev?: boolean;
}

/**
 * Resolve evaluator mode from request-like input.
 * Order: cookie (explicit user choice) > query param ?mode= (dev only) > default.
 * Production: query param is gated; only cookie and default apply.
 */
export function resolveEvaluatorMode(
  request: ResolveEvaluatorModeRequest = {},
): EvaluatorMode {
  const { cookies, searchParams, isDev = false } = request;

  // Cookie: single value e.g. evaluator_mode=executive
  if (cookies) {
    const cookieStr =
      typeof cookies === 'string' ? cookies : cookieRecordToString(cookies);
    const match = cookieStr.match(/(?:^|;\s*)evaluator_mode\s*=\s*([^;]+)/);
    const fromCookie = parseMode(match?.[1]?.trim());
    if (fromCookie) return fromCookie;
  }

  // Query param: allowed only in dev
  if (isDev && searchParams) {
    const modeParam = searchParams['mode'];
    const value = Array.isArray(modeParam) ? modeParam[0] : modeParam;
    const fromQuery = parseMode(value);
    if (fromQuery) return fromQuery;
  }

  return DEFAULT_EVALUATOR_MODE;
}

function cookieRecordToString(record: Record<string, string>): string {
  return Object.entries(record)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}
