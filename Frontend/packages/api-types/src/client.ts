/**
 * API Client — typed HTTP wrapper with error envelope handling.
 *
 * Component → Feature Hook → Feature Service → apiClient → VITE_API_BASE_URL
 *
 * During development the fixture adapter intercepts calls and returns
 * deterministic data. Replace with real backend when available.
 */

import type { ApiError } from '@hv/api-types';

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
  onError?: (error: ApiError) => void;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private buildUrl(path: string, params?: RequestOptions['params']): string {
    const url = new URL(path, this.config.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      // Handle 204 No Content
      if (response.status === 204) return undefined as T;
      return response.json() as Promise<T>;
    }

    // Parse error envelope
    let apiError: ApiError;
    try {
      apiError = await response.json();
    } catch {
      apiError = {
        code: 'VALIDATION_ERROR',
        message: response.statusText || `HTTP ${response.status}`,
        retryable: response.status >= 500,
      };
    }

    this.config.onError?.(apiError);
    throw apiError;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const { params, ...init } = options ?? {};
    const url = this.buildUrl(path, params);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    };

    const token = this.config.getToken?.();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { ...init, method: 'GET', headers });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const { params, ...init } = options ?? {};
    const url = this.buildUrl(path, params);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    };

    const token = this.config.getToken?.();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      ...init,
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const { params, ...init } = options ?? {};
    const url = this.buildUrl(path, params);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    };

    const token = this.config.getToken?.();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      ...init,
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const { params, ...init } = options ?? {};
    const url = this.buildUrl(path, params);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    };

    const token = this.config.getToken?.();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
      ...init,
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    const { params, ...init } = options ?? {};
    const url = this.buildUrl(path, params);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    };

    const token = this.config.getToken?.();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { ...init, method: 'DELETE', headers });
    return this.handleResponse<T>(response);
  }
}
