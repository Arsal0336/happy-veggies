import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { HvDrawer } from './hv-drawer';
import { HvButton } from './hv-button';

const NAV = [
  { key: 'admin.nav.dashboard', link: '/admin' },
  { key: 'admin.nav.farmers', link: '/admin/farmers' },
  { key: 'admin.nav.crops', link: '/admin/catalog/crops' },
  { key: 'admin.nav.seedVarieties', link: '/admin/catalog/seed-varieties' },
  { key: 'admin.nav.productionAreaTypes', link: '/admin/catalog/area-types' },
  { key: 'admin.nav.compatibility', link: '/admin/catalog/compatibility' },
  { key: 'admin.nav.governmentRates', link: '/admin/rates' },
  { key: 'admin.nav.planReview', link: '/admin/reviews/plans' },
  { key: 'admin.nav.analytics', link: '/admin/analytics' },
  { key: 'admin.nav.featureFlags', link: '/admin/flags' },
  { key: 'admin.nav.auditLog', link: '/admin/audit' },
  { key: 'common.settings', link: '/admin/settings' },
];

@Component({
  selector: 'hv-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, HvDrawer, HvButton],
  template: `
    <div class="min-h-full md:flex">
      <aside class="hidden w-60 shrink-0 border-e border-[var(--hv-color-border)] bg-surface md:block">
        <div class="p-4">
          <p class="font-display text-lg font-semibold text-primary-700">{{ 'common.appName' | translate }}</p>
          <p class="text-xs text-muted">Admin</p>
        </div>
        <nav class="space-y-0.5 px-2 pb-6">
          @for (item of nav; track item.link) {
            <a
              [routerLink]="item.link"
              routerLinkActive="bg-primary-50 text-primary-800"
              [routerLinkActiveOptions]="{ exact: item.link === '/admin' }"
              class="block rounded-hv px-3 py-2 text-sm font-medium text-[var(--hv-color-text)] hover:bg-[var(--hv-color-neutral-50)]"
            >
              {{ item.key | translate }}
            </a>
          }
        </nav>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex items-center gap-3 border-b border-[var(--hv-color-border)] bg-surface px-4 py-3 md:hidden">
          <hv-button variant="ghost" (pressed)="drawerOpen.set(true)">☰</hv-button>
          <span class="font-display font-semibold">{{ 'common.appName' | translate }}</span>
        </header>
        <main class="flex-1 bg-[var(--hv-color-bg)]">
          <router-outlet />
        </main>
      </div>
    </div>

    <hv-drawer [(open)]="drawerOpen">
      <p class="mb-3 font-display text-lg font-semibold">{{ 'common.appName' | translate }}</p>
      <nav class="space-y-1">
        @for (item of nav; track item.link) {
          <a
            [routerLink]="item.link"
            class="block rounded-hv px-3 py-2 text-sm"
            (click)="drawerOpen.set(false)"
          >
            {{ item.key | translate }}
          </a>
        }
      </nav>
    </hv-drawer>
  `,
})
export class AdminShell {
  readonly nav = NAV;
  readonly drawerOpen = signal(false);
}
