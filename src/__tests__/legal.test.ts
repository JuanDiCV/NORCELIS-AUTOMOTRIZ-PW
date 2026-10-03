import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { SITE_CONFIG } from '../config/siteConfig';
import { parseClaim, saveClaim } from '../../server/claims';

const walk = (dir: string, out: string[] = []): string[] => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '__tests__') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
};

describe('datos legales de la empresa', () => {
  it('la configuración coincide con la información oficial', () => {
    const c = SITE_CONFIG.company;
    expect(c.legalName).toBe('GRUPO MEVAC S.A.C.');
    expect(c.ruc).toBe('20610829318');
    expect(c.tradeName).toBe('NorCelis Automotriz');
    expect(c.branch.address).toContain('HUACARIZ');
    expect(c.headquarters.district).toBe('Surquillo');
    expect(c.whatsappPhone).toBe('51910446152');
  });

  it('el código no contiene datos antiguos de la empresa', () => {
    const banned = ['20541982311', '20608754129', '20601234567', 'Evitamiento Sur 6003', 'EVITAMIENTO SUR 6003', '51987654321', 'Alfredo Mendiola'];
    const hits: string[] = [];
    for (const file of walk(path.resolve(__dirname, '..'))) {
      const text = fs.readFileSync(file, 'utf8');
      for (const b of banned) if (text.includes(b)) hits.push(`${path.basename(file)}: ${b}`);
    }
    expect(hits).toEqual([]);
  });
});

describe('Libro de Reclamaciones', () => {
  const valid = {
    claimType: 'Reclamo', goodType: 'Producto', consumerName: 'Ana Prueba', docType: 'DNI', docNumber: '12345678',
    phone: '900000000', email: 'ana@test.com', address: 'Calle 1', department: 'Cajamarca', claimedAmount: '100',
    goodDescription: 'Pastillas', invoiceNumber: 'B001-1', claimDetail: 'El producto llegó con defecto', concreteRequest: 'Cambio',
    acceptedTerms: true,
  };

  it('rechaza hojas incompletas o sin declaración de veracidad', () => {
    expect('error' in parseClaim({ ...valid, acceptedTerms: false })).toBe(true);
    expect('error' in parseClaim({ ...valid, email: 'malo' })).toBe(true);
    expect('error' in parseClaim({ ...valid, claimDetail: 'corto' })).toBe(true);
    expect('error' in parseClaim(null)).toBe(true);
  });

  it('guarda la hoja con correlativo único por año', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'claims-'));
    process.env.CLAIMS_DATA_DIR = dir;
    try {
      const parsed = parseClaim(valid);
      if ('error' in parsed) throw new Error(parsed.error);
      const now = new Date('2026-10-03T12:00:00Z');
      expect(saveClaim(parsed.claim, now).code).toBe('NC-REC-2026-000001');
      expect(saveClaim(parsed.claim, now).code).toBe('NC-REC-2026-000002');
      expect(saveClaim({ ...parsed.claim, claimType: 'Queja' }, now).code).toBe('NC-QUE-2026-000003');
      expect(saveClaim(parsed.claim, new Date('2027-01-02T12:00:00Z')).code).toBe('NC-REC-2027-000001');
      expect(fs.readFileSync(path.join(dir, 'claims.jsonl'), 'utf8').trim().split('\n')).toHaveLength(4);
    } finally {
      delete process.env.CLAIMS_DATA_DIR;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { buildClaimEmails, sendClaimEmails, escapeHtml, MAIL_COMPANY } from '../../server/mailer';
import type { ClaimRecord } from '../../server/claims';

describe('correo del Libro de Reclamaciones', () => {
  const record: ClaimRecord = {
    code: 'NC-REC-2026-000007', year: 2026, registeredAt: '2026-10-03T17:00:00.000Z',
    claimType: 'Reclamo', goodType: 'Producto', consumerName: 'Ana <script>alert(1)</script>', docType: 'DNI', docNumber: '12345678',
    phone: '900000000', email: 'ana@test.com', address: 'Calle 1', department: 'Cajamarca', claimedAmount: '100',
    goodDescription: 'Pastillas', invoiceNumber: 'B001-1', claimDetail: 'Defecto "de fábrica" & más', concreteRequest: 'Cambio',
  };

  it('los datos de la empresa del correo coinciden con la configuración del sitio', () => {
    expect(MAIL_COMPANY.legalName).toBe(SITE_CONFIG.company.legalName);
    expect(MAIL_COMPANY.ruc).toBe(SITE_CONFIG.company.ruc);
    expect(MAIL_COMPANY.email).toBe(SITE_CONFIG.company.supportEmail);
    expect(MAIL_COMPANY.phone).toBe(SITE_CONFIG.company.primaryPhone);
  });

  it('arma la copia al consumidor y el aviso a la empresa', () => {
    const { consumer, company } = buildClaimEmails(record);
    expect(consumer.to).toBe('ana@test.com');
    expect(consumer.subject).toContain('NC-REC-2026-000007');
    expect(consumer.text).toContain(MAIL_COMPANY.ruc);
    expect(company.to).toBe(MAIL_COMPANY.email);
    expect(company.replyTo).toBe('ana@test.com');
  });

  it('escapa el contenido del cliente en el HTML', () => {
    const { consumer, company } = buildClaimEmails(record);
    for (const m of [consumer, company]) {
      expect(m.html).not.toContain('<script>');
      expect(m.html).toContain('&lt;script&gt;');
      expect(m.html).toContain('&quot;de fábrica&quot; &amp; más');
    }
    expect(escapeHtml(`<a href="x">'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&lt;/a&gt;');
  });

  it('sin SMTP configurado informa not_configured y no falla', async () => {
    for (const k of ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS']) delete process.env[k];
    expect(await sendClaimEmails(record)).toEqual({ status: 'not_configured', consumerCopy: false, companyNotice: false });
  });

  it('envía ambos correos con un transporte válido', async () => {
    const tx = nodemailer.createTransport({ jsonTransport: true });
    const r = await sendClaimEmails(record, tx);
    expect(r).toMatchObject({ status: 'sent', consumerCopy: true, companyNotice: true });
  });

  it('informa fallo parcial si solo uno de los correos sale', async () => {
    const calls: string[] = [];
    const tx = {
      sendMail: async (m: { to: string }) => {
        calls.push(m.to);
        if (m.to === 'ana@test.com') throw new Error('buzón rechazado');
        return {};
      },
    } as unknown as Transporter;
    const r = await sendClaimEmails(record, tx);
    expect(calls).toHaveLength(2);
    expect(r).toMatchObject({ status: 'partial', consumerCopy: false, companyNotice: true });
    expect(r.error).toContain('buzón rechazado');
  });

  it('no acepta correos con varios destinatarios', () => {
    const base = {
      claimType: 'Reclamo', goodType: 'Producto', consumerName: 'Ana Prueba', docType: 'DNI', docNumber: '12345678',
      claimDetail: 'Detalle suficiente del problema', acceptedTerms: true,
    };
    expect('error' in parseClaim({ ...base, email: 'a@b.com,evil@x.com' })).toBe(true);
    expect('error' in parseClaim({ ...base, email: 'a@b.com;evil@x.com' })).toBe(true);
    expect('error' in parseClaim({ ...base, email: 'Ana <a@b.com>' })).toBe(true);
    expect('error' in parseClaim({ ...base, email: 'ana@test.com' })).toBe(false);
  });
});
