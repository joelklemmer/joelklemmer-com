import {
  BookEntryScreen,
  bookEntryMetadata,
  bookEntryStaticParams,
} from '@joelklemmer/screens';

export const generateMetadata = bookEntryMetadata;
export const generateStaticParams = bookEntryStaticParams;

export default async function BookEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BookEntryScreen slug={slug} />;
}
