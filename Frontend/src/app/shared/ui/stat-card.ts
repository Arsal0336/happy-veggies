import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HvCard } from './hv-card';

@Component({
  selector: 'hv-stat-card',
  imports: [TranslatePipe, HvCard],
  template: `
    <hv-card>
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        @if (labelKey()) {
          {{ labelKey()! | translate }}
        } @else {
          {{ label() }}
        }
      </p>
      <p class="mt-1 font-display text-2xl font-semibold">{{ value() }}</p>
      @if (hint()) {
        <p class="mt-1 text-xs text-muted">{{ hint() }}</p>
      }
    </hv-card>
  `,
})
export class StatCard {
  readonly labelKey = input<string | null>(null);
  readonly label = input<string | null>(null);
  readonly value = input<string | number>('');
  readonly hint = input<string | null>(null);
}
