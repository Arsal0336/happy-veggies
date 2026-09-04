import type {
  AdminFarmerDetail,
  AdminFarmTwinFixture,
  AdminFarmerListItem,
  AdminMetrics,
  AdminPlanReviewItem,
  AdminUser,
  AnalyticsStat,
  AuditLogEntry,
  CatalogAreaType,
  CatalogCrop,
  CatalogSeedVariety,
  CompatibilityPairDto,
  FeatureFlag,
  GovernmentRate,
} from '../types';

export const fixtureAdminUser: AdminUser = {
  id: 'admin-001',
  email: 'admin@happyveggie.pk',
  name: 'Portal Admin',
  roles: ['Admin'],
};

export const fixtureMetrics: AdminMetrics = {
  farmers: 1284,
  farms: 2106,
  plans: 874,
  activeThreads: 1902,
};

export const fixtureAnalyticsStats: AnalyticsStat[] = [
  { id: 'farmers', label: 'Farmers', value: 1284, barPercent: 64 },
  { id: 'farms', label: 'Farms', value: 2106, barPercent: 70 },
  { id: 'plans', label: 'Plans', value: 874, barPercent: 44 },
  { id: 'threads', label: 'Active threads', value: 1902, barPercent: 90 },
  { id: 'llmUsage', label: 'LLM calls', value: 420, barPercent: 30 },
  { id: 'llmCost', label: 'Est. LLM cost (USD)', value: '1.2400', barPercent: 20 },
];

export const fixtureFarmers: AdminFarmerListItem[] = [
  {
    id: 'farmer-001',
    phone: '+923001111111',
    name: 'Ahmed Khan',
    language: 'ur',
    createdAt: '2025-11-02T08:00:00Z',
  },
  {
    id: 'farmer-002',
    phone: '+923002222222',
    name: 'Sara Ali',
    language: 'en',
    createdAt: '2026-01-14T10:30:00Z',
  },
  {
    id: 'farmer-003',
    phone: '+923003333333',
    name: 'Bilal Hussain',
    language: 'ur',
    createdAt: '2026-03-01T12:00:00Z',
  },
];

export const fixtureFarmerDetails: Record<string, AdminFarmerDetail> = {
  'farmer-001': {
    ...fixtureFarmers[0]!,
    farms: [
      {
        id: 'farm-001',
        name: 'Green Valley Farm',
        regionLabel: 'Punjab — Faisalabad',
        areaAcres: 4,
        areaLabel: '4 acre',
      },
      {
        id: 'farm-002',
        name: 'Canal Side Plot',
        regionLabel: 'Punjab — Faisalabad',
        areaAcres: 1.5,
        areaLabel: '1.5 acre',
      },
    ],
    plans: [
      {
        id: 'plan-001',
        farmId: 'farm-001',
        version: 3,
        createdAt: '2026-08-12T09:00:00Z',
        language: 'ur',
        summary: 'Tomato + okra companion layout',
      },
    ],
  },
  'farmer-002': {
    ...fixtureFarmers[1]!,
    farms: [
      {
        id: 'farm-003',
        name: 'Sunrise Fields',
        regionLabel: 'Sindh — Hyderabad',
        areaAcres: 2,
        areaLabel: '2 acre',
      },
    ],
    plans: [
      {
        id: 'plan-002',
        farmId: 'farm-003',
        version: 1,
        createdAt: '2026-07-20T11:00:00Z',
        language: 'en',
        summary: 'Chili under tunnel',
      },
    ],
  },
  'farmer-003': {
    ...fixtureFarmers[2]!,
    farms: [],
    plans: [],
  },
};

export const fixtureFarmTwins: Record<string, AdminFarmTwinFixture> = {
  'farm-001': {
    farmId: 'farm-001',
    farmName: 'Green Valley Farm',
    weather: '32°C · light rain chance',
    water: 'Canal · reliable',
    greenScore: 72,
    yieldSummary: 'Est. 18 t tomato',
    areas: [
      { id: 'area-1', name: 'Open Field A', type: 'open_field', relativeSize: 3 },
      { id: 'area-2', name: 'Tunnel B', type: 'tunnel', relativeSize: 1 },
    ],
    zones: [
      { id: 'zone-1', areaId: 'area-1', cropName: 'Tomato', stage: 'vegetative' },
      { id: 'zone-2', areaId: 'area-1', cropName: 'Okra', stage: 'flowering' },
      { id: 'zone-3', areaId: 'area-2', cropName: 'Chili', stage: 'seedling' },
    ],
    neighbourEdges: [
      { fromZoneId: 'zone-1', toZoneId: 'zone-2', relation: 'good' },
    ],
  },
  'farm-002': {
    farmId: 'farm-002',
    farmName: 'Canal Side Plot',
    weather: '34°C · dry',
    water: 'Tube well · seasonal',
    greenScore: 58,
    areas: [
      { id: 'area-3', name: 'Open Field', type: 'open_field', relativeSize: 2 },
    ],
    zones: [
      { id: 'zone-4', areaId: 'area-3', cropName: 'Wheat', stage: 'vegetative' },
    ],
  },
  'farm-003': {
    farmId: 'farm-003',
    farmName: 'Sunrise Fields',
    weather: '36°C · humid',
    water: 'Reservoir · reliable',
    greenScore: 65,
    yieldSummary: 'Est. 8 t chili',
    areas: [
      { id: 'area-4', name: 'Tunnel North', type: 'tunnel', relativeSize: 2 },
      { id: 'area-5', name: 'Experimental', type: 'experimental', relativeSize: 1 },
    ],
    zones: [
      { id: 'zone-5', areaId: 'area-4', cropName: 'Chili', stage: 'fruiting' },
      { id: 'zone-6', areaId: 'area-5', cropName: 'Basil trial', stage: 'seedling' },
    ],
  },
};

export const fixtureCrops: CatalogCrop[] = [
  { id: 'crop-tomato', name: 'Tomato', category: 'Vegetable' },
  { id: 'crop-okra', name: 'Okra', category: 'Vegetable' },
  { id: 'crop-chili', name: 'Chili', category: 'Vegetable' },
  { id: 'crop-wheat', name: 'Wheat', category: 'Grain' },
];

export const fixtureSeedVarieties: CatalogSeedVariety[] = [
  { id: 'sv-1', name: 'Roma VF', cropId: 'crop-tomato', cropName: 'Tomato' },
  { id: 'sv-2', name: 'Hybrid Okra 12', cropId: 'crop-okra', cropName: 'Okra' },
  { id: 'sv-3', name: 'Hot Flame', cropId: 'crop-chili', cropName: 'Chili' },
];

export const fixtureAreaTypes: CatalogAreaType[] = [
  { id: 'at-open', code: 'open_field', label: 'Open field', category: 'open' },
  { id: 'at-shed', code: 'shed', label: 'Shed', category: 'protected' },
  { id: 'at-gh', code: 'greenhouse', label: 'Greenhouse', category: 'protected' },
  { id: 'at-tunnel', code: 'tunnel_polyhouse', label: 'Tunnel / polyhouse', category: 'protected' },
  { id: 'at-exp', code: 'experimental', label: 'Experimental', category: 'experimental' },
];

export const fixtureCompatibility: CompatibilityPairDto[] = [
  {
    id: 'compat-1',
    cropA: 'Tomato',
    cropB: 'Okra',
    relation: 'good',
    reason: 'Compatible spacing and pest profile',
  },
  {
    id: 'compat-2',
    cropA: 'Tomato',
    cropB: 'Fennel',
    relation: 'avoid',
    reason: 'Allelopathic interference',
  },
  {
    id: 'compat-3',
    cropA: 'Chili',
    cropB: 'Basil',
    relation: 'neutral',
  },
];

export let fixtureRates: GovernmentRate[] = [
  {
    id: 'rate-1',
    cropId: 'crop-tomato',
    cropName: 'Tomato',
    amount: 45000,
    currency: 'PKR',
    unit: 'per_ton',
    periodLabel: 'previous year',
    label: 'historical_reference',
    effectiveFrom: '2025-01-01',
    isActive: true,
  },
  {
    id: 'rate-2',
    cropId: 'crop-chili',
    cropName: 'Chili',
    amount: 120000,
    currency: 'PKR',
    unit: 'per_ton',
    periodLabel: 'previous year',
    label: 'historical_reference',
    effectiveFrom: '2025-01-01',
    isActive: true,
  },
];

export function addFixtureRate(rate: GovernmentRate): GovernmentRate[] {
  fixtureRates = [rate, ...fixtureRates];
  return fixtureRates;
}

export function patchFixtureRate(
  id: string,
  patch: Partial<GovernmentRate>,
): GovernmentRate[] {
  fixtureRates = fixtureRates.map((r) => (r.id === id ? { ...r, ...patch } : r));
  return fixtureRates;
}

export const fixturePlans: AdminPlanReviewItem[] = [
  {
    id: 'plan-001',
    farmId: 'farm-001',
    farmerId: 'farmer-001',
    farmerName: 'Ahmed Khan',
    flagged: true,
    title: 'Green Valley — v3 (flagged)',
    sections: [
      {
        id: 'crops',
        title: 'Recommended crops',
        body: 'Tomato (Roma VF) and okra on open field; chili in tunnel.',
      },
      {
        id: 'calendar',
        title: 'Calendar',
        body: 'Plant tomato mid-Sep; intercrop okra two weeks later.',
      },
      {
        id: 'disclaimer',
        title: 'Disclaimer',
        body: 'AI guidance only — verify with local extension advice.',
      },
    ],
  },
  {
    id: 'plan-002',
    farmId: 'farm-003',
    farmerId: 'farmer-002',
    farmerName: 'Sara Ali',
    flagged: false,
    title: 'Sunrise Fields — v1 (sample)',
    sections: [
      {
        id: 'crops',
        title: 'Recommended crops',
        body: 'Chili under tunnel with drip irrigation.',
      },
      {
        id: 'inputs',
        title: 'Input guidance',
        body: 'Balanced NPK; mulch to reduce evaporation.',
      },
    ],
  },
];

/** Mutable fixture state for feature-flag toggles in the UI. */
export let fixtureFlags: FeatureFlag[] = [
  {
    key: 'OTP_MODE',
    enabled: true,
    description: 'Use mock OTP for farmer auth',
    updatedAt: '2026-08-01T00:00:00Z',
    updatedBy: 'admin-001',
  },
  {
    key: 'WEATHER_ENRICHMENT',
    enabled: true,
    description: 'Pull third-party weather into twin',
    updatedAt: '2026-08-01T00:00:00Z',
    updatedBy: 'admin-001',
  },
  {
    key: 'SOIL_ENRICHMENT',
    enabled: false,
    description: 'Estimate soil when farmer data missing',
    updatedAt: '2026-08-15T00:00:00Z',
    updatedBy: 'admin-001',
  },
];

export function setFixtureFlag(key: string, enabled: boolean): FeatureFlag[] {
  fixtureFlags = fixtureFlags.map((f) =>
    f.key === key
      ? {
          ...f,
          enabled,
          updatedAt: new Date().toISOString(),
          updatedBy: fixtureAdminUser.id,
        }
      : f,
  );
  return fixtureFlags;
}

export const fixtureAuditLogs: AuditLogEntry[] = [
  {
    id: 'audit-1',
    actorAdminId: 'admin-001',
    action: 'farmer.view',
    targetType: 'farmer',
    targetId: 'farmer-001',
    timestamp: '2026-09-01T08:15:00Z',
  },
  {
    id: 'audit-2',
    actorAdminId: 'admin-001',
    action: 'catalog.crop.update',
    targetType: 'crop',
    targetId: 'crop-tomato',
    timestamp: '2026-09-01T09:00:00Z',
  },
  {
    id: 'audit-3',
    actorAdminId: 'admin-001',
    action: 'feature_flag.toggle',
    targetType: 'feature_flag',
    targetId: 'SOIL_ENRICHMENT',
    metadata: { enabled: false },
    timestamp: '2026-08-15T00:00:00Z',
  },
];
