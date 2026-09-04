import { Component, computed, inject } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'hv-farmer-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  styles: `
    :host { display: block; min-height: 100%; }
    .shell {
      display: flex;
      min-height: 100dvh;
      flex-direction: column;
      background:
        radial-gradient(ellipse at top, rgb(31 92 50 / 0.07), transparent 42%),
        var(--hv-color-bg);
    }
    .shell__main {
      flex: 1;
      min-height: 0;
      padding-bottom: calc(5.25rem + env(safe-area-inset-bottom));
    }
    .shell__nav {
      position: fixed;
      inset-inline: 0;
      bottom: 0;
      z-index: 40;
      border-top: 1px solid var(--hv-color-border);
      background: rgb(255 255 255 / 0.92);
      backdrop-filter: blur(12px);
      box-shadow: var(--hv-shadow-nav);
      padding-bottom: env(safe-area-inset-bottom);
    }
    .shell__list {
      margin: 0 auto;
      display: flex;
      max-width: 36rem;
      list-style: none;
      padding: 0.35rem 0.4rem;
    }
    .shell__link {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      gap: 0.15rem;
      padding: 0.45rem 0.25rem;
      border-radius: 0.75rem;
      color: var(--hv-color-text-muted);
      text-decoration: none;
      font-size: 0.68rem;
      font-weight: 600;
      transition: background 140ms ease, color 140ms ease;
    }
    .shell__link:hover { background: var(--hv-color-primary-50); color: var(--hv-color-primary-800); }
    .shell__link--active {
      color: var(--hv-color-primary-700);
      background: var(--hv-color-primary-50);
    }
    .shell__icon {
      width: 1.25rem;
      height: 1.25rem;
    }
    .shell__icon svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
  template: `
    <div class="shell">
      <main class="shell__main">
        <router-outlet />
      </main>
      <nav class="shell__nav" [attr.aria-label]="'nav.farms' | translate">
        <ul class="shell__list">
          @for (item of items(); track item.key) {
            <li class="flex-1">
              <a
                [routerLink]="item.link"
                routerLinkActive="shell__link--active"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="shell__link"
              >
                <span class="shell__icon" aria-hidden="true">
                  @switch (item.icon) {
                    @case ('home') {
                      <svg viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>
                    }
                    @case ('plan') {
                      <svg viewBox="0 0 24 24"><path d="M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>
                    }
                    @case ('chat') {
                      <svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 1 1 18 0Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>
                    }
                    @case ('leaf') {
                      <svg viewBox="0 0 24 24"><path d="M12 21c-4-3.2-7-6.2-7-10a7 7 0 0 1 14 0c0 3.8-3 6.8-7 10Z"/><path d="M12 11v4"/></svg>
                    }
                    @default {
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M4 12h2M18 12h2M12 4v2M12 18v2"/></svg>
                    }
                  }
                </span>
                <span>{{ item.key | translate }}</span>
              </a>
            </li>
          }
        </ul>
      </nav>
    </div>
  `,
})
export class FarmerShell {
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly items = computed(() => {
    const match = this.url().match(/\/farms\/([^\/\?]+)/);
    const farmId = match?.[1] && match[1] !== 'new' ? match[1] : null;
    const farmBase = farmId ? ['/farms', farmId] : null;
    return [
      { key: 'nav.farms', exact: true, link: ['/'] as string[], icon: 'home' },
      {
        key: 'nav.plan',
        exact: false,
        link: (farmBase ? [...farmBase, 'plan'] : ['/']) as string[],
        icon: 'plan',
      },
      {
        key: 'nav.assistant',
        exact: false,
        link: (farmBase ? [...farmBase, 'assistant'] : ['/']) as string[],
        icon: 'chat',
      },
      {
        key: 'nav.green',
        exact: false,
        link: (farmBase ? [...farmBase, 'green'] : ['/']) as string[],
        icon: 'leaf',
      },
      { key: 'nav.settings', exact: false, link: ['/settings'] as string[], icon: 'settings' },
    ];
  });
}
