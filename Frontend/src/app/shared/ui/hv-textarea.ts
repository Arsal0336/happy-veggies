import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hv-textarea',
  imports: [FormsModule, TranslatePipe],
  template: `
    <label class="block space-y-1.5">
      @if (labelKey()) {
        <span class="text-sm font-medium">{{ labelKey()! | translate }}</span>
      }
      <textarea
        class="w-full rounded-hv border border-[var(--hv-color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--hv-color-focus)]"
        [rows]="rows()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [(ngModel)]="value"
      ></textarea>
    </label>
  `,
})
export class HvTextarea {
  readonly labelKey = input<string | null>(null);
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly rows = input(4);
  readonly value = model('');
}
