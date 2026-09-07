import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvSkeleton } from '../../../shared/ui/hv-skeleton';
import { HvErrorState } from '../../../shared/ui/hv-error-state';
import { HvEmptyState } from '../../../shared/ui/hv-empty-state';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvButton } from '../../../shared/ui/hv-button';
import { TwinApiService } from '../../../core/api/twin.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-weather-page',
  imports: [
    TranslatePipe,
    PageHeader,
    HvSkeleton,
    HvErrorState,
    HvEmptyState,
    HvCard,
    HvButton,
  ],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="weather.title">
        <div class="flex flex-wrap gap-2">
          <hv-button
            variant="secondary"
            labelKey="weather.refresh"
            [loading]="refreshing()"
            (pressed)="refresh()"
          />
          <hv-button variant="ghost" labelKey="common.back" (pressed)="back()" />
        </div>
      </hv-page-header>

      @if (loading()) {
        <hv-skeleton />
      } @else if (error()) {
        <hv-error-state [message]="error()" (retry)="load()" />
      } @else if (!weather()) {
        <hv-empty-state titleKey="weather.empty" descriptionKey="weather.emptyHint">
          <hv-button
            labelKey="weather.refresh"
            [loading]="refreshing()"
            (pressed)="refresh()"
          />
        </hv-empty-state>
      } @else {
        <hv-card>
          <div class="space-y-2 text-sm">
            @if (tempLabel(); as temp) {
              <p>
                <strong>{{ 'weather.temperature' | translate }}:</strong> {{ temp }}
              </p>
            }
            @if (weather()?.forecastTrend) {
              <p>
                <strong>{{ 'weather.forecast' | translate }}:</strong>
                {{ weather()?.forecastTrend }}
              </p>
            }
            @if (weather()?.rainProbability != null) {
              <p>
                <strong>{{ 'weather.rain' | translate }}:</strong>
                {{ weather()?.rainProbability }}%
              </p>
            }
            @if (weather()?.humidity != null) {
              <p>
                <strong>{{ 'weather.humidity' | translate }}:</strong>
                {{ weather()?.humidity }}%
              </p>
            }
            @if (weather()?.providerStatus) {
              <p class="text-muted">
                {{ 'weather.status' | translate }}: {{ weather()?.providerStatus }}
              </p>
            }
          </div>

          @if (extremeAlerts().length) {
            <div class="mt-4">
              <h2 class="mb-2 font-semibold">{{ 'weather.alerts' | translate }}</h2>
              <ul class="m-0 list-disc space-y-1 ps-5 text-sm text-muted">
                @for (a of extremeAlerts(); track $index) {
                  <li>{{ a }}</li>
                }
              </ul>
            </div>
          }
        </hv-card>
      }
    </div>
  `,
})
export class WeatherPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(TwinApiService);
  private readonly toast = inject(ToastService);
  private readonly t = inject(TranslateService);

  farmId = '';
  readonly weather = signal<any>(null);
  readonly loading = signal(true);
  readonly refreshing = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('farmId') || '';
    void this.load();
  }

  back(): void {
    void this.router.navigate(['/farms', this.farmId]);
  }

  tempLabel(): string | null {
    const w = this.weather();
    if (!w?.temperature) return null;
    if (typeof w.temperature === 'object') {
      const value = w.temperature.value ?? w.temperature.Value;
      if (value == null) return null;
      const unit = w.temperature.unit ?? w.temperature.Unit ?? '°';
      return `${value}${unit ? ` ${unit}` : '°'}`;
    }
    return String(w.temperature);
  }

  extremeAlerts(): string[] {
    const alerts = this.weather()?.extremeAlerts;
    return Array.isArray(alerts) ? alerts.map(String) : [];
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const twin: any = await firstValueFrom(this.api.getTwin(this.farmId));
      this.weather.set(twin?.weather || twin?.weatherSummary || null);
    } catch (e: any) {
      this.error.set(e?.message || this.t.instant('common.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async refresh(): Promise<void> {
    this.refreshing.set(true);
    try {
      const twin: any = await firstValueFrom(this.api.refreshTwin(this.farmId));
      this.weather.set(twin?.weather || twin?.weatherSummary || null);
      this.toast.success(this.t.instant('twin.refresh'));
      if (!this.weather()) await this.load();
    } catch (e: any) {
      this.toast.error(e?.message || this.t.instant('common.error'));
    } finally {
      this.refreshing.set(false);
    }
  }
}
