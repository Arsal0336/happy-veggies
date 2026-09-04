import type {
  CropCycleDto,
  Experiment,
  ExperimentalOpportunity,
  ExperimentalOutcomeRequest,
  ExperimentalStatusDto,
} from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import {
  appendExperiment,
  delay,
  fixtureExperiments,
  fixtureOpportunities,
  nextId,
} from '../fixtures';
import {
  mapExperimentalToExperiments,
  mapExperimentalToOpportunities,
} from '../mappers';

async function fetchExperimental(
  farmId: string,
): Promise<ExperimentalStatusDto> {
  return farmerApi.get<ExperimentalStatusDto>(`/farms/${farmId}/experimental`);
}

export const experimentalService = {
  async getStatus(farmId: string): Promise<ExperimentalStatusDto> {
    if (useFixtures()) {
      await delay();
      return {
        experimentalAreas: fixtureOpportunities
          .filter((o) => o.farmId === farmId)
          .map((o) => ({
            id: o.productionAreaId,
            name: o.cropName ?? o.hypothesis ?? null,
            areaInputValue: o.area?.value ?? 0,
            areaInputUnit: o.area?.unit ?? 'kanal',
          })),
        experimentalZones: fixtureExperiments
          .filter((e) => e.farmId === farmId)
          .map((e) => ({
            id: e.id,
            label: e.hypothesis,
            cropId: e.cropId ?? null,
            cropFreetext: e.cropName ?? null,
            seedVarietyId: null,
            plantingDate: null,
            growthStage: e.status === 'approved' ? 'approved_experimental' : e.status,
            areaInputValue: e.predictedYield?.value ?? 0,
            areaInputUnit: e.predictedYield?.unit ?? 'kg',
          })),
      };
    }
    return fetchExperimental(farmId);
  },

  async listOpportunities(farmId: string): Promise<ExperimentalOpportunity[]> {
    if (useFixtures()) {
      await delay();
      return fixtureOpportunities.filter((o) => o.farmId === farmId);
    }
    const data = await fetchExperimental(farmId);
    return mapExperimentalToOpportunities(farmId, data);
  },

  async listExperiments(farmId: string): Promise<Experiment[]> {
    if (useFixtures()) {
      await delay();
      return fixtureExperiments.filter((e) => e.farmId === farmId);
    }
    const data = await fetchExperimental(farmId);
    return mapExperimentalToExperiments(farmId, data);
  },

  /**
   * Fixture: start from opportunity.
   * Live: POST /experimental/zones/{zoneId}/approve (no generic start endpoint).
   */
  async startExperiment(
    farmId: string,
    opportunityOrZoneId: string,
  ): Promise<Experiment> {
    if (useFixtures()) {
      await delay();
      const opp = fixtureOpportunities.find((o) => o.id === opportunityOrZoneId);
      const experiment: Experiment = {
        id: nextId('exp'),
        farmId,
        productionAreaId: opp?.productionAreaId ?? 'area-001',
        cropId: opp?.cropId,
        cropName: opp?.cropName,
        hypothesis: opp?.hypothesis ?? 'New experiment',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      appendExperiment(experiment);
      return experiment;
    }

    await farmerApi.post(
      `/farms/${farmId}/experimental/zones/${opportunityOrZoneId}/approve`,
    );

    const experiments = await this.listExperiments(farmId);
    const approved = experiments.find((e) => e.id === opportunityOrZoneId);
    if (approved) return { ...approved, status: 'approved' };

    return {
      id: opportunityOrZoneId,
      farmId,
      productionAreaId: opportunityOrZoneId,
      hypothesis: 'Experimental zone approved',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };
  },

  async approveZone(farmId: string, zoneId: string): Promise<Experiment> {
    return this.startExperiment(farmId, zoneId);
  },

  async recordOutcome(
    farmId: string,
    zoneId: string,
    body: ExperimentalOutcomeRequest,
  ): Promise<CropCycleDto> {
    if (useFixtures()) {
      await delay();
      const exp = fixtureExperiments.find((e) => e.id === zoneId);
      if (exp) {
        exp.status = 'completed';
        if (body.actualYield != null) {
          exp.actualYield = {
            value: body.actualYield,
            unit: body.actualYieldUnit ?? 'kg',
          };
        }
        if (body.notes) exp.notes = body.notes;
      }
      return {
        id: nextId('cycle'),
        cropZoneId: zoneId,
        zoneLabel: exp?.hypothesis ?? null,
        isExperimental: true,
        season: '2026-Kharif',
        predictedYield: body.predictedYield ?? exp?.predictedYield?.value ?? null,
        predictedYieldUnit: body.predictedYieldUnit ?? 'kg',
        actualYield: body.actualYield ?? null,
        actualYieldUnit: body.actualYieldUnit ?? 'kg',
        delta:
          body.actualYield != null && (body.predictedYield ?? exp?.predictedYield?.value) != null
            ? body.actualYield - (body.predictedYield ?? exp!.predictedYield!.value)
            : null,
        notes: body.notes ?? null,
        endedAt: body.endedAt ?? new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return farmerApi.post<CropCycleDto>(
      `/farms/${farmId}/experimental/zones/${zoneId}/outcome`,
      body,
    );
  },
};
