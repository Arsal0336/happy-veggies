import { Card } from '../primitives/Card';
import { cn } from '../utils/cn';

export type MetricStat = {
  id: string;
  label: string;
  value: string | number;
  /** 0–100 for CSS bar; omit to hide bar */
  barPercent?: number;
};

export type MetricsChartsProps = {
  stats: MetricStat[];
  className?: string;
};

export function MetricsCharts({ stats, className }: MetricsChartsProps) {
  return (
    <div className={cn('hv-metrics', className)}>
      {stats.map((stat) => {
        const pct =
          stat.barPercent != null
            ? Math.min(100, Math.max(0, stat.barPercent))
            : undefined;
        return (
          <Card key={stat.id} className="hv-metrics__card" padding="md">
            <span className="hv-metrics__label">{stat.label}</span>
            <span className="hv-metrics__value">{stat.value}</span>
            {pct != null && (
              <div
                className="hv-metrics__bar-track"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                aria-label={stat.label}
              >
                <div className="hv-metrics__bar-fill" style={{ width: `${pct}%` }} />
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
