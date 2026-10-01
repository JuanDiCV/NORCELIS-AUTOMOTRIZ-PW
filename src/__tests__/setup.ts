/**
 * Nor Celis Automotriz — Setup de Tests de Seguridad
 * Configura el entorno de pruebas con jsdom y mocks de Web Crypto API.
 */
import '@testing-library/jest-dom';

// Polyfill de Web Crypto API para jsdom (Node.js tiene crypto.subtle en v18+)
import { webcrypto } from 'node:crypto';

if (!globalThis.crypto || !globalThis.crypto.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: false,
  });
}

// Mock de localStorage y sessionStorage para tests aislados
class MockStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: new MockStorage(),
  writable: true,
});

Object.defineProperty(globalThis, 'sessionStorage', {
  value: new MockStorage(),
  writable: true,
});

// Limpiar storage entre tests
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});
