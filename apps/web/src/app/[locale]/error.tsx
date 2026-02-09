'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Error boundary for [locale] segment. Ensures document title is set for a11y.
 * Renders inside root layout so html[lang] is already set by root layout.
 */
export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('meta');

  useEffect(() => {
    document.title = t('error.title');
  }, [t]);

  return (
    <main
      className="min-h-[60vh] flex flex-col items-center justify-center p-6"
      role="main"
    >
      <h1 className="text-xl font-semibold text-text">{t('error.title')}</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-4 px-4 py-2 rounded-card border border-border bg-surface hover:bg-muted/20 text-text"
      >
        {t('error.tryAgain')}
      </button>
    </main>
  );
}
