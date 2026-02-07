'use client';

import { useMemo, useState } from 'react';
import { buildMailtoUrl } from '@joelklemmer/seo';
import {
  ContactPathwaysSection,
  ContactGuidanceSection,
  MailtoComposerSection,
} from '@joelklemmer/sections';

export interface PathwayOptionForMailto {
  id: string;
  label: string;
  description: string;
  cta: string;
  subjectTemplate: string;
  recommendedFields: string[];
}

export interface ContactIntakeBlockProps {
  pathwayOptions: PathwayOptionForMailto[];
  pathwaySelectorLabel: string;
  guidanceHeading: string;
  guidanceBullets: string[];
  mailtoHeading: string;
  mailtoButtonLabel: string;
  bodyTemplateLabel: string;
  requiredInfo: Record<string, string>;
  contactEmail: string | undefined;
}

export function ContactIntakeBlock({
  pathwayOptions,
  pathwaySelectorLabel,
  guidanceHeading,
  guidanceBullets,
  mailtoHeading,
  mailtoButtonLabel,
  bodyTemplateLabel,
  requiredInfo,
  contactEmail,
}: ContactIntakeBlockProps) {
  const firstId = pathwayOptions[0]?.id ?? '';
  const [selectedId, setSelectedId] = useState(firstId);

  const selectedPathway = useMemo(
    () => pathwayOptions.find((p) => p.id === selectedId),
    [pathwayOptions, selectedId],
  );

  const mailtoHref = useMemo(() => {
    if (!selectedPathway) return buildMailtoUrl(contactEmail, '', undefined);
    const subject = selectedPathway.subjectTemplate;
    const bodyLines = [
      '',
      'Please include:',
      ...selectedPathway.recommendedFields.map(
        (key) => `- ${requiredInfo[key] ?? key}: `,
      ),
    ];
    const body = bodyLines.join('\n');
    return buildMailtoUrl(contactEmail, subject, body);
  }, [selectedPathway, requiredInfo, contactEmail]);

  const requiredFieldsForSelected = useMemo(() => {
    if (!selectedPathway) return [];
    return selectedPathway.recommendedFields.map((key) => ({
      key,
      label: requiredInfo[key] ?? key,
    }));
  }, [selectedPathway, requiredInfo]);

  const pathwaySectionOptions = useMemo(
    () =>
      pathwayOptions.map((p) => ({
        id: p.id,
        label: p.label,
        description: p.description,
        cta: p.cta,
      })),
    [pathwayOptions],
  );

  return (
    <>
      <ContactPathwaysSection
        groupLabel={pathwaySelectorLabel}
        options={pathwaySectionOptions}
        selectedId={selectedId}
        onSelect={setSelectedId}
        name="contact-pathway"
      />
      <ContactGuidanceSection
        heading={guidanceHeading}
        bullets={guidanceBullets}
      />
      <MailtoComposerSection
        heading={mailtoHeading}
        buttonLabel={mailtoButtonLabel}
        mailtoHref={mailtoHref}
        bodyTemplateLabel={bodyTemplateLabel}
        requiredFields={requiredFieldsForSelected}
      />
    </>
  );
}
