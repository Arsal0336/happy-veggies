import { useState } from 'react';
import { Card, CompatibilityBadge } from '@hv/ui';
import { fixtureCrops, fixtureCompatibility, type CompatibilityRelation } from '@hv/api-types';

const RELATIONS: CompatibilityRelation[] = ['good', 'neutral', 'avoid'];

export function CompatibilityPage() {
  const crops = fixtureCrops.filter((c) => c.enabled);

  const [matrix, setMatrix] = useState<Record<string, CompatibilityRelation>>(() => {
    const m: Record<string, CompatibilityRelation> = {};
    for (const c of fixtureCompatibility) {
      m[`${c.cropAId}:${c.cropBId}`] = c.relation;
      m[`${c.cropBId}:${c.cropAId}`] = c.relation;
    }
    return m;
  });

  const getRelation = (a: string, b: string): CompatibilityRelation =>
    matrix[`${a}:${b}`] ?? 'neutral';

  const cycleRelation = (a: string, b: string) => {
    const current = getRelation(a, b);
    const next = RELATIONS[(RELATIONS.indexOf(current) + 1) % RELATIONS.length];
    setMatrix((prev) => ({
      ...prev,
      [`${a}:${b}`]: next,
      [`${b}:${a}`]: next,
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[var(--hv-text-2xl)] font-bold">Crop Compatibility Matrix</h1>
      <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)]">
        Click a cell to cycle between Good → Neutral → Avoid.
      </p>

      <Card padding="md">
        <div className="overflow-x-auto">
          <table className="text-[var(--hv-text-sm)]">
            <thead>
              <tr>
                <th className="sticky start-0 z-10 bg-[var(--hv-color-neutral-50)] px-3 py-2" />
                {crops.map((c) => (
                  <th key={c.id} className="sticky top-0 z-10 bg-[var(--hv-color-neutral-50)] px-3 py-2 text-center font-medium text-[var(--hv-text-xs)] whitespace-nowrap">
                    {c.nameEn}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crops.map((rowCrop) => (
                <tr key={rowCrop.id}>
                  <td className="sticky start-0 z-10 bg-white px-3 py-2 font-medium text-[var(--hv-text-xs)] whitespace-nowrap">
                    {rowCrop.nameEn}
                  </td>
                  {crops.map((colCrop) => {
                    if (rowCrop.id === colCrop.id) {
                      return (
                        <td key={colCrop.id} className="px-3 py-2 text-center">
                          <span className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-300)]">—</span>
                        </td>
                      );
                    }
                    return (
                      <td key={colCrop.id} className="px-3 py-2 text-center">
                        <button onClick={() => cycleRelation(rowCrop.id, colCrop.id)} className="cursor-pointer">
                          <CompatibilityBadge relation={getRelation(rowCrop.id, colCrop.id)} />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
