import {
  ProofEntryScreen,
  proofEntryMetadata,
  proofEntryStaticParams,
} from '@joelklemmer/screens';

export const generateMetadata = proofEntryMetadata;
export const generateStaticParams = proofEntryStaticParams;

export default function ProofEntryPage({
  params,
}: {
  params: { slug: string };
}) {
  return <ProofEntryScreen slug={params.slug} />;
}
