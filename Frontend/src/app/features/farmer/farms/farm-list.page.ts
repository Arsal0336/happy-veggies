import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvBadge } from '../../../shared/ui/hv-badge';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { FarmApiService } from '../../../core/api/farm.service';
import { AlertApiService } from '../../../core/api/alert.service';

@Component({
  selector: 'app-farm-list-page',
  imports: [
    DecimalPipe,
    RouterLink,
    TranslatePipe,
    PageHeader,
    HvButton,
    HvCard,
    HvBadge,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="farms.title" subtitleKey="farms.listLead">
        <a routerLink="/farms/new"><hv-button labelKey="farms.add" /></a>
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton [lines]="4" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!farms().length) {
        <hv-empty-state titleKey="farms.empty" descriptionKey="farms.emptyHint">
          <a routerLink="/farms/new"><hv-button labelKey="farms.startSetup" /></a>
        </hv-empty-state>
      } @else {
        <ul class="m-0 flex list-none flex-col gap-3 p-0">
          @for (farm of farms(); track farm.id) {
            <li>
              <a [routerLink]="['/farms', farm.id]" class="block no-underline text-inherit">
                <hv-card>
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="font-semibold">
                        {{ farm.name || ('common.unnamed' | translate) }}
                      </p>
                      <p class="text-sm text-muted">
                        {{ subtitle(farm) }}
                      </p>
                      <p class="mt-1 text-xs text-muted">
                        {{ farm.lat | number: '1.3-3' }}, {{ farm.lng | number: '1.3-3' }}
                      </p>
                    </div>
                    @if ((unread()[farm.id] || 0) > 0) {
                      <hv-badge tone="error">{{ unread()[farm.id] }}</hv-badge>
                    } @else {
                      <hv-badge tone="success">{{ 'farms.live' | translate }}</hv-badge>
                    }
                  </div>
                  <div class="mt-3 flex gap-4 text-sm font-semibold">
                    <span class="text-primary-700">{{ 'farms.open' | translate }}</span>
                    @if ((unread()[farm.id] || 0) > 0) {
                      <a
                        [routerLink]="['/farms', farm.id, 'alerts']"
                        class="text-[var(--hv-color-error)]"
                        (click)="$event.stopPropagation()"
                      >
                        {{ 'alerts.title' | translate }}
                      </a>
                    }
                  </div>
                </hv-card>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class FarmListPage implements OnInit {
  private readonly api = inject(FarmApiService);
  private readonly alerts = inject(AlertApiService);

  readonly farms = signal<any[]>([]);
  readonly unread = signal<Record<string, number>>({});
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  subtitle(farm: any): string {
    const region = farm.regionLabel || farm.regionCode || '';
    const area = farm.area
      ? `${farm.area.value} ${farm.area.unit}`
      : farm.areaInputValue != null
        ? `${farm.areaInputValue} ${farm.areaInputUnit || ''}`
        : '';
    return [region, area].filter(Boolean).join(' — ');
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const rows = ((await firstValueFrom(this.api.listFarms())) as any[]) || [];
      this.farms.set(rows);
      if (rows.length) {
        const counts = await firstValueFrom(
          forkJoin(
            rows.map((f) =>
              this.alerts.listAlerts(f.id).pipe(
                catchError(() => of([] as unknown[])),
              ),
            ),
          ),
        );
        const map: Record<string, number> = {};
        rows.forEach((f, i) => {
          const list = (counts[i] as any[]) || [];
          map[f.id] = list.filter((a) => !a.read).length;
        });
        this.unread.set(map);
      }
    } catch (e: any) {
      this.error.set(e?.message || 'Failed');
    } finally {
      this.loading.set(false);
    }
  }
}
