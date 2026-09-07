import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvSelect } from '../../../shared/ui/hv-select';
import { LanguageService } from '../../../core/i18n/language.service';
import { FontService, UrduFontId } from '../../../core/i18n/font.service';
import { FarmerAuthStore } from '../../../core/auth/farmer-auth.store';
import { AuthApiService } from '../../../core/api/auth.service';

@Component({
  selector: 'app-settings-page',
  imports: [TranslatePipe, PageHeader, HvCard, HvButton, HvSelect],
  template: `
    <div class="hv-page">
      <hv-page-header titleKey="settings.title" subtitleKey="settings.languageHint" />
      <div class="space-y-4">
        <hv-card>
          <p class="mb-2 font-semibold">{{ 'common.language' | translate }}</p>
          <p class="mb-3 text-sm text-muted">{{ 'settings.languageHint' | translate }}</p>
          <div class="flex gap-2">
            <hv-button
              [variant]="language.current() === 'en' ? 'primary' : 'secondary'"
              labelKey="lang.english"
              (pressed)="setLang('en')"
            />
            <hv-button
              [variant]="language.current() === 'ur' ? 'primary' : 'secondary'"
              labelKey="lang.urdu"
              (pressed)="setLang('ur')"
            />
          </div>
        </hv-card>
        <hv-card>
          <hv-select
            labelKey="settings.urduFont"
            [options]="fontOptions"
            [(value)]="fontValue"
            (valueChange)="setFont($event)"
          />
        </hv-card>
        <hv-card>
          <p class="mb-2 font-semibold">{{ 'settings.account' | translate }}</p>
          <p class="mb-3 text-sm text-muted">
            {{ auth.profile()?.name || auth.profile()?.phone }}
          </p>
          <hv-button variant="danger" labelKey="common.logout" (pressed)="logout()" />
        </hv-card>
      </div>
    </div>
  `,
})
export class SettingsPage {
  readonly language = inject(LanguageService);
  readonly font = inject(FontService);
  readonly auth = inject(FarmerAuthStore);
  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly fontValue = signal<string>(this.font.font());

  readonly fontOptions = [
    { value: 'noto', labelKey: 'font.noto' },
    { value: 'mehr', labelKey: 'font.mehr' },
    { value: 'jameel', labelKey: 'font.jameel' },
  ];

  setLang(lang: 'en' | 'ur'): void {
    this.language.setLanguage(lang);
  }

  setFont(id: string): void {
    this.fontValue.set(id);
    this.font.setFont(id as UrduFontId);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.api.logout());
    } catch {
      /* ignore */
    }
    this.auth.clear();
    await this.router.navigateByUrl('/auth/phone');
  }
}
