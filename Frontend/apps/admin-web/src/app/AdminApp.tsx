import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminAuthGate } from './AdminAuthGate';
import { AppShell } from './AppShell';
import { AdminLoginPage } from '../features/auth';
import { DashboardPage } from '../features/dashboard';
import { FarmersPage, FarmerDetailPage, FarmInspectPage } from '../features/farmers';
import { CropsPage } from '../features/crops';
import { SeedVarietiesPage } from '../features/seedVarieties';
import { CompatibilityPage } from '../features/compatibility';
import { ProductionAreaTypesPage } from '../features/productionAreaTypes';
import { GovernmentRatesPage } from '../features/governmentRates';
import { PlanReviewPage } from '../features/planReview';
import { AnalyticsPage } from '../features/analytics';
import { FeatureFlagsPage } from '../features/featureFlags';
import { AuditLogPage } from '../features/auditLog';

export function AdminApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLoginPage />} />
        <Route
          element={
            <AdminAuthGate>
              <AppShell />
            </AdminAuthGate>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="farmers" element={<FarmersPage />} />
          <Route path="farmers/:id" element={<FarmerDetailPage />} />
          <Route path="farmers/:id/farms/:farmId" element={<FarmInspectPage />} />
          <Route path="catalog/crops" element={<CropsPage />} />
          <Route path="catalog/seed-varieties" element={<SeedVarietiesPage />} />
          <Route path="catalog/compatibility" element={<CompatibilityPage />} />
          <Route path="catalog/production-area-types" element={<ProductionAreaTypesPage />} />
          <Route path="rates" element={<GovernmentRatesPage />} />
          <Route path="reviews/plans" element={<PlanReviewPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="flags" element={<FeatureFlagsPage />} />
          <Route path="audit" element={<AuditLogPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
