import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvCard } from '../../../shared/ui/hv-card';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvSelect } from '../../../shared/ui/hv-select';
import { AdminAuthStore } from '../../../core/auth/admin-auth.store';
import { AdminApiService } from '../../../core/api/admin.service';
import { LanguageService } from '../../../core/i18n/language.service';
import { FontService, UrduFontId } from '../../../core/i18n/font.service';

@Component({
  selector: 'app-admin-settings-page',
  imports: [TranslatePipe, PageHeader, HvCard, HvButton, HvSelect],
  template: `
    <div class="hv-page-wide space-y-4">
      <hv-page-header titleKey="common.settings" subtitleKey="settings.languageHint" />

      <hv-card>
        <p class="mb-2 font-semibold">{{ 'common.language' | translate }}</p>
        <div class="flex gap-2">
          <hv-button variant="secondary" labelKey="lang.english" (pressed)="setLang('en')" />
          <hv-button variant="secondary" labelKey="lang.urdu" (pressed)="setLang('ur')" />
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
        <p class="mb-3 text-sm text-muted">{{ auth.user()?.email }}</p>
        <hv-button variant="danger" labelKey="common.logout" (pressed)="logout()" />
      </hv-card>
    </div>
  `,
})
export class AdminSettingsPage {
  readonly auth = inject(AdminAuthStore);
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);
  private readonly font = inject(FontService);

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
    await this.router.navigateByUrl('/admin/login');
  }
}
