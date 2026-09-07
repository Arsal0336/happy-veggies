import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class TwinApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  getTwin(farmId: string): Observable<unknown> {
    return this.http.get(`${this.base}/farms/${farmId}/twin`);
  }

  refreshTwin(farmId: string): Observable<unknown> {
    return this.http.post(`${this.base}/farms/${farmId}/twin/refresh`, {});
  }
}
