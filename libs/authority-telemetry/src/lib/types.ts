import type { TelemetryEventName } from './events';

/** Payload for route_view: pathname and optional locale. */
export interface RouteViewPayload {
  pathname: string;
  locale?: string;
}

/** Payload for brief_open: optional locale. */
export interface BriefOpenPayload {
  locale?: string;
}

/** Payload for case_study_engagement: slug and optional locale. */
export interface CaseStudyEngagementPayload {
  slug: string;
  locale?: string;
}

export type TelemetryPayload =
  | RouteViewPayload
  | BriefOpenPayload
  | CaseStudyEngagementPayload
  | Record<string, unknown>;

/** Single event as passed to providers and debug log. */
export interface TelemetryEventRecord {
  name: TelemetryEventName | string;
  payload: TelemetryPayload;
  timestamp: number;
}

/**
 * Pluggable telemetry backend. Implement this to send events to a vendor or custom backend.
 * Only receives events when consent is granted (privacy-first).
 */
export interface TelemetryProviderBackend {
  /** Send a single event. Called only when user has consented. */
  track(event: TelemetryEventRecord): void | Promise<void>;
}
