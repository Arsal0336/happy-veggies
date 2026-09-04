import type { ReactNode } from 'react';
import { Button } from '../primitives/Button';
import { EmptyState } from '../primitives/EmptyState';
import type { ProductionAreaType } from './ProductionAreaTypeIcon';
import { ProductionAreaTypeIcon } from './ProductionAreaTypeIcon';
import { cn } from '../utils/cn';

export type FarmGraphicArea = {
  id: string;
  name: string;
  type: ProductionAreaType;
  relativeSize: number;
};

export type FarmGraphicZone = {
  id: string;
  areaId: string;
  cropName: string;
  stage: string;
};

export type FarmNeighbourEdge = {
  fromZoneId: string;
  toZoneId: string;
  relation: string;
};

export type FarmGraphicProps = {
  farmName: string;
  areas: FarmGraphicArea[];
  zones: FarmGraphicZone[];
  neighbourEdges?: FarmNeighbourEdge[];
  selectedId?: string;
  onSelectArea?: (areaId: string) => void;
  onSelectZone?: (zoneId: string) => void;
  emptyAction?: ReactNode;
  readOnly?: boolean;
  className?: string;
};

export function FarmGraphic({
  farmName,
  areas,
  zones,
  neighbourEdges,
  selectedId,
  onSelectArea,
  onSelectZone,
  emptyAction,
  readOnly = false,
  className,
}: FarmGraphicProps) {
  if (areas.length === 0) {
    return (
      <div className={cn('hv-farm-graphic', className)}>
        <header className="hv-farm-graphic__header">
          <h2 className="hv-farm-graphic__title">{farmName}</h2>
        </header>
        <EmptyState
          title="No production areas yet"
          description="Add an open field, shed, greenhouse, tunnel, or experimental area to see your farm schematic."
          action={
            emptyAction ??
            (!readOnly && onSelectArea ? (
              <Button variant="primary" onClick={() => onSelectArea('')}>
                Add production area
              </Button>
            ) : undefined)
          }
        />
      </div>
    );
  }

  const sorted = [...areas].sort((a, b) => b.relativeSize - a.relativeSize);

  const zoneLabel = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (zone?.cropName?.trim()) return zone.cropName.trim();
    if (zone) return zone.stage?.trim() || 'Zone';
    return 'Unknown zone';
  };

  const relationLabel = (relation: string) =>
    relation
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className={cn('hv-farm-graphic', className)}>
      <header className="hv-farm-graphic__header">
        <h2 className="hv-farm-graphic__title">{farmName}</h2>
        <span style={{ fontSize: 'var(--hv-text-xs)', color: 'var(--hv-color-text-muted)' }}>
          Schematic (not a survey map)
        </span>
      </header>

      <div className="hv-farm-graphic__canvas" role="list" aria-label="Farm schematic">
        {sorted.map((area) => {
          const areaZones = zones.filter((z) => z.areaId === area.id);
          const flexGrow = Math.max(1, area.relativeSize);
          const selected = selectedId === area.id;

          return (
            <div
              key={area.id}
              role="listitem"
              className={cn(
                'hv-farm-area',
                `hv-farm-area--${area.type}`,
                selected && 'hv-farm-area--selected',
              )}
              style={{ flexGrow }}
              tabIndex={readOnly && !onSelectArea ? undefined : 0}
              onClick={() => onSelectArea?.(area.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectArea?.(area.id);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--hv-space-2)' }}>
                <ProductionAreaTypeIcon type={area.type} />
                <p className="hv-farm-area__name">{area.name}</p>
              </div>
              <div className="hv-farm-area__zones">
                {areaZones.length === 0 && (
                  <span style={{ fontSize: 'var(--hv-text-xs)', color: 'var(--hv-color-text-muted)' }}>
                    No zones
                  </span>
                )}
                {areaZones.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    className={cn(
                      'hv-farm-zone',
                      selectedId === zone.id && 'hv-farm-zone--selected',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectZone?.(zone.id);
                    }}
                    disabled={readOnly && !onSelectZone}
                  >
                    {zone.cropName}
                    <span style={{ opacity: 0.7 }}> · {zone.stage}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {neighbourEdges && neighbourEdges.length > 0 && (
        <ul className="hv-farm-edges" aria-label="Neighbour relations">
          {neighbourEdges.map((edge, i) => (
            <li key={`${edge.fromZoneId}-${edge.toZoneId}-${i}`} className="hv-farm-edges__item">
              <span className="hv-farm-edges__from">{zoneLabel(edge.fromZoneId)}</span>
              <span className="hv-farm-edges__arrow" aria-hidden>
                →
              </span>
              <span className="hv-farm-edges__to">{zoneLabel(edge.toZoneId)}</span>
              <span className="hv-farm-edges__relation">{relationLabel(edge.relation)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
