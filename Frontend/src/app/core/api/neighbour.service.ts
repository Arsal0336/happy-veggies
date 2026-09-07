import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class NeighbourApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  listEdges(farmId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms/${farmId}/neighbour-edges`);
  }

  upsertEdge(farmId: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.put(`${this.base}/farms/${farmId}/neighbour-edges`, body);
  }

  deleteEdge(farmId: string, edgeId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/farms/${farmId}/neighbour-edges/${edgeId}`);
  }

  listWarnings(farmId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms/${farmId}/neighbour-warnings`);
  }
}
