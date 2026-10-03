import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';

import App from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { buildUrlForRoute, type RouteState } from '../utils/urlRouter';

/**
 * Recorrido de pantallas: la aplicación completa se monta en la URL de cada vista.
 * Ninguna debe caerse (pantalla de error) ni quedar en blanco, y ninguna debe escribir errores en consola.
 */

const typesSource = fs.readFileSync(path.resolve(__dirname, '..', 'types', 'index.ts'), 'utf8');
const viewBlock = typesSource.slice(typesSource.indexOf('export type ViewMode'), typesSource.indexOf(';', typesSource.indexOf('export type ViewMode')));
const ALL_VIEWS = [...viewBlock.matchAll(/'([a-z-]+)'/g)].map((m) => m[1]) as RouteState['view'][];

beforeAll(() => {
  // Interfaces del navegador que jsdom no trae
  const noop = () => undefined;
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (q: string) => ({ matches: false, media: q, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop, onchange: null, dispatchEvent: () => false }),
  });
  class Observer { observe = noop; unobserve = noop; disconnect = noop; takeRecords = () => []; }
  vi.stubGlobal('IntersectionObserver', Observer);
  vi.stubGlobal('ResizeObserver', Observer);
  window.scrollTo = noop as unknown as typeof window.scrollTo;
  Element.prototype.scrollIntoView = noop;
  URL.createObjectURL = () => 'blob:test';
  URL.revokeObjectURL = noop;
  HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

let errors: string[] = [];
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  errors = [];
  consoleError = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    errors.push(args.map((a) => (a instanceof Error ? a.message : String(a))).join(' ').slice(0, 300));
  });
  vi.stubGlobal('fetch', async () => ({ ok: false, status: 404, json: async () => ({}) }) as Response);
});

afterEach(() => {
  cleanup();
  consoleError.mockRestore();
  vi.unstubAllGlobals();
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
  window.history.replaceState({}, '', '/');
});

const open = async (url: string) => {
  window.history.replaceState({}, '', url);
  const view = render(<App />);
  await waitFor(() => expect(view.container.querySelector('header, main, footer')).not.toBeNull(), { timeout: 4000 });
  return view;
};

/** Errores de React que sí indican un fallo (se ignoran avisos de red/entorno de jsdom). */
const realErrors = () =>
  errors.filter((e) => !/not implemented|Not implemented|act\(|ResizeObserver|fetch|Failed to load|The above error/i.test(e));

describe('recorrido de pantallas: la aplicación se monta en cada URL', () => {
  it.each(ALL_VIEWS)('la pantalla "%s" se muestra sin caerse', async (v) => {
    const url = buildUrlForRoute({ view: v });
    const { container } = await open(url);

    expect(container.querySelector('[role="alert"]')?.textContent ?? '').not.toContain('Algo salió mal');
    expect(container.textContent!.trim().length).toBeGreaterThan(50); // no queda en blanco
    expect(realErrors(), `errores de React en ${url}`).toEqual([]);
  }, 15_000);

  it('las rutas de detalle con parámetros reales o inexistentes no se caen', async () => {
    for (const url of ['/repuesto/PART-TOY-BRK-01', '/repuesto/SKU-INEXISTENTE', '/vehiculo/veh-rav4-2025', '/vehiculo/no-existe', '/rastreo-pedido?code=NC-2026-0001', '/terminos-politicas?tab=cookies']) {
      const { container } = await open(url);
      expect(container.querySelector('[role="alert"]')?.textContent ?? '', url).not.toContain('Algo salió mal');
      expect(container.textContent!.trim().length, url).toBeGreaterThan(50);
      cleanup();
    }
  }, 30_000);

  it('enlaces maliciosos o mal formados cargan el sitio con normalidad', async () => {
    for (const url of ['/repuesto/%E0%A4%A', '/vehiculo/%', '/repuesto/%00', '/rastreo-pedido?code=%3Cscript%3Ealert(1)%3C/script%3E', '/terminos-politicas?tab=__proto__', '/repuestos?q=%3Cimg%20src=x%20onerror=alert(1)%3E']) {
      const { container } = await open(url);
      expect(container.querySelector('[role="alert"]')?.textContent ?? '', url).not.toContain('Algo salió mal');
      expect(container.textContent!.trim().length, url).toBeGreaterThan(50);
      // el texto malicioso se muestra como texto, nunca como elementos
      expect(container.querySelector('img[onerror], script'), url).toBeNull();
      cleanup();
    }
  }, 30_000);
});

describe('red de seguridad: ErrorBoundary', () => {
  it('muestra un mensaje en vez de una página en blanco cuando una pantalla falla', () => {
    const Boom: React.FC = () => {
      throw new Error('detalle técnico secreto');
    };
    const { getByRole, container } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(getByRole('alert')).toHaveTextContent('Algo salió mal');
    expect(getByRole('button', { name: 'Recargar' })).toBeInTheDocument();
    expect(container.textContent).not.toContain('detalle técnico secreto'); // no se filtran detalles al visitante
  });

  it('no interfiere cuando todo funciona', () => {
    const { container } = render(
      <ErrorBoundary>
        <p>Contenido normal</p>
      </ErrorBoundary>
    );
    expect(container.textContent).toBe('Contenido normal');
  });
});
