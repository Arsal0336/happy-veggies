import { PlanSectionList } from '../domain/PlanSectionList';
import type { PlanSection } from '../domain/PlanSectionList';
import { Badge } from '../primitives/Badge';
import { Button } from '../primitives/Button';
import { Card } from '../primitives/Card';
import { cn } from '../utils/cn';

export type PlanReviewAction = 'approve' | 'flag' | 'dismiss';

export type PlanReviewPaneProps = {
  sections: PlanSection[];
  flagged?: boolean;
  planTitle?: string;
  className?: string;
  reviewStatus?: string;
  actionsDisabled?: boolean;
  onReviewAction?: (action: PlanReviewAction) => void;
};

export function PlanReviewPane({
  sections,
  flagged = false,
  planTitle = 'Plan review',
  className,
  reviewStatus,
  actionsDisabled = false,
  onReviewAction,
}: PlanReviewPaneProps) {
  return (
    <Card className={cn('hv-plan-review', className)} padding="lg">
      <div className="hv-plan-review__header">
        <h2 style={{ margin: 0, fontSize: 'var(--hv-text-xl)' }}>{planTitle}</h2>
        {flagged && <Badge tone="warning">Flagged</Badge>}
        {reviewStatus && reviewStatus !== 'none' && !flagged && (
          <Badge tone="info">{reviewStatus}</Badge>
        )}
      </div>
      <PlanSectionList sections={sections} />
      {onReviewAction && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '1rem',
          }}
        >
          <Button
            variant="primary"
            size="sm"
            disabled={actionsDisabled}
            onClick={() => onReviewAction('approve')}
          >
            Approve
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={actionsDisabled}
            onClick={() => onReviewAction('flag')}
          >
            Flag
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={actionsDisabled}
            onClick={() => onReviewAction('dismiss')}
          >
            Dismiss
          </Button>
        </div>
      )}
    </Card>
  );
}
