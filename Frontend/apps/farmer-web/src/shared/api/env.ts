/** Environment — safe frontend-only config (no secrets). */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

/** Fixture mode only when explicitly enabled (tests set VITE_USE_FIXTURES=true). */
export function useFixtures(): boolean {
  return import.meta.env.VITE_USE_FIXTURES === 'true';
}
