import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FarmerShell } from '@hv/ui';
import type { Language } from '@hv/api-types';
import { useAuth } from '../features/auth/AuthProvider';
import { useFarm } from '../shared/api/hooks';

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const { farmer, logout, setLanguagePreference } = useAuth();
  const navigate = useNavigate();
  const { farmId } = useParams<{ farmId?: string }>();
  const { data: farm } = useFarm(farmId ?? '');

  const toggleLanguage = () => {
    const next: Language = i18n.language === 'en' ? 'ur' : 'en';
    setLanguagePreference(next);
    void i18n.changeLanguage(next);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/phone', { replace: true });
  };

  const farmBase = farmId ? `/farms/${farmId}` : null;
  const moreItems = [
    ...(farmBase
      ? [
          { id: 'areas', label: t('nav.areas'), href: `${farmBase}/areas` },
          { id: 'water', label: t('nav.water'), href: `${farmBase}/water` },
          { id: 'soil', label: t('nav.soil'), href: `${farmBase}/soil` },
          { id: 'weather', label: t('nav.weather'), href: `${farmBase}/weather` },
          { id: 'economics', label: t('nav.economics'), href: `${farmBase}/economics` },
          { id: 'alerts', label: t('nav.alerts'), href: `${farmBase}/alerts` },
          { id: 'green', label: t('nav.green'), href: `${farmBase}/green` },
          { id: 'experimental', label: t('nav.experimental'), href: `${farmBase}/experimental` },
          { id: 'history', label: t('nav.history'), href: `${farmBase}/history` },
        ]
      : []),
    { id: 'settings', label: t('nav.settings'), href: '/settings' },
    { id: 'logout', label: t('common.logout'), onClick: handleLogout },
  ];

  return (
    <FarmerShell
      brand={t('common.appName')}
      farmName={farm?.name ?? undefined}
      userLabel={farmer?.name ?? farmer?.phone}
      languageLabel={i18n.language === 'en' ? 'اردو' : 'EN'}
      labels={{
        farms: t('nav.farms'),
        home: t('nav.home'),
        plan: t('nav.plan'),
        assistant: t('nav.assistant'),
        more: t('nav.more'),
        moreTitle: t('nav.more'),
      }}
      moreItems={moreItems}
      homeHref={farmBase ?? undefined}
      planHref={farmBase ? `${farmBase}/plan` : undefined}
      assistantHref={farmBase ? `${farmBase}/assistant` : undefined}
      onToggleLanguage={toggleLanguage}
    >
      <Outlet />
    </FarmerShell>
  );
}
