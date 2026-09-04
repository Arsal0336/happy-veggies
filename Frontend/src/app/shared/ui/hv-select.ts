import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

export type HvSelectOption = { value: string; labelKey?: string; label?: string };

@Component({
  selector: 'hv-select',
  imports: [FormsModule, TranslatePipe],
  template: `
    <label class="block space-y-1.5">
      @if (labelKey()) {
        <span class="text-sm font-medium">{{ labelKey()! | translate }}</span>
      }
      <select
        class="w-full rounded-hv border border-[var(--hv-color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--hv-color-focus)]"
        [disabled]="disabled()"
        [(ngModel)]="value"
      >
        @for (opt of options(); track opt.value) {
          <option [value]="opt.value">
            @if (opt.labelKey) {
              {{ opt.labelKey | translate }}
            } @else {
              {{ opt.label }}
            }
          </option>
        }
      </select>
    </label>
  `,
})
export class HvSelect {
  readonly labelKey = input<string | null>(null);
  readonly options = input<HvSelectOption[]>([]);
  readonly disabled = input(false);
  readonly value = model('');
}
