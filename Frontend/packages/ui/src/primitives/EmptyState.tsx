import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('hv-state', className)} role="status">
      <h3 className="hv-state__title">{title}</h3>
      {description && <p className="hv-state__body">{description}</p>}
      {action && <div className="hv-state__actions">{action}</div>}
    </div>
  );
}
