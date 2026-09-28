import { WorkshopService } from '../../types';
import { WORKSHOP_SERVICES_DATA } from '../../data/mockData';
import { SITE_CONFIG } from '../../config/siteConfig';

/**
 * Servicio modular de Taller Mecánico, Mantenimientos y Detailing Nor Celis.
 */
export const workshopService = {
  /**
   * Obtiene todos los servicios de taller disponibles
   */
  getServices(): WorkshopService[] {
    return WORKSHOP_SERVICES_DATA;
  },

  /**
   * Obtiene servicio por ID
   */
  getServiceById(id: string): WorkshopService | undefined {
    return WORKSHOP_SERVICES_DATA.find((s) => s.id === id);
  },

  /**
   * Genera el enlace oficial de WhatsApp para agendar una cita de taller con Nor Celis Cajamarca
   */
  buildAppointmentWhatsAppUrl(params: {
    serviceName: string;
    vehiclePlate?: string;
    vehicleModel?: string;
    preferredDate?: string;
    customerName?: string;
  }): string {
    const lines = [
      `¡Hola Nor Celis Taller Cajamarca!`,
      `Deseo agendar una cita para mi vehículo:`,
      `🔧 *Servicio:* ${params.serviceName}`,
      params.vehicleModel ? `🚗 *Vehículo:* ${params.vehicleModel}` : null,
      params.vehiclePlate ? `📋 *Placa:* ${params.vehiclePlate}` : null,
      params.preferredDate ? `📅 *Fecha Sugerida:* ${params.preferredDate}` : null,
      params.customerName ? `👤 *Cliente:* ${params.customerName}` : null,
      `📍 *Sede:* ${SITE_CONFIG.company.address}`,
    ].filter(Boolean);

    const message = encodeURIComponent(lines.join('\n'));
    return `https://wa.me/${SITE_CONFIG.company.whatsappPhone}?text=${message}`;
  },
};
