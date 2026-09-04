import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, EmptyState, ErrorState, LoadingState } from '@hv/ui';
import {
  useExperimental,
  useStartExperiment,
  useRecordOutcome,
} from '../../shared/api/hooks';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

export function ExperimentalPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { opportunities, experiments } = useExperimental(farmId);
  const start = useStartExperiment(farmId);
  const recordOutcome = useRecordOutcome(farmId);
  const { notifyError, notify } = useNotifications();
  const [outcomeZoneId, setOutcomeZoneId] = useState<string | null>(null);
  const [actualYield, setActualYield] = useState('');
  const [notes, setNotes] = useState('');

  const loading = opportunities.isLoading || experiments.isLoading;
  const error = opportunities.error || experiments.error;

  if (loading) return <LoadingState label={t('common.loading')} />;
  if (error) {
    return (
      <ErrorState
        title={t('common.error')}
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => {
          void opportunities.refetch();
          void experiments.refetch();
        }}
      />
    );
  }

  const opps = opportunities.data ?? [];
  const exps = experiments.data ?? [];

  const submitOutcome = (zoneId: string) => {
    const yieldVal = actualYield.trim() ? Number(actualYield) : undefined;
    recordOutcome.mutate(
      {
        zoneId,
        body: {
          actualYield: Number.isFinite(yieldVal) ? yieldVal : undefined,
          actualYieldUnit: 'kg',
          notes: notes.trim() || undefined,
          endedAt: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          notify('success', t('experimental.outcomeSaved'));
          setOutcomeZoneId(null);
          setActualYield('');
          setNotes('');
        },
        onError: (err) => notifyError(err),
      },
    );
  };

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('experimental.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      <section className="hv-section">
        <h2 className="hv-section-title">{t('experimental.opportunity')}</h2>
        {!opps.length ? (
          <EmptyState title={t('experimental.empty')} />
        ) : (
          <ul className="hv-stack">
            {opps.map((opp) => (
              <li key={opp.id}>
                <Card padding="md" className="hv-stack">
                  <strong>{opp.cropName ?? opp.cropId}</strong>
                  <p>{opp.hypothesis}</p>
                  {opp.riskNote && <p className="hv-muted">{opp.riskNote}</p>}
                  <Button
                    size="sm"
                    variant="primary"
                    loading={start.isPending}
                    onClick={() => {
                      start.mutate(opp.id, {
                        onSuccess: () => notify('success', t('experimental.create')),
                        onError: (err) => notifyError(err),
                      });
                    }}
                  >
                    {t('experimental.create')}
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="hv-section">
        <h2 className="hv-section-title">{t('experimental.track')}</h2>
        {!exps.length ? (
          <EmptyState title={t('experimental.empty')} />
        ) : (
          <ul className="hv-stack">
            {exps.map((exp) => (
              <li key={exp.id}>
                <Card padding="md" className="hv-stack">
                  <strong>{exp.cropName ?? exp.cropId}</strong>
                  <p>
                    {t('experimental.status')}: {exp.status}
                  </p>
                  <p className="hv-muted">
                    {t('experimental.hypothesis')}: {exp.hypothesis}
                  </p>
                  {outcomeZoneId === exp.id ? (
                    <div className="hv-stack">
                      <label>
                        {t('experimental.actualYield')}
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
                          loading={recordOutcome.isPending}
                          onClick={() => submitOutcome(exp.id)}
                        >
                          {t('experimental.saveOutcome')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setOutcomeZoneId(null)}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setOutcomeZoneId(exp.id);
                        setActualYield('');
                        setNotes('');
                      }}
                    >
                      {t('experimental.recordOutcome')}
                    </Button>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
