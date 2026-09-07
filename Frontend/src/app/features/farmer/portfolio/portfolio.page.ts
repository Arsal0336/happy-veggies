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
import { PortfolioApiService } from '../../../core/api/portfolio.service';

@Component({
  selector: 'app-portfolio-page',
  imports: [
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
    HvButton,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="portfolio.title">
        <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!isOk()) {
        <hv-empty-state
          titleKey="portfolio.blocked"
          [descriptionKey]="data()?.reason ? null : 'portfolio.reason'"
        >
          @if (data()?.reason) {
            <p class="text-sm text-muted">{{ data()?.reason }}</p>
          }
        </hv-empty-state>
      } @else {
        <p class="mb-4 text-sm text-muted">
          {{ 'portfolio.method' | translate }}: {{ data()?.method }} · {{ data()?.engine }} ·
          {{ data()?.totalAreaAcres }} {{ 'portfolio.acres' | translate }}
        </p>

        <ul class="m-0 flex list-none flex-col gap-3 p-0">
          @for (row of allocations(); track row.cropId) {
            <li>
              <hv-card>
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p class="font-semibold">{{ row.cropName || row.cropId }}</p>
                    @if (row.areaType) {
                      <p class="text-xs text-muted">{{ row.areaType }}</p>
                    }
                  </div>
                  <p class="text-sm">
                    {{ weightPct(row.weight) }}% · {{ row.allocatedAcres }}
                    {{ 'portfolio.acres' | translate }}
                  </p>
                </div>
              </hv-card>
            </li>
          }
        </ul>

        @if (data()?.disclaimer) {
          <p class="mt-4 text-xs text-muted">{{ data()?.disclaimer }}</p>
        }
      }
    </div>
  `,
})
export class PortfolioPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(PortfolioApiService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly data = signal<any>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  allocations(): any[] {
    return this.data()?.allocations ?? [];
  }

  isOk(): boolean {
    const d = this.data();
    return d?.status === 'ok' && (d?.allocations?.length ?? 0) > 0;
  }

  weightPct(weight: number | null | undefined): string {
    if (weight == null || Number.isNaN(Number(weight))) return '0.0';
    return (Number(weight) * 100).toFixed(1);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.data.set(await firstValueFrom(this.api.getPortfolio(this.farmId)));
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }
}
