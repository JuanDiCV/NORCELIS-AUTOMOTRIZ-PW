// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Análisis estático: escanea el código fuente en busca de patrones peligrosos.
 * Si alguien los reintroduce, estas pruebas fallan antes de llegar a producción.
 */

const root = path.resolve(__dirname, '..', '..');

const walk = (dir: string, exts: RegExp, out: string[] = []): string[] => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', '__tests__', '.claude', '.idea', 'data'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.test(e.name)) out.push(p);
  }
  return out;
};

const rel = (f: string) => path.relative(root, f).replace(/\\/g, '/');
const read = (f: string) => fs.readFileSync(f, 'utf8');

const clientFiles = walk(path.join(root, 'src'), /\.(ts|tsx)$/);
const serverFiles = [...walk(path.join(root, 'server'), /\.ts$/), path.join(root, 'server.ts')];
const allCode = [...clientFiles, ...serverFiles];
const shipped = [...allCode, path.join(root, 'index.html'), path.join(root, 'public', 'service-worker.js'), path.join(root, '.env.example')];

const findAll = (files: string[], re: RegExp): string[] => {
  const hits: string[] = [];
  for (const f of files) {
    const lines = read(f).split('\n');
    lines.forEach((line, i) => {
      if (re.test(line)) hits.push(`${rel(f)}:${i + 1}: ${line.trim().slice(0, 100)}`);
    });
  }
  return hits;
};

describe('análisis estático: inyección de código y HTML', () => {
  it('no hay sumideros de HTML sin escapar (XSS)', () => {
    expect(findAll(clientFiles, /dangerouslySetInnerHTML|\.innerHTML\s*=|\.outerHTML\s*=|insertAdjacentHTML|document\.write\(/)).toEqual([]);
  });

  it('no se evalúa código dinámico en ninguna parte', () => {
    expect(findAll(allCode, /\beval\s*\(|new Function\s*\(|setTimeout\s*\(\s*['"`]|setInterval\s*\(\s*['"`]/)).toEqual([]);
  });

  it('el servidor no ejecuta comandos ni abre rutas controladas por el cliente', () => {
    expect(findAll(serverFiles, /child_process|\bexec(Sync)?\s*\(|\bspawn(Sync)?\s*\(/)).toEqual([]);
    expect(findAll(serverFiles, /readFile(Sync)?\s*\(\s*req\.|sendFile\s*\(\s*req\.|path\.(join|resolve)\([^)]*req\.(params|query|body)/)).toEqual([]);
  });

  it('todo enlace con target="_blank" lleva rel="noopener" (evita secuestro de la pestaña original)', () => {
    const bad: string[] = [];
    for (const f of clientFiles.filter((x) => x.endsWith('.tsx'))) {
      const text = read(f);
      const re = /target=["']_blank["']/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        const start = text.lastIndexOf('<', m.index);
        const end = text.indexOf('>', m.index);
        const tag = text.slice(start, end);
        if (!/rel=(["'{`])[^>]*noopener/.test(tag)) {
          bad.push(`${rel(f)}:${text.slice(0, m.index).split('\n').length}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('todo window.open hacia el exterior usa noopener', () => {
    const bad: string[] = [];
    for (const f of clientFiles) {
      const text = read(f);
      const re = /window\.open\(/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(text))) {
        const call = text.slice(m.index, text.indexOf(')', text.indexOf('\n', m.index) > 0 ? m.index : m.index) + 220);
        const statement = call.split(/;\s*\n|\),\s*\n/)[0];
        if (!/noopener/.test(statement)) bad.push(`${rel(f)}:${text.slice(0, m.index).split('\n').length}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('análisis estático: secretos y datos sensibles', () => {
  it('no hay claves, tokens ni llaves privadas en el código', () => {
    const patterns = /AIza[0-9A-Za-z_-]{30,}|sk_(live|test)_[0-9A-Za-z]{10,}|pk_(live|test)_[0-9A-Za-z]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|ghp_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}/;
    expect(findAll(shipped, patterns)).toEqual([]);
  });

  it('no hay credenciales asignadas como texto literal', () => {
    const hits = findAll(
      [...serverFiles, ...clientFiles.filter((f) => !/data[\\/]/.test(f))],
      /(secret|password|passwd|api[_-]?key|token)\w*\s*[:=]\s*['"`][A-Za-z0-9+/_.-]{20,}['"`]/i
    ).filter((h) => !/placeholder|Ej\.|example|STORAGE_KEY|TOKEN_KEY|_KEY\s*=\s*'norcelis|<pre|:\s*['"`]\/[a-z]/i.test(h));
    expect(hits).toEqual([]);
  });

  it('la clave de administrador y el secreto de firma solo se leen del entorno', () => {
    const hits = findAll(serverFiles, /ADMIN_PASSWORD\s*[:=]\s*['"`]|ADMIN_TOKEN_SECRET\s*[:=]\s*['"`]/);
    expect(hits).toEqual([]);
  });

  it('el token de sesión del panel de cupones vive solo en sessionStorage', () => {
    const uses = findAll(clientFiles, /localStorage[^\n]*(admin_api_token|TOKEN_KEY)|(admin_api_token|TOKEN_KEY)[^\n]*localStorage/);
    expect(uses).toEqual([]);
  });

  it('el código no imprime contraseñas, PIN ni tokens en la consola', () => {
    const hits = findAll(allCode, /console\.(log|info|debug)\([^)]*\b(password|passwd|pin|token|secret|apiKey)\b/i);
    expect(hits).toEqual([]);
  });

  it('el .gitignore protege .env, los datos de clientes y la salida compilada', () => {
    const ignore = read(path.join(root, '.gitignore'));
    expect(ignore).toMatch(/^\.env\*/m);
    expect(ignore).toMatch(/^!\.env\.example/m);
    expect(ignore).toMatch(/^data\//m);
    expect(ignore).toMatch(/^dist\//m);
    expect(ignore).toMatch(/^node_modules\//m);
  });

  it('.env.example no contiene valores reales', () => {
    for (const line of read(path.join(root, '.env.example')).split('\n')) {
      const m = line.match(/^(SMTP_PASS|ADMIN_PASSWORD|PLATE_API_TOKEN|ADMIN_TOKEN_SECRET|GEMINI_API_KEY)\s*=\s*"?([^"\s]*)"?/);
      if (m) expect(['', 'MY_GEMINI_API_KEY'], line).toContain(m[2]);
    }
  });
});

describe('análisis estático: configuración del servidor', () => {
  const server = read(path.join(root, 'server.ts'));

  const code = server.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');

  it('nunca confía en cabeceras de IP enviadas por el cliente', () => {
    expect(code).not.toMatch(/x-forwarded-for|x-real-ip|cf-connecting-ip/i);
    expect(server).toMatch(/app\.set\('trust proxy'/);
    expect(server).toMatch(/keyGenerator:\s*clientKey/);
    expect(server).not.toMatch(/keyGenerator:\s*\(/);
  });

  it('no habilita CORS abierto ni expone el framework', () => {
    expect(server).not.toMatch(/Access-Control-Allow-Origin|from 'cors'|require\('cors'\)|app\.use\(cors/i);
    expect(server).toMatch(/app\.disable\('x-powered-by'\)/);
  });

  it('limita el tamaño del cuerpo y usa manejo de errores genérico', () => {
    expect(server).toMatch(/express\.json\(\{[^}]*limit:\s*'\d+kb'/);
    expect(server).toMatch(/Ocurrió un error inesperado/);
  });

  it('todas las rutas de /api que escriben pasan por un limitador de peticiones', () => {
    const routes = [...server.matchAll(/app\.(post|put|delete)\('(\/api[^']*)'\s*,\s*([^,]+),/g)];
    expect(routes.length).toBeGreaterThanOrEqual(8);
    for (const [, method, route, first] of routes) {
      expect(first, `${method.toUpperCase()} ${route}`).toMatch(/Limiter/);
    }
  });

  it('todas las rutas de administración exigen requireAdmin', () => {
    const adminRoutes = [...server.matchAll(/app\.(get|post|put|delete)\('(\/api\/admin\/(?!login)[^']*)'[^\n]*/g)];
    expect(adminRoutes.length).toBeGreaterThanOrEqual(5);
    for (const [line, , route] of adminRoutes) expect(line, route).toContain('requireAdmin');
  });

  it('la política de contenido de producción no permite scripts en línea ni eval', () => {
    expect(server).toMatch(/isProduction \? "script-src 'self'"/);
    expect(server).toMatch(/Strict-Transport-Security/);
  });

  it('los destinos del servidor son fijos: la consulta de placa no usa URL del cliente', () => {
    const plate = read(path.join(root, 'server', 'plateLookup.ts'));
    expect(plate).toMatch(/process\.env\.PLATE_API_URL/);
    expect(plate).not.toMatch(/\breq\.|body\.url|fetch\(\s*rawPlate/);
    expect(plate).toMatch(/const url = urlTemplate/); // la URL sale de la plantilla del entorno
  });
});

describe('análisis estático: recursos externos y despliegue', () => {
  it('no se cargan scripts ni recursos por HTTP sin cifrar', () => {
    const hits = findAll(
      [...clientFiles, path.join(root, 'index.html')],
      /(src|href)=["']http:\/\/(?!localhost|127\.0\.0\.1)|['"`]http:\/\/(?!localhost|127\.0\.0\.1|www\.w3\.org)[a-z0-9.-]+\./i
    );
    expect(hits).toEqual([]);
  });

  it('index.html no carga scripts de terceros', () => {
    const html = read(path.join(root, 'index.html'));
    const external = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((m) => m[1]);
    expect(external.filter((s) => /^https?:\/\//.test(s))).toEqual([]);
  });

  it('el proyecto no define scripts que se ejecuten al instalar dependencias', () => {
    const pkg = JSON.parse(read(path.join(root, 'package.json')));
    for (const hook of ['preinstall', 'install', 'postinstall', 'prepare']) {
      expect(pkg.scripts?.[hook], hook).toBeUndefined();
    }
  });

  it('el service worker solo abre rutas internas desde una notificación', () => {
    const sw = read(path.join(root, 'public', 'service-worker.js'));
    expect(sw).toMatch(/startsWith\('\/'\)/);
    expect(sw).toMatch(/!requested\.startsWith\('\/\/'\)/);
  });

  it('la construcción de producción no usa un prefijo fijo de GitHub Pages', () => {
    const cfg = read(path.join(root, 'vite.config.ts'));
    expect(cfg).not.toMatch(/base:\s*['"]\/NORCELIS/);
    expect(cfg).toMatch(/VITE_BASE_PATH/);
  });
});
