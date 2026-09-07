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
import { HvBadge } from '../../../shared/ui/hv-badge';
import { EconomicsApiService } from '../../../core/api/economics.service';

@Component({
  selector: 'app-economics-page',
  imports: [
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
    HvButton,
    HvBadge,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="economics.title">
        <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        <p class="mb-4 text-sm text-muted">
          {{ disclaimer() || ('economics.disclaimer' | translate) }}
        </p>

        @if (!snapshots().length) {
          <hv-empty-state titleKey="economics.empty" />
        } @else {
          @if (totalGross(); as total) {
            <hv-card>
              <p class="m-0 text-sm text-muted">{{ 'economics.totalGross' | translate }}</p>
              <p class="mt-1 font-display text-2xl font-semibold text-[var(--hv-color-primary-900)]">
                {{ total }}
              </p>
            </hv-card>
          }
          <ul class="m-0 mt-3 flex list-none flex-col gap-3 p-0">
            @for (s of snapshots(); track snapshotKey(s)) {
              <li>
                <hv-card>
                  <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <strong>{{ s.cropId || s.cropName || '—' }}</strong>
                    <hv-badge>{{ s.label || 'historical_reference' }}</hv-badge>
                  </div>
                  <p class="text-sm">
                    {{ 'economics.yield' | translate }}:
                    {{ s.expectedYield ?? '—' }} {{ s.yieldUnit || '' }}
                  </p>
                  <p class="text-sm">
                    {{ 'economics.rate' | translate }}:
                    {{ s.ratePerUnit ?? '—' }} {{ s.currency || 'PKR' }}/{{ s.rateUnit || s.RateUnit || 'kg' }}
                    @if (s.period) {
                      ({{ s.period }})
                    }
                  </p>
                  @if (s.yieldInRateUnit != null || s.YieldInRateUnit != null) {
                    <p class="text-xs text-muted">
                      {{ 'economics.convertedYield' | translate }}:
                      {{ s.yieldInRateUnit ?? s.YieldInRateUnit }} {{ s.rateUnit || s.RateUnit || 'kg' }}
                    </p>
                  }
                  <p class="text-base font-semibold text-[var(--hv-color-primary-800)]">
                    {{ 'economics.gross' | translate }}:
                    {{ formatMoney(grossOf(s), s.currency) }}
                  </p>
                  @if (s.sourceLabel) {
                    <p class="mt-1 text-xs text-muted">{{ s.sourceLabel }}</p>
                  }
                </hv-card>
              </li>
            }
          </ul>
        }
      }
    </div>
  `,
})
export class EconomicsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(EconomicsApiService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly snapshots = signal<any[]>([]);
  readonly disclaimer = signal<string | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  snapshotKey(s: any): string {
    return `${s.cropZoneId || s.cropId || s.cropName || 'crop'}-${s.period || ''}`;
  }

  grossOf(s: any): number | null {
    const stored = Number(s.referenceGrossValue ?? s.ReferenceGrossValue);
    if (Number.isFinite(stored)) return stored;
    const y = Number(s.expectedYield ?? s.ExpectedYield);
    const r = Number(s.ratePerUnit ?? s.RatePerUnit);
    if (Number.isFinite(y) && Number.isFinite(r)) return y * r;
    return null;
  }

  formatMoney(value: unknown, currency?: string): string {
    if (value == null || value === '') return '—';
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    const cur = currency || 'PKR';
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: cur,
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${cur} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
  }

  totalGross(): string | null {
    const amounts = this.snapshots()
      .map((s) => this.grossOf(s))
      .filter((n): n is number => n != null);
    if (!amounts.length) return null;
    const currency = this.snapshots()[0]?.currency || this.snapshots()[0]?.Currency || 'PKR';
    return this.formatMoney(
      amounts.reduce((a, b) => a + b, 0),
      currency,
    );
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data: any = await firstValueFrom(this.api.getFarmEconomics(this.farmId));
      this.snapshots.set(data?.items || data?.snapshots || (Array.isArray(data) ? data : []) || []);
      this.disclaimer.set(data?.disclaimer || null);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }
}
