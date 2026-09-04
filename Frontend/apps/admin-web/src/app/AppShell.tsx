import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminShell, type AdminNavItem } from '@hv/ui';
import { useAdminAuth } from '../features/auth/AdminAuthProvider';

const NAV: Array<{ id: string; path: string; labelKey: string; fallback: string }> = [
  { id: 'dashboard', path: '/', labelKey: 'admin.nav.dashboard', fallback: 'Dashboard' },
  { id: 'farmers', path: '/farmers', labelKey: 'admin.nav.farmers', fallback: 'Farmers' },
  { id: 'crops', path: '/catalog/crops', labelKey: 'admin.nav.crops', fallback: 'Crops' },
  {
    id: 'seedVarieties',
    path: '/catalog/seed-varieties',
    labelKey: 'admin.nav.seedVarieties',
    fallback: 'Seed varieties',
  },
  {
    id: 'compatibility',
    path: '/catalog/compatibility',
    labelKey: 'admin.nav.compatibility',
    fallback: 'Compatibility',
  },
  {
    id: 'areaTypes',
    path: '/catalog/production-area-types',
    labelKey: 'admin.nav.productionAreaTypes',
    fallback: 'Area types',
  },
  {
    id: 'rates',
    path: '/rates',
    labelKey: 'admin.nav.governmentRates',
    fallback: 'Government rates',
  },
  {
    id: 'reviews',
    path: '/reviews/plans',
    labelKey: 'admin.nav.planReview',
    fallback: 'Plan review',
  },
  {
    id: 'analytics',
    path: '/analytics',
    labelKey: 'admin.nav.analytics',
    fallback: 'Analytics',
  },
  {
    id: 'flags',
    path: '/flags',
    labelKey: 'admin.nav.featureFlags',
    fallback: 'Feature flags',
  },
  { id: 'audit', path: '/audit', labelKey: 'admin.nav.auditLog', fallback: 'Audit log' },
];

function titleForPath(pathname: string, t: (k: string, d: string) => string): string {
  const exact = NAV.find((n) => n.path === pathname);
  if (exact) return t(exact.labelKey, exact.fallback);
  if (pathname.startsWith('/farmers/')) return t('admin.nav.farmers', 'Farmers');
  return t('admin.nav.dashboard', 'Dashboard');
}

export function AppShell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, admin } = useAdminAuth();

  const navItems: AdminNavItem[] = NAV.map((item) => ({
    id: item.id,
    label: t(item.labelKey, item.fallback),
    active:
      item.path === '/'
        ? location.pathname === '/'
        : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
    onClick: () => navigate(item.path),
  }));

  return (
    <AdminShell
      brand="Happy Veggie Admin"
      title={titleForPath(location.pathname, t)}
      navItems={navItems}
      onLogout={() => {
        logout();
        navigate('/login', { replace: true });
      }}
    >
      {admin?.email && (
        <p
          style={{
            margin: '0 0 1rem',
            fontSize: 'var(--hv-text-xs)',
            color: 'var(--hv-color-text-muted)',
          }}
        >
          Signed in as {admin.email}
        </p>
      )}
      <Outlet />
    </AdminShell>
  );
}
