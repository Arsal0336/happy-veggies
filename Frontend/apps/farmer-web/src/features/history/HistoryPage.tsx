import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, EmptyState, ErrorState, LoadingState } from '@hv/ui';
import { useCropCycles, useRecordCycleActuals } from '../../shared/api/hooks';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

export function HistoryPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useCropCycles(farmId);
  const recordActuals = useRecordCycleActuals(farmId);
  const { notify, notifyError } = useNotifications();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actualYield, setActualYield] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading) return <LoadingState label={t('common.loading')} />;
  if (error) {
    return (
      <ErrorState
        title={t('common.error')}
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  const cycles = data ?? [];

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('history.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      <p className="hv-muted hv-hint">{t('history.hint')}</p>

      {!cycles.length ? (
        <EmptyState title={t('history.empty')} description={t('history.emptyHint')} />
      ) : (
        <ul className="hv-stack">
          {cycles.map((c) => (
            <li key={c.id}>
              <Card padding="md" className="hv-stack">
                <strong>{c.zoneLabel ?? c.cropZoneId}</strong>
                <p className="hv-muted">
                  {c.season}
                  {c.isExperimental ? ` · ${t('history.experimental')}` : ''}
                </p>
                <p>
                  {t('history.predicted')}:{' '}
                  {c.predictedYield != null
                    ? `${c.predictedYield} ${c.predictedYieldUnit ?? ''}`
                    : '—'}
                </p>
                <p>
                  {t('history.actual')}:{' '}
                  {c.actualYield != null
                    ? `${c.actualYield} ${c.actualYieldUnit ?? ''}`
                    : '—'}
                </p>
                <p>
                  {t('history.delta')}:{' '}
                  {c.delta != null ? `${c.delta > 0 ? '+' : ''}${c.delta}` : '—'}
                </p>
                {c.notes ? <p className="hv-muted">{c.notes}</p> : null}

                {editingId === c.id ? (
                  <div className="hv-stack">
                    <label>
                      {t('history.actual')}
                      <input
                        type="number"
                        value={actualYield}
                        onChange={(e) => setActualYield(e.target.value)}
                      />
                    </label>
                    <label>
                      {t('experimental.notes')}
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                      />
                    </label>
                    <div className="hv-row">
                      <Button
                        size="sm"
                        variant="primary"
                        loading={recordActuals.isPending}
                        onClick={() => {
                          const val = actualYield.trim() ? Number(actualYield) : undefined;
                          recordActuals.mutate(
                            {
                              cycleId: c.id,
                              body: {
                                actualYield: Number.isFinite(val) ? val : undefined,
                                actualYieldUnit: c.predictedYieldUnit ?? 'kg',
                                notes: notes.trim() || undefined,
                                endedAt: new Date().toISOString(),
                              },
                            },
                            {
                              onSuccess: () => {
                                notify('success', t('history.saved'));
                                setEditingId(null);
                              },
                              onError: (err) => notifyError(err),
                            },
                          );
                        }}
                      >
                        {t('common.save')}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(c.id);
                      setActualYield(c.actualYield != null ? String(c.actualYield) : '');
                      setNotes(c.notes ?? '');
                    }}
                  >
                    {t('history.recordActuals')}
                  </Button>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
