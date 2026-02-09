import { MediaLibraryScreen, mediaLibraryMetadata } from '@joelklemmer/screens';
import { getRequestBaseUrl } from '../../../lib/requestBaseUrl';

/** Force dynamic so generateMetadata runs with request headers and canonical matches served URL (LHCI/SEO). */
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const baseUrl = await getRequestBaseUrl();
  return mediaLibraryMetadata({ baseUrl });
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
