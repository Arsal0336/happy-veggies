/**
 * Shared TypeScript types for the Happy Veggie API contract.
 * Aligned with HappyVeggie ASP.NET DTOs under /api/v1.
 */

/* ── Common ───────────────────────────────────────────────── */

export type Language = 'en' | 'ur';

export type Provenance =
  | 'farmer_provided'
  | 'third_party_estimate'
  | 'observed_measured'
  | 'system_derived'
  | 'historical_reference';

export type ProductionAreaTypeCode =
  | 'open_field'
  | 'shed'
  | 'greenhouse'
  | 'tunnel_polyhouse'
  | 'experimental'
  | 'other_protected';

export type ProductionAreaCategory = 'open' | 'protected' | 'experimental';

export type LandUnit = 'acre' | 'kanal' | 'marla' | 'hectare';
export type CoveredUnit = 'sq_ft' | 'sq_m';
export type AreaUnit = LandUnit | CoveredUnit;

export type CompatibilityRelation = 'good' | 'avoid' | 'neutral';
export type SuitabilityBand = 'high' | 'medium' | 'low';
export type Confidence = 'low' | 'medium' | 'high';
export type RiskBand = 'low' | 'medium' | 'high';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertType =
  | 'weather'
  | 'reminder'
  | 'pest'
  | 'info'
  | 'missing_data'
  | 'stale_data'
  | string;
export type SoilType = 'sandy' | 'clay' | 'loam' | 'silt' | 'mixed' | 'unknown';
export type WaterSourceType =
  | 'canal'
  | 'tube_well'
  | 'rain_fed'
  | 'reservoir'
  | 'other';
export type WaterReliability = 'reliable' | 'seasonal' | 'unreliable';

export type GrowthStage =
  | 'pre_planting'
  | 'germination'
  | 'seedling'
  | 'vegetative'
  | 'flowering'
  | 'fruiting'
  | 'harvest'
  | 'post_harvest'
  | 'approved_experimental'
  | string;

/** Value + unit (Doc 05 §2 / §5) */
export interface ValueUnit {
  value: number;
  unit: string;
  provenance?: Provenance;
}

export interface MoneyAmount {
  amount: number;
  currency: string;
}

/* ── Error envelope (Doc 05 §4) ───────────────────────────── */

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorEnvelope {
  code: string;
  message: string;
  correlationId: string;
  errors?: ApiFieldError[];
  retryable?: boolean;
}

/* ── Pagination (Doc 05 §2) ───────────────────────────────── */

export interface Pagination<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

/* ── Auth ─────────────────────────────────────────────────── */

export interface OtpRequest {
  phone: string;
  language: Language;
}

export interface OtpRequestResponse {
  requestId: string;
  mode: 'mock' | 'live' | string;
}

export interface OtpVerify {
  requestId: string;
  phone: string;
  code: string;
}

export interface FarmerSummary {
  id: string;
  phone: string;
  name?: string | null;
  language: Language;
}

export interface OtpVerifyResponse {
  sessionToken: string;
  farmer: FarmerSummary;
  isNew: boolean;
}

/** POST /auth/refresh and POST /admin/auth/refresh */
export interface RefreshSessionResponse {
  sessionToken: string;
}

export interface FarmerProfileUpdate {
  name: string;
  language?: Language;
}

/** POST /farmers/me/profile raw response */
export interface FarmerProfileDto {
  id: string;
  phone: string;
  name: string;
  language: Language | string;
}

export interface FarmerProfileUpdateResponse {
  farmer: FarmerSummary;
}

/* ── Farm / ProductionArea / CropZone (backend DTOs + UI area) ─ */

/** FarmDto — GET/POST/PATCH /farms */
export interface Farm {
  id: string;
  farmerId: string;
  name?: string | null;
  lat: number;
  lng: number;
  regionCode: string;
  regionLabel?: string;
  areaAcres?: number;
  areaInputValue: number;
  areaInputUnit: string;
  preferredCropId?: string | null;
  preferredCropFreeText?: string | null;
  isNewFarmSetup?: boolean;
  soilType?: SoilType | string | null;
  waterAccess?: boolean | null;
  waterSource?: WaterSourceType | string | null;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
  letAiChooseCrop?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** UI convenience — mapped from areaInputValue/areaInputUnit */
  area?: ValueUnit;
}

export interface CreateFarmRequest {
  name?: string | null;
  lat: number;
  lng: number;
  regionCode: string;
  regionLabel: string;
  areaInputValue: number;
  areaInputUnit: string;
  preferredCropId?: string | null;
  preferredCropFreeText?: string | null;
  isNewFarmSetup: boolean;
  soilType?: string | null;
  waterAccess?: boolean | null;
  waterSource?: string | null;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
  letAiChooseCrop: boolean;
}

export interface UpdateFarmRequest {
  name?: string | null;
  lat?: number;
  lng?: number;
  regionCode?: string;
  regionLabel?: string;
  areaInputValue?: number;
  areaInputUnit?: string;
  preferredCropId?: string | null;
  preferredCropFreeText?: string | null;
  soilType?: string | null;
  waterAccess?: boolean | null;
  waterSource?: string | null;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
  letAiChooseCrop?: boolean;
}

/** ProductionAreaDetailDto (+ UI area) */
export interface ProductionArea {
  id: string;
  farmId: string;
  typeCode: ProductionAreaTypeCode | string;
  typeLabel?: string;
  name?: string | null;
  areaInputValue: number;
  areaInputUnit: string;
  areaCanonicalValue?: number;
  temperatureC?: number | null;
  temperatureProvenance?: string | null;
  humidityPercent?: number | null;
  humidityProvenance?: string | null;
  ventilation?: string | null;
  growingMedium?: string | null;
  structureType?: string | null;
  envAttributes?: Record<string, ValueUnit | string | null>;
  layout?: { x: number; y: number; w: number; h: number };
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** UI convenience */
  area: ValueUnit;
}

/** CropZoneDetailDto (+ UI area / expectedYield) */
export interface CropZone {
  id: string;
  productionAreaId: string;
  farmId: string;
  label?: string | null;
  areaInputValue: number;
  areaInputUnit: string;
  areaCanonicalValue?: number;
  cropId?: string | null;
  cropFreetext?: string | null;
  seedVarietyId?: string | null;
  plantingDate?: string | null;
  growthStage?: GrowthStage | null;
  expectedYieldValue?: number | null;
  expectedYieldUnit?: string | null;
  expectedYieldProvenance?: string | null;
  expectedYield?: ValueUnit | null;
  isExperimental?: boolean;
  neighbourIds?: string[];
  layout?: { x: number; y: number; w: number; h: number };
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** UI convenience */
  area: ValueUnit;
}

/* ── Twin (FarmTwinDto → UI TwinDto via mapper) ───────────── */

export interface FarmTwinFarmSummary {
  id: string;
  name?: string | null;
  lat: number;
  lng: number;
  regionCode: string;
  regionLabel: string;
  areaAcres: number;
  areaInputValue: number;
  areaInputUnit: string;
  isNewFarmSetup: boolean;
}

export interface FarmTwinAreaDto {
  id: string;
  typeCode: string;
  name?: string | null;
  areaInputValue: number;
  areaInputUnit: string;
  areaCanonicalValue: number;
  temperatureC?: string | null;
  humidityPercent?: string | null;
  ventilation?: string | null;
  growingMedium?: string | null;
  structureType?: string | null;
}

export interface FarmTwinZoneDto {
  id: string;
  productionAreaId: string;
  label?: string | null;
  areaInputValue: number;
  areaInputUnit: string;
  areaCanonicalValue: number;
  cropId?: string | null;
  cropFreetext?: string | null;
  seedVarietyId?: string | null;
  plantingDate?: string | null;
  growthStage?: string | null;
  expectedYieldValue?: number | null;
  expectedYieldUnit?: string | null;
  expectedYieldProvenance?: string | null;
  isExperimental: boolean;
}

export interface FarmTwinNeighbourEdgeDto {
  id: string;
  cropZoneAId: string;
  cropZoneBId: string;
  adjacencyType: string;
}

export interface FarmTwinDto {
  farm: FarmTwinFarmSummary;
  areas: FarmTwinAreaDto[];
  zones: FarmTwinZoneDto[];
  neighbourEdges: FarmTwinNeighbourEdgeDto[];
  weather?: {
    providerStatus?: string | null;
    temperatureC?: number | null;
    humidityPercent?: number | null;
    windSpeedKmh?: number | null;
    rainfallMm?: number | null;
    condition?: string | null;
    forecastTrend?: string | null;
    observedAt?: string | null;
  } | null;
  waterSummary?: {
    sourceCount: number;
    sources: Array<{ id: string; type: string; irrigationMethod?: string | null }>;
    reliability?: string | null;
    irrigationMethod?: string | null;
  } | null;
  soilSummary?: {
    profileCount: number;
    providerStatus?: string | null;
    soilType?: string | null;
    texture?: string | null;
    phLevel?: number | null;
    organicMatterPercent?: number | null;
  } | null;
  greenSummary?: {
    overallScore?: number;
    maxScore?: number;
    nonCertificationDisclaimer?: string;
    weightsNote?: string | null;
    computedAt?: string;
    factors?: Array<{
      key: string;
      label: string;
      available: boolean;
      points: number;
      maxPoints: number;
      explanation: string;
      dataQuality: string;
    }>;
  } | null;
  latestPlan?: {
    id: string;
    version: number;
    language: string;
    createdAt: string;
  } | null;
  layoutMode: string;
  twinRefreshedAt?: string | null;
}

export interface WeatherSnapshot {
  temperature?: ValueUnit;
  rainProbability?: number;
  rainfall?: ValueUnit;
  humidity?: number;
  wind?: ValueUnit;
  extremeAlerts?: string[];
  forecastTrend?: string;
  provenance?: Provenance;
  providerStatus?: string | null;
}

export interface SoilProfile {
  type?: SoilType | string;
  ph?: ValueUnit;
  organicMatter?: ValueUnit;
  texture?: string;
  nutrients?: Record<string, ValueUnit>;
  provenance?: Provenance;
  profileCount?: number;
  providerStatus?: string | null;
}

export interface WaterSummary {
  sources?: WaterSource[];
  irrigationMethod?: string;
  reliability?: WaterReliability | string;
  sourceCount?: number;
}

export interface WaterSource {
  id: string;
  farmId: string;
  type: WaterSourceType | string;
  availability?: boolean;
  seasonalAvailability?: boolean | string | null;
  capacityEstimate?: ValueUnit;
  capacityEstimateValue?: number | null;
  capacityEstimateUnit?: string | null;
  reliability?: WaterReliability | string;
  reliabilityValue?: number | null;
  irrigationMethod?: string | null;
  servedAreaIds?: string[];
  provenance?: Provenance;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWaterSourceRequest {
  type: string;
  seasonalAvailability?: string | null;
  capacityEstimateValue?: number | null;
  capacityEstimateUnit?: string | null;
  irrigationMethod?: string | null;
  reliabilityValue?: number | null;
  availabilityValue?: number | null;
  availabilityUnit?: string | null;
  provenance?: Provenance | string;
}

export type UpdateWaterSourceRequest = Partial<CreateWaterSourceRequest>;

/** Persisted soil profile (list/upsert) — distinct from twin SoilProfile chip */
export interface SoilProfileRecord {
  id: string;
  farmId: string;
  productionAreaId?: string | null;
  soilType?: string | null;
  soilTypeProvenance?: Provenance | string | null;
  texture?: string | null;
  textureProvenance?: Provenance | string | null;
  phValue?: number | null;
  phValueProvenance?: Provenance | string | null;
  organicMatterValue?: number | null;
  organicMatterProvenance?: Provenance | string | null;
  nitrogenValue?: number | null;
  phosphorusValue?: number | null;
  potassiumValue?: number | null;
  farmerNotes?: string | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpsertSoilProfileRequest {
  id?: string | null;
  productionAreaId?: string | null;
  soilType?: string | null;
  texture?: string | null;
  phValue?: number | null;
  organicMatterValue?: number | null;
  nitrogenValue?: number | null;
  phosphorusValue?: number | null;
  potassiumValue?: number | null;
  farmerNotes?: string | null;
  /** Overall provenance for farmer-provided upserts */
  provenance?: Provenance | string;
}

export interface GreenSummary {
  overallScore?: number;
  dimensions?: Record<
    string,
    { score: number; available: boolean; explanation?: string }
  >;
  measuredVsEstimated?: Record<string, 'measured' | 'estimated'>;
  computedAt?: string;
  nonCertificationDisclaimer: string;
}

export interface NeighbourEdge {
  zoneAId: string;
  zoneBId: string;
  relation: CompatibilityRelation;
  reason?: string;
  id?: string;
  adjacencyType?: string;
}

/** UI twin shape used by farmer-web components */
export interface TwinDto {
  farm: Farm;
  areas: ProductionArea[];
  zones: CropZone[];
  weather?: WeatherSnapshot;
  soil?: SoilProfile;
  water?: WaterSummary;
  greenSummary?: GreenSummary;
  neighbourEdges?: NeighbourEdge[];
  layoutMode?: 'auto' | 'stored' | string;
  twinRefreshedAt?: string | null;
  latestPlan?: FarmTwinDto['latestPlan'];
}

/* ── Plan ─────────────────────────────────────────────────── */

export interface PlanSection {
  key: string;
  title: string;
  body: string;
  items?: string[];
}

/** Backend PlanDetailDto */
export interface PlanDetail {
  id: string;
  farmId: string;
  version: number;
  language: Language | string;
  contentJson: string;
  contextUsedJson?: string | null;
  createdAt: string;
}

/** UI plan shape (sections parsed from contentJson) */
export interface PlanDto {
  id: string;
  farmId: string;
  sections: PlanSection[];
  version: number;
  language: Language | string;
  createdAt: string;
  disclaimer?: string;
  contentJson?: string;
  contextUsedJson?: string | null;
}

/** @deprecated Backend returns PlanDetail directly from POST /plan */
export interface PlanGenerateResponse {
  planId: string;
  plan: PlanDto;
}

/* ── Economics / yield ────────────────────────────────────── */

export interface GovernmentReferenceRate {
  amount: number;
  currency: string;
  unit: string;
  periodLabel: string;
  label: 'historical_reference';
}

export interface ExpectedYield {
  value: number;
  unit: string;
  confidence?: Confidence;
  label?: 'estimated' | 'measured';
}

export interface EconomicsDto {
  expectedYield: ExpectedYield;
  governmentReferenceRate: GovernmentReferenceRate;
  referenceGrossValue: MoneyAmount;
  riskBand?: RiskBand;
}

/** Backend EconomicSnapshot (compute-on-read GET /farms/{id}/economics) */
export interface FarmEconomicSnapshot {
  cropId: string;
  expectedYield: number;
  yieldUnit: string;
  ratePerUnit: number;
  currency: string;
  referenceGrossValue: number;
  period: string;
  sourceLabel?: string | null;
  label?: 'historical_reference';
}

export interface FarmEconomicsResponse {
  snapshots: FarmEconomicSnapshot[];
  disclaimer: string;
}

/* ── Nearby suggestions ───────────────────────────────────── */

export type SuggestionSource = 'community' | 'ai_only' | string;

/** Backend CropSuggestionDto */
export interface CropSuggestionDto {
  cropId: string;
  farmCount: number;
  source: SuggestionSource;
}

export interface Suggestion {
  cropId: string;
  cropName?: string;
  reason: string;
  source: SuggestionSource;
  communitySignal?: string;
  farmCount?: number;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
}

/** Backend SeedVarietySuggestionDto — GET .../seed-suggestions/{cropId} */
export interface SeedVarietySuggestionDto {
  id: string;
  nameEn: string;
  nameUr: string;
  varietyType: string;
  riskBand: string;
  maturityDays?: number | null;
  soilNotes?: string | null;
  waterNotes?: string | null;
  diseaseResistanceNotes?: string | null;
}

/* ── Neighbour edges (GAP-033) ────────────────────────────── */

export interface NeighbourEdgeApiDto {
  id: string;
  farmId: string;
  zoneAId: string;
  zoneBId: string;
  adjacencyType: string;
  enabled: boolean;
}

export interface NeighbourWarningApiDto {
  zoneAId: string;
  zoneALabel?: string | null;
  zoneBId: string;
  zoneBLabel?: string | null;
  reason?: string | null;
}

/* ── Green score ──────────────────────────────────────────── */

/** Backend GreenScoreResult */
export interface GreenScoreFactor {
  key: string;
  label: string;
  available: boolean;
  unavailableReason?: string | null;
  dataQuality: 'measured' | 'estimated' | 'unavailable' | string;
  points: number;
  maxPoints: number;
  explanation: string;
}

export interface GreenScoreResult {
  score: number;
  maxScore: number;
  explanations: string[];
  factors?: GreenScoreFactor[];
  nonCertificationDisclaimer?: string;
  weightsNote?: string;
  computedAt: string;
}

export interface GreenTipResult {
  score: number;
  maxScore: number;
  tips: string;
  factors: string[];
}

/** UI green score shape */
export interface GreenScore {
  farmId: string;
  overallScore: number;
  maxScore?: number;
  dimensions: Record<
    string,
    {
      score: number;
      available: boolean;
      explanation?: string;
    }
  >;
  measuredVsEstimated?: Record<string, 'measured' | 'estimated'>;
  dataAvailabilityMap?: Record<string, boolean>;
  explanations?: string[];
  computedAt: string;
  nonCertificationDisclaimer: string;
}

/* ── Experimental ─────────────────────────────────────────── */

export type ExperimentStatus =
  | 'draft'
  | 'active'
  | 'completed'
  | 'abandoned'
  | 'approved'
  | string;

export interface ExperimentalStatusDto {
  experimentalAreas: Array<{
    id: string;
    name?: string | null;
    areaInputValue: number;
    areaInputUnit: string;
  }>;
  experimentalZones: Array<{
    id: string;
    label?: string | null;
    cropId?: string | null;
    cropFreetext?: string | null;
    seedVarietyId?: string | null;
    plantingDate?: string | null;
    growthStage?: string | null;
    areaInputValue: number;
    areaInputUnit: string;
  }>;
}

export interface ExperimentalOpportunity {
  id: string;
  farmId: string;
  productionAreaId: string;
  cropId?: string;
  cropName?: string;
  hypothesis?: string;
  area?: ValueUnit;
  riskNote?: string;
}

export interface Experiment {
  id: string;
  farmId: string;
  productionAreaId: string;
  cropId?: string;
  cropName?: string;
  hypothesis: string;
  status: ExperimentStatus;
  predictedYield?: ValueUnit;
  actualYield?: ValueUnit;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/* ── Assistant ────────────────────────────────────────────── */

export interface AssistantMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant' | string;
  content: string;
  citations?: string[];
  citationsJson?: string | null;
  disclaimer?: string;
  createdAt: string;
}

export interface AssistantThread {
  id: string;
  farmId: string;
  title?: string | null;
  messages?: AssistantMessage[];
  createdAt: string;
  lastMessageAt?: string | null;
}

export interface PostAssistantMessageRequest {
  text: string;
}

export interface PostAssistantMessageResponse {
  message: AssistantMessage;
  citations?: string[];
  disclaimer?: string;
}

/* ── Alerts ───────────────────────────────────────────────── */

/** Backend FarmAlertDto — persisted (GAP-050) */
export interface FarmAlertDto {
  id: string;
  type: string;
  severity: string;
  title: string;
  body: string;
  isRead: boolean;
  sourceSignal?: string | null;
  createdAt: string;
  /** @deprecated use body */
  message?: string;
  targetId?: string | null;
}

/** UI alert shape */
export interface Alert {
  id: string;
  farmerId?: string;
  farmId?: string;
  type: AlertType;
  title?: string;
  message: string;
  severity: AlertSeverity | string;
  actionRef?: string;
  targetId?: string | null;
  sourceSignal?: string | null;
  read?: boolean;
  createdAt: string;
}

/** Crop cycle learning comparison (GAP-052) */
export interface CropCycleDto {
  id: string;
  cropZoneId: string;
  zoneLabel?: string | null;
  isExperimental: boolean;
  season: string;
  predictedYield?: number | null;
  predictedYieldUnit?: string | null;
  actualYield?: number | null;
  actualYieldUnit?: string | null;
  delta?: number | null;
  notes?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordActualsRequest {
  actualYield?: number | null;
  actualYieldUnit?: string | null;
  notes?: string | null;
  endedAt?: string | null;
}

export interface ExperimentalOutcomeRequest {
  actualYield?: number | null;
  actualYieldUnit?: string | null;
  notes?: string | null;
  endedAt?: string | null;
  predictedYield?: number | null;
  predictedYieldUnit?: string | null;
}

/** Portfolio optimizer — PyPortfolioOpt (GAP-054) */
export interface PortfolioAllocation {
  cropId: string;
  cropName: string;
  areaType?: string | null;
  weight: number;
  allocatedAcres: number;
  suitability: number;
  waterFit: number;
  greenFactor: number;
}

export interface PortfolioResponse {
  status: 'ok' | 'degraded' | 'empty' | 'blocked' | string;
  reason?: string | null;
  engine: string;
  method: string;
  farmId: string;
  totalAreaAcres: number;
  disclaimer: string;
  allocations: PortfolioAllocation[];
  expectedPortfolioReturn?: number | null;
  portfolioVolatility?: number | null;
}

/** @deprecated use PortfolioResponse */
export type PortfolioBlockedResponse = PortfolioResponse;

/* ── Admin ────────────────────────────────────────────────── */

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}

export interface AdminLoginResponse {
  sessionToken: string;
  admin: AdminUser;
}

export interface AdminMe {
  id: string;
  email: string;
  name?: string;
  roles: string[];
}

export interface AdminMetrics {
  totalFarmers: number;
  totalFarms: number;
  plansGenerated: number;
  activeFarms?: number;
  llmCost?: MoneyAmount;
}

export interface AdminFarmerListItem {
  id: string;
  phone: string;
  name?: string | null;
  language: Language;
  farmCount: number;
  createdAt?: string;
}

export interface GovernmentRate {
  id: string;
  cropId: string;
  cropName?: string;
  amount: number;
  currency: string;
  unit: string;
  periodLabel: string;
  regionCode?: string;
  label: 'historical_reference';
  effectiveFrom?: string;
  effectiveTo?: string | null;
}

export interface AuditLogEntry {
  id: string;
  actorAdminId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  updatedAt?: string;
  updatedBy?: string;
}

/* ── Client ───────────────────────────────────────────────── */

export { ApiClient, ApiError, joinUrl } from './client';
export type { GetToken, OnUnauthorized, RequestOptions } from './client';
