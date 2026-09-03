import { farmerApi } from '../apiInstance';
import { fixtureAlerts } from '@hv/api-types';
import type { Alert } from '@hv/api-types';

const USE_FIXTURES = !import.meta.env.VITE_API_BASE_URL;

export const alertService = {
  listAlerts: async (): Promise<Alert[]> => {
    if (USE_FIXTURES) return fixtureAlerts;
    const res = await farmerApi.get<{ items: Alert[] }>('/alerts');
    return res.items;
  },
};
