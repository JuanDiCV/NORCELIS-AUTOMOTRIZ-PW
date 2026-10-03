/**
 * Utilidades de placas vehiculares peruanas.
 * Formatos vigentes: autos "ABC-123" / "A1B-234" (6 caracteres alfanuméricos),
 * motos y otros "AB-1234". Se normaliza a mayúsculas sin espacios.
 */

export const normalizePlate = (raw: string): string =>
  raw.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Formatea para mostrar: ABC123 -> ABC-123 */
export const formatPlate = (raw: string): string => {
  const p = normalizePlate(raw);
  if (p.length === 6) return `${p.slice(0, 3)}-${p.slice(3)}`;
  return p;
};

/** Valida el formato (no la existencia en SUNARP). */
export const isValidPeruvianPlate = (raw: string): boolean => {
  const p = normalizePlate(raw);
  // Autos/camionetas: 3 + 3 alfanuméricos con al menos una letra y un dígito
  if (/^[A-Z0-9]{3}[0-9]{3}$/.test(p) && /[A-Z]/.test(p.slice(0, 3))) return true;
  // Variante con letra/dígito mezclado (ej. A1B-234)
  if (/^[A-Z][0-9][A-Z][0-9]{3}$/.test(p)) return true;
  // Motos y otros: 2 letras + 4 dígitos
  if (/^[A-Z]{2}[0-9]{4}$/.test(p)) return true;
  return false;
};
