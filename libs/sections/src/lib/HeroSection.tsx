import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  /** Optional visual anchor: image path (e.g. /media/portrait.jpg) or ReactNode for custom composition */
  visual?:
    | ReactNode
    | { src: string; alt: string; width?: number; height?: number };
  children?: ReactNode;
}

export function HeroSection({
  title,
  lede,
  actions,
  visual,
  children,
}: HeroSectionProps) {
  let visualNode: ReactNode = null;
  if (visual != null) {
    if (
      typeof visual === 'object' &&
      'src' in visual &&
      typeof (visual as { src: string }).src === 'string'
    ) {
      const v = visual as {
        src: string;
        alt: string;
        width?: number;
        height?: number;
      };
      visualNode = (
        <div className="authority-glass hero-authority-visual-frame hero-visual hero-portrait-composition">
          <Image
            src={v.src}
            alt={v.alt}
            width={v.width ?? 320}
            height={v.height ?? 500}
            className="hero-portrait-image object-contain w-full h-full"
            priority
            sizes="(max-width: 768px) 100vw, min(380px, 40vw)"
          />
        </div>
      );
    } else {
      visualNode = visual as ReactNode;
    }
  }
  const useGrid = visualNode != null;

  return (
    <section
      className="hero-authority section-shell relative"
      aria-labelledby="hero-title"
    >
      <div className="hero-authority-atmosphere" aria-hidden />
      <Container className="hero-authority-inner">
        <div
          className={useGrid ? 'hero-authority-grid' : 'hero-authority-stack'}
        >
          <div className="hero-authority-content">
            <h1 id="hero-title" className="hero-display">
              {title}
            </h1>
            {lede ? <p className="hero-lede text-muted">{lede}</p> : null}
            {actions?.length ? (
              <div className="hero-actions">
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`${focusRingClass} hero-action-link`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
            {children}
          </div>
          {useGrid && visualNode ? (
            <div className="hero-authority-visual">{visualNode}</div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
