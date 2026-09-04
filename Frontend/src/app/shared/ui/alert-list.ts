import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HvEmptyState } from './hv-empty-state';
import { HvButton } from './hv-button';
import { HvBadge } from './hv-badge';

export type AlertItem = {
  id: string;
  title?: string;
  message?: string;
  severity?: string;
  read?: boolean;
};

@Component({
  selector: 'hv-alert-list',
  imports: [HvEmptyState, HvButton, HvBadge],
  template: `
    @if (!alerts().length) {
      <hv-empty-state titleKey="alerts.empty" />
    } @else {
      <ul class="space-y-2">
        @for (a of alerts(); track a.id) {
          <li class="rounded-hv border border-[var(--hv-color-border)] bg-surface p-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="font-medium">{{ a.title || a.message }}</p>
                @if (a.title && a.message) {
                  <p class="text-sm text-muted">{{ a.message }}</p>
                }
              </div>
              <hv-badge [tone]="a.read ? 'neutral' : 'warning'">{{ a.severity || 'info' }}</hv-badge>
            </div>
            @if (!a.read) {
              <div class="mt-2">
                <hv-button variant="ghost" labelKey="alerts.markRead" (pressed)="markRead.emit(a.id)" />
              </div>
            }
          </li>
        }
      </ul>
    }
  `,
})
export class AlertList {
  readonly alerts = input<AlertItem[]>([]);
  readonly markRead = output<string>();
}
