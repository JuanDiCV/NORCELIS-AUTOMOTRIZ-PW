import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { ClaimRecord } from './claims.ts';

/**
 * Envío de correos del Libro de Reclamaciones: copia de la hoja al consumidor y aviso a la empresa.
 *
 * Se configura solo con variables de entorno (ver .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE ("true" para SSL/465), SMTP_USER, SMTP_PASS
 *   MAIL_FROM              Remitente (por defecto SMTP_USER)
 *   CLAIMS_NOTIFY_EMAIL    Quién recibe el aviso interno (por defecto la gerencia)
 *
 * Importante: no importa nada de /src (en producción `node server.ts` no resuelve imports sin extensión).
 * Estos datos de la empresa deben coincidir con src/config/siteConfig.ts (hay una prueba que lo verifica).
 */
export const MAIL_COMPANY = {
  legalName: 'GRUPO MEVAC S.A.C.',
  tradeName: 'NorCelis Automotriz',
  ruc: '20610829318',
  headquarters: 'CAL. LOS ÑANDUES 193, URB. LIMATAMBO, SURQUILLO - LIMA',
  branch: 'Sucursal Cajamarca: CAS. HUACARIZ MZ A LOTE S/N, CAJAMARCA',
  phone: '910 446 152',
  email: 'gerencia@norcelis.com',
} as const;

export type MailStatus = 'sent' | 'partial' | 'failed' | 'not_configured';

export interface MailResult {
  status: MailStatus;
  consumerCopy: boolean;
  companyNotice: boolean;
  error?: string;
}

export interface MailMessage {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const isConfigured = (): boolean =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransport = (): Transporter | null => {
  if (!isConfigured()) return null;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'long', timeStyle: 'short' });

/** Filas de la hoja de reclamación (etiqueta, valor) en el orden del formato oficial. */
const claimRows = (r: ClaimRecord): [string, string][] => [
  ['N° de hoja', r.code],
  ['Fecha y hora de registro', formatDate(r.registeredAt)],
  ['Tipo', r.claimType],
  ['Bien contratado', r.goodType],
  ['Descripción del bien', r.goodDescription || '-'],
  ['Monto reclamado (S/)', r.claimedAmount || '-'],
  ['Comprobante de pago', r.invoiceNumber || '-'],
  ['Consumidor', r.consumerName],
  [r.docType || 'Documento', r.docNumber],
  ['Teléfono', r.phone || '-'],
  ['Correo', r.email],
  ['Domicilio', [r.address, r.department].filter(Boolean).join(', ') || '-'],
  ['Detalle del reclamo o queja', r.claimDetail],
  ['Pedido del consumidor', r.concreteRequest || '-'],
];

const providerBlock = `${MAIL_COMPANY.legalName} (RUC ${MAIL_COMPANY.ruc}) · Nombre comercial: ${MAIL_COMPANY.tradeName}
Domicilio fiscal: ${MAIL_COMPANY.headquarters}
${MAIL_COMPANY.branch}
Contacto: ${MAIL_COMPANY.phone} · ${MAIL_COMPANY.email}`;

const htmlTable = (rows: [string, string][]): string =>
  `<table style="border-collapse:collapse;width:100%;font-size:14px">` +
  rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0;background:#f8fafc;width:36%;font-weight:600;vertical-align:top">${escapeHtml(k)}</td>` +
        `<td style="padding:6px 10px;border:1px solid #e2e8f0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`
    )
    .join('') +
  `</table>`;

const wrapHtml = (title: string, intro: string, rows: [string, string][], footer: string): string =>
  `<div style="font-family:Arial,Helvetica,sans-serif;color:#212955;max-width:640px;margin:auto">` +
  `<h2 style="margin:0 0 8px">${escapeHtml(title)}</h2>` +
  `<p style="font-size:14px;line-height:1.5">${escapeHtml(intro)}</p>` +
  htmlTable(rows) +
  `<p style="font-size:12px;color:#525866;line-height:1.5;white-space:pre-wrap;margin-top:16px">${escapeHtml(footer)}</p></div>`;

/** Construye los dos correos (copia al consumidor y aviso a la empresa). */
export const buildClaimEmails = (record: ClaimRecord): { consumer: MailMessage; company: MailMessage } => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || MAIL_COMPANY.email;
  const notify = process.env.CLAIMS_NOTIFY_EMAIL || MAIL_COMPANY.email;
  const rows = claimRows(record);
  const rowsText = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const kind = record.claimType === 'Reclamo' ? 'Reclamo' : 'Queja';

  const consumerIntro =
    `Hemos registrado tu ${kind.toLowerCase()} en el Libro de Reclamaciones de ${MAIL_COMPANY.tradeName}. ` +
    `Esta es la copia de tu hoja. Te responderemos a este correo dentro del plazo previsto por la ley (Ley N° 29571).`;
  const consumerFooter = `Proveedor\n${providerBlock}`;

  const companyIntro =
    `Nueva hoja de reclamación registrada en la web. Responde al consumidor (el botón Responder escribe a ${record.email}) ` +
    `dentro del plazo legal y conserva el registro.`;

  return {
    consumer: {
      from,
      to: record.email,
      replyTo: MAIL_COMPANY.email,
      subject: `Copia de tu Hoja de Reclamación N° ${record.code} – ${MAIL_COMPANY.tradeName}`,
      text: `${consumerIntro}\n\n${rowsText}\n\nProveedor\n${providerBlock}`,
      html: wrapHtml(`Hoja de Reclamación N° ${record.code}`, consumerIntro, rows, consumerFooter),
    },
    company: {
      from,
      to: notify,
      replyTo: record.email,
      subject: `[Libro de Reclamaciones] ${kind} ${record.code} – ${record.consumerName}`,
      text: `${companyIntro}\n\n${rowsText}`,
      html: wrapHtml(`Nuevo ${kind.toLowerCase()}: ${record.code}`, companyIntro, rows, ''),
    },
  };
};

/**
 * Envía ambos correos. Nunca lanza: el reclamo ya está guardado y un fallo de correo
 * solo se informa en el resultado para que la interfaz sea honesta con el cliente.
 */
export const sendClaimEmails = async (record: ClaimRecord, transport?: Transporter | null): Promise<MailResult> => {
  const tx = transport === undefined ? createTransport() : transport;
  if (!tx) return { status: 'not_configured', consumerCopy: false, companyNotice: false };

  const { consumer, company } = buildClaimEmails(record);
  const [c, n] = await Promise.allSettled([tx.sendMail(consumer), tx.sendMail(company)]);

  const consumerCopy = c.status === 'fulfilled';
  const companyNotice = n.status === 'fulfilled';
  const failure = [c, n].find((r): r is PromiseRejectedResult => r.status === 'rejected');
  if (failure) console.error('Error enviando correo de reclamación:', (failure.reason as Error)?.message ?? failure.reason);

  return {
    status: consumerCopy && companyNotice ? 'sent' : consumerCopy || companyNotice ? 'partial' : 'failed',
    consumerCopy,
    companyNotice,
    error: failure ? String((failure.reason as Error)?.message ?? failure.reason).slice(0, 200) : undefined,
  };
};
