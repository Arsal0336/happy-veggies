import { Alert } from '../primitives/Alert';
import type { AlertVariant } from '../primitives/Alert';
import { EmptyState } from '../primitives/EmptyState';
import { cn } from '../utils/cn';

export type AlertListItem = {
  id: string;
  severity: AlertVariant;
  title: string;
  message: string;
  read?: boolean;
};

export type AlertListProps = {
  alerts: AlertListItem[];
  className?: string;
  onMarkRead?: (id: string) => void;
  markReadLabel?: string;
};

export function AlertList({
  alerts,
  className,
  onMarkRead,
  markReadLabel = 'Mark read',
}: AlertListProps) {
  if (alerts.length === 0) {
    return <EmptyState title="No alerts" description="You're all caught up." className={className} />;
  }

  return (
    <ul className={cn('hv-alert-list', className)}>
      {alerts.map((a) => (
        <li
          key={a.id}
          className={cn('hv-alert-list__item', a.read && 'hv-alert-list__item--read')}
        >
          <Alert variant={a.severity} title={a.title}>
            {a.message}
            {onMarkRead && !a.read ? (
              <button
                type="button"
                className="hv-alert-list__mark-read"
                onClick={() => onMarkRead(a.id)}
              >
                {markReadLabel}
              </button>
            ) : null}
          </Alert>
        </li>
      ))}
    </ul>
  );
}
