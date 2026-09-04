import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@hv/ui';
import type { Language } from '@hv/api-types';
import { useAuth } from '../features/auth/AuthProvider';

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const { farmer, logout, setLanguagePreference } = useAuth();
  const navigate = useNavigate();
  const { farmId } = useParams<{ farmId?: string }>();

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

  return (
    <div className="hv-shell">
      <header className="hv-shell__header">
        <div className="hv-shell__brand-row">
          <NavLink to="/" className="hv-shell__brand">
            {t('common.appName')}
          </NavLink>
          <div className="hv-shell__actions">
            <Button size="sm" variant="ghost" onClick={toggleLanguage}>
              {i18n.language === 'en' ? 'اردو' : 'EN'}
            </Button>
            <span className="hv-shell__user">{farmer?.name ?? farmer?.phone}</span>
          </div>
        </div>
      </header>

      <main className="hv-shell__main">
        <Outlet />
      </main>

      <nav className="hv-shell__nav" aria-label="Main">
        <NavLink to="/" end className={navClass}>
          {t('nav.farms')}
        </NavLink>
        {farmBase && (
          <>
            <NavLink to={farmBase} end className={navClass}>
              {t('nav.home')}
            </NavLink>
            <NavLink to={`${farmBase}/plan`} className={navClass}>
              {t('nav.plan')}
            </NavLink>
            <NavLink to={`${farmBase}/assistant`} className={navClass}>
              {t('nav.assistant')}
            </NavLink>
            <NavLink to={`${farmBase}/green`} className={navClass}>
              {t('nav.green')}
            </NavLink>
          </>
        )}
        <NavLink to="/settings" className={navClass}>
          {t('nav.settings')}
        </NavLink>
        <button type="button" className="hv-shell__nav-link" onClick={handleLogout}>
          {t('common.logout')}
        </button>
      </nav>
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return `hv-shell__nav-link${isActive ? ' is-active' : ''}`;
}
