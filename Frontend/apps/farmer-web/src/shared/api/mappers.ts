/**
 * Maps HappyVeggie ASP.NET backend DTOs → UI shapes used by farmer-web components.
 */

import type {
  Alert,
  CompatibilityRelation,
  CropSuggestionDto,
  CropZone,
  Experiment,
  ExperimentalOpportunity,
  ExperimentalStatusDto,
  Farm,
  FarmAlertDto,
  FarmTwinDto,
  GreenScore,
  GreenScoreResult,
  Language,
  NeighbourEdge,
  PlanDetail,
  PlanDto,
  PlanSection,
  ProductionArea,
  ProductionAreaTypeCode,
  Suggestion,
  TwinDto,
  ValueUnit,
} from '@hv/api-types';

export const GREEN_NON_CERT_DISCLAIMER =
  'This green score is a guidance indicator only and is not a certification.';

export const PLAN_ADVISORY_DISCLAIMER =
  'Advisory only — verify with local agronomic guidance.';

function asUnit(value: number, unit: string): ValueUnit {
  return { value, unit };
}

function parseJsonSafe(raw: string | null | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/** Ensure Farm has UI `area` from areaInputValue/areaInputUnit. */
export function mapFarm(dto: Farm): Farm {
  const areaInputValue = dto.areaInputValue ?? dto.area?.value ?? 0;
  const areaInputUnit = dto.areaInputUnit ?? dto.area?.unit ?? 'acre';
  return {
    ...dto,
    areaInputValue,
    areaInputUnit,
    area: dto.area ?? asUnit(areaInputValue, areaInputUnit),
  };
}

export function mapProductionArea(
  dto: Omit<ProductionArea, 'area'> & Partial<Pick<ProductionArea, 'area'>>,
  farmId?: string,
): ProductionArea {
  const areaInputValue = dto.areaInputValue ?? dto.area?.value ?? 0;
  const areaInputUnit = dto.areaInputUnit ?? dto.area?.unit ?? 'acre';
  return {
    ...dto,
    farmId: dto.farmId || farmId || '',
    typeCode: (dto.typeCode || 'open_field') as ProductionAreaTypeCode,
    name: dto.name ?? '',
    areaInputValue,
    areaInputUnit,
    area: dto.area ?? asUnit(areaInputValue, areaInputUnit),
  };
}

export function mapCropZone(
  dto: Omit<CropZone, 'area'> & Partial<Pick<CropZone, 'area'>>,
  farmId?: string,
): CropZone {
  const areaInputValue = dto.areaInputValue ?? dto.area?.value ?? 0;
  const areaInputUnit = dto.areaInputUnit ?? dto.area?.unit ?? 'acre';
  const expectedYield =
    dto.expectedYield ??
    (dto.expectedYieldValue != null && dto.expectedYieldUnit
      ? asUnit(dto.expectedYieldValue, dto.expectedYieldUnit)
      : null);
  return {
    ...dto,
    farmId: dto.farmId || farmId || '',
    label: dto.label ?? '',
    areaInputValue,
    areaInputUnit,
    area: dto.area ?? asUnit(areaInputValue, areaInputUnit),
    expectedYield,
  };
}

function mapAdjacencyToRelation(adjacencyType?: string): CompatibilityRelation {
  const key = (adjacencyType ?? '').toLowerCase();
  if (key.includes('good') || key.includes('companion')) return 'good';
  if (key.includes('avoid') || key.includes('conflict') || key.includes('bad')) {
    return 'avoid';
  }
  return 'neutral';
}

export function mapNeighbourEdge(edge: {
  id?: string;
  cropZoneAId?: string;
  cropZoneBId?: string;
  zoneAId?: string;
  zoneBId?: string;
  adjacencyType?: string;
  relation?: CompatibilityRelation;
  reason?: string;
}): NeighbourEdge {
  return {
    id: edge.id,
    zoneAId: edge.zoneAId ?? edge.cropZoneAId ?? '',
    zoneBId: edge.zoneBId ?? edge.cropZoneBId ?? '',
    relation: edge.relation ?? mapAdjacencyToRelation(edge.adjacencyType),
    reason: edge.reason,
    adjacencyType: edge.adjacencyType,
  };
}

/** FarmTwinDto → TwinDto for FarmGraphic / TwinSummaryPanel. */
export function mapFarmTwin(dto: FarmTwinDto, farmerId = ''): TwinDto {
  const farm = mapFarm({
    id: dto.farm.id,
    farmerId,
    name: dto.farm.name,
    lat: dto.farm.lat,
    lng: dto.farm.lng,
    regionCode: dto.farm.regionCode,
    regionLabel: dto.farm.regionLabel,
    areaAcres: dto.farm.areaAcres,
    areaInputValue: dto.farm.areaInputValue,
    areaInputUnit: dto.farm.areaInputUnit,
    isNewFarmSetup: dto.farm.isNewFarmSetup,
  });

  const areas = (dto.areas ?? []).map((a) =>
    mapProductionArea(
      {
        id: a.id,
        farmId: farm.id,
        typeCode: a.typeCode as ProductionAreaTypeCode,
        name: a.name ?? '',
        areaInputValue: a.areaInputValue,
        areaInputUnit: a.areaInputUnit,
        areaCanonicalValue: a.areaCanonicalValue,
        temperatureC: a.temperatureC != null ? Number(a.temperatureC) : null,
        humidityPercent:
          a.humidityPercent != null ? Number(a.humidityPercent) : null,
        ventilation: a.ventilation,
        growingMedium: a.growingMedium,
        structureType: a.structureType,
      },
      farm.id,
    ),
  );

  const zones = (dto.zones ?? []).map((z) =>
    mapCropZone(
      {
        id: z.id,
        farmId: farm.id,
        productionAreaId: z.productionAreaId,
        label: z.label ?? '',
        areaInputValue: z.areaInputValue,
        areaInputUnit: z.areaInputUnit,
        areaCanonicalValue: z.areaCanonicalValue,
        cropId: z.cropId,
        cropFreetext: z.cropFreetext,
        seedVarietyId: z.seedVarietyId,
        plantingDate: z.plantingDate,
        growthStage: z.growthStage,
        expectedYieldValue: z.expectedYieldValue,
        expectedYieldUnit: z.expectedYieldUnit,
        expectedYieldProvenance: z.expectedYieldProvenance,
        isExperimental: z.isExperimental,
      },
      farm.id,
    ),
  );

  const sources = (dto.waterSummary?.sources ?? []).map((s) => ({
    id: s.id,
    farmId: farm.id,
    type: s.type,
    irrigationMethod: s.irrigationMethod ?? undefined,
  }));

  return {
    farm,
    areas,
    zones,
    neighbourEdges: (dto.neighbourEdges ?? []).map(mapNeighbourEdge),
    weather: dto.weather
      ? {
          forecastTrend: dto.weather.providerStatus ?? undefined,
          providerStatus: dto.weather.providerStatus,
        }
      : undefined,
    water: dto.waterSummary
      ? {
          sourceCount: dto.waterSummary.sourceCount,
          sources,
          irrigationMethod: sources[0]?.irrigationMethod,
          reliability: sources.length ? 'reliable' : undefined,
        }
      : undefined,
    soil: dto.soilSummary
      ? {
          profileCount: dto.soilSummary.profileCount,
          providerStatus: dto.soilSummary.providerStatus,
        }
      : undefined,
    greenSummary: {
      nonCertificationDisclaimer: GREEN_NON_CERT_DISCLAIMER,
    },
    layoutMode: dto.layoutMode || 'auto',
    twinRefreshedAt: dto.twinRefreshedAt,
    latestPlan: dto.latestPlan,
  };
}

/** Parse PlanDetail.contentJson into PlanSection[] for PlanSectionList. */
export function mapPlanDetailToPlanDto(detail: PlanDetail): PlanDto {
  const parsed = parseJsonSafe(detail.contentJson);
  const sections = contentJsonToSections(parsed, detail.contentJson);

  return {
    id: detail.id,
    farmId: detail.farmId,
    version: detail.version,
    language: detail.language,
    createdAt: detail.createdAt,
    contentJson: detail.contentJson,
    contextUsedJson: detail.contextUsedJson,
    disclaimer: PLAN_ADVISORY_DISCLAIMER,
    sections,
  };
}

function contentJsonToSections(
  parsed: unknown,
  rawFallback: string,
): PlanSection[] {
  if (!parsed) {
    return [
      {
        key: 'content',
        title: 'Plan',
        body: rawFallback || 'No plan content.',
      },
    ];
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item, i) => {
      if (item && typeof item === 'object') {
        const s = item as Record<string, unknown>;
        return {
          key: String(s.key ?? s.id ?? `section-${i}`),
          title: String(s.title ?? `Section ${i + 1}`),
          body: String(s.body ?? s.content ?? JSON.stringify(s)),
          items: Array.isArray(s.items)
            ? s.items.map((x) => String(x))
            : undefined,
        };
      }
      return {
        key: `section-${i}`,
        title: `Section ${i + 1}`,
        body: String(item),
      };
    });
  }

  if (typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.sections)) {
      return contentJsonToSections(obj.sections, rawFallback);
    }

    // Structured AI plan (GAP-031 / PlanJsonSchema)
    if (Array.isArray(obj.planSections) && obj.planSections.length) {
      return (obj.planSections as unknown[]).map((item, i) => {
        const s = (item ?? {}) as Record<string, unknown>;
        const recs = Array.isArray(s.recommendations)
          ? s.recommendations.map((x) => String(x))
          : undefined;
        return {
          key: String(s.sectionId ?? s.key ?? `section-${i}`),
          title: String(s.title ?? `Section ${i + 1}`),
          body: String(s.content ?? s.body ?? ''),
          items: recs,
        };
      });
    }

    const sections: PlanSection[] = [];

    if (obj.farmSummary && typeof obj.farmSummary === 'object') {
      const fs = obj.farmSummary as Record<string, unknown>;
      sections.push({
        key: 'overview',
        title: 'Farm summary',
        body: [
          fs.name != null ? `Name: ${String(fs.name)}` : null,
          fs.region != null ? `Region: ${String(fs.region)}` : null,
          fs.totalAcres != null ? `Area: ${String(fs.totalAcres)} acres` : null,
          fs.areaCount != null ? `Areas: ${String(fs.areaCount)}` : null,
          fs.zoneCount != null ? `Zones: ${String(fs.zoneCount)}` : null,
        ]
          .filter(Boolean)
          .join('. '),
      });
    }

    if (Array.isArray(obj.compatibilityWarnings) && obj.compatibilityWarnings.length) {
      sections.push({
        key: 'compatibility',
        title: 'Compatibility warnings',
        body: 'Review neighbour crop compatibility before planting.',
        items: obj.compatibilityWarnings.map((w) =>
          typeof w === 'string' ? w : JSON.stringify(w),
        ),
      });
    }

    if (obj.yieldEstimates != null) {
      sections.push({
        key: 'yield',
        title: 'Yield estimates',
        body:
          typeof obj.yieldEstimates === 'string'
            ? obj.yieldEstimates
            : JSON.stringify(obj.yieldEstimates, null, 2),
      });
    }

    if (obj.waterSources != null) {
      sections.push({
        key: 'water',
        title: 'Water',
        body: `Water sources on record: ${String(obj.waterSources)}`,
      });
    }

    if (obj.soilProfiles != null) {
      sections.push({
        key: 'soil',
        title: 'Soil',
        body: `Soil profiles on record: ${String(obj.soilProfiles)}`,
      });
    }

    if (sections.length) return sections;

    return Object.entries(obj).map(([key, value]) => ({
      key,
      title: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
      body:
        typeof value === 'string'
          ? value
          : JSON.stringify(value, null, 2),
    }));
  }

  return [
    {
      key: 'content',
      title: 'Plan',
      body: String(parsed),
    },
  ];
}

export function mapGreenScoreResult(
  farmId: string,
  result: GreenScoreResult,
): GreenScore {
  const dimensions: GreenScore['dimensions'] = {};
  const measuredVsEstimated: GreenScore['measuredVsEstimated'] = {};

  if (result.factors?.length) {
    for (const f of result.factors) {
      dimensions[f.key] = {
        score: f.points,
        available: f.available,
        explanation: f.available
          ? f.explanation
          : f.unavailableReason ?? f.explanation,
      };
      measuredVsEstimated[f.key] =
        f.dataQuality === 'measured'
          ? 'measured'
          : f.dataQuality === 'estimated'
            ? 'estimated'
            : 'estimated';
    }
  } else {
    (result.explanations ?? []).forEach((explanation, i) => {
      const available = !/^no\b/i.test(explanation) && !/not /i.test(explanation);
      dimensions[`factor_${i + 1}`] = {
        score: available ? Math.round(result.score / Math.max(result.explanations.length, 1)) : 0,
        available,
        explanation,
      };
    });
  }

  return {
    farmId,
    overallScore: result.score,
    maxScore: result.maxScore,
    dimensions,
    measuredVsEstimated,
    explanations: result.explanations,
    computedAt: result.computedAt,
    nonCertificationDisclaimer:
      result.nonCertificationDisclaimer || GREEN_NON_CERT_DISCLAIMER,
  };
}

export function mapFarmAlert(
  dto: FarmAlertDto,
  farmId?: string,
  index = 0,
): Alert {
  const createdAt = dto.createdAt || new Date().toISOString();
  const id = dto.id || [
    farmId ?? 'farm',
    dto.type,
    dto.targetId ?? '',
    createdAt,
    String(index),
  ].join(':');

  return {
    id,
    farmId,
    type: dto.type,
    title: dto.title,
    severity: dto.severity,
    message: dto.body || dto.message || dto.title || '',
    targetId: dto.targetId,
    sourceSignal: dto.sourceSignal,
    createdAt,
    read: dto.isRead ?? false,
  };
}

export function mapCropSuggestions(
  items: CropSuggestionDto[],
): Suggestion[] {
  return items.map((s) => ({
    cropId: s.cropId,
    farmCount: s.farmCount,
    source: s.source,
    reason:
      s.source === 'community' || s.farmCount > 0
        ? `${s.farmCount} nearby farm(s) grow this crop.`
        : 'Suggested based on farm context.',
    communitySignal:
      s.farmCount > 0 ? `${s.farmCount} farms in region` : undefined,
  }));
}

export function mapExperimentalToOpportunities(
  farmId: string,
  data: ExperimentalStatusDto,
): ExperimentalOpportunity[] {
  return (data.experimentalAreas ?? []).map((a) => ({
    id: a.id,
    farmId,
    productionAreaId: a.id,
    cropName: a.name ?? 'Experimental area',
    hypothesis: `Trial area: ${a.name ?? a.id}`,
    area: asUnit(a.areaInputValue, a.areaInputUnit),
    riskNote: 'Experimental production area — track outcomes carefully.',
  }));
}

export function mapExperimentalToExperiments(
  farmId: string,
  data: ExperimentalStatusDto,
): Experiment[] {
  return (data.experimentalZones ?? []).map((z) => ({
    id: z.id,
    farmId,
    productionAreaId: z.id,
    cropId: z.cropId ?? undefined,
    cropName: z.cropFreetext ?? z.cropId ?? z.label ?? undefined,
    hypothesis: z.label ?? z.cropFreetext ?? 'Experimental zone',
    status:
      z.growthStage === 'approved_experimental' ? 'approved' : 'active',
    notes: z.growthStage ?? undefined,
    createdAt: new Date().toISOString(),
  }));
}

export function mapFarmerProfileDto(dto: {
  id: string;
  phone: string;
  name: string;
  language: string;
}): { farmer: { id: string; phone: string; name: string; language: Language } } {
  return {
    farmer: {
      id: dto.id,
      phone: dto.phone,
      name: dto.name,
      language: (dto.language === 'ur' ? 'ur' : 'en') as Language,
    },
  };
}

/** FarmGraphic area type from backend typeCode. */
export function toFarmGraphicType(
  typeCode: string,
): 'open_field' | 'shed' | 'greenhouse' | 'tunnel' | 'experimental' {
  if (typeCode === 'tunnel_polyhouse') return 'tunnel';
  if (typeCode === 'other_protected') return 'shed';
  if (
    typeCode === 'open_field' ||
    typeCode === 'shed' ||
    typeCode === 'greenhouse' ||
    typeCode === 'experimental'
  ) {
    return typeCode;
  }
  return 'open_field';
}
