import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';

/**
 * Autenticación de administrador del lado del SERVIDOR.
 *
 * El PIN del panel en el navegador solo oculta pantallas; no protege datos. Las rutas
 * /api/admin/* (cupones) exigen un token firmado que se obtiene con la clave
 * ADMIN_PASSWORD, definida únicamente en el .env del servidor.
 *
 *   ADMIN_PASSWORD      Clave de administración (mínimo 10 caracteres). Sin ella, el panel de cupones queda deshabilitado.
 *   ADMIN_TOKEN_SECRET  (opcional) Secreto para firmar tokens; por defecto se deriva de ADMIN_PASSWORD.
 */

export const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas
export const MIN_PASSWORD_LENGTH = 10;

const sha256 = (s: string): Buffer => crypto.createHash('sha256').update(s).digest();

export const isAdminConfigured = (): boolean => (process.env.ADMIN_PASSWORD ?? '').length >= MIN_PASSWORD_LENGTH;

const signingKey = (): Buffer => sha256(`norcelis-admin|${process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_PASSWORD || ''}`);

/** Comparación en tiempo constante (hash de ambos lados para igualar longitudes). */
export const verifyAdminPassword = (candidate: unknown): boolean => {
  if (!isAdminConfigured() || typeof candidate !== 'string') return false;
  return crypto.timingSafeEqual(sha256(candidate), sha256(process.env.ADMIN_PASSWORD as string));
};

const b64 = (buf: Buffer | string): string => Buffer.from(buf).toString('base64url');

export const issueAdminToken = (now: number = Date.now()): string => {
  const payload = b64(JSON.stringify({ exp: now + TOKEN_TTL_MS, n: crypto.randomBytes(8).toString('hex') }));
  const sig = b64(crypto.createHmac('sha256', signingKey()).update(payload).digest());
  return `${payload}.${sig}`;
};

export const verifyAdminToken = (token: unknown, now: number = Date.now()): boolean => {
  if (!isAdminConfigured() || typeof token !== 'string') return false;
  const [payload, sig, extra] = token.split('.');
  if (!payload || !sig || extra !== undefined) return false;

  const expected = crypto.createHmac('sha256', signingKey()).update(payload).digest();
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    return typeof exp === 'number' && exp > now;
  } catch {
    return false;
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!isAdminConfigured()) {
    res.status(503).json({
      error: `El panel de cupones está deshabilitado: define ADMIN_PASSWORD (mínimo ${MIN_PASSWORD_LENGTH} caracteres) en el .env del servidor.`,
      code: 'admin_not_configured',
    });
    return;
  }
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!verifyAdminToken(token)) {
    res.status(401).json({ error: 'Sesión de administrador inválida o vencida.', code: 'unauthorized' });
    return;
  }
  next();
};
