/**
 * Configuración centralizada de API y Endpoints de Nor Celis Automotriz
 * Facilita la conexión futura con el servidor en Hostinger (WordPress REST API o PHP backend).
 */

export const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL as string) || 'https://norcelis.pe/wp-json/norcelis/v1';
export const INTRANET_URL = (import.meta.env?.VITE_INTRANET_URL as string) || 'https://norcelis.pe/intranet';
export const IS_REMOTE_API_ENABLED = import.meta.env?.VITE_ENABLE_REMOTE_API === 'true';
export const DEFAULT_API_TIMEOUT = 8000;

export const API_ENDPOINTS = {
  // --- VEHÍCULOS (0km & Seminuevos) ---
  vehicles: {
    base: '/vehicles',
    byId: (id: string) => `/vehicles/${encodeURIComponent(id)}`,
    byBrand: (brand: string) => `/vehicles?brand=${encodeURIComponent(brand)}`,
    byCondition: (condition: 'nuevo' | 'seminuevo') => `/vehicles?condition=${encodeURIComponent(condition)}`,
    featured: '/vehicles/featured',
  },

  // --- REPUESTOS & AUTOPARTES OEM ---
  parts: {
    base: '/parts',
    bySku: (sku: string) => `/parts/${encodeURIComponent(sku)}`,
    search: '/parts/search',
    categories: '/parts/categories',
    compatibility: (vinOrModel: string) => `/parts/compatibility?q=${encodeURIComponent(vinOrModel)}`,
  },

  // --- AUTENTICACIÓN & CUENTAS ---
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verify: '/auth/verify-session',
    profile: '/auth/profile',
    updateProfile: '/auth/profile/update',
    changePassword: '/auth/password/change',
    logout: '/auth/logout',
  },

  // --- TALLER MECÁNICO & CITAS ---
  workshop: {
    services: '/workshop/services',
    byId: (id: string) => `/workshop/services/${encodeURIComponent(id)}`,
    appointments: '/workshop/appointments',
    availability: '/workshop/availability',
  },

  // --- COTIZACIONES & VENTAS ---
  commercial: {
    createQuote: '/quotes/create',
    getQuote: (code: string) => `/quotes/${encodeURIComponent(code)}`,
    testDriveBooking: '/leads/test-drive',
    tradeInAppraisal: '/leads/trade-in',
  },
} as const;

/**
 * Resuelve la URL absoluta para cualquier endpoint de Hostinger
 */
export function getEndpointUrl(endpoint: string): string {
  const cleanBase = API_BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
}

/**
 * Genera cabeceras HTTP estándar para solicitudes JSON
 */
export function getApiHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}
