import { Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HvEmptyState } from './hv-empty-state';

export type FarmGraphicArea = {
  id: string;
  name: string;
  type: string;
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

type LayoutRect = {
  id: string;
  kind: 'area' | 'zone';
  areaId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  label: string;
  sub?: string;
  experimental?: boolean;
};

type LayoutEdge = {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone: 'good' | 'avoid' | 'neutral';
  label: string;
};

const AREA_COLORS: Record<string, { fill: string; stroke: string }> = {
  open_field: { fill: '#4a9b3c', stroke: '#2f6e28' },
  shed: { fill: '#5a6e7a', stroke: '#3d4d56' },
  greenhouse: { fill: '#2db88a', stroke: '#1e8a67' },
  tunnel: { fill: '#3a9bb5', stroke: '#287288' },
  tunnel_polyhouse: { fill: '#3a9bb5', stroke: '#287288' },
  experimental: { fill: '#d4a017', stroke: '#9a740f' },
  other_protected: { fill: '#5a6e7a', stroke: '#3d4d56' },
};

@Component({
  selector: 'hv-farm-graphic',
  imports: [TranslatePipe, HvEmptyState],
  styles: `
    :host { display: block; }
    .schematic {
      overflow: hidden;
      border: 1px solid var(--hv-color-border);
      border-radius: var(--hv-radius-2xl);
      background: var(--hv-color-surface);
      box-shadow: var(--hv-shadow-md);
    }
    .schematic__header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--hv-color-border);
      background: linear-gradient(105deg, var(--hv-color-primary-50), transparent 70%);
    }
    .schematic__title {
      margin: 0;
      font-family: var(--hv-font-display);
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .schematic__meta {
      margin: 0.2rem 0 0;
      font-size: 0.75rem;
      color: var(--hv-color-text-muted);
    }
    .schematic__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      justify-content: flex-end;
    }
    .schematic__chip {
      display: inline-flex;
      align-items: center;
      max-width: 12rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
      border: 1px solid var(--hv-color-primary-200);
      background: var(--hv-color-surface);
      color: var(--hv-color-primary-800);
      font-size: 0.65rem;
      font-weight: 600;
    }
    .schematic__stage {
      position: relative;
      background:
        radial-gradient(ellipse at 20% 0%, rgb(61 158 88 / 0.18), transparent 50%),
        linear-gradient(180deg, #cfe8d8 0%, #e8f2ea 38%, #d9c8a3 100%);
    }
    .schematic__svg {
      display: block;
      width: 100%;
      height: auto;
      min-height: 16rem;
    }
    .schematic__plot {
      cursor: pointer;
      transition: filter 140ms ease, opacity 140ms ease;
    }
    .schematic__plot:hover { filter: brightness(1.06); }
    .schematic__plot--selected {
      filter: drop-shadow(0 0 0 2px var(--hv-color-primary-500));
    }
    .schematic__label {
      fill: #fff;
      font-size: 11px;
      font-weight: 700;
      pointer-events: none;
      text-shadow: 0 1px 2px rgb(0 0 0 / 0.35);
    }
    .schematic__sub {
      fill: rgb(255 255 255 / 0.88);
      font-size: 9px;
      font-weight: 500;
      pointer-events: none;
    }
    .schematic__edge-good { stroke: #2a7a42; }
    .schematic__edge-avoid { stroke: #c23b2e; }
    .schematic__edge-neutral { stroke: #67756c; }
    .schematic__legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.65rem 1rem;
      padding: 0.75rem 1rem 1rem;
      border-top: 1px solid var(--hv-color-border);
      font-size: 0.7rem;
      color: var(--hv-color-text-muted);
    }
    .schematic__legend-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .schematic__swatch {
      width: 0.7rem;
      height: 0.7rem;
      border-radius: 0.2rem;
    }
    .schematic__edges {
      margin: 0;
      padding: 0 1rem 1rem;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .schematic__edge-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      color: var(--hv-color-text-muted);
    }
    .schematic__edge-row--good { color: var(--hv-color-success); }
    .schematic__edge-row--avoid { color: var(--hv-color-error); }
  `,
  template: `
    <div class="schematic" role="region" [attr.aria-label]="'graphic.title' | translate">
      <header class="schematic__header">
        <div>
          <h2 class="schematic__title">{{ farmName() }}</h2>
          <p class="schematic__meta">
            {{ metaLine() || ('graphic.coordsOnly' | translate) }}
          </p>
        </div>
        <div class="schematic__chips" aria-label="Twin status">
          @if (weatherLabel()) {
            <span class="schematic__chip">{{ weatherLabel() }}</span>
          }
          @if (waterLabel()) {
            <span class="schematic__chip">{{ waterLabel() }}</span>
          }
          @if (greenScore() != null && greenScore() !== '') {
            <span class="schematic__chip">{{ 'green.title' | translate }} {{ greenScore() }}</span>
          }
        </div>
      </header>

      @if (areas().length === 0) {
        <div class="p-4">
          <hv-empty-state titleKey="areas.empty" descriptionKey="areas.emptyHint" />
        </div>
      } @else {
        <div class="schematic__stage">
          <svg
            class="schematic__svg"
            viewBox="0 0 640 360"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            [attr.aria-label]="farmName()"
          >
            <defs>
              <pattern id="hv-crop-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="rgb(255 255 255 / 0.18)" stroke-width="2" />
              </pattern>
              <linearGradient id="hv-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#9fd4ff" stop-opacity="0.55" />
                <stop offset="55%" stop-color="#e8f2ea" stop-opacity="0" />
              </linearGradient>
              <filter id="hv-soft" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.18" />
              </filter>
            </defs>

            <rect width="640" height="360" fill="url(#hv-sky)" />
            <ellipse cx="520" cy="48" rx="42" ry="16" fill="rgb(255 255 255 / 0.45)" />
            <ellipse cx="560" cy="42" rx="28" ry="12" fill="rgb(255 255 255 / 0.35)" />

            @for (edge of layoutEdges(); track edge.key) {
              <path
                [attr.d]="curve(edge.x1, edge.y1, edge.x2, edge.y2)"
                fill="none"
                [attr.class]="'schematic__edge-' + edge.tone"
                stroke-width="2.5"
                stroke-dasharray="5 4"
                opacity="0.85"
              />
            }

            @for (plot of layoutPlots(); track plot.id + plot.kind) {
              <g
                class="schematic__plot"
                [class.schematic__plot--selected]="selectedId() === plot.id"
                filter="url(#hv-soft)"
                (click)="onPlotClick(plot)"
                (keydown.enter)="onPlotClick(plot)"
                tabindex="0"
                role="button"
                [attr.aria-label]="plot.label"
              >
                <rect
                  [attr.x]="plot.x"
                  [attr.y]="plot.y"
                  [attr.width]="plot.w"
                  [attr.height]="plot.h"
                  rx="14"
                  ry="14"
                  [attr.fill]="plot.fill"
                  [attr.stroke]="plot.stroke"
                  stroke-width="2"
                  opacity="0.92"
                />
                <rect
                  [attr.x]="plot.x"
                  [attr.y]="plot.y"
                  [attr.width]="plot.w"
                  [attr.height]="plot.h"
                  rx="14"
                  ry="14"
                  fill="url(#hv-crop-hatch)"
                  pointer-events="none"
                />
                <text
                  class="schematic__label"
                  [attr.x]="plot.x + 12"
                  [attr.y]="plot.y + 22"
                >
                  {{ truncate(plot.label, 22) }}
                </text>
                @if (plot.sub) {
                  <text
                    class="schematic__sub"
                    [attr.x]="plot.x + 12"
                    [attr.y]="plot.y + 38"
                  >
                    {{ truncate(plot.sub, 28) }}
                  </text>
                }
                @if (plot.experimental) {
                  <circle
                    [attr.cx]="plot.x + plot.w - 16"
                    [attr.cy]="plot.y + 16"
                    r="7"
                    fill="#fff3cd"
                    stroke="#d4a017"
                    stroke-width="1.5"
                  />
                }
              </g>
            }

            <!-- fence / farm boundary -->
            <rect
              x="18"
              y="18"
              width="604"
              height="324"
              rx="18"
              fill="none"
              stroke="rgb(15 46 26 / 0.18)"
              stroke-width="2"
              stroke-dasharray="6 8"
              pointer-events="none"
            />
          </svg>
        </div>

        <div class="schematic__legend" aria-hidden="true">
          @for (item of legendItems(); track item.key) {
            <span class="schematic__legend-item">
              <span class="schematic__swatch" [style.background]="item.color"></span>
              {{ item.labelKey | translate }}
            </span>
          }
        </div>

        @if ((neighbourEdges() || []).length) {
          <ul class="schematic__edges" [attr.aria-label]="'graphic.neighbours' | translate">
            @for (edge of neighbourEdges()!; track edge.fromZoneId + edge.toZoneId) {
              <li class="schematic__edge-row" [class]="'schematic__edge-row schematic__edge-row--' + relationTone(edge.relation)">
                <strong>{{ zoneLabel(edge.fromZoneId) }}</strong>
                <span aria-hidden="true">↔</span>
                <strong>{{ zoneLabel(edge.toZoneId) }}</strong>
                <span>· {{ relationLabel(edge.relation) }}</span>
              </li>
            }
          </ul>
        }
      }
    </div>
  `,
})
export class FarmGraphic {
  readonly farmName = input('Farm');
  readonly regionLabel = input<string | null>(null);
  readonly coordsLabel = input<string | null>(null);
  readonly weatherLabel = input<string | null>(null);
  readonly waterLabel = input<string | null>(null);
  readonly greenScore = input<number | string | null>(null);
  readonly areas = input<FarmGraphicArea[]>([]);
  readonly zones = input<FarmGraphicZone[]>([]);
  readonly neighbourEdges = input<FarmNeighbourEdge[] | null>(null);
  readonly selectedId = input<string | null>(null);
  readonly selectArea = output<string>();
  readonly selectZone = output<string>();

  readonly legendItems = computed(() => {
    const present = new Set(this.areas().map((a) => this.normalizeType(a.type)));
    const all = [
      { key: 'open_field', color: AREA_COLORS['open_field'].fill, labelKey: 'graphic.legend.openField' },
      { key: 'greenhouse', color: AREA_COLORS['greenhouse'].fill, labelKey: 'graphic.legend.greenhouse' },
      { key: 'tunnel', color: AREA_COLORS['tunnel'].fill, labelKey: 'graphic.legend.tunnel' },
      { key: 'shed', color: AREA_COLORS['shed'].fill, labelKey: 'graphic.legend.shed' },
      { key: 'experimental', color: AREA_COLORS['experimental'].fill, labelKey: 'graphic.legend.experimental' },
    ];
    const filtered = all.filter((i) => present.has(i.key));
    return filtered.length ? filtered : all.slice(0, 3);
  });

  readonly layoutPlots = computed(() => this.buildLayout().plots);
  readonly layoutEdges = computed(() => this.buildLayout().edges);

  metaLine(): string {
    return [this.regionLabel(), this.coordsLabel()].filter((x) => !!x).join(' · ');
  }

  zoneLabel(zoneId: string): string {
    const zone = this.zones().find((z) => z.id === zoneId);
    if (zone?.cropName?.trim()) return zone.cropName.trim();
    if (zone) return zone.stage?.trim() || 'Zone';
    return '—';
  }

  relationLabel(relation: string): string {
    return relation.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  relationTone(relation: string): 'good' | 'avoid' | 'neutral' {
    const key = relation.toLowerCase();
    if (key.includes('good') || key.includes('companion')) return 'good';
    if (key.includes('avoid') || key.includes('conflict') || key.includes('bad')) return 'avoid';
    return 'neutral';
  }

  truncate(value: string, max: number): string {
    if (!value) return '';
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
  }

  curve(x1: number, y1: number, x2: number, y2: number): string {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 24;
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  }

  onPlotClick(plot: LayoutRect): void {
    if (plot.kind === 'zone') {
      this.selectZone.emit(plot.id);
      return;
    }
    this.selectArea.emit(plot.id);
  }

  private normalizeType(type: string): string {
    if (type === 'tunnel_polyhouse') return 'tunnel';
    if (type === 'other_protected') return 'shed';
    return type || 'open_field';
  }

  private colorsFor(type: string): { fill: string; stroke: string } {
    return AREA_COLORS[this.normalizeType(type)] || AREA_COLORS['open_field'];
  }

  private buildLayout(): { plots: LayoutRect[]; edges: LayoutEdge[] } {
    const areas = [...this.areas()].sort(
      (a, b) => Math.max(1, b.relativeSize || 1) - Math.max(1, a.relativeSize || 1),
    );
    const zones = this.zones();
    const padX = 36;
    const padY = 40;
    const gap = 14;
    const usableW = 640 - padX * 2;
    const usableH = 360 - padY * 2;
    const cols = areas.length <= 2 ? areas.length : areas.length <= 4 ? 2 : 3;
    const rows = Math.max(1, Math.ceil(areas.length / cols));
    const cellW = (usableW - gap * (cols - 1)) / cols;
    const cellH = (usableH - gap * (rows - 1)) / rows;

    const areaRects = new Map<string, LayoutRect>();
    const zoneRects = new Map<string, LayoutRect>();
    const plots: LayoutRect[] = [];

    areas.forEach((area, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = padX + col * (cellW + gap);
      const y = padY + row * (cellH + gap);
      const colors = this.colorsFor(area.type);
      const sizeLabel =
        area.relativeSize > 0
          ? `${area.relativeSize}${area.unitLabel ? ` ${area.unitLabel}` : ''}`
          : this.normalizeType(area.type).replace(/_/g, ' ');
      const areaPlot: LayoutRect = {
        id: area.id,
        kind: 'area',
        areaId: area.id,
        x,
        y,
        w: cellW,
        h: cellH,
        fill: colors.fill,
        stroke: colors.stroke,
        label: area.name || this.normalizeType(area.type),
        sub: sizeLabel,
      };
      areaRects.set(area.id, areaPlot);
      plots.push(areaPlot);

      const areaZones = zones.filter((z) => z.areaId === area.id);
      if (!areaZones.length) return;

      const innerPad = 10;
      const zoneGap = 6;
      const header = 44;
      const zoneW = (cellW - innerPad * 2 - zoneGap * Math.max(0, areaZones.length - 1)) / areaZones.length;
      const zoneH = Math.max(36, cellH - header - innerPad);
      areaZones.forEach((zone, zi) => {
        const zx = x + innerPad + zi * (zoneW + zoneGap);
        const zy = y + header;
        const zonePlot: LayoutRect = {
          id: zone.id,
          kind: 'zone',
          areaId: area.id,
          x: zx,
          y: zy,
          w: Math.max(40, zoneW),
          h: zoneH,
          fill: 'rgb(255 255 255 / 0.22)',
          stroke: 'rgb(255 255 255 / 0.55)',
          label: zone.cropName || zone.stage || 'Zone',
          sub: zone.stage || undefined,
          experimental: !!zone.isExperimental,
        };
        zoneRects.set(zone.id, zonePlot);
        plots.push(zonePlot);
      });
    });

    const edges: LayoutEdge[] = [];
    for (const edge of this.neighbourEdges() || []) {
      const a = zoneRects.get(edge.fromZoneId) || areaRects.get(edge.fromZoneId);
      const b = zoneRects.get(edge.toZoneId) || areaRects.get(edge.toZoneId);
      if (!a || !b) continue;
      edges.push({
        key: `${edge.fromZoneId}-${edge.toZoneId}`,
        x1: a.x + a.w / 2,
        y1: a.y + a.h / 2,
        x2: b.x + b.w / 2,
        y2: b.y + b.h / 2,
        tone: this.relationTone(edge.relation),
        label: this.relationLabel(edge.relation),
      });
    }

    return { plots, edges };
  }
}
