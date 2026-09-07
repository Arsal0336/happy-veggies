import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { GreenScoreMeter } from '../../../shared/ui/green-score-meter';
import { GreenApiService } from '../../../core/api/green.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-green-page',
  imports: [
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvCard,
    HvButton,
    HvBadge,
    GreenScoreMeter,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="green.title">
        <div class="flex flex-wrap gap-2">
          <hv-button
            variant="secondary"
            labelKey="green.recalculate"
            [loading]="recalculating()"
            (pressed)="recalculate()"
          />
          <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
        </div>
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton [lines]="6" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        <hv-green-score-meter [score]="overallScore()" [max]="maxScore()" />

        @if (factors().length) {
          <h2 class="mb-2 mt-5 font-semibold">{{ 'green.dimensions' | translate }}</h2>
          <ul class="m-0 flex list-none flex-col gap-3 p-0">
            @for (f of factors(); track f.key || f.label) {
              <li>
                <hv-card>
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p class="font-semibold">{{ factorTitle(f) }}</p>
                      <p class="text-sm text-muted">
                        {{ f.available ? f.points ?? f.score ?? '—' : '—' }}
                        @if (f.maxPoints != null) {
                          / {{ f.maxPoints }}
                        }
                        @if (f.explanation) {
                          · {{ f.explanation }}
                        }
                      </p>
                      @if (!f.available && f.unavailableReason) {
                        <p class="mt-1 text-xs text-muted">
                          {{ 'green.unavailable' | translate }}: {{ f.unavailableReason }}
                        </p>
                      }
                    </div>
                    @if (f.dataQuality) {
                      <hv-badge [tone]="qualityTone(f.dataQuality)">
                        {{ qualityLabel(f.dataQuality) }}
                      </hv-badge>
                    }
                  </div>
                </hv-card>
              </li>
            }
          </ul>
        }

        @if (explanations().length) {
          <ul class="mt-4 space-y-1 text-sm text-muted">
            @for (e of explanations(); track $index) {
              <li>{{ e }}</li>
            }
          </ul>
        }

        <hv-card class="mt-5">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold">{{ 'green.tips' | translate }}</h2>
            <hv-button
              variant="secondary"
              labelKey="green.loadTips"
              [loading]="tipsLoading()"
              (pressed)="loadTips()"
            />
          </div>
          @if (tips()) {
            <p class="whitespace-pre-wrap text-sm">{{ tips() }}</p>
          } @else {
            <p class="text-sm text-muted">{{ 'green.tipsHint' | translate }}</p>
          }
        </hv-card>

        <p class="mt-4 text-xs text-muted">{{ score()?.weightsNote || ('green.weightsTbd' | translate) }}</p>
        <p class="text-xs text-muted">
          {{ score()?.nonCertificationDisclaimer || ('green.disclaimer' | translate) }}
        </p>
      }
    </div>
  `,
})
export class GreenPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(GreenApiService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly score = signal<any>(null);
  readonly tips = signal<string | null>(null);
  readonly loading = signal(true);
  readonly recalculating = signal(false);
  readonly tipsLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  overallScore(): number | null {
    const s = this.score();
    if (!s) return null;
    return s.overallScore ?? s.score ?? null;
  }

  maxScore(): number {
    return this.score()?.maxScore ?? 100;
  }

  factors(): any[] {
    const s = this.score();
    if (!s) return [];
    if (Array.isArray(s.factors)) return s.factors;
    if (s.dimensions && typeof s.dimensions === 'object') {
      return Object.entries(s.dimensions).map(([key, dim]: [string, any]) => ({
        key,
        label: key.replace(/_/g, ' '),
        available: dim?.available ?? true,
        points: dim?.score,
        explanation: dim?.explanation,
        dataQuality: s.measuredVsEstimated?.[key],
      }));
    }
    return [];
  }

  explanations(): string[] {
    const s = this.score();
    return Array.isArray(s?.explanations) ? s.explanations : [];
  }

  factorTitle(f: any): string {
    return f.label || (f.key ? String(f.key).replace(/_/g, ' ') : 'Factor');
  }

  qualityTone(q: string): 'success' | 'warning' | 'neutral' | 'info' {
    const v = q.toLowerCase();
    if (v === 'measured') return 'success';
    if (v === 'estimated') return 'warning';
    return 'neutral';
  }

  qualityLabel(q: string): string {
    const v = q.toLowerCase();
    if (v === 'measured') return this.t.instant('green.measured');
    if (v === 'estimated') return this.t.instant('green.estimated');
    if (v === 'unavailable') return this.t.instant('green.unavailable');
    return q;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.score.set(await firstValueFrom(this.api.getGreenScore(this.farmId)));
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async recalculate(): Promise<void> {
    this.recalculating.set(true);
    try {
      this.score.set(await firstValueFrom(this.api.refreshGreenScore(this.farmId)));
      this.toast.success(this.t.instant('green.recalculate'));
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.recalculating.set(false);
    }
  }

  async loadTips(): Promise<void> {
    this.tipsLoading.set(true);
    try {
      const result: any = await firstValueFrom(this.api.getGreenTips(this.farmId));
      this.tips.set(result?.tips || result?.Tips || null);
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.tipsLoading.set(false);
    }
  }
}
