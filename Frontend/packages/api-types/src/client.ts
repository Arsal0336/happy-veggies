export type GetToken = () => string | null | undefined;
export type OnUnauthorized = () => void;

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** Local shape — mirrors ApiErrorEnvelope without circular import. */
interface ErrorEnvelope {
  code: string;
  message: string;
  correlationId: string;
  errors?: { field: string; message: string }[];
  retryable?: boolean;
}

/**
 * Join base + path without dropping base path segments (e.g. `/api/v1`).
 * Do not use `new URL(path, base)` when `path` is absolute — that resets the path.
 */
export function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  if (!path) return base;
  if (/^https?:\/\//i.test(path)) return path;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

function createCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `corr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function appendQuery(
  url: string,
  params?: RequestOptions['params'],
): string {
  if (!params) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  if (!qs) return url;
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`;
}

export class ApiError extends Error {
  readonly code: string;
  readonly correlationId: string;
  readonly errors?: { field: string; message: string }[];
  readonly retryable: boolean;
  readonly status: number;
  readonly envelope: ErrorEnvelope;

  constructor(status: number, envelope: ErrorEnvelope) {
    super(envelope.message || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = envelope.code;
    this.correlationId = envelope.correlationId;
    this.errors = envelope.errors;
    this.retryable = envelope.retryable ?? false;
    this.envelope = envelope;
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getToken?: GetToken;
  private readonly onUnauthorized?: OnUnauthorized;

  constructor(
    baseUrl: string,
    getToken?: GetToken,
    onUnauthorized?: OnUnauthorized,
  ) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
    this.onUnauthorized = onUnauthorized;
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = appendQuery(joinUrl(this.baseUrl, path), options?.params);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Correlation-Id': createCorrelationId(),
      ...options?.headers,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: options?.signal,
    });

    if (response.status === 401) {
      this.onUnauthorized?.();
    }

    if (response.ok) {
      if (response.status === 204) return undefined as T;
      const text = await response.text();
      if (!text) return undefined as T;
      return JSON.parse(text) as T;
    }

    let envelope: ErrorEnvelope;
    try {
      const parsed = (await response.json()) as Partial<ErrorEnvelope>;
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('invalid envelope');
      }
      envelope = {
        code: parsed.code ?? `HTTP_${response.status}`,
        message:
          parsed.message ??
          (response.statusText || `HTTP ${response.status}`),
        correlationId:
          parsed.correlationId ?? headers['X-Correlation-Id'],
        errors: parsed.errors,
        retryable:
          parsed.retryable ??
          (response.status === 429 || response.status >= 500),
      };
    } catch {
      envelope = {
        code: `HTTP_${response.status}`,
        message: response.statusText || `HTTP ${response.status}`,
        correlationId: headers['X-Correlation-Id'],
        retryable: response.status === 429 || response.status >= 500,
      };
    }

    throw new ApiError(response.status, envelope);
  }
}
