import {
  CaseStudyEntryScreen,
  caseStudyEntryMetadata,
  caseStudyEntryStaticParams,
} from '@joelklemmer/screens';
import { CaseStudyEngagementTracker } from '../../../../lib/telemetry';

export const generateMetadata = caseStudyEntryMetadata;
export const generateStaticParams = caseStudyEntryStaticParams;

export default async function CaseStudyEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <>
      <CaseStudyEngagementTracker slug={slug} />
      <CaseStudyEntryScreen slug={slug} />
    </>
  );
}
