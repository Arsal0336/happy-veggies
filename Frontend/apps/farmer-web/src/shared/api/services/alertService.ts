import type { Alert, FarmAlertDto } from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import { delay, fixtureAlerts } from '../fixtures';
import { mapFarmAlert } from '../mappers';

export const alertService = {
  async listAlerts(farmId?: string): Promise<Alert[]> {
    if (useFixtures()) {
      await delay();
      return fixtureAlerts.filter((a) => (farmId ? a.farmId === farmId : true));
    }
    // Live alerts are farm-scoped — no global /alerts list.
    if (!farmId) return [];
    const res = await farmerApi.get<FarmAlertDto[]>(`/farms/${farmId}/alerts`);
    return (res ?? []).map((a, i) => mapFarmAlert(a, farmId, i));
  },

  async markRead(farmId: string, alertId: string): Promise<void> {
    if (useFixtures()) {
      await delay();
      const alert = fixtureAlerts.find((a) => a.id === alertId);
      if (alert) alert.read = true;
      return;
    }
    await farmerApi.patch(`/farms/${farmId}/alerts/${alertId}/read`);
  },
};
