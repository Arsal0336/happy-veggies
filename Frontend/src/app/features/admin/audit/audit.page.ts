import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { AdminApiService } from '../../../core/api/admin.service';
import { AdminAuthStore } from '../../../core/auth/admin-auth.store';

type AuditEntry = {
  id: string;
  actorAdminId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadataJson?: string | null;
  timestamp: string;
};

@Component({
  selector: 'app-admin-audit-page',
  imports: [
    DatePipe,
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
  ],
  template: `
    <div class="hv-page-wide space-y-4">
      <hv-page-header titleKey="admin.nav.auditLog" subtitleKey="admin.audit.subtitle" />

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!rows().length) {
        <hv-empty-state titleKey="admin.audit.empty" descriptionKey="admin.audit.emptyHint" />
      } @else {
        <hv-card>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[36rem] text-start text-sm">
              <thead class="border-b border-[var(--hv-color-border)] text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th class="py-2 pe-3 font-semibold">{{ 'admin.audit.who' | translate }}</th>
                  <th class="py-2 pe-3 font-semibold">{{ 'admin.audit.what' | translate }}</th>
                  <th class="py-2 font-semibold">{{ 'admin.audit.when' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (row of rows(); track row.id) {
                  <tr class="border-b border-[var(--hv-color-border)] last:border-0">
                    <td class="py-2.5 pe-3 font-mono text-xs">{{ who(row) }}</td>
                    <td class="py-2.5 pe-3">
                      {{ row.action }} · {{ row.targetType }}/{{ row.targetId || '—' }}
                    </td>
                    <td class="py-2.5 whitespace-nowrap text-muted">
                      {{ row.timestamp | date: 'medium' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </hv-card>
      }
    </div>
  `,
})
export class AdminAuditPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly auth = inject(AdminAuthStore);

  readonly rows = signal<AuditEntry[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  who(row: AuditEntry): string {
    const me = this.auth.user();
    if (me && row.actorAdminId === me.id) return me.email;
    return row.actorAdminId;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.rows.set(((await firstValueFrom(this.api.listAuditLogs())) as AuditEntry[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Request failed');
    } finally {
      this.loading.set(false);
    }
  }
}
