import { Component, inject, OnInit, signal } from '@angular/core';
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

type FeatureFlag = {
  key: string;
  enabled: boolean;
  description?: string | null;
  updatedAt?: string;
};

@Component({
  selector: 'app-admin-flags-page',
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
      <hv-page-header titleKey="admin.nav.featureFlags" subtitleKey="admin.flags.subtitle" />

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!flags().length) {
        <hv-empty-state titleKey="admin.flags.empty" descriptionKey="admin.flags.emptyHint" />
      } @else {
        <div class="space-y-3">
          @for (flag of flags(); track flag.key) {
            <hv-card>
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <strong>{{ flag.key }}</strong>
                    <hv-badge [tone]="flag.enabled ? 'success' : 'neutral'">
                      {{ (flag.enabled ? 'admin.flags.on' : 'admin.flags.off') | translate }}
                    </hv-badge>
                  </div>
                  @if (flag.description) {
                    <p class="mt-1 text-sm text-muted">{{ flag.description }}</p>
                  }
                </div>
                <hv-button
                  variant="secondary"
                  [labelKey]="flag.enabled ? 'admin.flags.disable' : 'admin.flags.enable'"
                  [loading]="togglingKey() === flag.key"
                  (pressed)="toggle(flag)"
                />
              </div>
            </hv-card>
          }
        </div>
      }
    </div>
  `,
})
export class AdminFlagsPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslateService);

  readonly flags = signal<FeatureFlag[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly togglingKey = signal<string | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.flags.set(((await firstValueFrom(this.api.listFeatureFlags())) as FeatureFlag[]) || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Request failed');
    } finally {
      this.loading.set(false);
    }
  }

  async toggle(flag: FeatureFlag): Promise<void> {
    this.togglingKey.set(flag.key);
    try {
      await firstValueFrom(this.api.updateFeatureFlag(flag.key, { enabled: !flag.enabled }));
      this.toast.show(
        this.i18n.instant(flag.enabled ? 'admin.flags.disabledToast' : 'admin.flags.enabledToast', {
          key: flag.key,
        }),
        'success',
      );
      await this.load();
    } catch {
      this.toast.show(this.i18n.instant('admin.flags.toggleFailed'), 'error');
    } finally {
      this.togglingKey.set(null);
    }
  }
}
