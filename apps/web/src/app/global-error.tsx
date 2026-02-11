'use client';

/**
 * Root-level error boundary. Replaces the root layout when triggered.
 * Must include <html> and <body>. Sets lang and title so a11y document-title and html-has-lang pass.
 * Minimal copy only; no i18n context available when this boundary renders.
 */
/* eslint-disable no-restricted-syntax -- global error boundary has no Intl context */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  void error; // passed by Next.js; logged or surfaced elsewhere
  return (
    <html lang="en" dir="ltr">
      <head>
        <title>Something went wrong | Joel R. Klemmer</title>
      </head>
      <body>
        <main
          className="min-h-[60vh] flex flex-col items-center justify-center p-6"
          role="main"
        >
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-4 px-4 py-2 rounded-card border border-border bg-surface hover:bg-muted/20 text-text"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
