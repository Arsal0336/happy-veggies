import type { CropZone, NeighbourEdge, ProductionArea, ProductionAreaTypeCode } from '@hv/api-types';
import { ProductionAreaTypeIcon } from './ProductionAreaTypeIcon';

export interface FarmGraphicProps {
  areas: ProductionArea[];
  zones: CropZone[];
  neighbourEdges?: NeighbourEdge[];
  /**
   * Optional callback for interactive selection.
   * (Wired later to Task-055/131/… flows.)
   */
  onZoneClick?: (zoneId: string) => void;
}

type ZoneCenter = { x: number; y: number };

const areaTypeColor = (typeCode: ProductionAreaTypeCode): string => {
  switch (typeCode) {
    case 'open_field':
      return 'var(--hv-area-open-field)';
    case 'shed':
      return 'var(--hv-area-shed)';
    case 'greenhouse':
      return 'var(--hv-area-greenhouse)';
    case 'tunnel_polyhouse':
      return 'var(--hv-area-tunnel)';
    case 'experimental':
      return 'var(--hv-area-experimental)';
    case 'other_protected':
    default:
      return 'var(--hv-area-other)';
  }
};

// Compatibility edge stroke colors.
const relationStroke = (relation: NeighbourEdge['relation']): string => {
  switch (relation) {
    case 'good':
      return 'var(--hv-compat-good)';
    case 'avoid':
      return 'var(--hv-compat-avoid)';
    case 'neutral':
    default:
      return 'var(--hv-compat-neutral)';
  }
};

const gridForCount = (n: number) => {
  const cols = Math.max(1, Math.ceil(Math.sqrt(Math.max(1, n))));
  const rows = Math.max(1, Math.ceil(n / cols));
  return { cols, rows };
};

export function FarmGraphic({ areas, zones, neighbourEdges = [], onZoneClick }: FarmGraphicProps) {
  // Deterministic layout: place production areas on a grid, then place zones in sub-grids.
  const orderedAreas = [...areas].sort((a, b) => a.name.localeCompare(b.name));
  const areaIds = new Set(orderedAreas.map((a) => a.id));
  const areasInTwin = orderedAreas.filter((a) => areaIds.has(a.id));

  const zonesByAreaId = areasInTwin.reduce<Record<string, CropZone[]>>((acc, a) => {
    acc[a.id] = zones.filter((z) => z.productionAreaId === a.id);
    return acc;
  }, {});

  const { cols, rows } = gridForCount(areasInTwin.length);

  // Use a fixed SVG coordinate system so the component stays stable across screen sizes.
  const viewW = cols;
  const viewH = rows;
  const areaCellW = 1;
  const areaCellH = 1;

  const areaRects = areasInTwin.map((area, idx) => {
    const cellCol = idx % cols;
    const cellRow = Math.floor(idx / cols);
    const x = cellCol * areaCellW;
    const y = cellRow * areaCellH;
    return { area, x, y };
  });

  const zoneTileCols = 2; // small sub-grid inside each area cell
  const zoneTileRows = 2;

  // Precompute zone center points so neighbor edges render correctly.
  const zoneCenters = new Map<string, ZoneCenter>();
  areaRects.forEach(({ area, x, y }) => {
    const areaZones = zonesByAreaId[area.id] ?? [];
    areaZones.forEach((zone, zIdx) => {
      const tileCol = zIdx % zoneTileCols;
      const tileRow = Math.floor(zIdx / zoneTileCols) % zoneTileRows;

      const tileW = areaCellW / zoneTileCols;
      const tileH = areaCellH / zoneTileRows;

      const zx = x + tileCol * tileW + 0.04;
      const zy = y + tileRow * tileH + 0.06;
      zoneCenters.set(zone.id, { x: zx + tileW * 0.5, y: zy + tileH * 0.5 });
    });
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
          {zones.length === 0 ? 'No crop zones' : `${areasInTwin.length} areas • ${zones.length} zones`}
        </div>
      </div>

      <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-auto">
        {/* Neighbour edges (drawn behind tiles). */}
        {neighbourEdges.map((edge, idx) => {
          const a = zoneCenters.get(edge.zoneAId);
          const b = zoneCenters.get(edge.zoneBId);
          if (!a || !b) return null;
          return (
            <line
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={relationStroke(edge.relation)}
              strokeWidth={0.03}
              strokeDasharray={edge.relation === 'neutral' ? '0.02 0.02' : undefined}
              opacity={0.85}
            />
          );
        })}

        {/* Areas + zones */}
        {areaRects.map(({ area, x, y }) => {
          const areaZones = zonesByAreaId[area.id] ?? [];
          const fill = areaTypeColor(area.typeCode);
          const areaStroke = 'rgba(17, 24, 39, 0.18)';

          return (
            <g key={area.id}>
              <rect
                x={x}
                y={y}
                width={areaCellW}
                height={areaCellH}
                rx={0.08}
                ry={0.08}
                fill={fill}
                opacity={0.18}
                stroke={areaStroke}
              />

              {/* Type icon + name (small). */}
              <g transform={`translate(${x + 0.06}, ${y + 0.09})`}>
                <ProductionAreaTypeIcon type={area.typeCode} size="sm" />
              </g>

              {/* Zones inside the cell */}
              {areaZones.map((zone, zIdx) => {
                const tileCol = zIdx % zoneTileCols;
                const tileRow = Math.floor(zIdx / zoneTileCols) % zoneTileRows;

                const tileW = areaCellW / zoneTileCols;
                const tileH = areaCellH / zoneTileRows;

                const zx = x + tileCol * tileW + 0.04;
                const zy = y + tileRow * tileH + 0.06;

                return (
                  <g key={zone.id} onClick={() => onZoneClick?.(zone.id)} style={{ cursor: onZoneClick ? 'pointer' : 'default' }}>
                    <rect
                      x={zx}
                      y={zy}
                      width={tileW - 0.08}
                      height={tileH - 0.1}
                      rx={0.06}
                      ry={0.06}
                      fill="white"
                      opacity={0.65}
                      stroke="rgba(17, 24, 39, 0.12)"
                    />

                    <text x={zx + 0.02} y={zy + 0.12} fontSize={0.09} fill="rgba(17, 24, 39, 0.85)">
                      {zone.label.length > 14 ? `${zone.label.slice(0, 13)}…` : zone.label}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

