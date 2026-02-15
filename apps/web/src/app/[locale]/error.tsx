'use client';

import { useEffect } from 'react';

/** Fallback strings when NextIntlClientProvider is unavailable (e.g. layout error before provider mounts). */
const ERROR_TITLE = 'Something went wrong';
const TRY_AGAIN = 'Try again';

/**
 * Error boundary for [locale] segment. Ensures document title is set for a11y.
 * Renders inside root layout so html[lang] is already set by root layout.
 * Does not use useTranslations — can render outside NextIntlClientProvider when layout fails.
 */
export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    document.title = `${ERROR_TITLE} | Joel R. Klemmer`;
  }, []);

  return (
    <main
      className="min-h-[60vh] flex flex-col items-center justify-center p-6"
      role="main"
    >
      <h1 className="text-xl font-semibold text-text">{ERROR_TITLE}</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-4 px-4 py-2 rounded-none border border-border bg-surface hover:bg-muted/20 text-text"
      >
        {TRY_AGAIN}
      </button>
    </main>
  );
}
