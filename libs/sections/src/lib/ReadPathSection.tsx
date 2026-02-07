import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface ReadPathRoute {
  label: string;
  href: string;
}

export interface ReadPathSectionProps {
  title: string;
  lede?: string;
  routes: ReadPathRoute[];
}

export function ReadPathSection({ title, lede, routes }: ReadPathSectionProps) {
  return (
    <section className="section-shell">
      <Container className="section-shell">
        <h2 className="text-title font-semibold">{title}</h2>
        {lede ? <p className="mb-3 text-sm text-muted">{lede}</p> : null}
        <ul className="grid gap-2 text-base">
          {routes.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className={`${focusRingClass} underline underline-offset-4 hover:text-accent`}
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
