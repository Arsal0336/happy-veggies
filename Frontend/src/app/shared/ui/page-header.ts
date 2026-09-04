import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hv-page-header',
  imports: [TranslatePipe],
  template: `
    <header class="mb-5 space-y-1">
      <h1 class="font-display text-2xl font-semibold tracking-tight text-[var(--hv-color-text)]">
        @if (titleKey()) {
          {{ titleKey()! | translate }}
        } @else {
          {{ title() }}
        }
      </h1>
      @if (subtitleKey()) {
        <p class="text-sm text-muted">{{ subtitleKey()! | translate }}</p>
      } @else if (subtitle()) {
        <p class="text-sm text-muted">{{ subtitle() }}</p>
      }
      <div class="pt-2">
        <ng-content />
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly titleKey = input<string | null>(null);
  readonly title = input<string | null>(null);
  readonly subtitleKey = input<string | null>(null);
  readonly subtitle = input<string | null>(null);
}
