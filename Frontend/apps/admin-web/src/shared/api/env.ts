/** Environment — admin SPA only; never reuse farmer session tokens. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const APP_ENV = import.meta.env.VITE_APP_ENV || 'development';

/** Fixtures only when explicitly enabled (tests stub this to `'true'`). */
export function useFixtures(): boolean {
  return import.meta.env.VITE_USE_FIXTURES === 'true';
}
