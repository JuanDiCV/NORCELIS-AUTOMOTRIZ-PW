/**
 * Configuración central de Nor Celis Automotriz
 * Facilita la adaptación completa a la infraestructura de Hostinger y WordPress.
 * 
 * Permite alternar entre datos locales (mock/localStorage) y APIs remotas en Hostinger
 * mediante variables de entorno Vite o modificando los valores directamente aquí.
 */

export interface SiteConfiguration {
  company: {
    legalName: string;
    tradeName: string;
    ruc: string;
    /** Actividad principal inscrita en SUNAT */
    mainActivity: string;
    /** Sede principal (domicilio fiscal) */
    headquarters: { address: string; district: string; city: string; department: string };
    /** Sucursal de atención al público (retiro de pedidos y taller) */
    branch: { name: string; address: string; district: string; city: string; department: string };
    address: string;
    city: string;
    department: string;
    country: string;
    primaryPhone: string;
    secondaryPhone: string;
    whatsappPhone: string;
    whatsappFormatted: string;
    supportEmail: string;
    salesEmail: string;
    businessHours: string;
    saturdayHours: string;
    googleMapsEmbedUrl: string;
  };
  hostinger: {
    /** URL de la intranet de la empresa alojada en Hostinger (subdominio o directorio) */
    intranetUrl: string;
    /** Nombre descriptivo del sistema interno */
    intranetPortalName: string;
    /** Dominio principal en producción */
    primaryDomain: string;
    /** Si la API de WordPress/PHP en Hostinger está activa */
    enableRemoteApi: boolean;
    /** URL base de la REST API (ej: WordPress /wp-json/ o PHP personalizado) */
    apiBaseUrl: string;
    /** Timeout en milisegundos para solicitudes a Hostinger */
    apiTimeoutMs: number;
    /** Prefijo de endpoints */
    endpoints: {
      vehicles: string;
      autoParts: string;
      services: string;
      quotes: string;
      leads: string;
      authVerify: string;
    };
  };
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    linkedin: string;
    youtube: string;
  };
}

import { API_BASE_URL, INTRANET_URL, IS_REMOTE_API_ENABLED, DEFAULT_API_TIMEOUT } from './api';

export const SITE_CONFIG: SiteConfiguration = {
  company: {
    legalName: 'GRUPO MEVAC S.A.C.',
    tradeName: 'NorCelis Automotriz',
    ruc: '20610829318',
    mainActivity: 'Venta de partes, piezas y accesorios para vehículos automotores',
    headquarters: {
      address: 'CAL. LOS ÑANDUES 193, URB. LIMATAMBO',
      district: 'Surquillo',
      city: 'Lima',
      department: 'Lima',
    },
    branch: {
      name: 'Sucursal Cajamarca',
      address: 'CAS. HUACARIZ MZ A LOTE S/N',
      district: 'Cajamarca',
      city: 'Cajamarca',
      department: 'Cajamarca',
    },
    // Dirección de atención al cliente = sucursal Cajamarca
    address: 'CAS. HUACARIZ MZ A LOTE S/N',
    city: 'Cajamarca',
    department: 'Cajamarca',
    country: 'Perú',
    primaryPhone: '910 446 152',
    secondaryPhone: '',
    whatsappPhone: '51910446152',
    whatsappFormatted: '910 446 152',
    supportEmail: 'gerencia@norcelis.com',
    salesEmail: 'gerencia@norcelis.com',
    businessHours: 'Lunes a Viernes: 8:00 AM - 6:30 PM',
    saturdayHours: 'Sábados: 8:00 AM - 1:00 PM',
    googleMapsEmbedUrl: 'https://maps.google.com/?q=Cas.+Huacariz+Mz+A+Lote+S/N,+Cajamarca,+Peru',
  },
  hostinger: {
    // Configuración de la Intranet corporativa en Hostinger
    intranetUrl: INTRANET_URL,
    intranetPortalName: 'Intranet Corporativa Nor Celis',
    primaryDomain: 'https://norcelis.pe',
    
    // Switch para habilitar consumo directo de WordPress REST API o backend PHP en Hostinger
    enableRemoteApi: IS_REMOTE_API_ENABLED,
    apiBaseUrl: API_BASE_URL,
    apiTimeoutMs: DEFAULT_API_TIMEOUT,
    
    endpoints: {
      vehicles: '/vehicles',
      autoParts: '/parts',
      services: '/services',
      quotes: '/quotes',
      leads: '/leads',
      authVerify: '/auth/verify',
    },
  },
  social: {
    facebook: 'https://facebook.com/norcelisautomotriz',
    instagram: 'https://instagram.com/norcelisautomotriz',
    tiktok: 'https://tiktok.com/@norcelispe',
    linkedin: 'https://linkedin.com/company/nor-celis-automotriz',
    youtube: 'https://youtube.com/@norcelisautomotriz',
  },
};
