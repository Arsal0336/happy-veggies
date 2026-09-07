import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { HvButton } from '../../../shared/ui/hv-button';
import { LanguageService } from '../../../core/i18n/language.service';
import { FarmerAuthStore, FarmerLanguage } from '../../../core/auth/farmer-auth.store';

@Component({
  selector: 'app-lang-page',
  imports: [TranslatePipe, HvButton],
  styles: `
    .hero {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1.5rem 1.25rem 2rem;
      background:
        linear-gradient(180deg, rgb(12 36 21 / 0.15), rgb(12 36 21 / 0.72)),
        radial-gradient(ellipse at 30% 20%, rgb(61 158 88 / 0.45), transparent 50%),
        linear-gradient(160deg, #1f5c32 0%, #0c2415 55%, #15201a 100%);
      color: #fff;
    }
    .hero__brand {
      font-family: var(--hv-font-display);
      font-size: clamp(2.4rem, 8vw, 3.4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.05;
      margin: 0 0 0.75rem;
      animation: hv-rise 500ms ease both;
    }
    .hero__tag {
      max-width: 22rem;
      margin: 0 0 1.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: rgb(255 255 255 / 0.88);
      animation: hv-rise 600ms ease 80ms both;
    }
    .panel {
      background: rgb(255 255 255 / 0.96);
      color: var(--hv-color-text);
      border-radius: 1.25rem;
      padding: 1.1rem;
      box-shadow: var(--hv-shadow-lg);
      animation: hv-rise 650ms ease 120ms both;
    }
    .choice {
      width: 100%;
      text-align: start;
      border: 1px solid var(--hv-color-border);
      background: #fff;
      border-radius: 0.9rem;
      padding: 0.9rem 1rem;
      cursor: pointer;
      transition: border-color 140ms ease, box-shadow 140ms ease;
    }
    .choice--on {
      border-color: var(--hv-color-primary-500);
      box-shadow: 0 0 0 3px rgb(31 92 50 / 0.15);
    }
  `,
  template: `
    <div class="hero">
      <h1 class="hero__brand">{{ 'common.appName' | translate }}</h1>
      <p class="hero__tag">{{ 'lang.tagline' | translate }}</p>

      <div class="panel space-y-3">
        <p class="text-sm font-semibold text-muted">{{ 'lang.title' | translate }}</p>
        <div class="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            class="choice"
            [class.choice--on]="selected() === 'en'"
            (click)="pick('en')"
          >
            <p class="font-semibold">{{ 'lang.english' | translate }}</p>
            <p class="text-xs text-muted">{{ 'lang.subtitle' | translate }} · LTR</p>
          </button>
          <button
            type="button"
            class="choice font-urdu"
            [class.choice--on]="selected() === 'ur'"
            (click)="pick('ur')"
          >
            <p class="font-semibold">{{ 'lang.urdu' | translate }}</p>
            <p class="text-xs text-muted">RTL</p>
          </button>
        </div>
        <hv-button class="mt-2 w-full" labelKey="common.continue" (pressed)="continue()" />
      </div>
    </div>
  `,
})
export class LangPage {
  private readonly language = inject(LanguageService);
  private readonly auth = inject(FarmerAuthStore);
  private readonly router = inject(Router);
  readonly selected = signal<FarmerLanguage>(this.language.current());

  pick(lang: FarmerLanguage): void {
    this.selected.set(lang);
    this.language.setLanguage(lang);
  }

  continue(): void {
    this.language.setLanguage(this.selected());
    void this.router.navigateByUrl(this.auth.isAuthenticated() ? '/' : '/auth/phone');
  }
}
