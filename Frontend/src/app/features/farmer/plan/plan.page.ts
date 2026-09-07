import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvAlert } from '../../../shared/ui/hv-alert';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { PlanSections } from '../../../shared/ui/plan-sections';
import { PlanApiService } from '../../../core/api/plan.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { FarmerAuthStore } from '../../../core/auth/farmer-auth.store';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-plan-page',
  imports: [
    DatePipe,
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
    HvButton,
    HvAlert,
    HvBadge,
    PlanSections,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="plan.title">
        <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton [lines]="6" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        @if (planLangMismatch()) {
          <hv-alert tone="info" titleKey="plan.languageMismatchTitle" class="mb-4">
            <p class="mt-1">
              {{
                'plan.languageMismatchBody'
                  | translate: { planLang: plan()?.language, farmerLang: farmerLang() }
              }}
            </p>
            <div class="mt-2">
              <hv-button
                labelKey="plan.regenerateInLanguage"
                [loading]="generating()"
                (pressed)="generate(farmerLang())"
              />
            </div>
          </hv-alert>
        }

        @if (generating()) {
          <p class="mb-3 text-sm text-muted">{{ 'plan.generating' | translate }}</p>
        }

        @if (!plan()) {
          <hv-empty-state titleKey="plan.empty" descriptionKey="plan.emptyHint">
            <hv-button
              labelKey="plan.generate"
              [loading]="generating()"
              (pressed)="generate()"
            />
          </hv-empty-state>
        } @else {
          <hv-card>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <span>
                  {{ 'plan.version' | translate: { version: plan()?.version } }}
                  <span class="text-sm text-muted"> · {{ plan()?.language }}</span>
                </span>
                @if (isLatest()) {
                  <hv-badge tone="success">{{ 'plan.latest' | translate }}</hv-badge>
                } @else {
                  <hv-badge tone="neutral">
                    {{ 'plan.viewingVersion' | translate: { version: plan()?.version } }}
                  </hv-badge>
                }
              </div>
              <div class="flex flex-wrap gap-2">
                @if (!isLatest()) {
                  <hv-button
                    variant="ghost"
                    labelKey="plan.latest"
                    (pressed)="viewLatest()"
                  />
                }
                <hv-button
                  variant="secondary"
                  labelKey="plan.regenerate"
                  [loading]="generating()"
                  (pressed)="generate()"
                />
              </div>
            </div>
          </hv-card>
          <div class="mt-4">
            <hv-plan-sections [plan]="plan()" />
          </div>
          @if (planDisclaimer(); as d) {
            <p class="mt-3 text-sm text-muted">{{ d }}</p>
          }
        }

        @if (history().length > 1) {
          <section class="mt-5">
            <h2 class="mb-2 font-semibold">{{ 'plan.history' | translate }}</h2>
            <ul class="m-0 flex list-none flex-col gap-2 p-0">
              @for (h of history(); track h.id) {
                <li>
                  <hv-card>
                    <div class="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div class="flex flex-wrap items-center gap-2">
                        <span>
                          {{ 'plan.version' | translate: { version: h.version } }}
                          <span class="text-muted"> · {{ h.language }}</span>
                        </span>
                        @if (h.id === latestId()) {
                          <hv-badge tone="success">{{ 'plan.latest' | translate }}</hv-badge>
                        }
                        @if (h.id === plan()?.id) {
                          <hv-badge tone="info">{{ 'plan.viewingVersion' | translate: { version: h.version } }}</hv-badge>
                        }
                      </div>
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="text-muted">{{ h.createdAt | date: 'medium' }}</span>
                        @if (h.id !== plan()?.id) {
                          <hv-button
                            variant="secondary"
                            labelKey="plan.viewVersion"
                            (pressed)="viewRevision(h)"
                          />
                        }
                      </div>
                    </div>
                  </hv-card>
                </li>
              }
            </ul>
          </section>
        }
      }
    </div>
  `,
})
export class PlanPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly plans = inject(PlanApiService);
  private readonly language = inject(LanguageService);
  private readonly auth = inject(FarmerAuthStore);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly plan = signal<any>(null);
  readonly history = signal<any[]>([]);
  readonly loading = signal(true);
  readonly generating = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  farmerLang(): string {
    const fromProfile = this.auth.profile()?.language;
    if (fromProfile === 'ur' || fromProfile === 'en') return fromProfile;
    return this.language.current();
  }

  planLangMismatch(): boolean {
    const plan = this.plan();
    if (!plan) return false;
    return String(plan.language).toLowerCase() !== String(this.farmerLang()).toLowerCase();
  }

  latestId(): string | null {
    return this.history()[0]?.id ?? null;
  }

  isLatest(): boolean {
    const current = this.plan()?.id;
    const latest = this.latestId();
    return !!current && current === latest;
  }

  planDisclaimer(): string | null {
    const p = this.plan();
    if (!p) return null;
    if (typeof p.disclaimer === 'string' && p.disclaimer.trim()) return p.disclaimer;
    try {
      const raw = typeof p.contentJson === 'string' ? JSON.parse(p.contentJson) : p.contentJson;
      const d = raw?.disclaimer;
      return typeof d === 'string' ? d : null;
    } catch {
      return null;
    }
  }

  viewRevision(item: any): void {
    this.plan.set(item);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  viewLatest(): void {
    const latest = this.history()[0];
    if (latest) this.plan.set(latest);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const raw = await firstValueFrom(this.plans.listPlans(this.farmId));
      const history = this.normalizeHistory(raw);
      this.history.set(history);
      const selectedId = this.plan()?.id;
      const keep =
        selectedId && history.find((h) => h.id === selectedId)
          ? history.find((h) => h.id === selectedId)
          : history[0] || null;
      this.plan.set(keep);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async generate(language?: string): Promise<void> {
    this.generating.set(true);
    try {
      await firstValueFrom(this.plans.generatePlan(this.farmId, language || this.farmerLang()));
      this.toast.success(this.t.instant('plan.generate'));
      this.plan.set(null); // jump to newest after regenerate
      await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.generating.set(false);
    }
  }

  private normalizeHistory(raw: unknown): any[] {
    const list = Array.isArray(raw) ? raw : [];
    return list
      .map((item) => {
        const p = (item ?? {}) as Record<string, unknown>;
        return {
          id: String(p['id'] ?? p['Id'] ?? ''),
          farmId: p['farmId'] ?? p['FarmId'],
          version: Number(p['version'] ?? p['Version'] ?? 0),
          language: String(p['language'] ?? p['Language'] ?? 'en'),
          contentJson: p['contentJson'] ?? p['ContentJson'] ?? '',
          contextUsedJson: p['contextUsedJson'] ?? p['ContextUsedJson'] ?? null,
          createdAt: p['createdAt'] ?? p['CreatedAt'],
          disclaimer: p['disclaimer'],
        };
      })
      .filter((p) => !!p.id)
      .sort((a, b) => b.version - a.version);
  }
}
