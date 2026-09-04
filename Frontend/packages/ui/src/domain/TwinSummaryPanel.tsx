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
    weather != null && { label: 'Weather', value: weather },
    water != null && { label: 'Water', value: water },
    greenScore != null && { label: 'Green score', value: String(greenScore) },
    yieldSummary != null && { label: 'Yield', value: yieldSummary },
  ].filter(Boolean) as { label: string; value: string }[];

  if (items.length === 0) {
    return (
      <Card className={cn(className)} padding="md">
        <p className="m-0 text-sm text-muted">No twin summary yet.</p>
      </Card>
    );
  }

  return (
    <Card className={cn(className)} padding="md">
      <div className="hv-twin-panel" role="group" aria-label="Twin summary">
        {items.map((item) => (
          <div key={item.label} className="hv-twin-panel__item">
            <span className="hv-twin-panel__label">{item.label}</span>
            <span className="hv-twin-panel__value">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
