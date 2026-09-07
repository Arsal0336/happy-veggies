import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hv-alert',
  imports: [TranslatePipe],
  template: `
    <div class="rounded-hv border px-3 py-2.5 text-sm" [class]="toneClass()" role="alert">
      @if (titleKey()) {
        <p class="font-semibold">{{ titleKey()! | translate }}</p>
      }
      @if (messageKey()) {
        <p>{{ messageKey()! | translate }}</p>
      }
      <ng-content />
    </div>
  `,
})
export class HvAlert {
  readonly tone = input<'info' | 'success' | 'warning' | 'error'>('info');
  readonly titleKey = input<string | null>(null);
  readonly messageKey = input<string | null>(null);

  toneClass(): string {
    switch (this.tone()) {
      case 'success':
        return 'border-[var(--hv-color-success)]/30 bg-[var(--hv-color-success-bg)] text-[var(--hv-color-success)]';
      case 'warning':
        return 'border-[var(--hv-color-warning)]/30 bg-[var(--hv-color-warning-bg)] text-[var(--hv-color-warning)]';
      case 'error':
        return 'border-[var(--hv-color-error)]/30 bg-[var(--hv-color-error-bg)] text-[var(--hv-color-error)]';
      default:
        return 'border-[var(--hv-color-info)]/30 bg-[var(--hv-color-info-bg)] text-[var(--hv-color-info)]';
    }
  }
}
