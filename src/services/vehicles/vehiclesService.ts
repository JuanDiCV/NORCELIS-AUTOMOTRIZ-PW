import { Vehicle } from '../../types';
import { VEHICLES_DATA } from '../../data/mockData';
import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../../config/api';

const LOCAL_STORAGE_KEY = 'norcelis_custom_vehicles';

/**
 * Servicio modular de Vehículos de Nor Celis Automotriz.
 * Separa la lógica de negocio para autos nuevos (0km) y seminuevos garantizados,
 * permitiendo una conexión inmediata con la API de Hostinger o base de datos MySQL.
 */
export const vehiclesService = {
  /**
   * Obtiene todos los vehículos disponibles (con fallback inteligente y degradación elegante).
   */
  async getAllVehicles(): Promise<Vehicle[]> {
    if (apiClient.isRemoteEnabled()) {
      const remoteData = await apiClient.get<Vehicle[]>(API_ENDPOINTS.vehicles.base);
      if (remoteData && Array.isArray(remoteData) && remoteData.length > 0) {
        return remoteData;
      }
    }

    // Fallback a almacenamiento local o catálogo precargado
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error cargando vehículos locales:', e);
    }

    return VEHICLES_DATA;
  },

  /**
   * Obtiene un vehículo por su ID
   */
  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    if (apiClient.isRemoteEnabled()) {
      const remote = await apiClient.get<Vehicle>(API_ENDPOINTS.vehicles.byId(id));
      if (remote) return remote;
    }

    const all = await this.getAllVehicles();
    return all.find((v) => v.id === id);
  },

  /**
   * Filtra vehículos por condición (nuevos 0km o seminuevos certificados)
   */
  async getVehiclesByCondition(condition: 'nuevo' | 'seminuevo'): Promise<Vehicle[]> {
    const all = await this.getAllVehicles();
    return all.filter((v) => v.condition === condition);
  },

  /**
   * Filtra vehículos por marca
   */
  async getVehiclesByBrand(brand: string): Promise<Vehicle[]> {
    const all = await this.getAllVehicles();
    if (brand.toLowerCase() === 'todas') return all;
    return all.filter((v) => v.brand.toLowerCase() === brand.toLowerCase());
  },

  /**
   * Búsqueda avanzada con filtros combinados
   */
  async searchVehicles(filters: {
    brand?: string;
    condition?: 'nuevo' | 'seminuevo' | 'todos';
    bodyType?: string;
    maxPriceSoles?: number;
    query?: string;
  }): Promise<Vehicle[]> {
    let list = await this.getAllVehicles();

    if (filters.brand && filters.brand !== 'todos' && filters.brand !== 'todas') {
      list = list.filter((v) => v.brand.toLowerCase() === filters.brand!.toLowerCase());
    }

    if (filters.condition && filters.condition !== 'todos') {
      list = list.filter((v) => v.condition === filters.condition);
    }

    if (filters.bodyType && filters.bodyType !== 'todos') {
      list = list.filter((v) => v.bodyType.toLowerCase() === filters.bodyType!.toLowerCase());
    }

    if (filters.maxPriceSoles && filters.maxPriceSoles > 0) {
      list = list.filter((v) => v.priceSoles <= filters.maxPriceSoles!);
    }

    if (filters.query && filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.brand.toLowerCase().includes(q) ||
          v.subtitle.toLowerCase().includes(q)
      );
    }

    return list;
  },
};
