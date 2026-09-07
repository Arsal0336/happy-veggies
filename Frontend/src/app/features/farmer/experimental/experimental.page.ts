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
import { HvInput } from '../../../shared/ui/hv-input';
import { HvTextarea } from '../../../shared/ui/hv-textarea';
import { ExperimentalApiService } from '../../../core/api/experimental.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-experimental-page',
  imports: [
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
    HvButton,
    HvInput,
    HvTextarea,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="experimental.title">
        <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton [lines]="6" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        <section class="mb-6">
          <h2 class="mb-3 font-semibold">{{ 'experimental.opportunity' | translate }}</h2>
          @if (!opportunities().length) {
            <hv-empty-state
              titleKey="experimental.empty"
              descriptionKey="experimental.emptyOpportunityHint"
            />
          } @else {
            <ul class="m-0 flex list-none flex-col gap-3 p-0">
              @for (opp of opportunities(); track opp.id) {
                <li>
                  <hv-card>
                    <p class="font-semibold">{{ opp.cropName || opp.cropId || opp.label }}</p>
                    <p class="text-sm">{{ opp.hypothesis }}</p>
                    @if (opp.riskNote) {
                      <p class="mt-1 text-sm text-muted">{{ opp.riskNote }}</p>
                    }
                    <div class="mt-3">
                      <hv-button
                        labelKey="experimental.create"
                        [loading]="startingId() === opp.id"
                        (pressed)="start(opp.id)"
                      />
                    </div>
                  </hv-card>
                </li>
              }
            </ul>
          }
        </section>

        <section>
          <h2 class="mb-3 font-semibold">{{ 'experimental.track' | translate }}</h2>
          @if (!experiments().length) {
            <hv-empty-state titleKey="experimental.empty" />
          } @else {
            <ul class="m-0 flex list-none flex-col gap-3 p-0">
              @for (exp of experiments(); track exp.id) {
                <li>
                  <hv-card>
                    <p class="font-semibold">{{ exp.cropName || exp.cropId || exp.label }}</p>
                    <p class="text-sm">
                      {{ 'experimental.status' | translate }}: {{ statusLabel(exp.status) }}
                    </p>
                    <p class="text-sm text-muted">
                      {{ 'experimental.hypothesis' | translate }}: {{ exp.hypothesis }}
                    </p>

                    @if (outcomeZoneId() === exp.id) {
                      <form class="mt-3 space-y-3" (submit)="$event.preventDefault(); saveOutcome(exp.id)">
                        <hv-input
                          labelKey="experimental.actualYield"
                          type="number"
                          [(value)]="actualYield"
                        />
                        <hv-textarea labelKey="experimental.notes" [rows]="2" [(value)]="notes" />
                        <div class="flex flex-wrap gap-2">
                          <hv-button
                            type="submit"
                            labelKey="experimental.saveOutcome"
                            [loading]="savingOutcome()"
                          />
                          <hv-button
                            variant="ghost"
                            labelKey="common.cancel"
                            (pressed)="outcomeZoneId.set(null)"
                          />
                        </div>
                      </form>
                    } @else {
                      <div class="mt-3">
                        <hv-button
                          variant="secondary"
                          labelKey="experimental.recordOutcome"
                          (pressed)="openOutcome(exp.id)"
                        />
                      </div>
                    }
                  </hv-card>
                </li>
              }
            </ul>
          }
        </section>
      }
    </div>
  `,
})
export class ExperimentalPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ExperimentalApiService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly opportunities = signal<any[]>([]);
  readonly experiments = signal<any[]>([]);
  readonly loading = signal(true);
  readonly startingId = signal<string | null>(null);
  readonly outcomeZoneId = signal<string | null>(null);
  readonly savingOutcome = signal(false);
  readonly actualYield = signal('');
  readonly notes = signal('');
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  openOutcome(zoneId: string): void {
    this.outcomeZoneId.set(zoneId);
    this.actualYield.set('');
    this.notes.set('');
  }

  statusLabel(status: string): string {
    if (status === 'approved') return this.t.instant('experimental.statusApproved');
    if (status === 'active') return this.t.instant('experimental.statusActive');
    return status;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data: any = await firstValueFrom(this.api.getStatus(this.farmId));
      const zones = (data?.experimentalZones ?? []) as any[];

      // Approve API expects zone IDs — never production-area IDs.
      const mapped = zones.map((z: any) => ({
        id: z.id,
        label: z.label,
        cropId: z.cropId,
        cropName: z.cropFreetext ?? z.cropId ?? z.label,
        hypothesis: z.label ?? z.cropFreetext ?? this.t.instant('experimental.defaultHypothesis'),
        riskNote: this.t.instant('experimental.riskNote'),
        status: z.growthStage === 'approved_experimental' ? 'approved' : 'active',
      }));

      this.opportunities.set(mapped.filter((z) => z.status !== 'approved'));
      this.experiments.set(mapped);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async start(zoneId: string): Promise<void> {
    this.startingId.set(zoneId);
    try {
      await firstValueFrom(this.api.approveZone(this.farmId, zoneId));
      this.toast.success(this.t.instant('experimental.create'));
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.startingId.set(null);
    }
  }

  async saveOutcome(zoneId: string): Promise<void> {
    this.savingOutcome.set(true);
    try {
      const yieldVal = this.actualYield().trim() ? Number(this.actualYield()) : undefined;
      await firstValueFrom(
        this.api.recordOutcome(this.farmId, zoneId, {
          actualYield: Number.isFinite(yieldVal) ? yieldVal : undefined,
          actualYieldUnit: 'kg',
          notes: this.notes().trim() || undefined,
          endedAt: new Date().toISOString(),
        }),
      );
      this.toast.success(this.t.instant('experimental.outcomeSaved'));
      this.outcomeZoneId.set(null);
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.savingOutcome.set(false);
    }
  }
}
