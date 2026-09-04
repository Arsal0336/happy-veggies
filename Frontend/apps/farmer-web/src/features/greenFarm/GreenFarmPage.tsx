import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, ErrorState, GreenScoreMeter, LoadingState, Page, PageHeader } from '@hv/ui';
import { useGreenScore } from '../../shared/api/hooks';

export function GreenFarmPage() {
  const { farmId = '' } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: score, isLoading, error, refetch } = useGreenScore(farmId);

  if (isLoading) return <LoadingState label={t('common.loading')} />;
  if (error || !score) {
    return (
      <ErrorState
        title={t('common.error')}
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Page>
      <PageHeader
        title={t('green.title')}
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
            {t('common.back')}
          </Button>
        }
      />

      <GreenScoreMeter
        score={score.overallScore}
        disclaimer={score.nonCertificationDisclaimer || t('green.disclaimer')}
      />

      <h2 className="hv-section-title">{t('green.dimensions')}</h2>
      <ul className="hv-stack">
        {Object.entries(score.dimensions).map(([key, dim]) => {
          const quality = score.measuredVsEstimated?.[key];
          return (
            <li key={key}>
              <Card padding="sm">
                <strong>{key.replace(/_/g, ' ')}</strong>
                <p>
                  {dim.available ? `${dim.score}` : '—'}
                  {quality
                    ? ` · ${quality === 'measured' ? t('green.measured') : t('green.estimated')}`
                    : ''}
                  {dim.explanation ? ` · ${dim.explanation}` : ''}
                </p>
                {!dim.available && dim.explanation ? (
                  <p className="hv-muted">{t('green.unavailable')}: {dim.explanation}</p>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>
      <p className="hv-muted hv-hint">{t('green.weightsTbd')}</p>
      <p className="hv-muted hv-hint">{score.nonCertificationDisclaimer || t('green.disclaimer')}</p>
    </Page>
  );
}
