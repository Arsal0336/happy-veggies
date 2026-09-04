import type { ProductionAreaType } from './ProductionAreaTypeIcon';
import { cn } from '../utils/cn';

const AREA_TYPES: { type: ProductionAreaType; label: string; color: string }[] = [
  { type: 'open_field', label: 'Open field', color: 'var(--hv-area-open-field)' },
  { type: 'shed', label: 'Shed', color: 'var(--hv-area-shed)' },
  { type: 'greenhouse', label: 'Greenhouse', color: 'var(--hv-area-greenhouse)' },
  { type: 'tunnel', label: 'Tunnel', color: 'var(--hv-area-tunnel)' },
  { type: 'experimental', label: 'Experimental', color: 'var(--hv-area-experimental)' },
];

export type FarmGraphicLegendProps = {
  showNeighbourNote?: boolean;
  className?: string;
};

export function FarmGraphicLegend({
  showNeighbourNote = true,
  className,
}: FarmGraphicLegendProps) {
  return (
    <div className={cn('hv-farm-legend', className)} role="list" aria-label="Farm graphic legend">
      {AREA_TYPES.map((item) => (
        <span key={item.type} className="hv-farm-legend__item" role="listitem">
          <span className="hv-farm-legend__swatch" style={{ background: item.color }} aria-hidden />
          {item.label}
        </span>
      ))}
      {showNeighbourNote && (
        <span className="hv-farm-legend__item" role="listitem">
          Block size ≈ relative area · edges show neighbour relations
        </span>
      )}
    </div>
  );
}
