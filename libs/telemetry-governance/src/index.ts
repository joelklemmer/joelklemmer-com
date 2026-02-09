export type {
  TelemetryRegistry,
  TelemetryEventEntry,
} from './lib/registry-types';
export {
  parseTelemetryRegistry,
  getEventClassification,
} from './lib/registry-types';
export {
  shouldEmitEvent,
  filterPayloadByClassification,
} from './lib/emission-guard';
export type { ConsentStateForGuard } from './lib/emission-guard';
