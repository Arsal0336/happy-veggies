import type { AdminLoginRequest, AdminLoginResponse, AdminUser } from '@hv/api-types';
import { adminApi } from './adminApiInstance';
import { getAdminToken } from './authStorage';
import { useFixtures } from './env';
import {
  addFixtureRate,
  fixtureAdminUser,
  fixtureAnalyticsStats,
  fixtureAreaTypes,
  fixtureAuditLogs,
  fixtureCompatibility,
  fixtureCrops,
  fixtureFarmerDetails,
  fixtureFarmers,
  fixtureFarmTwins,
  fixtureFlags,
  fixtureMetrics,
  fixturePlans,
  fixtureRates,
  fixtureSeedVarieties,
  patchFixtureRate,
  setFixtureFlag,
} from './fixtures';
import type {
  AdminFarmerDetail,
  AdminFarmTwinFixture,
  AdminFarmerListItem,
  AdminMetrics,
  AdminPlanReviewItem,
  AnalyticsStat,
  AuditLogEntry,
  CatalogAreaType,
  CatalogCrop,
  CatalogSeedVariety,
  CompatibilityPairDto,
  CreateAreaTypeInput,
  CreateCropInput,
  CreateGovernmentRateInput,
  CreateSeedVarietyInput,
  FeatureFlag,
  GovernmentRate,
  PlanReviewAction,
  UnavailableResult,
  UpdateAreaTypeInput,
  UpdateCropInput,
  UpdateGovernmentRateInput,
  UpdateSeedVarietyInput,
  UpsertCompatibilityInput,
} from '../types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function fixturesOn(): boolean {
  return useFixtures();
}

/** Fixture login: fixed credentials OR any email + password length >= 6. */
export function validateFixtureLogin(email: string, password: string): boolean {
  const trimmed = email.trim().toLowerCase();
  if (trimmed === 'admin@happyveggie.pk' && (password === 'admin123' || password === 'HappyVeggie!2026')) {
    return true;
  }
  return trimmed.includes('@') && password.length >= 6;
}

type BeAdminMe = {
  id: string;
  email: string;
  role: string;
  mfaEnabled: boolean;
};

function mapAdminUser(dto: BeAdminMe | AdminUser): AdminUser {
  if ('roles' in dto && Array.isArray(dto.roles)) {
    return dto;
  }
  const be = dto as BeAdminMe;
  return {
    id: String(be.id),
    email: be.email,
    roles: be.role ? [be.role] : ['Admin'],
  };
}

type BeMetrics = {
  farmers: number;
  farms: number;
  plans: number;
  activeThreads: number;
};

type BeFarmerRow = {
  id: string;
  phone: string;
  name?: string | null;
  language: string;
  createdAt?: string;
};

type BeFarmerDetailResponse = {
  farmer: BeFarmerRow;
  farms: Array<{
    id: string;
    name: string;
    regionLabel?: string;
    areaAcres?: number;
    createdAt?: string;
  }>;
};

type BeCrop = {
  id: string;
  nameEn: string;
  nameUr?: string;
  iconUrl?: string | null;
  enabled?: boolean;
};

type BeSeedVariety = {
  id: string;
  cropId: string;
  nameEn: string;
  nameUr?: string;
  enabled?: boolean;
};

type BeAreaType = {
  code: string;
  nameEn: string;
  nameUr?: string;
  category: number | string;
  enabled?: boolean;
};

type BeCompatibility = {
  id: string;
  cropAId: string;
  cropBId: string;
  relation: number | string;
  reason?: string;
  enabled?: boolean;
};

type BeRate = {
  id: string;
  cropId: string;
  unit: string;
  ratePerUnit: number;
  currency: string;
  period: string;
  sourceLabel?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type BePlan = {
  id: string;
  farmId: string;
  farmerId: string;
  version: number;
  language: string;
  createdAt: string;
  isFlagged?: boolean;
  reviewStatus?: string;
  reviewNote?: string | null;
  contentJson?: string | null;
};

type BeAnalytics = {
  farmers: number;
  farms: number;
  plans: number;
  threads: number;
  llmUsageCount: number;
  estimatedCostUsd: number;
};

type BeTwin = {
  farm: {
    id: string;
    name?: string | null;
    areaAcres?: number;
  };
  areas: Array<{
    id: string;
    typeCode: string;
    name?: string | null;
    areaCanonicalValue?: number;
  }>;
  zones: Array<{
    id: string;
    productionAreaId: string;
    label?: string | null;
    cropId?: string | null;
    cropFreetext?: string | null;
    growthStage?: string | null;
  }>;
  neighbourEdges: Array<{
    id: string;
    cropZoneAId: string;
    cropZoneBId: string;
    adjacencyType: string;
  }>;
  weather?: { providerStatus?: string | null } | null;
  waterSummary?: { sourceCount?: number } | null;
};

type BeAuditLog = {
  id: string;
  actorAdminId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadataJson?: string | null;
  timestamp: string;
};

const AREA_CATEGORY: Record<number, string> = {
  0: 'open',
  1: 'protected',
  2: 'experimental',
};

const COMPAT_RELATION: Record<number, CompatibilityPairDto['relation']> = {
  0: 'good',
  1: 'avoid',
  2: 'neutral',
};

function mapAreaCategory(value: number | string): string {
  if (typeof value === 'number') return AREA_CATEGORY[value] ?? String(value);
  const lower = String(value).toLowerCase();
  if (lower === 'open' || lower === '0') return 'open';
  if (lower === 'protected' || lower === '1') return 'protected';
  if (lower === 'experimental' || lower === '2') return 'experimental';
  return String(value);
}

function mapCompatRelation(
  value: number | string,
): CompatibilityPairDto['relation'] {
  if (typeof value === 'number') return COMPAT_RELATION[value] ?? 'neutral';
  const lower = String(value).toLowerCase();
  if (lower === 'good' || lower === '0') return 'good';
  if (lower === 'avoid' || lower === '1') return 'avoid';
  return 'neutral';
}

function mapRate(rate: BeRate): GovernmentRate {
  return {
    id: String(rate.id),
    cropId: rate.cropId,
    amount: Number(rate.ratePerUnit),
    currency: rate.currency || 'PKR',
    unit: rate.unit || 'kg',
    periodLabel: rate.period,
    sourceLabel: rate.sourceLabel,
    isActive: rate.isActive,
    label: 'historical_reference',
    effectiveFrom: rate.createdAt,
  };
}

function mapFarmerDetail(res: BeFarmerDetailResponse): AdminFarmerDetail {
  const { farmer, farms } = res;
  return {
    id: String(farmer.id),
    phone: farmer.phone,
    name: farmer.name,
    language: (farmer.language as AdminFarmerDetail['language']) || 'en',
    createdAt: farmer.createdAt,
    farms: (farms ?? []).map((f) => ({
      id: String(f.id),
      name: f.name,
      regionLabel: f.regionLabel,
      areaAcres: f.areaAcres,
      areaLabel:
        f.areaAcres != null ? `${f.areaAcres} acre` : undefined,
      createdAt: f.createdAt,
    })),
    plans: [],
  };
}

function metricsToAnalytics(m: AdminMetrics): AnalyticsStat[] {
  const max = Math.max(m.farmers, m.farms, m.plans, m.activeThreads, 1);
  return [
    {
      id: 'farmers',
      label: 'Farmers',
      value: m.farmers,
      barPercent: Math.min(100, (m.farmers / max) * 100),
    },
    {
      id: 'farms',
      label: 'Farms',
      value: m.farms,
      barPercent: Math.min(100, (m.farms / max) * 100),
    },
    {
      id: 'plans',
      label: 'Plans',
      value: m.plans,
      barPercent: Math.min(100, (m.plans / max) * 100),
    },
    {
      id: 'threads',
      label: 'Active threads',
      value: m.activeThreads,
      barPercent: Math.min(100, (m.activeThreads / max) * 100),
    },
  ];
}

function analyticsToStats(a: BeAnalytics): AnalyticsStat[] {
  const max = Math.max(a.farmers, a.farms, a.plans, a.threads, a.llmUsageCount, 1);
  return [
    {
      id: 'farmers',
      label: 'Farmers',
      value: a.farmers,
      barPercent: Math.min(100, (a.farmers / max) * 100),
    },
    {
      id: 'farms',
      label: 'Farms',
      value: a.farms,
      barPercent: Math.min(100, (a.farms / max) * 100),
    },
    {
      id: 'plans',
      label: 'Plans',
      value: a.plans,
      barPercent: Math.min(100, (a.plans / max) * 100),
    },
    {
      id: 'threads',
      label: 'Active threads',
      value: a.threads,
      barPercent: Math.min(100, (a.threads / max) * 100),
    },
    {
      id: 'llmUsage',
      label: 'LLM calls',
      value: a.llmUsageCount,
      barPercent: Math.min(100, (a.llmUsageCount / max) * 100),
    },
    {
      id: 'llmCost',
      label: 'Est. LLM cost (USD)',
      value: Number(a.estimatedCostUsd).toFixed(4),
      barPercent: Math.min(100, (Number(a.estimatedCostUsd) / Math.max(Number(a.estimatedCostUsd), 0.01)) * 40),
    },
  ];
}

function mapAreaTypeCode(
  code: string,
): AdminFarmTwinFixture['areas'][number]['type'] {
  const c = code.toLowerCase();
  if (c.includes('shed')) return 'shed';
  if (c.includes('green')) return 'greenhouse';
  if (c.includes('tunnel') || c.includes('poly')) return 'tunnel';
  if (c.includes('experiment')) return 'experimental';
  return 'open_field';
}

function mapTwin(dto: BeTwin): AdminFarmTwinFixture {
  const areas = dto.areas ?? [];
  const maxArea = Math.max(...areas.map((a) => Number(a.areaCanonicalValue) || 1), 1);
  return {
    farmId: String(dto.farm.id),
    farmName: dto.farm.name ?? 'Farm',
    weather: dto.weather?.providerStatus ?? undefined,
    water:
      dto.waterSummary?.sourceCount != null
        ? `${dto.waterSummary.sourceCount} water source(s)`
        : undefined,
    areas: areas.map((a) => ({
      id: String(a.id),
      name: a.name ?? a.typeCode,
      type: mapAreaTypeCode(a.typeCode),
      relativeSize: Math.max(1, Math.round(((Number(a.areaCanonicalValue) || 1) / maxArea) * 4)),
    })),
    zones: (dto.zones ?? []).map((z) => ({
      id: String(z.id),
      areaId: String(z.productionAreaId),
      cropName: z.cropFreetext || z.cropId || z.label || 'Crop',
      stage: z.growthStage || 'unknown',
    })),
    neighbourEdges: (dto.neighbourEdges ?? []).map((e) => ({
      fromZoneId: String(e.cropZoneAId),
      toZoneId: String(e.cropZoneBId),
      relation: e.adjacencyType || 'neighbour',
    })),
  };
}

function parsePlanSections(
  contentJson?: string | null,
): AdminPlanReviewItem['sections'] {
  if (!contentJson) return [];
  try {
    const parsed = JSON.parse(contentJson) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item, i) => {
        const s = (item ?? {}) as Record<string, unknown>;
        return {
          id: String(s.key ?? s.id ?? `section-${i}`),
          title: String(s.title ?? `Section ${i + 1}`),
          body: String(s.body ?? s.content ?? JSON.stringify(s)),
        };
      });
    }
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      if (Array.isArray(obj.sections)) {
        return parsePlanSections(JSON.stringify(obj.sections));
      }
      if (Array.isArray(obj.planSections)) {
        return (obj.planSections as Array<Record<string, unknown>>).map((s, i) => ({
          id: String(s.sectionId ?? s.key ?? `section-${i}`),
          title: String(s.title ?? `Section ${i + 1}`),
          body: String(s.content ?? s.body ?? ''),
        }));
      }
    }
  } catch {
    /* fall through */
  }
  return [{ id: 'content', title: 'Plan', body: contentJson }];
}

const RELATION_TO_BE: Record<CompatibilityPairDto['relation'], number> = {
  good: 0,
  avoid: 1,
  neutral: 2,
};

const CATEGORY_TO_BE: Record<string, number> = {
  open: 0,
  protected: 1,
  experimental: 2,
};

export async function loginAdmin(
  body: AdminLoginRequest,
): Promise<AdminLoginResponse> {
  if (fixturesOn()) {
    await delay();
    if (!validateFixtureLogin(body.email, body.password)) {
      throw new Error('Invalid email or password');
    }
    return {
      sessionToken: 'fixture-admin-token',
      admin: {
        ...fixtureAdminUser,
        email: body.email.trim() || fixtureAdminUser.email,
      },
    };
  }
  const res = await adminApi.post<{
    sessionToken: string;
    admin: BeAdminMe;
  }>('/admin/auth/login', body);
  return {
    sessionToken: res.sessionToken,
    admin: mapAdminUser(res.admin),
  };
}

export async function getAdminMe(): Promise<AdminUser> {
  if (fixturesOn()) {
    await delay();
    return fixtureAdminUser;
  }
  const me = await adminApi.get<BeAdminMe>('/admin/me');
  return mapAdminUser(me);
}

export async function getMetrics(): Promise<AdminMetrics> {
  if (fixturesOn()) {
    await delay();
    return fixtureMetrics;
  }
  const raw = await adminApi.get<BeMetrics>('/admin/metrics');
  return {
    farmers: raw.farmers,
    farms: raw.farms,
    plans: raw.plans,
    activeThreads: raw.activeThreads,
  };
}

/** Live: GET /admin/analytics (falls back to metrics if unavailable). */
export async function getAnalyticsStats(): Promise<AnalyticsStat[]> {
  if (fixturesOn()) {
    await delay();
    return fixtureAnalyticsStats;
  }
  try {
    const raw = await adminApi.get<BeAnalytics>('/admin/analytics');
    return analyticsToStats(raw);
  } catch {
    const metrics = await getMetrics();
    return metricsToAnalytics(metrics);
  }
}

/** Raw array from BE — not Pagination. */
export async function listFarmers(params?: {
  q?: string;
}): Promise<AdminFarmerListItem[]> {
  if (fixturesOn()) {
    await delay();
    const q = (params?.q ?? '').toLowerCase();
    return q
      ? fixtureFarmers.filter(
          (f) =>
            (f.name ?? '').toLowerCase().includes(q) ||
            f.phone.includes(q) ||
            f.id.includes(q),
        )
      : [...fixtureFarmers];
  }
  const rows = await adminApi.get<BeFarmerRow[]>('/admin/farmers', {
    params: { q: params?.q },
  });
  return (rows ?? []).map((f) => ({
    id: String(f.id),
    phone: f.phone,
    name: f.name,
    language: (f.language as AdminFarmerListItem['language']) || 'en',
    createdAt: f.createdAt,
  }));
}

export async function getFarmer(id: string): Promise<AdminFarmerDetail> {
  if (fixturesOn()) {
    await delay();
    const detail = fixtureFarmerDetails[id];
    if (!detail) throw new Error('Farmer not found');
    return detail;
  }
  const res = await adminApi.get<BeFarmerDetailResponse>(`/admin/farmers/${id}`);
  return mapFarmerDetail(res);
}

/**
 * GET /admin/farms/{farmId}/twin — admin twin inspect (no farmer ownership).
 */
export async function getFarmTwin(
  farmId: string,
): Promise<AdminFarmTwinFixture | null> {
  if (fixturesOn()) {
    await delay();
    return fixtureFarmTwins[farmId] ?? null;
  }
  const twin = await adminApi.get<BeTwin>(`/admin/farms/${encodeURIComponent(farmId)}/twin`);
  return mapTwin(twin);
}

export async function listCrops(): Promise<CatalogCrop[]> {
  if (fixturesOn()) {
    await delay();
    return [...fixtureCrops];
  }
  const rows = await adminApi.get<BeCrop[]>('/admin/crops');
  return (rows ?? []).map((c) => ({
    id: c.id,
    name: c.nameEn,
    nameUr: c.nameUr,
    enabled: c.enabled,
  }));
}

export async function createCrop(input: CreateCropInput): Promise<CatalogCrop> {
  if (fixturesOn()) {
    await delay();
    const crop: CatalogCrop = {
      id: input.id,
      name: input.nameEn,
      nameUr: input.nameUr,
      enabled: input.enabled ?? true,
    };
    fixtureCrops.push(crop);
    return crop;
  }
  const created = await adminApi.post<BeCrop>('/admin/crops', {
    id: input.id,
    nameEn: input.nameEn,
    nameUr: input.nameUr,
    enabled: input.enabled,
  });
  return {
    id: created.id,
    name: created.nameEn,
    nameUr: created.nameUr,
    enabled: created.enabled,
  };
}

export async function updateCrop(
  id: string,
  input: UpdateCropInput,
): Promise<CatalogCrop> {
  if (fixturesOn()) {
    await delay();
    const existing = fixtureCrops.find((c) => c.id === id);
    if (!existing) throw new Error('Crop not found');
    if (input.nameEn != null) existing.name = input.nameEn;
    if (input.nameUr != null) existing.nameUr = input.nameUr;
    if (input.enabled != null) existing.enabled = input.enabled;
    return { ...existing };
  }
  const updated = await adminApi.patch<BeCrop>(
    `/admin/crops/${encodeURIComponent(id)}`,
    {
      nameEn: input.nameEn,
      nameUr: input.nameUr,
      enabled: input.enabled,
    },
  );
  return {
    id: updated.id,
    name: updated.nameEn,
    nameUr: updated.nameUr,
    enabled: updated.enabled,
  };
}

export async function listSeedVarieties(): Promise<CatalogSeedVariety[]> {
  if (fixturesOn()) {
    await delay();
    return [...fixtureSeedVarieties];
  }
  const rows = await adminApi.get<BeSeedVariety[]>('/admin/seed-varieties');
  return (rows ?? []).map((v) => ({
    id: v.id,
    name: v.nameEn,
    nameUr: v.nameUr,
    cropId: v.cropId,
    cropName: v.cropId,
    enabled: v.enabled,
  }));
}

export async function createSeedVariety(
  input: CreateSeedVarietyInput,
): Promise<CatalogSeedVariety> {
  if (fixturesOn()) {
    await delay();
    const variety: CatalogSeedVariety = {
      id: input.id,
      name: input.nameEn,
      nameUr: input.nameUr,
      cropId: input.cropId,
      cropName: input.cropId,
      enabled: input.enabled ?? true,
    };
    fixtureSeedVarieties.push(variety);
    return variety;
  }
  const created = await adminApi.post<BeSeedVariety>('/admin/seed-varieties', {
    id: input.id,
    cropId: input.cropId,
    nameEn: input.nameEn,
    nameUr: input.nameUr,
    enabled: input.enabled,
  });
  return {
    id: created.id,
    name: created.nameEn,
    nameUr: created.nameUr,
    cropId: created.cropId,
    cropName: created.cropId,
    enabled: created.enabled,
  };
}

export async function updateSeedVariety(
  id: string,
  input: UpdateSeedVarietyInput,
): Promise<CatalogSeedVariety> {
  if (fixturesOn()) {
    await delay();
    const existing = fixtureSeedVarieties.find((v) => v.id === id);
    if (!existing) throw new Error('Seed variety not found');
    if (input.nameEn != null) existing.name = input.nameEn;
    if (input.nameUr != null) existing.nameUr = input.nameUr;
    if (input.cropId != null) {
      existing.cropId = input.cropId;
      existing.cropName = input.cropId;
    }
    if (input.enabled != null) existing.enabled = input.enabled;
    return { ...existing };
  }
  const updated = await adminApi.patch<BeSeedVariety>(
    `/admin/seed-varieties/${encodeURIComponent(id)}`,
    {
      cropId: input.cropId,
      nameEn: input.nameEn,
      nameUr: input.nameUr,
      enabled: input.enabled,
    },
  );
  return {
    id: updated.id,
    name: updated.nameEn,
    nameUr: updated.nameUr,
    cropId: updated.cropId,
    cropName: updated.cropId,
    enabled: updated.enabled,
  };
}

export async function listAreaTypes(): Promise<CatalogAreaType[]> {
  if (fixturesOn()) {
    await delay();
    return [...fixtureAreaTypes];
  }
  const rows = await adminApi.get<BeAreaType[]>('/admin/production-area-types');
  return (rows ?? []).map((t) => ({
    id: t.code,
    code: t.code,
    label: t.nameEn,
    nameUr: t.nameUr,
    category: mapAreaCategory(t.category),
    enabled: t.enabled,
  }));
}

export async function createAreaType(
  input: CreateAreaTypeInput,
): Promise<CatalogAreaType> {
  if (fixturesOn()) {
    await delay();
    const type: CatalogAreaType = {
      id: input.code,
      code: input.code,
      label: input.nameEn,
      nameUr: input.nameUr,
      category: input.category ?? 'open',
      enabled: input.enabled ?? true,
    };
    fixtureAreaTypes.push(type);
    return type;
  }
  const created = await adminApi.post<BeAreaType>('/admin/production-area-types', {
    code: input.code,
    nameEn: input.nameEn,
    nameUr: input.nameUr,
    category: CATEGORY_TO_BE[(input.category ?? 'open').toLowerCase()] ?? 0,
    enabled: input.enabled,
  });
  return {
    id: created.code,
    code: created.code,
    label: created.nameEn,
    nameUr: created.nameUr,
    category: mapAreaCategory(created.category),
    enabled: created.enabled,
  };
}

export async function updateAreaType(
  code: string,
  input: UpdateAreaTypeInput,
): Promise<CatalogAreaType> {
  if (fixturesOn()) {
    await delay();
    const existing = fixtureAreaTypes.find((t) => t.code === code || t.id === code);
    if (!existing) throw new Error('Area type not found');
    if (input.nameEn != null) existing.label = input.nameEn;
    if (input.nameUr != null) existing.nameUr = input.nameUr;
    if (input.category != null) existing.category = input.category;
    if (input.enabled != null) existing.enabled = input.enabled;
    return { ...existing };
  }
  const updated = await adminApi.patch<BeAreaType>(
    `/admin/production-area-types/${encodeURIComponent(code)}`,
    {
      nameEn: input.nameEn,
      nameUr: input.nameUr,
      category:
        input.category != null
          ? CATEGORY_TO_BE[input.category.toLowerCase()]
          : undefined,
      enabled: input.enabled,
    },
  );
  return {
    id: updated.code,
    code: updated.code,
    label: updated.nameEn,
    nameUr: updated.nameUr,
    category: mapAreaCategory(updated.category),
    enabled: updated.enabled,
  };
}

export async function listCompatibility(): Promise<CompatibilityPairDto[]> {
  if (fixturesOn()) {
    await delay();
    return [...fixtureCompatibility];
  }
  const rows = await adminApi.get<BeCompatibility[]>('/admin/compatibility');
  return (rows ?? []).map((p) => ({
    id: String(p.id),
    cropA: p.cropAId,
    cropB: p.cropBId,
    relation: mapCompatRelation(p.relation),
    reason: p.reason,
    enabled: p.enabled,
  }));
}

export async function upsertCompatibility(
  input: UpsertCompatibilityInput,
): Promise<CompatibilityPairDto> {
  if (fixturesOn()) {
    await delay();
    const existing = fixtureCompatibility.find(
      (p) =>
        (input.id && p.id === input.id) ||
        (p.cropA === input.cropAId && p.cropB === input.cropBId),
    );
    if (existing) {
      if (input.relation) existing.relation = input.relation;
      if (input.reason != null) existing.reason = input.reason;
      if (input.enabled != null) existing.enabled = input.enabled;
      return { ...existing };
    }
    const pair: CompatibilityPairDto = {
      id: `compat-${Date.now()}`,
      cropA: input.cropAId,
      cropB: input.cropBId,
      relation: input.relation ?? 'neutral',
      reason: input.reason,
      enabled: input.enabled ?? true,
    };
    fixtureCompatibility.push(pair);
    return pair;
  }
  const saved = await adminApi.put<BeCompatibility>('/admin/compatibility', {
    id: input.id,
    cropAId: input.cropAId,
    cropBId: input.cropBId,
    relation: input.relation != null ? RELATION_TO_BE[input.relation] : undefined,
    reason: input.reason,
    enabled: input.enabled,
  });
  return {
    id: String(saved.id),
    cropA: saved.cropAId,
    cropB: saved.cropBId,
    relation: mapCompatRelation(saved.relation),
    reason: saved.reason,
    enabled: saved.enabled,
  };
}

export async function listRates(): Promise<GovernmentRate[]> {
  if (fixturesOn()) {
    await delay();
    return [...fixtureRates];
  }
  const rows = await adminApi.get<BeRate[]>('/admin/government-rates');
  return (rows ?? []).map(mapRate);
}

export async function createRate(
  input: CreateGovernmentRateInput,
): Promise<GovernmentRate> {
  if (fixturesOn()) {
    await delay();
    const rate: GovernmentRate = {
      id: `rate-${Date.now()}`,
      cropId: input.cropId,
      amount: input.ratePerUnit,
      currency: input.currency ?? 'PKR',
      unit: input.unit ?? 'kg',
      periodLabel: input.period,
      sourceLabel: input.sourceLabel,
      isActive: true,
      label: 'historical_reference',
      effectiveFrom: new Date().toISOString(),
    };
    addFixtureRate(rate);
    return rate;
  }
  const created = await adminApi.post<BeRate>('/admin/government-rates', {
    cropId: input.cropId,
    unit: input.unit,
    ratePerUnit: input.ratePerUnit,
    currency: input.currency,
    period: input.period,
    sourceLabel: input.sourceLabel,
  });
  return mapRate(created);
}

export async function updateRate(
  id: string,
  input: UpdateGovernmentRateInput,
): Promise<GovernmentRate> {
  if (fixturesOn()) {
    await delay();
    const existing = fixtureRates.find((r) => r.id === id);
    if (!existing) throw new Error('Rate not found');
    const patch: Partial<GovernmentRate> = {};
    if (input.ratePerUnit != null) patch.amount = input.ratePerUnit;
    if (input.unit != null) patch.unit = input.unit;
    if (input.currency != null) patch.currency = input.currency;
    if (input.period != null) patch.periodLabel = input.period;
    if (input.sourceLabel != null) patch.sourceLabel = input.sourceLabel;
    if (input.isActive != null) patch.isActive = input.isActive;
    patchFixtureRate(id, patch);
    return { ...existing, ...patch };
  }
  const updated = await adminApi.patch<BeRate>(
    `/admin/government-rates/${encodeURIComponent(id)}`,
    {
      ratePerUnit: input.ratePerUnit,
      unit: input.unit,
      currency: input.currency,
      period: input.period,
      sourceLabel: input.sourceLabel,
      isActive: input.isActive,
    },
  );
  return mapRate(updated);
}

export async function listPlans(flaggedOnly = false): Promise<AdminPlanReviewItem[]> {
  if (fixturesOn()) {
    await delay();
    return flaggedOnly
      ? fixturePlans.filter((p) => p.flagged)
      : [...fixturePlans];
  }
  const rows = await adminApi.get<BePlan[]>('/admin/plans', {
    params: flaggedOnly ? { flagged: true } : undefined,
  });
  return (rows ?? []).map((p) => ({
    id: String(p.id),
    farmId: String(p.farmId),
    farmerId: String(p.farmerId),
    farmerName: String(p.farmerId),
    flagged: !!p.isFlagged,
    reviewStatus: p.reviewStatus ?? 'none',
    title: `Plan v${p.version}`,
    sections: parsePlanSections(p.contentJson),
    version: p.version,
    language: p.language,
    createdAt: p.createdAt,
  }));
}

export async function reviewPlan(
  planId: string,
  action: PlanReviewAction,
  note?: string,
): Promise<{ id: string; isFlagged: boolean; reviewStatus: string }> {
  if (fixturesOn()) {
    await delay();
    const plan = fixturePlans.find((p) => p.id === planId);
    if (!plan) throw new Error('Plan not found');
    if (action === 'flag') {
      plan.flagged = true;
      plan.reviewStatus = 'flagged';
    } else if (action === 'approve') {
      plan.flagged = false;
      plan.reviewStatus = 'approved';
    } else {
      plan.flagged = false;
      plan.reviewStatus = 'dismissed';
    }
    return {
      id: plan.id,
      isFlagged: plan.flagged,
      reviewStatus: plan.reviewStatus ?? 'none',
    };
  }
  return adminApi.post<{ id: string; isFlagged: boolean; reviewStatus: string }>(
    `/admin/plans/${encodeURIComponent(planId)}/review`,
    { action, note },
  );
}

/** Feature flags — GET/PATCH /admin/feature-flags (live) or fixtures. */
export async function listFlags(): Promise<FeatureFlag[] | UnavailableResult> {
  if (fixturesOn()) {
    await delay();
    return [...fixtureFlags];
  }
  type BeFlag = {
    key: string;
    enabled: boolean;
    description?: string | null;
    updatedAt?: string;
    updatedByAdminId?: string | null;
  };
  const rows = await adminApi.get<BeFlag[]>('/admin/feature-flags');
  return (rows ?? []).map((f) => ({
    key: f.key,
    enabled: f.enabled,
    description: f.description ?? undefined,
    updatedAt: f.updatedAt,
    updatedBy: f.updatedByAdminId ?? undefined,
  }));
}

export async function toggleFlag(
  key: string,
  enabled: boolean,
): Promise<FeatureFlag[] | UnavailableResult> {
  if (fixturesOn()) {
    await delay();
    return [...setFixtureFlag(key, enabled)];
  }
  await adminApi.patch(`/admin/feature-flags/${encodeURIComponent(key)}`, {
    enabled,
  });
  return listFlags();
}

export async function refreshAdminSession(): Promise<{ sessionToken: string }> {
  if (fixturesOn()) {
    return { sessionToken: getAdminToken() || 'fixture-admin-token' };
  }
  return adminApi.post<{ sessionToken: string }>('/admin/auth/refresh');
}

export async function logoutAdmin(): Promise<void> {
  if (fixturesOn()) return;
  try {
    await adminApi.post<void>('/admin/auth/logout');
  } catch {
    // Best-effort — always clear local session afterward.
  }
}

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  if (fixturesOn()) {
    await delay();
    return [...fixtureAuditLogs];
  }
  const rows = await adminApi.get<BeAuditLog[]>('/admin/audit-logs');
  return (rows ?? []).map((e) => {
    let metadata: Record<string, unknown> | undefined;
    if (e.metadataJson) {
      try {
        metadata = JSON.parse(e.metadataJson) as Record<string, unknown>;
      } catch {
        metadata = { raw: e.metadataJson };
      }
    }
    return {
      id: String(e.id),
      actorAdminId: String(e.actorAdminId),
      action: e.action,
      targetType: e.targetType,
      targetId: e.targetId ?? '',
      metadata,
      timestamp: e.timestamp,
    };
  });
}
