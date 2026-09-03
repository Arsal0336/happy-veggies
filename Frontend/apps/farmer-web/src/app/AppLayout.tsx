import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@hv/i18n';
import type { Language } from '@hv/api-types';

export function AppLayout() {
  const { farmer, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLanguageToggle = () => {
    const next: Language = i18n.language === 'en' ? 'ur' : 'en';
    setLanguage(next);
  };

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: '🏠' },
    { to: '/farms', label: t('nav.farms'), icon: '🌾' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-[var(--hv-z-sticky)] bg-white border-b border-[var(--hv-color-neutral-200)] px-4 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className="text-[var(--hv-text-xl)] font-bold text-[var(--hv-color-primary-600)] truncate block">
            {t('common.appName')}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleLanguageToggle}
            className="min-h-11 min-w-11 px-3 py-2 text-[var(--hv-text-sm)] rounded border border-[var(--hv-color-neutral-300)] hover:bg-[var(--hv-color-neutral-100)]"
          >
            {i18n.language === 'en' ? 'اردو' : 'English'}
          </button>
          <span className="hidden sm:inline text-[var(--hv-text-sm)] text-[var(--hv-color-neutral-600)] truncate max-w-[8rem]">
            {farmer?.name ?? farmer?.phone}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-11 inline-flex items-center px-2 py-2 text-[var(--hv-text-sm)] text-[var(--hv-color-danger-500)] hover:underline"
          >
            {t('auth.logout')}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0 px-4 py-6 pb-2 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 z-[var(--hv-z-sticky)] bg-white border-t border-[var(--hv-color-neutral-200)] flex pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center min-h-[3.5rem] py-3 text-[var(--hv-text-xs)] transition-colors ${
                isActive
                  ? 'text-[var(--hv-color-primary-600)]'
                  : 'text-[var(--hv-color-neutral-500)]'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
