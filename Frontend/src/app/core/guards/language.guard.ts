import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FarmerAuthStore } from '../auth/farmer-auth.store';

/** First visit without a stored language goes to /lang. */
export const languageGuard: CanActivateFn = () => {
  const auth = inject(FarmerAuthStore);
  const router = inject(Router);
  if (auth.language()) return true;
  return router.createUrlTree(['/lang']);
};
