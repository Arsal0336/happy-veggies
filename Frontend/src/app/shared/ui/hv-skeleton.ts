import { Component, input } from '@angular/core';

@Component({
  selector: 'hv-skeleton',
  template: `
    <div class="animate-pulse space-y-3" aria-hidden="true">
      @for (i of linesArray(); track i) {
        <div class="h-3 rounded bg-[var(--hv-color-neutral-200)]" [style.width.%]="i === lines() ? 60 : 100"></div>
      }
    </div>
  `,
})
export class HvSkeleton {
  readonly lines = input(3);
  linesArray(): number[] {
    return Array.from({ length: this.lines() }, (_, i) => i + 1);
  }
}
