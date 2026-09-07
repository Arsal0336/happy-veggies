import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { FarmApiService } from '../../../core/api/farm.service';
import { ToastService } from '../../../shared/ui/toast.service';

const TYPE_OPTIONS = [
  'open_field',
  'shed',
  'greenhouse',
  'tunnel_polyhouse',
  'experimental',
  'other_protected',
];

function typeLabelKey(code: string): string {
  switch (code) {
    case 'open_field':
      return 'areas.openField';
    case 'shed':
      return 'areas.shed';
    case 'greenhouse':
      return 'areas.greenhouse';
    case 'tunnel_polyhouse':
      return 'areas.tunnel';
    case 'experimental':
      return 'areas.experimental';
    default:
      return 'areas.otherProtected';
  }
}

@Component({
  selector: 'app-areas-page',
  imports: [
    TranslatePipe,
    RouterLink,
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
      <hv-page-header titleKey="areas.title">
        <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        @if (!areas().length) {
          <hv-empty-state titleKey="areas.empty" descriptionKey="areas.emptyHint" />
        } @else {
          <ul class="m-0 mb-4 flex list-none flex-col gap-3 p-0">
            @for (area of areas(); track area.id) {
              <li>
                <hv-card>
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p class="font-semibold">{{ area.name }}</p>
                      <p class="text-sm text-muted">
                        {{ typeLabelKey(area.typeCode) | translate }} ·
                        {{ areaSize(area) }}
                      </p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <a [routerLink]="['/farms', farmId, 'areas', area.id, 'zones']">
                        <hv-button variant="secondary" labelKey="areas.manageZones" />
                      </a>
                      <hv-button
                        variant="secondary"
                        labelKey="common.edit"
                        (pressed)="startEdit(area)"
                      />
                      <hv-button
                        variant="danger"
                        labelKey="common.delete"
                        (pressed)="remove(area.id)"
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
            {{ (editingId() ? 'areas.edit' : 'areas.add') | translate }}
          </h2>
          <form class="space-y-3" (submit)="$event.preventDefault(); save()">
            <hv-input labelKey="areas.name" [(value)]="name" />
            <hv-select labelKey="areas.type" [options]="typeOptions" [(value)]="typeCode" />
            <hv-input labelKey="farms.area" type="number" [(value)]="areaValue" />
            <div class="flex flex-wrap gap-2">
              <hv-button
                type="submit"
                [labelKey]="editingId() ? 'common.save' : 'areas.add'"
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
export class AreasPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(FarmApiService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly areas = signal<any[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly name = signal('');
  readonly typeCode = signal('open_field');
  readonly areaValue = signal('1');
  readonly typeLabelKey = typeLabelKey;

  readonly typeOptions = TYPE_OPTIONS.map((code) => ({
    value: code,
    labelKey: typeLabelKey(code),
  }));

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  areaSize(area: any): string {
    const value = area.area?.value ?? area.areaInputValue ?? '—';
    const unit = area.area?.unit ?? area.areaInputUnit ?? '';
    return `${value} ${unit}`.trim();
  }

  resetForm(): void {
    this.editingId.set(null);
    this.name.set('');
    this.typeCode.set('open_field');
    this.areaValue.set('1');
  }

  startEdit(area: any): void {
    this.editingId.set(area.id);
    this.name.set(area.name ?? '');
    this.typeCode.set(area.typeCode ?? 'open_field');
    this.areaValue.set(String(area.area?.value ?? area.areaInputValue ?? 1));
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.areas.set((await firstValueFrom(this.api.listAreas(this.farmId))) as any[]);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    if (!this.name().trim()) return;
    this.saving.set(true);
    try {
      const body = {
        name: this.name().trim(),
        typeCode: this.typeCode(),
        areaInputValue: Number(this.areaValue()) || 1,
        areaInputUnit: 'kanal',
      };
      if (this.editingId()) {
        await firstValueFrom(this.api.updateArea(this.farmId, this.editingId()!, body));
        this.toast.success(this.t.instant('common.save'));
      } else {
        await firstValueFrom(this.api.createArea(this.farmId, body));
        this.toast.success(this.t.instant('areas.add'));
      }
      this.resetForm();
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(areaId: string): Promise<void> {
    if (!confirm(this.t.instant('areas.confirmDelete'))) return;
    try {
      await firstValueFrom(this.api.deleteArea(this.farmId, areaId));
      this.toast.success(this.t.instant('common.delete'));
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    }
  }
}
