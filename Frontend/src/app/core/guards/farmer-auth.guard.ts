import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FarmerAuthStore } from '../auth/farmer-auth.store';

export const farmerAuthGuard: CanActivateFn = () => {
  const auth = inject(FarmerAuthStore);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/auth/phone']);
};
