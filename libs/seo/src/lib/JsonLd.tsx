'use client';

import { createElement } from 'react';

export interface JsonLdProps {
  /** Structured data object (Person, WebSite, Organization, etc.). */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Safely inject JSON-LD structured data into the document head.
 * Use for Person, WebSite, Organization, BreadcrumbList, etc.
 */
export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data];
  const sanitized = payload
    .map((obj) => {
      if (obj == null || typeof obj !== 'object') return null;
      return obj as Record<string, unknown>;
    })
    .filter(Boolean);

  if (sanitized.length === 0) return null;

  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(sanitized.length === 1 ? sanitized[0] : sanitized),
    },
  });
}
