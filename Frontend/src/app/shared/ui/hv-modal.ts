import { Component, input, model, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HvButton } from './hv-button';

@Component({
  selector: 'hv-modal',
  imports: [TranslatePipe, HvButton],
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" (click)="onBackdrop($event)">
        <div class="w-full max-w-md rounded-hv-lg bg-surface p-5 shadow-hv" role="dialog" aria-modal="true">
          @if (titleKey()) {
            <h2 class="mb-3 font-display text-lg font-semibold">{{ titleKey()! | translate }}</h2>
          }
          <div class="space-y-3">
            <ng-content />
          </div>
          <div class="mt-5 flex justify-end gap-2">
            <hv-button variant="secondary" labelKey="common.cancel" (pressed)="close()" />
            <ng-content select="[actions]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class HvModal {
  readonly open = model(false);
  readonly titleKey = input<string | null>(null);
  readonly closed = output<void>();

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }
}
