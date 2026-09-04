import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { AdminApiService } from '../../../core/api/admin.service';

type AnalyticsStat = {
  id: string;
  labelKey: string;
  value: string | number;
  barPercent: number;
};

type BeAnalytics = {
  farmers?: number;
  farms?: number;
  plans?: number;
  threads?: number;
  activeThreads?: number;
  llmUsageCount?: number;
  estimatedCostUsd?: number;
};

@Component({
  selector: 'app-admin-analytics-page',
  imports: [TranslatePipe, PageHeader, HvSkeleton, HvErrorState, HvCard],
  template: `
    <div class="hv-page-wide space-y-4">
      <hv-page-header titleKey="admin.nav.analytics" subtitleKey="admin.analytics.subtitle" />

      @if (loading()) {
        <hv-skeleton [lines]="6" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        <div class="space-y-3">
          @for (stat of stats(); track stat.id) {
            <hv-card>
              <div class="mb-2 flex items-center justify-between gap-3">
                <p class="m-0 text-sm font-medium">{{ stat.labelKey | translate }}</p>
                <p class="m-0 font-display text-xl font-semibold">{{ stat.value }}</p>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-[var(--hv-color-neutral-100)]">
                <div
                  class="h-full rounded-full bg-primary-500 transition-all"
                  [style.width.%]="stat.barPercent"
                ></div>
              </div>
            </hv-card>
          }
        </div>
      }
    </div>
  `,
})
export class AdminAnalyticsPage implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly stats = signal<AnalyticsStat[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let raw: BeAnalytics;
      try {
        raw = (await firstValueFrom(this.api.analytics())) as BeAnalytics;
      } catch {
        raw = (await firstValueFrom(this.api.metrics())) as BeAnalytics;
      }
      this.stats.set(this.toStats(raw));
    } catch (e: any) {
      this.error.set(e?.message || 'Request failed');
    } finally {
      this.loading.set(false);
    }
  }

  private toStats(a: BeAnalytics): AnalyticsStat[] {
    const farmers = a.farmers ?? 0;
    const farms = a.farms ?? 0;
    const plans = a.plans ?? 0;
    const threads = a.threads ?? a.activeThreads ?? 0;
    const llm = a.llmUsageCount ?? 0;
    const cost = Number(a.estimatedCostUsd ?? 0);
    const max = Math.max(farmers, farms, plans, threads, llm, 1);
    const rows: AnalyticsStat[] = [
      {
        id: 'farmers',
        labelKey: 'admin.metrics.farmers',
        value: farmers,
        barPercent: Math.min(100, (farmers / max) * 100),
      },
      {
        id: 'farms',
        labelKey: 'admin.metrics.farms',
        value: farms,
        barPercent: Math.min(100, (farms / max) * 100),
      },
      {
        id: 'plans',
        labelKey: 'admin.metrics.plans',
        value: plans,
        barPercent: Math.min(100, (plans / max) * 100),
      },
      {
        id: 'threads',
        labelKey: 'admin.metrics.threads',
        value: threads,
        barPercent: Math.min(100, (threads / max) * 100),
      },
    ];
    if (a.llmUsageCount != null || a.estimatedCostUsd != null) {
      rows.push(
        {
          id: 'llmUsage',
          labelKey: 'admin.analytics.llmCalls',
          value: llm,
          barPercent: Math.min(100, (llm / max) * 100),
        },
        {
          id: 'llmCost',
          labelKey: 'admin.analytics.llmCost',
          value: cost.toFixed(4),
          barPercent: Math.min(100, (cost / Math.max(cost, 0.01)) * 40),
        },
      );
    }
    return rows;
  }
}
