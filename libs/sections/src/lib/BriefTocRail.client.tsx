'use client';

/**
 * Desktop sticky TOC with scroll spy: IntersectionObserver updates active section.
 * Smooth scroll only when prefers-reduced-motion is off.
 */
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { focusRingClass } from '@joelklemmer/a11y';
import type { BriefTocItem } from './BriefToc';

export interface BriefTocRailClientProps {
  items: BriefTocItem[];
  jumpToLabel: string;
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function BriefTocRailClient({
  items,
  jumpToLabel,
}: BriefTocRailClientProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    setReducedMotion(getPrefersReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      if (!reducedMotion) {
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    },
    [reducedMotion],
  );

  useEffect(() => {
    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
          } else {
            visible.delete(id);
          }
        }
        if (visible.size === 0) return;
        const byRatio = [...visible.entries()].sort((a, b) => b[1] - a[1]);
        const top = byRatio[0];
        if (top) setActiveId(top[0]);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.1, 0.5, 1] },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => {
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el) observer.unobserve(el);
      }
    };
  }, [items]);

  return (
    <aside className="hidden lg:block pt-6 ps-2" aria-label={jumpToLabel}>
      <nav className="sticky top-24" aria-label={jumpToLabel}>
        <ul className="flex flex-col gap-2 text-sm min-w-[12rem]">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`${focusRingClass} block py-1 underline-offset-4 transition-colors ${
                    isActive
                      ? 'text-text font-semibold border-b border-border'
                      : 'text-muted hover:text-accent'
                  }`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
