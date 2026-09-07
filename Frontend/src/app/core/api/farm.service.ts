import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class FarmApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  listFarms(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms`);
  }

  getFarm(farmId: string): Observable<unknown> {
    return this.http.get(`${this.base}/farms/${farmId}`);
  }

  createFarm(body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/farms`, body);
  }

  updateFarm(farmId: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.base}/farms/${farmId}`, body);
  }

  deleteFarm(farmId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/farms/${farmId}`);
  }

  listAreas(farmId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms/${farmId}/production-areas`);
  }

  createArea(farmId: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(`${this.base}/farms/${farmId}/production-areas`, body);
  }

  updateArea(farmId: string, areaId: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.patch(`${this.base}/farms/${farmId}/production-areas/${areaId}`, body);
  }

  deleteArea(farmId: string, areaId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/farms/${farmId}/production-areas/${areaId}`);
  }

  listZones(farmId: string, areaId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(
      `${this.base}/farms/${farmId}/production-areas/${areaId}/zones`,
    );
  }

  createZone(farmId: string, areaId: string, body: Record<string, unknown>): Observable<unknown> {
    return this.http.post(
      `${this.base}/farms/${farmId}/production-areas/${areaId}/zones`,
      body,
    );
  }

  updateZone(
    farmId: string,
    areaId: string,
    zoneId: string,
    body: Record<string, unknown>,
  ): Observable<unknown> {
    return this.http.patch(
      `${this.base}/farms/${farmId}/production-areas/${areaId}/zones/${zoneId}`,
      body,
    );
  }

  deleteZone(farmId: string, areaId: string, zoneId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/farms/${farmId}/production-areas/${areaId}/zones/${zoneId}`,
    );
  }
}
