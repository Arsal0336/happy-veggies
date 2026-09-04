import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvInput } from '../../../shared/ui/hv-input';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { FarmApiService } from '../../../core/api/farm.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-edit-farm-page',
  imports: [TranslatePipe, PageHeader, HvInput, HvButton, HvCard, HvSkeleton, HvErrorState],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="farms.edit" />
      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else {
        <hv-card>
          <form class="space-y-3" (submit)="$event.preventDefault(); save()">
            <hv-input labelKey="farms.name" [(value)]="name" />
            <hv-input labelKey="farms.region" [(value)]="region" />
            <div class="flex gap-2">
              <hv-button type="submit" labelKey="common.save" [loading]="saving()" />
              <hv-button type="button" variant="ghost" labelKey="common.cancel" (pressed)="back()" />
            </div>
          </form>
        </hv-card>
        <div class="mt-4">
          <hv-card>
            <h2 class="mb-1 font-semibold">{{ 'farms.delete' | translate }}</h2>
            <p class="mb-3 text-sm text-muted">{{ 'farms.deleteHint' | translate }}</p>
            <hv-button
              variant="danger"
              labelKey="common.delete"
              [loading]="deleting()"
              (pressed)="remove()"
            />
          </hv-card>
        </div>
      }
    </div>
  `,
})
export class EditFarmPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(FarmApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);
  farmId = '';
  readonly farm = signal<any>(null);
  readonly name = signal('');
  readonly region = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const farm: any = await firstValueFrom(this.api.getFarm(this.farmId));
      this.farm.set(farm);
      this.name.set(farm.name || '');
      this.region.set(farm.regionCode || '');
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('farms.notFound'));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    const farm = this.farm();
    this.saving.set(true);
    try {
      await firstValueFrom(
        this.api.updateFarm(this.farmId, {
          name: this.name().trim() || undefined,
          regionCode: this.region().trim() || farm.regionCode,
          regionLabel: this.region().trim() || farm.regionLabel,
          lat: farm.lat,
          lng: farm.lng,
        }),
      );
      this.toast.success(this.t.instant('common.save'));
      await this.router.navigate(['/farms', this.farmId]);
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.saving.set(false);
    }
  }

  async remove(): Promise<void> {
    if (!confirm(this.t.instant('farms.confirmDelete'))) return;
    this.deleting.set(true);
    try {
      await firstValueFrom(this.api.deleteFarm(this.farmId));
      this.toast.success(this.t.instant('common.delete'));
      await this.router.navigateByUrl('/');
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.deleting.set(false);
    }
  }
}
