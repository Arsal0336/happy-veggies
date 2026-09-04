import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Language } from '@hv/api-types';
import { Alert, Button, Card, EmptyState, ErrorState, LoadingState, PlanSectionList } from '@hv/ui';
import { useGeneratePlan, usePlan, usePlanHistory } from '../../shared/api/hooks';
import { useAuth } from '../auth/AuthProvider';
import { useNotifications } from '../../shared/notifications/NotificationProvider';

export function PlanPage() {
  const { farmId = '' } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const { data: plan, isLoading, error, refetch } = usePlan(farmId);
  const { data: history } = usePlanHistory(farmId);
  const generate = useGeneratePlan(farmId);
  const { notifyError, notify } = useNotifications();

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

  const farmerLang = (farmer?.language || i18n.language || 'en') as Language;
  const planLangMismatch =
    !!plan && String(plan.language).toLowerCase() !== String(farmerLang).toLowerCase();

  const onGenerate = async (language: Language = farmerLang) => {
    try {
      await generate.mutateAsync(language);
      notify('success', t('plan.generate'));
    } catch (err) {
      notifyError(err, () => void onGenerate(language));
    }
  };

  const historyItems = (history ?? []).filter((h) => h.id !== plan?.id);

  return (
    <div className="hv-page">
      <div className="hv-page__header">
        <h1 className="hv-page__title">{t('plan.title')}</h1>
        <Button size="sm" variant="ghost" onClick={() => navigate(`/farms/${farmId}`)}>
          {t('common.back')}
        </Button>
      </div>

      <p className="hv-muted hv-hint">{t('plan.pdfDeferred')}</p>

      {planLangMismatch && (
        <Alert variant="info" title={t('plan.languageMismatchTitle')} className="hv-section">
          <p>{t('plan.languageMismatchBody', { planLang: plan?.language, farmerLang })}</p>
          <Button
            size="sm"
            variant="primary"
            loading={generate.isPending}
            onClick={() => void onGenerate(farmerLang)}
          >
            {t('plan.regenerateInLanguage')}
          </Button>
        </Alert>
      )}

      {generate.isPending && <LoadingState label={t('plan.generating')} />}

      {!plan ? (
        <EmptyState
          title={t('plan.empty')}
          action={
            <Button variant="primary" onClick={() => void onGenerate()} loading={generate.isPending}>
              {t('plan.generate')}
            </Button>
          }
        />
      ) : (
        <>
          <Card padding="sm" className="hv-row hv-row--between">
            <span>
              {t('plan.version', { version: plan.version })}
              <span className="hv-muted hv-text-sm"> · {plan.language}</span>
            </span>
            <Button
              size="sm"
              variant="secondary"
              loading={generate.isPending}
              onClick={() => void onGenerate()}
            >
              {t('plan.regenerate')}
            </Button>
          </Card>
          <h2 className="hv-section-title">{t('plan.sections')}</h2>
          <PlanSectionList
            sections={plan.sections.map((s) => ({
              id: s.key,
              title: s.title,
              body: s.body,
            }))}
          />
          {plan.disclaimer && <p className="hv-muted hv-hint">{plan.disclaimer}</p>}
        </>
      )}

      {historyItems.length > 0 && (
        <section className="hv-section">
          <h2 className="hv-section-title">{t('plan.history')}</h2>
          <ul className="hv-stack">
            {historyItems.map((h) => (
              <li key={h.id}>
                <Card padding="sm">
                  <div className="hv-row hv-row--between">
                    <span>
                      {t('plan.version', { version: h.version })}
                      <span className="hv-muted hv-text-sm"> · {h.language}</span>
                    </span>
                    <span className="hv-muted hv-text-sm">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
