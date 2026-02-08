'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { focusRingClass } from '@joelklemmer/a11y';
import { useDensityView } from './DensityViewContext';
import { isDensityHashPresent } from './densityState';

export interface DensityViewToggleProps {
  /** Accessible label for the toggle (e.g. from common.density.toggleLabel). */
  label: string;
}

/**
 * Keyboard-accessible toggle for density view. No visible label text by default;
 * use label for screen readers and aria-pressed for state.
 */
export function DensityViewToggle({ label }: DensityViewToggleProps) {
  const { isDensityOn, toggleDensity } = useDensityView();
  return (
    <button
      type="button"
      onClick={toggleDensity}
      aria-pressed={isDensityOn}
      className={`text-xs text-muted hover:text-accent transition-colors motion-reduce:transition-none ${focusRingClass}`}
      title={label}
    >
      <span aria-hidden>{label}</span>
    </button>
  );
}

export interface DensityAwarePageProps {
  children: ReactNode;
  /** Label for the density toggle (i18n). */
  toggleLabel: string;
  /** When true, orchestration suggests starting in density view; applied only if URL hash is not set (user preference wins). */
  densityDefault?: boolean;
}

/**
 * Wraps evaluator-facing page content with density view container and toggle.
 * When density is on, the wrapper has data-density="on" for token-driven layout.
 * Optional densityDefault: apply suggested density on mount when no hash is present.
 */
export function DensityAwarePage({
  children,
  toggleLabel,
  densityDefault,
}: DensityAwarePageProps) {
  const { isDensityOn, setDensityOn } = useDensityView();
  const appliedRef = useRef(false);

  useEffect(() => {
    if (
      !densityDefault ||
      appliedRef.current ||
      typeof window === 'undefined' ||
      isDensityHashPresent()
    )
      return;
    appliedRef.current = true;
    setDensityOn(true);
  }, [densityDefault, setDensityOn]);

  return (
    <>
      <div className="flex justify-end mb-2">
        <DensityViewToggle label={toggleLabel} />
      </div>
      <div
        data-density={isDensityOn ? 'on' : undefined}
        className={isDensityOn ? 'authority-density-root' : undefined}
      >
        {children}
      </div>
    </>
  );
}
