'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { BriefNavStatic } from './BriefNavStatic';
import type { BriefNavigatorProps } from './briefNavigatorTypes';

const IDLE_TIMEOUT_MS = 500;

const BriefNavigatorLazy = React.lazy(() =>
  import('./BriefNavigator.client').then((m) => ({
    default: m.BriefNavigator,
  })),
);

/**
 * Renders static nav (BriefNavStatic) immediately for SSR and first paint;
 * after requestIdleCallback loads BriefNavigator and replaces with full interactive nav.
 * Keeps BriefNavigator (and any shared deps) out of the initial route chunk.
 */
export function DeferredBriefNavigator(props: BriefNavigatorProps) {
  const [useInteractive, setUseInteractive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const mount = () => {
      if (cancelled) return;
      setUseInteractive(true);
    };

    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(mount, { timeout: IDLE_TIMEOUT_MS });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }

    const t = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(mount);
      });
    }, IDLE_TIMEOUT_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  if (!useInteractive) {
    return <BriefNavStatic {...props} />;
  }

  return (
    <Suspense fallback={<BriefNavStatic {...props} />}>
      <BriefNavigatorLazy {...props} />
    </Suspense>
  );
}
