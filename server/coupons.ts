import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  evaluateCoupon,
  normalizeCouponCode,
  toText,
  toNumber,
  validateCouponInput,
  describeCouponBenefit,
  COUPON_ITEM_KINDS,
} from '../src/utils/couponLogic.ts';
import type { Coupon, CouponCartItem, CouponInput, CouponItemKind, CouponWithStats } from '../src/utils/couponLogic.ts';

/**
 * Almacén y servicio de cupones de descuento (fuente de verdad en el servidor).
 *
 * Archivos (carpeta COUPONS_DATA_DIR, o CLAIMS_DATA_DIR, o ./data):
 *   coupons.json              definiciones de cupones (escritura atómica)
 *   coupon-redemptions.jsonl  un registro por canje (historial y conteo de usos)
 *
 * El servidor es de un solo proceso y las operaciones son síncronas, por lo que cada
 * canje es atómico respecto a los demás.
 */

const dataDir = (): string =>
  process.env.COUPONS_DATA_DIR || process.env.CLAIMS_DATA_DIR || path.resolve(process.cwd(), 'data');

const couponsFile = (): string => path.join(dataDir(), 'coupons.json');
const redemptionsFile = (): string => path.join(dataDir(), 'coupon-redemptions.jsonl');

export interface Redemption {
  couponId: string;
  code: string;
  at: string;
  customerKey: string | null;
  orderRef: string;
  discountSoles: number;
}

// ── Persistencia ──────────────────────────────────────────────────────────────

/** Cupón inicial: conserva el comportamiento histórico de la web (NORCELIS5 = 5% en repuestos). */
const seedCoupons = (now: string): Coupon[] => [
  {
    id: crypto.randomUUID(),
    code: 'NORCELIS5',
    name: 'Cupón de bienvenida',
    campaign: 'Permanente',
    description: '5% de descuento en repuestos y accesorios.',
    type: 'percent',
    value: 5,
    maxDiscountSoles: null,
    minPurchaseSoles: null,
    startsAt: null,
    expiresAt: null,
    usageLimit: null,
    perCustomerLimit: null,
    appliesTo: ['part'],
    active: true,
    createdAt: now,
    updatedAt: now,
  },
];

const writeCoupons = (list: Coupon[]): void => {
  fs.mkdirSync(dataDir(), { recursive: true });
  const tmp = `${couponsFile()}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify({ coupons: list }, null, 2), 'utf8');
  fs.renameSync(tmp, couponsFile()); // reemplazo atómico: nunca queda un archivo a medio escribir
};

export const loadCoupons = (): Coupon[] => {
  const file = couponsFile();
  if (!fs.existsSync(file)) {
    const seeded = seedCoupons(new Date().toISOString());
    writeCoupons(seeded);
    return seeded;
  }
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as { coupons?: Coupon[] };
  return Array.isArray(parsed.coupons) ? parsed.coupons : [];
};

const readRedemptions = (): Redemption[] => {
  const file = redemptionsFile();
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as Redemption];
      } catch {
        return []; // una línea dañada no debe romper el conteo del resto
      }
    });
};

const withStats = (coupons: Coupon[], redemptions: Redemption[]): CouponWithStats[] => {
  const counts = new Map<string, number>();
  for (const r of redemptions) counts.set(r.couponId, (counts.get(r.couponId) ?? 0) + 1);
  return coupons.map((c) => ({ ...c, usedCount: counts.get(c.id) ?? 0 }));
};

// ── Administración (CRUD) ─────────────────────────────────────────────────────

export type CouponMutation =
  | { ok: true; coupon: CouponWithStats }
  | { ok: false; status: number; error: string; errors?: Record<string, string> };

export const listCoupons = (): CouponWithStats[] =>
  withStats(loadCoupons(), readRedemptions()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const createCoupon = (body: unknown): CouponMutation => {
  const parsed = validateCouponInput(body);
  if (!parsed.ok) return { ok: false, status: 400, error: 'Revisa los datos del cupón.', errors: parsed.errors };

  const list = loadCoupons();
  if (list.some((c) => c.code === parsed.value.code)) {
    return { ok: false, status: 409, error: 'Ya existe un cupón con ese código.', errors: { code: 'Ese código ya está en uso.' } };
  }

  const now = new Date().toISOString();
  const coupon: Coupon = { ...parsed.value, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  writeCoupons([coupon, ...list]);
  return { ok: true, coupon: { ...coupon, usedCount: 0 } };
};

export const updateCoupon = (id: string, body: unknown): CouponMutation => {
  const parsed = validateCouponInput(body);
  if (!parsed.ok) return { ok: false, status: 400, error: 'Revisa los datos del cupón.', errors: parsed.errors };

  const list = loadCoupons();
  const index = list.findIndex((c) => c.id === id);
  if (index < 0) return { ok: false, status: 404, error: 'El cupón no existe.' };
  if (list.some((c) => c.id !== id && c.code === parsed.value.code)) {
    return { ok: false, status: 409, error: 'Ya existe un cupón con ese código.', errors: { code: 'Ese código ya está en uso.' } };
  }

  const updated: Coupon = { ...list[index], ...parsed.value, id, updatedAt: new Date().toISOString() };
  list[index] = updated;
  writeCoupons(list);
  const used = readRedemptions().filter((r) => r.couponId === id).length;
  return { ok: true, coupon: { ...updated, usedCount: used } };
};

export const deleteCoupon = (id: string): boolean => {
  const list = loadCoupons();
  const next = list.filter((c) => c.id !== id);
  if (next.length === list.length) return false;
  writeCoupons(next);
  return true;
};

export const couponRedemptions = (id: string, limit = 100): Redemption[] =>
  readRedemptions()
    .filter((r) => r.couponId === id)
    .slice(-limit)
    .reverse();

// ── Uso público: validar y canjear ────────────────────────────────────────────

/** Identificador del cliente (correo o DNI/RUC) para límites por cliente. null si no sirve. */
export const normalizeCustomerKey = (raw: unknown): string | null => {
  const s = toText(raw).toLowerCase().replace(/\s+/g, '').slice(0, 80);
  return s.length >= 5 ? s : null;
};

/** Limpia los ítems que envía el navegador: solo tipos, precios y cantidades razonables. */
export const sanitizeCartItems = (raw: unknown): CouponCartItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 100).flatMap((i): CouponCartItem[] => {
    const item = (i && typeof i === 'object' ? i : {}) as Record<string, unknown>;
    const type = item.type as CouponItemKind;
    const price = toNumber(item.priceSoles);
    const qty = toNumber(item.quantity);
    if (!COUPON_ITEM_KINDS.includes(type)) return [];
    if (!Number.isFinite(price) || price < 0 || price > 10_000_000) return [];
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) return [];
    return [{ type, priceSoles: price, quantity: qty }];
  });
};

export interface PublicCouponInfo {
  code: string;
  name: string;
  benefit: string;
  expiresAt: string | null;
}

export type CouponCheck =
  | { valid: true; discountSoles: number; eligibleSubtotalSoles: number; coupon: PublicCouponInfo }
  | { valid: false; message: string };

const NOT_FOUND = 'Cupón inválido o expirado.';

const check = (codeRaw: unknown, itemsRaw: unknown, customerRaw: unknown, now = new Date()): { result: CouponCheck; coupon?: CouponWithStats; customerKey: string | null } => {
  const code = normalizeCouponCode(codeRaw);
  const customerKey = normalizeCustomerKey(customerRaw);
  if (!code) return { result: { valid: false, message: 'Ingresa un código de cupón.' }, customerKey };

  const redemptions = readRedemptions();
  const found = withStats(loadCoupons(), redemptions).find((c) => c.code === code);
  // Mismo mensaje para "no existe" que para "pausado": no revelar qué códigos existen
  if (!found || !found.active) return { result: { valid: false, message: NOT_FOUND }, customerKey };

  const customerUses = customerKey
    ? redemptions.filter((r) => r.couponId === found.id && r.customerKey === customerKey).length
    : null;

  const evaluation = evaluateCoupon(found, sanitizeCartItems(itemsRaw), { now, customerUses });
  if (!evaluation.ok) return { result: { valid: false, message: evaluation.reason }, customerKey };

  return {
    coupon: found,
    customerKey,
    result: {
      valid: true,
      discountSoles: evaluation.discountSoles,
      eligibleSubtotalSoles: evaluation.eligibleSubtotalSoles,
      coupon: { code: found.code, name: found.name, benefit: describeCouponBenefit(found), expiresAt: found.expiresAt },
    },
  };
};

/** Valida sin consumir el cupón. */
export const validateCouponForCart = (code: unknown, items: unknown, customer: unknown, now = new Date()): CouponCheck =>
  check(code, items, customer, now).result;

/** Vuelve a validar y registra el canje. Es la única operación que consume un uso. */
export const redeemCoupon = (code: unknown, items: unknown, customer: unknown, orderRef: unknown, now = new Date()): CouponCheck => {
  const { result, coupon, customerKey } = check(code, items, customer, now);
  if (!result.valid || !coupon) return result;

  const redemption: Redemption = {
    couponId: coupon.id,
    code: coupon.code,
    at: now.toISOString(),
    customerKey,
    orderRef: toText(orderRef).slice(0, 60),
    discountSoles: result.discountSoles,
  };
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.appendFileSync(redemptionsFile(), JSON.stringify(redemption) + '\n', 'utf8');
  return result;
};

export type { CouponInput };
