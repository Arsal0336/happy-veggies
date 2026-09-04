import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvInput } from '../../../shared/ui/hv-input';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvAlert } from '../../../shared/ui/hv-alert';
import { AdminApiService } from '../../../core/api/admin.service';
import { AdminAuthStore } from '../../../core/auth/admin-auth.store';

@Component({
  selector: 'app-admin-login-page',
  imports: [TranslatePipe, PageHeader, HvInput, HvButton, HvAlert],
  template: `
    <div class="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-10">
      <p class="mb-2 font-display text-3xl font-semibold text-primary-700">{{ 'common.appName' | translate }}</p>
      <hv-page-header titleKey="auth.adminLogin" subtitleKey="auth.adminDemoHint" />
      <form class="space-y-4" (submit)="$event.preventDefault(); login()">
        <hv-input labelKey="auth.adminEmail" type="email" [(value)]="email" autocomplete="username" />
        <hv-input labelKey="auth.adminPassword" type="password" [(value)]="password" autocomplete="current-password" />
        @if (error()) {
          <hv-alert tone="error">{{ error() }}</hv-alert>
        }
        <hv-button type="submit" labelKey="auth.adminSubmit" [loading]="loading()" />
      </form>
    </div>
  `,
})
export class AdminLoginPage {
  private readonly api = inject(AdminApiService);
  private readonly auth = inject(AdminAuthStore);
  private readonly router = inject(Router);

  readonly email = signal('admin@happyveggie.pk');
  readonly password = signal('HappyVeggie!2026');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async login(): Promise<void> {
    if (!this.email().trim() || !this.password()) {
      this.error.set('Email and password required');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.api.login({ email: this.email().trim(), password: this.password() }),
      );
      this.auth.setSession(res.sessionToken, res.admin);
      await this.router.navigateByUrl('/admin');
    } catch (e: any) {
      this.error.set(e?.error?.message || e?.message || 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}
