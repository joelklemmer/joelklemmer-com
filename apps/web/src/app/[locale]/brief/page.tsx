import { BriefScreen, briefMetadata } from '@joelklemmer/screens';
import { queryBriefingAction } from './actions';

export const generateMetadata = briefMetadata;

export default function BriefPage() {
  return <BriefScreen queryBriefingAction={queryBriefingAction} />;
}
