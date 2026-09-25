/**
 * Centralized automotive image registry with resilient CDNs and category fallbacks.
 * Designed to eliminate broken image links and make future asset updates trivial.
 */

export const FALLBACK_IMAGES = {
  // Vehicles
  vehicleDefault: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=1200&q=80',
  vehicleSedan: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
  vehicleSuv: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80',
  vehicleTruck: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
  vehicleElectric: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
  interiorCockpit: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80',

  // Spare parts
  partBrakes: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=80',
  partBattery: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
  partSuspension: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
  partTires: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80',
  partLubricants: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=800&q=80',
  partAccessories: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  partDetailing: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80',
  partDefault: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',

  // Services
  serviceWorkshop: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
  serviceDetailing: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80',
};

/**
 * Returns a guaranteed working fallback image URL based on category or type.
 */
export function getFallbackImage(type: 'vehicle' | 'part' | 'service' | string = 'part', categoryHint?: string): string {
  if (type === 'vehicle') {
    if (categoryHint?.toLowerCase().includes('sed')) return FALLBACK_IMAGES.vehicleSedan;
    if (categoryHint?.toLowerCase().includes('pick') || categoryHint?.toLowerCase().includes('truck')) return FALLBACK_IMAGES.vehicleTruck;
    if (categoryHint?.toLowerCase().includes('elec')) return FALLBACK_IMAGES.vehicleElectric;
    return FALLBACK_IMAGES.vehicleSuv;
  }

  if (type === 'service') {
    if (categoryHint?.toLowerCase().includes('estet') || categoryHint?.toLowerCase().includes('detailing')) return FALLBACK_IMAGES.serviceDetailing;
    return FALLBACK_IMAGES.serviceWorkshop;
  }

  // Parts category detection
  const cat = categoryHint?.toLowerCase() || '';
  if (cat.includes('fren') || cat.includes('brak')) return FALLBACK_IMAGES.partBrakes;
  if (cat.includes('bat')) return FALLBACK_IMAGES.partBattery;
  if (cat.includes('susp') || cat.includes('amort')) return FALLBACK_IMAGES.partSuspension;
  if (cat.includes('llant') || cat.includes('tire') || cat.includes('aro')) return FALLBACK_IMAGES.partTires;
  if (cat.includes('lubr') || cat.includes('aceit') || cat.includes('oil')) return FALLBACK_IMAGES.partLubricants;
  if (cat.includes('det') || cat.includes('cera') || cat.includes('wash')) return FALLBACK_IMAGES.partDetailing;
  if (cat.includes('4x4') || cat.includes('acc')) return FALLBACK_IMAGES.partAccessories;

  return FALLBACK_IMAGES.partDefault;
}
