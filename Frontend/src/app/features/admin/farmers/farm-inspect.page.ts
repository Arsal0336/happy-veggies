import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { TwinSummary } from '../../../shared/ui/twin-summary';
import {
  FarmGraphic,
  FarmGraphicArea,
  FarmGraphicZone,
  FarmNeighbourEdge,
} from '../../../shared/ui/farm-graphic';
import { AdminApiService } from '../../../core/api/admin.service';

type BeTwin = {
  farm?: { id?: string; name?: string | null; areaAcres?: number };
  areas?: Array<{
    id: string;
    typeCode: string;
    name?: string | null;
    areaCanonicalValue?: number;
  }>;
  zones?: Array<{
    id: string;
    productionAreaId: string;
    label?: string | null;
    cropId?: string | null;
    cropFreetext?: string | null;
    growthStage?: string | null;
    isExperimental?: boolean;
  }>;
  neighbourEdges?: Array<{
    id?: string;
    cropZoneAId: string;
    cropZoneBId: string;
    adjacencyType: string;
  }>;
  weather?: { providerStatus?: string | null; summary?: string | null } | null;
  waterSummary?: { sourceCount?: number } | null;
  greenScore?: number | { overallScore?: number } | null;
};

@Component({
  selector: 'app-admin-farm-inspect-page',
  imports: [
    RouterLink,
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    TwinSummary,
    FarmGraphic,
  ],
  template: `
    <div class="hv-page-wide space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <a
          [routerLink]="backHref()"
          class="text-sm font-medium text-primary-700 hover:underline"
        >
          ← {{ 'admin.farmers.backToDetail' | translate }}
        </a>
        <p class="m-0 text-sm text-muted">{{ 'admin.farmers.inspectHint' | translate }}</p>
      </div>
      <hv-page-header titleKey="admin.farmers.inspectTitle" />

      @if (loading()) {
        <hv-skeleton [lines]="8" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (twin()) {
        <hv-twin-summary [twin]="twinAsRecord()" />
        <hv-farm-graphic
          [farmName]="farmName()"
          [weatherLabel]="weatherLabel()"
          [waterLabel]="waterLabel()"
          [greenScore]="greenScore()"
          [areas]="areas()"
          [zones]="zones()"
          [neighbourEdges]="edges()"
        />
      }
    </div>
  `,
})
export class AdminFarmInspectPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly t = inject(TranslateService);

  readonly twin = signal<BeTwin | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  backHref(): string {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? `/admin/farmers/${id}` : '/admin/farmers';
  }

  twinAsRecord(): Record<string, unknown> {
    return (this.twin() ?? {}) as Record<string, unknown>;
  }

  farmName(): string {
    return this.twin()?.farm?.name?.trim() || this.t.instant('farms.home');
  }

  weatherLabel(): string | null {
    const w = this.twin()?.weather;
    return w?.summary || w?.providerStatus || null;
  }

  waterLabel(): string | null {
    const count = this.twin()?.waterSummary?.sourceCount;
    return count != null
      ? this.t.instant('admin.farmers.waterSourcesCount', { count })
      : null;
  }

  greenScore(): number | string | null {
    const g = this.twin()?.greenScore;
    if (g == null) return null;
    if (typeof g === 'object') return g.overallScore ?? null;
    return g;
  }

  areas(): FarmGraphicArea[] {
    const areas = this.twin()?.areas ?? [];
    const maxArea = Math.max(...areas.map((a) => Number(a.areaCanonicalValue) || 1), 1);
    return areas.map((a) => ({
      id: String(a.id),
      name: a.name ?? a.typeCode,
      type: this.mapAreaType(a.typeCode),
      relativeSize: Math.max(1, Math.round(((Number(a.areaCanonicalValue) || 1) / maxArea) * 4)),
    }));
  }

  zones(): FarmGraphicZone[] {
    return (this.twin()?.zones ?? []).map((z) => ({
      id: String(z.id),
      areaId: String(z.productionAreaId),
      cropName: z.cropFreetext || z.cropId || z.label || this.t.instant('admin.farmers.unknownCrop'),
      stage: z.growthStage || this.t.instant('admin.farmers.unknownStage'),
      isExperimental: !!z.isExperimental,
    }));
  }

  edges(): FarmNeighbourEdge[] {
    return (this.twin()?.neighbourEdges ?? []).map((e) => ({
      fromZoneId: String(e.cropZoneAId),
      toZoneId: String(e.cropZoneBId),
      relation: e.adjacencyType || 'neighbour',
    }));
  }

  private mapAreaType(code: string): string {
    const c = (code || '').toLowerCase();
    if (c.includes('shed')) return 'shed';
    if (c.includes('green')) return 'greenhouse';
    if (c.includes('tunnel') || c.includes('poly')) return 'tunnel';
    if (c.includes('experiment')) return 'experimental';
    return 'open_field';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const farmId = this.route.snapshot.paramMap.get('farmId') || '';
      this.twin.set((await firstValueFrom(this.api.getFarmTwin(farmId))) as BeTwin);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }
}
