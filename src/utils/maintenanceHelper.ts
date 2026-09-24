import { BrandServiceConfig, MaintenanceRecord, NextMaintenanceForecast } from '../types';

/**
 * Frecuencias oficiales de mantenimiento preventivo por marca automotriz.
 * En Perú, los estándares de concesionario oficial siguen la regla:
 * "Cada X kilómetros o cada Y meses, lo que ocurra primero".
 */
export const BRAND_SERVICE_CONFIGS: Record<string, BrandServiceConfig> = {
  Toyota: {
    brand: 'Toyota',
    intervalKm: 5000,
    intervalMonths: 6,
    brandOfficialRecommendation: 'Pauta Oficial Toyota Perú: cada 5,000 km o 6 meses (lo que ocurra primero)',
  },
  Nissan: {
    brand: 'Nissan',
    intervalKm: 10000,
    intervalMonths: 6,
    brandOfficialRecommendation: 'Pauta Oficial Nissan: cada 10,000 km o 6 meses (lo que ocurra primero)',
  },
  Hyundai: {
    brand: 'Hyundai',
    intervalKm: 7500,
    intervalMonths: 6,
    brandOfficialRecommendation: 'Pauta Oficial Hyundai: cada 7,500 km o 6 meses (lo que ocurra primero)',
  },
  Kia: {
    brand: 'Kia',
    intervalKm: 7500,
    intervalMonths: 6,
    brandOfficialRecommendation: 'Pauta Oficial Kia: cada 7,500 km o 6 meses (lo que ocurra primero)',
  },
  Ford: {
    brand: 'Ford',
    intervalKm: 10000,
    intervalMonths: 12,
    brandOfficialRecommendation: 'Pauta Oficial Ford: cada 10,000 km o 1 año (lo que ocurra primero)',
  },
  Audi: {
    brand: 'Audi',
    intervalKm: 15000,
    intervalMonths: 12,
    brandOfficialRecommendation: 'Pauta Oficial Audi: cada 15,000 km o 1 año (lo que ocurra primero)',
  },
  Volkswagen: {
    brand: 'Volkswagen',
    intervalKm: 10000,
    intervalMonths: 12,
    brandOfficialRecommendation: 'Pauta Oficial Volkswagen: cada 10,000 km o 1 año (lo que ocurra primero)',
  },
};

const DEFAULT_BRAND_CONFIG: BrandServiceConfig = {
  brand: 'Multimarca',
  intervalKm: 5000,
  intervalMonths: 6,
  brandOfficialRecommendation: 'Estándar Nor Celis Multimarca: cada 5,000 km o 6 meses',
};

/**
 * Obtiene la configuración de frecuencia oficial según la marca del vehículo.
 */
export function getBrandServiceConfig(brandName: string): BrandServiceConfig {
  const normalized = Object.keys(BRAND_SERVICE_CONFIGS).find(
    (b) => b.toLowerCase() === (brandName || '').trim().toLowerCase()
  );
  return normalized ? BRAND_SERVICE_CONFIGS[normalized] : DEFAULT_BRAND_CONFIG;
}

/**
 * Calcula el promedio real de kilómetros conducidos al mes basándose en el historial de servicios.
 * Si no hay suficientes registros históricos, retorna un promedio estándar de 1,250 km/mes.
 */
export function calculateAverageMonthlyKm(history: MaintenanceRecord[], defaultKm = 1250): number {
  if (!history || history.length < 2) return defaultKm;

  // Ordenar por fecha cronológica ascendente
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const firstDate = new Date(first.date).getTime();
  const lastDate = new Date(last.date).getTime();
  const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

  if (daysDiff <= 30) return defaultKm;

  const kmDiff = Math.max(0, last.mileage - first.mileage);
  const monthsDiff = daysDiff / 30.417; // promedio de días por mes
  const calculated = Math.round(kmDiff / monthsDiff);

  // Retornar dentro de un rango realista (mínimo 500 km/mes, máximo 4,000 km/mes)
  return Math.min(Math.max(calculated, 500), 4000);
}

/**
 * Helper principal: calcula el próximo mantenimiento, fecha estimada y estatus
 * basado en el kilometraje actual, la frecuencia de servicio de la marca
 * y el principio automotriz "lo que ocurra primero: tiempo o kilometraje".
 */
export function calculateNextMaintenance(params: {
  currentMileage: number;
  brand: string;
  lastServiceDate?: string | Date;
  lastServiceMileage?: number;
  averageMonthlyKm?: number;
  referenceDate?: Date;
}): NextMaintenanceForecast {
  const {
    currentMileage,
    brand,
    lastServiceDate,
    lastServiceMileage,
    averageMonthlyKm = 1250,
    referenceDate = new Date(),
  } = params;

  const brandConfig = getBrandServiceConfig(brand);
  const { intervalKm, intervalMonths, brandOfficialRecommendation } = brandConfig;

  // 1. Determinar el hito de kilometraje del próximo servicio
  let nextServiceKm: number;
  if (lastServiceMileage !== undefined && lastServiceMileage > 0) {
    // Si sabemos cuándo fue el último servicio, el próximo es el hito oficial siguiente
    const nextMilestone = lastServiceMileage + intervalKm;
    if (currentMileage >= nextMilestone) {
      // Si el kilometraje actual ya superó ese hito pero no ha pasado un intervalo completo extra,
      // el servicio sigue siendo el de ese hito pero se encuentra en estado 'vencido/excedido'
      if (currentMileage - nextMilestone < intervalKm) {
        nextServiceKm = nextMilestone;
      } else {
        nextServiceKm = Math.ceil((currentMileage + 1) / intervalKm) * intervalKm;
      }
    } else {
      nextServiceKm = nextMilestone;
    }
  } else {
    // Si no hay último kilometraje registrado, calcular siguiente múltiplo entero
    nextServiceKm = Math.ceil((currentMileage + 1) / intervalKm) * intervalKm;
  }

  // Kilómetros restantes para el próximo servicio
  const kmRemaining = nextServiceKm - currentMileage;

  // 2. Proyección por kilometraje (según ritmo de manejo diario)
  const dailyKm = Math.max(averageMonthlyKm / 30, 10);
  const daysUntilKmTarget = kmRemaining > 0 ? Math.round(kmRemaining / dailyKm) : 0;
  const targetDateByKm = new Date(referenceDate.getTime() + daysUntilKmTarget * 24 * 60 * 60 * 1000);

  // 3. Proyección por tiempo (según el intervalo en meses de la marca)
  let targetDateByTime: Date | null = null;
  let daysUntilTimeLimit: number | null = null;

  if (lastServiceDate) {
    const lastDate = typeof lastServiceDate === 'string' ? new Date(lastServiceDate) : lastServiceDate;
    if (!isNaN(lastDate.getTime())) {
      targetDateByTime = new Date(lastDate);
      targetDateByTime.setMonth(targetDateByTime.getMonth() + intervalMonths);
      daysUntilTimeLimit = Math.round((targetDateByTime.getTime() - referenceDate.getTime()) / (24 * 60 * 60 * 1000));
    }
  }

  // 4. Comparar: "Lo que ocurra primero (tiempo vs kilometraje)"
  let estimatedNextDate: Date;
  let determiningFactor: 'kilometraje' | 'tiempo';
  let daysRemaining: number;

  if (targetDateByTime && daysUntilTimeLimit !== null && daysUntilTimeLimit < daysUntilKmTarget) {
    // Vence primero por límite de tiempo de la marca (ej. pasaron los 6 meses antes de cumplir los km)
    determiningFactor = 'tiempo';
    estimatedNextDate = targetDateByTime;
    daysRemaining = daysUntilTimeLimit;
  } else {
    // Vence primero por kilometraje acumulado
    determiningFactor = 'kilometraje';
    estimatedNextDate = targetDateByKm;
    daysRemaining = daysUntilKmTarget;
  }

  // 5. Determinar nivel de urgencia
  let urgencyStatus: 'al_dia' | 'proximo' | 'urgente' | 'vencido';
  if (kmRemaining <= 0 || daysRemaining < 0) {
    urgencyStatus = 'vencido';
  } else if (kmRemaining <= 300 || daysRemaining <= 7) {
    urgencyStatus = 'urgente';
  } else if (kmRemaining <= 1000 || daysRemaining <= 30) {
    urgencyStatus = 'proximo';
  } else {
    urgencyStatus = 'al_dia';
  }

  // 6. Clasificar paquete oficial de mantenimiento para ese kilometraje
  let servicePackageName: string;
  let servicePackageType: 'menor' | 'intermedio' | 'mayor';

  if (nextServiceKm % 20000 === 0) {
    servicePackageType = 'mayor';
    servicePackageName = `Mantenimiento Mayor (${nextServiceKm.toLocaleString()} km) • Inspección 150 Puntos + Bujías + Fluidos`;
  } else if (nextServiceKm % 10000 === 0) {
    servicePackageType = 'intermedio';
    servicePackageName = `Mantenimiento Intermedio (${nextServiceKm.toLocaleString()} km) • Rotación Láser + Frenos & Filtros`;
  } else {
    servicePackageType = 'menor';
    servicePackageName = `Mantenimiento Menor (${nextServiceKm.toLocaleString()} km) • Aceite Sintético OEM + Filtro + Escaneo`;
  }

  // 7. Formatear fecha en español
  const estimatedNextDateFormatted = formatSpanishDate(estimatedNextDate);

  return {
    currentMileage,
    nextServiceKm,
    kmRemaining,
    estimatedNextDate,
    estimatedNextDateFormatted,
    daysRemaining,
    determiningFactor,
    urgencyStatus,
    servicePackageName,
    servicePackageType,
    brandIntervalText: brandOfficialRecommendation,
    estimatedMonthlyKm: averageMonthlyKm,
  };
}

/**
 * Formatea un objeto Date a texto amigable en español (ej. "18 de Octubre, 2025").
 */
export function formatSpanishDate(date: Date): string {
  try {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month}, ${year}`;
  } catch {
    return date.toLocaleDateString();
  }
}

/**
 * Historial inicial de mantenimientos realizados por vehículo.
 * Registrado oficialmente en Taller Nor Celis - Cajamarca.
 */
export const INITIAL_MAINTENANCE_HISTORY: MaintenanceRecord[] = [
  // RAV4 Hybrid (ABC-123)
  {
    id: 'MNT-2026-081',
    vehiclePlate: 'ABC-123',
    date: '2026-05-15',
    mileage: 20000,
    serviceType: 'Mantenimiento Preventivo Mayor 20,000 km + Protocolo Híbrido Techstream',
    workSummary: [
      'Cambio de Aceite de Motor 100% Sintético Toyota 0W-16 OEM',
      'Reemplazo de Filtro de Aceite y Filtro de Aire de Motor OEM',
      'Reemplazo de Filtro de Aire Acondicionado / Cabina antibacterial',
      'Inspección computarizada del sistema híbrido dual con escáner Techstream',
      'Limpieza y aspirado del filtro de refrigeración de la batería híbrida de alto voltaje',
      'Rotación de 4 neumáticos, balanceo dinámico y calibración de sensores TPMS',
      'Inspección de pastillas de freno y discos (espesor útil: 9.8mm, óptimo)',
    ],
    technician: 'Ing. Renzo Valdivia (Master Híbrido Certificado Toyota)',
    workshop: 'Taller Central Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA)',
    costSoles: 640,
    invoiceNumber: 'B001-00045210',
    warrantyCertified: true,
    notes: 'Vehículo en excelente estado mecánico. Batería de tracción híbrida al 99.4% de salud química. Se sella cartilla de garantía oficial.',
  },
  {
    id: 'MNT-2025-112',
    vehiclePlate: 'ABC-123',
    date: '2025-11-10',
    mileage: 15000,
    serviceType: 'Mantenimiento Preventivo Menor 15,000 km',
    workSummary: [
      'Cambio de Aceite Sintético Toyota 0W-16 y Filtro Original',
      'Inspección de suspensión, terminales y fuelles homocinéticos',
      'Verificación y relleno de niveles: refrigerante inverter y líquido de frenos DOT 4',
      'Revisión eléctrica de luces y calibración de faros LED delanteros',
    ],
    technician: 'Téc. Marco Quispe (Especialista Toyota)',
    workshop: 'Taller Central Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA)',
    costSoles: 380,
    invoiceNumber: 'B001-00031890',
    warrantyCertified: true,
    notes: 'Presión de inflado ajustada a 34 PSI en las 4 ruedas. Niveles correctos.',
  },
  {
    id: 'MNT-2025-048',
    vehiclePlate: 'ABC-123',
    date: '2025-05-02',
    mileage: 10000,
    serviceType: 'Mantenimiento Preventivo Intermedio 10,000 km',
    workSummary: [
      'Cambio de Aceite Sintético 0W-16 + Filtro de Aceite OEM',
      'Rotación de neumáticos cruzada y balanceo de ruedas',
      'Limpieza y regulación de frenos posteriores',
      'Escaneo electrónico de módulos ECU, ABS y TSS (Toyota Safety Sense)',
    ],
    technician: 'Ing. Renzo Valdivia',
    workshop: 'Taller Central Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA)',
    costSoles: 490,
    invoiceNumber: 'B001-00021430',
    warrantyCertified: true,
    notes: 'Primer año de garantía sellado con éxito. Sin códigos de error registrados.',
  },

  // Hilux Revo (HLX-789)
  {
    id: 'MNT-2026-022',
    vehiclePlate: 'HLX-789',
    date: '2026-04-10',
    mileage: 40000,
    serviceType: 'Mantenimiento Mayor 40,000 km Diésel 4x4 (Uso Severo Minero)',
    workSummary: [
      'Cambio de Aceite Diésel Heavy Duty 5W-30 DPF Toyota Original',
      'Reemplazo de Filtro de Aceite, Filtro de Aire de Alto Flujo y Filtro de Combustible Diésel',
      'Reemplazo de Filtro Separador de Agua y drenaje de sedimentos',
      'Cambio de aceite de caja de transferencia 4x4 y diferenciales delantero/posterior',
      'Engrase integral de crucetas del cardán y barra estabilizadora reforzada',
      'Alineación láser 3D de tren delantero y calibración de combas para trocha',
    ],
    technician: 'Ing. Gonzalo Morales (Jefe de Flotas 4x4 & Minería)',
    workshop: 'Taller Central Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA)',
    costSoles: 980,
    invoiceNumber: 'F002-00018471',
    warrantyCertified: true,
    notes: 'Camioneta con excelente compresión en los 4 cilindros. Suspensión probada en banco dinámico sin fugas.',
  },
  {
    id: 'MNT-2025-094',
    vehiclePlate: 'HLX-789',
    date: '2025-09-14',
    mileage: 30000,
    serviceType: 'Mantenimiento Intermedio 30,000 km',
    workSummary: [
      'Cambio de Aceite 5W-30 DPF y Filtro de Aceite Toyota',
      'Inspección y limpieza de frenos delanteros y zapatas traseras',
      'Revisión de pastillas de freno (desgaste 40%, vida útil restante ~18,000 km)',
      'Escaneo de inyectores Common Rail y regeneración preventiva de filtro DPF',
    ],
    technician: 'Téc. Marco Quispe',
    workshop: 'Taller Central Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA)',
    costSoles: 550,
    invoiceNumber: 'F002-00012904',
    warrantyCertified: true,
    notes: 'Presión de inyección y parámetros del turbo en rango óptimo de fabricante.',
  },

  // Nissan Frontier (NFR-442)
  {
    id: 'MNT-2026-060',
    vehiclePlate: 'NFR-442',
    date: '2026-03-20',
    mileage: 20000,
    serviceType: 'Mantenimiento Oficial Nissan 20,000 km',
    workSummary: [
      'Cambio de Aceite Sintético Nissan 5W-30 C3 Low SAPS',
      'Filtro de aceite y filtro de aire genuino Nissan OEM',
      'Inspección de amortiguadores Multilink y bujes de barra estabilizadora',
      'Chequeo de sistema de tracción electrónica 4WD Shift-on-the-fly',
    ],
    technician: 'Ing. Renzo Valdivia',
    workshop: 'Taller Central Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA)',
    costSoles: 620,
    invoiceNumber: 'B001-00038910',
    warrantyCertified: true,
    notes: 'Servicio realizado en tiempo reglamentario para vigencia de garantía Nissan.',
  },
];


/**
 * Consulta el historial de mantenimiento de un vehículo filtrado por su número de placa.
 */
export function getVehicleMaintenanceHistory(
  vehiclePlate: string,
  history: MaintenanceRecord[] = INITIAL_MAINTENANCE_HISTORY
): MaintenanceRecord[] {
  const cleanPlate = (vehiclePlate || '').trim().toUpperCase();
  return history
    .filter((record) => record.vehiclePlate.trim().toUpperCase() === cleanPlate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
