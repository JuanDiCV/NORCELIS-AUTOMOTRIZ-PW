import { AutoPart } from '../../types';
import { AUTO_PARTS_DATA } from '../../data/mockData';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../../config/api';

const LOCAL_STORAGE_KEY = 'norcelis_custom_parts';

/**
 * Servicio modular de Repuestos, Autopartes OEM y Accesorios 4x4.
 * Separa la lógica de negocio del catálogo de repuestos y validación de compatibilidad.
 */
export const partsService = {
  /**
   * Obtiene todo el catálogo de repuestos
   */
  async getAllParts(): Promise<AutoPart[]> {
    if (apiClient.isRemoteEnabled()) {
      const remoteData = await apiClient.get<AutoPart[]>(API_ENDPOINTS.parts.base);
      if (remoteData && Array.isArray(remoteData) && remoteData.length > 0) {
        return remoteData;
      }
    }

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error cargando repuestos locales:', e);
    }

    return AUTO_PARTS_DATA;
  },

  /**
   * Obtiene repuesto por SKU o ID
   */
  async getPartBySku(skuOrId: string): Promise<AutoPart | undefined> {
    if (apiClient.isRemoteEnabled()) {
      const remote = await apiClient.get<AutoPart>(API_ENDPOINTS.parts.bySku(skuOrId));
      if (remote) return remote;
    }

    const all = await this.getAllParts();
    return all.find((p) => p.sku === skuOrId || p.id === skuOrId);
  },

  /**
   * Filtra por categoría, marca y búsqueda textual
   */
  async filterParts(category?: string, brand?: string, query?: string): Promise<AutoPart[]> {
    let list = await this.getAllParts();

    if (category && category !== 'todos') {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (brand && brand !== 'todos') {
      list = list.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (query && query.trim() !== '') {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.compatibleVehicle && p.compatibleVehicle.toLowerCase().includes(q))
      );
    }

    return list;
  },

  /**
   * Valida compatibilidad con un modelo de vehículo
   */
  isCompatibleWithVehicle(part: AutoPart, vehicleBrand: string, vehicleModel: string): boolean {
    if (!part.compatibleVehicle) return true;
    const cleanComp = part.compatibleVehicle.toLowerCase();
    return cleanComp.includes(vehicleBrand.toLowerCase()) || cleanComp.includes(vehicleModel.toLowerCase());
  },
};
