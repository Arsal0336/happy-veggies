import type {
  AdminUser,
  AuditLogEntry,
  CompatibilityRelation,
  FeatureFlag,
  Language,
  PlanSection,
} from '@hv/api-types';

export type { AdminUser, AuditLogEntry, FeatureFlag };

/** Matches GET /admin/metrics */
export type AdminMetrics = {
  farmers: number;
  farms: number;
  plans: number;
  activeThreads: number;
};

/** Matches GET /admin/farmers item */
export type AdminFarmerListItem = {
  id: string;
  phone: string;
  name?: string | null;
  language: Language;
  createdAt?: string;
};

export type AdminFarmSummary = {
  id: string;
  name: string;
  regionLabel?: string;
  areaAcres?: number;
  areaLabel?: string;
  createdAt?: string;
};

/** Normalized farmer detail for UI (from { farmer, farms }) */
export type AdminFarmerDetail = AdminFarmerListItem & {
  farms: AdminFarmSummary[];
  /** Plans are not returned by current BE detail endpoint */
  plans: Array<{
    id: string;
    farmId: string;
    version: number;
    createdAt: string;
    language: Language;
    summary?: string;
  }>;
};

/** UI-normalized government rate (from GovernmentCropRate entity) */
export type GovernmentRate = {
  id: string;
  cropId: string;
  cropName?: string;
  amount: number;
  currency: string;
  unit: string;
  periodLabel: string;
  sourceLabel?: string | null;
  isActive?: boolean;
  label: 'historical_reference';
  effectiveFrom?: string;
  effectiveTo?: string | null;
};

export type CreateGovernmentRateInput = {
  cropId: string;
  unit?: string;
  ratePerUnit: number;
  currency?: string;
  period: string;
  sourceLabel?: string;
};

export type UpdateGovernmentRateInput = {
  ratePerUnit?: number;
  unit?: string;
  currency?: string;
  period?: string;
  sourceLabel?: string;
  isActive?: boolean;
};

export type CatalogCrop = {
  id: string;
  name: string;
  nameUr?: string;
  category?: string;
  enabled?: boolean;
};

export type CatalogSeedVariety = {
  id: string;
  name: string;
  nameUr?: string;
  cropId: string;
  cropName?: string;
  enabled?: boolean;
};

export type CatalogAreaType = {
  id: string;
  code: string;
  label: string;
  nameUr?: string;
  category: string;
  enabled?: boolean;
};

export type CompatibilityPairDto = {
  id: string;
  cropA: string;
  cropB: string;
  relation: CompatibilityRelation;
  reason?: string;
  enabled?: boolean;
};

export type CreateCropInput = {
  id: string;
  nameEn: string;
  nameUr?: string;
  enabled?: boolean;
};

export type UpdateCropInput = {
  nameEn?: string;
  nameUr?: string;
  enabled?: boolean;
};

export type CreateSeedVarietyInput = {
  id: string;
  cropId: string;
  nameEn: string;
  nameUr?: string;
  enabled?: boolean;
};

export type UpdateSeedVarietyInput = {
  cropId?: string;
  nameEn?: string;
  nameUr?: string;
  enabled?: boolean;
};

export type CreateAreaTypeInput = {
  code: string;
  nameEn: string;
  nameUr?: string;
  category?: string;
  enabled?: boolean;
};

export type UpdateAreaTypeInput = {
  nameEn?: string;
  nameUr?: string;
  category?: string;
  enabled?: boolean;
};

export type UpsertCompatibilityInput = {
  id?: string;
  cropAId: string;
  cropBId: string;
  relation?: CompatibilityRelation;
  reason?: string;
  enabled?: boolean;
};

export type PlanReviewAction = 'approve' | 'flag' | 'dismiss';

export type AdminPlanReviewItem = {
  id: string;
  farmId: string;
  farmerId: string;
  farmerName: string;
  flagged: boolean;
  reviewStatus?: string;
  title: string;
  sections: Array<{ id: string; title: string; body: string }>;
  version?: number;
  language?: string;
  createdAt?: string;
};

export type AdminFarmTwinFixture = {
  farmId: string;
  farmName: string;
  weather?: string;
  water?: string;
  greenScore?: number;
  yieldSummary?: string;
  areas: Array<{
    id: string;
    name: string;
    type: 'open_field' | 'shed' | 'greenhouse' | 'tunnel' | 'experimental';
    relativeSize: number;
  }>;
  zones: Array<{
    id: string;
    areaId: string;
    cropName: string;
    stage: string;
  }>;
  neighbourEdges?: Array<{
    fromZoneId: string;
    toZoneId: string;
    relation: string;
  }>;
};

export type AnalyticsStat = {
  id: string;
  label: string;
  value: string | number;
  barPercent?: number;
};

export type AdminAnalytics = {
  farmers: number;
  farms: number;
  plans: number;
  threads: number;
  llmUsageCount: number;
  estimatedCostUsd: number;
};

export type MetricStatView = AnalyticsStat;

export type UnavailableResult = { unavailable: true };

export function isUnavailable(value: unknown): value is UnavailableResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    'unavailable' in value &&
    (value as UnavailableResult).unavailable === true
  );
}

/** UI plan sections mapped from PlanSection (key → id). */
export type UiPlanSection = {
  id: string;
  title: string;
  body: string;
};

export function toUiPlanSections(sections: PlanSection[]): UiPlanSection[] {
  return sections.map((s) => ({
    id: s.key,
    title: s.title,
    body: s.body,
  }));
}
