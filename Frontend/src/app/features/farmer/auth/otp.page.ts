import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvInput } from '../../../shared/ui/hv-input';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvAlert } from '../../../shared/ui/hv-alert';
import { AuthApiService } from '../../../core/api/auth.service';
import { FarmerAuthStore } from '../../../core/auth/farmer-auth.store';

@Component({
  selector: 'app-otp-page',
  imports: [TranslatePipe, PageHeader, HvInput, HvButton, HvAlert],
  template: `
    <div class="hv-page py-8">
      <hv-page-header
        titleKey="auth.otp"
        [subtitle]="'auth.otpSentTo' | translate: { phone: phone }"
      />
      <p class="mb-4 text-xs text-muted">{{ 'auth.demoHint' | translate }}</p>
      <form class="space-y-4" (submit)="$event.preventDefault(); verify()">
        <hv-input labelKey="auth.otp" [(value)]="code" autocomplete="one-time-code" />
        @if (errorKey()) {
          <hv-alert tone="error" [messageKey]="errorKey()" />
        }
        <hv-button type="submit" labelKey="auth.verifyOtp" [loading]="loading()" />
        <hv-button
          type="button"
          variant="ghost"
          labelKey="auth.changePhone"
          (pressed)="goPhone()"
        />
      </form>
    </div>
  `,
})
export class OtpPage implements OnInit {
  private readonly api = inject(AuthApiService);
  private readonly auth = inject(FarmerAuthStore);
  private readonly router = inject(Router);

  phone = '';
  readonly code = signal('1234');
  readonly loading = signal(false);
  readonly errorKey = signal<string | null>(null);

  ngOnInit(): void {
    this.phone = this.auth.pendingPhone() || '';
    if (!this.phone && !this.auth.isAuthenticated()) {
      void this.router.navigateByUrl('/auth/phone');
      return;
    }
    if (this.auth.isAuthenticated() && !this.phone) {
      void this.router.navigateByUrl('/');
    }
  }

  goPhone(): void {
    void this.router.navigateByUrl('/auth/phone');
  }

  async verify(): Promise<void> {
    const requestId = this.auth.pendingRequestId();
    if (!this.phone || !requestId) {
      await this.router.navigateByUrl('/auth/phone');
      return;
    }
    if (!this.code().trim()) {
      this.errorKey.set('auth.codeRequired');
      return;
    }
    this.loading.set(true);
    this.errorKey.set(null);
    try {
      const res = await firstValueFrom(
        this.api.verifyOtp(this.phone, this.code().trim(), requestId),
      );
      this.auth.setSession(res.sessionToken, res.farmer);
      this.auth.clearPendingOtp();
      if (res.isNewUser || !res.farmer?.name) {
        await this.router.navigateByUrl('/auth/profile');
      } else {
        await this.router.navigateByUrl('/');
      }
    } catch {
      this.errorKey.set('auth.verifyFailed');
    } finally {
      this.loading.set(false);
    }
  }
}
