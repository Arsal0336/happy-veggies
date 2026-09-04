import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@hv/ui';
import type { Language } from '@hv/api-types';
import { useAuth } from './AuthProvider';
import { setStoredLanguage } from '../../shared/api/authStorage';

export function LanguagePage() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, setLanguagePreference } = useAuth();
  const navigate = useNavigate();

  const choose = async (lang: Language) => {
    setStoredLanguage(lang);
    setLanguagePreference(lang);
    await i18n.changeLanguage(lang);
    navigate(isAuthenticated ? '/' : '/auth/phone', { replace: true });
  };

  return (
    <div className="hv-page hv-page--auth">
      <Card className="hv-auth-card" padding="lg">
        <h1 className="hv-page__title">{t('common.appName')}</h1>
        <p className="hv-page__lead">{t('lang.title')}</p>
        <p className="hv-muted">{t('lang.subtitle')}</p>
        <div className="hv-stack">
          <Button variant="primary" onClick={() => void choose('en')}>
            {t('lang.english')}
          </Button>
          <Button variant="secondary" onClick={() => void choose('ur')}>
            {t('lang.urdu')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
