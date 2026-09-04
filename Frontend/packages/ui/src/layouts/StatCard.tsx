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
    <Card
      className={cn(
        'relative flex flex-col gap-1.5 overflow-hidden bg-gradient-to-br from-surface to-primary-50',
        className,
      )}
      padding="md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        {icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
            {icon}
          </span>
        ) : null}
      </div>
      <span className="font-display text-2xl font-bold leading-none tracking-tight text-foreground">
        {value}
      </span>
      {hint ? <span className="text-xs leading-snug text-muted">{hint}</span> : null}
    </Card>
  );
}
