import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvButton } from '../../../shared/ui/hv-button';
import { TwinApiService } from '../../../core/api/twin.service';
import { FarmApiService } from '../../../core/api/farm.service';
import { FarmGraphic } from '../../../shared/ui/farm-graphic';

function toGraphicType(code: string): string {
  if (code === 'tunnel_polyhouse') return 'tunnel';
  if (code === 'other_protected') return 'shed';
  return code || 'open_field';
}

@Component({
  selector: 'app-farm-graphic-page',
  imports: [RouterLink, TranslatePipe, PageHeader, HvSkeleton, HvErrorState, HvButton, FarmGraphic],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="graphic.title" subtitleKey="graphic.coordsOnly">
        <a [routerLink]="['/farms', farmId]">
          <hv-button variant="ghost" labelKey="common.back" />
        </a>
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton [lines]="8" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        <hv-farm-graphic
          [farmName]="farm()?.name || ('common.unnamed' | translate)"
          [regionLabel]="farm()?.regionLabel || farm()?.regionCode"
          [coordsLabel]="coordsLabel()"
          [weatherLabel]="weatherLabel()"
          [waterLabel]="waterLabel()"
          [greenScore]="greenScore()"
          [areas]="graphicAreas()"
          [zones]="graphicZones()"
          [neighbourEdges]="graphicEdges()"
          [selectedId]="selectedId()"
          (selectArea)="selectedId.set($event)"
          (selectZone)="selectedId.set($event)"
        />
        <p class="mt-3 text-sm text-muted">{{ 'graphic.hint' | translate }}</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <a [routerLink]="['/farms', farmId, 'areas']">
            <hv-button variant="secondary" labelKey="nav.areas" />
          </a>
          <a [routerLink]="['/farms', farmId, 'assistant']">
            <hv-button labelKey="nav.assistant" />
          </a>
        </div>
      }
    </div>
  `,
})
export class FarmGraphicPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly twinApi = inject(TwinApiService);
  private readonly farmApi = inject(FarmApiService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly farm = signal<any>(null);
  readonly twin = signal<any>(null);
  readonly selectedId = signal<string | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  coordsLabel(): string {
    const f = this.farm();
    if (!f) return '';
    return `${Number(f.lat).toFixed(4)}, ${Number(f.lng).toFixed(4)}`;
  }

  weatherLabel(): string | null {
    const w = this.twin()?.weather;
    if (w?.temperature?.value != null) {
      return `${w.temperature.value}° ${w.forecastTrend || ''}`.trim();
    }
    return w?.providerStatus || null;
  }

  waterLabel(): string | null {
    const w = this.twin()?.water;
    if (w?.reliability) {
      return w.irrigationMethod ? `${w.reliability} · ${w.irrigationMethod}` : String(w.reliability);
    }
    return null;
  }

  greenScore(): number | null {
    return this.twin()?.greenSummary?.overallScore ?? null;
  }

  graphicAreas(): any[] {
    const areas = this.twin()?.areas || this.twin()?.productionAreas || [];
    return areas.map((a: any) => ({
      id: a.id,
      name: a.name || a.typeCode || this.t.instant('common.unnamed'),
      type: toGraphicType(a.typeCode || a.type),
      relativeSize: a.area?.value ?? a.areaInputValue ?? 1,
      unitLabel: a.area?.unit ?? a.areaInputUnit,
    }));
  }

  graphicZones(): any[] {
    const zones = this.twin()?.zones || this.twin()?.cropZones || [];
    return zones.map((z: any) => ({
      id: z.id,
      areaId: z.productionAreaId || z.areaId,
      cropName: z.cropFreetext || z.label || '',
      stage: z.growthStage || '',
      isExperimental: !!z.isExperimental,
    }));
  }

  graphicEdges(): any[] {
    const edges = this.twin()?.neighbourEdges || [];
    return edges.map((e: any) => ({
      fromZoneId: e.zoneAId || e.cropZoneAId || e.fromZoneId,
      toZoneId: e.zoneBId || e.cropZoneBId || e.toZoneId,
      relation: e.relation || e.adjacencyType || 'adjacent',
    }));
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [farm, twin] = await Promise.all([
        firstValueFrom(this.farmApi.getFarm(this.farmId)),
        firstValueFrom(this.twinApi.getTwin(this.farmId)),
      ]);
      this.farm.set(farm);
      this.twin.set(twin);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }
}
