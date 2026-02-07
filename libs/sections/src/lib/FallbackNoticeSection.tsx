import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface FallbackNoticeSectionProps {
  title: string;
  body: string;
  linkLabel: string;
  href: string;
}

export function FallbackNoticeSection({
  title,
  body,
  linkLabel,
  href,
}: FallbackNoticeSectionProps) {
  return (
    <section className="border-b border-border bg-bg">
      <Container className="py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {title}
        </p>
        <p className="mt-2 text-sm text-muted">{body}</p>
        <Link
          href={href}
          className={`${focusRingClass} mt-2 inline-flex text-sm underline underline-offset-4`}
        >
          {linkLabel}
        </Link>
      </Container>
    </section>
  );
}
