import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvInput } from '../../../shared/ui/hv-input';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { FarmApiService } from '../../../core/api/farm.service';
import { NeighbourApiService } from '../../../core/api/neighbour.service';
import { SuggestionApiService } from '../../../core/api/suggestion.service';
import { TwinApiService } from '../../../core/api/twin.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-zones-page',
  imports: [
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
    HvButton,
    HvInput,
    HvBadge,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="zones.title">
        <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        @if (warnings().length) {
          <hv-card class="mb-4">
            <h2 class="mb-2 font-semibold">{{ 'zones.neighbourWarnings' | translate }}</h2>
            <ul class="m-0 flex list-none flex-col gap-2 p-0 text-sm text-muted">
              @for (w of warnings(); track $index) {
                <li>
                  {{ w.zoneALabel || w.zoneAId }} ↔ {{ w.zoneBLabel || w.zoneBId }}
                  @if (w.reason) {
                    : {{ w.reason }}
                  }
                </li>
              }
            </ul>
          </hv-card>
        }

        @if (!zones().length) {
          <hv-empty-state titleKey="zones.empty" />
        } @else {
          <ul class="m-0 mb-4 flex list-none flex-col gap-3 p-0">
            @for (zone of zones(); track zone.id) {
              <li>
                <hv-card>
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p class="font-semibold">{{ zone.label }}</p>
                      <p class="text-sm text-muted">
                        {{ zone.cropFreetext || zone.cropId || '—' }} ·
                        {{ zoneSize(zone) }}
                        @if (zone.growthStage) {
                          · {{ zone.growthStage }}
                        }
                        @if (zone.seedVarietyId) {
                          · {{ 'zones.variety' | translate }}: {{ zone.seedVarietyId }}
                        }
                      </p>
                      @for (w of warningsFor(zone.id); track $index) {
                        <p class="text-xs text-muted">{{ w.reason }}</p>
                      }
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      @if (relationFor(zone.id); as level) {
                        <div>
                          <p class="text-xs text-muted">{{ 'zones.neighbours' | translate }}</p>
                          <hv-badge>{{ level }}</hv-badge>
                        </div>
                      }
                      <hv-button
                        variant="secondary"
                        labelKey="common.edit"
                        (pressed)="startEdit(zone)"
                      />
                      <hv-button
                        variant="danger"
                        labelKey="common.delete"
                        (pressed)="remove(zone.id)"
                      />
                    </div>
                  </div>
                </hv-card>
              </li>
            }
          </ul>
        }

        <hv-card>
          <h2 class="mb-3 font-semibold">
            {{ (editingZoneId() ? 'zones.edit' : 'zones.add') | translate }}
          </h2>
          <form class="space-y-3" (submit)="$event.preventDefault(); save()">
            <hv-input labelKey="zones.label" [(value)]="label" />
            <hv-input labelKey="zones.crop" [(value)]="crop" (valueChange)="onCropChange()" />
            <hv-input
              labelKey="zones.cropId"
              [placeholder]="'setup.cropPlaceholder' | translate"
              [(value)]="cropId"
              (valueChange)="onCropIdChange()"
            />
            <hv-input labelKey="farms.area" type="number" [(value)]="areaValue" />
            <hv-input labelKey="zones.plantingDate" type="date" [(value)]="plantingDate" />
            <hv-input labelKey="zones.growthStage" [(value)]="growthStage" />

            @if (varieties().length) {
              <div class="space-y-2">
                <p class="font-semibold">{{ 'zones.varietySuggestions' | translate }}</p>
                @for (v of varieties(); track v.id) {
                  <hv-card>
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <strong>{{ varietyLabel(v) }}</strong>
                        <p class="text-xs text-muted">
                          {{ v.varietyType }} · {{ v.riskBand }}
                          @if (v.maturityDays != null) {
                            · {{ v.maturityDays }}d
                          }
                        </p>
                      </div>
                      <hv-button
                        variant="secondary"
                        labelKey="zones.applyVariety"
                        (pressed)="applyVariety(v.id)"
                      />
                    </div>
                  </hv-card>
                }
              </div>
            }

            <div class="flex flex-wrap gap-2">
              <hv-button
                type="submit"
                [labelKey]="editingZoneId() ? 'common.save' : 'zones.add'"
                [loading]="saving()"
              />
              @if (editingZoneId()) {
                <hv-button variant="ghost" labelKey="common.cancel" (pressed)="resetForm()" />
              }
            </div>
          </form>
        </hv-card>
      }
    </div>
  `,
})
export class ZonesPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly farms = inject(FarmApiService);
  private readonly neighbours = inject(NeighbourApiService);
  private readonly suggestions = inject(SuggestionApiService);
  private readonly twinApi = inject(TwinApiService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  areaId = '';
  readonly zones = signal<any[]>([]);
  readonly warnings = signal<any[]>([]);
  readonly edges = signal<any[]>([]);
  readonly varieties = signal<any[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly label = signal('');
  readonly crop = signal('');
  readonly cropId = signal('');
  readonly seedVarietyId = signal('');
  readonly areaValue = signal('1');
  readonly plantingDate = signal('');
  readonly growthStage = signal('');
  readonly editingZoneId = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    this.areaId = this.route.snapshot.paramMap.get('areaId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId, 'areas']);
  }

  zoneSize(zone: any): string {
    const value = zone.area?.value ?? zone.areaInputValue ?? '—';
    const unit = zone.area?.unit ?? zone.areaInputUnit ?? '';
    return `${value} ${unit}`.trim();
  }

  relationFor(zoneId: string): string | null {
    const edge = this.edges().find((e) => e.zoneAId === zoneId || e.zoneBId === zoneId);
    return edge?.relation ?? null;
  }

  warningsFor(zoneId: string): any[] {
    return this.warnings().filter((w) => w.zoneAId === zoneId || w.zoneBId === zoneId);
  }

  varietyLabel(v: any): string {
    return this.language.current() === 'ur' ? v.nameUr || v.nameEn : v.nameEn || v.nameUr || v.id;
  }

  resetForm(): void {
    this.label.set('');
    this.crop.set('');
    this.cropId.set('');
    this.seedVarietyId.set('');
    this.areaValue.set('1');
    this.plantingDate.set('');
    this.growthStage.set('');
    this.editingZoneId.set(null);
    this.varieties.set([]);
  }

  startEdit(zone: any): void {
    this.editingZoneId.set(zone.id);
    this.label.set(zone.label ?? '');
    this.crop.set(zone.cropFreetext ?? '');
    this.cropId.set(zone.cropId ?? '');
    this.seedVarietyId.set(zone.seedVarietyId ?? '');
    this.areaValue.set(String(zone.area?.value ?? zone.areaInputValue ?? 1));
    this.plantingDate.set(zone.plantingDate ? String(zone.plantingDate).slice(0, 10) : '');
    this.growthStage.set(zone.growthStage ?? '');
    void this.loadVarieties();
  }

  onCropChange(): void {
    this.seedVarietyId.set('');
    void this.loadVarieties();
  }

  onCropIdChange(): void {
    this.seedVarietyId.set('');
    void this.loadVarieties();
  }

  async loadVarieties(): Promise<void> {
    const key = this.cropId().trim() || this.crop().trim();
    if (!key) {
      this.varieties.set([]);
      return;
    }
    try {
      this.varieties.set(
        (await firstValueFrom(this.suggestions.listSeedSuggestions(this.farmId, key))) as any[],
      );
    } catch {
      this.varieties.set([]);
    }
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [zones, warnings, twin] = await Promise.all([
        firstValueFrom(this.farms.listZones(this.farmId, this.areaId)),
        firstValueFrom(this.neighbours.listWarnings(this.farmId)).catch(() => []),
        firstValueFrom(this.twinApi.getTwin(this.farmId)).catch(() => null),
      ]);
      this.zones.set((zones as any[]) || []);
      this.warnings.set((warnings as any[]) || []);
      this.edges.set(((twin as any)?.neighbourEdges as any[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    if (!this.label().trim()) return;
    this.saving.set(true);
    try {
      const body = {
        label: this.label().trim(),
        cropFreetext: this.crop().trim() || this.label().trim(),
        cropId: this.cropId().trim() || undefined,
        seedVarietyId: this.seedVarietyId() || undefined,
        areaInputValue: Number(this.areaValue()) || 1,
        areaInputUnit: 'kanal',
        plantingDate: this.plantingDate().trim() || undefined,
        growthStage: this.growthStage().trim() || undefined,
      };
      if (this.editingZoneId()) {
        await firstValueFrom(
          this.farms.updateZone(this.farmId, this.areaId, this.editingZoneId()!, body),
        );
        this.toast.success(this.t.instant('zones.applyVariety'));
      } else {
        await firstValueFrom(this.farms.createZone(this.farmId, this.areaId, body));
        this.toast.success(this.t.instant('zones.add'));
      }
      this.resetForm();
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.saving.set(false);
    }
  }

  async applyVariety(varietyId: string): Promise<void> {
    this.seedVarietyId.set(varietyId);
    if (!this.editingZoneId()) return;
    try {
      await firstValueFrom(
        this.farms.updateZone(this.farmId, this.areaId, this.editingZoneId()!, {
          seedVarietyId: varietyId,
        }),
      );
      this.toast.success(this.t.instant('zones.applyVariety'));
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    }
  }

  async remove(zoneId: string): Promise<void> {
    if (!confirm(this.t.instant('zones.confirmDelete'))) return;
    try {
      await firstValueFrom(this.farms.deleteZone(this.farmId, this.areaId, zoneId));
      this.toast.success(this.t.instant('common.delete'));
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    }
  }
}
