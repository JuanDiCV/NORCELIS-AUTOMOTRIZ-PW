export type PlateLookupStatus = 'verified' | 'not_found' | 'unavailable' | 'invalid';

export interface PlateLookupResponse {
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

/**
 * Verifica una placa contra el Registro Vehicular a través de nuestro servidor
 * (el token del proveedor nunca llega al navegador). Si el servicio falla, devuelve
 * 'unavailable' y el vehículo puede guardarse como no verificado.
 */
export const lookupPlate = async (plate: string): Promise<PlateLookupResponse> => {
  try {
    const res = await fetch('/api/vehicles/lookup-plate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plate }),
    });
    const data = (await res.json()) as PlateLookupResponse;
    if (data && typeof data.status === 'string') return data;
  } catch {
    // red caída o servidor no disponible: se trata como servicio no disponible
  }
  return {
    status: 'unavailable',
    plate,
    message: 'No pudimos contactar el servicio de verificación. Puedes guardar tu vehículo sin verificar.',
  };
};
