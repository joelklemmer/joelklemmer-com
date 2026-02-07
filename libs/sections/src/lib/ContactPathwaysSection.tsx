import { focusRingClass } from '@joelklemmer/a11y';
import { Container } from '@joelklemmer/ui';

export interface ContactPathwayOption {
  id: string;
  label: string;
  description: string;
  cta: string;
}

export interface ContactPathwaysSectionProps {
  groupLabel: string;
  options: ContactPathwayOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  name: string;
}

export function ContactPathwaysSection({
  groupLabel,
  options,
  selectedId,
  onSelect,
  name,
}: ContactPathwaysSectionProps) {
  return (
    <section
      className="section-shell"
      aria-labelledby="contact-pathways-heading"
    >
      <Container className="section-shell">
        <h2 id="contact-pathways-heading" className="text-title font-semibold">
          {groupLabel}
        </h2>
        <div
          role="radiogroup"
          aria-label={groupLabel}
          className="mt-4 grid gap-3"
        >
          {options.map((option) => {
            const isSelected = selectedId === option.id;
            const inputId = `${name}-${option.id}`;
            return (
              <label
                key={option.id}
                htmlFor={inputId}
                className={`flex cursor-pointer gap-3 rounded-md border p-4 transition-colors motion-reduce:transition-none ${focusRingClass} ${
                  isSelected
                    ? 'border-accent bg-surface'
                    : 'border-border hover:border-accent/60'
                }`}
              >
                <input
                  type="radio"
                  name={name}
                  id={inputId}
                  value={option.id}
                  checked={isSelected}
                  onChange={() => onSelect(option.id)}
                  className="mt-1 h-4 w-4 shrink-0 border-border text-accent focus:ring-accent"
                  aria-describedby={`${inputId}-desc`}
                />
                <span className="flex flex-col gap-1">
                  <span className="font-medium text-text">{option.label}</span>
                  <span id={`${inputId}-desc`} className="text-sm text-muted">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
