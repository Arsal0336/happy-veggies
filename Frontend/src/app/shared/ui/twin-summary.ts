import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HvCard } from './hv-card';

@Component({
  selector: 'hv-twin-summary',
  imports: [TranslatePipe, HvCard],
  template: `
    <hv-card>
      <h3 class="mb-2 font-semibold">{{ 'twin.title' | translate }}</h3>
      @if (!twin()) {
        <p class="text-sm text-muted">{{ 'common.loading' | translate }}</p>
      } @else {
        <dl class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt class="text-muted">{{ 'weather.title' | translate }}</dt>
            <dd class="font-medium">{{ weatherText() }}</dd>
          </div>
          <div>
            <dt class="text-muted">{{ 'nav.areas' | translate }}</dt>
            <dd class="font-medium">{{ areaCount() }}</dd>
          </div>
          <div>
            <dt class="text-muted">{{ 'twin.zones' | translate }}</dt>
            <dd class="font-medium">{{ zoneCount() }}</dd>
          </div>
          <div>
            <dt class="text-muted">{{ 'green.score' | translate }}</dt>
            <dd class="font-medium">{{ greenText() }}</dd>
          </div>
        </dl>
      }
    </hv-card>
  `,
})
export class TwinSummary {
  readonly twin = input<Record<string, unknown> | null>(null);

  weatherText(): string {
    const t = this.twin() as any;
    return t?.weatherSummary || t?.weather?.summary || t?.weather?.condition || '—';
  }

  areaCount(): number {
    const t = this.twin() as any;
    return t?.areas?.length ?? t?.productionAreas?.length ?? 0;
  }

  zoneCount(): number {
    const t = this.twin() as any;
    return t?.zones?.length ?? t?.cropZones?.length ?? 0;
  }

  greenText(): string {
    const t = this.twin() as any;
    const score = t?.greenScore?.overallScore ?? t?.greenScore;
    return score != null ? String(score) : '—';
  }
}
