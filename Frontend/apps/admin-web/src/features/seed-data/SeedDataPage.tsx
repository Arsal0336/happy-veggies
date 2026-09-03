import { Card } from '@hv/ui';
import { fixtureCrops, fixtureCompatibility } from '@hv/api-types';

export function SeedDataPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Seed Data Management</h1>

      {/* Crops catalog */}
      <Card padding="md">
        <h2 className="font-semibold mb-3">Crop Catalog</h2>
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start py-2 font-medium">ID</th>
              <th className="text-start py-2 font-medium">English</th>
              <th className="text-start py-2 font-medium">Urdu</th>
              <th className="text-start py-2 font-medium">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {fixtureCrops.map((crop) => (
              <tr key={crop.id} className="border-b border-[var(--hv-color-neutral-100)]">
                <td className="py-2 font-mono text-[var(--hv-text-xs)]">{crop.id}</td>
                <td className="py-2">{crop.nameEn}</td>
                <td className="py-2">{crop.nameUr}</td>
                <td className="py-2">{crop.enabled ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Compatibility table */}
      <Card padding="md">
        <h2 className="font-semibold mb-3">Compatibility Table</h2>
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start py-2 font-medium">Crop A</th>
              <th className="text-start py-2 font-medium">Crop B</th>
              <th className="text-start py-2 font-medium">Relation</th>
              <th className="text-start py-2 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {fixtureCompatibility.map((c, i) => (
              <tr key={i} className="border-b border-[var(--hv-color-neutral-100)]">
                <td className="py-2 font-mono text-[var(--hv-text-xs)]">{c.cropAId}</td>
                <td className="py-2 font-mono text-[var(--hv-text-xs)]">{c.cropBId}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-[var(--hv-text-xs)] font-medium ${
                    c.relation === 'good' ? 'bg-green-100 text-green-700' :
                    c.relation === 'avoid' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {c.relation}
                  </span>
                </td>
                <td className="py-2 text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">{c.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
