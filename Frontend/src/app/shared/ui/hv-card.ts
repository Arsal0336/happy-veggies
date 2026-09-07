import { Component, input } from '@angular/core';

@Component({
  selector: 'hv-card',
  styles: `
    :host {
      display: block;
    }
    .card {
      border: 1px solid var(--hv-color-border);
      border-radius: var(--hv-radius-xl);
      background: var(--hv-color-surface);
      box-shadow: var(--hv-shadow-sm);
    }
    .card--md {
      padding: 1rem 1.05rem;
    }
    .card--lg {
      padding: 1.25rem 1.35rem;
    }
  `,
  template: `
    <div class="card" [class]="padding() === 'lg' ? 'card--lg' : 'card--md'">
      <ng-content />
    </div>
  `,
})
export class HvCard {
  readonly padding = input<'md' | 'lg'>('md');
}
