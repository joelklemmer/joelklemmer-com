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
    /** SHA-256 checksum for verification */
    checksum?: string;
    /** Document scope label (e.g. canonical briefing document) */
    scopeLabel?: string;
  } | null;
  notPublishedMessage: string;
  downloadLabel: string;
  checksumLabel?: string;
  scopeLabelHeading?: string;
}

export function ArtifactSingleSection({
  title,
  lede,
  artifact,
  notPublishedMessage,
  downloadLabel,
  checksumLabel,
  scopeLabelHeading,
}: ArtifactSingleSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <h2 className="text-section-heading font-semibold">{title}</h2>
        {lede ? <p className="text-base text-muted">{lede}</p> : null}
        <div className="mt-3 authority-card p-4">
          {artifact ? (
            <>
              <p className="font-medium text-text">{artifact.title}</p>
              <p className="text-sm text-muted">
                {artifact.version} · {artifact.date}
              </p>
              {artifact.scopeLabel && scopeLabelHeading ? (
                <p className="mt-1 text-xs text-muted">
                  <span className="font-medium">{scopeLabelHeading}: </span>
                  {artifact.scopeLabel}
                </p>
              ) : null}
              {artifact.checksum && checksumLabel ? (
                <p
                  className="mt-1 font-mono text-xs text-muted"
                  title={checksumLabel}
                >
                  <span className="font-medium">{checksumLabel}: </span>
                  <span className="break-all">{artifact.checksum}</span>
                </p>
              ) : null}
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
