/** Admin session only — never reuse farmer OTP tokens. */
const ADMIN_TOKEN_KEY = 'hv_admin_token';
const ADMIN_USER_KEY = 'hv_admin_user';

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  } catch {
    // ignore
  }
}

export function getStoredAdminUserJson(): string | null {
  try {
    return localStorage.getItem(ADMIN_USER_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminUserJson(json: string): void {
  localStorage.setItem(ADMIN_USER_KEY, json);
}
