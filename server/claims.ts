import fs from 'fs';
import path from 'path';

/**
 * Registro del Libro de Reclamaciones virtual (Ley N° 29571, D.S. N° 011-2011-PCM).
 *
 * Cada hoja se guarda como una línea JSON en data/claims.jsonl (fuera de git) con un
 * correlativo único por año, de modo que la empresa conserve el registro y pueda responder.
 * Variable opcional CLAIMS_DATA_DIR para ubicar el archivo fuera del proyecto.
 */

export interface ClaimInput {
  claimType: 'Reclamo' | 'Queja';
  goodType: 'Producto' | 'Servicio';
  consumerName: string;
  docType: string;
  docNumber: string;
  phone: string;
  email: string;
  address: string;
  department: string;
  claimedAmount: string;
  goodDescription: string;
  invoiceNumber: string;
  claimDetail: string;
  concreteRequest: string;
}

export interface ClaimRecord extends ClaimInput {
  code: string;
  year: number;
  registeredAt: string;
}

export interface ClaimReceipt {
  code: string;
  date: string;
  record: ClaimRecord;
}

const MAX_LEN = 2000;
// Sin espacios, comas, punto y coma ni <>"() para impedir múltiples destinatarios o inyección de cabeceras
const EMAIL_RE = /^[^\s@,;<>"()]+@[^\s@,;<>"()]+\.[^\s@,;<>"()]+$/;

const str = (v: unknown, max = MAX_LEN): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Valida y normaliza el cuerpo recibido. Devuelve un mensaje de error o la hoja limpia. */
export const parseClaim = (body: unknown): { error: string } | { claim: ClaimInput } => {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  const claim: ClaimInput = {
    claimType: b.claimType === 'Queja' ? 'Queja' : 'Reclamo',
    goodType: b.goodType === 'Producto' ? 'Producto' : 'Servicio',
    consumerName: str(b.consumerName, 150),
    docType: str(b.docType, 20),
    docNumber: str(b.docNumber, 20),
    phone: str(b.phone, 20),
    email: str(b.email, 150),
    address: str(b.address, 250),
    department: str(b.department, 60),
    claimedAmount: str(b.claimedAmount, 20),
    goodDescription: str(b.goodDescription),
    invoiceNumber: str(b.invoiceNumber, 60),
    claimDetail: str(b.claimDetail),
    concreteRequest: str(b.concreteRequest),
  };

  if (b.acceptedTerms !== true) return { error: 'Debes aceptar la declaración de veracidad de datos.' };
  if (claim.consumerName.length < 3) return { error: 'Ingresa tu nombre completo.' };
  if (claim.docNumber.length < 6) return { error: 'Ingresa un número de documento válido.' };
  if (!EMAIL_RE.test(claim.email)) return { error: 'Ingresa un correo electrónico válido.' };
  if (claim.claimDetail.length < 10) return { error: 'Describe el detalle de tu reclamo o queja.' };

  return { claim };
};

const dataDir = (): string => process.env.CLAIMS_DATA_DIR || path.resolve(process.cwd(), 'data');

/** Guarda la hoja y devuelve el correlativo (NC-REC-2026-000001 / NC-QUE-2026-000001). */
export const saveClaim = (claim: ClaimInput, now: Date = new Date()): ClaimReceipt => {
  const dir = dataDir();
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'claims.jsonl');

  const year = now.getFullYear();
  const prefix = claim.claimType === 'Reclamo' ? 'REC' : 'QUE';
  let sequence = 1;
  if (fs.existsSync(file)) {
    const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
    sequence = lines.filter((l) => l.includes(`"year":${year}`)).length + 1;
  }

  const code = `NC-${prefix}-${year}-${String(sequence).padStart(6, '0')}`;
  const record: ClaimRecord = { code, year, registeredAt: now.toISOString(), ...claim };
  fs.appendFileSync(file, JSON.stringify(record) + '\n', { encoding: 'utf8' });

  return { code, date: now.toISOString(), record };
};

/** Deja constancia de si los correos salieron (para reenviarlos a mano si fallaron). */
export const recordMailStatus = (code: string, mail: { status: string; consumerCopy: boolean; companyNotice: boolean; error?: string }): void => {
  try {
    const dir = dataDir();
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(
      path.join(dir, 'claims-email.jsonl'),
      JSON.stringify({ code, at: new Date().toISOString(), ...mail }) + '\n',
      { encoding: 'utf8' }
    );
  } catch (err) {
    console.error('No se pudo registrar el estado de correo del reclamo:', err);
  }
};

// ── Freno anti-spam por destinatario ──────────────────────────────────────────
// El formulario envía un correo a la dirección que escribe el visitante; sin freno, alguien podría
// usarlo para llenar de correos la bandeja de un tercero. Por correo: 3 hojas cada 24 horas.

const THROTTLE_WINDOW_MS = 24 * 60 * 60 * 1000;
const THROTTLE_MAX_PER_EMAIL = 3;
const THROTTLE_MAX_TOTAL = 300; // tope global diario: protege la reputación del dominio de correo
const emailHits = new Map<string, number[]>();

/** true si se permite registrar otra hoja para este correo (y la cuenta como uso). */
export const allowClaimForEmail = (email: string, now: number = Date.now()): boolean => {
  const key = email.trim().toLowerCase();
  const recent = (emailHits.get(key) ?? []).filter((t) => now - t < THROTTLE_WINDOW_MS);

  let total = 0;
  for (const [k, hits] of emailHits) {
    const alive = hits.filter((t) => now - t < THROTTLE_WINDOW_MS);
    if (alive.length === 0) emailHits.delete(k);
    else total += alive.length;
  }

  if (recent.length >= THROTTLE_MAX_PER_EMAIL || total >= THROTTLE_MAX_TOTAL) {
    emailHits.set(key, recent);
    return false;
  }
  emailHits.set(key, [...recent, now]);
  return true;
};

/** Solo para pruebas. */
export const resetClaimThrottle = (): void => emailHits.clear();
