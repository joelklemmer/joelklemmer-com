import { getLocale } from 'next-intl/server';
import { BriefScreen, briefMetadata } from '@joelklemmer/screens';
import { BriefOpenTracker } from '../../../lib/telemetry';
import { getMetadataBaseUrl } from '../../../lib/requestBaseUrl';
import { queryBriefingAction } from './actions';

export async function generateMetadata() {
  return briefMetadata({ baseUrl: getMetadataBaseUrl() });
}

export default async function BriefPage() {
  const locale = await getLocale();
  return (
    <>
      <BriefOpenTracker locale={locale} />
      <BriefScreen queryBriefingAction={queryBriefingAction} />
    </>
  );
}
