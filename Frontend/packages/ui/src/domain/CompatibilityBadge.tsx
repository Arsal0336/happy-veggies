import type { CompatibilityRelation } from '@hv/api-types';

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
  // Keep styling self-contained (tokens define base colors, not the BG/TEXT variants).
  good: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
  avoid: 'bg-red-100 text-red-700',
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
