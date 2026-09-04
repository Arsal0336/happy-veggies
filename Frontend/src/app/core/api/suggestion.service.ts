import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class SuggestionApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  listCropSuggestions(farmId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms/${farmId}/suggestions`);
  }

  listSeedSuggestions(farmId: string, cropId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(
      `${this.base}/farms/${farmId}/seed-suggestions/${encodeURIComponent(cropId)}`,
    );
  }
}
