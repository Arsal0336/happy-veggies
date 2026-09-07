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

type SeedVariety = {
  id: string;
  cropId: string;
  nameEn?: string;
  name?: string;
  nameUr?: string;
  enabled?: boolean;
};

@Component({
  selector: 'app-admin-seed-varieties-page',
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
      <hv-page-header titleKey="admin.nav.seedVarieties" subtitleKey="admin.catalog.seedsSubtitle">
        <hv-button
          variant="secondary"
          [labelKey]="showForm() ? 'common.cancel' : 'admin.catalog.addSeed'"
          (pressed)="showForm.set(!showForm())"
        />
      </hv-page-header>

      @if (showForm()) {
        <hv-card>
          <h2 class="mb-3 font-semibold">{{ 'admin.catalog.createSeed' | translate }}</h2>
          <form class="grid gap-3 sm:grid-cols-2" (submit)="$event.preventDefault(); create()">
            <hv-input labelKey="admin.catalog.id" [(value)]="formId" />
            <hv-input labelKey="admin.catalog.cropId" [(value)]="formCropId" />
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
      } @else if (!items().length) {
        <hv-empty-state titleKey="admin.catalog.empty" descriptionKey="admin.catalog.emptyHint" />
      } @else {
        <div class="space-y-2">
          @for (item of items(); track item.id) {
            <hv-card>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <strong>{{ itemName(item) }}</strong>
                    <hv-badge [tone]="item.enabled === false ? 'neutral' : 'success'">
                      {{ (item.enabled === false ? 'admin.catalog.disabled' : 'admin.catalog.enabled') | translate }}
                    </hv-badge>
                  </div>
                  <p class="mt-1 text-xs text-muted">{{ item.cropId }} · {{ item.id }}</p>
                </div>
                <hv-button
                  variant="secondary"
                  [labelKey]="item.enabled === false ? 'admin.catalog.enable' : 'admin.catalog.disable'"
                  [loading]="togglingId() === item.id"
                  (pressed)="toggle(item)"
                />
              </div>
            </hv-card>
          }
        </div>
      }
    </div>
  `,
})
export class AdminSeedVarietiesPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslateService);

  readonly items = signal<SeedVariety[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly togglingId = signal<string | null>(null);

  readonly formId = signal('');
  readonly formCropId = signal('');
  readonly formNameEn = signal('');
  readonly formNameUr = signal('');

  ngOnInit(): void {
    void this.load();
  }

  itemName(item: SeedVariety): string {
    return item.nameEn || item.name || item.id;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(((await firstValueFrom(this.api.listSeedVarieties())) as SeedVariety[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Request failed');
    } finally {
      this.loading.set(false);
    }
  }

  async create(): Promise<void> {
    this.formError.set(null);
    const id = this.formId().trim();
    const cropId = this.formCropId().trim();
    const nameEn = this.formNameEn().trim();
    if (!id || !cropId || !nameEn) {
      this.formError.set(this.i18n.instant('admin.catalog.seedRequired'));
      return;
    }
    this.saving.set(true);
    try {
      await firstValueFrom(
        this.api.createSeedVariety({
          id,
          cropId,
          nameEn,
          nameUr: this.formNameUr().trim() || undefined,
          enabled: true,
        }),
      );
      this.toast.show(this.i18n.instant('admin.catalog.seedSaved'), 'success');
      this.formId.set('');
      this.formCropId.set('');
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

  async toggle(item: SeedVariety): Promise<void> {
    const disable = item.enabled !== false;
    const ok = window.confirm(
      this.i18n.instant(disable ? 'admin.catalog.confirmDisable' : 'admin.catalog.confirmEnable', {
        name: this.itemName(item),
      }),
    );
    if (!ok) return;
    this.togglingId.set(item.id);
    try {
      await firstValueFrom(this.api.updateSeedVariety(item.id, { enabled: !disable }));
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
