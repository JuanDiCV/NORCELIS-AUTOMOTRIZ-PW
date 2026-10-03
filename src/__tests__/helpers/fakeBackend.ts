import { vi } from 'vitest';
import {
  listCoupons, createCoupon, updateCoupon, deleteCoupon, couponRedemptions, validateCouponForCart, redeemCoupon,
} from '../../../server/coupons';
import { isAdminConfigured, verifyAdminPassword, issueAdminToken, verifyAdminToken } from '../../../server/adminAuth';

/**
 * "Servidor" en memoria: enruta fetch hacia la misma lógica real que usa server.ts,
 * así el panel se prueba de punta a punta sin abrir puertos.
 */
export const installFakeBackend = () => {
  const json = (status: number, body: unknown) =>
    Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => body } as Response);

  vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
    const method = (init.method ?? 'GET').toUpperCase();
    const body = init.body ? JSON.parse(String(init.body)) : {};
    const auth = (init.headers as Record<string, string> | undefined)?.Authorization ?? '';

    if (url === '/api/admin/login' && method === 'POST') {
      if (!isAdminConfigured()) return json(503, { error: 'sin configurar', code: 'admin_not_configured' });
      return verifyAdminPassword(body.password)
        ? json(200, { token: issueAdminToken() })
        : json(401, { error: 'Clave de administrador incorrecta.', code: 'bad_password' });
    }

    if (url.startsWith('/api/admin/')) {
      if (!isAdminConfigured()) return json(503, { error: 'sin configurar', code: 'admin_not_configured' });
      if (!verifyAdminToken(auth.replace('Bearer ', ''))) return json(401, { error: 'Sesión inválida', code: 'unauthorized' });

      const m = url.match(/^\/api\/admin\/coupons(?:\/([^/]+))?(\/redemptions)?$/);
      if (m) {
        const id = m[1];
        if (!id && method === 'GET') return json(200, { coupons: listCoupons() });
        if (!id && method === 'POST') {
          const r = createCoupon(body);
          return r.ok ? json(201, { coupon: r.coupon }) : json(r.status, r);
        }
        if (id && m[2]) return json(200, { redemptions: couponRedemptions(id) });
        if (id && method === 'PUT') {
          const r = updateCoupon(id, body);
          return r.ok ? json(200, { coupon: r.coupon }) : json(r.status, r);
        }
        if (id && method === 'DELETE') return deleteCoupon(id) ? json(200, { ok: true }) : json(404, { error: 'no existe' });
      }
    }

    if (url === '/api/coupons/validate') return json(200, validateCouponForCart(body.code, body.items, body.customer));
    if (url === '/api/coupons/redeem') return json(200, redeemCoupon(body.code, body.items, body.customer, body.orderRef));
    return json(404, { error: 'ruta no encontrada' });
  });
};

