import { MediaLibraryScreen, mediaLibraryMetadata } from '@joelklemmer/screens';

export const generateMetadata = mediaLibraryMetadata;

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; page?: string }>;
}) {
  const { kind, page } = await searchParams;
  const pageNumber = page ? parseInt(page, 10) : 1;
  return <MediaLibraryScreen kind={kind ?? null} page={pageNumber} />;
}
