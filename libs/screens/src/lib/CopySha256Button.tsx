'use client';

import { focusRingClass } from '@joelklemmer/a11y';

export function CopySha256Button({
  sha256,
  copyLabel,
}: {
  sha256: string;
  copyLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(sha256);
      }}
      className={`${focusRingClass} ml-2 rounded-none border border-muted bg-transparent px-2 py-0.5 text-xs`}
      title={sha256}
      aria-label={copyLabel}
    >
      {copyLabel}
    </button>
  );
}
