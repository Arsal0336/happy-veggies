import { Drawer } from '@hv/ui';
import type { CropZone, NeighbourEdge } from '@hv/api-types';
import { useTranslation } from 'react-i18next';

export type ZoneDrawerProps = {
  open: boolean;
  zone: CropZone | null;
  neighbours: NeighbourEdge[];
  neighbourLabels: Record<string, string>;
  onClose: () => void;
};

/** Zone detail drawer — crop / variety / neighbour summary (GAP-062). */
export function ZoneDrawer({
  open,
  zone,
  neighbours,
  neighbourLabels,
  onClose,
}: ZoneDrawerProps) {
  const { t } = useTranslation();
  const title = zone?.label ?? zone?.cropFreetext ?? t('zones.title');

  return (
    <Drawer open={open && !!zone} title={title} onClose={onClose}>
      {zone && (
        <dl className="hv-stack">
          <div>
            <dt className="hv-muted hv-text-sm">{t('zones.crop')}</dt>
            <dd>{zone.cropFreetext ?? zone.cropId ?? '—'}</dd>
          </div>
          <div>
            <dt className="hv-muted hv-text-sm">{t('zones.variety')}</dt>
            <dd>{zone.seedVarietyId ?? '—'}</dd>
          </div>
          {zone.growthStage && (
            <div>
              <dt className="hv-muted hv-text-sm">{t('zones.growthStage')}</dt>
              <dd>{zone.growthStage}</dd>
            </div>
          )}
          <div>
            <dt className="hv-muted hv-text-sm">{t('zones.neighbours')}</dt>
            <dd>
              {neighbours.length === 0 ? (
                <span className="hv-muted">—</span>
              ) : (
                <ul className="hv-stack">
                  {neighbours.map((edge) => {
                    const otherId =
                      edge.zoneAId === zone.id ? edge.zoneBId : edge.zoneAId;
                    const label = neighbourLabels[otherId] ?? otherId;
                    return (
                      <li key={`${edge.zoneAId}-${edge.zoneBId}`}>
                        {label}
                        <span className="hv-muted"> · {edge.relation}</span>
                        {edge.reason ? (
                          <p className="hv-muted hv-text-sm">{edge.reason}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </dd>
          </div>
        </dl>
      )}
    </Drawer>
  );
}
