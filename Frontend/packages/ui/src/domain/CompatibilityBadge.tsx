import { Badge } from '../primitives/Badge';
import { cn } from '../utils/cn';

export type CompatibilityLevel = 'good' | 'avoid' | 'neutral';

const TONE: Record<CompatibilityLevel, 'success' | 'error' | 'default'> = {
  good: 'success',
  avoid: 'error',
  neutral: 'default',
};

const LABEL: Record<CompatibilityLevel, string> = {
  good: 'Good companion',
  avoid: 'Avoid',
  neutral: 'Neutral',
};

export type CompatibilityBadgeProps = {
  level: CompatibilityLevel;
  className?: string;
};

export function CompatibilityBadge({ level, className }: CompatibilityBadgeProps) {
  return (
    <Badge tone={TONE[level]} className={cn(className)}>
      {LABEL[level]}
    </Badge>
  );
}
