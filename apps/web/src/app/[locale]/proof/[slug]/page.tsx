import {
  ProofEntryScreen,
  proofEntryMetadata,
  proofEntryStaticParams,
} from '@joelklemmer/screens';

export const generateMetadata = proofEntryMetadata;
export const generateStaticParams = proofEntryStaticParams;

export default async function ProofEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProofEntryScreen slug={slug} />;
}
