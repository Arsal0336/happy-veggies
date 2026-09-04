import { CompatibilityBadge } from '../domain/CompatibilityBadge';
import type { CompatibilityLevel } from '../domain/CompatibilityBadge';
import { EmptyState } from '../primitives/EmptyState';
import { cn } from '../utils/cn';

export type CompatibilityPair = {
  id: string;
  cropA: string;
  cropB: string;
  relation: CompatibilityLevel;
  reason?: string;
};

export type CompatibilityMatrixEditorProps = {
  pairs: CompatibilityPair[];
  onSelect?: (id: string) => void;
  className?: string;
};

export function CompatibilityMatrixEditor({
  pairs,
  onSelect,
  className,
}: CompatibilityMatrixEditorProps) {
  if (pairs.length === 0) {
    return (
      <EmptyState
        title="No compatibility pairs"
        description="Add companion-planting relations for the catalog."
        className={className}
      />
    );
  }

  return (
    <div className={cn('hv-compat-matrix', className)} role="list">
      {pairs.map((pair) => (
        <button
          key={pair.id}
          type="button"
          className="hv-compat-matrix__row"
          role="listitem"
          onClick={() => onSelect?.(pair.id)}
          style={{ cursor: onSelect ? 'pointer' : 'default', textAlign: 'start' }}
        >
          <span>
            {pair.cropA} ↔ {pair.cropB}
            {pair.reason && (
              <span style={{ display: 'block', color: 'var(--hv-color-text-muted)', fontSize: 'var(--hv-text-xs)' }}>
                {pair.reason}
              </span>
            )}
          </span>
          <span />
          <CompatibilityBadge level={pair.relation} />
        </button>
      ))}
    </div>
  );
}
