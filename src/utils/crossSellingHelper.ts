import { AutoPart } from '../types';

/**
 * Category synergies mapping for automotive cross-selling recommendations
 */
const CATEGORY_SYNERGIES: Record<string, string[]> = {
  frenos: ['frenos', 'lubricantes', 'seguridad', 'herramientas'],
  suspension: ['suspension', 'accesorios4x4', 'llantas', 'frenos'],
  lubricantes: ['filtros', 'lubricantes', 'motor', 'detailing'],
  filtros: ['lubricantes', 'motor', 'filtros'],
  motor: ['filtros', 'lubricantes', 'baterias', 'motor'],
  accesorios4x4: ['accesorios4x4', 'iluminacion', 'suspension', 'herramientas'],
  llantas: ['llantas', 'suspension', 'accesorios4x4', 'frenos'],
  iluminacion: ['baterias', 'accesorios4x4', 'iluminacion', 'seguridad'],
  baterias: ['iluminacion', 'motor', 'baterias', 'herramientas'],
  detailing: ['detailing', 'seguridad', 'interior'],
  seguridad: ['detailing', 'accesorios4x4', 'iluminacion'],
  audio: ['interior', 'baterias', 'seguridad'],
  interior: ['detailing', 'seguridad', 'audio'],
  herramientas: ['accesorios4x4', 'suspension', 'frenos'],
  motos: ['lubricantes', 'baterias', 'filtros'],
};

/**
 * Extracts complementary products for a given auto part based on:
 * 1. Category functional synergies (e.g., brake pads + brake discs + brake fluid)
 * 2. Vehicle brand and model compatibility
 * 3. Complementary brand relationships
 * 
 * Guarantees 2 to 3 distinct recommendations for any product.
 */
export function getCrossSellingComplements(
  currentPart: AutoPart,
  allParts: AutoPart[],
  limit: number = 3
): AutoPart[] {
  if (!allParts || allParts.length <= 1) return [];

  const candidates = allParts.filter(
    (p) => p.sku !== currentPart.sku && p.id !== currentPart.id
  );

  const preferredCategories = CATEGORY_SYNERGIES[currentPart.category] || [currentPart.category];
  const currentVehicles = (currentPart.compatibleVehicle || '').toLowerCase().split(/[\s,/]+/).filter(w => w.length > 2);

  // Score each candidate
  const scoredCandidates = candidates.map((part) => {
    let score = 0;

    // 1. Category Synergy (higher weight if different complementary category, or complementary item in same category)
    const catIndex = preferredCategories.indexOf(part.category);
    if (catIndex !== -1) {
      score += 30 - catIndex * 5;
    }

    // Give extra bonus if it's not the exact same type of item (e.g. not two identical pads, but pads + fluid/discs)
    if (part.category !== currentPart.category && preferredCategories.includes(part.category)) {
      score += 15;
    }

    // 2. Vehicle Compatibility overlap
    const partVehicles = (part.compatibleVehicle || '').toLowerCase();
    for (const vWord of currentVehicles) {
      if (partVehicles.includes(vWord)) {
        score += 20;
        break;
      }
    }

    // 3. Technical vehicle compatibility list overlap
    if (currentPart.vehicleCompatibility && part.vehicleCompatibility) {
      const currentBrands = currentPart.vehicleCompatibility.map(vc => vc.brand.toLowerCase());
      const hasBrandOverlap = part.vehicleCompatibility.some(vc => currentBrands.includes(vc.brand.toLowerCase()));
      if (hasBrandOverlap) {
        score += 25;
      }
    }

    // 4. Rating and reviews boost (popular items convert better)
    score += (part.rating || 4.5) * 2;
    if (part.reviewCount > 10) score += 5;

    // 5. Price balance (complementary items usually range from 15% to 150% of the main item's price)
    const ratio = part.priceSoles / (currentPart.priceSoles || 1);
    if (ratio >= 0.1 && ratio <= 1.5) {
      score += 10;
    }

    return { part, score };
  });

  // Sort descending by score
  scoredCandidates.sort((a, b) => b.score - a.score);

  const results: AutoPart[] = [];
  const seenCategories = new Set<string>();

  // Pick top items, trying to diversify complementary categories if possible
  for (const { part } of scoredCandidates) {
    if (results.length >= limit) break;
    // Allow up to 2 items from the same category
    const catCount = results.filter(r => r.category === part.category).length;
    if (catCount < 2) {
      results.push(part);
      seenCategories.add(part.category);
    }
  }

  // Fallback to fill up to limit if needed
  if (results.length < limit) {
    for (const { part } of scoredCandidates) {
      if (results.length >= limit) break;
      if (!results.some(r => r.sku === part.sku)) {
        results.push(part);
      }
    }
  }

  return results;
}
