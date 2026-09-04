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
          <ul class="m-0 flex list-none flex-col gap-3 p-0">
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
                    {{ s.ratePerUnit ?? '—' }} {{ s.currency || 'PKR' }}/{{ s.yieldUnit || 'unit' }}
                    @if (s.period) {
                      ({{ s.period }})
                    }
                  </p>
                  <p class="text-sm">
                    {{ 'economics.gross' | translate }}:
                    {{ s.referenceGrossValue ?? '—' }} {{ s.currency || 'PKR' }}
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
    return `${s.cropId || s.cropName || 'crop'}-${s.period || ''}`;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data: any = await firstValueFrom(this.api.getFarmEconomics(this.farmId));
      this.snapshots.set(data?.snapshots || (Array.isArray(data) ? data : []) || []);
      this.disclaimer.set(data?.disclaimer || null);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }
}
