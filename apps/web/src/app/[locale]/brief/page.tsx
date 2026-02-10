import { BriefScreen, briefMetadata } from '@joelklemmer/screens';
import { BriefOpenTracker } from '../../../lib/telemetry';
import { getMetadataBaseUrl } from '../../../lib/requestBaseUrl';
import { queryBriefingAction } from './actions';

export async function generateMetadata() {
  return briefMetadata({ baseUrl: getMetadataBaseUrl() });
}

export default function BriefPage() {
  return (
    <>
      <BriefOpenTracker />
      <BriefScreen queryBriefingAction={queryBriefingAction} />
    </>
  );
}
