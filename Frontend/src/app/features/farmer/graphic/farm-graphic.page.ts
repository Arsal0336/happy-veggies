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
import { EconomicsApiService } from '../../../core/api/economics.service';
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
  private readonly economicsApi = inject(EconomicsApiService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly farm = signal<any>(null);
  readonly twin = signal<any>(null);
  readonly economicsByZone = signal<Record<string, any>>({});
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
    const econ = this.economicsByZone();
    return zones.map((z: any) => {
      const snap = econ[String(z.id)];
      const twinYield =
        z.expectedYieldValue ?? z.ExpectedYieldValue ?? z.expectedYield?.value ?? z.expectedYield ?? null;
      const twinUnit =
        z.expectedYieldUnit ?? z.ExpectedYieldUnit ?? z.expectedYield?.unit ?? z.yieldUnit ?? null;
      const yieldValue =
        twinYield != null && twinYield !== ''
          ? Number(twinYield)
          : snap?.expectedYield != null
            ? Number(snap.expectedYield)
            : snap?.ExpectedYield != null
              ? Number(snap.ExpectedYield)
              : null;
      const yieldUnit = twinUnit || snap?.yieldUnit || snap?.YieldUnit || null;
      const ratePerUnit = snap?.ratePerUnit ?? snap?.RatePerUnit ?? null;
      const currency = snap?.currency ?? snap?.Currency ?? 'PKR';
      let referenceGrossValue = snap?.referenceGrossValue ?? snap?.ReferenceGrossValue ?? null;
      if (
        (referenceGrossValue == null || Number.isNaN(Number(referenceGrossValue))) &&
        yieldValue != null &&
        ratePerUnit != null
      ) {
        referenceGrossValue = Number(yieldValue) * Number(ratePerUnit);
      }
      return {
        id: z.id,
        areaId: z.productionAreaId || z.areaId,
        label: z.label || z.Label || '',
        cropName: z.cropFreetext || z.cropName || z.CropFreetext || z.label || '',
        stage: z.growthStage || z.GrowthStage || '',
        isExperimental: !!(z.isExperimental ?? z.IsExperimental),
        areaAcres: z.areaCanonicalValue ?? z.AreaCanonicalValue ?? z.area?.value ?? null,
        yieldValue: yieldValue != null && !Number.isNaN(yieldValue) ? yieldValue : null,
        yieldUnit,
        ratePerUnit,
        currency,
        referenceGrossValue:
          referenceGrossValue != null && !Number.isNaN(Number(referenceGrossValue))
            ? Number(referenceGrossValue)
            : null,
      };
    });
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
      const [farm, twin, economics] = await Promise.all([
        firstValueFrom(this.farmApi.getFarm(this.farmId)),
        firstValueFrom(this.twinApi.getTwin(this.farmId)),
        firstValueFrom(this.economicsApi.getFarmEconomics(this.farmId)).catch(() => null),
      ]);
      this.farm.set(farm);
      this.twin.set(twin);
      const data = economics as any;
      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.snapshots)
          ? data.snapshots
          : Array.isArray(data)
            ? data
            : [];
      const map: Record<string, any> = {};
      for (const item of list) {
        const id = String(item.cropZoneId ?? item.CropZoneId ?? item.zoneId ?? '');
        if (id) map[id] = item;
      }
      this.economicsByZone.set(map);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }
}
