'use client';

import { useEffect, useRef } from 'react';

const PERF_MARKS_ENABLED =
  typeof process !== 'undefined' &&
  process.env['NEXT_PUBLIC_PERF_MARKS'] === '1';

const MARKS_WINDOW_KEY = '__PERF_MARKS__';

export interface PerfMarksResult {
  fcpMs: number | null;
  hydrationStartMs: number | null;
  hydrationEndMs: number | null;
  longTaskCountFirst2s: number;
}

declare global {
  interface Window {
    [MARKS_WINDOW_KEY]?: PerfMarksResult;
  }
}

/**
 * Production-only performance mark system. Gate with NEXT_PUBLIC_PERF_MARKS=1.
 * Records: FCP, hydration start/end (approx), long tasks >50ms in first 2s.
 * Zero third-party deps. Used to prove hydration cost reduction.
 */
export function PerfMarks() {
  const hydrationStartRef = useRef<number | null>(null);
  const LONG_TASK_THRESHOLD_MS = 50;
  const OBSERVE_WINDOW_MS = 2000;

  if (typeof performance === 'undefined' || !PERF_MARKS_ENABLED) {
    return null;
  }

  if (hydrationStartRef.current === null) {
    performance.mark('hydration-start');
    hydrationStartRef.current = performance.now();
  }

  useEffect(() => {
    if (!PERF_MARKS_ENABLED || typeof performance === 'undefined') return;

    performance.mark('hydration-end');
    const hydrationEnd = performance.now();
    const hydrationStart = hydrationStartRef.current ?? hydrationEnd;

    let fcpMs: number | null = null;
    try {
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find((e) => e.name === 'first-contentful-paint');
      if (fcp) fcpMs = fcp.startTime;
    } catch {
      // ignore
    }

    let longTaskCountFirst2s = 0;
    const startTime = performance.now();

    const writeResult = (count: number) => {
      const result: PerfMarksResult = {
        fcpMs,
        hydrationStartMs: hydrationStart,
        hydrationEndMs: hydrationEnd,
        longTaskCountFirst2s: count,
      };
      if (typeof window !== 'undefined') {
        window[MARKS_WINDOW_KEY] = result;
      }
    };

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const duration =
            'duration' in entry ? (entry as PerformanceEntry).duration : 0;
          if (duration >= LONG_TASK_THRESHOLD_MS) longTaskCountFirst2s++;
        }
      });
      observer.observe({ type: 'longtask' as const, buffered: true });
      writeResult(0);
      setTimeout(
        () => {
          observer.disconnect();
          writeResult(longTaskCountFirst2s);
        },
        Math.max(0, OBSERVE_WINDOW_MS - (performance.now() - startTime)),
      );
    } catch {
      writeResult(0);
    }
  }, []);

  return null;
}
