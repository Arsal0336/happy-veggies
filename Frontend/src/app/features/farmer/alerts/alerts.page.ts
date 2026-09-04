import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { HvButton } from '../../../shared/ui/hv-button';
import { AlertList } from '../../../shared/ui/alert-list';
import { AlertApiService } from '../../../core/api/alert.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-alerts-page',
  imports: [
    TranslatePipe,
    RouterLink,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvButton,
    AlertList,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="alerts.title">
        <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!alerts().length) {
        <hv-empty-state titleKey="alerts.empty" />
      } @else {
        <hv-alert-list [alerts]="alertItems()" (markRead)="markRead($event)" />
      }

      <p class="mt-4">
        <a [routerLink]="['/farms', farmId]" class="text-primary-700">{{ 'nav.home' | translate }}</a>
      </p>
    </div>
  `,
})
export class AlertsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(AlertApiService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly alerts = signal<any[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  alertItems(): any[] {
    return this.alerts().map((a) => ({
      id: a.id,
      read: a.read,
      severity: a.severity,
      title: a.title || a.type,
      message: a.message,
    }));
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.alerts.set((await firstValueFrom(this.api.listAlerts(this.farmId))) as any[]);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async markRead(id: string): Promise<void> {
    try {
      await firstValueFrom(this.api.markRead(this.farmId, id));
      this.alerts.update((list) => list.map((a) => (a.id === id ? { ...a, read: true } : a)));
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    }
  }
}
