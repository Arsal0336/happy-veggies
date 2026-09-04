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
    :host {
      display: block;
      min-height: 100%;
      --hv-shell-header: 3.35rem;
      --hv-shell-nav: 4.35rem;
    }
    .shell {
      display: flex;
      min-height: 100dvh;
      flex-direction: column;
      background:
        radial-gradient(ellipse 90% 50% at 50% -10%, rgb(31 92 50 / 0.1), transparent 55%),
        linear-gradient(180deg, #f4f8f5 0%, var(--hv-color-bg) 40%);
    }
    .shell__top {
      position: fixed;
      inset-inline: 0;
      top: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      min-height: var(--hv-shell-header);
      padding:
        max(0.55rem, env(safe-area-inset-top))
        1rem
        0.55rem;
      border-bottom: 1px solid rgb(15 46 26 / 0.08);
      background: rgb(255 255 255 / 0.88);
      backdrop-filter: saturate(1.2) blur(16px);
      -webkit-backdrop-filter: saturate(1.2) blur(16px);
      box-shadow: 0 1px 0 rgb(255 255 255 / 0.6), 0 8px 24px rgb(15 46 26 / 0.05);
    }
    .shell__brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      min-width: 0;
      text-decoration: none;
      color: inherit;
    }
    .shell__mark {
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      flex-shrink: 0;
      border-radius: 0.65rem;
      background: linear-gradient(145deg, var(--hv-color-primary-500), var(--hv-color-primary-700));
      color: #fff;
      box-shadow: 0 4px 10px rgb(31 92 50 / 0.28);
    }
    .shell__mark svg {
      width: 1.1rem;
      height: 1.1rem;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.9;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .shell__brand-text {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.05rem;
    }
    .shell__title {
      margin: 0;
      font-family: var(--hv-font-display);
      font-size: 1.05rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--hv-color-primary-900);
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .shell__subtitle {
      margin: 0;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--hv-color-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .shell__main {
      flex: 1;
      min-height: 0;
      padding-top: calc(var(--hv-shell-header) + env(safe-area-inset-top, 0px));
      padding-bottom: calc(var(--hv-shell-nav) + env(safe-area-inset-bottom, 0px) + 0.75rem);
    }
    .shell__nav {
      position: fixed;
      inset-inline: 0;
      bottom: 0;
      z-index: 50;
      border-top: 1px solid rgb(15 46 26 / 0.08);
      background: rgb(255 255 255 / 0.92);
      backdrop-filter: saturate(1.2) blur(16px);
      -webkit-backdrop-filter: saturate(1.2) blur(16px);
      box-shadow: 0 -10px 30px rgb(15 46 26 / 0.08);
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }
    .shell__list {
      margin: 0 auto;
      display: flex;
      max-width: 36rem;
      list-style: none;
      padding: 0.4rem 0.45rem 0.45rem;
      gap: 0.15rem;
    }
    .shell__link {
      position: relative;
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
      padding: 0.5rem 0.2rem 0.4rem;
      border-radius: 0.85rem;
      color: var(--hv-color-text-muted);
      text-decoration: none;
      font-size: 0.66rem;
      font-weight: 650;
      letter-spacing: 0.01em;
      transition: background var(--hv-transition-fast), color var(--hv-transition-fast), transform var(--hv-transition-fast);
      -webkit-tap-highlight-color: transparent;
    }
    .shell__link:hover {
      background: var(--hv-color-primary-50);
      color: var(--hv-color-primary-800);
    }
    .shell__link:active { transform: scale(0.97); }
    .shell__link--active {
      color: var(--hv-color-primary-700);
      background: var(--hv-color-primary-50);
    }
    .shell__link--active::before {
      content: '';
      position: absolute;
      top: 0.2rem;
      width: 1rem;
      height: 0.18rem;
      border-radius: 999px;
      background: var(--hv-color-primary-500);
    }
    .shell__icon {
      width: 1.35rem;
      height: 1.35rem;
    }
    .shell__icon svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.85;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    @media (min-width: 768px) {
      .shell__top,
      .shell__nav {
        backdrop-filter: saturate(1.15) blur(18px);
      }
      .shell__list { max-width: 42rem; }
    }
  `,
  template: `
    <div class="shell">
      <header class="shell__top">
        <a routerLink="/" class="shell__brand" [attr.aria-label]="'common.appName' | translate">
          <span class="shell__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 21c-4-3.2-7-6.2-7-10a7 7 0 0 1 14 0c0 3.8-3 6.8-7 10Z" />
              <path d="M12 11v4" />
            </svg>
          </span>
          <span class="shell__brand-text">
            <p class="shell__title">{{ 'common.appName' | translate }}</p>
            <p class="shell__subtitle">{{ contextKey() | translate }}</p>
          </span>
        </a>
      </header>

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

  readonly contextKey = computed(() => {
    const path = this.url();
    if (path.includes('/plan')) return 'nav.plan';
    if (path.includes('/assistant')) return 'nav.assistant';
    if (path.includes('/green')) return 'nav.green';
    if (path.includes('/settings')) return 'nav.settings';
    if (path.includes('/areas') || path.includes('/zones')) return 'nav.areas';
    if (path.includes('/graphic')) return 'nav.graphic';
    if (path.includes('/alerts')) return 'nav.alerts';
    if (path.includes('/economics')) return 'nav.economics';
    if (path.includes('/water')) return 'nav.water';
    if (path.includes('/soil')) return 'nav.soil';
    if (path.includes('/weather')) return 'nav.weather';
    if (path.match(/\/farms\/[^/]+$/)) return 'nav.home';
    if (path.includes('/farms/new')) return 'nav.farms';
    return 'nav.farms';
  });

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
