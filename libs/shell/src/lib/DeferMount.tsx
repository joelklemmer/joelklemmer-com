'use client';

/**
 * Mounts children after first paint using requestIdleCallback (timeout 500ms) with double rAF fallback.
 * Prevents CLS by mounting into a reserved container; container must have fixed min dimensions.
 */
import { useEffect, useState, type ReactNode } from 'react';

export interface DeferMountProps {
  children: ReactNode;
  /** Optional timeout for requestIdleCallback (ms). Default 500. */
  idleTimeout?: number;
}

export function DeferMount({ children, idleTimeout = 500 }: DeferMountProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const mount = () => {
      if (cancelled) return;
      setMounted(true);
    };

    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(mount, { timeout: idleTimeout });
      return () => {
        cancelled = true;
        cancelIdleCallback(id);
      };
    }

    const t = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(mount);
      });
    }, idleTimeout);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [idleTimeout]);

  if (!mounted) return null;
  return <>{children}</>;
}
