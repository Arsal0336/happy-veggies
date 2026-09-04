import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hv-input',
  imports: [FormsModule, TranslatePipe],
  template: `
    <label class="block space-y-1.5">
      @if (labelKey()) {
        <span class="text-sm font-medium text-[var(--hv-color-text)]">{{ labelKey()! | translate }}</span>
      }
      <input
        class="w-full rounded-hv border border-[var(--hv-color-border)] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--hv-color-focus)]"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [(ngModel)]="value"
        [attr.autocomplete]="autocomplete()"
      />
      @if (hintKey()) {
        <span class="text-xs text-muted">{{ hintKey()! | translate }}</span>
      }
    </label>
  `,
})
export class HvInput {
  readonly labelKey = input<string | null>(null);
  readonly hintKey = input<string | null>(null);
  readonly type = input('text');
  readonly placeholder = input('');
  readonly disabled = input(false);
  readonly autocomplete = input<string | null>(null);
  readonly value = model('');
}
