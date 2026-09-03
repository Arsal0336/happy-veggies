import { Card, Badge, CompatibilityBadge } from '@hv/ui';
import { fixtureCrops, fixtureCompatibility } from '@hv/api-types';

export function SeedDataPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[var(--hv-text-2xl)] font-bold">Seed Data Management</h1>

      <Card padding="none">
        <div className="px-4 py-3 border-b border-[var(--hv-color-neutral-200)]">
          <h2 className="font-semibold">Crop Catalog</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="bg-[var(--hv-color-neutral-50)] border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start px-4 py-3 font-medium">ID</th>
              <th className="text-start px-4 py-3 font-medium">English</th>
              <th className="text-start px-4 py-3 font-medium">Urdu</th>
              <th className="text-start px-4 py-3 font-medium">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {fixtureCrops.map((crop) => (
              <tr key={crop.id} className="border-b border-[var(--hv-color-neutral-100)]">
                <td className="px-4 py-3 font-mono text-[var(--hv-text-xs)] max-w-[8rem] truncate">{crop.id}</td>
                <td className="px-4 py-3">{crop.nameEn}</td>
                <td className="px-4 py-3">{crop.nameUr}</td>
                <td className="px-4 py-3">
                  <Badge variant={crop.enabled ? 'success' : 'neutral'} size="sm">
                    {crop.enabled ? 'Yes' : 'No'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      <Card padding="none">
        <div className="px-4 py-3 border-b border-[var(--hv-color-neutral-200)]">
          <h2 className="font-semibold">Compatibility Table</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="bg-[var(--hv-color-neutral-50)] border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start px-4 py-3 font-medium">Crop A</th>
              <th className="text-start px-4 py-3 font-medium">Crop B</th>
              <th className="text-start px-4 py-3 font-medium">Relation</th>
              <th className="text-start px-4 py-3 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {fixtureCompatibility.map((c, i) => (
              <tr key={i} className="border-b border-[var(--hv-color-neutral-100)]">
                <td className="px-4 py-3 font-mono text-[var(--hv-text-xs)]">{c.cropAId}</td>
                <td className="px-4 py-3 font-mono text-[var(--hv-text-xs)]">{c.cropBId}</td>
                <td className="px-4 py-3">
                  <CompatibilityBadge relation={c.relation} />
                </td>
                <td className="px-4 py-3 text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)] max-w-xs">{c.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
