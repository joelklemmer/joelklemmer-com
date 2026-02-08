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
<<<<<<< Current (Your changes)
      const aspectRatio = (v.width ?? 1200) / (v.height ?? 1500);
      visualNode = (
<<<<<<< Current (Your changes)
        <div className="hero-authority-visual-frame hero-portrait-composition">
          <Image
            src={v.src}
            alt={v.alt}
<<<<<<< Current (Your changes)
            width={v.width ?? 1200}
            height={v.height ?? 1500}
<<<<<<< Current (Your changes)
            className="hero-portrait-image object-contain w-full h-full"
            priority
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) min(400px, 40vw), min(400px, 35vw)"
            style={{
              width: '100%',
              height: 'auto',
            }}
=======
            className="hero-portrait-image object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) min(400px, 40vw), min(400px, 35vw)"
>>>>>>> Incoming (Background Agent changes)
=======
            width={v.width ?? 400}
            height={v.height ?? 500}
            className="hero-portrait-image object-cover w-full h-full"
            priority
            sizes="(max-width: 768px) 100vw, min(400px, 35vw)"
            quality={90}
>>>>>>> Incoming (Background Agent changes)
=======
        <div
          className="hero-authority-visual-frame hero-portrait-composition"
          style={{ aspectRatio: `${aspectRatio}` }}
        >
          <Image
            src={v.src}
            alt={v.alt}
            width={v.width ?? 1200}
            height={v.height ?? 1500}
            className="hero-portrait-image object-contain w-full h-full"
            priority
            sizes="(max-width: 768px) 100vw, min(420px, 35vw)"
            style={{ aspectRatio: `${aspectRatio}` }}
>>>>>>> Incoming (Background Agent changes)
          />
=======
      // Reserve space to prevent CLS - use aspect ratio from dimensions
      const aspectRatio = v.width && v.height ? v.width / v.height : 0.8;
      visualNode = (
        <div className="hero-authority-visual-frame hero-portrait-composition">
          <div 
            className="hero-portrait-wrapper"
            style={{ aspectRatio: aspectRatio || '4/5' }}
          >
            <Image
              src={v.src}
              alt={v.alt}
              width={v.width ?? 1200}
              height={v.height ?? 1500}
              className="hero-portrait-image"
              priority
              sizes="(max-width: 768px) 100vw, min(380px, 40vw)"
              quality={90}
            />
          </div>
>>>>>>> Incoming (Background Agent changes)
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
      <Container className="hero-authority-inner hero-authority-plate">
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
            <div className="hero-authority-visual" aria-hidden="true">
              {visualNode}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
