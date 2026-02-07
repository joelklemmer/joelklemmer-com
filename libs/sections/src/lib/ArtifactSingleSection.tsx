import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface ArtifactSingleSectionProps {
  title: string;
  lede?: string;
  /** When null, show notPublishedMessage */
  artifact: {
    title: string;
    version: string;
    date: string;
    href: string;
  } | null;
  notPublishedMessage: string;
  downloadLabel: string;
}

export function ArtifactSingleSection({
  title,
  lede,
  artifact,
  notPublishedMessage,
  downloadLabel,
}: ArtifactSingleSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <h2 className="text-title font-semibold">{title}</h2>
        {lede ? <p className="text-base text-muted">{lede}</p> : null}
        <div className="mt-3 rounded-card border border-border bg-surface p-4">
          {artifact ? (
            <>
              <p className="font-medium text-text">{artifact.title}</p>
              <p className="text-sm text-muted">
                {artifact.version} · {artifact.date}
              </p>
              <Link
                href={artifact.href}
                className={`mt-2 inline-block ${focusRingClass} text-sm underline underline-offset-4 hover:text-accent`}
              >
                {downloadLabel}
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted">{notPublishedMessage}</p>
          )}
        </div>
      </Container>
    </section>
  );
}
