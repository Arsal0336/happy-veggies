import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

export interface RegionSuggestion {
  regionCode: string;
  regionLabel: string;
}

@Injectable({ providedIn: 'root' })
export class SystemApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE.replace(/\/api\/v1$/, '/api/v1');

  suggestRegion(lat: number, lng: number): Observable<RegionSuggestion> {
    return this.http.get<RegionSuggestion>(`${this.base}/system/region-suggest`, {
      params: { lat: String(lat), lng: String(lng) },
    });
  }
}
