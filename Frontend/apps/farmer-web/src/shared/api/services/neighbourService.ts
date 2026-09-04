import type { NeighbourEdgeApiDto, NeighbourWarningApiDto } from '@hv/api-types';
import { farmerApi } from '../apiInstance';
import { useFixtures } from '../env';
import { delay, fixtureNeighbourEdges, nextId } from '../fixtures';

type FixtureEdge = {
  id: string;
  farmId: string;
  zoneAId: string;
  zoneBId: string;
  adjacencyType: string;
  enabled: boolean;
};

const fixtureNeighbourStore: FixtureEdge[] = [];

export const neighbourService = {
  async listEdges(farmId: string): Promise<NeighbourEdgeApiDto[]> {
    if (useFixtures()) {
      await delay();
      const fromTwin = fixtureNeighbourEdges.map((e, i) => ({
        id: `fixture-edge-${i}`,
        farmId,
        zoneAId: e.zoneAId,
        zoneBId: e.zoneBId,
        adjacencyType: 'adjacent',
        enabled: true,
      }));
      return [
        ...fromTwin,
        ...fixtureNeighbourStore.filter((e) => e.farmId === farmId && e.enabled),
      ];
    }
    return (
      (await farmerApi.get<NeighbourEdgeApiDto[]>(
        `/farms/${farmId}/neighbour-edges`,
      )) ?? []
    );
  },

  async setEdge(
    farmId: string,
    zoneAId: string,
    zoneBId: string,
  ): Promise<NeighbourEdgeApiDto> {
    if (useFixtures()) {
      await delay();
      const edge: FixtureEdge = {
        id: nextId('edge'),
        farmId,
        zoneAId,
        zoneBId,
        adjacencyType: 'adjacent',
        enabled: true,
      };
      fixtureNeighbourStore.push(edge);
      return edge;
    }
    return farmerApi.put<NeighbourEdgeApiDto>(`/farms/${farmId}/neighbour-edges`, {
      zoneAId,
      zoneBId,
    });
  },

  async deleteEdge(farmId: string, edgeId: string): Promise<void> {
    if (useFixtures()) {
      await delay();
      const idx = fixtureNeighbourStore.findIndex(
        (e) => e.id === edgeId && e.farmId === farmId,
      );
      if (idx >= 0) fixtureNeighbourStore[idx]!.enabled = false;
      return;
    }
    await farmerApi.delete(`/farms/${farmId}/neighbour-edges/${edgeId}`);
  },

  async listWarnings(farmId: string): Promise<NeighbourWarningApiDto[]> {
    if (useFixtures()) {
      await delay();
      // Surface edge reasons as warnings when relation is not "good"
      return fixtureNeighbourEdges
        .filter((e) => e.relation !== 'good')
        .map((e) => ({
          zoneAId: e.zoneAId,
          zoneALabel: e.zoneAId,
          zoneBId: e.zoneBId,
          zoneBLabel: e.zoneBId,
          reason: e.reason ?? 'Compatibility caution',
        }));
    }
    return (
      (await farmerApi.get<NeighbourWarningApiDto[]>(
        `/farms/${farmId}/neighbour-warnings`,
      )) ?? []
    );
  },
};
