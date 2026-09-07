import { Routes } from '@angular/router';
import { adminAuthGuard } from '../../core/guards/admin-auth.guard';

export const adminRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.AdminLoginPage),
  },
  {
    path: '',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('../../shared/ui/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard.page').then((m) => m.AdminDashboardPage),
      },
      {
        path: 'farmers',
        loadComponent: () =>
          import('./farmers/farmers.page').then((m) => m.AdminFarmersPage),
      },
      {
        path: 'farmers/:id',
        loadComponent: () =>
          import('./farmers/farmer-detail.page').then((m) => m.AdminFarmerDetailPage),
      },
      {
        path: 'farmers/:id/farms/:farmId',
        loadComponent: () =>
          import('./farmers/farm-inspect.page').then((m) => m.AdminFarmInspectPage),
      },
      {
        path: 'catalog/crops',
        loadComponent: () => import('./catalog/crops.page').then((m) => m.AdminCropsPage),
      },
      {
        path: 'catalog/seed-varieties',
        loadComponent: () =>
          import('./catalog/seed-varieties.page').then((m) => m.AdminSeedVarietiesPage),
      },
      {
        path: 'catalog/area-types',
        loadComponent: () =>
          import('./catalog/area-types.page').then((m) => m.AdminAreaTypesPage),
      },
      {
        path: 'catalog/compatibility',
        loadComponent: () =>
          import('./catalog/compatibility.page').then((m) => m.AdminCompatibilityPage),
      },
      {
        path: 'rates',
        loadComponent: () => import('./rates/rates.page').then((m) => m.AdminRatesPage),
      },
      {
        path: 'reviews/plans',
        loadComponent: () =>
          import('./reviews/plans.page').then((m) => m.AdminPlansReviewPage),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./analytics/analytics.page').then((m) => m.AdminAnalyticsPage),
      },
      {
        path: 'flags',
        loadComponent: () => import('./flags/flags.page').then((m) => m.AdminFlagsPage),
      },
      {
        path: 'audit',
        loadComponent: () => import('./audit/audit.page').then((m) => m.AdminAuditPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings.page').then((m) => m.AdminSettingsPage),
      },
    ],
  },
];
