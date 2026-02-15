import type { ReactNode } from 'react';
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import { Container, PortraitImage } from '@joelklemmer/ui';

export interface HeroAction {
  label: string;
  href: string;
  /** 'primary' = filled accent; 'secondary' = outline (default) */
  variant?: 'primary' | 'secondary';
}

/** Figma v4: headline as three thesis lines. When provided, used instead of title. */
export interface HeroSectionProps {
  /** Single-line title (fallback when thesisLines not used). */
  title?: string;
  /** Figma v4: three headline lines. When provided, overrides title for H1. */
  thesisLines?: [string, string, string];
  /** Supporting paragraph (Figma: supporting; legacy: lede). */
  lede?: string;
  actions?: HeroAction[];
  /** Optional visual anchor: image path (e.g. /media/portrait.jpg) or ReactNode for custom composition */
  visual?:
    | ReactNode
    | { src: string; alt: string; width?: number; height?: number };
  /** Set true only for the LCP hero (e.g. home) to avoid multiple priority images */
  imagePriority?: boolean;
  children?: ReactNode;
}

export function HeroSection({
  title,
  thesisLines,
  lede,
  actions,
  visual,
  imagePriority = false,
  children,
}: HeroSectionProps) {
  const headline: string[] =
    thesisLines != null ? [...thesisLines] : title != null ? [title] : [];
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
      // Use PortraitImage component for institutional presentation; frame + wrapper for elevation and framing balance
      visualNode = (
        <div
          className="hero-authority-visual-frame hero-portrait-composition"
          data-hero-visual
        >
          <div className="hero-portrait-wrapper">
            <PortraitImage
              src={v.src}
              alt={v.alt}
              width={v.width ?? 1200}
              height={v.height ?? 1500}
              priority={imagePriority}
              quality={90}
              objectPosition="center top"
            />
          </div>
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
      <Container
        variant="full"
        className="hero-authority-inner hero-authority-plate"
      >
        <div
          className={useGrid ? 'hero-authority-grid' : 'hero-authority-stack'}
        >
          <div className="hero-authority-content">
            <h1 id="hero-title" className="hero-title">
              {headline.length > 0
                ? headline.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < headline.length - 1 ? <br /> : null}
                    </span>
                  ))
                : null}
            </h1>
            {lede ? <p className="hero-lede text-muted">{lede}</p> : null}
            {actions?.length ? (
              <div className="hero-actions">
                {actions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`${focusRingClass} hero-action-link hero-action-${action.variant === 'primary' ? 'primary' : 'secondary'}`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
            {children}
          </div>
          {useGrid && visualNode ? (
            <div className="hero-authority-visual" aria-hidden="true">
              {visualNode}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
