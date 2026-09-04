import type { ReactNode } from 'react';
import { Sprout } from 'lucide-react';
import { cn } from '../utils/cn';

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary-200 bg-gradient-to-b from-surface to-primary-50 px-6 py-12 text-center',
        className,
      )}
      role="status"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
        <Sprout className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="m-0 font-display text-xl font-semibold tracking-tight">{title}</h3>
      {description && <p className="m-0 max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
