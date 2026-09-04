import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'hv_farmer_token';
const PROFILE_KEY = 'hv_farmer_profile';
const LANGUAGE_KEY = 'hv_farmer_language';
const PENDING_PHONE_KEY = 'hv_farmer_pending_phone';
const PENDING_REQUEST_KEY = 'hv_farmer_pending_request_id';

export type FarmerLanguage = 'en' | 'ur';

export interface FarmerProfile {
  id: string;
  phone: string;
  name?: string | null;
  language?: FarmerLanguage | string | null;
}

@Injectable({ providedIn: 'root' })
export class FarmerAuthStore {
  private readonly tokenSignal = signal<string | null>(this.read(TOKEN_KEY));
  private readonly profileSignal = signal<FarmerProfile | null>(
    this.readJson<FarmerProfile>(PROFILE_KEY),
  );
  private readonly languageSignal = signal<FarmerLanguage | null>(
    (this.read(LANGUAGE_KEY) as FarmerLanguage | null) ?? null,
  );
  private readonly pendingPhoneSignal = signal<string | null>(this.read(PENDING_PHONE_KEY));
  private readonly pendingRequestIdSignal = signal<string | null>(
    this.read(PENDING_REQUEST_KEY),
  );

  readonly token = this.tokenSignal.asReadonly();
  readonly profile = this.profileSignal.asReadonly();
  readonly language = this.languageSignal.asReadonly();
  readonly pendingPhone = this.pendingPhoneSignal.asReadonly();
  readonly pendingRequestId = this.pendingRequestIdSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  setSession(token: string, profile?: FarmerProfile | null): void {
    this.tokenSignal.set(token);
    this.write(TOKEN_KEY, token);
    if (profile) {
      this.setProfile(profile);
    }
  }

  setProfile(profile: FarmerProfile): void {
    this.profileSignal.set(profile);
    this.write(PROFILE_KEY, JSON.stringify(profile));
    if (profile.language === 'en' || profile.language === 'ur') {
      this.setLanguage(profile.language);
    }
  }

  setLanguage(language: FarmerLanguage): void {
    this.languageSignal.set(language);
    this.write(LANGUAGE_KEY, language);
  }

  setPendingOtp(phone: string, requestId: string): void {
    this.pendingPhoneSignal.set(phone);
    this.pendingRequestIdSignal.set(requestId);
    this.write(PENDING_PHONE_KEY, phone);
    this.write(PENDING_REQUEST_KEY, requestId);
  }

  clearPendingOtp(): void {
    this.pendingPhoneSignal.set(null);
    this.pendingRequestIdSignal.set(null);
    localStorage.removeItem(PENDING_PHONE_KEY);
    localStorage.removeItem(PENDING_REQUEST_KEY);
  }

  clear(): void {
    this.tokenSignal.set(null);
    this.profileSignal.set(null);
    this.clearPendingOtp();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private readJson<T>(key: string): T | null {
    const raw = this.read(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* ignore quota */
    }
  }
}
