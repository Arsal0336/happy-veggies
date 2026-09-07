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
import { HvSelect } from '../../../shared/ui/hv-select';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { SoilApiService } from '../../../core/api/soil.service';
import { ToastService } from '../../../shared/ui/toast.service';

const SOIL_OPTIONS = [
  { value: 'sandy', labelKey: 'setup.soilSandy' },
  { value: 'clay', labelKey: 'setup.soilClay' },
  { value: 'loam', labelKey: 'setup.soilLoam' },
  { value: 'silt', labelKey: 'setup.soilSilt' },
  { value: 'mixed', labelKey: 'setup.soilMixed' },
  { value: 'unknown', labelKey: 'setup.soilUnknown' },
];

@Component({
  selector: 'app-soil-page',
  imports: [
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
    HvButton,
    HvInput,
    HvSelect,
    HvBadge,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="soil.title">
        <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        @if (!profiles().length) {
          <hv-empty-state titleKey="soil.empty" descriptionKey="soil.emptyHint" />
        } @else {
          <ul class="m-0 mb-4 flex list-none flex-col gap-3 p-0">
            @for (p of profiles(); track p.id) {
              <li>
                <hv-card>
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p class="font-semibold">{{ soilLabel(p.soilType) }}</p>
                      <p class="text-sm text-muted">
                        @if (p.texture) {
                          {{ p.texture }} ·
                        }
                        {{ p.phValue != null ? 'pH ' + p.phValue : '—' }}
                      </p>
                    </div>
                    <hv-badge tone="info">{{ provenanceLabel(p.soilTypeProvenance) }}</hv-badge>
                  </div>
                </hv-card>
              </li>
            }
          </ul>
        }

        <hv-card>
          <h2 class="mb-3 font-semibold">{{ 'soil.form' | translate }}</h2>
          <form class="space-y-3" (submit)="$event.preventDefault(); save()">
            <hv-select labelKey="soil.type" [options]="soilOptions" [(value)]="soilType" />
            <hv-input labelKey="soil.texture" [(value)]="texture" />
            <hv-input labelKey="soil.ph" type="number" [(value)]="phValue" />
            <hv-input labelKey="soil.notes" [(value)]="notes" />
            <p class="text-xs text-muted">{{ 'soil.provenanceHint' | translate }}</p>
            <hv-button type="submit" labelKey="common.save" [loading]="saving()" />
          </form>
        </hv-card>
      }
    </div>
  `,
})
export class SoilPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(SoilApiService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly profiles = signal<any[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly soilType = signal('loam');
  readonly texture = signal('');
  readonly phValue = signal('');
  readonly notes = signal('');
  readonly soilOptions = SOIL_OPTIONS;
  private primaryId: string | undefined;

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  soilLabel(code: string | null | undefined): string {
    if (!code) return this.t.instant('common.unnamed');
    const opt = SOIL_OPTIONS.find((o) => o.value === code);
    return opt ? this.t.instant(opt.labelKey) : code;
  }

  provenanceLabel(provenance: string | null | undefined): string {
    const v = (provenance ?? '').toLowerCase();
    if (v.includes('farmer')) return 'farmer';
    if (v.includes('sensor') || v.includes('measured')) return 'sensor';
    if (v.includes('provider') || v.includes('third')) return 'provider';
    if (v.includes('estimat') || v.includes('system')) return 'estimated';
    return provenance || 'manual';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const list = ((await firstValueFrom(this.api.list(this.farmId))) as any[]) || [];
      this.profiles.set(list);
      const primary = list[0];
      this.primaryId = primary?.id;
      if (primary) {
        this.soilType.set(primary.soilType || 'loam');
        this.texture.set(primary.texture || '');
        this.phValue.set(primary.phValue != null ? String(primary.phValue) : '');
        this.notes.set(primary.farmerNotes || '');
      }
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      await firstValueFrom(
        this.api.upsert(this.farmId, {
          id: this.primaryId,
          soilType: this.soilType(),
          texture: this.texture().trim() || null,
          phValue: this.phValue() ? Number(this.phValue()) : null,
          farmerNotes: this.notes().trim() || null,
          provenance: 'farmer_provided',
        }),
      );
      this.toast.success(this.t.instant('common.save'));
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.saving.set(false);
    }
  }
}
