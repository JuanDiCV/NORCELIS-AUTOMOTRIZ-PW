/**
 * Decodificador local de VIN (ISO 3779). No consulta ninguna base externa:
 * valida el formato y deduce marca (WMI) y año modelo (carácter 10) de forma determinista.
 * El dígito verificador solo es obligatorio en Norteamérica, por eso no se exige.
 */

export interface VinDecodeResult {
  valid: boolean;
  error?: string;
  vin: string;
  brand?: string;
  modelYear?: number;
  checkDigitOk?: boolean;
}

// Prefijos WMI (3 caracteres, o 2 si no hay coincidencia exacta) de marcas frecuentes en Perú
const WMI_BRANDS: Record<string, string> = {
  JTM: 'Toyota', JTE: 'Toyota', JTD: 'Toyota', JTF: 'Toyota', JTG: 'Toyota', JTH: 'Lexus', MR0: 'Toyota', MHF: 'Toyota',
  '4T1': 'Toyota', '5TD': 'Toyota', '2T3': 'Toyota', '3TM': 'Toyota', '3TY': 'Toyota', AHT: 'Toyota', '8AJ': 'Toyota',
  JN1: 'Nissan', JN8: 'Nissan', '3N1': 'Nissan', '3N6': 'Nissan', '3N8': 'Nissan', MNT: 'Nissan', VSK: 'Nissan', '1N4': 'Nissan', '5N1': 'Nissan',
  KMH: 'Hyundai', KMF: 'Hyundai', MAL: 'Hyundai', '5NP': 'Hyundai', '5NM': 'Hyundai', TMA: 'Hyundai', NLH: 'Hyundai',
  KNA: 'Kia', KND: 'Kia', KNM: 'Kia', U5Y: 'Kia', '3KP': 'Kia', '5XY': 'Kia',
  MMB: 'Mitsubishi', MMC: 'Mitsubishi', MMT: 'Mitsubishi', JMB: 'Mitsubishi', JA3: 'Mitsubishi', JA4: 'Mitsubishi', '4A3': 'Mitsubishi',
  '1FT': 'Ford', '1FA': 'Ford', '1FM': 'Ford', '3FA': 'Ford', '3FT': 'Ford', MNC: 'Ford', MAJ: 'Ford', AFA: 'Ford', '8AF': 'Ford', WF0: 'Ford',
  LVV: 'Chery', LVT: 'Chery', LGW: 'Great Wall / Haval', LB3: 'Geely', L6T: 'Geely', LSV: 'Volkswagen', LFV: 'Volkswagen',
  LC0: 'BYD', LGX: 'BYD', LGJ: 'Dongfeng', LDC: 'Dongfeng', LJD: 'Kia', LNB: 'BAIC', LS5: 'Changan', LS4: 'Changan', LHG: 'Honda', LVS: 'Ford',
  MRH: 'Honda', JHM: 'Honda', '1HG': 'Honda', '2HG': 'Honda', '19X': 'Honda',
  JM1: 'Mazda', JM3: 'Mazda', '3MZ': 'Mazda', '3MD': 'Mazda', MM7: 'Mazda', MM8: 'Mazda',
  JS3: 'Suzuki', TSM: 'Suzuki', MA3: 'Suzuki', MBH: 'Suzuki', JSA: 'Suzuki',
  MPA: 'Isuzu', MP1: 'Isuzu', JAA: 'Isuzu', JAL: 'Isuzu', '3GN': 'Chevrolet', '1GC': 'Chevrolet', '3G1': 'Chevrolet', KL1: 'Chevrolet', KLA: 'Chevrolet', LSG: 'Chevrolet',
  WBA: 'BMW', WBS: 'BMW', WBY: 'BMW', WAU: 'Audi', WA1: 'Audi', WDB: 'Mercedes-Benz', WDD: 'Mercedes-Benz', W1K: 'Mercedes-Benz', W1N: 'Mercedes-Benz',
  WVW: 'Volkswagen', WVG: 'Volkswagen', '3VW': 'Volkswagen', '9BW': 'Volkswagen', VF1: 'Renault', VF3: 'Peugeot', VF7: 'Citroën',
  SAL: 'Land Rover', SAJ: 'Jaguar', JF1: 'Subaru', JF2: 'Subaru', '4S3': 'Subaru', '4S4': 'Subaru', VNK: 'Toyota',
  '1C4': 'Jeep', '1J4': 'Jeep', '1C6': 'RAM', '3C6': 'RAM', '3C7': 'RAM', MDH: 'Nissan', MHY: 'Suzuki',
};

// Carácter 10 → año modelo (ciclo de 30 años: 1980-2009 / 2010-2039)
const YEAR_CODES = 'ABCDEFGHJKLMNPRSTVWXY123456789';

const TRANSLIT: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export const normalizeVin = (raw: string): string => raw.toUpperCase().replace(/[^A-Z0-9]/g, '');

const hasValidCheckDigit = (vin: string): boolean => {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const c = vin[i];
    const v = /\d/.test(c) ? parseInt(c, 10) : TRANSLIT[c];
    if (v === undefined) return false;
    sum += v * WEIGHTS[i];
  }
  const rem = sum % 11;
  return vin[8] === (rem === 10 ? 'X' : String(rem));
};

export const decodeVin = (raw: string, now: Date = new Date()): VinDecodeResult => {
  const vin = normalizeVin(raw);
  if (vin.length !== 17) {
    return { valid: false, vin, error: 'El VIN / número de chasis debe tener 17 caracteres.' };
  }
  if (/[IOQ]/.test(vin)) {
    return { valid: false, vin, error: 'Un VIN no puede contener las letras I, O ni Q.' };
  }

  const brand = WMI_BRANDS[vin.slice(0, 3)];

  let modelYear: number | undefined;
  const idx = YEAR_CODES.indexOf(vin[9]);
  if (idx >= 0) {
    const maxYear = now.getFullYear() + 1;
    const candidates = [1980 + idx, 2010 + idx].filter((y) => y <= maxYear);
    modelYear = candidates.length ? Math.max(...candidates) : undefined;
  }

  return { valid: true, vin, brand, modelYear, checkDigitOk: hasValidCheckDigit(vin) };
};
