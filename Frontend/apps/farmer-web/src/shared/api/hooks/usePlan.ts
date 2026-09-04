import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Language } from '@hv/api-types';
import { planService } from '../services/planService';

export function usePlan(farmId: string | undefined) {
  return useQuery({
    queryKey: ['plan', farmId],
    queryFn: () => planService.getPlan(farmId!),
    enabled: !!farmId,
  });
}

export function usePlanHistory(farmId: string | undefined) {
  return useQuery({
    queryKey: ['plan-history', farmId],
    queryFn: () => planService.listHistory(farmId!),
    enabled: !!farmId,
  });
}

export function useGeneratePlan(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (language: Language = 'en') =>
      planService.generatePlan(farmId, language),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['plan', farmId] });
      void qc.invalidateQueries({ queryKey: ['plan-history', farmId] });
    },
  });
}
