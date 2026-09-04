/** Farmer token + profile in localStorage; clear + redirect on 401. */

import type { FarmerSummary } from '@hv/api-types';

const TOKEN_KEY = 'hv_farmer_token';
const PROFILE_KEY = 'hv_farmer_profile';
const LANG_KEY = 'hv_farmer_language';
const PENDING_PHONE_KEY = 'hv_farmer_pending_phone';
const PENDING_REQUEST_KEY = 'hv_farmer_pending_otp_request';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getFarmerProfile(): FarmerSummary | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FarmerSummary;
  } catch {
    return null;
  }
}

export function setFarmerProfile(farmer: FarmerSummary): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(farmer));
}

export function getStoredLanguage(): 'en' | 'ur' | null {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === 'ur' || v === 'en' ? v : null;
  } catch {
    return null;
  }
}

export function setStoredLanguage(lang: 'en' | 'ur'): void {
  localStorage.setItem(LANG_KEY, lang);
}

export function setPendingOtp(phone: string, requestId: string): void {
  sessionStorage.setItem(PENDING_PHONE_KEY, phone);
  sessionStorage.setItem(PENDING_REQUEST_KEY, requestId);
}

export function getPendingOtp(): { phone: string; requestId: string } | null {
  const phone = sessionStorage.getItem(PENDING_PHONE_KEY);
  const requestId = sessionStorage.getItem(PENDING_REQUEST_KEY);
  if (!phone || !requestId) return null;
  return { phone, requestId };
}

export function clearPendingOtp(): void {
  sessionStorage.removeItem(PENDING_PHONE_KEY);
  sessionStorage.removeItem(PENDING_REQUEST_KEY);
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
  clearPendingOtp();
}

/** Clear session and send farmer back to OTP phone entry. */
export function handleUnauthorized(): void {
  clearAuthSession();
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (!path.startsWith('/auth') && path !== '/lang') {
      window.location.assign('/auth/phone');
    }
  }
}
