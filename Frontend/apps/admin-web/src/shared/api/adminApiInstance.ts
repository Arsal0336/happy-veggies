import { ApiClient } from '@hv/api-types';
import { API_BASE_URL } from './env';
import { clearAdminToken, getAdminToken } from './authStorage';

function redirectToLogin(): void {
  clearAdminToken();
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;
  window.location.assign('/login');
}

/** Admin-scoped API client — separate bearer from farmer app. */
export const adminApi = new ApiClient(
  API_BASE_URL,
  () => getAdminToken(),
  redirectToLogin,
);

export { adminApi as adminApiInstance };
