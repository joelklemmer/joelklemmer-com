import { MediaLibraryScreen, mediaLibraryMetadata } from '@joelklemmer/screens';
import { getMetadataBaseUrl } from '../../../lib/requestBaseUrl';

export async function generateMetadata() {
  return mediaLibraryMetadata({ baseUrl: getMetadataBaseUrl() });
}

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; page?: string }>;
}) {
  const { kind, page } = await searchParams;
  const pageNumber = page ? parseInt(page, 10) : 1;
  return <MediaLibraryScreen kind={kind ?? null} page={pageNumber} />;
}
