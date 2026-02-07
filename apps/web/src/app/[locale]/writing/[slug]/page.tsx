import {
  WritingPostScreen,
  writingPostMetadata,
  writingPostStaticParams,
} from '@joelklemmer/screens';

export const generateMetadata = writingPostMetadata;
export const generateStaticParams = writingPostStaticParams;

export default async function WritingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <WritingPostScreen slug={slug} />;
}
