/**
 * Document Validation Utilities for Nor Celis Platform
 * Supports Peruvian national documents (DNI, RUC) and International RUT with Modulo 11 check digit.
 */

export type DocumentType = 'DNI' | 'RUC' | 'RUT' | 'CE';

export interface DocumentValidationResult {
  isValid: boolean;
  error: string | null;
  formatted: string;
  helperText?: string;
  expectedDv?: string;
}

/**
 * Calculates and validates Chilean / International RUT using standard Modulo 11 algorithm.
 * Formats: 12.345.678-K or 12345678-K
 */
export function validateRUT(rawRut: string): DocumentValidationResult {
  const clean = rawRut.replace(/[^0-9kK]/g, '').toUpperCase();

  if (!clean) {
    return {
      isValid: false,
      error: 'Ingrese el número de RUT con su dígito verificador',
      formatted: '',
    };
  }

  if (clean.length < 7) {
    return {
      isValid: false,
      error: 'RUT incompleto (mínimo 7 dígitos más dígito verificador)',
      formatted: rawRut,
    };
  }

  if (clean.length > 9) {
    return {
      isValid: false,
      error: 'RUT demasiado largo (máximo 8 dígitos más dígito verificador)',
      formatted: rawRut,
    };
  }

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  // Check that body is all numeric
  if (!/^\d+$/.test(body)) {
    return {
      isValid: false,
      error: 'El cuerpo del RUT debe contener solo números',
      formatted: rawRut,
    };
  }

  // Modulo 11 algorithm
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const calculated = 11 - remainder;

  let expectedDv = '';
  if (calculated === 11) {
    expectedDv = '0';
  } else if (calculated === 10) {
    expectedDv = 'K';
  } else {
    expectedDv = calculated.toString();
  }

  // Format with thousand separators and dash: XX.XXX.XXX-X
  let formattedBody = '';
  const reversed = body.split('').reverse().join('');
  for (let i = 0; i < reversed.length; i++) {
    if (i > 0 && i % 3 === 0) formattedBody += '.';
    formattedBody += reversed[i];
  }
  const formatted = `${formattedBody.split('').reverse().join('')}-${dv}`;

  if (dv !== expectedDv) {
    return {
      isValid: false,
      error: `Dígito verificador inválido: ingresaste "${dv}", se esperaba "${expectedDv}"`,
      formatted,
      expectedDv,
    };
  }

  return {
    isValid: true,
    error: null,
    formatted,
    helperText: `RUT válido verificado por Módulo 11 (DV: ${dv})`,
    expectedDv,
  };
}

/**
 * Validates Peruvian RUC (11 digits, begins with 10, 15, 17, 20) with SUNAT weighted check digit.
 */
export function validateRUC(rawRuc: string): DocumentValidationResult {
  const clean = rawRuc.replace(/\D/g, '');

  if (!clean) {
    return {
      isValid: false,
      error: 'Ingrese el número de RUC de 11 dígitos',
      formatted: '',
    };
  }

  if (clean.length !== 11) {
    return {
      isValid: false,
      error: `El RUC debe tener 11 dígitos (actualmente ${clean.length})`,
      formatted: clean,
    };
  }

  const prefix = clean.substring(0, 2);
  const validPrefixes = ['10', '15', '17', '20'];
  if (!validPrefixes.includes(prefix)) {
    return {
      isValid: false,
      error: `El RUC debe iniciar con 10, 15, 17 o 20 (inicio actual: ${prefix})`,
      formatted: clean,
    };
  }

  // SUNAT Modulo 11 check
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * weights[i];
  }

  const remainder = sum % 11;
  const computed = 11 - remainder;
  let expectedDigit = 0;
  if (computed === 10) {
    expectedDigit = 0;
  } else if (computed === 11) {
    expectedDigit = 1;
  } else {
    expectedDigit = computed;
  }

  const actualDigit = parseInt(clean.charAt(10), 10);

  if (actualDigit !== expectedDigit) {
    return {
      isValid: false,
      error: `RUC inválido según algoritmo SUNAT (dígito final erróneo)`,
      formatted: clean,
    };
  }

  const entityType = prefix === '10' ? 'Persona Natural con Negocio' : prefix === '20' ? 'Persona Jurídica / Empresa' : 'Entidad Especial';

  return {
    isValid: true,
    error: null,
    formatted: clean,
    helperText: `RUC válido (${entityType})`,
  };
}

/**
 * Validates Peruvian DNI (8 numeric digits, avoids trivial sequences).
 */
export function validateDNI(rawDni: string): DocumentValidationResult {
  const clean = rawDni.replace(/\D/g, '');

  if (!clean) {
    return {
      isValid: false,
      error: 'Ingrese su número de DNI de 8 dígitos',
      formatted: '',
    };
  }

  if (clean.length !== 8) {
    return {
      isValid: false,
      error: `El DNI debe tener 8 dígitos (actualmente ${clean.length})`,
      formatted: clean,
    };
  }

  // Check trivial repetitive digits (00000000, 11111111, etc.)
  if (/^(\d)\1{7}$/.test(clean)) {
    return {
      isValid: false,
      error: 'Número de DNI no válido (secuencia repetitiva)',
      formatted: clean,
    };
  }

  return {
    isValid: true,
    error: null,
    formatted: clean,
    helperText: 'DNI peruano válido de 8 dígitos',
  };
}

/**
 * Validates Carné de Extranjería (CE: 8-12 alphanumeric characters).
 */
export function validateCE(rawCe: string): DocumentValidationResult {
  const clean = rawCe.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  if (!clean) {
    return {
      isValid: false,
      error: 'Ingrese su Carné de Extranjería',
      formatted: '',
    };
  }

  if (clean.length < 8 || clean.length > 12) {
    return {
      isValid: false,
      error: `El Carné de Extranjería debe tener entre 8 y 12 caracteres (actualmente ${clean.length})`,
      formatted: clean,
    };
  }

  return {
    isValid: true,
    error: null,
    formatted: clean,
    helperText: 'Carné de Extranjería válido',
  };
}

/**
 * Unified document validator for any supported type.
 */
export function validateDocument(type: DocumentType, value: string): DocumentValidationResult {
  switch (type) {
    case 'RUT':
      return validateRUT(value);
    case 'RUC':
      return validateRUC(value);
    case 'DNI':
      return validateDNI(value);
    case 'CE':
      return validateCE(value);
    default:
      return {
        isValid: Boolean(value.trim()),
        error: value.trim() ? null : 'Documento requerido',
        formatted: value.trim(),
      };
  }
}

/**
 * Real-time input formatter while the user types.
 */
export function formatDocumentInput(type: DocumentType, rawValue: string): string {
  if (type === 'DNI') {
    return rawValue.replace(/\D/g, '').slice(0, 8);
  }

  if (type === 'RUC') {
    return rawValue.replace(/\D/g, '').slice(0, 11);
  }

  if (type === 'CE') {
    return rawValue.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase();
  }

  if (type === 'RUT') {
    // Keep only numbers and K/k
    const clean = rawValue.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
    if (!clean) return '';

    // If 1 character, just return it
    if (clean.length === 1) return clean;

    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);

    // Format body with dots if body >= 4
    let formattedBody = '';
    const reversed = body.split('').reverse().join('');
    for (let i = 0; i < reversed.length; i++) {
      if (i > 0 && i % 3 === 0) formattedBody += '.';
      formattedBody += reversed[i];
    }

    return `${formattedBody.split('').reverse().join('')}-${dv}`;
  }

  return rawValue;
}
