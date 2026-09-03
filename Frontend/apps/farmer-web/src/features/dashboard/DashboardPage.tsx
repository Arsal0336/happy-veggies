import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Spinner, ErrorState, Select, TwinSummaryPanel, AlertList, FarmGraphic, FarmGraphicLegend } from '@hv/ui';
import { fixtureCrops } from '@hv/api-types';
import { useAuth } from '../auth/AuthProvider';
import { useFarms, useTwin, useAlerts, useSuggestions } from '../../shared/api/hooks';
import { Badge } from '@hv/ui';

export function DashboardPage() {
  const { t } = useTranslation();
  const { farmer } = useAuth();

  const { data: farms, isLoading: farmsLoading, error: farmsError } = useFarms();

  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const activeFarmId = selectedFarmId || farms?.[0]?.id || '';

  const { data: twin } = useTwin(activeFarmId);
  const { data: alertsData } = useAlerts();
  const { data: suggestions } = useSuggestions();

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const cropsById = new Map(fixtureCrops.map((c) => [c.id, c]));

  if (farmsLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  if (farmsError) return <ErrorState error={farmsError instanceof Error ? farmsError : String(farmsError)} />;

  const alerts = alertsData ?? [];
  const visibleAlerts = alerts.map((a) =>
    dismissedAlerts.has(a.id) ? { ...a, read: true } : a,
  );

  const markRead = (alertId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(alertId));
  };

  const hasMultipleFarms = (farms?.length ?? 0) > 1;
  const farmOptions = (farms ?? []).map((f) => ({ value: f.id, label: f.name ?? f.id }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[var(--hv-text-xl)] font-bold text-[var(--hv-color-neutral-900)]">
          {t('dashboard.greeting', { name: farmer?.name ?? t('common.farmer') })}
        </h1>
        <p className="text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-500)] mt-1">
          {t('dashboard.summary')}
        </p>
      </div>

      {/* Farm selector */}
      {hasMultipleFarms && (
        <Select
          value={activeFarmId}
          onChange={(e) => setSelectedFarmId(e.target.value)}
          options={farmOptions}
        />
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
            {t('dashboard.totalFarms')}
          </p>
          <p className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-primary-600)]">
            {farms?.length ?? 0}
          </p>
        </Card>
        <Card padding="md">
          <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)]">
            {t('dashboard.alerts')}
          </p>
          <p className="text-[var(--hv-text-2xl)] font-bold text-[var(--hv-color-warning-600)]">
            {visibleAlerts.filter((a) => !a.read).length}
          </p>
        </Card>
      </div>

      {/* Twin summary panel */}
      {twin && <TwinSummaryPanel twin={twin} />}

      {/* Alerts via domain component */}
      <div>
        <h2 className="text-[var(--hv-text-base)] font-semibold mb-2">
          {t('dashboard.recentAlerts')}
        </h2>
        <AlertList alerts={visibleAlerts} onMarkRead={markRead} />
      </div>

      {/* Twin preview + graphic */}
      {twin && (
        <div>
          <h2 className="text-[var(--hv-text-base)] font-semibold mb-2">Twin preview</h2>
          <Card padding="md">
            <FarmGraphic
              areas={twin.areas}
              zones={twin.zones}
              neighbourEdges={twin.neighbourEdges}
            />
            <div className="mt-3">
              <FarmGraphicLegend areas={twin.areas} />
            </div>
          </Card>
        </div>
      )}

      {/* Nearby / community suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div>
          <h2 className="text-[var(--hv-text-base)] font-semibold mb-2">Nearby suggestions</h2>
          <Card padding="md">
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => {
                const crop = cropsById.get(s.cropId);
                const sourceLabel = s.communitySignal ? 'Community' : 'AI-only';
                const badgeVariant = s.communitySignal ? 'success' : 'neutral';

                return (
                  <Card key={s.cropId} padding="sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{crop?.nameEn ?? s.cropId}</p>
                        <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)] mt-1">
                          {s.reason}
                        </p>
                      </div>
                      <Badge variant={badgeVariant}>{sourceLabel}</Badge>
                    </div>
                    {s.communitySignal && (
                      <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)] mt-2">
                        Signal: {s.communitySignal}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
