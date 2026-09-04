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
import { ToastService } from '../../../shared/ui/toast.service';
import { AdminApiService } from '../../../core/api/admin.service';

type Rate = {
  id: string;
  cropId: string;
  cropName?: string;
  unit?: string;
  ratePerUnit?: number;
  amount?: number;
  currency?: string;
  period?: string;
  periodLabel?: string;
  sourceLabel?: string | null;
  isActive?: boolean;
};

@Component({
  selector: 'app-admin-rates-page',
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
  ],
  template: `
    <div class="hv-page-wide space-y-4">
      <hv-page-header titleKey="admin.nav.governmentRates" subtitleKey="admin.rates.subtitle" />

      <hv-card>
        <h2 class="mb-3 font-semibold">{{ 'admin.rates.add' | translate }}</h2>
        <form class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" (submit)="$event.preventDefault(); create()">
          <hv-input labelKey="admin.catalog.cropId" [(value)]="cropId" />
          <hv-input labelKey="admin.rates.ratePerUnit" type="number" [(value)]="ratePerUnit" />
          <hv-input labelKey="admin.rates.unit" [(value)]="unit" />
          <hv-input labelKey="admin.rates.currency" [(value)]="currency" />
          <hv-input labelKey="admin.rates.period" [(value)]="period" />
          <hv-input labelKey="admin.rates.source" [(value)]="sourceLabel" />
          <div class="flex items-end">
            <hv-button type="submit" labelKey="admin.rates.create" [loading]="saving()" />
          </div>
        </form>
        @if (formError()) {
          <hv-alert class="mt-3" tone="error">{{ formError() }}</hv-alert>
        }
        @if (formOk()) {
          <hv-alert class="mt-3" tone="success">{{ formOk() }}</hv-alert>
        }
      </hv-card>

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!rates().length) {
        <hv-empty-state titleKey="admin.rates.empty" descriptionKey="admin.rates.emptyHint" />
      } @else {
        <hv-card>
          <h2 class="mb-3 font-semibold">{{ 'admin.rates.listTitle' | translate }}</h2>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[36rem] text-start text-sm">
              <thead class="border-b border-[var(--hv-color-border)] text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th class="py-2 pe-3 font-semibold">{{ 'admin.catalog.cropId' | translate }}</th>
                  <th class="py-2 pe-3 font-semibold">{{ 'admin.rates.amount' | translate }}</th>
                  <th class="py-2 pe-3 font-semibold">{{ 'admin.rates.unit' | translate }}</th>
                  <th class="py-2 pe-3 font-semibold">{{ 'admin.rates.period' | translate }}</th>
                  <th class="py-2 font-semibold">{{ 'admin.rates.active' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (rate of rates(); track rate.id) {
                  <tr class="border-b border-[var(--hv-color-border)] last:border-0">
                    <td class="py-2.5 pe-3">{{ rate.cropName || rate.cropId }}</td>
                    <td class="py-2.5 pe-3">
                      {{ rate.currency || 'PKR' }} {{ amount(rate) }}
                    </td>
                    <td class="py-2.5 pe-3">{{ rate.unit || '—' }}</td>
                    <td class="py-2.5 pe-3">{{ rate.periodLabel || rate.period || '—' }}</td>
                    <td class="py-2.5">
                      <hv-button
                        variant="secondary"
                        [labelKey]="(rate.isActive ?? true) ? 'admin.rates.deactivate' : 'admin.rates.activate'"
                        [loading]="togglingId() === rate.id"
                        (pressed)="toggle(rate)"
                      />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </hv-card>
      }
    </div>
  `,
})
export class AdminRatesPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslateService);

  readonly rates = signal<Rate[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly formOk = signal<string | null>(null);
  readonly togglingId = signal<string | null>(null);

  readonly cropId = signal('');
  readonly ratePerUnit = signal('');
  readonly unit = signal('kg');
  readonly currency = signal('PKR');
  readonly period = signal('');
  readonly sourceLabel = signal('');

  ngOnInit(): void {
    void this.load();
  }

  amount(rate: Rate): string {
    const n = rate.ratePerUnit ?? rate.amount ?? 0;
    return Number(n).toLocaleString();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.rates.set(((await firstValueFrom(this.api.listRates())) as Rate[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Request failed');
    } finally {
      this.loading.set(false);
    }
  }

  async create(): Promise<void> {
    this.formError.set(null);
    this.formOk.set(null);
    const amount = Number(this.ratePerUnit());
    if (!this.cropId().trim() || !this.period().trim() || !Number.isFinite(amount) || amount < 0) {
      this.formError.set(this.i18n.instant('admin.rates.required'));
      return;
    }
    this.saving.set(true);
    try {
      await firstValueFrom(
        this.api.createRate({
          cropId: this.cropId().trim(),
          ratePerUnit: amount,
          unit: this.unit().trim() || 'kg',
          currency: this.currency().trim() || 'PKR',
          period: this.period().trim(),
          sourceLabel: this.sourceLabel().trim() || undefined,
        }),
      );
      this.formOk.set(this.i18n.instant('admin.rates.created'));
      this.toast.show(this.i18n.instant('admin.rates.created'), 'success');
      this.cropId.set('');
      this.ratePerUnit.set('');
      this.period.set('');
      this.sourceLabel.set('');
      await this.load();
    } catch {
      this.formError.set(this.i18n.instant('admin.rates.createFailed'));
    } finally {
      this.saving.set(false);
    }
  }

  async toggle(rate: Rate): Promise<void> {
    this.togglingId.set(rate.id);
    try {
      await firstValueFrom(
        this.api.updateRate(rate.id, { isActive: !(rate.isActive ?? true) }),
      );
      await this.load();
    } catch {
      this.toast.show(this.i18n.instant('admin.rates.updateFailed'), 'error');
    } finally {
      this.togglingId.set(null);
    }
  }
}
