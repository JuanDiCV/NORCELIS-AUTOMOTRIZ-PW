/**
 * Validación de la entrada del chat con IA (/api/advisor/chat).
 *
 * Todo lo que llega del navegador es no confiable: se limita el tamaño (control de costo del
 * modelo) y el texto que se inserta en las instrucciones del sistema se limpia para dificultar
 * la inyección de instrucciones (prompt injection).
 */

export const MAX_MESSAGES = 30;
export const MAX_MESSAGE_CHARS = 2000;
const MAX_CONTEXT_FIELD = 60;

export interface AdvisorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AdvisorContext {
  activeGarage?: { brand: string; model: string; year: number | string; engine: string; plate: string };
  currentView?: string;
}

// Caracteres de control (0-31, 127) y separadores de línea Unicode (U+2028 / U+2029).
// Se arma con códigos numéricos para que ningún editor o herramienta altere el literal.
const CONTROL_CHARS = new RegExp(
  '[' +
    String.fromCharCode(0) + '-' + String.fromCharCode(31) +
    String.fromCharCode(127) +
    String.fromCharCode(0x2028) + String.fromCharCode(0x2029) +
    ']',
  'g'
);

// Comillas, llaves, corchetes y signos que permiten "salirse" del dato dentro de una instrucción
const BREAKOUT_CHARS = new RegExp('["' + "'" + '`' + String.fromCharCode(92) + '{}<>\\[\\]]', 'g');

/** Deja un texto corto en una sola línea, sin signos que permitan inyectar instrucciones. */
export const cleanContextText = (value: unknown): string =>
  (typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '')
    .replace(CONTROL_CHARS, ' ')
    .replace(BREAKOUT_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CONTEXT_FIELD);

export const sanitizeAdvisorMessages = (raw: unknown): AdvisorMessage[] | null => {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const messages: AdvisorMessage[] = [];
  for (const item of raw.slice(-MAX_MESSAGES)) {
    const m = (item && typeof item === 'object' ? item : null) as { role?: unknown; content?: unknown } | null;
    if (!m || typeof m.content !== 'string') return null;
    const content = m.content.trim().slice(0, MAX_MESSAGE_CHARS);
    if (!content) continue;
    messages.push({ role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user', content });
  }
  return messages.length > 0 ? messages : null;
};

export const sanitizeAdvisorContext = (raw: unknown): AdvisorContext => {
  const c = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out: AdvisorContext = {};

  const g = c.activeGarage && typeof c.activeGarage === 'object' ? (c.activeGarage as Record<string, unknown>) : null;
  if (g) {
    const year = typeof g.year === 'number' ? g.year : typeof g.year === 'string' ? Number(g.year) : NaN;
    out.activeGarage = {
      brand: cleanContextText(g.brand),
      model: cleanContextText(g.model),
      year: Number.isInteger(year) && year > 1950 && year < 2100 ? year : '',
      engine: cleanContextText(g.engine),
      plate: cleanContextText(g.plate),
    };
  }
  if (typeof c.currentView === 'string') out.currentView = cleanContextText(c.currentView);
  return out;
};
