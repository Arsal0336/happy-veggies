import type { Alert as AlertType } from '@hv/api-types';
import { Card } from '../primitives/Card';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';

export interface AlertListProps {
  alerts: AlertType[];
  onMarkRead?: (alertId: string) => void;
  className?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const severityVariant: Record<string, 'warning' | 'info' | 'danger'> = {
  warning: 'warning',
  info: 'info',
  critical: 'danger',
};

export function AlertList({ alerts, onMarkRead, className = '' }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className={`text-center py-12 text-[var(--hv-color-neutral-400)] text-[var(--hv-text-sm)] ${className}`}>
        No alerts
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {alerts.map((alert) => (
        <Card key={alert.id} padding="md" className={alert.read ? 'opacity-60' : ''}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={severityVariant[alert.severity] ?? 'info'} size="sm">
                  {alert.severity}
                </Badge>
                <span className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-400)]">
                  {timeAgo(alert.createdAt)}
                </span>
              </div>
              <p className="text-[var(--hv-text-sm)]">{alert.message}</p>
            </div>
            {onMarkRead && !alert.read && (
              <Button variant="ghost" size="sm" onClick={() => onMarkRead(alert.id)}>
                Mark read
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
