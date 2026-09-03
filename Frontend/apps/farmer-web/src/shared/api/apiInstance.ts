import { ApiClient } from '@hv/api-types';

export const farmerApi = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  getToken: () => localStorage.getItem('hv_farmer_token'),
});
