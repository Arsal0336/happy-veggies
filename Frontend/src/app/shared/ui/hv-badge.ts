import { Component, input } from '@angular/core';

@Component({
  selector: 'hv-badge',
  template: `
    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" [class]="toneClass()">
      <ng-content />
    </span>
  `,
})
export class HvBadge {
  readonly tone = input<'neutral' | 'success' | 'warning' | 'error' | 'info'>('neutral');

  toneClass(): string {
    switch (this.tone()) {
      case 'success':
        return 'bg-[var(--hv-color-success-bg)] text-[var(--hv-color-success)]';
      case 'warning':
        return 'bg-[var(--hv-color-warning-bg)] text-[var(--hv-color-warning)]';
      case 'error':
        return 'bg-[var(--hv-color-error-bg)] text-[var(--hv-color-error)]';
      case 'info':
        return 'bg-[var(--hv-color-info-bg)] text-[var(--hv-color-info)]';
      default:
        return 'bg-[var(--hv-color-neutral-100)] text-[var(--hv-color-neutral-700)]';
    }
  }
}
