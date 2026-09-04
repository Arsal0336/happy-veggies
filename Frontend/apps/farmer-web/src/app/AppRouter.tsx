import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGate } from './AuthGate';
import { AppLayout } from './AppLayout';
import { LanguagePage } from '../features/auth/LanguagePage';
import { PhonePage } from '../features/auth/PhonePage';
import { OtpPage } from '../features/auth/OtpPage';
import { ProfilePage } from '../features/auth/ProfilePage';
import { FarmListPage } from '../features/farms/FarmListPage';
import { NewFarmPage } from '../features/farms/NewFarmPage';
import { FarmHomePage } from '../features/farms/FarmHomePage';
import { EditFarmPage } from '../features/farms/EditFarmPage';
import { ProductionAreasPage } from '../features/productionAreas/ProductionAreasPage';
import { CropZonesPage } from '../features/cropZones/CropZonesPage';
import { PlanPage } from '../features/planning/PlanPage';
import { AssistantPage } from '../features/assistant/AssistantPage';
import { GreenFarmPage } from '../features/greenFarm/GreenFarmPage';
import { ExperimentalPage } from '../features/experimental/ExperimentalPage';
import { HistoryPage } from '../features/history';
import { PortfolioPage } from '../features/portfolio';
import { SettingsPage } from '../features/auth/SettingsPage';
import { WaterPage } from '../features/water';
import { SoilPage } from '../features/soil';
import { EconomicsPage } from '../features/economics';
import { WeatherPage } from '../features/weather';
import { FarmGraphicPage } from '../features/farmGraphic';
import { AlertsPage } from '../features/alerts';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/lang" element={<LanguagePage />} />
      <Route path="/auth/phone" element={<PhonePage />} />
      <Route path="/auth/otp" element={<OtpPage />} />
      <Route path="/auth/profile" element={<ProfilePage />} />

      <Route
        element={
          <AuthGate>
            <AppLayout />
          </AuthGate>
        }
      >
        <Route index element={<FarmListPage />} />
        <Route path="farms/new" element={<NewFarmPage />} />
        <Route path="farms/:farmId" element={<FarmHomePage />} />
        <Route path="farms/:farmId/edit" element={<EditFarmPage />} />
        <Route path="farms/:farmId/graphic" element={<FarmGraphicPage />} />
        <Route path="farms/:farmId/areas" element={<ProductionAreasPage />} />
        <Route path="farms/:farmId/areas/:areaId/zones" element={<CropZonesPage />} />
        <Route path="farms/:farmId/plan" element={<PlanPage />} />
        <Route path="farms/:farmId/alerts" element={<AlertsPage />} />
        <Route path="farms/:farmId/assistant" element={<AssistantPage />} />
        <Route path="farms/:farmId/green" element={<GreenFarmPage />} />
        <Route path="farms/:farmId/experimental" element={<ExperimentalPage />} />
        <Route path="farms/:farmId/history" element={<HistoryPage />} />
        <Route path="farms/:farmId/portfolio" element={<PortfolioPage />} />
        <Route path="farms/:farmId/water" element={<WaterPage />} />
        <Route path="farms/:farmId/soil" element={<SoilPage />} />
        <Route path="farms/:farmId/weather" element={<WeatherPage />} />
        <Route path="farms/:farmId/economics" element={<EconomicsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
