/**
 * Development fixtures — deterministic data for frontend development.
 *
 * This adapter intercepts API service calls and returns fixture data.
 * When the real backend is available, swap each fixture function for
 * a real API call. The rest of the app (hooks, components) stays unchanged.
 */

import type {
  Farmer,
  Farm,
  ProductionArea,
  CropZone,
  Crop,
  TwinSummary,
  FarmPlan,
  PlanContent,
  Alert,
  AssistantThread,
  CropSuggestion,
  GreenFarmScore,
  EconomicSnapshot,
  CropCompatibility,
  AdminMetrics,
  AdminAuditLog,
  OtpRequestResponse,
  OtpVerifyResponse,
  ExperimentalPlan,
  ExperimentalOutcome,
} from './index';

// --- Auth Fixtures ---

export const fixtureOtpRequest = async (): Promise<OtpRequestResponse> => {
  await delay(300);
  return { requestId: 'req-001', expiresIn: 300, mode: 'mock' };
};

export const fixtureOtpVerify = async (): Promise<OtpVerifyResponse> => {
  await delay(500);
  return {
    sessionToken: 'fixture-jwt-token-abc123',
    isNew: false,
    farmer: fixtureFarmer,
  };
};

// --- Farmer ---

export const fixtureFarmer: Farmer = {
  id: 'farmer-001',
  phone: '+92-300-1234567',
  name: 'Ahmad Khan',
  language: 'ur',
};

// --- Farms ---

export const fixtureFarms: Farm[] = [
  {
    id: 'farm-001',
    farmerId: 'farmer-001',
    name: 'Green Valley Farm',
    lat: 33.6844,
    lng: 73.0479,
    regionCode: 'ISB',
    regionLabel: 'Islamabad',
    areaAcres: 3.125,
    areaInput: { value: 25, unit: 'kanal' },
    soilType: 'loam',
    waterAccess: true,
    waterSource: 'tube_well',
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
    areaInput: { value: 10, unit: 'acre' },
    createdAt: '2025-03-10T09:00:00Z',
    updatedAt: '2025-05-20T14:00:00Z',
  },
];

// --- Production Areas ---

export const fixtureProductionAreas: ProductionArea[] = [
  {
    id: 'area-001',
    farmId: 'farm-001',
    name: 'North Field',
    typeCode: 'open_field',
    typeLabel: 'Open Field',
    areaValue: 10,
    areaUnit: 'kanal',
    areaCanonical: 0.625,
    canonicalUnit: 'acre',
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-06-01T12:00:00Z',
  },
  {
    id: 'area-002',
    farmId: 'farm-001',
    name: 'Main Greenhouse',
    typeCode: 'greenhouse',
    typeLabel: 'Greenhouse',
    areaValue: 2,
    areaUnit: 'kanal',
    areaCanonical: 0.125,
    canonicalUnit: 'acre',
    createdAt: '2025-02-15T08:00:00Z',
    updatedAt: '2025-05-15T10:00:00Z',
  },
  {
    id: 'area-003',
    farmId: 'farm-001',
    name: 'East Shed',
    typeCode: 'shed',
    typeLabel: 'Shed',
    areaValue: 1,
    areaUnit: 'kanal',
    areaCanonical: 0.0625,
    canonicalUnit: 'acre',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z',
  },
];

// --- Crop Zones ---

export const fixtureCropZones: CropZone[] = [
  {
    id: 'zone-001',
    productionAreaId: 'area-001',
    farmId: 'farm-001',
    label: 'Tomato Section',
    area: 4,
    areaUnit: 'kanal',
    cropId: 'crop-tomato',
    seedVarietyId: 'variety-roma',
    plantingDate: '2025-03-01',
    growthStage: 'vegetative',
    isExperimental: false,
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-06-01T12:00:00Z',
  },
  {
    id: 'zone-002',
    productionAreaId: 'area-001',
    farmId: 'farm-001',
    label: 'Wheat Strip',
    area: 6,
    areaUnit: 'kanal',
    cropId: 'crop-wheat',
    seedVarietyId: 'variety-durum',
    plantingDate: '2025-11-01',
    growthStage: 'pre_planting',
    isExperimental: false,
    createdAt: '2025-02-15T08:00:00Z',
    updatedAt: '2025-05-01T10:00:00Z',
  },
];

// --- Crops Catalog ---

export const fixtureCrops: Crop[] = [
  { id: 'crop-tomato', nameEn: 'Tomato', nameUr: 'ٹماٹر', enabled: true },
  { id: 'crop-wheat', nameEn: 'Wheat', nameUr: 'گندم', enabled: true },
  { id: 'crop-basil', nameEn: 'Basil', nameUr: 'تلسی', enabled: true },
  { id: 'crop-potato', nameEn: 'Potato', nameUr: 'آلو', enabled: true },
  { id: 'crop-onion', nameEn: 'Onion', nameUr: 'پیاز', enabled: true },
];

// --- Crop Compatibility ---

export const fixtureCompatibility: CropCompatibility[] = [
  {
    cropAId: 'crop-tomato',
    cropBId: 'crop-basil',
    relation: 'good',
    reason: 'Basil repels pests and improves tomato flavour',
    scope: 'general',
  },
  {
    cropAId: 'crop-tomato',
    cropBId: 'crop-potato',
    relation: 'avoid',
    reason: 'Both compete for same nutrients, risk of blight spread',
    scope: 'general',
  },
  {
    cropAId: 'crop-tomato',
    cropBId: 'crop-onion',
    relation: 'neutral',
    reason: 'No significant interaction observed',
    scope: 'general',
  },
];

// --- Twin Summary ---

export const fixtureTwin: TwinSummary = {
  farm: fixtureFarms[0],
  areas: fixtureProductionAreas,
  zones: fixtureCropZones,
  weather: {
    temperature: { value: 32, unit: '°C' },
    humidity: 65,
    rainProbability: 20,
    wind: { value: 12, unit: 'km/h' },
    forecastTrend: 'Stable, slight rain expected in 3 days',
  },
  soil: {
    type: 'loam',
    ph: { value: 6.8, unit: 'pH' },
    organicMatter: { value: 2.5, unit: '%', provenance: 'farmer_provided' },
    texture: 'loamy',
  },
  waterSources: [
    {
      id: 'water-001',
      farmId: 'farm-001',
      type: 'tube_well',
      availability: true,
      reliability: 'reliable',
      irrigationMethod: 'drip',
      servedAreaIds: ['area-001', 'area-002'],
      provenance: 'farmer_provided',
    },
  ],
  greenSummary: {
    overallScore: 72,
    dimensions: {
      soil_health: { score: 78, available: true, explanation: 'Good organic matter levels' },
      water_efficiency: { score: 65, available: true, explanation: 'Drip irrigation in use' },
      biodiversity: { score: 80, available: true, explanation: 'Multiple crop types' },
      chemical_reduction: { score: 60, available: true, explanation: 'Some organic practices' },
      waste_management: { score: 75, available: true, explanation: 'Composting in place' },
    },
    measuredVsEstimated: {
      soil_health: 'estimated',
      water_efficiency: 'measured',
      biodiversity: 'measured',
    },
    computedAt: '2025-06-15T10:00:00Z',
    nonCertificationDisclaimer:
      'This score is for guidance only and does not constitute organic certification.',
  },
  neighbourEdges: [
    {
      zoneAId: 'zone-001',
      zoneBId: 'zone-002',
      relation: 'neutral',
      reason: 'Different crop families, no known interaction',
    },
  ],
  contextUsed: { season: 'kharif_2025', weather: true, soilData: true },
  layoutMode: 'auto',
};

// --- Plan ---

export const fixturePlanContent: PlanContent = {
  planVersion: '1.0',
  language: 'ur',
  generatedAt: '2025-06-01T12:00:00Z',
  contextUsed: { season: 'kharif_2025', weather: true, soilData: true },
  recommendedCrops: [
    { cropId: 'crop-basil', name: 'Basil', why: 'Excellent companion for tomatoes', suitability: 'high' },
    { cropId: 'crop-onion', name: 'Onion', why: 'Pest deterrent properties', suitability: 'medium' },
  ],
  calendar: [
    { stage: 'Soil Prep', timing: 'March', actions: ['Prepare soil', 'Add compost'] },
    { stage: 'Planting', timing: 'April', actions: ['Transplant seedlings'] },
    { stage: 'Growing', timing: 'May-June', actions: ['Monitor pests', 'Companion planting'] },
    { stage: 'Harvest', timing: 'July', actions: ['First harvest', 'Final harvest'] },
  ],
  inputGuidance: {
    water: 'Drip irrigation, 2-3 times per week',
    fertilizer: 'Organic compost + balanced NPK at transplant',
    otherInputs: ['Neem spray as preventive'],
  },
  yieldPrediction: {
    estimate: '800 kg per kanal',
    confidence: 'high',
    assumptions: ['Normal rainfall', 'No pest outbreak', 'Timely irrigation'],
  },
  disclaimer: 'This plan is AI-assisted guidance. Consult local extension services for site-specific advice.',
};

export const fixturePlan: FarmPlan = {
  id: 'plan-001',
  farmId: 'farm-001',
  farmerId: 'farmer-001',
  language: 'ur',
  version: 1,
  content: fixturePlanContent,
  createdAt: '2025-03-01T08:00:00Z',
};

// --- Economics ---

export const fixtureEconomics: EconomicSnapshot = {
  expectedYield: { value: '800 kg', unit: 'kg', confidence: 'high' },
  governmentReferenceRate: {
    amount: 450,
    currency: 'PKR',
    unit: 'kg',
    periodLabel: '2024-Q4',
    label: 'historical_reference',
  },
  referenceGrossValue: { amount: 360000, currency: 'PKR' },
  riskBand: 'medium',
};

// --- Alerts ---

export const fixtureAlerts: Alert[] = [
  {
    id: 'alert-001',
    farmerId: 'farmer-001',
    farmId: 'farm-001',
    severity: 'warning',
    type: 'pest',
    message: 'Aphid detection on Tomato Section. Neighbouring farms report aphid activity.',
    read: false,
    createdAt: '2025-06-14T08:00:00Z',
  },
  {
    id: 'alert-002',
    farmerId: 'farmer-001',
    farmId: 'farm-001',
    severity: 'info',
    type: 'weather',
    message: 'Rain expected in 3 days. Reduce irrigation schedule.',
    read: true,
    createdAt: '2025-06-13T10:00:00Z',
  },
];

// --- Assistant ---

export const fixtureThread: AssistantThread = {
  id: 'thread-001',
  farmId: 'farm-001',
  messages: [
    {
      id: 'msg-001',
      threadId: 'thread-001',
      role: 'user',
      content: 'How can I protect my tomatoes from aphids naturally?',
      createdAt: '2025-06-14T09:00:00Z',
    },
    {
      id: 'msg-002',
      threadId: 'thread-001',
      role: 'assistant',
      content:
        'Here are some natural methods to protect your tomatoes from aphids:\n\n1. **Basil intercropping** — Plant basil between tomato rows as a natural repellent.\n2. **Neem oil spray** — Apply diluted neem oil every 7 days as a preventive measure.\n3. **Ladybug habitat** — Encourage natural predators by planting marigolds nearby.',
      citations: ['FAO IPM Guidelines 2023', 'Pakistan Ag Extension Advisory'],
      disclaimer: 'AI-generated guidance. Verify with local extension services.',
      createdAt: '2025-06-14T09:01:00Z',
    },
  ],
  createdAt: '2025-06-14T09:00:00Z',
};

// --- Crop Suggestions ---

export const fixtureSuggestions: CropSuggestion[] = [
  {
    cropId: 'crop-basil',
    reason: 'Companion crop for tomatoes, improves flavour and repels pests',
    communitySignal: '78% of nearby farms grow basil with tomatoes',
  },
  {
    cropId: 'crop-onion',
    reason: 'Natural pest deterrent, compatible with current rotation',
    communitySignal: '55% adoption in region',
  },
];

// --- Green Farm Score ---

export const fixtureGreenScore: GreenFarmScore = {
  farmId: 'farm-001',
  overallScore: 72,
  dimensions: {
    soil_health: { score: 78, available: true, explanation: 'Good organic matter levels' },
    water_efficiency: { score: 65, available: true, explanation: 'Drip irrigation in use' },
    biodiversity: { score: 80, available: true, explanation: 'Multiple crop types' },
    chemical_reduction: { score: 60, available: true, explanation: 'Some organic practices' },
    waste_management: { score: 75, available: true, explanation: 'Composting in place' },
  },
  measuredVsEstimated: {
    soil_health: 'estimated',
    water_efficiency: 'measured',
    biodiversity: 'measured',
    chemical_reduction: 'estimated',
    waste_management: 'estimated',
  },
  dataAvailabilityMap: {
    soil_health: true,
    water_efficiency: true,
    biodiversity: true,
    chemical_reduction: true,
    waste_management: true,
  },
  computedAt: '2025-06-15T10:00:00Z',
  nonCertificationDisclaimer:
    'This score is for guidance only and does not constitute organic certification.',
};

// --- Experimental Plans ---

export const fixtureExperimentalPlans: ExperimentalPlan[] = [
  {
    id: 'exp-plan-001',
    farmId: 'farm-001',
    productionAreaId: 'area-001',
    cropId: 'crop-basil',
    cropName: 'Basil',
    areaValue: 0.5,
    areaUnit: 'kanal',
    hypothesis: 'Test basil as companion crop to reduce aphid pressure on tomatoes',
    status: 'approved',
    createdAt: '2025-05-01T08:00:00Z',
    updatedAt: '2025-05-10T10:00:00Z',
  },
  {
    id: 'exp-plan-002',
    farmId: 'farm-001',
    productionAreaId: 'area-002',
    cropId: 'crop-potato',
    cropName: 'Potato',
    areaValue: 0.25,
    areaUnit: 'kanal',
    hypothesis: 'Evaluate greenhouse potato yields vs open field',
    status: 'draft',
    createdAt: '2025-06-01T08:00:00Z',
    updatedAt: '2025-06-01T08:00:00Z',
  },
  {
    id: 'exp-plan-003',
    farmId: 'farm-001',
    productionAreaId: 'area-001',
    cropId: 'crop-onion',
    cropName: 'Onion',
    areaValue: 0.3,
    areaUnit: 'kanal',
    hypothesis: 'Test onion intercropping for natural pest deterrence',
    status: 'completed',
    createdAt: '2025-03-01T08:00:00Z',
    updatedAt: '2025-06-15T10:00:00Z',
  },
];

export const fixtureExperimentalOutcomes: ExperimentalOutcome[] = [
  {
    id: 'exp-out-001',
    planId: 'exp-plan-003',
    yieldValue: 120,
    yieldUnit: 'kg',
    notes: 'Onion intercropping reduced aphid incidence by ~40%. Yield slightly below standalone baseline but pest savings offset cost.',
    recordedAt: '2025-06-15T10:00:00Z',
  },
];

// --- Seed Varieties ---

export const fixtureSeedVarieties: import('./index').SeedVariety[] = [
  {
    id: 'variety-roma',
    cropId: 'crop-tomato',
    nameEn: 'Roma',
    nameUr: 'روما',
    varietyType: 'determinate',
    regionSuitability: ['ISB', 'LHR'],
    seasonTags: ['kharif'],
    maturityDays: 75,
    riskBand: 'low',
    enabled: true,
  },
  {
    id: 'variety-cherry',
    cropId: 'crop-tomato',
    nameEn: 'Cherry Tomato',
    nameUr: 'چیری ٹماٹر',
    varietyType: 'indeterminate',
    regionSuitability: ['ISB'],
    seasonTags: ['kharif'],
    maturityDays: 65,
    riskBand: 'low',
    enabled: true,
  },
  {
    id: 'variety-durum',
    cropId: 'crop-wheat',
    nameEn: 'Durum',
    nameUr: 'ڈرم',
    varietyType: 'hard',
    regionSuitability: ['ISB', 'LHR', 'FSD'],
    seasonTags: ['rabi'],
    maturityDays: 120,
    riskBand: 'medium',
    enabled: true,
  },
  {
    id: 'variety-fsd-08',
    cropId: 'crop-wheat',
    nameEn: 'FSD-08',
    nameUr: 'ایف ایس ڈی ۰۸',
    varietyType: 'semi-dwarf',
    regionSuitability: ['FSD', 'LHR'],
    seasonTags: ['rabi'],
    maturityDays: 135,
    riskBand: 'low',
    enabled: true,
  },
];

// --- Production Area Types ---

export const fixtureProductionAreaTypes: import('./index').ProductionAreaType[] = [
  { code: 'open_field', nameEn: 'Open Field', nameUr: 'کھلا میدان', category: 'open', enabled: true },
  { code: 'greenhouse', nameEn: 'Greenhouse', nameUr: 'گرین ہاؤس', category: 'protected', enabled: true },
  { code: 'tunnel_polyhouse', nameEn: 'Tunnel / Polyhouse', nameUr: 'ٹنل / پولی ہاؤس', category: 'protected', enabled: true },
  { code: 'shed', nameEn: 'Shed', nameUr: 'شیڈ', category: 'protected', enabled: true },
  { code: 'experimental', nameEn: 'Experimental', nameUr: 'تجرباتی', category: 'experimental', enabled: true },
  { code: 'other_protected', nameEn: 'Other Protected', nameUr: 'دیگر محفوظ', category: 'protected', enabled: false },
];

// --- Government Rates ---

export interface GovernmentRate {
  id: string;
  cropId: string;
  cropName: string;
  region: string;
  ratePerUnit: number;
  unit: string;
  currency: string;
  effectiveDate: string;
}

export const fixtureGovernmentRates: GovernmentRate[] = [
  { id: 'rate-001', cropId: 'crop-wheat', cropName: 'Wheat', region: 'Punjab', ratePerUnit: 3900, unit: '40kg', currency: 'PKR', effectiveDate: '2025-04-01' },
  { id: 'rate-002', cropId: 'crop-tomato', cropName: 'Tomato', region: 'Sindh', ratePerUnit: 450, unit: 'kg', currency: 'PKR', effectiveDate: '2025-06-01' },
  { id: 'rate-003', cropId: 'crop-potato', cropName: 'Potato', region: 'Punjab', ratePerUnit: 280, unit: 'kg', currency: 'PKR', effectiveDate: '2025-05-15' },
  { id: 'rate-004', cropId: 'crop-onion', cropName: 'Onion', region: 'KPK', ratePerUnit: 320, unit: 'kg', currency: 'PKR', effectiveDate: '2025-03-01' },
];

// --- Feature Flags ---

export interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export const fixtureFeatureFlags: FeatureFlag[] = [
  { id: 'ff-001', key: 'ai_assistant', label: 'AI Assistant', description: 'Enable AI-powered farming assistant chat', enabled: true },
  { id: 'ff-002', key: 'green_score', label: 'Green Farm Score', description: 'Show sustainability scoring for farms', enabled: true },
  { id: 'ff-003', key: 'economics_panel', label: 'Economics Panel', description: 'Display economic snapshot on farm detail', enabled: true },
  { id: 'ff-004', key: 'nearby_suggestions', label: 'Nearby Suggestions', description: 'Show crop suggestions from neighbouring farms', enabled: false },
  { id: 'ff-005', key: 'multi_language', label: 'Multi-Language', description: 'Enable Urdu language toggle', enabled: true },
  { id: 'ff-006', key: 'experimental_zones', label: 'Experimental Zones', description: 'Allow creating experimental crop zones', enabled: false },
];

// --- Admin Farmer List ---

export interface AdminFarmerSummary {
  id: string;
  name: string;
  phone: string;
  region: string;
  farmsCount: number;
  createdAt: string;
}

export const fixtureAdminFarmers: AdminFarmerSummary[] = [
  { id: 'farmer-001', name: 'Ahmad Khan', phone: '+92-300-1234567', region: 'Islamabad', farmsCount: 2, createdAt: '2025-01-15T08:00:00Z' },
  { id: 'farmer-002', name: 'Fatima Bibi', phone: '+92-301-9876543', region: 'Lahore', farmsCount: 1, createdAt: '2025-02-20T10:00:00Z' },
  { id: 'farmer-003', name: 'Muhammad Ali', phone: '+92-302-5551234', region: 'Faisalabad', farmsCount: 3, createdAt: '2025-03-05T09:00:00Z' },
  { id: 'farmer-004', name: 'Ayesha Siddiqui', phone: '+92-303-4445678', region: 'Multan', farmsCount: 1, createdAt: '2025-03-18T14:00:00Z' },
  { id: 'farmer-005', name: 'Hassan Raza', phone: '+92-304-7778899', region: 'Islamabad', farmsCount: 2, createdAt: '2025-04-01T11:00:00Z' },
  { id: 'farmer-006', name: 'Zainab Noor', phone: '+92-305-1112233', region: 'Peshawar', farmsCount: 1, createdAt: '2025-04-10T08:30:00Z' },
  { id: 'farmer-007', name: 'Usman Tariq', phone: '+92-306-6667788', region: 'Lahore', farmsCount: 4, createdAt: '2025-04-22T16:00:00Z' },
  { id: 'farmer-008', name: 'Sana Malik', phone: '+92-307-3334455', region: 'Karachi', farmsCount: 1, createdAt: '2025-05-01T07:00:00Z' },
  { id: 'farmer-009', name: 'Imran Shah', phone: '+92-308-8889900', region: 'Quetta', farmsCount: 2, createdAt: '2025-05-15T13:00:00Z' },
  { id: 'farmer-010', name: 'Nadia Hussain', phone: '+92-309-2223344', region: 'Faisalabad', farmsCount: 1, createdAt: '2025-06-01T10:00:00Z' },
  { id: 'farmer-011', name: 'Bilal Ahmed', phone: '+92-310-5556677', region: 'Multan', farmsCount: 2, createdAt: '2025-06-10T09:00:00Z' },
  { id: 'farmer-012', name: 'Rabia Kanwal', phone: '+92-311-9990011', region: 'Islamabad', farmsCount: 1, createdAt: '2025-06-15T12:00:00Z' },
];

// --- Admin Plan Review ---

export interface AdminPlanReview {
  id: string;
  farmId: string;
  farmName: string;
  farmerName: string;
  status: 'pending' | 'approved' | 'rejected';
  flagReason?: string;
  createdAt: string;
}

export const fixtureAdminPlanReviews: AdminPlanReview[] = [
  { id: 'review-001', farmId: 'farm-001', farmName: 'Green Valley Farm', farmerName: 'Ahmad Khan', status: 'pending', flagReason: 'High-risk crop combination detected', createdAt: '2025-06-14T08:00:00Z' },
  { id: 'review-002', farmId: 'farm-002', farmName: 'Sunrise Fields', farmerName: 'Ahmad Khan', status: 'pending', flagReason: 'Budget exceeds typical range', createdAt: '2025-06-13T10:00:00Z' },
  { id: 'review-003', farmId: 'farm-003', farmName: 'Hilltop Garden', farmerName: 'Muhammad Ali', status: 'approved', createdAt: '2025-06-12T14:00:00Z' },
  { id: 'review-004', farmId: 'farm-004', farmName: 'River Bank Plot', farmerName: 'Fatima Bibi', status: 'rejected', flagReason: 'Incompatible soil type for selected crops', createdAt: '2025-06-10T09:00:00Z' },
];

// --- Admin Analytics ---

export interface AdminAnalytics {
  totalRequests: number;
  llmCalls: number;
  llmCostPKR: number;
  avgResponseMs: number;
  dailyStats: { date: string; requests: number; llmCalls: number; cost: number }[];
}

export const fixtureAdminAnalytics: AdminAnalytics = {
  totalRequests: 8450,
  llmCalls: 3200,
  llmCostPKR: 12500,
  avgResponseMs: 1850,
  dailyStats: [
    { date: '2025-06-09', requests: 1100, llmCalls: 420, cost: 1650 },
    { date: '2025-06-10', requests: 1250, llmCalls: 480, cost: 1900 },
    { date: '2025-06-11', requests: 980, llmCalls: 370, cost: 1450 },
    { date: '2025-06-12', requests: 1300, llmCalls: 500, cost: 1950 },
    { date: '2025-06-13', requests: 1150, llmCalls: 440, cost: 1700 },
    { date: '2025-06-14', requests: 1350, llmCalls: 510, cost: 2000 },
    { date: '2025-06-15', requests: 1320, llmCalls: 480, cost: 1850 },
  ],
};

// --- Admin Fixtures ---

export const fixtureAdminMetrics: AdminMetrics = {
  totalFarmers: 1250,
  totalFarms: 2100,
  plansGenerated: 3400,
  activeFarms: 890,
  llmCost: { amount: 12500, currency: 'PKR' },
};

export const fixtureAuditLog: AdminAuditLog[] = [
  {
    id: 'log-001',
    actorAdminId: 'admin-001',
    action: 'farmer.verified',
    targetType: 'farmer',
    targetId: 'farmer-042',
    metadata: { name: 'Muhammad Ali' },
    timestamp: '2025-06-15T10:30:00Z',
  },
  {
    id: 'log-002',
    actorAdminId: 'system',
    action: 'seed_data.updated',
    targetType: 'crop_catalog',
    targetId: 'crop-catalog',
    metadata: { version: '2.3' },
    timestamp: '2025-06-14T22:00:00Z',
  },
];

// --- Utility ---

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
