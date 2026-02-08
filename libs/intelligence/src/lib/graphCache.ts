/**
 * Graph cache adapter: memoized per request, deterministic, SSR safe, zero global mutation.
 * Prepares for future server streaming and vector indexing.
 */

import { buildEntityGraph } from './buildEntityGraph';
import type { EntityGraph } from './types';

/** Per-request cache key. */
const CACHE_KEY = Symbol.for('@joelklemmer/intelligence:entityGraph');

/** Request-scoped cache map. Caller creates and passes to getEntityGraph for memoization. */
export type RequestCache = Map<symbol, Promise<EntityGraph>>;

/**
 * Returns the entity graph. When requestCache is provided, the graph is memoized for that
 * request so multiple callers receive the same promise and result. Deterministic and SSR safe;
 * no global state is mutated. When requestCache is omitted, each call builds a fresh graph.
 */
export async function getEntityGraph(
  requestCache?: RequestCache,
): Promise<EntityGraph> {
  if (requestCache) {
    let p = requestCache.get(CACHE_KEY);
    if (!p) {
      p = buildEntityGraph();
      requestCache.set(CACHE_KEY, p);
    }
    return p;
  }
  return buildEntityGraph();
}

/**
 * Creates a new request-scoped cache. Pass to getEntityGraph() at the start of a request
 * for memoized per-request graph. Caller owns the Map; zero global mutation.
 */
export function createRequestCache(): RequestCache {
  return new Map();
}
