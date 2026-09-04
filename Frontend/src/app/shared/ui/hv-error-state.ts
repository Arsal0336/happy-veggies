import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HvButton } from './hv-button';

@Component({
  selector: 'hv-error-state',
  imports: [TranslatePipe, HvButton],
  template: `
    <div class="rounded-hv-lg border border-[var(--hv-color-error)]/20 bg-[var(--hv-color-error-bg)] p-5 text-center">
      <p class="font-semibold text-[var(--hv-color-error)]">
        {{ (titleKey() || 'common.error') | translate }}
      </p>
      @if (message()) {
        <p class="mt-1 text-sm text-[var(--hv-color-error)]">{{ message() }}</p>
      }
      <div class="mt-3 flex justify-center">
        <hv-button variant="secondary" labelKey="common.retry" (pressed)="retry.emit()" />
      </div>
    </div>
  `,
})
export class HvErrorState {
  readonly titleKey = input<string | null>(null);
  readonly message = input<string | null>(null);
  readonly retry = output<void>();
}
