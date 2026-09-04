import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { experimentalService } from '../services/experimentalService';
import type { ExperimentalOutcomeRequest } from '@hv/api-types';

export function useExperimental(farmId: string | undefined) {
  const opportunities = useQuery({
    queryKey: ['experimental-opportunities', farmId],
    queryFn: () => experimentalService.listOpportunities(farmId!),
    enabled: !!farmId,
  });
  const experiments = useQuery({
    queryKey: ['experiments', farmId],
    queryFn: () => experimentalService.listExperiments(farmId!),
    enabled: !!farmId,
  });
  return { opportunities, experiments };
}

export function useStartExperiment(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opportunityId: string) =>
      experimentalService.startExperiment(farmId, opportunityId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['experiments', farmId] });
    },
  });
}

export function useRecordOutcome(farmId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      zoneId,
      body,
    }: {
      zoneId: string;
      body: ExperimentalOutcomeRequest;
    }) => experimentalService.recordOutcome(farmId, zoneId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['experiments', farmId] });
      void qc.invalidateQueries({ queryKey: ['crop-cycles', farmId] });
    },
  });
}
