import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class AlertApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  listAlerts(farmId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms/${farmId}/alerts`);
  }

  markRead(farmId: string, alertId: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/farms/${farmId}/alerts/${alertId}/read`, {});
  }
}
