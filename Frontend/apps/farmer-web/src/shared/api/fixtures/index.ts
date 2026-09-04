/**
 * Centralized fixture data for farmer-web (when VITE_USE_FIXTURES === 'true').
 * Services branch on useFixtures() — no LLM / live backend required.
 */

import type {
  Alert,
  AssistantMessage,
  AssistantThread,
  CropZone,
  Experiment,
  ExperimentalOpportunity,
  Farm,
  FarmEconomicSnapshot,
  FarmerSummary,
  GreenScore,
  NeighbourEdge,
  OtpRequestResponse,
  OtpVerifyResponse,
  PlanDto,
  ProductionArea,
  SoilProfileRecord,
  Suggestion,
  TwinDto,
  WaterSource,
} from '@hv/api-types';

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

export const fixtureFarmer: FarmerSummary = {
  id: 'farmer-001',
  phone: '+923001234567',
  name: 'Ahmad Khan',
  language: 'en',
};

/** Mutable store so create/edit flows work in fixture mode. */
export let fixtureFarms: Farm[] = [
  {
    id: 'farm-001',
    farmerId: 'farmer-001',
    name: 'Green Valley Farm',
    lat: 33.6844,
    lng: 73.0479,
    regionCode: 'ISB',
    regionLabel: 'Islamabad',
    areaAcres: 3.125,
    areaInputValue: 25,
    areaInputUnit: 'kanal',
    area: { value: 25, unit: 'kanal', provenance: 'farmer_provided' },
    soilType: 'loam',
    waterAccess: true,
    waterSource: 'tube_well',
    isNewFarmSetup: false,
    letAiChooseCrop: false,
    createdAt: '2025-01-20T08:00:00Z',
    updatedAt: '2025-06-01T12:00:00Z',
  },
  {
    id: 'farm-002',
    farmerId: 'farmer-001',
    name: 'Sunrise Fields',
    lat: 33.7,
    lng: 73.06,
    regionCode: 'ISB',
    regionLabel: 'Islamabad',
    areaAcres: 10,
    areaInputValue: 10,
    areaInputUnit: 'acre',
    area: { value: 10, unit: 'acre', provenance: 'farmer_provided' },
    isNewFarmSetup: false,
    letAiChooseCrop: false,
    createdAt: '2025-03-10T09:00:00Z',
    updatedAt: '2025-05-20T14:00:00Z',
  },
];

export let fixtureAreas: ProductionArea[] = [
  {
    id: 'area-001',
    farmId: 'farm-001',
    typeCode: 'open_field',
    typeLabel: 'Open Field',
    name: 'North Field',
    areaInputValue: 10,
    areaInputUnit: 'kanal',
    area: { value: 10, unit: 'kanal' },
    layout: { x: 0, y: 0, w: 2, h: 1 },
    createdAt: '2025-02-01T08:00:00Z',
  },
  {
    id: 'area-002',
    farmId: 'farm-001',
    typeCode: 'greenhouse',
    typeLabel: 'Greenhouse',
    name: 'Main Greenhouse',
    areaInputValue: 2,
    areaInputUnit: 'kanal',
    area: { value: 2, unit: 'kanal' },
    layout: { x: 2, y: 0, w: 1, h: 1 },
    createdAt: '2025-02-15T08:00:00Z',
  },
  {
    id: 'area-003',
    farmId: 'farm-001',
    typeCode: 'shed',
    typeLabel: 'Shed',
    name: 'East Shed',
    areaInputValue: 1,
    areaInputUnit: 'kanal',
    area: { value: 1, unit: 'kanal' },
    createdAt: '2025-03-01T08:00:00Z',
  },
];

export let fixtureZones: CropZone[] = [
  {
    id: 'zone-001',
    productionAreaId: 'area-001',
    farmId: 'farm-001',
    label: 'Tomato Section',
    areaInputValue: 4,
    areaInputUnit: 'kanal',
    area: { value: 4, unit: 'kanal' },
    cropId: 'crop-tomato',
    cropFreetext: 'Tomato',
    seedVarietyId: 'variety-roma',
    plantingDate: '2025-03-01',
    growthStage: 'vegetative',
    neighbourIds: ['zone-002'],
    createdAt: '2025-03-01T08:00:00Z',
  },
  {
    id: 'zone-002',
    productionAreaId: 'area-001',
    farmId: 'farm-001',
    label: 'Basil Strip',
    areaInputValue: 2,
    areaInputUnit: 'kanal',
    area: { value: 2, unit: 'kanal' },
    cropId: 'crop-basil',
    cropFreetext: 'Basil',
    plantingDate: '2025-03-15',
    growthStage: 'vegetative',
    neighbourIds: ['zone-001'],
    createdAt: '2025-03-15T08:00:00Z',
  },
  {
    id: 'zone-003',
    productionAreaId: 'area-002',
    farmId: 'farm-001',
    label: 'Cucumber Beds',
    areaInputValue: 1.5,
    areaInputUnit: 'kanal',
    area: { value: 1.5, unit: 'kanal' },
    cropId: 'crop-cucumber',
    cropFreetext: 'Cucumber',
    growthStage: 'flowering',
    createdAt: '2025-04-01T08:00:00Z',
  },
];

export const fixtureNeighbourEdges: NeighbourEdge[] = [
  {
    zoneAId: 'zone-001',
    zoneBId: 'zone-002',
    relation: 'good',
    reason: 'Basil repels pests and supports tomato flavour',
  },
];

export function buildTwin(farmId: string): TwinDto | undefined {
  const farm = fixtureFarms.find((f) => f.id === farmId);
  if (!farm) return undefined;
  const areas = fixtureAreas.filter((a) => a.farmId === farmId && !a.isDeleted);
  const zones = fixtureZones.filter((z) => z.farmId === farmId && !z.isDeleted);
  return {
    farm,
    areas,
    zones,
    weather: {
      temperature: { value: 28, unit: 'celsius', provenance: 'third_party_estimate' },
      rainProbability: 0.15,
      humidity: 42,
      forecastTrend: 'Warm and dry',
      provenance: 'third_party_estimate',
      providerStatus: 'ok',
    },
    soil: {
      type: farm.soilType ?? 'loam',
      ph: { value: 6.8, unit: 'pH', provenance: 'farmer_provided' },
      provenance: 'farmer_provided',
      profileCount: fixtureSoilProfiles.filter(
        (s) => s.farmId === farmId && !s.isDeleted,
      ).length,
    },
    water: {
      sources: fixtureWaterSources.filter(
        (w) => w.farmId === farmId && !w.isDeleted,
      ),
      reliability: 'reliable',
      irrigationMethod: 'flood',
      sourceCount: fixtureWaterSources.filter(
        (w) => w.farmId === farmId && !w.isDeleted,
      ).length,
    },
    greenSummary: {
      overallScore: 72,
      dimensions: {
        water: { score: 70, available: true, explanation: 'Reliable tube well' },
        soil: { score: 75, available: true },
        biodiversity: { score: 68, available: true },
      },
      computedAt: '2025-06-01T12:00:00Z',
      nonCertificationDisclaimer:
        'This green score is a guidance indicator only and is not a certification.',
    },
    neighbourEdges: farmId === 'farm-001' ? fixtureNeighbourEdges : [],
    layoutMode: 'auto',
    twinRefreshedAt: new Date().toISOString(),
  };
}

export let fixturePlans: Record<string, PlanDto> = {
  'farm-001': {
    id: 'plan-001',
    farmId: 'farm-001',
    version: 2,
    language: 'en',
    createdAt: '2025-05-01T10:00:00Z',
    disclaimer: 'Advisory only — verify with local agronomic guidance.',
    sections: [
      {
        key: 'overview',
        title: 'Season overview',
        body: 'Focus on tomato and basil companions in the open field; greenhouse cucumbers at flowering.',
        items: ['Maintain irrigation every 3–4 days', 'Scout for aphids weekly'],
      },
      {
        key: 'irrigation',
        title: 'Irrigation',
        body: 'Tube-well supply is reliable. Prefer morning irrigation to reduce fungal risk.',
      },
      {
        key: 'nutrition',
        title: 'Nutrition',
        body: 'Soil pH ~6.8. Apply compost before next planting cycle.',
      },
    ],
  },
};

export let fixtureAlerts: Alert[] = [
  {
    id: 'alert-001',
    farmerId: 'farmer-001',
    farmId: 'farm-001',
    type: 'weather',
    severity: 'warning',
    message: 'Low rain probability next 5 days — check irrigation.',
    createdAt: '2025-06-02T08:00:00Z',
    read: false,
  },
  {
    id: 'alert-002',
    farmerId: 'farmer-001',
    farmId: 'farm-001',
    type: 'reminder',
    severity: 'info',
    message: 'Tomato vegetative stage — consider staking.',
    createdAt: '2025-06-01T09:00:00Z',
    read: false,
  },
];

export const fixtureSuggestions: Suggestion[] = [
  {
    cropId: 'crop-okra',
    cropName: 'Okra',
    reason: 'Nearby farms report good summer yields for okra in open fields.',
    source: 'community',
    communitySignal: 'Popular within ~15 km this season',
  },
  {
    cropId: 'crop-spinach',
    cropName: 'Spinach',
    reason: 'Cool-season leafy greens suit your soil profile.',
    source: 'ai_only',
  },
];

export const fixtureGreenScores: Record<string, GreenScore> = {
  'farm-001': {
    farmId: 'farm-001',
    overallScore: 72,
    dimensions: {
      water: { score: 70, available: true, explanation: 'Reliable tube well' },
      soil: { score: 75, available: true, explanation: 'Loam with measured pH' },
      biodiversity: { score: 68, available: true },
      inputs: { score: 74, available: true },
    },
    measuredVsEstimated: { soil: 'measured', water: 'estimated' },
    computedAt: '2025-06-01T12:00:00Z',
    nonCertificationDisclaimer:
      'This green score is a guidance indicator only and is not a certification.',
  },
};

export const fixtureOpportunities: ExperimentalOpportunity[] = [
  {
    id: 'opp-001',
    farmId: 'farm-001',
    productionAreaId: 'area-003',
    cropId: 'crop-basil',
    cropName: 'Purple basil',
    hypothesis: 'Trial purple basil under partial shade in the East Shed.',
    area: { value: 0.5, unit: 'kanal' },
    riskNote: 'Small plot; limited market demand risk.',
  },
];

export let fixtureExperiments: Experiment[] = [
  {
    id: 'exp-001',
    farmId: 'farm-001',
    productionAreaId: 'area-003',
    cropId: 'crop-basil',
    cropName: 'Purple basil',
    hypothesis: 'Trial purple basil under partial shade.',
    status: 'active',
    predictedYield: { value: 40, unit: 'kg' },
    notes: 'Started mid-May',
    createdAt: '2025-05-15T08:00:00Z',
  },
];

export let fixtureThreads: AssistantThread[] = [
  {
    id: 'thread-001',
    farmId: 'farm-001',
    createdAt: '2025-05-20T10:00:00Z',
    messages: [
      {
        id: 'msg-001',
        threadId: 'thread-001',
        role: 'user',
        content: 'When should I irrigate tomatoes this week?',
        createdAt: '2025-05-20T10:00:00Z',
      },
      {
        id: 'msg-002',
        threadId: 'thread-001',
        role: 'assistant',
        content:
          'With low rain probability, irrigate every 3–4 days in the morning. Watch for leaf curl.',
        citations: ['Farm twin weather', 'Plan irrigation section'],
        disclaimer: 'Advisory only — verify with local agronomic guidance.',
        createdAt: '2025-05-20T10:00:05Z',
      },
    ],
  },
];

export async function fixtureRequestOtp(_phone: string): Promise<OtpRequestResponse> {
  await delay();
  return { requestId: `req-${Date.now()}`, mode: 'mock' };
}

export async function fixtureVerifyOtp(
  phone: string,
  code: string,
): Promise<OtpVerifyResponse> {
  await delay();
  const digits = code.replace(/\D/g, '');
  if (digits.length < 4 || digits.length > 8) {
    throw new Error('Invalid OTP code');
  }
  // New farmers: phone ending with "0000"
  const isNew = phone.replace(/\D/g, '').endsWith('0000');
  return {
    sessionToken: `fixture-token-${Date.now()}`,
    isNew,
    farmer: {
      ...fixtureFarmer,
      phone,
      name: isNew ? null : fixtureFarmer.name,
    },
  };
}

export function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function upsertFarm(farm: Farm): void {
  const idx = fixtureFarms.findIndex((f) => f.id === farm.id);
  if (idx >= 0) fixtureFarms[idx] = farm;
  else fixtureFarms = [...fixtureFarms, farm];
}

export function upsertArea(area: ProductionArea): void {
  const idx = fixtureAreas.findIndex((a) => a.id === area.id);
  if (idx >= 0) fixtureAreas[idx] = area;
  else fixtureAreas = [...fixtureAreas, area];
}

export function upsertZone(zone: CropZone): void {
  const idx = fixtureZones.findIndex((z) => z.id === zone.id);
  if (idx >= 0) fixtureZones[idx] = zone;
  else fixtureZones = [...fixtureZones, zone];
}

export let fixtureWaterSources: WaterSource[] = [
  {
    id: 'ws-001',
    farmId: 'farm-001',
    type: 'tube_well',
    availability: true,
    reliability: 'reliable',
    irrigationMethod: 'flood',
    provenance: 'farmer_provided',
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-02-01T08:00:00Z',
  },
];

export let fixtureSoilProfiles: SoilProfileRecord[] = [
  {
    id: 'soil-001',
    farmId: 'farm-001',
    productionAreaId: null,
    soilType: 'loam',
    soilTypeProvenance: 'farmer_provided',
    texture: 'medium',
    phValue: 6.8,
    phValueProvenance: 'farmer_provided',
    organicMatterValue: 2.1,
    farmerNotes: 'Composted last season',
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-05-01T08:00:00Z',
  },
];

export const fixtureEconomics: Record<string, FarmEconomicSnapshot[]> = {
  'farm-001': [
    {
      cropId: 'crop-tomato',
      expectedYield: 1200,
      yieldUnit: 'kg',
      ratePerUnit: 80,
      currency: 'PKR',
      referenceGrossValue: 96000,
      period: '2024-25',
      sourceLabel: 'provincial advisory',
      label: 'historical_reference',
    },
  ],
};

export function upsertFixtureWaterSource(source: WaterSource): void {
  const idx = fixtureWaterSources.findIndex((w) => w.id === source.id);
  if (idx >= 0) fixtureWaterSources[idx] = source;
  else fixtureWaterSources = [...fixtureWaterSources, source];
}

export function removeFixtureWaterSource(farmId: string, sourceId: string): void {
  const existing = fixtureWaterSources.find(
    (w) => w.id === sourceId && w.farmId === farmId,
  );
  if (existing) {
    upsertFixtureWaterSource({ ...existing, isDeleted: true });
  }
}

export function upsertFixtureSoilProfile(record: SoilProfileRecord): void {
  const idx = fixtureSoilProfiles.findIndex((s) => s.id === record.id);
  if (idx >= 0) fixtureSoilProfiles[idx] = record;
  else fixtureSoilProfiles = [...fixtureSoilProfiles, record];
}

export function appendExperiment(experiment: Experiment): void {
  fixtureExperiments = [...fixtureExperiments, experiment];
}

/** Prior plan versions for GET /plan/history in fixture mode. */
export let fixturePlanHistory: Record<string, PlanDto[]> = {
  'farm-001': [],
};

export function setPlan(farmId: string, plan: PlanDto): void {
  const previous = fixturePlans[farmId];
  if (previous) {
    const hist = fixturePlanHistory[farmId] ?? [];
    fixturePlanHistory[farmId] = [previous, ...hist.filter((p) => p.id !== previous.id)];
  }
  fixturePlans[farmId] = plan;
}

export function appendAssistantMessage(
  threadId: string,
  userText: string,
): { thread: AssistantThread; reply: AssistantMessage } {
  let thread = fixtureThreads.find((t) => t.id === threadId);
  if (!thread) {
    thread = {
      id: threadId,
      farmId: 'farm-001',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    fixtureThreads = [...fixtureThreads, thread];
  }
  const now = new Date().toISOString();
  const userMsg: AssistantMessage = {
    id: nextId('msg'),
    threadId,
    role: 'user',
    content: userText,
    createdAt: now,
  };
  const reply: AssistantMessage = {
    id: nextId('msg'),
    threadId,
    role: 'assistant',
    content: `Thanks for asking about "${userText}". Based on your farm twin, keep monitoring weather and irrigation. (Fixture reply)`,
    citations: ['Farm twin', 'Fixture knowledge'],
    disclaimer: 'Advisory only — verify with local agronomic guidance.',
    createdAt: now,
  };
  thread.messages = [...(thread.messages ?? []), userMsg, reply];
  return { thread, reply };
}

export { delay };
