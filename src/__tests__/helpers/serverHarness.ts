import { spawn, execSync, type ChildProcess } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Arnés para atacar el servidor real (modo producción) por HTTP.
 * Cada instancia usa su propio puerto, carpeta de datos y contadores de límites.
 */

export interface RawResponse {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: string;
  json: () => any;
}

export interface TestServer {
  port: number;
  dataDir: string;
  /** Petición HTTP "cruda": la ruta se envía tal cual (sin normalizar), útil para recorrido de directorios. */
  raw: (method: string, rawPath: string, opts?: { headers?: Record<string, string>; body?: string | Buffer }) => Promise<RawResponse>;
  /** Atajo para enviar JSON. */
  json: (method: string, rawPath: string, body?: unknown, headers?: Record<string, string>) => Promise<RawResponse>;
  stop: () => Promise<void>;
}

const projectRoot = path.resolve(__dirname, '..', '..', '..');

const freePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address() as net.AddressInfo;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });

/** Compila la web una vez si no existe dist/ (el servidor de producción sirve esa carpeta). */
export const ensureBuilt = (): void => {
  if (fs.existsSync(path.join(projectRoot, 'dist', 'index.html'))) return;
  execSync('npx vite build', { cwd: projectRoot, stdio: 'ignore' });
};

export const startServer = async (extraEnv: Record<string, string> = {}): Promise<TestServer> => {
  ensureBuilt();
  const port = await freePort();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nc-sec-'));

  const child: ChildProcess = spawn(process.execPath, ['server.ts'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(port),
      // Entorno aislado: sin llamadas externas ni correos reales
      GEMINI_API_KEY: '',
      SMTP_HOST: '',
      SMTP_USER: '',
      SMTP_PASS: '',
      PLATE_API_URL: '',
      PLATE_API_TOKEN: '',
      ADMIN_PASSWORD: 'clave-de-prueba-segura-123',
      ADMIN_TOKEN_SECRET: '',
      COUPONS_DATA_DIR: dataDir,
      CLAIMS_DATA_DIR: dataDir,
      TRUST_PROXY: 'false',
      ...extraEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let log = '';
  child.stdout?.on('data', (d) => (log += d));
  child.stderr?.on('data', (d) => (log += d));

  const raw: TestServer['raw'] = (method, rawPath, opts = {}) =>
    new Promise((resolve, reject) => {
      const req = http.request(
        { host: '127.0.0.1', port, method, path: rawPath, headers: opts.headers, setHost: opts.headers?.Host === undefined },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf8');
            resolve({
              status: res.statusCode ?? 0,
              headers: res.headers,
              body,
              json: () => JSON.parse(body),
            });
          });
        }
      );
      req.on('error', reject);
      if (opts.body !== undefined) req.write(opts.body);
      req.end();
    });

  const json: TestServer['json'] = (method, rawPath, body, headers = {}) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    return raw(method, rawPath, {
      headers: { 'Content-Type': 'application/json', ...(payload ? { 'Content-Length': String(Buffer.byteLength(payload)) } : {}), ...headers },
      body: payload,
    });
  };

  // Espera a que responda
  const started = Date.now();
  for (;;) {
    try {
      const r = await raw('GET', '/');
      if (r.status === 200) break;
    } catch {
      // aún arrancando
    }
    if (Date.now() - started > 20_000) {
      child.kill();
      throw new Error('El servidor de pruebas no arrancó:\n' + log);
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  return {
    port,
    dataDir,
    raw,
    json,
    stop: async () => {
      child.kill();
      await new Promise((r) => setTimeout(r, 100));
      fs.rmSync(dataDir, { recursive: true, force: true });
    },
  };
};
