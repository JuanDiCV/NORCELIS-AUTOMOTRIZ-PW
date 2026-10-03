/**
 * Lógica pura de cupones de descuento (sin dependencias).
 * La usan el SERVIDOR (decisión autoritativa) y el panel de administración (estados y vista previa).
 * No agregar imports: el servidor la carga con `node server.ts`, que no resuelve imports sin extensión.
 */

export type CouponType = 'percent' | 'fixed';
export type CouponItemKind = 'part' | 'service' | 'vehicle_reservation';
export type CouponStatus = 'active' | 'scheduled' | 'expired' | 'exhausted' | 'paused';

export const COUPON_ITEM_KINDS: CouponItemKind[] = ['part', 'service', 'vehicle_reservation'];

export const COUPON_ITEM_KIND_LABELS: Record<CouponItemKind, string> = {
  part: 'Repuestos y accesorios',
  service: 'Servicios de taller',
  vehicle_reservation: 'Reservas de vehículos',
};

export interface CouponInput {
  code: string;
  name: string;
  /** Campaña a la que pertenece (ej. "Cyber Wow Octubre"). Solo para organizar. */
  campaign: string;
  description: string;
  type: CouponType;
  /** percent: 1–100. fixed: monto en soles. */
  value: number;
  /** Tope del descuento en soles (solo útil en porcentajes). */
  maxDiscountSoles: number | null;
  /** Compra mínima, sobre los productos elegibles, en soles. */
  minPurchaseSoles: number | null;
  /** ISO 8601. null = sin fecha de inicio. */
  startsAt: string | null;
  /** ISO 8601. null = no expira. */
  expiresAt: string | null;
  /** Usos totales permitidos. null = ilimitado. */
  usageLimit: number | null;
  /** Usos por cliente (por DNI/RUC o correo). null = ilimitado. */
  perCustomerLimit: number | null;
  /** Tipos de ítem sobre los que aplica el descuento. */
  appliesTo: CouponItemKind[];
  /** Interruptor manual: false = pausado. */
  active: boolean;
}

export interface Coupon extends CouponInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponWithStats extends Coupon {
  usedCount: number;
}

export interface CouponCartItem {
  type: CouponItemKind;
  priceSoles: number;
  quantity: number;
}

export type CouponEvaluation =
  | { ok: true; discountSoles: number; eligibleSubtotalSoles: number }
  | { ok: false; reason: string };

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Conversión segura de valores que llegan del cliente.
 * `String(x)` y `Number(x)` LANZAN una excepción con objetos como {"toString":1,"valueOf":1} (válidos en JSON),
 * lo que permitiría provocar errores 500 a voluntad. Solo se aceptan textos, números y booleanos.
 */
export const toText = (v: unknown): string =>
  typeof v === 'string' ? v : typeof v === 'number' || typeof v === 'boolean' ? String(v) : '';

export const toNumber = (v: unknown): number =>
  typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;

/** Mayúsculas y solo A-Z 0-9 _ - (así se compara y se guarda siempre). */
export const normalizeCouponCode = (raw: unknown): string =>
  toText(raw)
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '');

// ── Fechas en hora de Lima (UTC-5, sin horario de verano) ─────────────────────

/** "2026-10-31T23:59" (hora de Lima) -> ISO UTC. Devuelve null si está vacío o es inválido. */
export const limaLocalToIso = (local: string): string | null => {
  if (!local) return null;
  // "YYYY-MM-DDTHH:mm" (16) -> agrega segundos; "YYYY-MM-DDTHH:mm:ss" (19) se respeta
  const withSeconds = local.length === 16 ? `${local}:00` : local;
  const d = new Date(`${withSeconds}-05:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/** ISO UTC -> "YYYY-MM-DDTHH:mm" en hora de Lima, para <input type="datetime-local">. */
export const isoToLimaLocal = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() - 5 * 3600 * 1000).toISOString().slice(0, 16);
};

// ── Validación de la definición de un cupón (admin) ───────────────────────────

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const optionalPositive = (v: unknown, label: string, errors: Record<string, string>, key: string, integer = false): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = toNumber(v);
  if (!isFiniteNumber(n) || n <= 0 || (integer && !Number.isInteger(n))) {
    errors[key] = `${label} debe ser un ${integer ? 'número entero' : 'monto'} mayor a 0.`;
    return null;
  }
  return round2(n);
};

const optionalDate = (v: unknown, label: string, errors: Record<string, string>, key: string): string | null => {
  if (v === null || v === undefined || v === '') return null;
  const d = new Date(toText(v));
  if (Number.isNaN(d.getTime())) {
    errors[key] = `${label} no es una fecha válida.`;
    return null;
  }
  return d.toISOString();
};

export const validateCouponInput = (
  raw: unknown
): { ok: true; value: CouponInput } | { ok: false; errors: Record<string, string> } => {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const code = normalizeCouponCode(b.code);
  if (code.length < 3 || code.length > 24) errors.code = 'El código debe tener entre 3 y 24 caracteres (letras, números, guion).';

  const name = toText(b.name).trim().slice(0, 80);
  if (!name) errors.name = 'Escribe un nombre para identificar el cupón.';

  const type: CouponType = b.type === 'fixed' ? 'fixed' : 'percent';

  const valueRaw = toNumber(b.value);
  let value = 0;
  if (!isFiniteNumber(valueRaw) || valueRaw <= 0) {
    errors.value = 'El valor del descuento debe ser mayor a 0.';
  } else if (type === 'percent' && valueRaw > 100) {
    errors.value = 'El porcentaje no puede superar 100.';
  } else {
    value = round2(valueRaw);
  }

  const maxDiscountSoles = optionalPositive(b.maxDiscountSoles, 'El tope de descuento', errors, 'maxDiscountSoles');
  const minPurchaseSoles = optionalPositive(b.minPurchaseSoles, 'La compra mínima', errors, 'minPurchaseSoles');
  const usageLimit = optionalPositive(b.usageLimit, 'El límite de usos', errors, 'usageLimit', true);
  const perCustomerLimit = optionalPositive(b.perCustomerLimit, 'El límite por cliente', errors, 'perCustomerLimit', true);

  const startsAt = optionalDate(b.startsAt, 'La fecha de inicio', errors, 'startsAt');
  const expiresAt = optionalDate(b.expiresAt, 'La fecha de vencimiento', errors, 'expiresAt');
  if (startsAt && expiresAt && new Date(expiresAt) <= new Date(startsAt)) {
    errors.expiresAt = 'El vencimiento debe ser posterior al inicio.';
  }

  const appliesTo = (Array.isArray(b.appliesTo) ? b.appliesTo : []).filter((k): k is CouponItemKind =>
    COUPON_ITEM_KINDS.includes(k as CouponItemKind)
  );
  if (appliesTo.length === 0) errors.appliesTo = 'Elige al menos un tipo de producto al que aplica.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      code,
      name,
      campaign: toText(b.campaign).trim().slice(0, 80),
      description: toText(b.description).trim().slice(0, 240),
      type,
      value,
      maxDiscountSoles: type === 'percent' ? maxDiscountSoles : null,
      minPurchaseSoles,
      startsAt,
      expiresAt,
      usageLimit,
      perCustomerLimit,
      appliesTo: Array.from(new Set(appliesTo)),
      active: b.active !== false,
    },
  };
};

// ── Estado y evaluación ───────────────────────────────────────────────────────

export const getCouponStatus = (c: CouponWithStats, now: Date = new Date()): CouponStatus => {
  if (!c.active) return 'paused';
  if (c.expiresAt && now.getTime() > new Date(c.expiresAt).getTime()) return 'expired';
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return 'exhausted';
  if (c.startsAt && now.getTime() < new Date(c.startsAt).getTime()) return 'scheduled';
  return 'active';
};

export const COUPON_STATUS_LABELS: Record<CouponStatus, string> = {
  active: 'Activo',
  scheduled: 'Programado',
  expired: 'Vencido',
  exhausted: 'Agotado',
  paused: 'Pausado',
};

/**
 * Decide si un cupón aplica al carrito y cuánto descuenta.
 * `customerUses`: usos previos de este cliente (null si no se pudo identificar al cliente).
 */
export const evaluateCoupon = (
  c: CouponWithStats,
  items: CouponCartItem[],
  opts: { now?: Date; customerUses?: number | null } = {}
): CouponEvaluation => {
  const now = opts.now ?? new Date();
  const status = getCouponStatus(c, now);

  if (status === 'paused') return { ok: false, reason: 'Este cupón no está disponible.' };
  if (status === 'expired') return { ok: false, reason: 'Este cupón ya venció.' };
  if (status === 'exhausted') return { ok: false, reason: 'Este cupón alcanzó su límite de usos.' };
  if (status === 'scheduled') return { ok: false, reason: 'Este cupón aún no está vigente.' };

  if (c.perCustomerLimit !== null) {
    if (opts.customerUses === null || opts.customerUses === undefined) {
      return { ok: false, reason: 'Para usar este cupón ingresa tu DNI/RUC o inicia sesión.' };
    }
    if (opts.customerUses >= c.perCustomerLimit) {
      return { ok: false, reason: 'Ya usaste este cupón el máximo de veces permitido.' };
    }
  }

  const eligible = round2(
    items
      .filter((i) => c.appliesTo.includes(i.type))
      .reduce((acc, i) => acc + Math.max(0, i.priceSoles) * Math.max(0, i.quantity), 0)
  );

  if (eligible <= 0) {
    return { ok: false, reason: 'Este cupón no aplica a los productos de tu carrito.' };
  }
  if (c.minPurchaseSoles !== null && eligible < c.minPurchaseSoles) {
    return { ok: false, reason: `Compra mínima de S/ ${c.minPurchaseSoles.toFixed(2)} en productos elegibles.` };
  }

  let discount = c.type === 'percent' ? (eligible * c.value) / 100 : c.value;
  if (c.type === 'percent' && c.maxDiscountSoles !== null) discount = Math.min(discount, c.maxDiscountSoles);
  discount = round2(Math.min(discount, eligible));

  if (discount <= 0) return { ok: false, reason: 'Este cupón no genera descuento en tu carrito.' };
  return { ok: true, discountSoles: discount, eligibleSubtotalSoles: eligible };
};

/** Texto corto del beneficio: "10% (tope S/ 50)" / "S/ 30". */
export const describeCouponBenefit = (c: Pick<Coupon, 'type' | 'value' | 'maxDiscountSoles'>): string =>
  c.type === 'percent'
    ? `${c.value}%${c.maxDiscountSoles !== null ? ` (tope S/ ${c.maxDiscountSoles})` : ''}`
    : `S/ ${c.value}`;
