import { DatePipe } from '@angular/common';
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
  type?: string;
  read?: boolean;
  createdAt?: string | Date | null;
};

@Component({
  selector: 'hv-alert-list',
  imports: [DatePipe, TranslatePipe, HvEmptyState, HvButton, HvBadge],
  template: `
    @if (!alerts().length) {
      <hv-empty-state titleKey="alerts.empty" />
    } @else {
      <ul class="m-0 flex list-none flex-col gap-3 p-0">
        @for (a of alerts(); track a.id) {
          <li
            class="rounded-hv-lg border border-[var(--hv-color-border)] bg-surface p-3.5 shadow-sm"
            [class.opacity-70]="a.read"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <div class="mb-1.5 flex flex-wrap items-center gap-2">
                  <hv-badge [tone]="severityTone(a)">{{ severityLabel(a) }}</hv-badge>
                  @if (a.type) {
                    <span class="text-xs font-medium uppercase tracking-wide text-muted">{{
                      typeLabel(a.type)
                    }}</span>
                  }
                  @if (a.read) {
                    <hv-badge tone="neutral">{{ 'alerts.read' | translate }}</hv-badge>
                  } @else {
                    <hv-badge tone="info">{{ 'alerts.unread' | translate }}</hv-badge>
                  }
                </div>
                <p class="m-0 text-base font-semibold text-[var(--hv-color-text)]">
                  {{ a.title || a.message || ('alerts.untitled' | translate) }}
                </p>
                @if (bodyText(a); as body) {
                  <p class="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-muted">{{ body }}</p>
                }
                @if (a.createdAt) {
                  <p class="mt-2 text-xs text-muted">{{ a.createdAt | date: 'medium' }}</p>
                }
              </div>
            </div>
            @if (!a.read) {
              <div class="mt-3">
                <hv-button variant="secondary" labelKey="alerts.markRead" (pressed)="markRead.emit(a.id)" />
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

  bodyText(a: AlertItem): string | null {
    const title = (a.title || '').trim();
    const message = (a.message || '').trim();
    if (!message) return null;
    if (title && message === title) return null;
    return message;
  }

  severityTone(a: AlertItem): 'error' | 'warning' | 'info' | 'success' | 'neutral' {
    const s = (a.severity || '').toLowerCase();
    if (s === 'critical' || s === 'high' || s === 'error' || s === 'danger') return 'error';
    if (s === 'warning' || s === 'medium') return 'warning';
    if (s === 'info' || s === 'low') return 'info';
    if (s === 'success') return 'success';
    return a.read ? 'neutral' : 'warning';
  }

  severityLabel(a: AlertItem): string {
    return (a.severity || 'info').replace(/_/g, ' ');
  }

  typeLabel(type: string): string {
    return type.replace(/_/g, ' ');
  }
}
