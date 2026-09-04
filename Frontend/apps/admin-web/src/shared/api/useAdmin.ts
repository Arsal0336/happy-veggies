import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as adminService from './adminService';
import type {
  CreateAreaTypeInput,
  CreateCropInput,
  CreateGovernmentRateInput,
  CreateSeedVarietyInput,
  PlanReviewAction,
  UpdateAreaTypeInput,
  UpdateCropInput,
  UpdateGovernmentRateInput,
  UpdateSeedVarietyInput,
  UpsertCompatibilityInput,
} from '../types';

export const adminKeys = {
  me: ['admin', 'me'] as const,
  metrics: ['admin', 'metrics'] as const,
  analytics: ['admin', 'analytics'] as const,
  farmers: (q?: string) => ['admin', 'farmers', q ?? ''] as const,
  farmer: (id: string) => ['admin', 'farmer', id] as const,
  farmTwin: (farmId: string) => ['admin', 'farmTwin', farmId] as const,
  crops: ['admin', 'crops'] as const,
  seedVarieties: ['admin', 'seedVarieties'] as const,
  areaTypes: ['admin', 'areaTypes'] as const,
  compatibility: ['admin', 'compatibility'] as const,
  rates: ['admin', 'rates'] as const,
  plans: (flagged?: boolean) => ['admin', 'plans', !!flagged] as const,
  flags: ['admin', 'flags'] as const,
  audit: ['admin', 'audit'] as const,
};

export function useAdminMetrics() {
  return useQuery({
    queryKey: adminKeys.metrics,
    queryFn: () => adminService.getMetrics(),
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics,
    queryFn: () => adminService.getAnalyticsStats(),
  });
}

export function useAdminFarmers(q?: string) {
  return useQuery({
    queryKey: adminKeys.farmers(q),
    queryFn: () => adminService.listFarmers({ q }),
  });
}

export function useAdminFarmer(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.farmer(id ?? ''),
    queryFn: () => adminService.getFarmer(id!),
    enabled: !!id,
  });
}

export function useAdminFarmTwin(farmId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.farmTwin(farmId ?? ''),
    queryFn: () => adminService.getFarmTwin(farmId!),
    enabled: !!farmId,
  });
}

export function useAdminCrops() {
  return useQuery({
    queryKey: adminKeys.crops,
    queryFn: () => adminService.listCrops(),
  });
}

export function useCreateAdminCrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCropInput) => adminService.createCrop(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.crops }),
  });
}

export function useUpdateAdminCrop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCropInput }) =>
      adminService.updateCrop(id, input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.crops }),
  });
}

export function useAdminSeedVarieties() {
  return useQuery({
    queryKey: adminKeys.seedVarieties,
    queryFn: () => adminService.listSeedVarieties(),
  });
}

export function useCreateAdminSeedVariety() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSeedVarietyInput) =>
      adminService.createSeedVariety(input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: adminKeys.seedVarieties }),
  });
}

export function useUpdateAdminSeedVariety() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateSeedVarietyInput;
    }) => adminService.updateSeedVariety(id, input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: adminKeys.seedVarieties }),
  });
}

export function useAdminAreaTypes() {
  return useQuery({
    queryKey: adminKeys.areaTypes,
    queryFn: () => adminService.listAreaTypes(),
  });
}

export function useCreateAdminAreaType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAreaTypeInput) =>
      adminService.createAreaType(input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: adminKeys.areaTypes }),
  });
}

export function useUpdateAdminAreaType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      code,
      input,
    }: {
      code: string;
      input: UpdateAreaTypeInput;
    }) => adminService.updateAreaType(code, input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: adminKeys.areaTypes }),
  });
}

export function useAdminCompatibility() {
  return useQuery({
    queryKey: adminKeys.compatibility,
    queryFn: () => adminService.listCompatibility(),
  });
}

export function useUpsertAdminCompatibility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertCompatibilityInput) =>
      adminService.upsertCompatibility(input),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: adminKeys.compatibility }),
  });
}

export function useAdminRates() {
  return useQuery({
    queryKey: adminKeys.rates,
    queryFn: () => adminService.listRates(),
  });
}

export function useCreateAdminRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGovernmentRateInput) =>
      adminService.createRate(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.rates });
    },
  });
}

export function useUpdateAdminRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateGovernmentRateInput;
    }) => adminService.updateRate(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.rates });
    },
  });
}

export function useAdminPlans(flaggedOnly = false) {
  return useQuery({
    queryKey: adminKeys.plans(flaggedOnly),
    queryFn: () => adminService.listPlans(flaggedOnly),
  });
}

export function useReviewAdminPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      action,
      note,
    }: {
      planId: string;
      action: PlanReviewAction;
      note?: string;
    }) => adminService.reviewPlan(planId, action, note),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'plans'] });
    },
  });
}

export function useAdminFlags() {
  return useQuery({
    queryKey: adminKeys.flags,
    queryFn: () => adminService.listFlags(),
  });
}

export function useToggleAdminFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      adminService.toggleFlag(key, enabled),
    onSuccess: (data) => {
      qc.setQueryData(adminKeys.flags, data);
    },
  });
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: adminKeys.audit,
    queryFn: () => adminService.listAuditLogs(),
  });
}
