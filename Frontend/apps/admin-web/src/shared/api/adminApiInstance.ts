import { ApiClient } from '@hv/api-types';

const TOKEN_KEY = 'hv_admin_token';

export const adminApi = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  getToken: () => localStorage.getItem(TOKEN_KEY),
});
