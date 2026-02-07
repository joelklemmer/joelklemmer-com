import {
  WritingPostScreen,
  writingPostMetadata,
  writingPostStaticParams,
} from '@joelklemmer/screens';

export const generateMetadata = writingPostMetadata;
export const generateStaticParams = writingPostStaticParams;

export default function WritingPostPage({
  params,
}: {
  params: { slug: string };
}) {
  return <WritingPostScreen slug={params.slug} />;
}
