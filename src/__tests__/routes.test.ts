import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseCurrentUrl, buildUrlForRoute, type RouteState } from '../utils/urlRouter';

/**
 * Rutas de la aplicación: cada pantalla debe tener una URL, cada URL debe abrir su pantalla
 * y ningún enlace (aunque sea malicioso o esté mal formado) puede tumbar la carga del sitio.
 */

const typesSource = fs.readFileSync(path.resolve(__dirname, '..', 'types', 'index.ts'), 'utf8');
const viewBlock = typesSource.slice(typesSource.indexOf('export type ViewMode'), typesSource.indexOf(';', typesSource.indexOf('export type ViewMode')));
const ALL_VIEWS = [...viewBlock.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]);

/** Simula la ubicación del navegador sin pasar por las validaciones de origen de jsdom. */
const at = (pathname: string, search = '', hash = ''): RouteState => {
  vi.stubGlobal('window', { location: { pathname, search, hash } });
  return parseCurrentUrl();
};

afterEach(() => vi.unstubAllGlobals());

describe('rutas: cobertura de pantallas', () => {
  it('se identificaron todas las pantallas del sitio', () => {
    expect(ALL_VIEWS.length).toBeGreaterThanOrEqual(18);
    expect(ALL_VIEWS).toEqual(expect.arrayContaining(['home', 'cars', 'parts', 'cart', 'claims', 'admin', 'terms-policies', 'machinery']));
  });

  it('toda pantalla tiene una URL propia y esa URL vuelve a abrir la misma pantalla', () => {
    const broken: string[] = [];
    for (const view of ALL_VIEWS) {
      const url = buildUrlForRoute({ view: view as RouteState['view'] });
      const [p, q = ''] = url.split('?');
      const parsed = at(p, q ? `?${q}` : '');
      if (parsed.view !== view) broken.push(`${view} → ${url} abre "${parsed.view}"`);
    }
    expect(broken).toEqual([]);
  });

  it('las URLs de cada pantalla son distintas entre sí', () => {
    const urls = ALL_VIEWS.map((v) => buildUrlForRoute({ view: v as RouteState['view'] }).split('?')[0]);
    const dup = urls.filter((u, i) => urls.indexOf(u) !== i && u !== '/');
    expect(dup).toEqual([]);
  });

  it('las rutas con parámetros los conservan (repuesto, vehículo, rastreo, términos, filtros)', () => {
    expect(at('/repuesto/PART-TOY-BRK-01').partSku).toBe('PART-TOY-BRK-01');
    expect(at('/repuesto/AB%20C%2F1').partSku).toBe('AB C/1');
    expect(at('/vehiculo/veh-rav4-2025').vehicleId).toBe('veh-rav4-2025');
    expect(at('/rastreo-pedido', '?code=NC-2026-1234').trackingCode).toBe('NC-2026-1234');
    for (const tab of ['terms', 'sales', 'warranty', 'shipping', 'privacy', 'cookies'] as const) {
      expect(at('/terminos-politicas', `?tab=${tab}`).termsTab).toBe(tab);
    }
    const parts = at('/repuestos', '?cat=frenos&brand=Brembo&q=pastillas');
    expect(parts).toMatchObject({ view: 'parts', category: 'frenos', brand: 'Brembo', search: 'pastillas' });
  });

  it('las ventanas emergentes se abren desde el hash de la URL', () => {
    expect(at('/', '', '#garaje').modal).toBe('garage');
    expect(at('/', '', '#cotizar').modal).toBe('quote');
    expect(at('/', '', '#test-drive').modal).toBe('test-drive');
    expect(at('/', '', '#visor-360').modal).toBe('viewer-360');
    expect(at('/', '', '#documento-pdf').modal).toBe('pdf');
    expect(at('/', '', '#cualquier-cosa').modal).toBeNull();
  });

  it('las rutas heredadas y alias siguen funcionando', () => {
    const aliases: Array<[string, string]> = [
      ['/autopartes', 'parts'], ['/catalogo-repuestos', 'parts'], ['/autos', 'cars'], ['/reclamaciones', 'claims'],
      ['/quienes-somos', 'about'], ['/admin', 'admin'], ['/administrador', 'admin'], ['/tracking', 'order-tracking'],
      ['/seguimiento', 'order-tracking'], ['/terminos', 'terms-policies'], ['/politicas', 'terms-policies'],
    ];
    for (const [url, view] of aliases) expect(at(url).view, url).toBe(view);
  });

  it('una ruta desconocida o en mayúsculas cae de forma segura (inicio o la pantalla correcta)', () => {
    expect(at('/no-existe').view).toBe('home');
    expect(at('/').view).toBe('home');
    expect(at('/CARRITO').view).toBe('cart'); // el router ignora mayúsculas
  });
});

describe('rutas: enlaces maliciosos o mal formados no tumban la carga del sitio', () => {
  const HOSTILE: Array<[string, string, string]> = [
    ['/repuesto/%E0%A4%A', '', ''],           // % mal formado: decodeURIComponent lanza URIError
    ['/repuesto/%', '', ''],
    ['/repuesto/%FF%FE', '', ''],
    ['/vehiculo/%E0%A4%A', '', ''],
    ['/vehiculo/%', '', ''],
    ['/repuesto/%00', '', ''],
    ['/repuesto/', '', ''],
    ['/vehiculo/', '', ''],
    ['/repuesto/' + 'A'.repeat(100_000), '', ''],
    ['/vehiculo/' + '%41'.repeat(30_000), '', ''],
    ['/repuesto/../../etc/passwd', '', ''],
    ['/repuesto/<script>alert(1)</script>', '', ''],
    ['//evil.example', '', ''],
    ['/\\evil.example', '', ''],
    ['/javascript:alert(1)', '', ''],
    ['/rastreo-pedido', '?code=<img src=x onerror=alert(1)>', ''],
    ['/rastreo-pedido', '?code=' + 'A'.repeat(100_000), ''],
    ['/rastreo-pedido', '?code=%E0%A4%A', ''],
    ['/repuestos', '?cat=__proto__&brand=constructor&q=%00', ''],
    ['/repuestos', '?q[]=a&q[]=b&q=c', ''],
    ['/terminos-politicas', '?tab=__proto__', ''],
    ['/terminos-politicas', '?tab[]=terms', ''],
    ['/', '', '#<script>alert(1)</script>'],
    ['/', '', '#' + 'A'.repeat(100_000)],
    ['/', '?', '#'],
    ['', '', ''],
    ['/\u0000', '', ''],
    ['/\ud800', '', ''],
  ];

  it('nunca lanzan excepciones al interpretarse', () => {
    const thrown: string[] = [];
    for (const [p, q, h] of HOSTILE) {
      try {
        at(p, q, h);
      } catch (e) {
        thrown.push(`${p.slice(0, 40)}${q.slice(0, 30)} → ${(e as Error).message}`);
      }
    }
    expect(thrown).toEqual([]);
  });

  it('siempre devuelven una pantalla válida del sitio con campos de texto', () => {
    for (const [p, q, h] of HOSTILE) {
      const r = at(p, q, h);
      expect(ALL_VIEWS, p.slice(0, 40)).toContain(r.view);
      for (const k of ['vehicleId', 'partSku', 'category', 'brand', 'search', 'trackingCode'] as const) {
        const v = r[k];
        expect(v === undefined || typeof v === 'string', `${p.slice(0, 40)} ${k}`).toBe(true);
      }
    }
  });

  it('un valor no permitido en ?tab= nunca llega a la interfaz', () => {
    for (const q of ['?tab=__proto__', '?tab=constructor', '?tab=<script>', '?tab=terms%00', '?tab=']) {
      expect(['terms', 'sales', 'warranty', 'shipping', 'privacy', 'cookies']).toContain(at('/terminos-politicas', q).termsTab);
    }
  });

  it('las URL generadas por la aplicación codifican los datos (no inyectan rutas ni parámetros)', () => {
    const evilSku = '../../admin?x=1&y=<script>#hash';
    const url = buildUrlForRoute({ view: 'part-pdp', partSku: evilSku });
    expect(url).not.toMatch(/[<>#]|\.\.\//);
    expect(url.split('/').length).toBe(3); // "", "repuesto", "<sku codificado>"
    expect(at(url.split('?')[0]).partSku).toBe(evilSku); // y vuelve a leerse idéntico

    const search = buildUrlForRoute({ view: 'parts', search: 'a&b=c#d' });
    expect(new URLSearchParams(search.split('?')[1]).get('q')).toBe('a&b=c#d');
  });
});
