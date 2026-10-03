import { isValidPeruvianPlate, normalizePlate } from '../src/utils/plateUtils.ts';

/**
 * Consulta de placa vehicular (datos del Registro Vehicular de SUNARP vía proveedor autorizado).
 *
 * SUNARP no ofrece una API pública gratuita para empresas privadas: su portal usa captcha y la
 * integración automatizada se contrata con un proveedor. Este módulo es independiente del proveedor
 * y se configura solo con variables de entorno (ver .env.example):
 *
 *   PLATE_API_URL          URL con {plate} y opcionalmente {token}, ej. https://api.proveedor.pe/v1/placa/{plate}
 *   PLATE_API_TOKEN        Token del proveedor (nunca se envía al navegador)
 *   PLATE_API_AUTH_HEADER  Cabecera de autenticación (por defecto "Authorization"; vacío = no enviar)
 *   PLATE_API_AUTH_SCHEME  Prefijo del token (por defecto "Bearer"; vacío = token solo)
 *
 * Privacidad (Ley N° 29733): por diseño NO se devuelve ni se guarda información del propietario.
 */

export type PlateLookupStatus = 'verified' | 'not_found' | 'unavailable' | 'invalid';

export interface PlateLookupResult {
  status: PlateLookupStatus;
  plate: string;
  message: string;
  vehicle?: {
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    vin?: string;
    engine?: string;
  };
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;
const cache = new Map<string, { at: number; result: PlateLookupResult }>();

const pick = (obj: Record<string, unknown> | undefined, keys: string[]): string | undefined => {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number') return String(v);
  }
  return undefined;
};

const asRecord = (v: unknown): Record<string, unknown> | undefined =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined;

/** Normaliza las distintas formas de respuesta de proveedores a un modelo único (sin propietario). */
export const normalizeProviderPayload = (payload: unknown): PlateLookupResult['vehicle'] | null => {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? asRecord(root?.result) ?? asRecord(root?.vehiculo) ?? root;
  if (!data) return null;

  const brand = pick(data, ['marca', 'brand', 'make']);
  const model = pick(data, ['modelo', 'model']);
  if (!brand && !model) return null;

  const yearRaw = pick(data, ['anio', 'año', 'ano', 'anio_fabricacion', 'year', 'model_year']);
  const year = yearRaw ? parseInt(yearRaw, 10) : undefined;

  return {
    brand,
    model,
    year: year && year > 1950 && year < 2100 ? year : undefined,
    color: pick(data, ['color']),
    vin: pick(data, ['serie', 'vin', 'chasis', 'numero_serie']),
    engine: pick(data, ['motor', 'engine', 'numero_motor']),
  };
};

export const lookupPlate = async (rawPlate: string): Promise<PlateLookupResult> => {
  const plate = normalizePlate(rawPlate);

  if (!isValidPeruvianPlate(plate)) {
    return { status: 'invalid', plate, message: 'El formato de la placa no es válido (ej. ABC-123).' };
  }

  const urlTemplate = process.env.PLATE_API_URL;
  const token = process.env.PLATE_API_TOKEN;
  if (!urlTemplate || !token) {
    return {
      status: 'unavailable',
      plate,
      message: 'La verificación automática con SUNARP no está disponible en este momento.',
    };
  }

  const cached = cache.get(plate);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.result;

  const url = urlTemplate
    .replace('{plate}', encodeURIComponent(plate))
    .replace('{token}', encodeURIComponent(token));

  const headers: Record<string, string> = { Accept: 'application/json' };
  const authHeader = process.env.PLATE_API_AUTH_HEADER ?? 'Authorization';
  const authScheme = process.env.PLATE_API_AUTH_SCHEME ?? 'Bearer';
  if (authHeader) headers[authHeader] = authScheme ? `${authScheme} ${token}` : token;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, { headers, signal: controller.signal });

    if (res.status === 404) {
      const result: PlateLookupResult = {
        status: 'not_found',
        plate,
        message: 'No encontramos esa placa en el Registro Vehicular.',
      };
      cache.set(plate, { at: Date.now(), result });
      return result;
    }
    if (!res.ok) {
      return { status: 'unavailable', plate, message: 'El servicio de verificación no respondió correctamente.' };
    }

    const vehicle = normalizeProviderPayload(await res.json());
    if (!vehicle) {
      const result: PlateLookupResult = {
        status: 'not_found',
        plate,
        message: 'No encontramos datos del vehículo para esa placa.',
      };
      cache.set(plate, { at: Date.now(), result });
      return result;
    }

    const result: PlateLookupResult = {
      status: 'verified',
      plate,
      message: 'Vehículo verificado en el Registro Vehicular.',
      vehicle,
    };
    cache.set(plate, { at: Date.now(), result });
    return result;
  } catch {
    return { status: 'unavailable', plate, message: 'No pudimos contactar el servicio de verificación.' };
  } finally {
    clearTimeout(timer);
  }
};
