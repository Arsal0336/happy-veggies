import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminShell, type AdminNavGroup } from '@hv/ui';
import { useAdminAuth } from '../features/auth/AdminAuthProvider';

const NAV: Array<{ id: string; path: string; labelKey: string; fallback: string; group: string }> = [
  { id: 'dashboard', path: '/', labelKey: 'admin.nav.dashboard', fallback: 'Dashboard', group: 'overview' },
  { id: 'farmers', path: '/farmers', labelKey: 'admin.nav.farmers', fallback: 'Farmers', group: 'overview' },
  { id: 'crops', path: '/catalog/crops', labelKey: 'admin.nav.crops', fallback: 'Crops', group: 'catalog' },
  {
    id: 'seedVarieties',
    path: '/catalog/seed-varieties',
    labelKey: 'admin.nav.seedVarieties',
    fallback: 'Seed varieties',
    group: 'catalog',
  },
  {
    id: 'compatibility',
    path: '/catalog/compatibility',
    labelKey: 'admin.nav.compatibility',
    fallback: 'Compatibility',
    group: 'catalog',
  },
  {
    id: 'areaTypes',
    path: '/catalog/production-area-types',
    labelKey: 'admin.nav.productionAreaTypes',
    fallback: 'Area types',
    group: 'catalog',
  },
  {
    id: 'rates',
    path: '/rates',
    labelKey: 'admin.nav.governmentRates',
    fallback: 'Government rates',
    group: 'catalog',
  },
  {
    id: 'reviews',
    path: '/reviews/plans',
    labelKey: 'admin.nav.planReview',
    fallback: 'Plan review',
    group: 'intelligence',
  },
  {
    id: 'analytics',
    path: '/analytics',
    labelKey: 'admin.nav.analytics',
    fallback: 'Analytics',
    group: 'intelligence',
  },
  {
    id: 'flags',
    path: '/flags',
    labelKey: 'admin.nav.featureFlags',
    fallback: 'Feature flags',
    group: 'system',
  },
  { id: 'audit', path: '/audit', labelKey: 'admin.nav.auditLog', fallback: 'Audit log', group: 'system' },
];

const GROUP_META = [
  { id: 'overview', label: 'Overview' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'system', label: 'System' },
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

  const navGroups: AdminNavGroup[] = GROUP_META.map((group) => ({
    id: group.id,
    label: group.label,
    items: NAV.filter((item) => item.group === group.id).map((item) => ({
      id: item.id,
      label: t(item.labelKey, item.fallback),
      href: item.path,
      active:
        item.path === '/'
          ? location.pathname === '/'
          : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
    })),
  }));

  return (
    <AdminShell
      brand="Happy Veggie Admin"
      title={titleForPath(location.pathname, t)}
      navGroups={navGroups}
      userLabel={admin?.email}
      onLogout={() => {
        logout();
        navigate('/login', { replace: true });
      }}
    >
      <Outlet />
    </AdminShell>
  );
}
