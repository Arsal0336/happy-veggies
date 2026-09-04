import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../config';

@Injectable({ providedIn: 'root' })
export class AssistantApiService {
  private readonly http = inject(HttpClient);
  private readonly base = API_BASE;

  listThreads(farmId: string): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.base}/farms/${farmId}/assistant/threads`);
  }

  createThread(farmId: string, body: { title?: string | null } = {}): Observable<unknown> {
    return this.http.post(`${this.base}/farms/${farmId}/assistant/threads`, body);
  }

  getThread(farmId: string, threadId: string): Observable<unknown> {
    return this.http.get(`${this.base}/farms/${farmId}/assistant/threads/${threadId}`);
  }

  postMessage(farmId: string, threadId: string, text: string): Observable<unknown> {
    return this.http.post(
      `${this.base}/farms/${farmId}/assistant/threads/${threadId}/messages`,
      { text },
    );
  }
}
