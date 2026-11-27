import { env } from '@core/config/env';
import { HttpInfrastructureError } from '@core/errors/DomainError';

export interface ApiResponse<T = unknown> {
  body: T;
  message: string;
  status: number;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  timeoutMs?: number;
}

function isFormDataBody(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

export class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = env.apiBaseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('nt_admin_jwt_token');
  }

  public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const controller = new AbortController();
    const requestBody = options.body;
    const isFormData = isFormDataBody(requestBody);
    const timeoutId = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? 8000
    );

    const headers = new Headers(options.headers);
    if (isFormData) {
      headers.delete('Content-Type');
    } else {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('X-Client-Platform', 'TradingLifeAcademy-WebAdmin');

    const token = this.getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      let body: BodyInit | undefined;
      if (requestBody !== undefined) {
        body = isFormDataBody(requestBody)
          ? requestBody
          : JSON.stringify(requestBody);
      }
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let parsedMessage = errorText;
        try {
          const jsonError = JSON.parse(errorText);
          if (jsonError && typeof jsonError.message === 'string') {
            parsedMessage = jsonError.message;
          }
        } catch {
          // ignore
        }
        throw new HttpInfrastructureError(
          response.status,
          parsedMessage || `Error HTTP ${response.status}: ${response.statusText}`
        );
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  public post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  public postFormData<T>(path: string, body: FormData, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  public patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }

  public put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  public delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
