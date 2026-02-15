/**
 * Institutional Domains section: 3-column grid.
 * Governance Architecture, Capital Stewardship, Operational Systems.
 * RTL-safe via logical properties. Lane/padding from parent home Container.
 */
export interface InstitutionalDomainsSectionProps {
  title: string;
  governance: { title: string; description: string };
  capital: { title: string; description: string };
  operational: { title: string; description: string };
}

export function InstitutionalDomainsSection({
  title,
  governance,
  capital,
  operational,
}: InstitutionalDomainsSectionProps) {
  return (
    <section
      id="domains"
      className="section-shell"
      aria-labelledby="domains-heading"
    >
      <div className="py-10 sm:py-12">
        <h2
          id="domains-heading"
          className="text-section-heading font-semibold text-text mb-8"
        >
          {title}
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-12 xl:gap-16 text-start">
          <div>
            <h3 className="text-lg font-semibold text-text mb-2">
              {governance.title}
            </h3>
            <p className="text-body-analytical text-muted leading-relaxed">
              {governance.description}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text mb-2">
              {capital.title}
            </h3>
            <p className="text-body-analytical text-muted leading-relaxed">
              {capital.description}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text mb-2">
              {operational.title}
            </h3>
            <p className="text-body-analytical text-muted leading-relaxed">
              {operational.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
