import { BrowserRouter, Routes, Route, NavLink, Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '@hv/i18n';
import { initDirection, setLanguage } from '@hv/i18n';
import type { Language } from '@hv/api-types';
import { AdminAuthProvider, useAdminAuth } from './features/auth/AdminAuthProvider';
import { AdminLoginPage } from './features/auth/AdminLoginPage';
import { AdminAuthGate } from './app/AdminAuthGate';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { FarmManagePage } from './features/farms/FarmManagePage';
import { FarmersPage } from './features/farmers/FarmersPage';
import { FarmerDetailPage } from './features/farmers/FarmerDetailPage';
import { SeedDataPage } from './features/seed-data/SeedDataPage';
import { CropsPage } from './features/catalog/CropsPage';
import { SeedVarietiesPage } from './features/catalog/SeedVarietiesPage';
import { ProductionAreaTypesPage } from './features/catalog/ProductionAreaTypesPage';
import { CompatibilityPage } from './features/catalog/CompatibilityPage';
import { GovernmentRatesPage } from './features/rates/GovernmentRatesPage';
import { PlanReviewPage } from './features/plans/PlanReviewPage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { FeatureFlagsPage } from './features/flags/FeatureFlagsPage';
import { AuditLogPage } from './features/audit/AuditLogPage';

initDirection();

function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { admin, logout } = useAdminAuth();

  const handleLanguageToggle = () => {
    const next: Language = i18n.language === 'en' ? 'ur' : 'en';
    setLanguage(next);
  };

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/farmers', label: 'Farmers' },
    { to: '/farms', label: t('nav.farms') },
    { to: '/catalog/crops', label: 'Crops' },
    { to: '/catalog/seed-varieties', label: 'Seed Varieties' },
    { to: '/catalog/area-types', label: 'Area Types' },
    { to: '/catalog/compatibility', label: 'Compatibility' },
    { to: '/rates', label: 'Gov. Rates' },
    { to: '/plans/review', label: 'Plan Review' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/feature-flags', label: 'Feature Flags' },
    { to: '/seed-data', label: 'Seed Data' },
    { to: '/audit', label: 'Audit Log' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-e border-[var(--hv-color-neutral-200)] flex flex-col">
        <div className="p-4 border-b border-[var(--hv-color-neutral-200)]">
          <h1 className="text-lg font-bold text-[var(--hv-color-primary-600)]">
            HV Admin
          </h1>
          {admin && (
            <p className="text-[var(--hv-text-xs)] text-[var(--hv-color-neutral-500)] mt-0.5 truncate">
              {admin.email}
            </p>
          )}
        </div>
        <nav className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-[var(--hv-radius-md)] text-[var(--hv-text-sm)] transition-colors ${
                  isActive
                    ? 'bg-[var(--hv-color-primary-50)] text-[var(--hv-color-primary-700)] font-medium'
                    : 'text-[var(--hv-color-neutral-600)] hover:bg-[var(--hv-color-neutral-100)]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-[var(--hv-color-neutral-200)] flex flex-col gap-2">
          <button
            onClick={handleLanguageToggle}
            className="px-2 py-1 text-[var(--hv-text-xs)] rounded border border-[var(--hv-color-neutral-300)] hover:bg-[var(--hv-color-neutral-100)]"
          >
            {i18n.language === 'en' ? 'اردو' : 'English'}
          </button>
          <button
            onClick={logout}
            className="px-2 py-1 text-[var(--hv-text-xs)] rounded border border-[var(--hv-color-neutral-300)] text-[var(--hv-color-error-600)] hover:bg-[var(--hv-color-error-50)]"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminApp() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route
            path="/*"
            element={
              <AdminAuthGate>
                <AdminLayout />
              </AdminAuthGate>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="farmers" element={<FarmersPage />} />
            <Route path="farmers/:farmerId" element={<FarmerDetailPage />} />
            <Route path="farms" element={<FarmManagePage />} />
            <Route path="catalog/crops" element={<CropsPage />} />
            <Route path="catalog/seed-varieties" element={<SeedVarietiesPage />} />
            <Route path="catalog/area-types" element={<ProductionAreaTypesPage />} />
            <Route path="catalog/compatibility" element={<CompatibilityPage />} />
            <Route path="rates" element={<GovernmentRatesPage />} />
            <Route path="plans/review" element={<PlanReviewPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="feature-flags" element={<FeatureFlagsPage />} />
            <Route path="seed-data" element={<SeedDataPage />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
