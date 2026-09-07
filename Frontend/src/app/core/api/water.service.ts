import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class WaterApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  list(farmId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms/${farmId}/water-sources`);
  }

  create(farmId: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/farms/${farmId}/water-sources`, body);
  }

  update(farmId: string, sourceId: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.base}/farms/${farmId}/water-sources/${sourceId}`, body);
  }

  delete(farmId: string, sourceId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/farms/${farmId}/water-sources/${sourceId}`);
  }
}
