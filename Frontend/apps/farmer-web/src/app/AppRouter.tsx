import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGate } from './AuthGate';
import { AppLayout } from './AppLayout';

// Feature pages (lazy-loaded in production, direct imports for now)
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { FarmListPage } from '../features/farm/FarmListPage';
import { FarmDetailPage } from '../features/farm/FarmDetailPage';
import { NewFarmPage } from '../features/farm/NewFarmPage';
import { EditFarmPage } from '../features/farm/EditFarmPage';
import { TwinPage } from '../features/twin/TwinPage';
import { PlanPage } from '../features/plan/PlanPage';
import { AssistantPage } from '../features/assistant/AssistantPage';
import { GreenFarmPage } from '../features/green-farm/GreenFarmPage';
import { ExperimentalPage } from '../features/experimental/ExperimentalPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <AuthGate>
              <AppLayout />
            </AuthGate>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="farms" element={<FarmListPage />} />
          <Route path="farms/new" element={<NewFarmPage />} />
          <Route path="farms/:farmId" element={<FarmDetailPage />} />
          <Route path="farms/:farmId/edit" element={<EditFarmPage />} />
          <Route path="twin/:farmId" element={<TwinPage />} />
          <Route path="plan/:farmId" element={<PlanPage />} />
          <Route path="assistant/:farmId" element={<AssistantPage />} />
          <Route path="green-farm/:farmId" element={<GreenFarmPage />} />
          <Route path="farms/:farmId/experimental" element={<ExperimentalPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
