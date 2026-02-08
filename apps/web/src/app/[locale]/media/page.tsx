import { MediaLibraryScreen, mediaLibraryMetadata } from '@joelklemmer/screens';

export const generateMetadata = mediaLibraryMetadata;

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  return <MediaLibraryScreen kind={kind ?? null} />;
}
