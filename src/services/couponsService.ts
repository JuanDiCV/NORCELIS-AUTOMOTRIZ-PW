import type { CouponCartItem, CouponInput, CouponWithStats } from '../utils/couponLogic';

// ── Carrito (público) ─────────────────────────────────────────────────────────

export type CouponCheckResponse =
  | {
      valid: true;
      discountSoles: number;
      eligibleSubtotalSoles: number;
      coupon: { code: string; name: string; benefit: string; expiresAt: string | null };
    }
  | { valid: false; message: string };

const post = async <T>(url: string, body: unknown, fallback: T): Promise<T> => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return data && typeof data === 'object' ? (data as T) : fallback;
  } catch {
    return fallback;
  }
};

const UNAVAILABLE: CouponCheckResponse = {
  valid: false,
  message: 'No pudimos validar el cupón en este momento. Inténtalo nuevamente.',
};

/** Valida el cupón contra el servidor sin consumirlo. */
export const validateCoupon = (code: string, items: CouponCartItem[], customer: string | null): Promise<CouponCheckResponse> =>
  post<CouponCheckResponse>('/api/coupons/validate', { code, items, customer }, UNAVAILABLE).then((r) =>
    // el servidor puede responder con un error de límite: se normaliza al formato esperado
    'valid' in r ? r : UNAVAILABLE
  );

/** Consume un uso del cupón al confirmar el pedido. */
export const redeemCoupon = (code: string, items: CouponCartItem[], customer: string | null, orderRef: string): Promise<CouponCheckResponse> =>
  post<CouponCheckResponse>('/api/coupons/redeem', { code, items, customer, orderRef }, UNAVAILABLE).then((r) =>
    'valid' in r ? r : UNAVAILABLE
  );

// ── Administración (requiere clave de administrador del servidor) ─────────────

const TOKEN_KEY = 'norcelis_admin_api_token';

export class AdminApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;
  constructor(message: string, status: number, code?: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

// sessionStorage: el token se descarta al cerrar la pestaña
export const getAdminApiToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const clearAdminApiToken = (): void => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // sin almacenamiento disponible
  }
};

const adminFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = getAdminApiToken();
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new AdminApiError('No pudimos conectar con el servidor.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) clearAdminApiToken();
    throw new AdminApiError(data.error || 'Ocurrió un error inesperado.', res.status, data.code, data.errors);
  }
  return data as T;
};

export const adminLogin = async (password: string): Promise<void> => {
  const data = await adminFetch<{ token: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  try {
    sessionStorage.setItem(TOKEN_KEY, data.token);
  } catch {
    throw new AdminApiError('El navegador no permite guardar la sesión.', 0);
  }
};

export interface CouponRedemptionRow {
  couponId: string;
  code: string;
  at: string;
  customerKey: string | null;
  orderRef: string;
  discountSoles: number;
}

export const adminListCoupons = async (): Promise<CouponWithStats[]> =>
  (await adminFetch<{ coupons: CouponWithStats[] }>('/api/admin/coupons')).coupons;

export const adminCreateCoupon = async (input: CouponInput): Promise<CouponWithStats> =>
  (await adminFetch<{ coupon: CouponWithStats }>('/api/admin/coupons', { method: 'POST', body: JSON.stringify(input) })).coupon;

export const adminUpdateCoupon = async (id: string, input: CouponInput): Promise<CouponWithStats> =>
  (await adminFetch<{ coupon: CouponWithStats }>(`/api/admin/coupons/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(input) })).coupon;

export const adminDeleteCoupon = async (id: string): Promise<void> => {
  await adminFetch<{ ok: boolean }>(`/api/admin/coupons/${encodeURIComponent(id)}`, { method: 'DELETE' });
};

export const adminCouponRedemptions = async (id: string): Promise<CouponRedemptionRow[]> =>
  (await adminFetch<{ redemptions: CouponRedemptionRow[] }>(`/api/admin/coupons/${encodeURIComponent(id)}/redemptions`)).redemptions;
