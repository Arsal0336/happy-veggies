import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { ToastService } from '../../../shared/ui/toast.service';
import { AdminApiService } from '../../../core/api/admin.service';

type PlanSection = { id: string; title: string; body: string };

type PlanItem = {
  id: string;
  farmId: string;
  farmerId: string;
  farmerName?: string;
  version?: number;
  language?: string;
  createdAt?: string;
  isFlagged?: boolean;
  flagged?: boolean;
  reviewStatus?: string;
  reviewNote?: string | null;
  contentJson?: string | null;
  title?: string;
  sections?: PlanSection[];
};

@Component({
  selector: 'app-admin-plans-review-page',
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
    <div class="hv-page-wide space-y-4">
      <hv-page-header titleKey="admin.nav.planReview" subtitleKey="admin.plans.subtitle" />

      @if (loading()) {
        <hv-skeleton [lines]="8" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        <div class="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
          <hv-card>
            <div class="mb-3 flex items-center justify-between gap-2">
              <h2 class="m-0 font-display text-lg font-semibold">{{ 'admin.plans.listTitle' | translate }}</h2>
              <hv-button
                variant="secondary"
                [labelKey]="flaggedOnly() ? 'admin.plans.flaggedOnly' : 'admin.plans.allPlans'"
                (pressed)="toggleFilter()"
              />
            </div>
            @if (!plans().length) {
              <hv-empty-state
                [titleKey]="flaggedOnly() ? 'admin.plans.emptyFlagged' : 'admin.plans.empty'"
                descriptionKey="admin.plans.emptyHint"
              />
            } @else {
              <ul class="m-0 flex list-none flex-col gap-1 p-0">
                @for (plan of plans(); track plan.id) {
                  <li>
                    <button
                      type="button"
                      class="w-full rounded-hv border px-3 py-2.5 text-start transition"
                      [class]="
                        selected()?.id === plan.id
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-transparent hover:border-[var(--hv-color-border)] hover:bg-surface'
                      "
                      (click)="selectedId.set(plan.id)"
                    >
                      <div class="flex items-center gap-2">
                        <strong class="text-sm">{{ planTitle(plan) }}</strong>
                        @if (isFlagged(plan)) {
                          <hv-badge tone="warning">{{ 'admin.plans.flagged' | translate }}</hv-badge>
                        }
                      </div>
                      <span class="mt-0.5 block text-xs text-muted">
                        {{ plan.farmerName || plan.farmerId }}
                        @if (plan.reviewStatus && plan.reviewStatus !== 'none') {
                          · {{ plan.reviewStatus }}
                        }
                      </span>
                    </button>
                  </li>
                }
              </ul>
            }
          </hv-card>

          <div class="min-w-0">
            @if (actionError()) {
              <p class="mb-3 text-sm text-[var(--hv-color-error)]">{{ actionError() }}</p>
            }
            @if (selected(); as plan) {
              <hv-card>
                <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 class="m-0 font-display text-lg font-semibold">{{ planTitle(plan) }}</h2>
                    <p class="mt-1 text-sm text-muted">
                      {{ 'admin.plans.farm' | translate }} {{ plan.farmId }} ·
                      {{ 'admin.plans.farmer' | translate }} {{ plan.farmerId }}
                      @if (plan.reviewStatus) {
                        · {{ plan.reviewStatus }}
                      }
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <hv-button
                      variant="secondary"
                      labelKey="admin.plans.flag"
                      [disabled]="reviewing()"
                      (pressed)="review('flag')"
                    />
                    <hv-button
                      labelKey="admin.plans.approve"
                      [disabled]="reviewing()"
                      [loading]="reviewing()"
                      (pressed)="review('approve')"
                    />
                    <hv-button
                      variant="ghost"
                      labelKey="admin.plans.dismiss"
                      [disabled]="reviewing()"
                      (pressed)="review('dismiss')"
                    />
                  </div>
                </div>
                <div class="space-y-3">
                  @for (section of sectionsFor(plan); track section.id) {
                    <div class="rounded-hv border border-[var(--hv-color-border)] p-3">
                      <h3 class="mb-1 font-semibold">{{ section.title }}</h3>
                      <p class="whitespace-pre-wrap text-sm">{{ section.body }}</p>
                    </div>
                  }
                </div>
              </hv-card>
            } @else {
              <hv-card>
                <p class="m-0 text-sm text-muted">{{ 'admin.plans.noneSelected' | translate }}</p>
              </hv-card>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminPlansReviewPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslateService);

  readonly plans = signal<PlanItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly flaggedOnly = signal(false);
  readonly selectedId = signal<string | null>(null);
  readonly reviewing = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly selected = computed(() => {
    const list = this.plans();
    const id = this.selectedId() ?? list[0]?.id;
    return list.find((p) => p.id === id) ?? list[0] ?? null;
  });

  ngOnInit(): void {
    void this.load();
  }

  toggleFilter(): void {
    this.flaggedOnly.update((v) => !v);
    this.selectedId.set(null);
    void this.load();
  }

  planTitle(plan: PlanItem): string {
    return plan.title || `Plan v${plan.version ?? '?'}`;
  }

  isFlagged(plan: PlanItem): boolean {
    return !!(plan.flagged ?? plan.isFlagged);
  }

  sectionsFor(plan: PlanItem): PlanSection[] {
    if (plan.sections?.length) return plan.sections;
    const parsed = this.parseSections(plan.contentJson);
    if (parsed.length) return parsed;
    return [
      {
        id: 'meta',
        title: this.i18n.instant('admin.plans.metadata'),
        body: `Farm ${plan.farmId} · Farmer ${plan.farmerId} · v${plan.version ?? '?'}`,
      },
    ];
  }

  private parseSections(contentJson?: string | null): PlanSection[] {
    if (!contentJson) return [];
    try {
      const parsed = JSON.parse(contentJson) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item, i) => {
          const s = (item ?? {}) as Record<string, unknown>;
          return {
            id: String(s['key'] ?? s['id'] ?? `section-${i}`),
            title: String(s['title'] ?? `Section ${i + 1}`),
            body: String(s['body'] ?? s['content'] ?? s['text'] ?? ''),
          };
        });
      }
      if (parsed && typeof parsed === 'object') {
        const obj = parsed as Record<string, unknown>;
        if (Array.isArray(obj['sections'])) {
          return this.parseSections(JSON.stringify(obj['sections']));
        }
        if (Array.isArray(obj['planSections'])) {
          return (obj['planSections'] as Array<Record<string, unknown>>).map((s, i) => ({
            id: String(s['sectionId'] ?? s['key'] ?? `section-${i}`),
            title: String(s['title'] ?? `Section ${i + 1}`),
            body: String(s['content'] ?? s['body'] ?? ''),
          }));
        }
      }
    } catch {
      /* fall through */
    }
    return [{ id: 'content', title: 'Plan', body: contentJson }];
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const rows = await firstValueFrom(
        this.api.listPlans(this.flaggedOnly() ? { flagged: true } : undefined),
      );
      this.plans.set((rows as PlanItem[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Request failed');
    } finally {
      this.loading.set(false);
    }
  }

  async review(action: 'flag' | 'approve' | 'dismiss'): Promise<void> {
    const plan = this.selected();
    if (!plan) return;
    this.actionError.set(null);
    const note =
      window.prompt(this.i18n.instant('admin.plans.notePrompt', { action }), '') ?? undefined;
    this.reviewing.set(true);
    try {
      await firstValueFrom(
        this.api.reviewPlan(plan.id, { action, note: note?.trim() || undefined }),
      );
      this.toast.show(this.i18n.instant('admin.plans.reviewSaved', { action }), 'success');
      await this.load();
    } catch {
      this.actionError.set(this.i18n.instant('admin.plans.reviewFailed'));
      this.toast.show(this.i18n.instant('admin.plans.reviewFailed'), 'error');
    } finally {
      this.reviewing.set(false);
    }
  }
}
