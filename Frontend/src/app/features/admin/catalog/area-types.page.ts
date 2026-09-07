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
import { HvSelect } from '../../../shared/ui/hv-select';
import { HvAlert } from '../../../shared/ui/hv-alert';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { ToastService } from '../../../shared/ui/toast.service';
import { AdminApiService } from '../../../core/api/admin.service';

type AreaType = {
  id?: string;
  code: string;
  nameEn?: string;
  label?: string;
  nameUr?: string;
  category?: string | number;
  enabled?: boolean;
};

const CATEGORY_TO_BE: Record<string, number> = {
  open: 0,
  protected: 1,
  experimental: 2,
};

@Component({
  selector: 'app-admin-area-types-page',
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
    HvAlert,
    HvBadge,
  ],
  template: `
    <div class="hv-page-wide space-y-4">
      <hv-page-header titleKey="admin.nav.productionAreaTypes" subtitleKey="admin.catalog.areaSubtitle">
        <hv-button
          variant="secondary"
          [labelKey]="showForm() ? 'common.cancel' : 'admin.catalog.addAreaType'"
          (pressed)="showForm.set(!showForm())"
        />
      </hv-page-header>

      @if (showForm()) {
        <hv-card>
          <h2 class="mb-3 font-semibold">{{ 'admin.catalog.createAreaType' | translate }}</h2>
          <form class="grid gap-3 sm:grid-cols-2" (submit)="$event.preventDefault(); create()">
            <hv-input labelKey="admin.catalog.code" [(value)]="formCode" />
            <hv-input labelKey="admin.catalog.nameEn" [(value)]="formNameEn" />
            <hv-input labelKey="admin.catalog.nameUr" [(value)]="formNameUr" />
            <hv-select
              labelKey="admin.catalog.category"
              [options]="categoryOptions"
              [(value)]="formCategory"
            />
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
          @for (item of items(); track item.code || item.id) {
            <hv-card>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <strong>{{ itemLabel(item) }}</strong>
                    <hv-badge [tone]="item.enabled === false ? 'neutral' : 'success'">
                      {{ (item.enabled === false ? 'admin.catalog.disabled' : 'admin.catalog.enabled') | translate }}
                    </hv-badge>
                  </div>
                  <p class="mt-1 text-xs text-muted">
                    {{ item.code }} · {{ categoryLabel(item.category) }}
                  </p>
                </div>
                <hv-button
                  variant="secondary"
                  [labelKey]="item.enabled === false ? 'admin.catalog.enable' : 'admin.catalog.disable'"
                  [loading]="togglingId() === item.code"
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
export class AdminAreaTypesPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslateService);

  readonly items = signal<AreaType[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly togglingId = signal<string | null>(null);

  readonly formCode = signal('');
  readonly formNameEn = signal('');
  readonly formNameUr = signal('');
  readonly formCategory = signal('open');

  readonly categoryOptions = [
    { value: 'open', labelKey: 'admin.catalog.categoryOpen' },
    { value: 'protected', labelKey: 'admin.catalog.categoryProtected' },
    { value: 'experimental', labelKey: 'admin.catalog.categoryExperimental' },
  ];

  ngOnInit(): void {
    void this.load();
  }

  itemLabel(item: AreaType): string {
    return item.nameEn || item.label || item.code;
  }

  categoryLabel(value: string | number | undefined): string {
    if (value == null) return '—';
    if (typeof value === 'number') {
      return ({ 0: 'open', 1: 'protected', 2: 'experimental' } as Record<number, string>)[value] ?? String(value);
    }
    return String(value);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.items.set(((await firstValueFrom(this.api.listAreaTypes())) as AreaType[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Request failed');
    } finally {
      this.loading.set(false);
    }
  }

  async create(): Promise<void> {
    this.formError.set(null);
    const code = this.formCode().trim();
    const nameEn = this.formNameEn().trim();
    if (!code || !nameEn) {
      this.formError.set(this.i18n.instant('admin.catalog.areaRequired'));
      return;
    }
    this.saving.set(true);
    try {
      const category = this.formCategory().trim().toLowerCase() || 'open';
      await firstValueFrom(
        this.api.createAreaType({
          code,
          nameEn,
          nameUr: this.formNameUr().trim() || undefined,
          category: CATEGORY_TO_BE[category] ?? 0,
          enabled: true,
        }),
      );
      this.toast.show(this.i18n.instant('admin.catalog.areaSaved'), 'success');
      this.formCode.set('');
      this.formNameEn.set('');
      this.formNameUr.set('');
      this.formCategory.set('open');
      this.showForm.set(false);
      await this.load();
    } catch {
      this.formError.set(this.i18n.instant('admin.catalog.createFailed'));
    } finally {
      this.saving.set(false);
    }
  }

  async toggle(item: AreaType): Promise<void> {
    const disable = item.enabled !== false;
    const ok = window.confirm(
      this.i18n.instant(disable ? 'admin.catalog.confirmDisable' : 'admin.catalog.confirmEnable', {
        name: this.itemLabel(item),
      }),
    );
    if (!ok) return;
    this.togglingId.set(item.code);
    try {
      await firstValueFrom(this.api.updateAreaType(item.code, { enabled: !disable }));
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
