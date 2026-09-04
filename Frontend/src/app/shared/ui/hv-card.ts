import { Component, input } from '@angular/core';

@Component({
  selector: 'hv-card',
  template: `
    <div class="rounded-hv-lg border border-[var(--hv-color-border)] bg-surface p-4 shadow-sm">
      <ng-content />
    </div>
  `,
})
export class HvCard {
  readonly padding = input<'md' | 'lg'>('md');
}
