import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'hv-toast',
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4">
      @for (t of toast.toasts(); track t.id) {
        <div
          class="pointer-events-auto max-w-sm rounded-hv px-4 py-2 text-sm text-white shadow-hv"
          [class.bg-primary-700]="t.tone === 'info'"
          [class.bg-[var(--hv-color-success)]]="t.tone === 'success'"
          [class.bg-[var(--hv-color-warning)]]="t.tone === 'warning'"
          [class.bg-[var(--hv-color-error)]]="t.tone === 'error'"
        >
          {{ t.text }}
        </div>
      }
    </div>
  `,
})
export class HvToast {
  readonly toast = inject(ToastService);
}
