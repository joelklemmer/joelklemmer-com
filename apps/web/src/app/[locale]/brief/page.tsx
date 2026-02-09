import { BriefScreen, briefMetadata } from '@joelklemmer/screens';
import { BriefOpenTracker } from '../../../lib/telemetry';
import { getRequestBaseUrl } from '../../../lib/requestBaseUrl';
import { queryBriefingAction } from './actions';

/** Force dynamic so generateMetadata runs with request headers and canonical matches served URL (LHCI/SEO). */
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const baseUrl = await getRequestBaseUrl();
  return briefMetadata({ baseUrl });
}

export default function BriefPage() {
  return (
    <>
      <BriefOpenTracker />
      <BriefScreen queryBriefingAction={queryBriefingAction} />
    </>
  );
}
