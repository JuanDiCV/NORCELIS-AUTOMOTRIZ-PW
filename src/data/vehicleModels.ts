/**
 * Modelos y versiones frecuentes en el mercado peruano, agrupados por marca.
 * El primer término de cada modelo es la familia (Hilux, RAV4, Tiggo...), que es
 * lo que usa el motor de compatibilidad para cruzar con las fichas de repuestos.
 * Si un vehículo no aparece, el formulario permite escribirlo manualmente.
 */
export const VEHICLE_MODELS_BY_BRAND: Record<string, string[]> = {
  Toyota: [
    'Hilux Revo', 'Hilux Rocco', 'Hilux SR / SRV', 'RAV4', 'RAV4 Hybrid', 'Corolla Cross', 'Corolla', 'Yaris', 'Yaris Cross',
    'Fortuner', 'Land Cruiser Prado', 'Land Cruiser 300', 'Land Cruiser 70', 'Rush', 'Raize', 'Avanza', 'Camry', 'Innova', 'Hiace',
  ],
  Nissan: [
    'Frontier', 'Frontier Pro-4X', 'Navara', 'Kicks', 'Qashqai', 'X-Trail', 'Versa', 'Sentra', 'March', 'Murano', 'Pathfinder', 'Note',
  ],
  Hyundai: [
    'Tucson', 'Creta', 'Santa Fe', 'Accent', 'Elantra', 'Grand i10', 'i10', 'Venue', 'Kona', 'Palisade', 'Staria', 'H1', 'HR',
  ],
  Kia: [
    'Sportage', 'Seltos', 'Sorento', 'Picanto', 'Rio', 'Cerato', 'Soluto', 'Carnival', 'Stonic', 'Sonet', 'K2700',
  ],
  Ford: [
    'Ranger', 'Ranger Raptor', 'Ranger Wildtrak', 'Territory', 'Escape', 'Explorer', 'Everest', 'Bronco Sport', 'F-150', 'Transit', 'EcoSport', 'Maverick',
  ],
  Mitsubishi: [
    'L200 Triton', 'Montero Sport', 'ASX', 'Outlander', 'Eclipse Cross', 'Xpander', 'Mirage', 'Colt', 'Canter',
  ],
  Suzuki: [
    'Swift', 'Vitara', 'Grand Vitara', 'Jimny', 'S-Presso', 'Baleno', 'Ertiga', 'Dzire', 'Ciaz', 'APV', 'Carry',
  ],
  BMW: ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5', 'X6', 'iX3'],
  Audi: ['A1', 'A3', 'A4', 'A6', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8'],
  'Mercedes-Benz': ['Clase A', 'Clase C', 'Clase E', 'GLA', 'GLB', 'GLC', 'GLE', 'Sprinter'],
  Volkswagen: ['Tiguan', 'T-Cross', 'Taos', 'Amarok', 'Gol', 'Polo', 'Virtus', 'Jetta', 'Saveiro', 'Crafter'],
  Geely: ['Coolray', 'Azkarra', 'Emgrand', 'Okavango', 'Monjaro', 'Geometry C'],
  Jetour: ['X70', 'X70 Plus', 'X90 Plus', 'Dashing', 'T2'],
  Chery: ['Tiggo 2 Pro', 'Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Tiggo 8 Pro Max', 'Arrizo 5', 'Arrizo 6 Pro', 'Omoda 5'],
  Haval: ['Jolion', 'H6', 'Dargo', 'H9', 'Poer'],
  BYD: ['Song Plus', 'Song Pro', 'Tang', 'Yuan Plus', 'Dolphin', 'Seal', 'Han', 'F3', 'Atto 3'],
  'Great Wall (GWM)': ['Poer', 'Wingle 5', 'Wingle 7', 'Haval H6', 'Tank 300', 'Ora 03'],
  MG: ['ZS', 'MG3', 'MG5', 'HS', 'RX5', 'GT', 'MG4', 'One'],
  Changan: ['CS15', 'CS35 Plus', 'CS55 Plus', 'CS75 Plus', 'Hunter', 'Alsvin', 'UNI-T', 'UNI-K', 'Van'],
  JAC: ['JS2', 'JS3', 'JS4', 'JS6', 'T6', 'T8', 'Refine', 'X200'],
  DFSK: ['Glory 500', 'Glory 580', 'Glory i-Auto', 'C31', 'K01', 'K07'],
  Baic: ['X25', 'X35', 'X55', 'X7', 'BJ40', 'D20', 'Foton'],
};

/** Modelos de una marca (búsqueda sin distinguir mayúsculas). */
export const getModelsForBrand = (brand: string): string[] => {
  const key = Object.keys(VEHICLE_MODELS_BY_BRAND).find((b) => b.toLowerCase() === brand.toLowerCase());
  return key ? VEHICLE_MODELS_BY_BRAND[key] : [];
};

/** Devuelve el modelo del catálogo que coincide (sin distinguir mayúsculas) o undefined. */
export const findCatalogModel = (brand: string, model: string): string | undefined =>
  getModelsForBrand(brand).find((m) => m.toLowerCase() === model.trim().toLowerCase());
