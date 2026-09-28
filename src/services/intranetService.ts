import { SITE_CONFIG } from '../config/siteConfig';

/**
 * Servicio de conexión con la Intranet corporativa alojada en Hostinger.
 * Permite a los colaboradores autorizados acceder directamente al sistema interno de Nor Celis.
 */
export const intranetService = {
  /**
   * Obtiene la URL completa del portal de intranet configurada para Hostinger.
   */
  getIntranetUrl(): string {
    return SITE_CONFIG.hostinger.intranetUrl;
  },

  /**
   * Nombre o etiqueta del portal interno.
   */
  getIntranetName(): string {
    return SITE_CONFIG.hostinger.intranetPortalName;
  },

  /**
   * Redirecciona de forma segura a la intranet en Hostinger.
   * Por defecto abre en una nueva pestaña para no interrumpir la navegación del cliente.
   */
  redirectToHostingerIntranet(target: '_blank' | '_self' = '_blank'): void {
    const url = this.getIntranetUrl();
    if (typeof window !== 'undefined') {
      window.open(url, target, 'noopener,noreferrer');
    }
  },
};
