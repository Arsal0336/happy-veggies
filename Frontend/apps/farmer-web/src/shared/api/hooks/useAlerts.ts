import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alertService } from '../services/alertService';

export function useAlerts(farmId?: string) {
  return useQuery({
    queryKey: ['alerts', farmId ?? 'all'],
    queryFn: () => alertService.listAlerts(farmId),
  });
}

export function useMarkAlertRead(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => alertService.markRead(farmId, alertId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['alerts', farmId] });
      void qc.invalidateQueries({ queryKey: ['alerts', 'all'] });
    },
  });
}
