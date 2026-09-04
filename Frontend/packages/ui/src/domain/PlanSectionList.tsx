import { EmptyState } from '../primitives/EmptyState';
import { cn } from '../utils/cn';

export type PlanSection = {
  id: string;
  title: string;
  body: string;
};

export type PlanSectionListProps = {
  sections: PlanSection[];
  className?: string;
};

export function PlanSectionList({ sections, className }: PlanSectionListProps) {
  if (sections.length === 0) {
    return (
      <EmptyState
        title="No plan sections"
        description="Generate a plan to see recommendations here."
        className={className}
      />
    );
  }

  return (
    <div className={cn('hv-plan-sections', className)}>
      {sections.map((s) => (
        <section key={s.id} aria-labelledby={`plan-section-${s.id}`}>
          <h3 id={`plan-section-${s.id}`} className="hv-plan-section__title">
            {s.title}
          </h3>
          <p className="hv-plan-section__body">{s.body}</p>
        </section>
      ))}
    </div>
  );
}
