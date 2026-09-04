import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { HvInput } from '../../../shared/ui/hv-input';
import { AdminApiService } from '../../../core/api/admin.service';

type FarmerRow = {
  id: string;
  phone: string;
  name?: string | null;
  language?: string;
  createdAt?: string;
};

@Component({
  selector: 'app-admin-farmers-page',
  imports: [
    RouterLink,
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvInput,
  ],
  template: `
    <div class="hv-page-wide">
      <hv-page-header titleKey="admin.nav.farmers" subtitleKey="admin.farmers.subtitle" />
      <div class="mb-4 max-w-md">
        <hv-input
          labelKey="admin.farmers.search"
          [placeholder]="'admin.farmers.searchPlaceholder' | translate"
          [(value)]="query"
          (valueChange)="onSearch($event)"
        />
      </div>
      @if (loading()) {
        <hv-skeleton [lines]="6" />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!farmers().length) {
        <hv-empty-state titleKey="admin.farmers.empty" descriptionKey="admin.farmers.emptyHint" />
      } @else {
        <div class="overflow-x-auto rounded-hv-lg border border-[var(--hv-color-border)] bg-surface">
          <table class="w-full min-w-[28rem] text-start text-sm">
            <thead class="border-b border-[var(--hv-color-border)] bg-[var(--hv-color-neutral-50)] text-xs uppercase tracking-wide text-muted">
              <tr>
                <th class="px-4 py-3 font-semibold">{{ 'admin.farmers.colName' | translate }}</th>
                <th class="px-4 py-3 font-semibold">{{ 'admin.farmers.colPhone' | translate }}</th>
                <th class="px-4 py-3 font-semibold">{{ 'admin.farmers.colLanguage' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (f of farmers(); track f.id) {
                <tr
                  class="cursor-pointer border-b border-[var(--hv-color-border)] last:border-0 hover:bg-primary-50/60"
                  [routerLink]="['/admin/farmers', f.id]"
                >
                  <td class="px-4 py-3 font-medium">{{ f.name?.trim() || ('common.unnamed' | translate) }}</td>
                  <td class="px-4 py-3 font-mono text-xs">{{ f.phone }}</td>
                  <td class="px-4 py-3">{{ f.language || '—' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AdminFarmersPage implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly farmers = signal<FarmerRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly query = signal('');
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    void this.load();
  }

  onSearch(_value: string): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => void this.load(), 250);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const rows = await firstValueFrom(this.api.listFarmers(this.query().trim() || undefined));
      this.farmers.set((rows as FarmerRow[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Request failed');
    } finally {
      this.loading.set(false);
    }
  }
}
