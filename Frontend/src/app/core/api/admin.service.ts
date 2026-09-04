import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  login(body: { email: string; password: string }): Observable<{
    sessionToken: string;
    admin: { id: string; email: string; displayName?: string | null; role?: string | null };
  }> {
    return this.http.post<{
      sessionToken: string;
      admin: { id: string; email: string; displayName?: string | null; role?: string | null };
    }>(`${this.base}/admin/auth/login`, body);
  }

  me(): Observable<unknown> {
    return this.http.get(`${this.base}/admin/me`);
  }

  metrics(): Observable<unknown> {
    return this.http.get(`${this.base}/admin/metrics`);
  }

  analytics(): Observable<unknown> {
    return this.http.get(`${this.base}/admin/analytics`);
  }

  listFarmers(q?: string): Observable<unknown[]> {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<unknown[]>(`${this.base}/admin/farmers`, { params });
  }

  getFarmer(id: string): Observable<unknown> {
    return this.http.get(`${this.base}/admin/farmers/${id}`);
  }

  getFarmTwin(farmId: string): Observable<unknown> {
    return this.http.get(`${this.base}/admin/farms/${farmId}/twin`);
  }

  listCrops(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/admin/crops`);
  }

  createCrop(body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/admin/crops`, body);
  }

  updateCrop(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.base}/admin/crops/${id}`, body);
  }

  listSeedVarieties(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/admin/seed-varieties`);
  }

  createSeedVariety(body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/admin/seed-varieties`, body);
  }

  updateSeedVariety(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.base}/admin/seed-varieties/${id}`, body);
  }

  listAreaTypes(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/admin/production-area-types`);
  }

  createAreaType(body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/admin/production-area-types`, body);
  }

  updateAreaType(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.base}/admin/production-area-types/${id}`, body);
  }

  listCompatibility(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/admin/compatibility`);
  }

  upsertCompatibility(body: Record<string, unknown>): Observable<unknown> {
    return this.http.put(`${this.base}/admin/compatibility`, body);
  }

  listRates(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/admin/government-rates`);
  }

  createRate(body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/admin/government-rates`, body);
  }

  updateRate(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.base}/admin/government-rates/${id}`, body);
  }

  listPlans(params?: { flagged?: boolean }): Observable<unknown[]> {
    let httpParams = new HttpParams();
    if (params?.flagged != null) {
      httpParams = httpParams.set('flagged', String(params.flagged));
    }
    return this.http.get<unknown[]>(`${this.base}/admin/plans`, { params: httpParams });
  }

  reviewPlan(id: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/admin/plans/${id}/review`, body);
  }

  listFeatureFlags(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/admin/feature-flags`);
  }

  updateFeatureFlag(key: string, body: Record<string, unknown>): Observable<void> {
    return this.http.patch<void>(`${this.base}/admin/feature-flags/${encodeURIComponent(key)}`, body);
  }

  listAuditLogs(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/admin/audit-logs`);
  }

  refreshSession(): Observable<{ sessionToken: string }> {
    return this.http.post<{ sessionToken: string }>(`${this.base}/admin/auth/refresh`, {});
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/admin/auth/logout`, {});
  }
}
