'use client';

import { focusRingClass } from '@joelklemmer/a11y';

export function CopyLinkButton({ url, label }: { url: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => void navigator.clipboard.writeText(url)}
      className={`${focusRingClass} text-sm underline underline-offset-4 hover:text-accent bg-transparent border-0 cursor-pointer p-0`}
    >
      {label}
    </button>
  );
}
