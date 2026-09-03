/**
 * @hv/api-types
 *
 * Shared TypeScript types for the Happy Veggie API contract.
 * Derived from: 05-Frontend-Backend-Integration.md, HAPPY-VEGGIE-DEV-SPEC.md
 *
 * These types are the single source of truth for request/response shapes
 * consumed by both farmer-web and admin-web.
 */

/* ────────────────────────────────────────────────────────────
   Common / Shared
   ──────────────────────────────────────────────────────────── */

/** Supported languages */
export type Language = 'en' | 'ur';

/** Data provenance labels (SRS §4.2) */
export type Provenance =
  | 'farmer_provided'
  | 'third_party_estimate'
  | 'observed_measured'
  | 'system_derived'
  | 'historical_reference';

/** Production area type codes (FR-110) */
export type ProductionAreaTypeCode =
  | 'open_field'
  | 'shed'
  | 'greenhouse'
  | 'tunnel_polyhouse'
  | 'experimental'
  | 'other_protected';

/** Production area category */
export type ProductionAreaCategory = 'open' | 'protected' | 'experimental';

/** Area unit options (C-008) */
export type LandUnit = 'acre' | 'kanal' | 'marla' | 'hectare';
export type CoveredUnit = 'sq_ft' | 'sq_m';
export type AreaUnit = LandUnit | CoveredUnit;

/** Compatibility relation */
export type CompatibilityRelation = 'good' | 'avoid' | 'neutral';

/** Crop suitability band */
export type SuitabilityBand = 'high' | 'medium' | 'low';

/** Confidence level */
export type Confidence = 'low' | 'medium' | 'high';

/** Risk band */
export type RiskBand = 'low' | 'medium' | 'high';

/** Alert severity */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/** Alert type */
export type AlertType = 'weather' | 'reminder' | 'pest' | 'info';

/** Soil type enum */
export type SoilType = 'sandy' | 'clay' | 'loam' | 'silt' | 'mixed' | 'unknown';

/** Water source type */
export type WaterSourceType = 'canal' | 'tube_well' | 'rain_fed' | 'reservoir' | 'other';

/** Water source reliability */
export type WaterReliability = 'reliable' | 'seasonal' | 'unreliable';

/** Growth stage */
export type GrowthStage =
  | 'pre_planting'
  | 'germination'
  | 'seedling'
  | 'vegetative'
  | 'flowering'
  | 'fruiting'
  | 'harvest'
  | 'post_harvest';

/* ────────────────────────────────────────────────────────────
   Value + Unit + Provenance wrapper (Doc 05 §5)
   ──────────────────────────────────────────────────────────── */

export interface MeasuredValue<T = number> {
  value: T;
  unit: string;
  provenance?: Provenance;
}

export interface AreaInput {
  value: number;
  unit: AreaUnit;
}

/* ────────────────────────────────────────────────────────────
   Error Contract (Doc 05 §4)
   ──────────────────────────────────────────────────────────── */

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'GENERATION_FAILED'
  | 'PROVIDER_UNAVAILABLE';

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  correlationId?: string;
  errors?: ApiFieldError[];
  retryable: boolean;
  retryAfter?: number;
}

/* ────────────────────────────────────────────────────────────
   Pagination (Doc 05 §2)
   ──────────────────────────────────────────────────────────── */

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

/* ────────────────────────────────────────────────────────────
   Auth (Doc 05 §3, Dev Spec Scenario 1)
   ──────────────────────────────────────────────────────────── */

export interface OtpRequestPayload {
  phone: string;
  language: Language;
}

export interface OtpRequestResponse {
  requestId: string;
  expiresIn: number;
  mode: 'mock' | 'live';
}

export interface OtpVerifyPayload {
  requestId: string;
  phone: string;
  code: string;
}

export interface Farmer {
  id: string;
  phone: string;
  name: string | null;
  language: Language;
}

export interface OtpVerifyResponse {
  sessionToken: string;
  farmer: Farmer;
  isNew: boolean;
}

export interface CompleteProfilePayload {
  name: string;
  language: Language;
}

export interface CompleteProfileResponse {
  farmer: Farmer;
}

/* ────────────────────────────────────────────────────────────
   Farm (Dev Spec Scenario 2, SRS FR-045–049)
   ──────────────────────────────────────────────────────────── */

export interface Farm {
  id: string;
  farmerId: string;
  name?: string;
  lat: number;
  lng: number;
  regionCode: string;
  regionLabel: string;
  areaAcres: number;
  areaInput: AreaInput;
  preferredCropId?: string;
  preferredCropFreetext?: string;
  isNewFarmSetup?: boolean;
  soilType?: SoilType | null;
  waterAccess?: boolean | null;
  waterSource?: WaterSourceType | null;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
  letAiChooseCrop?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarmPayload {
  lat: number;
  lng: number;
  regionCode: string;
  areaAcres: number;
  areaInput: AreaInput;
  preferredCropId?: string | null;
  preferredCropFreetext?: string | null;
  letAiChooseCrop?: boolean;
  isNewFarmSetup?: boolean;
  soilType?: SoilType | null;
  waterAccess?: boolean | null;
  waterSource?: WaterSourceType | null;
  budget?: { amount: number; currency: string } | null;
}

export interface UpdateFarmPayload {
  name?: string;
  lat?: number;
  lng?: number;
  regionCode?: string;
  areaAcres?: number;
  areaInput?: AreaInput;
  preferredCropId?: string | null;
}

/* ────────────────────────────────────────────────────────────
   Production Area (SRS FR-109–114)
   ──────────────────────────────────────────────────────────── */

export interface ProductionArea {
  id: string;
  farmId: string;
  typeCode: ProductionAreaTypeCode;
  typeLabel: string;
  name: string;
  areaValue: number;
  areaUnit: AreaUnit;
  areaCanonical: number;
  canonicalUnit: AreaUnit;
  envAttributes?: Record<string, MeasuredValue | string | null>;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductionAreaPayload {
  typeCode: ProductionAreaTypeCode;
  name: string;
  areaValue: number;
  areaUnit: AreaUnit;
  envAttributes?: Record<string, MeasuredValue | string | null>;
}

export interface UpdateProductionAreaPayload {
  name?: string;
  areaValue?: number;
  areaUnit?: AreaUnit;
  envAttributes?: Record<string, MeasuredValue | string | null>;
}

/* ────────────────────────────────────────────────────────────
   Production Area Type Catalog
   ──────────────────────────────────────────────────────────── */

export interface ProductionAreaType {
  code: ProductionAreaTypeCode;
  nameEn: string;
  nameUr: string;
  category: ProductionAreaCategory;
  enabled: boolean;
}

/* ────────────────────────────────────────────────────────────
   Crop Zone (SRS FR-048)
   ──────────────────────────────────────────────────────────── */

export interface CropZone {
  id: string;
  productionAreaId: string;
  farmId: string;
  label: string;
  area: number;
  areaUnit: AreaUnit;
  cropId?: string;
  cropFreetext?: string;
  seedVarietyId?: string;
  plantingDate?: string;
  growthStage?: GrowthStage;
  expectedYield?: MeasuredValue;
  isExperimental: boolean;
  neighbourIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCropZonePayload {
  productionAreaId: string;
  label: string;
  area: number;
  areaUnit: AreaUnit;
  cropId?: string | null;
  cropFreetext?: string | null;
  seedVarietyId?: string | null;
  plantingDate?: string;
  isExperimental?: boolean;
}

export interface UpdateCropZonePayload {
  label?: string;
  area?: number;
  areaUnit?: AreaUnit;
  cropId?: string | null;
  seedVarietyId?: string | null;
  plantingDate?: string;
  growthStage?: GrowthStage;
  expectedYield?: MeasuredValue;
}

/* ────────────────────────────────────────────────────────────
   Crop Catalog
   ──────────────────────────────────────────────────────────── */

export interface Crop {
  id: string;
  nameEn: string;
  nameUr: string;
  icon?: string;
  enabled: boolean;
}

export interface SeedVariety {
  id: string;
  cropId: string;
  nameEn: string;
  nameUr: string;
  varietyType: string;
  regionSuitability?: string[];
  seasonTags?: string[];
  soilNotes?: string;
  waterNotes?: string;
  diseaseResistanceNotes?: string;
  maturityDays?: number;
  riskBand?: RiskBand;
  enabled: boolean;
}

/* ────────────────────────────────────────────────────────────
   Compatibility
   ──────────────────────────────────────────────────────────── */

export interface CropCompatibility {
  cropAId: string;
  cropBId: string;
  relation: CompatibilityRelation;
  reason: string;
  scope?: 'on_farm_neighbour' | 'portfolio' | 'nearby_region' | 'general';
}

/* ────────────────────────────────────────────────────────────
   Digital Twin (Doc 01 §1.3, Doc 02 §4, SRS FR-051–055)
   ──────────────────────────────────────────────────────────── */

export interface WeatherSnapshot {
  temperature?: MeasuredValue;
  rainProbability?: number;
  rainfall?: MeasuredValue;
  humidity?: number;
  wind?: MeasuredValue;
  extremeAlerts?: string[];
  forecastTrend?: string;
}

export interface SoilProfile {
  type?: SoilType;
  ph?: MeasuredValue;
  organicMatter?: MeasuredValue;
  texture?: string;
  nutrients?: Record<string, MeasuredValue>;
}

export interface WaterSource {
  id: string;
  farmId: string;
  type: WaterSourceType;
  availability: boolean;
  seasonalAvailability?: boolean;
  capacityEstimate?: MeasuredValue;
  reliability?: WaterReliability;
  irrigationMethod?: string;
  servedAreaIds?: string[];
  provenance?: Provenance;
}

export interface GreenFarmSummary {
  overallScore?: number;
  dimensions?: Record<string, { score: number; available: boolean; explanation?: string }>;
  measuredVsEstimated?: Record<string, 'measured' | 'estimated'>;
  computedAt?: string;
  nonCertificationDisclaimer: string;
}

export interface NeighbourEdge {
  zoneAId: string;
  zoneBId: string;
  relation: CompatibilityRelation;
  reason: string;
}

export interface TwinSummary {
  farm: Farm;
  areas: ProductionArea[];
  zones: CropZone[];
  weather?: WeatherSnapshot;
  soil?: SoilProfile;
  waterSources?: WaterSource[];
  greenSummary?: GreenFarmSummary;
  neighbourEdges?: NeighbourEdge[];
  contextUsed?: {
    season?: string;
    weather: boolean;
    soilData: boolean;
  };
  layoutMode?: 'auto' | 'stored';
}

/* ────────────────────────────────────────────────────────────
   Farm Plan (Dev Spec Scenario 4, SRS FR-007–012)
   ──────────────────────────────────────────────────────────── */

export interface RecommendedCrop {
  cropId: string;
  name: string;
  why: string;
  suitability: SuitabilityBand;
}

export interface CalendarStage {
  stage: string;
  timing: string;
  actions: string[];
}

export interface InputGuidance {
  water: string;
  fertilizer: string;
  otherInputs?: string[];
}

export interface YieldPrediction {
  estimate: string;
  confidence: Confidence;
  assumptions: string[];
}

export interface PlanContent {
  planVersion: string;
  language: Language;
  generatedAt: string;
  contextUsed: {
    season: string;
    weather: boolean;
    soilData: boolean;
  };
  recommendedCrops: RecommendedCrop[];
  calendar: CalendarStage[];
  inputGuidance: InputGuidance;
  yieldPrediction?: YieldPrediction;
  disclaimer: string;
}

export interface FarmPlan {
  id: string;
  farmId: string;
  farmerId: string;
  language: Language;
  content: PlanContent;
  version: number;
  createdAt: string;
}

export interface PlanGenerateResponse {
  planId: string;
  plan: PlanContent;
}

/* ────────────────────────────────────────────────────────────
   Economics (SRS FR-079–083)
   ──────────────────────────────────────────────────────────── */

export interface EconomicSnapshot {
  expectedYield: MeasuredValue<string> & { confidence?: Confidence };
  governmentReferenceRate: {
    amount: number;
    currency: string;
    unit: string;
    periodLabel: string;
    label: 'historical_reference';
  };
  referenceGrossValue: {
    amount: number;
    currency: string;
  };
  riskBand?: RiskBand;
}

/* ────────────────────────────────────────────────────────────
   Alerts (SRS FR-036–037)
   ──────────────────────────────────────────────────────────── */

export interface Alert {
  id: string;
  farmerId: string;
  farmId?: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  actionRef?: string;
  read: boolean;
  createdAt: string;
}

/* ────────────────────────────────────────────────────────────
   AI Assistant (Doc 04, SRS FR-060–066)
   ──────────────────────────────────────────────────────────── */

export interface AssistantMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  disclaimer?: string;
  createdAt: string;
}

export interface AssistantThread {
  id: string;
  farmId: string;
  messages: AssistantMessage[];
  createdAt: string;
}

export interface PostMessagePayload {
  text: string;
}

export interface PostMessageResponse {
  message: AssistantMessage;
  citations?: string[];
  disclaimer?: string;
}

/* ────────────────────────────────────────────────────────────
   Nearby / Suggestions (SRS FR-033–035)
   ──────────────────────────────────────────────────────────── */

export interface CropSuggestion {
  cropId: string;
  reason: string;
  communitySignal?: string;
}

export interface SuggestionsResponse {
  suggestions: CropSuggestion[];
}

/* ────────────────────────────────────────────────────────────
   Green Farm (SRS FR-127–133)
   ──────────────────────────────────────────────────────────── */

export interface GreenFarmScore {
  farmId: string;
  overallScore: number;
  dimensions: Record<
    string,
    {
      score: number;
      available: boolean;
      explanation: string;
    }
  >;
  measuredVsEstimated: Record<string, 'measured' | 'estimated'>;
  dataAvailabilityMap: Record<string, boolean>;
  computedAt: string;
  nonCertificationDisclaimer: string;
}

/* ────────────────────────────────────────────────────────────
   Experimental Farming (SRS FR-110 experimental areas)
   ──────────────────────────────────────────────────────────── */

export type ExperimentalPlanStatus = 'draft' | 'approved' | 'rejected' | 'completed';

export interface ExperimentalPlan {
  id: string;
  farmId: string;
  productionAreaId: string;
  cropId: string;
  cropName: string;
  areaValue: number;
  areaUnit: AreaUnit;
  hypothesis: string;
  status: ExperimentalPlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentalOutcome {
  id: string;
  planId: string;
  yieldValue: number;
  yieldUnit: string;
  notes: string;
  recordedAt: string;
}

/* ────────────────────────────────────────────────────────────
   Geo (Dev Spec Scenario 2)
   ──────────────────────────────────────────────────────────── */

export interface ReverseGeoResponse {
  region: string | null;
  regionCode?: string;
  confidence?: number;
}

/* ────────────────────────────────────────────────────────────
   Admin (Doc 03 §4.4)
   ──────────────────────────────────────────────────────────── */

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  sessionToken: string;
  admin: {
    id: string;
    email: string;
    roles: string[];
  };
}

export interface AdminMetrics {
  totalFarmers: number;
  totalFarms: number;
  plansGenerated: number;
  activeFarms: number;
  llmCost: { amount: number; currency: string };
}

export interface AdminAuditLog {
  id: string;
  actorAdminId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/* ────────────────────────────────────────────────────────────
   Re-exports: client + fixtures
   ──────────────────────────────────────────────────────────── */

export { ApiClient } from './client';
export type { ApiClientConfig, RequestOptions } from './client';
export * from './fixtures';
