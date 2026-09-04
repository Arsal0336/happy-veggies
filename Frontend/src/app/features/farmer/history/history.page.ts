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
import { HvBadge } from '../../../shared/ui/hv-badge';
import { CropCycleApiService } from '../../../core/api/crop-cycle.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-history-page',
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
    HvBadge,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="history.title">
        <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
      </hv-page-header>

      <p class="mb-4 text-sm text-muted">{{ 'history.hint' | translate }}</p>

      @if (loading()) {
        <hv-skeleton [lines]="5" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!cycles().length) {
        <hv-empty-state titleKey="history.empty" descriptionKey="history.emptyHint" />
      } @else {
        <ul class="m-0 flex list-none flex-col gap-3 p-0">
          @for (c of cycles(); track c.id) {
            <li>
              <hv-card>
                <div class="mb-2 flex flex-wrap items-center gap-2">
                  <strong>{{ c.zoneLabel || c.cropZoneId }}</strong>
                  @if (c.isExperimental) {
                    <hv-badge tone="info">{{ 'history.experimental' | translate }}</hv-badge>
                  }
                </div>
                <p class="text-sm text-muted">{{ c.season || '—' }}</p>
                <p class="text-sm">
                  {{ 'history.predicted' | translate }}:
                  {{
                    c.predictedYield != null
                      ? c.predictedYield + ' ' + (c.predictedYieldUnit || '')
                      : '—'
                  }}
                </p>
                <p class="text-sm">
                  {{ 'history.actual' | translate }}:
                  {{
                    c.actualYield != null
                      ? c.actualYield + ' ' + (c.actualYieldUnit || '')
                      : '—'
                  }}
                </p>
                <p class="text-sm">
                  {{ 'history.delta' | translate }}:
                  {{
                    c.delta != null ? (c.delta > 0 ? '+' : '') + c.delta : '—'
                  }}
                </p>
                @if (c.notes) {
                  <p class="mt-1 text-sm text-muted">{{ c.notes }}</p>
                }

                @if (editingId() === c.id) {
                  <form class="mt-3 space-y-3" (submit)="$event.preventDefault(); save(c)">
                    <hv-input labelKey="history.actual" type="number" [(value)]="actualYield" />
                    <hv-textarea labelKey="experimental.notes" [rows]="2" [(value)]="notes" />
                    <div class="flex flex-wrap gap-2">
                      <hv-button type="submit" labelKey="common.save" [loading]="saving()" />
                      <hv-button
                        variant="ghost"
                        labelKey="common.cancel"
                        (pressed)="editingId.set(null)"
                      />
                    </div>
                  </form>
                } @else {
                  <div class="mt-3">
                    <hv-button
                      variant="secondary"
                      labelKey="history.recordActuals"
                      (pressed)="startEdit(c)"
                    />
                  </div>
                }
              </hv-card>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class HistoryPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(CropCycleApiService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly cycles = signal<any[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly editingId = signal<string | null>(null);
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

  startEdit(c: any): void {
    this.editingId.set(c.id);
    this.actualYield.set(c.actualYield != null ? String(c.actualYield) : '');
    this.notes.set(c.notes || '');
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.cycles.set(((await firstValueFrom(this.api.list(this.farmId))) as any[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async save(c: any): Promise<void> {
    this.saving.set(true);
    try {
      const val = this.actualYield().trim() ? Number(this.actualYield()) : undefined;
      await firstValueFrom(
        this.api.recordActuals(this.farmId, c.id, {
          actualYield: Number.isFinite(val) ? val : undefined,
          actualYieldUnit: c.predictedYieldUnit ?? 'kg',
          notes: this.notes().trim() || undefined,
          endedAt: new Date().toISOString(),
        }),
      );
      this.toast.success(this.t.instant('history.saved'));
      this.editingId.set(null);
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.saving.set(false);
    }
  }
}
