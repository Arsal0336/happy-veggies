import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'hv_admin_token';
const USER_KEY = 'hv_admin_user';

export interface AdminUser {
  id: string;
  email: string;
  displayName?: string | null;
  role?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthStore {
  private readonly tokenSignal = signal<string | null>(this.read(TOKEN_KEY));
  private readonly userSignal = signal<AdminUser | null>(this.readJson<AdminUser>(USER_KEY));

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  setSession(token: string, user: AdminUser): void {
    this.tokenSignal.set(token);
    this.userSignal.set(user);
    this.write(TOKEN_KEY, token);
    this.write(USER_KEY, JSON.stringify(user));
  }

  setUser(user: AdminUser): void {
    this.userSignal.set(user);
    this.write(USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
      /* ignore */
    }
  }
}
