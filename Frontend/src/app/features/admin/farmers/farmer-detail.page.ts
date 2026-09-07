import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { AdminApiService } from '../../../core/api/admin.service';

type FarmerFarm = {
  id: string;
  name: string;
  regionLabel?: string;
  areaAcres?: number;
  createdAt?: string;
};

type FarmerPlan = {
  id: string;
  version?: number;
  summary?: string;
  createdAt?: string;
};

type FarmerDetail = {
  farmer?: {
    id: string;
    phone: string;
    name?: string | null;
    language?: string;
  };
  id?: string;
  phone?: string;
  name?: string | null;
  language?: string;
  farms?: FarmerFarm[];
  plans?: FarmerPlan[];
};

@Component({
  selector: 'app-admin-farmer-detail-page',
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
    HvBadge,
  ],
  template: `
    <div class="hv-page-wide space-y-4">
      <a routerLink="/admin/farmers" class="text-sm font-medium text-primary-700 hover:underline">
        ← {{ 'admin.farmers.back' | translate }}
      </a>
      <hv-page-header
        [title]="displayName()"
        subtitleKey="admin.farmers.detailSubtitle"
      />

      @if (loading()) {
        <hv-skeleton [lines]="6" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (detail(); as d) {
        <div class="grid gap-3 sm:grid-cols-3">
          <hv-card>
            <p class="text-xs text-muted">{{ 'admin.farmers.colPhone' | translate }}</p>
            <p class="mt-1 font-mono text-sm">{{ phone() }}</p>
          </hv-card>
          <hv-card>
            <p class="text-xs text-muted">{{ 'admin.farmers.colLanguage' | translate }}</p>
            <p class="mt-1 text-sm font-medium">{{ language() }}</p>
          </hv-card>
          <hv-card>
            <p class="text-xs text-muted">{{ 'admin.metrics.farms' | translate }}</p>
            <p class="mt-1 text-sm font-medium">{{ farms().length }}</p>
          </hv-card>
        </div>

        <hv-card>
          <h2 class="mb-3 font-display text-lg font-semibold">{{ 'admin.farmers.farmsReadonly' | translate }}</h2>
          @if (!farms().length) {
            <p class="text-sm text-muted">{{ 'admin.farmers.noFarms' | translate }}</p>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full min-w-[24rem] text-start text-sm">
                <thead class="border-b border-[var(--hv-color-border)] text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th class="py-2 pe-3 font-semibold">{{ 'admin.farmers.colFarmName' | translate }}</th>
                    <th class="py-2 pe-3 font-semibold">{{ 'farms.region' | translate }}</th>
                    <th class="py-2 font-semibold">{{ 'farms.area' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (farm of farms(); track farm.id) {
                    <tr
                      class="cursor-pointer border-b border-[var(--hv-color-border)] last:border-0 hover:bg-primary-50/60"
                      [routerLink]="['/admin/farmers', farmerId(), 'farms', farm.id]"
                    >
                      <td class="py-2.5 pe-3 font-medium">{{ farm.name }}</td>
                      <td class="py-2.5 pe-3">{{ farm.regionLabel || '—' }}</td>
                      <td class="py-2.5">
                        {{ farm.areaAcres != null ? farm.areaAcres + ' ' + ('portfolio.acres' | translate) : '—' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </hv-card>

        <hv-card>
          <h2 class="mb-3 font-display text-lg font-semibold">{{ 'admin.farmers.plansReadonly' | translate }}</h2>
          @if (!plans().length) {
            <hv-empty-state titleKey="admin.farmers.noPlans" descriptionKey="admin.farmers.noPlansHint" />
          } @else {
            <ul class="m-0 list-none space-y-3 p-0">
              @for (plan of plans(); track plan.id) {
                <li class="border-b border-[var(--hv-color-border)] pb-3 last:border-0">
                  <div class="flex items-center gap-2">
                    <strong>{{ plan.id }}</strong>
                    @if (plan.version != null) {
                      <hv-badge>v{{ plan.version }}</hv-badge>
                    }
                  </div>
                  <p class="mt-1 text-sm text-muted">
                    {{ plan.summary || '—' }}
                    @if (plan.createdAt) {
                      · {{ plan.createdAt | date: 'mediumDate' }}
                    }
                  </p>
                </li>
              }
            </ul>
          }
        </hv-card>
      }
    </div>
  `,
})
export class AdminFarmerDetailPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly t = inject(TranslateService);

  readonly detail = signal<FarmerDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  farmerId(): string {
    return this.route.snapshot.paramMap.get('id') || this.detail()?.farmer?.id || this.detail()?.id || '';
  }

  displayName(): string {
    const d = this.detail();
    return (
      d?.farmer?.name?.trim() ||
      d?.name?.trim() ||
      this.phone() ||
      this.t.instant('admin.farmers.unnamedFarmer')
    );
  }

  phone(): string {
    const d = this.detail();
    return d?.farmer?.phone || d?.phone || '—';
  }

  language(): string {
    const d = this.detail();
    return d?.farmer?.language || d?.language || '—';
  }

  farms(): FarmerFarm[] {
    const d = this.detail() as any;
    return d?.farms ?? d?.Farms ?? [];
  }

  plans(): FarmerPlan[] {
    const d = this.detail() as any;
    return d?.plans ?? d?.Plans ?? [];
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const id = this.route.snapshot.paramMap.get('id') || '';
      this.detail.set((await firstValueFrom(this.api.getFarmer(id))) as FarmerDetail);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }
}
