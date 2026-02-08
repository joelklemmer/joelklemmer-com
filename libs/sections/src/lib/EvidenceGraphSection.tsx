import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface EvidenceGraphNodeDisplay {
  id: string;
  label: string;
  href?: string;
  linkedLabels: string[];
}

export interface EvidenceGraphSectionProps {
  title: string;
  /** Label for the "trace path" list (e.g. "Linked"). */
  tracePathLabel: string;
  nodes: EvidenceGraphNodeDisplay[];
}

/**
 * Evidence Graph Surface v1: minimal, list-based, proof-forward.
 * Keyboard navigable; focusable nodes; trace path = short list of linked entities.
 */
export function EvidenceGraphSection({
  title,
  tracePathLabel,
  nodes,
}: EvidenceGraphSectionProps) {
  if (nodes.length === 0) return null;

  return (
    <section className="section-shell" aria-label={title}>
      <Container className="section-shell">
        <h2 className="text-section-heading font-semibold">{title}</h2>
        <ul className="grid gap-4 text-sm text-muted list-none p-0 m-0">
          {nodes.map((node) => (
            <li key={node.id} className="section-shell">
              {node.href ? (
                <Link
                  href={node.href}
                  className={`block ${focusRingClass} underline underline-offset-4 hover:text-accent rounded focus-visible:ring-offset-2`}
                >
                  <span className="font-medium text-text">{node.label}</span>
                </Link>
              ) : (
                <span className="font-medium text-text">{node.label}</span>
              )}
              {node.linkedLabels.length > 0 ? (
                <p className="mt-1 text-xs text-muted">
                  <span className="font-medium">{tracePathLabel}: </span>
                  {node.linkedLabels.join(', ')}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
