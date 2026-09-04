import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvInput } from '../../../shared/ui/hv-input';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvAlert } from '../../../shared/ui/hv-alert';
import { AuthApiService } from '../../../core/api/auth.service';
import { FarmerAuthStore } from '../../../core/auth/farmer-auth.store';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-phone-page',
  imports: [TranslatePipe, PageHeader, HvInput, HvButton, HvAlert],
  template: `
    <div class="hv-page py-8">
      <p class="mb-4 font-display text-2xl font-semibold text-primary-700">
        {{ 'common.appName' | translate }}
      </p>
      <hv-page-header titleKey="auth.subtitle" subtitleKey="auth.phoneLead" />
      <form class="space-y-4" (submit)="$event.preventDefault(); send()">
        <hv-input
          labelKey="auth.phone"
          [placeholder]="'auth.phonePlaceholder' | translate"
          [(value)]="phone"
          autocomplete="tel"
        />
        <p class="text-xs text-muted">{{ 'auth.demoHint' | translate }}</p>
        @if (errorKey()) {
          <hv-alert tone="error" [messageKey]="errorKey()" />
        }
        <hv-button type="submit" labelKey="auth.sendOtp" [loading]="loading()" />
      </form>
    </div>
  `,
})
export class PhonePage {
  private readonly api = inject(AuthApiService);
  private readonly auth = inject(FarmerAuthStore);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  readonly phone = signal('+923001234567');
  readonly loading = signal(false);
  readonly errorKey = signal<string | null>(null);

  async send(): Promise<void> {
    const phone = this.phone().trim();
    if (!phone) {
      this.errorKey.set('auth.phoneRequired');
      return;
    }
    this.loading.set(true);
    this.errorKey.set(null);
    try {
      const res = await firstValueFrom(this.api.requestOtp(phone, this.language.current()));
      this.auth.setPendingOtp(phone, res.requestId);
      await this.router.navigateByUrl('/auth/otp');
    } catch {
      this.errorKey.set('auth.otpFailed');
    } finally {
      this.loading.set(false);
    }
  }
}
