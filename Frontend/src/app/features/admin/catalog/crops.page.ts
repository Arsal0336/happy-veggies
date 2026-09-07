import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvInput } from '../../../shared/ui/hv-input';
import { HvAlert } from '../../../shared/ui/hv-alert';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { ToastService } from '../../../shared/ui/toast.service';
import { AdminApiService } from '../../../core/api/admin.service';

type Crop = {
  id: string;
  nameEn?: string;
  name?: string;
  nameUr?: string;
  enabled?: boolean;
};

@Component({
  selector: 'app-admin-crops-page',
  imports: [
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
    HvButton,
    HvInput,
    HvAlert,
    HvBadge,
  ],
  template: `
    <div class="hv-page-wide space-y-4">
      <hv-page-header titleKey="admin.nav.crops" subtitleKey="admin.catalog.cropsSubtitle">
        <hv-button
          variant="secondary"
          [labelKey]="showForm() ? 'common.cancel' : 'admin.catalog.addCrop'"
          (pressed)="showForm.set(!showForm())"
        />
      </hv-page-header>

      @if (showForm()) {
        <hv-card>
          <h2 class="mb-3 font-semibold">{{ 'admin.catalog.createCrop' | translate }}</h2>
          <form class="grid gap-3 sm:grid-cols-2" (submit)="$event.preventDefault(); create()">
            <hv-input labelKey="admin.catalog.id" [(value)]="formId" />
            <hv-input labelKey="admin.catalog.nameEn" [(value)]="formNameEn" />
            <hv-input labelKey="admin.catalog.nameUr" [(value)]="formNameUr" />
            <div class="flex items-end">
              <hv-button type="submit" labelKey="common.save" [loading]="saving()" />
            </div>
          </form>
          @if (formError()) {
            <hv-alert class="mt-3" tone="error">{{ formError() }}</hv-alert>
          }
        </hv-card>
      }

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!crops().length) {
        <hv-empty-state titleKey="admin.catalog.empty" descriptionKey="admin.catalog.emptyHint" />
      } @else {
        <div class="space-y-2">
          @for (crop of crops(); track crop.id) {
            <hv-card>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <strong>{{ cropName(crop) }}</strong>
                    <hv-badge [tone]="crop.enabled === false ? 'neutral' : 'success'">
                      {{ (crop.enabled === false ? 'admin.catalog.disabled' : 'admin.catalog.enabled') | translate }}
                    </hv-badge>
                  </div>
                  <p class="mt-1 text-xs text-muted">
                    {{ crop.id }}
                    @if (crop.nameUr) {
                      · {{ crop.nameUr }}
                    }
                  </p>
                </div>
                <hv-button
                  variant="secondary"
                  [labelKey]="crop.enabled === false ? 'admin.catalog.enable' : 'admin.catalog.disable'"
                  [loading]="togglingId() === crop.id"
                  (pressed)="toggle(crop)"
                />
              </div>
            </hv-card>
          }
        </div>
      }
    </div>
  `,
})
export class AdminCropsPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslateService);

  readonly crops = signal<Crop[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly togglingId = signal<string | null>(null);

  readonly formId = signal('');
  readonly formNameEn = signal('');
  readonly formNameUr = signal('');

  ngOnInit(): void {
    void this.load();
  }

  cropName(crop: Crop): string {
    return crop.nameEn || crop.name || crop.id;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.crops.set(((await firstValueFrom(this.api.listCrops())) as Crop[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Request failed');
    } finally {
      this.loading.set(false);
    }
  }

  async create(): Promise<void> {
    this.formError.set(null);
    const id = this.formId().trim();
    const nameEn = this.formNameEn().trim();
    if (!id || !nameEn) {
      this.formError.set(this.i18n.instant('admin.catalog.cropRequired'));
      return;
    }
    this.saving.set(true);
    try {
      await firstValueFrom(
        this.api.createCrop({
          id,
          nameEn,
          nameUr: this.formNameUr().trim() || undefined,
          enabled: true,
        }),
      );
      this.toast.show(this.i18n.instant('admin.catalog.cropSaved'), 'success');
      this.formId.set('');
      this.formNameEn.set('');
      this.formNameUr.set('');
      this.showForm.set(false);
      await this.load();
    } catch {
      this.formError.set(this.i18n.instant('admin.catalog.createFailed'));
    } finally {
      this.saving.set(false);
    }
  }

  async toggle(crop: Crop): Promise<void> {
    const disable = crop.enabled !== false;
    const ok = window.confirm(
      this.i18n.instant(disable ? 'admin.catalog.confirmDisable' : 'admin.catalog.confirmEnable', {
        name: this.cropName(crop),
      }),
    );
    if (!ok) return;
    this.togglingId.set(crop.id);
    try {
      await firstValueFrom(this.api.updateCrop(crop.id, { enabled: !disable }));
      this.toast.show(
        this.i18n.instant(disable ? 'admin.catalog.disabledToast' : 'admin.catalog.enabledToast'),
        'success',
      );
      await this.load();
    } catch {
      this.toast.show(this.i18n.instant('admin.catalog.updateFailed'), 'error');
    } finally {
      this.togglingId.set(null);
    }
  }
}
