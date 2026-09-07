import { Routes } from '@angular/router';
import { farmerAuthGuard } from '../../core/guards/farmer-auth.guard';
import { languageGuard } from '../../core/guards/language.guard';

export const farmerRoutes: Routes = [
  {
    path: 'lang',
    loadComponent: () => import('./lang/lang.page').then((m) => m.LangPage),
  },
  {
    path: 'auth/phone',
    canActivate: [languageGuard],
    loadComponent: () => import('./auth/phone.page').then((m) => m.PhonePage),
  },
  {
    path: 'auth/otp',
    canActivate: [languageGuard],
    loadComponent: () => import('./auth/otp.page').then((m) => m.OtpPage),
  },
  {
    path: 'auth/profile',
    canActivate: [languageGuard, farmerAuthGuard],
    loadComponent: () => import('./auth/profile.page').then((m) => m.ProfilePage),
  },
  {
    path: '',
    canActivate: [languageGuard, farmerAuthGuard],
    loadComponent: () =>
      import('../../shared/ui/farmer-shell').then((m) => m.FarmerShell),
    children: [
      {
        path: '',
        loadComponent: () => import('./farms/farm-list.page').then((m) => m.FarmListPage),
      },
      {
        path: 'farms/new',
        loadComponent: () => import('./farms/new-farm.page').then((m) => m.NewFarmPage),
      },
      {
        path: 'farms/:farmId',
        loadComponent: () => import('./farms/farm-home.page').then((m) => m.FarmHomePage),
      },
      {
        path: 'farms/:farmId/edit',
        loadComponent: () => import('./farms/edit-farm.page').then((m) => m.EditFarmPage),
      },
      {
        path: 'farms/:farmId/graphic',
        loadComponent: () =>
          import('./graphic/farm-graphic.page').then((m) => m.FarmGraphicPage),
      },
      {
        path: 'farms/:farmId/areas',
        loadComponent: () => import('./areas/areas.page').then((m) => m.AreasPage),
      },
      {
        path: 'farms/:farmId/areas/:areaId/zones',
        loadComponent: () => import('./zones/zones.page').then((m) => m.ZonesPage),
      },
      {
        path: 'farms/:farmId/plan',
        loadComponent: () => import('./plan/plan.page').then((m) => m.PlanPage),
      },
      {
        path: 'farms/:farmId/alerts',
        loadComponent: () => import('./alerts/alerts.page').then((m) => m.AlertsPage),
      },
      {
        path: 'farms/:farmId/assistant',
        loadComponent: () =>
          import('./assistant/assistant.page').then((m) => m.AssistantPage),
      },
      {
        path: 'farms/:farmId/green',
        loadComponent: () => import('./green/green.page').then((m) => m.GreenPage),
      },
      {
        path: 'farms/:farmId/experimental',
        loadComponent: () =>
          import('./experimental/experimental.page').then((m) => m.ExperimentalPage),
      },
      {
        path: 'farms/:farmId/history',
        loadComponent: () => import('./history/history.page').then((m) => m.HistoryPage),
      },
      {
        path: 'farms/:farmId/portfolio',
        loadComponent: () =>
          import('./portfolio/portfolio.page').then((m) => m.PortfolioPage),
      },
      {
        path: 'farms/:farmId/water',
        loadComponent: () => import('./water/water.page').then((m) => m.WaterPage),
      },
      {
        path: 'farms/:farmId/soil',
        loadComponent: () => import('./soil/soil.page').then((m) => m.SoilPage),
      },
      {
        path: 'farms/:farmId/weather',
        loadComponent: () => import('./weather/weather.page').then((m) => m.WeatherPage),
      },
      {
        path: 'farms/:farmId/economics',
        loadComponent: () =>
          import('./economics/economics.page').then((m) => m.EconomicsPage),
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.page').then((m) => m.SettingsPage),
      },
    ],
  },
];
