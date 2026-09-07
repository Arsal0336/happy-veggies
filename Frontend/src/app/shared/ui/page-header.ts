import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hv-page-header',
  imports: [TranslatePipe],
  styles: `
    :host {
      display: block;
    }
    .page-header {
      position: sticky;
      top: calc(var(--hv-shell-header, 0rem) + env(safe-area-inset-top, 0px));
      z-index: 40;
      margin: -0.25rem -1rem 1.15rem;
      padding: 0.7rem 1rem 0.85rem;
      background: rgb(244 248 245 / 0.9);
      backdrop-filter: saturate(1.1) blur(12px);
      -webkit-backdrop-filter: saturate(1.1) blur(12px);
      border-bottom: 1px solid rgb(15 46 26 / 0.07);
    }
    .page-header__title {
      margin: 0;
      font-family: var(--hv-font-display);
      font-size: 1.4rem;
      font-weight: 650;
      letter-spacing: -0.025em;
      line-height: 1.2;
      color: var(--hv-color-text);
    }
    .page-header__subtitle {
      margin: 0.3rem 0 0;
      font-size: 0.875rem;
      line-height: 1.4;
      color: var(--hv-color-text-muted);
    }
    .page-header__actions {
      margin-top: 0.65rem;
    }
    .page-header__actions:empty {
      display: none;
      margin: 0;
    }
  `,
  template: `
    <header class="page-header">
      <h1 class="page-header__title">
        @if (titleKey()) {
          {{ titleKey()! | translate }}
        } @else {
          {{ title() }}
        }
      </h1>
      @if (subtitleKey()) {
        <p class="page-header__subtitle">{{ subtitleKey()! | translate }}</p>
      } @else if (subtitle()) {
        <p class="page-header__subtitle">{{ subtitle() }}</p>
      }
      <div class="page-header__actions">
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
