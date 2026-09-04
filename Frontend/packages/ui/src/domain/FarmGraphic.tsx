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
  unitLabel?: string;
};

export type FarmGraphicZone = {
  id: string;
  areaId: string;
  cropName: string;
  stage: string;
  isExperimental?: boolean;
};

export type FarmNeighbourEdge = {
  fromZoneId: string;
  toZoneId: string;
  relation: string;
};

export type FarmGraphicProps = {
  farmName: string;
  regionLabel?: string;
  coordsLabel?: string;
  weatherLabel?: string;
  waterLabel?: string;
  greenScore?: number | string | null;
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

type AreaGroupKey = 'open_field' | 'protected' | 'experimental';

const GROUP_ORDER: AreaGroupKey[] = ['open_field', 'protected', 'experimental'];

const GROUP_LABELS: Record<AreaGroupKey, string> = {
  open_field: 'Open field',
  protected: 'Protected',
  experimental: 'Experimental',
};

function groupKey(type: ProductionAreaType): AreaGroupKey {
  if (type === 'experimental') return 'experimental';
  if (type === 'open_field') return 'open_field';
  return 'protected';
}

function relationTone(relation: string): 'good' | 'avoid' | 'neutral' {
  const key = relation.toLowerCase();
  if (key.includes('good') || key.includes('companion')) return 'good';
  if (key.includes('avoid') || key.includes('conflict') || key.includes('bad')) return 'avoid';
  return 'neutral';
}

export function FarmGraphic({
  farmName,
  regionLabel,
  coordsLabel,
  weatherLabel,
  waterLabel,
  greenScore,
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
          <div className="hv-farm-graphic__heading">
            <h2 className="hv-farm-graphic__title">{farmName}</h2>
            {regionLabel ? <p className="hv-farm-graphic__meta">{regionLabel}</p> : null}
          </div>
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

  const grouped = GROUP_ORDER.map((key) => ({
    key,
    areas: [...areas]
      .filter((a) => groupKey(a.type) === key)
      .sort((a, b) => Math.max(1, b.relativeSize || 1) - Math.max(1, a.relativeSize || 1)),
  })).filter((g) => g.areas.length > 0);

  const chips = [
    weatherLabel ? { id: 'weather', label: weatherLabel } : null,
    waterLabel ? { id: 'water', label: waterLabel } : null,
    greenScore != null && greenScore !== ''
      ? { id: 'green', label: `Green ${greenScore}` }
      : null,
  ].filter(Boolean) as Array<{ id: string; label: string }>;

  return (
    <div className={cn('hv-farm-graphic', className)}>
      <header className="hv-farm-graphic__header">
        <div className="hv-farm-graphic__heading">
          <h2 className="hv-farm-graphic__title">{farmName}</h2>
          <p className="hv-farm-graphic__meta">
            {[regionLabel, coordsLabel].filter(Boolean).join(' · ') || 'Schematic (not a survey map)'}
          </p>
        </div>
        {chips.length > 0 ? (
          <div className="hv-farm-graphic__chips" aria-label="Twin status">
            {chips.map((chip) => (
              <span key={chip.id} className="hv-farm-graphic__chip">
                {chip.label}
              </span>
            ))}
          </div>
        ) : (
          <span className="hv-farm-graphic__badge">Schematic</span>
        )}
      </header>

      <div className="hv-farm-graphic__canvas" aria-label="Farm schematic">
        {grouped.map((group) => (
          <section
            key={group.key}
            className={cn('hv-farm-group', `hv-farm-group--${group.key}`)}
            aria-label={GROUP_LABELS[group.key]}
          >
            <h3 className="hv-farm-group__title">{GROUP_LABELS[group.key]}</h3>
            <div className="hv-farm-group__areas" role="list">
              {group.areas.map((area) => {
                const areaZones = zones.filter((z) => z.areaId === area.id);
                const flexGrow = Math.max(1, Number(area.relativeSize) || 1);
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
                    <div className="hv-farm-area__head">
                      <ProductionAreaTypeIcon type={area.type} />
                      <div className="hv-farm-area__titles">
                        <p className="hv-farm-area__name">{area.name}</p>
                        <p className="hv-farm-area__size">
                          {area.relativeSize > 0
                            ? `${area.relativeSize}${area.unitLabel ? ` ${area.unitLabel}` : ''}`
                            : area.type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="hv-farm-area__zones">
                      {areaZones.length === 0 && (
                        <span className="hv-farm-zone hv-farm-zone--empty">No zones</span>
                      )}
                      {areaZones.map((zone) => (
                        <button
                          key={zone.id}
                          type="button"
                          className={cn(
                            'hv-farm-zone',
                            selectedId === zone.id && 'hv-farm-zone--selected',
                            zone.isExperimental && 'hv-farm-zone--experimental',
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectZone?.(zone.id);
                          }}
                          disabled={readOnly && !onSelectZone}
                        >
                          <span className="hv-farm-zone__crop">{zone.cropName || 'Crop'}</span>
                          {zone.stage ? (
                            <span className="hv-farm-zone__stage">{zone.stage}</span>
                          ) : null}
                          {zone.isExperimental ? (
                            <span className="hv-farm-zone__flag">Exp</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {neighbourEdges && neighbourEdges.length > 0 && (
        <ul className="hv-farm-edges" aria-label="Neighbour relations">
          {neighbourEdges.map((edge, i) => {
            const tone = relationTone(edge.relation);
            return (
              <li
                key={`${edge.fromZoneId}-${edge.toZoneId}-${i}`}
                className={cn('hv-farm-edges__item', `hv-farm-edges__item--${tone}`)}
              >
                <span className="hv-farm-edges__from">{zoneLabel(edge.fromZoneId)}</span>
                <span className="hv-farm-edges__arrow" aria-hidden>
                  ↔
                </span>
                <span className="hv-farm-edges__to">{zoneLabel(edge.toZoneId)}</span>
                <span className={cn('hv-farm-edges__relation', `hv-farm-edges__relation--${tone}`)}>
                  {relationLabel(edge.relation)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
