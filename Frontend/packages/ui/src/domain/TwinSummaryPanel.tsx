import { CloudSun, Droplets, Leaf, TrendingUp } from 'lucide-react';
import { Card } from '../primitives/Card';
import { cn } from '../utils/cn';

export type TwinSummaryPanelProps = {
  weather?: string;
  water?: string;
  greenScore?: string | number;
  yieldSummary?: string;
  className?: string;
};

export function TwinSummaryPanel({
  weather,
  water,
  greenScore,
  yieldSummary,
  className,
}: TwinSummaryPanelProps) {
  const items = [
    weather != null && { label: 'Weather', value: weather, icon: CloudSun },
    water != null && { label: 'Water', value: water, icon: Droplets },
    greenScore != null && { label: 'Green score', value: String(greenScore), icon: Leaf },
    yieldSummary != null && { label: 'Yield', value: yieldSummary, icon: TrendingUp },
  ].filter(Boolean) as { label: string; value: string; icon: typeof CloudSun }[];

  if (items.length === 0) {
    return (
      <Card className={cn(className)} padding="md">
        <p className="m-0 text-sm text-muted">No twin summary yet.</p>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden border-primary-100', className)} padding="md">
      <p className="m-0 mb-3 text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
        Twin snapshot
      </p>
      <div className="hv-twin-panel" role="group" aria-label="Twin summary">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="hv-twin-panel__item">
              <span className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-primary-600" aria-hidden />
                <span className="hv-twin-panel__label">{item.label}</span>
              </span>
              <span className="hv-twin-panel__value">{item.value}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
