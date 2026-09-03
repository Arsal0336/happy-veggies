import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@hv/ui';
import type { CropZone } from '@hv/api-types';
import { fixtureCrops } from '@hv/api-types';

export interface ZoneDrawerProps {
  zone: CropZone | undefined;
  onClose: () => void;
}

export function ZoneDrawer({ zone, onClose }: ZoneDrawerProps) {
  const navigate = useNavigate();

  if (!zone) return null;

  const crop = fixtureCrops.find((c) => c.id === zone.cropId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-80 max-w-full bg-white h-full shadow-lg overflow-y-auto p-4 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[var(--hv-text-md)] font-bold">{zone.label}</h2>
          <button onClick={onClose} className="text-[var(--hv-color-neutral-400)] hover:text-[var(--hv-color-neutral-700)] text-xl">✕</button>
        </div>

        <Card padding="sm">
          <div className="flex flex-col gap-2 text-[var(--hv-text-sm)]">
            <p><strong>Crop:</strong> {crop?.nameEn ?? zone.cropFreetext ?? 'None'}</p>
            <p><strong>Stage:</strong> {zone.growthStage ?? 'Not planted'}</p>
            <p><strong>Area:</strong> {zone.area} {zone.areaUnit}</p>
            {zone.expectedYield && (
              <p><strong>Yield:</strong> {zone.expectedYield.value} {zone.expectedYield.unit}</p>
            )}
            {zone.plantingDate && (
              <p><strong>Planted:</strong> {zone.plantingDate}</p>
            )}
          </div>
        </Card>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/assistant/${zone.farmId}`)}
        >
          Ask Assistant about this zone
        </Button>
      </div>
    </div>
  );
}
