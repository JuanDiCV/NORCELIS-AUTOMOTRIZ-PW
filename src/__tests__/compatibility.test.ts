import { describe, it, expect } from 'vitest';
import { evaluateFit, getSuggestedParts } from '../utils/compatibilityEngine';
import { decodeVin } from '../utils/vinDecoder';
import { isValidPeruvianPlate, normalizePlate, formatPlate } from '../utils/plateUtils';
import { normalizeProviderPayload } from '../../server/plateLookup';
import { PARTS_CATALOG_DATA, getPartBySku } from '../data/partsCatalog';
import type { ActiveGarageVehicle } from '../types';

const hilux = (year: number, engine = '2.8L Turbo Diésel'): ActiveGarageVehicle => ({
  brand: 'Toyota',
  model: `Hilux Revo (${year})`,
  year,
  engine,
  plate: 'ABC-123',
});

describe('placas peruanas', () => {
  it('valida formatos reales y rechaza inválidos', () => {
    expect(isValidPeruvianPlate('ABC-123')).toBe(true);
    expect(isValidPeruvianPlate('abc123')).toBe(true);
    expect(isValidPeruvianPlate('A1B-234')).toBe(true);
    expect(isValidPeruvianPlate('AB-1234')).toBe(true);
    expect(isValidPeruvianPlate('123-456')).toBe(false);
    expect(isValidPeruvianPlate('AB')).toBe(false);
    expect(isValidPeruvianPlate('ABCDEFGH')).toBe(false);
  });

  it('normaliza y formatea', () => {
    expect(normalizePlate(' abc-123 ')).toBe('ABC123');
    expect(formatPlate('abc123')).toBe('ABC-123');
  });
});

describe('decodificador de VIN', () => {
  it('rechaza longitud incorrecta y letras prohibidas', () => {
    expect(decodeVin('12345').valid).toBe(false);
    expect(decodeVin('MR0BA3CD2O2509180').valid).toBe(false);
  });

  it('deduce marca y año modelo', () => {
    const r = decodeVin('MR0BA3CD2P0123456', new Date('2026-06-01'));
    expect(r.valid).toBe(true);
    expect(r.brand).toBe('Toyota');
    expect(r.modelYear).toBe(2023);
  });

  it('valida el dígito verificador (VIN de ejemplo ISO)', () => {
    expect(decodeVin('1M8GDM9AXKP042788').checkDigitOk).toBe(true);
    expect(decodeVin('1M8GDM9A1KP042788').checkDigitOk).toBe(false);
  });
});

describe('proveedor de placa: normalización sin datos del propietario', () => {
  it('mapea campos comunes y descarta propietario', () => {
    const v = normalizeProviderPayload({
      data: { marca: 'TOYOTA', modelo: 'HILUX', anio: '2019', color: 'BLANCO', serie: 'MR0ABC', propietario: 'JUAN PEREZ' },
    });
    expect(v).toEqual({
      brand: 'TOYOTA', model: 'HILUX', year: 2019, color: 'BLANCO', vin: 'MR0ABC', engine: undefined,
    });
    expect(JSON.stringify(v)).not.toContain('PEREZ');
  });

  it('devuelve null si no hay marca ni modelo', () => {
    expect(normalizeProviderPayload({ message: 'not found' })).toBeNull();
  });
});

describe('motor de compatibilidad', () => {
  const brakeFluid = getPartBySku('BRM-DOT4-500')!;

  it('exact: marca, modelo y año dentro del rango', () => {
    expect(evaluateFit(brakeFluid, hilux(2019)).level).toBe('exact');
  });

  it('incompatible: año fuera de rango', () => {
    const r = evaluateFit(brakeFluid, hilux(2012));
    expect(r.level).toBe('incompatible');
    expect(r.reason).toContain('2012');
  });

  it('incompatible: modelo no listado en ficha estructurada', () => {
    const civic: ActiveGarageVehicle = { brand: 'Honda', model: 'Civic (2020)', year: 2020, engine: '1.5L Turbo', plate: 'XYZ-987' };
    expect(evaluateFit(brakeFluid, civic).level).toBe('incompatible');
  });

  it('probable: motor distinto al de la ficha pide confirmación', () => {
    const r = evaluateFit(brakeFluid, hilux(2019, '3.5L V6'));
    expect(r.level).toBe('probable');
  });

  it('un repuesto "universal" nunca se marca como compatible exacto', () => {
    const universal = PARTS_CATALOG_DATA.concat().find(
      (p) => !p.vehicleCompatibility && /universal/i.test(p.compatibleVehicle || '')
    );
    if (universal) expect(evaluateFit(universal, hilux(2019)).level).toBe('universal');
  });

  it('sugerencias: solo exact/probable, ordenadas y sin incompatibles', () => {
    const suggestions = getSuggestedParts(PARTS_CATALOG_DATA, hilux(2019), 10);
    expect(suggestions.length).toBeGreaterThan(0);
    for (const s of suggestions) expect(['exact', 'probable']).toContain(s.fit.level);
    const scores = suggestions.map((s) => s.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });
});

import { VEHICLE_MODELS_BY_BRAND, getModelsForBrand, findCatalogModel } from '../data/vehicleModels';

describe('modelos por marca', () => {
  const FORM_BRANDS = [
    'Toyota', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Mitsubishi', 'Suzuki', 'BMW', 'Audi', 'Mercedes-Benz', 'Volkswagen',
    'Geely', 'Jetour', 'Chery', 'Haval', 'BYD', 'Great Wall (GWM)', 'MG', 'Changan', 'JAC', 'DFSK', 'Baic',
  ];

  it('todas las marcas del formulario tienen modelos', () => {
    for (const b of FORM_BRANDS) expect(getModelsForBrand(b).length, b).toBeGreaterThan(0);
    expect(Object.keys(VEHICLE_MODELS_BY_BRAND).sort()).toEqual([...FORM_BRANDS].sort());
  });

  it('no hay modelos repetidos dentro de una marca', () => {
    for (const [b, models] of Object.entries(VEHICLE_MODELS_BY_BRAND)) {
      expect(new Set(models.map((m) => m.toLowerCase())).size, b).toBe(models.length);
    }
  });

  it('busca modelos sin distinguir mayúsculas', () => {
    expect(findCatalogModel('toyota', 'hilux revo')).toBe('Hilux Revo');
    expect(findCatalogModel('Toyota', 'Modelo inexistente')).toBeUndefined();
  });

  it('un modelo elegido del desplegable se cruza con la ficha de compatibilidad', () => {
    const part = getPartBySku('BRM-DOT4-500')!;
    const picked = findCatalogModel('Toyota', 'Hilux Revo')!;
    const v: ActiveGarageVehicle = { brand: 'Toyota', model: `${picked} (2019)`, year: 2019, engine: '', plate: 'ABC-123' };
    expect(evaluateFit(part, v).level).toBe('exact');
  });
});
