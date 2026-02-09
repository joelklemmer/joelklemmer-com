import { BriefScreen, briefMetadata } from '@joelklemmer/screens';
import { BriefOpenTracker } from '../../../lib/telemetry';
import { queryBriefingAction } from './actions';

export const generateMetadata = briefMetadata;

export default function BriefPage() {
  return (
    <>
      <BriefOpenTracker />
      <BriefScreen queryBriefingAction={queryBriefingAction} />
    </>
  );
}
