import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PageHeader } from '../../../shared/ui/page-header';
import { HvInput } from '../../../shared/ui/hv-input';
import { HvButton } from '../../../shared/ui/hv-button';
import { HvAlert } from '../../../shared/ui/hv-alert';
import { AuthApiService } from '../../../core/api/auth.service';
import { FarmerAuthStore } from '../../../core/auth/farmer-auth.store';
import { LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-profile-page',
  imports: [PageHeader, HvInput, HvButton, HvAlert],
  template: `
    <div class="hv-page py-8">
      <hv-page-header titleKey="auth.profile" />
      <form class="space-y-4" (submit)="$event.preventDefault(); save()">
        <hv-input labelKey="auth.profileName" [(value)]="name" autocomplete="name" />
        @if (errorKey()) {
          <hv-alert tone="error" [messageKey]="errorKey()" />
        }
        <hv-button type="submit" labelKey="common.continue" [loading]="loading()" />
      </form>
    </div>
  `,
})
export class ProfilePage {
  private readonly api = inject(AuthApiService);
  private readonly auth = inject(FarmerAuthStore);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  readonly name = signal(this.auth.profile()?.name || '');
  readonly loading = signal(false);
  readonly errorKey = signal<string | null>(null);

  async save(): Promise<void> {
    if (!this.name().trim()) {
      this.errorKey.set('auth.nameRequired');
      return;
    }
    this.loading.set(true);
    this.errorKey.set(null);
    try {
      const farmer = await firstValueFrom(
        this.api.updateProfile({
          name: this.name().trim(),
          language: this.language.current(),
        }),
      );
      this.auth.setProfile(farmer);
      await this.router.navigateByUrl('/');
    } catch {
      this.errorKey.set('common.error');
    } finally {
      this.loading.set(false);
    }
  }
}
