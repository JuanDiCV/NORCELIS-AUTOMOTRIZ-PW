import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  evaluateCoupon, getCouponStatus, validateCouponInput, normalizeCouponCode,
  limaLocalToIso, isoToLimaLocal, describeCouponBenefit,
} from '../utils/couponLogic';
import type { CouponWithStats, CouponCartItem } from '../utils/couponLogic';
import {
  listCoupons, createCoupon, updateCoupon, deleteCoupon, validateCouponForCart, redeemCoupon, couponRedemptions,
  sanitizeCartItems, normalizeCustomerKey,
} from '../../server/coupons';
import {
  isAdminConfigured, verifyAdminPassword, issueAdminToken, verifyAdminToken, TOKEN_TTL_MS,
} from '../../server/adminAuth';

const NOW = new Date('2026-10-10T15:00:00Z');

const base: CouponWithStats = {
  id: 'c1', code: 'TEST10', name: 'Test', campaign: '', description: '', type: 'percent', value: 10,
  maxDiscountSoles: null, minPurchaseSoles: null, startsAt: null, expiresAt: null, usageLimit: null,
  perCustomerLimit: null, appliesTo: ['part'], active: true, createdAt: '', updatedAt: '', usedCount: 0,
};
const cart: CouponCartItem[] = [
  { type: 'part', priceSoles: 200, quantity: 2 },     // 400 elegibles
  { type: 'service', priceSoles: 100, quantity: 1 },   // no elegible por defecto
];

describe('lógica de cupones: cálculo', () => {
  it('porcentaje solo sobre productos elegibles', () => {
    expect(evaluateCoupon(base, cart, { now: NOW })).toEqual({ ok: true, discountSoles: 40, eligibleSubtotalSoles: 400 });
  });

  it('monto fijo nunca supera el subtotal elegible', () => {
    const fixed = { ...base, type: 'fixed' as const, value: 1000 };
    expect(evaluateCoupon(fixed, cart, { now: NOW })).toMatchObject({ ok: true, discountSoles: 400 });
  });

  it('respeta el tope de descuento en porcentajes', () => {
    const capped = { ...base, value: 50, maxDiscountSoles: 60 };
    expect(evaluateCoupon(capped, cart, { now: NOW })).toMatchObject({ ok: true, discountSoles: 60 });
  });

  it('exige compra mínima sobre lo elegible (no sobre todo el carrito)', () => {
    const min = { ...base, minPurchaseSoles: 450 }; // el carrito suma 500 pero solo 400 es elegible
    const r = evaluateCoupon(min, cart, { now: NOW });
    expect(r.ok).toBe(false);
    expect(evaluateCoupon({ ...base, minPurchaseSoles: 400 }, cart, { now: NOW }).ok).toBe(true);
  });

  it('puede aplicar a varios tipos de ítem', () => {
    const all = { ...base, appliesTo: ['part', 'service'] as CouponWithStats['appliesTo'] };
    expect(evaluateCoupon(all, cart, { now: NOW })).toMatchObject({ ok: true, discountSoles: 50 });
  });

  it('rechaza si el carrito no tiene nada elegible', () => {
    const r = evaluateCoupon(base, [{ type: 'service', priceSoles: 100, quantity: 1 }], { now: NOW });
    expect(r).toMatchObject({ ok: false });
  });

  it('redondea a céntimos', () => {
    const odd = { ...base, value: 7.5 };
    expect(evaluateCoupon(odd, [{ type: 'part', priceSoles: 33.33, quantity: 1 }], { now: NOW })).toMatchObject({ discountSoles: 2.5 });
  });
});

describe('lógica de cupones: vigencia y estados', () => {
  it('programado, activo y vencido según las fechas', () => {
    const c = { ...base, startsAt: '2026-10-11T00:00:00Z', expiresAt: '2026-10-20T00:00:00Z' };
    expect(getCouponStatus(c, NOW)).toBe('scheduled');
    expect(getCouponStatus(c, new Date('2026-10-15T00:00:00Z'))).toBe('active');
    expect(getCouponStatus(c, new Date('2026-10-21T00:00:00Z'))).toBe('expired');
    expect(evaluateCoupon(c, cart, { now: NOW }).ok).toBe(false);
  });

  it('pausado y agotado', () => {
    expect(getCouponStatus({ ...base, active: false }, NOW)).toBe('paused');
    expect(getCouponStatus({ ...base, usageLimit: 5, usedCount: 5 }, NOW)).toBe('exhausted');
    expect(getCouponStatus({ ...base, usageLimit: 5, usedCount: 4 }, NOW)).toBe('active');
  });

  it('el vencimiento prevalece sobre agotado y pausado se evalúa primero', () => {
    expect(getCouponStatus({ ...base, active: false, expiresAt: '2020-01-01T00:00:00Z' }, NOW)).toBe('paused');
    expect(getCouponStatus({ ...base, expiresAt: '2020-01-01T00:00:00Z', usageLimit: 1, usedCount: 1 }, NOW)).toBe('expired');
  });

  it('límite por cliente: exige identificarse y respeta el máximo', () => {
    const c = { ...base, perCustomerLimit: 1 };
    expect(evaluateCoupon(c, cart, { now: NOW, customerUses: null })).toMatchObject({ ok: false });
    expect(evaluateCoupon(c, cart, { now: NOW, customerUses: 1 })).toMatchObject({ ok: false });
    expect(evaluateCoupon(c, cart, { now: NOW, customerUses: 0 }).ok).toBe(true);
  });
});

describe('lógica de cupones: validación de la definición', () => {
  const valid = { code: ' cyber-wow 10 ', name: 'Cyber', type: 'percent', value: 10, appliesTo: ['part'] };

  it('normaliza el código', () => {
    expect(normalizeCouponCode(' cyber wow_10-x! ')).toBe('CYBERWOW_10-X');
    const r = validateCouponInput(valid);
    expect(r.ok && r.value.code).toBe('CYBER-WOW10');
  });

  it('acepta una definición correcta con valores por defecto', () => {
    const r = validateCouponInput(valid);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toMatchObject({ active: true, maxDiscountSoles: null, usageLimit: null, expiresAt: null });
  });

  it('rechaza valores inválidos con errores por campo', () => {
    const r = validateCouponInput({ code: 'AB', name: '', type: 'percent', value: 150, appliesTo: [], usageLimit: 1.5, minPurchaseSoles: -5 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['appliesTo', 'code', 'minPurchaseSoles', 'name', 'usageLimit', 'value']);
  });

  it('el vencimiento debe ser posterior al inicio', () => {
    const r = validateCouponInput({ ...valid, startsAt: '2026-11-01T00:00:00Z', expiresAt: '2026-10-01T00:00:00Z' });
    expect(r.ok).toBe(false);
  });

  it('el tope solo se conserva en porcentajes', () => {
    const r = validateCouponInput({ ...valid, type: 'fixed', value: 30, maxDiscountSoles: 10 });
    expect(r.ok && r.value.maxDiscountSoles).toBeNull();
  });

  it('convierte fechas de Lima (UTC-5) ida y vuelta', () => {
    expect(limaLocalToIso('2026-10-31T23:59')).toBe('2026-11-01T04:59:00.000Z');
    expect(isoToLimaLocal('2026-11-01T04:59:00.000Z')).toBe('2026-10-31T23:59');
    expect(limaLocalToIso('')).toBeNull();
    expect(limaLocalToIso('basura')).toBeNull();
  });

  it('describe el beneficio', () => {
    expect(describeCouponBenefit({ type: 'percent', value: 10, maxDiscountSoles: 50 })).toBe('10% (tope S/ 50)');
    expect(describeCouponBenefit({ type: 'fixed', value: 30, maxDiscountSoles: null })).toBe('S/ 30');
  });
});

describe('servidor de cupones', () => {
  let dir: string;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coupons-'));
    process.env.COUPONS_DATA_DIR = dir;
  });
  afterEach(() => {
    delete process.env.COUPONS_DATA_DIR;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  const items = [{ type: 'part', priceSoles: 200, quantity: 2 }];
  const make = (extra: object = {}) => {
    const r = createCoupon({ code: 'CYBER10', name: 'Cyber', type: 'percent', value: 10, appliesTo: ['part'], ...extra });
    if (!r.ok) throw new Error(JSON.stringify(r));
    return r.coupon;
  };

  it('crea el cupón inicial NORCELIS5 la primera vez', () => {
    const list = listCoupons();
    expect(list.map((c) => c.code)).toEqual(['NORCELIS5']);
    expect(validateCouponForCart('norcelis5', items, null)).toMatchObject({ valid: true, discountSoles: 20 });
  });

  it('no permite códigos duplicados', () => {
    make();
    const dup = createCoupon({ code: 'cyber10', name: 'Otro', type: 'fixed', value: 5, appliesTo: ['part'] });
    expect(dup).toMatchObject({ ok: false, status: 409 });
  });

  it('edita un cupón y valida que el nuevo código no choque', () => {
    const a = make();
    const b = make({ code: 'OTRO20', value: 20 });
    expect(updateCoupon(a.id, { ...a, value: 15 })).toMatchObject({ ok: true });
    expect(validateCouponForCart('CYBER10', items, null)).toMatchObject({ valid: true, discountSoles: 60 });
    expect(updateCoupon(b.id, { ...b, code: 'CYBER10' })).toMatchObject({ ok: false, status: 409 });
    expect(updateCoupon('no-existe', a)).toMatchObject({ ok: false, status: 404 });
  });

  it('pausar, vencer o eliminar invalida el cupón de inmediato', () => {
    const c = make();
    expect(validateCouponForCart('CYBER10', items, null)).toMatchObject({ valid: true });
    updateCoupon(c.id, { ...c, active: false });
    expect(validateCouponForCart('CYBER10', items, null)).toMatchObject({ valid: false });
    updateCoupon(c.id, { ...c, active: true, expiresAt: '2020-01-01T00:00:00Z' });
    expect(validateCouponForCart('CYBER10', items, null)).toMatchObject({ valid: false, message: expect.stringContaining('venci') });
    expect(deleteCoupon(c.id)).toBe(true);
    expect(deleteCoupon(c.id)).toBe(false);
  });

  it('respeta la vigencia usando la fecha indicada', () => {
    make({ startsAt: '2026-10-11T00:00:00Z', expiresAt: '2026-10-20T00:00:00Z' });
    expect(validateCouponForCart('CYBER10', items, null, new Date('2026-10-10T00:00:00Z'))).toMatchObject({ valid: false });
    expect(validateCouponForCart('CYBER10', items, null, new Date('2026-10-15T00:00:00Z'))).toMatchObject({ valid: true });
    expect(validateCouponForCart('CYBER10', items, null, new Date('2026-10-21T00:00:00Z'))).toMatchObject({ valid: false });
  });

  it('validar no consume; canjear sí, y el límite total se agota', () => {
    make({ usageLimit: 2 });
    validateCouponForCart('CYBER10', items, null);
    validateCouponForCart('CYBER10', items, null);
    expect(listCoupons().find((c) => c.code === 'CYBER10')?.usedCount).toBe(0);

    expect(redeemCoupon('CYBER10', items, null, 'NC-1')).toMatchObject({ valid: true });
    expect(redeemCoupon('CYBER10', items, null, 'NC-2')).toMatchObject({ valid: true });
    expect(redeemCoupon('CYBER10', items, null, 'NC-3')).toMatchObject({ valid: false, message: expect.stringContaining('límite') });
    expect(listCoupons().find((c) => c.code === 'CYBER10')?.usedCount).toBe(2);
  });

  it('límite por cliente: cuenta por correo/DNI y exige identificarse', () => {
    make({ perCustomerLimit: 1 });
    expect(validateCouponForCart('CYBER10', items, null)).toMatchObject({ valid: false });
    expect(redeemCoupon('CYBER10', items, 'Ana@Test.com', 'NC-1')).toMatchObject({ valid: true });
    expect(redeemCoupon('CYBER10', items, ' ana@test.com ', 'NC-2')).toMatchObject({ valid: false });
    expect(redeemCoupon('CYBER10', items, 'otro@test.com', 'NC-3')).toMatchObject({ valid: true });
  });

  it('guarda el historial de canjes con el pedido y el monto', () => {
    const c = make();
    redeemCoupon('CYBER10', items, '12345678', 'NC-2026-1234');
    const [r] = couponRedemptions(c.id);
    expect(r).toMatchObject({ code: 'CYBER10', orderRef: 'NC-2026-1234', discountSoles: 40, customerKey: '12345678' });
  });

  it('un código inexistente y uno pausado dan el mismo mensaje (no filtra qué existe)', () => {
    const c = make();
    updateCoupon(c.id, { ...c, active: false });
    const a = validateCouponForCart('CYBER10', items, null);
    const b = validateCouponForCart('NOEXISTE', items, null);
    expect(a).toEqual(b);
  });

  it('sanea los datos que manda el navegador', () => {
    expect(sanitizeCartItems('x')).toEqual([]);
    expect(sanitizeCartItems([
      { type: 'part', priceSoles: 10, quantity: 1 },
      { type: 'hack', priceSoles: 10, quantity: 1 },
      { type: 'part', priceSoles: -5, quantity: 1 },
      { type: 'part', priceSoles: 10, quantity: 0 },
      { type: 'part', priceSoles: 10, quantity: 1.5 },
      { type: 'part', priceSoles: 1e12, quantity: 1 },
    ])).toEqual([{ type: 'part', priceSoles: 10, quantity: 1 }]);
    expect(normalizeCustomerKey('  AB ')).toBeNull();
    expect(normalizeCustomerKey(' Ana@Test.com ')).toBe('ana@test.com');
  });

  it('el archivo se escribe completo (sin temporales sobrantes)', () => {
    make();
    expect(fs.readdirSync(dir).sort()).toEqual(['coupons.json']);
    expect(JSON.parse(fs.readFileSync(path.join(dir, 'coupons.json'), 'utf8')).coupons.length).toBeGreaterThan(0);
  });
});

describe('autenticación de administrador', () => {
  const OLD = { ...process.env };
  afterEach(() => {
    process.env.ADMIN_PASSWORD = OLD.ADMIN_PASSWORD;
    process.env.ADMIN_TOKEN_SECRET = OLD.ADMIN_TOKEN_SECRET;
    if (OLD.ADMIN_PASSWORD === undefined) delete process.env.ADMIN_PASSWORD;
    if (OLD.ADMIN_TOKEN_SECRET === undefined) delete process.env.ADMIN_TOKEN_SECRET;
  });

  it('sin clave configurada (o muy corta) el panel queda deshabilitado', () => {
    delete process.env.ADMIN_PASSWORD;
    expect(isAdminConfigured()).toBe(false);
    expect(verifyAdminPassword('cualquiera')).toBe(false);
    process.env.ADMIN_PASSWORD = 'corta';
    expect(isAdminConfigured()).toBe(false);
  });

  it('verifica la clave y emite tokens válidos solo por 8 horas', () => {
    process.env.ADMIN_PASSWORD = 'clave-segura-123';
    expect(verifyAdminPassword('clave-segura-123')).toBe(true);
    expect(verifyAdminPassword('clave-segura-124')).toBe(false);
    expect(verifyAdminPassword(undefined)).toBe(false);

    const t0 = 1_000_000;
    const token = issueAdminToken(t0);
    expect(verifyAdminToken(token, t0 + 1000)).toBe(true);
    expect(verifyAdminToken(token, t0 + TOKEN_TTL_MS + 1)).toBe(false);
  });

  it('rechaza tokens alterados, ajenos o mal formados', () => {
    process.env.ADMIN_PASSWORD = 'clave-segura-123';
    const token = issueAdminToken();
    const [payload, sig] = token.split('.');
    const forged = Buffer.from(JSON.stringify({ exp: Date.now() + 1e12 })).toString('base64url');
    expect(verifyAdminToken(`${forged}.${sig}`)).toBe(false);
    expect(verifyAdminToken(`${payload}.`)).toBe(false);
    expect(verifyAdminToken(`${payload}.${sig}.x`)).toBe(false);
    expect(verifyAdminToken('')).toBe(false);
    expect(verifyAdminToken(undefined)).toBe(false);
  });

  it('cambiar la clave invalida los tokens anteriores', () => {
    process.env.ADMIN_PASSWORD = 'clave-segura-123';
    const token = issueAdminToken();
    process.env.ADMIN_PASSWORD = 'otra-clave-distinta-1';
    expect(verifyAdminToken(token)).toBe(false);
  });
});
