import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class GreenApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  getGreenScore(farmId: string): Observable<unknown> {
    return this.http.get(`${this.base}/farms/${farmId}/green-score`);
  }

  refreshGreenScore(farmId: string): Observable<unknown> {
    return this.http.post(`${this.base}/farms/${farmId}/green-score/recalculate`, {});
  }

  getGreenTips(farmId: string): Observable<unknown> {
    return this.http.get(`${this.base}/farms/${farmId}/green-tips`);
  }
}
