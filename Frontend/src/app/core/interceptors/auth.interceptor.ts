import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminAuthStore } from '../auth/admin-auth.store';
import { FarmerAuthStore } from '../auth/farmer-auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const farmerAuth = inject(FarmerAuthStore);
  const adminAuth = inject(AdminAuthStore);
  const router = inject(Router);

  const url = req.url;
  const isAdmin = url.includes('/admin');
  const isAdminLogin = url.includes('/admin/auth/login');

  let token: string | null = null;
  if (isAdmin && !isAdminLogin) {
    token = adminAuth.token();
  } else if (!isAdmin) {
    token = farmerAuth.token();
  }

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err?.status === 401) {
        if (isAdmin) {
          adminAuth.clear();
          void router.navigateByUrl('/admin/login');
        } else if (!url.includes('/auth/otp')) {
          farmerAuth.clear();
          void router.navigateByUrl('/auth/phone');
        }
      }
      return throwError(() => err);
    }),
  );
};
