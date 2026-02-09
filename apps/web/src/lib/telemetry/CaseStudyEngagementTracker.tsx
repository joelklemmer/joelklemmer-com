'use client';

import { useEffect, useRef } from 'react';
import {
  useTelemetry,
  TELEMETRY_EVENTS,
  type CaseStudyEngagementPayload,
} from '@joelklemmer/authority-telemetry';
import { useLocale } from 'next-intl';

export interface CaseStudyEngagementTrackerProps {
  slug: string;
}

/**
 * Fires case_study_engagement once when the case study entry page is viewed. Renders nothing.
 * Place on the casestudies/[slug] page with the slug param (inside TelemetryProvider).
 */
export function CaseStudyEngagementTracker({
  slug,
}: CaseStudyEngagementTrackerProps) {
  const locale = useLocale();
  const { track } = useTelemetry();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || !slug) return;
    fired.current = true;
    const payload: CaseStudyEngagementPayload = { slug, locale };
    track(TELEMETRY_EVENTS.CASE_STUDY_ENGAGEMENT, payload);
  }, [slug, locale, track]);

  return null;
}
