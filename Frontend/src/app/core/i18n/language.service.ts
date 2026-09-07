import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FarmerAuthStore, FarmerLanguage } from '../auth/farmer-auth.store';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly farmerAuth = inject(FarmerAuthStore);

  init(): void {
    const stored = this.farmerAuth.language();
    const lang: FarmerLanguage = stored === 'ur' ? 'ur' : 'en';
    this.apply(lang, false);
  }

  current(): FarmerLanguage {
    const lang = this.translate.getCurrentLang() || this.farmerAuth.language() || 'en';
    return lang === 'ur' ? 'ur' : 'en';
  }

  setLanguage(lang: FarmerLanguage): void {
    this.apply(lang, true);
  }

  private apply(lang: FarmerLanguage, persist: boolean): void {
    this.translate.use(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    if (persist) {
      this.farmerAuth.setLanguage(lang);
    }
  }
}
