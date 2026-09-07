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
import { WaterApiService } from '../../../core/api/water.service';
import { ToastService } from '../../../shared/ui/toast.service';

const TYPE_OPTIONS = [
  { value: 'tube_well', labelKey: 'setup.waterTubeWell' },
  { value: 'canal', labelKey: 'setup.waterCanal' },
  { value: 'rain_fed', labelKey: 'setup.waterRainFed' },
  { value: 'reservoir', labelKey: 'setup.waterReservoir' },
  { value: 'other', labelKey: 'setup.waterOther' },
];

@Component({
  selector: 'app-water-page',
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
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="water.title">
        <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        @if (!sources().length) {
          <hv-empty-state titleKey="water.empty" />
        } @else {
          <ul class="m-0 mb-4 flex list-none flex-col gap-3 p-0">
            @for (source of sources(); track source.id) {
              <li>
                <hv-card>
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p class="font-semibold">{{ typeLabel(source.type) }}</p>
                      <p class="text-sm text-muted">
                        {{ source.irrigationMethod || '—' }}
                        @if (source.reliability) {
                          · {{ source.reliability }}
                        }
                      </p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <hv-button
                        variant="secondary"
                        labelKey="common.edit"
                        (pressed)="startEdit(source)"
                      />
                      <hv-button
                        variant="danger"
                        labelKey="common.delete"
                        (pressed)="remove(source.id)"
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
            {{ (editingId() ? 'water.edit' : 'water.add') | translate }}
          </h2>
          <form class="space-y-3" (submit)="$event.preventDefault(); save()">
            <hv-select labelKey="water.type" [options]="typeOptions" [(value)]="type" />
            <hv-input labelKey="water.irrigation" [(value)]="irrigationMethod" />
            <div class="flex flex-wrap gap-2">
              <hv-button
                type="submit"
                [labelKey]="editingId() ? 'common.save' : 'water.add'"
                [loading]="saving()"
              />
              @if (editingId()) {
                <hv-button variant="ghost" labelKey="common.cancel" (pressed)="resetForm()" />
              }
            </div>
          </form>
        </hv-card>
      }
    </div>
  `,
})
export class WaterPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(WaterApiService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly sources = signal<any[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly type = signal('tube_well');
  readonly irrigationMethod = signal('flood');
  readonly typeOptions = TYPE_OPTIONS;

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  typeLabel(code: string): string {
    const opt = TYPE_OPTIONS.find((o) => o.value === code);
    return opt ? this.t.instant(opt.labelKey) : code;
  }

  resetForm(): void {
    this.editingId.set(null);
    this.type.set('tube_well');
    this.irrigationMethod.set('flood');
  }

  startEdit(source: any): void {
    this.editingId.set(source.id);
    this.type.set(source.type || 'tube_well');
    this.irrigationMethod.set(source.irrigationMethod || '');
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.sources.set(((await firstValueFrom(this.api.list(this.farmId))) as any[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    this.saving.set(true);
    try {
      const body = {
        type: this.type(),
        irrigationMethod: this.irrigationMethod().trim() || null,
        provenance: 'farmer_provided',
      };
      if (this.editingId()) {
        await firstValueFrom(this.api.update(this.farmId, this.editingId()!, body));
        this.toast.success(this.t.instant('common.save'));
      } else {
        await firstValueFrom(this.api.create(this.farmId, body));
        this.toast.success(this.t.instant('water.add'));
      }
      this.resetForm();
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(sourceId: string): Promise<void> {
    if (!confirm(this.t.instant('water.confirmDelete'))) return;
    try {
      await firstValueFrom(this.api.delete(this.farmId, sourceId));
      this.toast.success(this.t.instant('common.delete'));
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    }
  }
}
