import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { RecordActualsRequest } from '@hv/api-types';
import { cropCycleService } from '../services/cropCycleService';

export function useCropCycles(farmId: string | undefined) {
  return useQuery({
    queryKey: ['crop-cycles', farmId],
    queryFn: () => cropCycleService.list(farmId!),
    enabled: !!farmId,
  });
}

export function useRecordCycleActuals(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      cycleId,
      body,
    }: {
      cycleId: string;
      body: RecordActualsRequest;
    }) => cropCycleService.recordActuals(farmId, cycleId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['crop-cycles', farmId] });
    },
  });
}
