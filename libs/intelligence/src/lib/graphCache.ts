/**
 * Graph cache adapter: memoized per request, deterministic, SSR safe, zero global mutation.
 * Prepares for future server streaming and vector indexing.
 */

import {
  buildEntityGraph,
  type BuildEntityGraphOptions,
} from './buildEntityGraph';
import type { EntityGraph } from './types';

/** Per-request cache key. */
const CACHE_KEY = Symbol.for('@joelklemmer/intelligence:entityGraph');

/** Request-scoped cache map. Caller creates and passes to getEntityGraph for memoization. */
export type RequestCache = Map<symbol, Promise<EntityGraph>>;

/**
 * Returns the entity graph. When requestCache is provided, the graph is memoized for that
 * request so multiple callers receive the same promise and result. Deterministic and SSR safe;
 * no global state is mutated. When requestCache is omitted, each call builds a fresh graph.
 * Pass options.getSignalVector to attach authority signal vectors (UASIL).
 */
export async function getEntityGraph(
  requestCache?: RequestCache,
  options?: BuildEntityGraphOptions,
): Promise<EntityGraph> {
  if (requestCache) {
    const cacheKey = options?.getSignalVector
      ? Symbol.for('@joelklemmer/intelligence:entityGraph:withSignals')
      : CACHE_KEY;
    let p = requestCache.get(cacheKey);
    if (!p) {
      p = buildEntityGraph(options);
      requestCache.set(cacheKey, p);
    }
    return p;
  }
  return buildEntityGraph(options);
}

/**
 * Creates a new request-scoped cache. Pass to getEntityGraph() at the start of a request
 * for memoized per-request graph. Caller owns the Map; zero global mutation.
 */
export function createRequestCache(): RequestCache {
  return new Map();
}
