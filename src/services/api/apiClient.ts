import { API_BASE_URL, DEFAULT_API_TIMEOUT, IS_REMOTE_API_ENABLED, getApiHeaders } from '../../config/api';

/**
 * Cliente HTTP modular para interactuar con la infraestructura de Hostinger / WordPress REST API.
 */
export class ApiClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.timeoutMs = DEFAULT_API_TIMEOUT;
  }

  public isRemoteEnabled(): boolean {
    return IS_REMOTE_API_ENABLED;
  }

  public async get<T>(endpoint: string, params?: Record<string, string | number>, token?: string): Promise<T | null> {
    if (!this.isRemoteEnabled()) {
      return null;
    }

    try {
      const cleanBase = this.baseUrl.replace(/\/+$/, '');
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const url = new URL(`${cleanBase}${cleanEndpoint}`);

      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          url.searchParams.append(key, String(val));
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: getApiHeaders(token),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[Hostinger API] Error GET ${endpoint}: HTTP ${res.status}`);
        return null;
      }

      return (await res.json()) as T;
    } catch (err) {
      console.warn(`[Hostinger API] Falló conexión con ${endpoint}:`, err);
      return null;
    }
  }

  public async post<T, B = unknown>(endpoint: string, body: B, token?: string): Promise<T | null> {
    if (!this.isRemoteEnabled()) {
      return null;
    }

    try {
      const cleanBase = this.baseUrl.replace(/\/+$/, '');
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${cleanBase}${cleanEndpoint}`, {
        method: 'POST',
        headers: getApiHeaders(token),
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[Hostinger API] Error POST ${endpoint}: HTTP ${res.status}`);
        return null;
      }

      return (await res.json()) as T;
    } catch (err) {
      console.warn(`[Hostinger API] Falló solicitud POST a ${endpoint}:`, err);
      return null;
    }
  }
}

export const apiClient = new ApiClient();
