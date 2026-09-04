import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'hv-drawer',
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 bg-black/40" (click)="close()"></div>
      <aside
        class="fixed inset-y-0 z-50 w-72 max-w-[85vw] overflow-y-auto bg-surface p-4 shadow-hv transition"
        [class.start-0]="side() === 'start'"
        [class.end-0]="side() === 'end'"
        role="dialog"
        aria-modal="true"
      >
        <ng-content />
      </aside>
    }
  `,
})
export class HvDrawer {
  readonly open = model(false);
  readonly side = input<'start' | 'end'>('start');
  readonly closed = output<void>();

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
