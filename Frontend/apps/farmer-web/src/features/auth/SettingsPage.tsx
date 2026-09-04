import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@hv/ui';
import type { Language } from '@hv/api-types';
import { useAuth } from './AuthProvider';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { farmer, logout, setLanguagePreference } = useAuth();
  const navigate = useNavigate();

  const setLang = (lang: Language) => {
    setLanguagePreference(lang);
    void i18n.changeLanguage(lang);
  };

  return (
    <div className="hv-page">
      <h1 className="hv-page__title">{t('settings.title')}</h1>
      <Card className="hv-stack" padding="md">
        <h2 className="hv-section-title">{t('common.language')}</h2>
        <p className="hv-muted">{t('settings.languageHint')}</p>
        <div className="hv-row">
          <Button
            variant={i18n.language === 'en' ? 'primary' : 'secondary'}
            onClick={() => setLang('en')}
          >
            {t('lang.english')}
          </Button>
          <Button
            variant={i18n.language === 'ur' ? 'primary' : 'secondary'}
            onClick={() => setLang('ur')}
          >
            {t('lang.urdu')}
          </Button>
        </div>
      </Card>
      <Card className="hv-stack" padding="md">
        <h2 className="hv-section-title">{t('settings.account')}</h2>
        <p>{farmer?.name ?? farmer?.phone}</p>
        <Button
          variant="danger"
          onClick={() => {
            logout();
            navigate('/auth/phone', { replace: true });
          }}
        >
          {t('common.logout')}
        </Button>
      </Card>
    </div>
  );
}
