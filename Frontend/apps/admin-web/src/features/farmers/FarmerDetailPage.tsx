import { useParams, Link } from 'react-router-dom';
import { Card, Badge, FarmGraphic } from '@hv/ui';
import {
  fixtureAdminFarmers,
  fixtureFarms,
  fixturePlan,
  fixtureProductionAreas,
  fixtureCropZones,
} from '@hv/api-types';

export function FarmerDetailPage() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const farmer = fixtureAdminFarmers.find((f) => f.id === farmerId);

  if (!farmer) {
    return (
      <div className="flex flex-col gap-4">
        <Link to="/farmers" className="text-[var(--hv-color-primary-600)] hover:underline text-[var(--hv-text-sm)]">
          ← Back to Farmers
        </Link>
        <p className="text-[var(--hv-color-neutral-500)]">Farmer not found.</p>
      </div>
    );
  }

  const farms = fixtureFarms.filter((f) => f.farmerId === farmer.id);

  return (
    <div className="flex flex-col gap-6">
      <Link to="/farmers" className="text-[var(--hv-color-primary-600)] hover:underline text-[var(--hv-text-sm)]">
        ← Back to Farmers
      </Link>

      <h1 className="text-2xl font-bold">{farmer.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Phone</p>
          <p className="font-mono">{farmer.phone}</p>
        </Card>
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Region</p>
          <p>{farmer.region}</p>
        </Card>
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">Registered</p>
          <p>{new Date(farmer.createdAt).toLocaleDateString()}</p>
        </Card>
      </div>

      {/* Farms */}
      <Card padding="md">
        <h2 className="font-semibold mb-3">Farms ({farms.length})</h2>
        {farms.length === 0 && (
          <p className="text-[var(--hv-color-neutral-500)] text-[var(--hv-text-sm)]">No farms found.</p>
        )}
        {farms.map((farm) => (
          <div key={farm.id} className="border-b border-[var(--hv-color-neutral-100)] py-3 last:border-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{farm.name ?? 'Unnamed'}</span>
              <Badge variant="neutral" size="sm">{farm.regionLabel}</Badge>
            </div>
            <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
              {farm.areaInput.value} {farm.areaInput.unit}
            </p>
          </div>
        ))}
      </Card>

      {/* Farm Graphic (read-only) */}
      {farms.length > 0 && (
        <Card padding="md">
          <h2 className="font-semibold mb-3">Farm Layout</h2>
          <FarmGraphic
            areas={fixtureProductionAreas}
            zones={fixtureCropZones}
          />
        </Card>
      )}

      {/* Plans */}
      <Card padding="md">
        <h2 className="font-semibold mb-3">Plans</h2>
        {farmer.id === fixturePlan.farmerId ? (
          <div className="text-[var(--hv-text-sm)]">
            <p>
              <span className="font-medium">Plan {fixturePlan.id}</span>{' '}
              <Badge variant="success" size="sm">v{fixturePlan.version}</Badge>
            </p>
            <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)] mt-1">
              Generated {new Date(fixturePlan.createdAt).toLocaleDateString()} — {fixturePlan.content.recommendedCrops.length} recommended crops
            </p>
          </div>
        ) : (
          <p className="text-[var(--hv-color-neutral-500)] text-[var(--hv-text-sm)]">No plans generated.</p>
        )}
      </Card>
    </div>
  );
}
