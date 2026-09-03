import type { ProductionArea } from '@hv/api-types';
import { ProductionAreaTypeIcon } from './ProductionAreaTypeIcon';

export interface FarmGraphicLegendProps {
  areas: ProductionArea[];
}

export function FarmGraphicLegend({ areas }: FarmGraphicLegendProps) {
  const byType = new Map<string, ProductionArea>();
  areas.forEach((a) => {
    if (!byType.has(a.typeCode)) byType.set(a.typeCode, a);
  });

  if (byType.size === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 text-[var(--hv-text-xs)]">
      {[...byType.values()].map((a) => (
        <span key={a.id} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-[var(--hv-color-neutral-200)] bg-white">
          <ProductionAreaTypeIcon type={a.typeCode} size="sm" />
          <span>{a.typeLabel}</span>
        </span>
      ))}
    </div>
  );
}

