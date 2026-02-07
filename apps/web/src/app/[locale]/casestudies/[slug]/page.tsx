import {
  CaseStudyEntryScreen,
  caseStudyEntryMetadata,
  caseStudyEntryStaticParams,
} from '@joelklemmer/screens';

export const generateMetadata = caseStudyEntryMetadata;
export const generateStaticParams = caseStudyEntryStaticParams;

export default async function CaseStudyEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CaseStudyEntryScreen slug={slug} />;
}
