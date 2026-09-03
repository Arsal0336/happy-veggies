import { type CompatibilityRelation } from '@hv/api-types';

export interface CompatibilityBadgeProps {
  relation: CompatibilityRelation;
  className?: string;
}

const labels: Record<CompatibilityRelation, string> = {
  good: 'Good Companion',
  neutral: 'Neutral',
  avoid: 'Avoid',
};

const colorMap: Record<CompatibilityRelation, string> = {
  good: 'bg-[var(--hv-color-success-50)] text-[var(--hv-color-success-700)]',
  neutral: 'bg-[var(--hv-color-neutral-100)] text-[var(--hv-color-neutral-700)]',
  avoid: 'bg-[var(--hv-color-danger-50)] text-[var(--hv-color-danger-700)]',
};

export function CompatibilityBadge({ relation, className = '' }: CompatibilityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[var(--hv-text-xs)] font-medium ${colorMap[relation]} ${className}`}
    >
      {labels[relation]}
    </span>
  );
}
