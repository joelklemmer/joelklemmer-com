/**
 * Canonical telemetry event names. Use these when calling track() to keep events consistent.
 */
export const TELEMETRY_EVENTS = {
  ROUTE_VIEW: 'route_view',
  BRIEF_OPEN: 'brief_open',
  CASE_STUDY_ENGAGEMENT: 'case_study_engagement',
} as const;

export type TelemetryEventName =
  (typeof TELEMETRY_EVENTS)[keyof typeof TELEMETRY_EVENTS];
