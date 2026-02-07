import type { ReactNode } from 'react';
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface HeroAction {
  label: string;
  href: string;
}

export interface HeroSectionProps {
  title: string;
  lede?: string;
  actions?: HeroAction[];
  children?: ReactNode;
}

export function HeroSection({
  title,
  lede,
  actions,
  children,
}: HeroSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <h1 className="text-display font-semibold tracking-tight">{title}</h1>
        {lede ? <p className="max-w-2xl text-lg text-muted">{lede}</p> : null}
        {actions?.length ? (
          <div className="flex flex-wrap gap-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`${focusRingClass} rounded-md border border-border px-4 py-2 text-sm font-medium text-text hover:border-accent hover:text-accent`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
