import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class SoilApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  list(farmId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms/${farmId}/soil-profiles`);
  }

  upsert(farmId: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.put(`${this.base}/farms/${farmId}/soil-profiles`, body);
  }
}
