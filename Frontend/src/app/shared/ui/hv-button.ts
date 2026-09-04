import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hv-button',
  imports: [TranslatePipe],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      class="inline-flex items-center justify-center gap-2 rounded-hv px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
      [class]="variantClass()"
      (click)="pressed.emit($event)"
    >
      @if (loading()) {
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      }
      @if (labelKey()) {
        {{ labelKey()! | translate }}
      } @else {
        <ng-content />
      }
    </button>
  `,
})
export class HvButton {
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly labelKey = input<string | null>(null);
  readonly pressed = output<MouseEvent>();

  variantClass(): string {
    switch (this.variant()) {
      case 'secondary':
        return 'bg-white text-[var(--hv-color-text)] border border-[var(--hv-color-border)] shadow-sm hover:bg-[var(--hv-color-neutral-50)]';
      case 'ghost':
        return 'bg-transparent text-primary-700 hover:bg-primary-50';
      case 'danger':
        return 'bg-[var(--hv-color-error)] text-white hover:opacity-90';
      default:
        return 'bg-primary-600 text-white hover:bg-primary-700 shadow-hv';
    }
  }
}
