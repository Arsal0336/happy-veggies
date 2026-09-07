import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { StatCard } from '../../../shared/ui/stat-card';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { AdminApiService } from '../../../core/api/admin.service';

type Metrics = {
  farmers?: number;
  farms?: number;
  plans?: number;
  activeThreads?: number;
};

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [TranslatePipe, PageHeader, StatCard, HvSkeleton, HvErrorState, HvCard],
  template: `
    <div class="hv-page-wide">
      <hv-page-header titleKey="admin.nav.dashboard" subtitleKey="admin.dashboard.subtitle" />
      @if (loading()) {
        <hv-skeleton [lines]="5" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <hv-stat-card labelKey="admin.metrics.farmers" [value]="metrics()?.farmers ?? '—'" />
          <hv-stat-card labelKey="admin.metrics.farms" [value]="metrics()?.farms ?? '—'" />
          <hv-stat-card labelKey="admin.metrics.plans" [value]="metrics()?.plans ?? '—'" />
          <hv-stat-card labelKey="admin.metrics.threads" [value]="metrics()?.activeThreads ?? '—'" />
        </div>
        <hv-card class="mt-4">
          <p class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
            {{ 'admin.dashboard.opsEyebrow' | translate }}
          </p>
          <p class="mt-1 font-display text-lg font-semibold">
            {{ 'admin.dashboard.opsTitle' | translate }}
          </p>
          <p class="mt-2 max-w-2xl text-sm text-muted">
            {{ 'admin.dashboard.opsBody' | translate }}
          </p>
        </hv-card>
      }
    </div>
  `,
})
export class AdminDashboardPage implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly metrics = signal<Metrics | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.metrics.set((await firstValueFrom(this.api.metrics())) as Metrics);
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to load metrics');
    } finally {
      this.loading.set(false);
    }
  }
}
