import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { StatCard } from '../../../shared/ui/stat-card';
import { FarmGraphic } from '../../../shared/ui/farm-graphic';
import { AlertList } from '../../../shared/ui/alert-list';
import { HvDrawer } from '../../../shared/ui/hv-drawer';
import { FarmApiService } from '../../../core/api/farm.service';
import { TwinApiService } from '../../../core/api/twin.service';
import { AlertApiService } from '../../../core/api/alert.service';
import { SuggestionApiService } from '../../../core/api/suggestion.service';
import { ToastService } from '../../../shared/ui/toast.service';

function toGraphicType(code: string): string {
  if (code === 'tunnel_polyhouse') return 'tunnel';
  if (code === 'other_protected') return 'shed';
  return code || 'open_field';
}

@Component({
  selector: 'app-farm-home-page',
  imports: [
    RouterLink,
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvButton,
    HvCard,
    HvBadge,
    StatCard,
    FarmGraphic,
    AlertList,
    HvDrawer,
  ],
  template: `
    <div class="hv-page">
      @if (loading()) {
        <hv-skeleton [lines]="8" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        <hv-page-header
          [title]="farm()?.name || ('common.unnamed' | translate)"
          [subtitle]="headerMeta()"
        >
          <div class="flex flex-wrap gap-2">
            <hv-button
              variant="secondary"
              labelKey="twin.refresh"
              [loading]="refreshing()"
              (pressed)="refresh()"
            />
            <a [routerLink]="['/farms', farmId, 'edit']">
              <hv-button variant="ghost" labelKey="common.edit" />
            </a>
          </div>
        </hv-page-header>

        <hv-card>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                {{ 'farms.nextAction' | translate }}
              </p>
              <p class="mt-1 font-display text-lg font-semibold">{{ 'plan.generate' | translate }}</p>
              <p class="mt-1 text-sm text-muted">{{ 'farms.nextActionHint' | translate }}</p>
            </div>
            <a [routerLink]="['/farms', farmId, 'plan']">
              <hv-button labelKey="plan.generate" />
            </a>
          </div>
        </hv-card>

        <div class="mt-4 grid grid-cols-2 gap-3">
          <hv-stat-card labelKey="twin.weather" [value]="weatherValue()" [hint]="weatherHint()" />
          <hv-stat-card labelKey="twin.water" [value]="waterValue()" />
          <hv-stat-card labelKey="green.title" [value]="greenValue()" [hint]="soilHint()" />
          <hv-stat-card
            labelKey="alerts.title"
            [value]="unread()"
            [hint]="'alerts.unreadCount' | translate: { count: unread() }"
          />
        </div>

        <section class="mt-5 animate-[hv-rise_420ms_ease]">
          <div class="mb-2 flex items-center justify-between gap-2">
            <div>
              <h2 class="font-display text-lg font-semibold">{{ 'nav.graphic' | translate }}</h2>
              <p class="text-sm text-muted">{{ 'graphic.coordsOnly' | translate }}</p>
            </div>
            <a [routerLink]="['/farms', farmId, 'graphic']">
              <hv-button variant="ghost" labelKey="graphic.openFull" />
            </a>
          </div>
          <hv-farm-graphic
            [farmName]="farm()?.name || ('common.unnamed' | translate)"
            [regionLabel]="farm()?.regionLabel || farm()?.regionCode"
            [coordsLabel]="coordsLabel()"
            [weatherLabel]="weatherValue() !== '—' ? weatherValue() : null"
            [waterLabel]="waterValue() !== '—' ? waterValue() : null"
            [greenScore]="greenRaw()"
            [areas]="graphicAreas()"
            [zones]="graphicZones()"
            [neighbourEdges]="graphicEdges()"
            [selectedId]="selectedZoneId()"
            (selectArea)="goAreas()"
            (selectZone)="onSelectZone($event)"
          />
        </section>

        @if (alertItems().length) {
          <section class="mt-5">
            <div class="mb-2 flex items-center justify-between">
              <h2 class="font-semibold">{{ 'alerts.title' | translate }}</h2>
              <a [routerLink]="['/farms', farmId, 'alerts']">
                <hv-button variant="ghost" labelKey="alerts.viewAll" />
              </a>
            </div>
            <hv-alert-list [alerts]="alertItems()" (markRead)="markRead($event)" />
          </section>
        }

        @if (suggestions().length) {
          <section class="mt-5">
            <h2 class="mb-2 font-semibold">{{ 'suggestions.title' | translate }}</h2>
            <ul class="m-0 flex list-none flex-col gap-3 p-0">
              @for (s of suggestions(); track s.cropId || s.id) {
                <li>
                  <hv-card>
                    <div class="flex items-start justify-between gap-2">
                      <strong>{{ s.cropName || s.cropId }}</strong>
                      <hv-badge>{{ s.source }}</hv-badge>
                    </div>
                    <p class="mt-1 text-sm text-muted">{{ s.reason }}</p>
                  </hv-card>
                </li>
              }
            </ul>
          </section>
        }

        <div class="mt-5 flex flex-wrap gap-2">
          <a [routerLink]="['/farms', farmId, 'areas']"><hv-button variant="secondary" labelKey="nav.areas" /></a>
          <a [routerLink]="['/farms', farmId, 'water']"><hv-button variant="ghost" labelKey="nav.water" /></a>
          <a [routerLink]="['/farms', farmId, 'soil']"><hv-button variant="ghost" labelKey="nav.soil" /></a>
          <a [routerLink]="['/farms', farmId, 'weather']"><hv-button variant="ghost" labelKey="nav.weather" /></a>
          <a [routerLink]="['/farms', farmId, 'assistant']"><hv-button variant="ghost" labelKey="nav.assistant" /></a>
        </div>
      }
    </div>

    <hv-drawer [(open)]="drawerOpen" side="end">
      @if (selectedZone(); as z) {
        <h3 class="mb-2 font-display text-lg font-semibold">{{ z.cropFreetext || z.label }}</h3>
        <p class="text-sm text-muted">{{ z.growthStage }}</p>
        <div class="mt-4">
          <a [routerLink]="['/farms', farmId, 'areas', z.productionAreaId, 'zones']">
            <hv-button labelKey="areas.manageZones" />
          </a>
        </div>
        <div class="mt-3">
          <hv-button variant="ghost" labelKey="common.close" (pressed)="closeDrawer()" />
        </div>
      }
    </hv-drawer>
  `,
})
export class FarmHomePage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly farms = inject(FarmApiService);
  private readonly twinApi = inject(TwinApiService);
  private readonly alertApi = inject(AlertApiService);
  private readonly suggestionsApi = inject(SuggestionApiService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly farm = signal<any>(null);
  readonly twin = signal<any>(null);
  readonly alerts = signal<any[]>([]);
  readonly suggestions = signal<any[]>([]);
  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedZoneId = signal<string | null>(null);
  readonly drawerOpen = signal(false);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  selectedZone(): any | null {
    const id = this.selectedZoneId();
    if (!id) return null;
    const zones = this.twin()?.zones || this.twin()?.cropZones || [];
    return zones.find((x: any) => x.id === id) || null;
  }

  onSelectZone(id: string): void {
    this.selectedZoneId.set(id);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.selectedZoneId.set(null);
    this.drawerOpen.set(false);
  }

  goAreas(): void {
    void this.router.navigate(['/farms', this.farmId, 'areas']);
  }

  headerMeta(): string {
    const f = this.farm();
    if (!f) return '';
    return `${f.regionLabel || f.regionCode || ''} · ${Number(f.lat).toFixed(3)}, ${Number(f.lng).toFixed(3)}`;
  }

  coordsLabel(): string {
    const f = this.farm();
    if (!f) return '';
    return `${Number(f.lat).toFixed(4)}, ${Number(f.lng).toFixed(4)}`;
  }

  weatherValue(): string {
    const w = this.twin()?.weather;
    if (w?.temperature?.value != null) {
      return `${w.temperature.value}° ${w.forecastTrend || ''}`.trim();
    }
    if (typeof w?.temperature === 'number') return `${w.temperature}°`;
    return w?.providerStatus || '—';
  }

  weatherHint(): string | null {
    return this.twin()?.weather?.providerStatus || null;
  }

  waterValue(): string {
    const w = this.twin()?.water || this.twin()?.waterSummary;
    if (w?.reliability != null) {
      const rel = typeof w.reliability === 'number' ? w.reliability.toFixed(2) : w.reliability;
      return w.irrigationMethod ? `${rel} · ${w.irrigationMethod}` : String(rel);
    }
    if (w?.sourceCount != null) return String(w.sourceCount);
    return '—';
  }

  greenRaw(): number | null {
    return this.twin()?.greenSummary?.overallScore ?? this.twin()?.greenScore?.score ?? null;
  }

  greenValue(): string | number {
    return this.greenRaw() ?? '—';
  }

  soilHint(): string | null {
    const s = this.twin()?.soil?.providerStatus || this.twin()?.soilSummary?.providerStatus;
    return s ? `${this.t.instant('twin.soil')}: ${s}` : null;
  }

  unread(): number {
    return this.alerts().filter((a) => !(a.isRead ?? a.read)).length;
  }

  alertItems(): any[] {
    return this.alerts().map((a) => ({
      id: a.id,
      read: !!(a.isRead ?? a.read),
      severity: a.severity,
      title: a.title || a.type,
      message: a.body || a.message,
    }));
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
      const [farm, twin, alerts, suggestions] = await Promise.all([
        firstValueFrom(this.farms.getFarm(this.farmId)),
        firstValueFrom(this.twinApi.getTwin(this.farmId)).catch(() => null),
        firstValueFrom(this.alertApi.listAlerts(this.farmId)).catch(() => []),
        firstValueFrom(this.suggestionsApi.listCropSuggestions(this.farmId)).catch(() => []),
      ]);
      this.farm.set(farm);
      this.twin.set(twin);
      this.alerts.set((alerts as any[]) || []);
      this.suggestions.set((suggestions as any[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('farms.notFound'));
    } finally {
      this.loading.set(false);
    }
  }

  async refresh(): Promise<void> {
    this.refreshing.set(true);
    try {
      const twin = await firstValueFrom(this.twinApi.refreshTwin(this.farmId));
      this.twin.set(twin);
      this.toast.success(this.t.instant('twin.refresh'));
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.refreshing.set(false);
    }
  }

  async markRead(id: string): Promise<void> {
    try {
      await firstValueFrom(this.alertApi.markRead(this.farmId, id));
      this.alerts.update((list) =>
        list.map((a) => (a.id === id ? { ...a, read: true, isRead: true } : a)),
      );
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    }
  }
}
