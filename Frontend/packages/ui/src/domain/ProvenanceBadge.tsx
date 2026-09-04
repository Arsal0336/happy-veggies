import { Badge } from '../primitives/Badge';
import { cn } from '../utils/cn';

export type ProvenanceSource = 'farmer' | 'sensor' | 'provider' | 'estimated' | 'manual';

const TONE: Record<ProvenanceSource, 'primary' | 'info' | 'success' | 'warning' | 'default'> = {
  farmer: 'primary',
  sensor: 'info',
  provider: 'success',
  estimated: 'warning',
  manual: 'default',
};

const LABEL: Record<ProvenanceSource, string> = {
  farmer: 'Farmer',
  sensor: 'Sensor',
  provider: 'Provider',
  estimated: 'Estimated',
  manual: 'Manual',
};

export type ProvenanceBadgeProps = {
  source: ProvenanceSource;
  className?: string;
};

export function ProvenanceBadge({ source, className }: ProvenanceBadgeProps) {
  return (
    <Badge tone={TONE[source]} className={cn('hv-provenance', className)}>
      {LABEL[source]}
    </Badge>
  );
}
