import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class PlanApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  /** Latest + history from GET /plan/history (no standalone GET /plan). */
  listPlans(farmId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms/${farmId}/plan/history`);
  }

  generatePlan(farmId: string, language: string = 'en'): Observable<unknown> {
    return this.http.post(`${this.base}/farms/${farmId}/plan`, { language });
  }
}
