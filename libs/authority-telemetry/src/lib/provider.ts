import type { TelemetryProviderBackend } from './types';
import type { TelemetryEventRecord } from './types';

/** No-op provider: events are dropped. Use as default or when consent is not given. */
export const noOpProvider: TelemetryProviderBackend = {
  track(_event: TelemetryEventRecord) {
    // no-op
  },
};
