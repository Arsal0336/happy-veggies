import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class CropCycleApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  list(farmId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms/${farmId}/crop-cycles`);
  }

  recordActuals(
    farmId: string,
    cycleId: string,
    body: Record<string, unknown>,
  ): Observable<unknown> {
    return this.http.post(
      `${this.base}/farms/${farmId}/crop-cycles/${cycleId}/actuals`,
      body,
    );
  }
}
