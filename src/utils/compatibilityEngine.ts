import type { ActiveGarageVehicle, AutoPart, VehicleCompatibilityEntry } from '../types';

/**
 * Motor de compatibilidad repuesto ↔ vehículo.
 *
 * Niveles (de mayor a menor certeza):
 *  - exact:        marca + modelo + año dentro del rango de una ficha de compatibilidad estructurada
 *  - probable:     el catálogo menciona marca/modelo (o el motor no coincide claramente): confirmar con asesor
 *  - universal:    pieza de uso general (no depende del modelo)
 *  - unknown:      el catálogo no dice para qué vehículos es
 *  - incompatible: el catálogo indica otros vehículos o el año queda fuera de rango
 */
export type FitLevel = 'exact' | 'probable' | 'universal' | 'unknown' | 'incompatible';

export interface FitResult {
  level: FitLevel;
  reason: string;
}

const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const compact = (s: string): string => norm(s).replace(/[^a-z0-9]/g, '');

/** "RAV4 Hybrid (2025)" -> "RAV4 Hybrid" */
const cleanModel = (model: string): string => model.replace(/\s*\(\d{4}\)\s*$/, '').trim();

/** Primer término distintivo del modelo (hilux, rav4, frontier, tiggo...). */
const primaryModelToken = (brand: string, model: string): string => {
  const brandTokens = norm(brand).split(' ');
  const tokens = norm(cleanModel(model))
    .split(/[ /]+/)
    .filter((t) => t && !brandTokens.includes(t));
  return tokens[0] ?? '';
};

const brandMatches = (a: string, b: string): boolean => {
  const x = compact(a);
  const y = compact(b);
  return !!x && !!y && (x.includes(y) || y.includes(x));
};

const parseYearRange = (text: string): [number, number] | null => {
  const m = text.match(/(\d{4})\s*(?:-|–|a|al|hasta)\s*(\d{4})/i);
  if (m) return [parseInt(m[1], 10), parseInt(m[2], 10)];
  const single = text.match(/\b((?:19|20)\d{2})\b/);
  return single ? [parseInt(single[1], 10), parseInt(single[1], 10)] : null;
};

const displacements = (text: string): string[] =>
  Array.from(text.matchAll(/(\d\.\d)\s*l?\b/gi)).map((m) => m[1]);

const entryMatchesModel = (entry: VehicleCompatibilityEntry, brand: string, model: string): boolean => {
  if (!brandMatches(entry.brand, brand)) return false;
  const token = primaryModelToken(brand, model);
  if (!token) return true;
  return compact(entry.model).includes(compact(token));
};

export const evaluateFit = (part: AutoPart, vehicle: ActiveGarageVehicle): FitResult => {
  const label = `${vehicle.brand} ${cleanModel(vehicle.model)}`;
  const text = part.compatibleVehicle || '';
  const isUniversalText = /universal|todo tipo|todas las marcas/i.test(text);

  // 1) Ficha estructurada: la fuente más confiable
  if (part.vehicleCompatibility && part.vehicleCompatibility.length > 0) {
    const modelMatches = part.vehicleCompatibility.filter((e) => entryMatchesModel(e, vehicle.brand, vehicle.model));

    if (modelMatches.length === 0) {
      // La lista estructurada es la fuente autoritativa, aunque el texto diga "Universal: ..."
      return { level: 'incompatible', reason: `No figura en la lista de compatibilidad de ${label}.` };
    }

    const inRange = modelMatches.filter((e) => {
      const range = parseYearRange(e.years);
      return !range || (vehicle.year >= range[0] && vehicle.year <= range[1]);
    });

    if (inRange.length === 0) {
      return { level: 'incompatible', reason: `Compatible con ${label}, pero no para el año ${vehicle.year}.` };
    }

    const vehicleDisp = displacements(vehicle.engine || '');
    const engineKnown = vehicleDisp.length > 0;
    const engineOk = inRange.some((e) => {
      const d = displacements(e.engine);
      return d.length === 0 || vehicleDisp.some((v) => d.includes(v));
    });

    if (engineKnown && !engineOk) {
      return { level: 'probable', reason: `Calza con ${label} ${vehicle.year}; confirma que tu motor sea compatible.` };
    }
    const years = inRange[0].years;
    return { level: 'exact', reason: `Compatible con ${label} (${years}).` };
  }

  // 2) Sin ficha: texto libre del catálogo
  if (isUniversalText && !brandMatches(text, vehicle.brand)) {
    return { level: 'universal', reason: 'Pieza de uso universal.' };
  }

  const token = primaryModelToken(vehicle.brand, vehicle.model);
  const normText = compact(text);
  const mentionsModel = !!token && normText.includes(compact(token));
  const mentionsBrand = brandMatches(text, vehicle.brand);

  if (mentionsModel || mentionsBrand) {
    const range = parseYearRange(text);
    if (range && (vehicle.year < range[0] || vehicle.year > range[1])) {
      return { level: 'incompatible', reason: `Indicado para ${range[0]}–${range[1]}, tu vehículo es ${vehicle.year}.` };
    }
    return {
      level: 'probable',
      reason: mentionsModel
        ? `El catálogo la recomienda para ${label}. Confirma versión y año con un asesor.`
        : `El catálogo la menciona para ${vehicle.brand}. Confirma el modelo con un asesor.`,
    };
  }

  if (isUniversalText) return { level: 'universal', reason: 'Pieza de uso universal.' };

  // Menciona otras marcas explícitas → incompatible; si no, desconocido
  const KNOWN_BRANDS = ['toyota', 'nissan', 'hyundai', 'kia', 'ford', 'mitsubishi', 'chery', 'haval', 'geely', 'byd', 'bmw', 'audi', 'mazda', 'suzuki', 'chevrolet', 'honda', 'changan', 'jetour'];
  const otherBrands = KNOWN_BRANDS.filter((b) => !brandMatches(b, vehicle.brand) && normText.includes(b));
  if (otherBrands.length > 0) {
    return { level: 'incompatible', reason: `Indicada para otras marcas (${otherBrands.join(', ')}).` };
  }

  return { level: 'unknown', reason: 'El catálogo no especifica vehículos. Consulta con un asesor.' };
};

export const FIT_LABELS: Record<FitLevel, string> = {
  exact: 'Compatible con tu vehículo',
  probable: 'Probablemente compatible',
  universal: 'Uso universal',
  unknown: 'Verifica compatibilidad',
  incompatible: 'No compatible',
};

// ── Sugerencias ───────────────────────────────────────────────────────────────

const FIT_SCORE: Record<FitLevel, number> = { exact: 100, probable: 60, universal: 25, unknown: 0, incompatible: -1000 };

/** Categorías de mantenimiento que más se necesitan según la edad del vehículo. */
const maintenanceBoost = (category: string, age: number): number => {
  const c = category.toLowerCase();
  if (age >= 3 && (c === 'filtros' || c === 'lubricantes')) return 20;
  if (age >= 4 && (c === 'frenos' || c === 'baterias')) return 18;
  if (age >= 7 && (c === 'suspension' || c === 'motor')) return 16;
  if (age <= 2 && (c === 'seguridad' || c === 'detailing' || c === 'accesorios4x4')) return 10;
  return 0;
};

export interface PartSuggestion {
  part: AutoPart;
  fit: FitResult;
  score: number;
}

export const getSuggestedParts = (
  parts: AutoPart[],
  vehicle: ActiveGarageVehicle,
  limit = 8,
  now: Date = new Date()
): PartSuggestion[] => {
  const age = Math.max(0, now.getFullYear() - (vehicle.year || now.getFullYear()));

  return parts
    .map((part) => {
      const fit = evaluateFit(part, vehicle);
      const score = FIT_SCORE[fit.level] + maintenanceBoost(part.category, age) + (part.rating || 0);
      return { part, fit, score };
    })
    // Solo se sugieren piezas con vínculo real con el vehículo (no "universal" sueltas ni desconocidas)
    .filter((s) => s.fit.level === 'exact' || s.fit.level === 'probable')
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// ── Resumen para carrito y favoritos ──────────────────────────────────────────

export interface FitSummary {
  total: number;
  confirmed: number;
  incompatible: AutoPart[];
  needsCheck: AutoPart[];
}

export const summarizeFit = (parts: AutoPart[], vehicle: ActiveGarageVehicle): FitSummary => {
  const summary: FitSummary = { total: parts.length, confirmed: 0, incompatible: [], needsCheck: [] };
  for (const part of parts) {
    const { level } = evaluateFit(part, vehicle);
    if (level === 'exact' || level === 'universal') summary.confirmed++;
    else if (level === 'incompatible') summary.incompatible.push(part);
    else summary.needsCheck.push(part);
  }
  return summary;
};
