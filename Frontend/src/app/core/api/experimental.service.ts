import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class ExperimentalApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  getStatus(farmId: string): Observable<unknown> {
    return this.http.get(`${this.base}/farms/${farmId}/experimental`);
  }

  /** Live: POST /experimental/zones/{zoneId}/approve */
  approveZone(farmId: string, zoneId: string): Observable<unknown> {
    return this.http.post(
      `${this.base}/farms/${farmId}/experimental/zones/${zoneId}/approve`,
      {},
    );
  }

  recordOutcome(farmId: string, zoneId: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(
      `${this.base}/farms/${farmId}/experimental/zones/${zoneId}/outcome`,
      body,
    );
  }
}
