/**
 * Nor Celis — Utilidades de Criptografía Segura
 * Usa la Web Crypto API del navegador (PBKDF2) para derivar hashes de contraseñas.
 * NUNCA almacenar contraseñas en texto plano.
 *
 * Formato de hash: "<salt_hex>:<hash_hex>"
 * donde salt = 16 bytes aleatorios, hash = PBKDF2 SHA-256 con 100,000 iteraciones
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 256; // bits
const HASH_ALGO = 'SHA-256';
const SALT_BYTES = 16;

/**
 * Genera un hash seguro de una contraseña usando PBKDF2.
 * Devuelve una promesa con el string "<salt_hex>:<hash_hex>".
 */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: HASH_ALGO,
    },
    keyMaterial,
    KEY_LENGTH
  );

  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');

  return `${saltHex}:${hashHex}`;
}

/**
 * Verifica si una contraseña en texto plano coincide con un hash almacenado.
 * El hash tiene el formato "<salt_hex>:<hash_hex>".
 * Devuelve false si el formato del hash es inválido (tolerancia a datos legacy).
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) {
      // Hash inválido o formato legacy — falla seguro
      return false;
    }

    const [saltHex, expectedHashHex] = parts;

    // Validar que el salt y hash tienen la longitud esperada (hex)
    if (saltHex.length !== SALT_BYTES * 2 || expectedHashHex.length !== (KEY_LENGTH / 4)) {
      return false;
    }

    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    const enc = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: ITERATIONS,
        hash: HASH_ALGO,
      },
      keyMaterial,
      KEY_LENGTH
    );

    const candidateHex = Array.from(new Uint8Array(derivedBits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Comparación de tiempo constante (mitiga timing attacks)
    return constantTimeEquals(candidateHex, expectedHashHex);
  } catch {
    return false;
  }
}

/**
 * Compara dos strings en tiempo constante para mitigar timing attacks.
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Detecta si un string parece ser una contraseña en texto plano (legacy).
 * Usado para migrar datos anteriores a la versión segura.
 */
export function isLegacyPlaintext(value: string): boolean {
  // Un hash válido tiene formato "saltHex:hashHex" (longitud > 60 chars, contiene ':')
  if (!value || !value.includes(':')) return true;
  const [salt] = value.split(':');
  return salt.length !== SALT_BYTES * 2;
}
