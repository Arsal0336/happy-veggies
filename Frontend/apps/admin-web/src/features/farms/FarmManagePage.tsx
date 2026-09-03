import { Card } from '@hv/ui';
import { fixtureFarms } from '@hv/api-types';

export function FarmManagePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[var(--hv-text-2xl)] font-bold">Farm Management</h1>

      <Card padding="none">
        <div className="overflow-x-auto">
        <table className="w-full text-[var(--hv-text-sm)]">
          <thead className="bg-[var(--hv-color-neutral-50)] border-b border-[var(--hv-color-neutral-200)]">
            <tr>
              <th className="text-start px-4 py-3 font-medium">Farm</th>
              <th className="text-start px-4 py-3 font-medium">Farmer</th>
              <th className="text-start px-4 py-3 font-medium">Region</th>
              <th className="text-start px-4 py-3 font-medium">Area</th>
            </tr>
          </thead>
          <tbody>
            {fixtureFarms.map((farm) => (
              <tr key={farm.id} className="border-b border-[var(--hv-color-neutral-100)] hover:bg-[var(--hv-color-neutral-50)]">
                <td className="px-4 py-3">{farm.name ?? 'Unnamed'}</td>
                <td className="px-4 py-3 text-[var(--hv-color-neutral-500)] max-w-[8rem] truncate">{farm.farmerId}</td>
                <td className="px-4 py-3">{farm.regionLabel}</td>
                <td className="px-4 py-3">{farm.areaInput.value} {farm.areaInput.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
