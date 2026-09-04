import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hv-empty-state',
  imports: [TranslatePipe],
  template: `
    <div class="flex flex-col items-center justify-center gap-2 rounded-hv-lg border border-dashed border-[var(--hv-color-border)] px-6 py-10 text-center">
      <p class="font-semibold text-[var(--hv-color-text)]">
        {{ (titleKey() || 'common.empty') | translate }}
      </p>
      @if (descriptionKey()) {
        <p class="max-w-sm text-sm text-muted">{{ descriptionKey()! | translate }}</p>
      }
      <div class="mt-2">
        <ng-content />
      </div>
    </div>
  `,
})
export class HvEmptyState {
  readonly titleKey = input<string | null>(null);
  readonly descriptionKey = input<string | null>(null);
}
