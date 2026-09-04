import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvInput } from '../../../shared/ui/hv-input';
import { HvSelect } from '../../../shared/ui/hv-select';
import { HvAlert } from '../../../shared/ui/hv-alert';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { ToastService } from '../../../shared/ui/toast.service';
import { AdminApiService } from '../../../core/api/admin.service';

type CompatPair = {
  id: string;
  cropAId?: string;
  cropBId?: string;
  cropA?: string;
  cropB?: string;
  relation?: string | number;
  reason?: string;
  enabled?: boolean;
};

const RELATION_TO_BE: Record<string, number> = {
  good: 0,
  avoid: 1,
  neutral: 2,
};

@Component({
  selector: 'app-admin-compatibility-page',
  imports: [
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
    HvButton,
    HvInput,
    HvSelect,
    HvAlert,
    HvBadge,
  ],
  template: `
    <div class="hv-page-wide space-y-4">
      <hv-page-header titleKey="admin.nav.compatibility" subtitleKey="admin.catalog.compatSubtitle" />

      <hv-card>
        <h2 class="mb-3 font-semibold">{{ 'admin.catalog.upsertPair' | translate }}</h2>
        <form class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" (submit)="$event.preventDefault(); upsert()">
          <hv-input labelKey="admin.catalog.cropA" [(value)]="cropAId" />
          <hv-input labelKey="admin.catalog.cropB" [(value)]="cropBId" />
          <hv-select
            labelKey="admin.catalog.relation"
            [options]="relationOptions"
            [(value)]="relation"
          />
          <hv-input labelKey="admin.catalog.reason" [(value)]="reason" />
          <div class="flex items-end">
            <hv-button type="submit" labelKey="admin.catalog.savePair" [loading]="saving()" />
          </div>
        </form>
        @if (formError()) {
          <hv-alert class="mt-3" tone="error">{{ formError() }}</hv-alert>
        }
        @if (formOk()) {
          <hv-alert class="mt-3" tone="success">{{ formOk() }}</hv-alert>
        }
      </hv-card>

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!pairs().length) {
        <hv-empty-state titleKey="admin.catalog.empty" descriptionKey="admin.catalog.compatEmptyHint" />
      } @else {
        <div class="space-y-2">
          @for (pair of pairs(); track pair.id) {
            <hv-card>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <strong>{{ cropA(pair) }} ↔ {{ cropB(pair) }}</strong>
                    <hv-badge [tone]="relationTone(pair.relation)">{{ relationLabel(pair.relation) }}</hv-badge>
                    <hv-badge [tone]="pair.enabled === false ? 'neutral' : 'success'">
                      {{ (pair.enabled === false ? 'admin.catalog.disabled' : 'admin.catalog.enabled') | translate }}
                    </hv-badge>
                  </div>
                  @if (pair.reason) {
                    <p class="mt-1 text-xs text-muted">{{ pair.reason }}</p>
                  }
                </div>
                <hv-button
                  variant="secondary"
                  [labelKey]="pair.enabled === false ? 'admin.catalog.enable' : 'admin.catalog.disable'"
                  [loading]="togglingId() === pair.id"
                  (pressed)="toggle(pair)"
                />
              </div>
            </hv-card>
          }
        </div>
      }
    </div>
  `,
})
export class AdminCompatibilityPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslateService);

  readonly pairs = signal<CompatPair[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly formOk = signal<string | null>(null);
  readonly togglingId = signal<string | null>(null);

  readonly cropAId = signal('');
  readonly cropBId = signal('');
  readonly relation = signal('good');
  readonly reason = signal('');

  readonly relationOptions = [
    { value: 'good', labelKey: 'admin.catalog.relationGood' },
    { value: 'avoid', labelKey: 'admin.catalog.relationAvoid' },
    { value: 'neutral', labelKey: 'admin.catalog.relationNeutral' },
  ];

  ngOnInit(): void {
    void this.load();
  }

  cropA(pair: CompatPair): string {
    return pair.cropA || pair.cropAId || '—';
  }

  cropB(pair: CompatPair): string {
    return pair.cropB || pair.cropBId || '—';
  }

  relationLabel(value: string | number | undefined): string {
    if (typeof value === 'number') {
      return ({ 0: 'good', 1: 'avoid', 2: 'neutral' } as Record<number, string>)[value] ?? String(value);
    }
    return String(value || 'neutral');
  }

  relationTone(value: string | number | undefined): 'success' | 'error' | 'neutral' {
    const label = this.relationLabel(value);
    if (label === 'good') return 'success';
    if (label === 'avoid') return 'error';
    return 'neutral';
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.pairs.set(((await firstValueFrom(this.api.listCompatibility())) as CompatPair[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Request failed');
    } finally {
      this.loading.set(false);
    }
  }

  async upsert(): Promise<void> {
    this.formError.set(null);
    this.formOk.set(null);
    const a = this.cropAId().trim();
    const b = this.cropBId().trim();
    if (!a || !b) {
      this.formError.set(this.i18n.instant('admin.catalog.compatRequired'));
      return;
    }
    this.saving.set(true);
    try {
      const rel = this.relation();
      await firstValueFrom(
        this.api.upsertCompatibility({
          cropAId: a,
          cropBId: b,
          relation: RELATION_TO_BE[rel] ?? 0,
          reason: this.reason().trim() || undefined,
          enabled: true,
        }),
      );
      this.formOk.set(this.i18n.instant('admin.catalog.compatSaved'));
      this.toast.show(this.i18n.instant('admin.catalog.compatSaved'), 'success');
      this.cropAId.set('');
      this.cropBId.set('');
      this.reason.set('');
      await this.load();
    } catch {
      this.formError.set(this.i18n.instant('admin.catalog.createFailed'));
    } finally {
      this.saving.set(false);
    }
  }

  async toggle(pair: CompatPair): Promise<void> {
    const disable = pair.enabled !== false;
    const ok = window.confirm(
      this.i18n.instant(disable ? 'admin.catalog.confirmDisablePair' : 'admin.catalog.confirmEnablePair', {
        a: this.cropA(pair),
        b: this.cropB(pair),
      }),
    );
    if (!ok) return;
    this.togglingId.set(pair.id);
    try {
      await firstValueFrom(
        this.api.upsertCompatibility({
          id: pair.id,
          cropAId: this.cropA(pair),
          cropBId: this.cropB(pair),
          relation:
            typeof pair.relation === 'number'
              ? pair.relation
              : RELATION_TO_BE[this.relationLabel(pair.relation)] ?? 2,
          reason: pair.reason,
          enabled: !disable,
        }),
      );
      await this.load();
    } catch {
      this.toast.show(this.i18n.instant('admin.catalog.updateFailed'), 'error');
    } finally {
      this.togglingId.set(null);
    }
  }
}
