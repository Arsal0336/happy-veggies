import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class EconomicsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  getFarmEconomics(farmId: string): Observable<unknown> {
    return this.http.get(`${this.base}/farms/${farmId}/economics`);
  }
}
