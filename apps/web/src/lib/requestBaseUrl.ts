/**
 * Request origin for canonical URLs. Use in generateMetadata so canonical
 * matches the document URL (e.g. http://127.0.0.1:port in LHCI).
 */
import { headers } from 'next/headers';

export async function getRequestBaseUrl(): Promise<string | undefined> {
  const h = await headers();
  const host = h.get('host');
  if (!host) return undefined;
  const proto =
    h.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? 'http';
  return `${proto}://${host}`;
}
