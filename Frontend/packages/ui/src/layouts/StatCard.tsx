import type { ReactNode } from 'react';
import { Card } from '../primitives/Card';
import { cn } from '../utils/cn';

export type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, hint, icon, className }: StatCardProps) {
  return (
    <Card className={cn('flex flex-col gap-1', className)} padding="md">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
        {icon ? <span className="text-primary-600">{icon}</span> : null}
      </div>
      <span className="text-2xl font-bold leading-tight">{value}</span>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </Card>
  );
}
