import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthStore } from '../auth/admin-auth.store';

export const adminAuthGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthStore);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/admin/login']);
};
