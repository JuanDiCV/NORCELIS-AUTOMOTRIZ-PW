import { Vehicle, AutoPart } from '../types';
import { SaleRecord, WorkshopOrderRecord, QuotationLeadRecord } from '../data/accountingMockData';

export interface CsvExportOptions {
  delimiter?: ',' | ';';
  includeBOM?: boolean; // UTF-8 BOM for Microsoft Excel
  dateFormat?: 'YYYY-MM-DD' | 'DD/MM/YYYY';
  branchFilter?: string;
  categoryFilter?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Helper to safely escape CSV cells (RFC 4180 standard)
 */
function escapeCsvCell(val: string | number | null | undefined, delimiter: string = ','): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // If contains delimiter, quotes, or newlines, wrap in quotes and escape internal quotes
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Downloads a generated CSV string with UTF-8 BOM encoding for Microsoft Excel
 */
export function downloadCsvFile(csvString: string, filename: string): void {
  // UTF-8 BOM header: \uFEFF ensures Excel properly opens special Spanish characters (tildes, ñ, soles)
  const bomPrefix = '\uFEFF';
  const fullContent = csvString.startsWith(bomPrefix) ? csvString : bomPrefix + csvString;

  const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export 1: Inventario Completo de Vehículos (Autos 0km y Seminuevos)
 */
export function generateVehiclesCsv(
  vehicles: Vehicle[],
  options: CsvExportOptions = {}
): { csvString: string; rowCount: number; filename: string } {
  const delim = options.delimiter || ',';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `norcelis_inventario_vehiculos_${timestamp}.csv`;

  // Headers standard for accounting & ERP systems
  const headers = [
    'ID_VEHICULO',
    'MARCA',
    'MODELO_VERSION',
    'ANO_FABRICACION',
    'CONDICION',
    'CARROCERIA',
    'COMBUSTIBLE',
    'TRANSMISION',
    'TRACCION',
    'POTENCIA',
    'PRECIO_VENTA_USD',
    'PRECIO_VENTA_PEN',
    'COSTO_ESTIMADO_USD',
    'MARGEN_BRUTO_ESTIMADO_USD',
    'ESTADO_DISPONIBILIDAD',
    'SEDE_ASIGNADA',
    'BONO_PROMOCIONAL',
    'GARANTIA_MESES_KM'
  ];

  const rows: string[] = [];
  rows.push(headers.map(h => escapeCsvCell(h, delim)).join(delim));

  let filtered = vehicles;
  if (options.branchFilter && options.branchFilter !== 'todas') {
    filtered = filtered.filter(v => 
      (v.availability || '').toLowerCase().includes(options.branchFilter!.toLowerCase())
    );
  }
  if (options.categoryFilter && options.categoryFilter !== 'todas') {
    filtered = filtered.filter(v => v.condition === options.categoryFilter);
  }

  filtered.forEach(v => {
    const usd = Number(v.priceUsd) || 0;
    const pen = Number(v.priceSoles) || Math.round(usd * 3.78);
    // Estimated acquisition cost & gross margin calculation for accounting
    const estCostUsd = Math.round(usd * (v.condition === 'nuevo' ? 0.86 : 0.80));
    const grossMarginUsd = usd - estCostUsd;

    const row = [
      v.id,
      v.brand,
      v.name,
      v.year,
      v.condition === 'nuevo' ? 'Nuevo (0 km)' : 'Seminuevo Certificado',
      v.bodyType,
      v.fuelType,
      v.specs?.transmission || 'Automática',
      v.specs?.traction || '4x4 / 4x2',
      v.specs?.power || 'N/D',
      usd.toFixed(2),
      pen.toFixed(2),
      estCostUsd.toFixed(2),
      grossMarginUsd.toFixed(2),
      v.availability,
      v.availability.includes('Cajamarca') ? 'Sede Cajamarca Central' : 'Sede Principal',
      v.discountBonus || 'Ninguno',
      v.warranty || '5 años o 100,000 km'
    ];
    rows.push(row.map(cell => escapeCsvCell(cell, delim)).join(delim));
  });

  return {
    csvString: rows.join('\r\n'),
    rowCount: filtered.length,
    filename,
  };
}

/**
 * Export 2: Catálogo & Stock de Autopartes y Repuestos
 */
export function generateAutoPartsCsv(
  parts: AutoPart[],
  options: CsvExportOptions = {}
): { csvString: string; rowCount: number; filename: string } {
  const delim = options.delimiter || ',';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `norcelis_inventario_autopartes_${timestamp}.csv`;

  const headers = [
    'CODIGO_SKU',
    'CODIGO_OEM_FABRICANTE',
    'DESCRIPCION_REPUESTO',
    'MARCA_FABRICANTE',
    'CATEGORIA',
    'TIPO_CERTIFICACION',
    'COMPATIBILIDAD_VEHICULOS',
    'PRECIO_UNITARIO_PEN',
    'PRECIO_UNITARIO_USD',
    'PRECIO_REGULAR_ANTERIOR_PEN',
    'COSTO_ESTIMADO_UNITARIO_PEN',
    'CANTIDAD_STOCK_ALMACEN',
    'VALOR_TOTAL_STOCK_PEN',
    'ESTADO_DISPONIBILIDAD',
    'DESCUENTO_COMERCIAL',
    'BADGE_PROMOCION'
  ];

  const rows: string[] = [];
  rows.push(headers.map(h => escapeCsvCell(h, delim)).join(delim));

  let filtered = parts;
  if (options.categoryFilter && options.categoryFilter !== 'todas') {
    filtered = filtered.filter(p => p.category === options.categoryFilter);
  }

  filtered.forEach(p => {
    const pen = Number(p.priceSoles) || 0;
    const usd = Number(p.priceUsd) || Math.round(pen / 3.78);
    // Parse quantity from stockText e.g. "Stock Central Cajamarca (12 unidades)"
    const match = (p.stockText || '').match(/\((\d+)\s*unidad/i);
    const stockQty = match ? parseInt(match[1]) : (p.stockText?.toLowerCase().includes('agotad') ? 0 : 8);
    const estCostPen = Math.round(pen * 0.65);
    const totalInventoryValue = pen * stockQty;

    const row = [
      p.sku,
      p.oemCode || 'N/A',
      p.name,
      p.brand,
      p.category.toUpperCase(),
      p.brandType === 'oficial' ? 'OEM Original' : (p.brandType === 'alternativa' ? 'Línea Alternativa' : 'Estándar Oficial'),
      p.compatibleVehicle || 'Multimarca',
      pen.toFixed(2),
      usd.toFixed(2),
      p.oldPriceSoles ? p.oldPriceSoles.toFixed(2) : pen.toFixed(2),
      estCostPen.toFixed(2),
      stockQty,
      totalInventoryValue.toFixed(2),
      p.stockText || 'En Stock Almacén',
      p.discount || '0%',
      p.badge || 'Estándar'
    ];
    rows.push(row.map(cell => escapeCsvCell(cell, delim)).join(delim));
  });

  return {
    csvString: rows.join('\r\n'),
    rowCount: filtered.length,
    filename,
  };
}

/**
 * Export 3: Registro de Ventas & Facturación Electrónica (SUNAT / Contabilidad)
 */
export function generateSalesCsv(
  sales: SaleRecord[],
  options: CsvExportOptions = {}
): { csvString: string; rowCount: number; filename: string } {
  const delim = options.delimiter || ',';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `norcelis_registro_ventas_facturacion_${timestamp}.csv`;

  const headers = [
    'NRO_COMPROBANTE',
    'TIPO_COMPROBANTE',
    'FECHA_EMISION',
    'TIPO_DOC_CLIENTE',
    'NUMERO_DOC_CLIENTE',
    'RAZON_SOCIAL_O_CLIENTE',
    'CATEGORIA_VENTA',
    'DESCRIPCION_OPERACION',
    'MONEDA',
    'TIPO_CAMBIO_SUNAT',
    'SUBTOTAL_IMPONIBLE',
    'IGV_18_PORCIENTO',
    'TOTAL_COMPROBANTE',
    'TOTAL_CONVERTIDO_PEN',
    'METODO_PAGO',
    'SEDE_EMISION',
    'ASESOR_COMERCIAL',
    'ESTADO_SUNAT'
  ];

  const rows: string[] = [];
  rows.push(headers.map(h => escapeCsvCell(h, delim)).join(delim));

  let filtered = sales;
  if (options.branchFilter && options.branchFilter !== 'todas') {
    filtered = filtered.filter(s => s.branch === options.branchFilter);
  }
  if (options.categoryFilter && options.categoryFilter !== 'todas') {
    filtered = filtered.filter(s => s.saleCategory === options.categoryFilter);
  }
  if (options.startDate) {
    filtered = filtered.filter(s => s.issueDate >= options.startDate!);
  }
  if (options.endDate) {
    filtered = filtered.filter(s => s.issueDate <= options.endDate!);
  }

  filtered.forEach(s => {
    const totalPen = s.currency === 'USD' ? s.totalAmount * s.exchangeRate : s.totalAmount;

    const row = [
      s.invoiceNumber,
      s.docType,
      s.issueDate,
      s.customerDocType,
      s.customerDocNumber,
      s.customerName,
      s.saleCategory,
      s.itemDescription,
      s.currency,
      s.exchangeRate.toFixed(2),
      s.subtotal.toFixed(2),
      s.taxIgv.toFixed(2),
      s.totalAmount.toFixed(2),
      totalPen.toFixed(2),
      s.paymentMethod,
      s.branch,
      s.salesAdvisor,
      s.sunatStatus
    ];
    rows.push(row.map(cell => escapeCsvCell(cell, delim)).join(delim));
  });

  return {
    csvString: rows.join('\r\n'),
    rowCount: filtered.length,
    filename,
  };
}

/**
 * Export 4: Servicios de Taller & Órdenes de Trabajo
 */
export function generateWorkshopOrdersCsv(
  orders: WorkshopOrderRecord[],
  options: CsvExportOptions = {}
): { csvString: string; rowCount: number; filename: string } {
  const delim = options.delimiter || ',';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `norcelis_ordenes_taller_${timestamp}.csv`;

  const headers = [
    'NRO_ORDEN_TRABAJO',
    'FECHA_INGRESO',
    'FECHA_ENTREGA',
    'PLACA_VEHICULO',
    'MODELO_VEHICULO',
    'CLIENTE',
    'RUC_DNI_CLIENTE',
    'TIPO_SERVICIO_REALIZADO',
    'COSTO_MANO_OBRA_PEN',
    'COSTO_REPUESTOS_PEN',
    'SUBTOTAL_IMPONIBLE_PEN',
    'IGV_18_PEN',
    'TOTAL_ORDEN_PEN',
    'TECNICO_RESPONSABLE',
    'SEDE_TALLER',
    'ESTADO_ORDEN'
  ];

  const rows: string[] = [];
  rows.push(headers.map(h => escapeCsvCell(h, delim)).join(delim));

  let filtered = orders;
  if (options.branchFilter && options.branchFilter !== 'todas') {
    filtered = filtered.filter(o => o.branch === options.branchFilter);
  }
  if (options.startDate) {
    filtered = filtered.filter(o => o.entryDate >= options.startDate!);
  }
  if (options.endDate) {
    filtered = filtered.filter(o => o.entryDate <= options.endDate!);
  }

  filtered.forEach(o => {
    const row = [
      o.orderNumber,
      o.entryDate,
      o.deliveryDate,
      o.vehiclePlate,
      o.vehicleModel,
      o.clientName,
      o.clientDoc,
      o.serviceType,
      o.laborCostSoles.toFixed(2),
      o.partsCostSoles.toFixed(2),
      o.subtotalSoles.toFixed(2),
      o.igvSoles.toFixed(2),
      o.totalSoles.toFixed(2),
      o.technician,
      o.branch,
      o.status
    ];
    rows.push(row.map(cell => escapeCsvCell(cell, delim)).join(delim));
  });

  return {
    csvString: rows.join('\r\n'),
    rowCount: filtered.length,
    filename,
  };
}

/**
 * Export 5: Cotizaciones & Pipeline Comercial
 */
export function generateQuotationsCsv(
  quotes: QuotationLeadRecord[],
  options: CsvExportOptions = {}
): { csvString: string; rowCount: number; filename: string } {
  const delim = options.delimiter || ',';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `norcelis_cotizaciones_leads_${timestamp}.csv`;

  const headers = [
    'NRO_COTIZACION',
    'FECHA_COTIZACION',
    'CLIENTE',
    'DNI_RUC',
    'TELEFONO_CONTACTO',
    'EMAIL_CLIENTE',
    'TIPO_INTERES',
    'PRODUCTO_O_VEHICULO_COTIZADO',
    'MONTO_COTIZADO_PEN',
    'MONTO_COTIZADO_USD',
    'CUOTA_INICIAL_PROYECTADA_USD',
    'ASESOR_ASIGNADO',
    'SEDE',
    'ESTADO_PROSPECTO'
  ];

  const rows: string[] = [];
  rows.push(headers.map(h => escapeCsvCell(h, delim)).join(delim));

  let filtered = quotes;
  if (options.branchFilter && options.branchFilter !== 'todas') {
    filtered = filtered.filter(q => q.branch === options.branchFilter);
  }
  if (options.startDate) {
    filtered = filtered.filter(q => q.quoteDate >= options.startDate!);
  }
  if (options.endDate) {
    filtered = filtered.filter(q => q.quoteDate <= options.endDate!);
  }

  filtered.forEach(q => {
    const row = [
      q.quoteNumber,
      q.quoteDate,
      q.clientName,
      q.documentNumber,
      q.phone,
      q.email,
      q.interestType,
      q.itemQuoted,
      q.quotedPriceSoles.toFixed(2),
      q.quotedPriceUsd.toFixed(2),
      q.initialPaymentProjectedUsd ? q.initialPaymentProjectedUsd.toFixed(2) : '0.00',
      q.salesAdvisor,
      q.branch,
      q.status
    ];
    rows.push(row.map(cell => escapeCsvCell(cell, delim)).join(delim));
  });

  return {
    csvString: rows.join('\r\n'),
    rowCount: filtered.length,
    filename,
  };
}

/**
 * Export 6: Resumen Ejecutivo y Balance Contable Consolidado
 */
export function generateConsolidatedAccountingSummaryCsv(
  vehicles: Vehicle[],
  parts: AutoPart[],
  sales: SaleRecord[],
  orders: WorkshopOrderRecord[],
  options: CsvExportOptions = {}
): { csvString: string; rowCount: number; filename: string } {
  const delim = options.delimiter || ',';
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `norcelis_balance_contable_ejecutivo_${timestamp}.csv`;

  const rows: string[] = [];

  // Title section
  rows.push(['NOR CELIS AUTOMOTRIZ S.A.C. - REPORTE CONTABLE Y FINANCIERO EJECUTIVO'].map(c => escapeCsvCell(c, delim)).join(delim));
  rows.push([`Generado el: ${new Date().toLocaleString('es-PE')} | Moneda Base: Soles (PEN) y Dólares (USD)`].map(c => escapeCsvCell(c, delim)).join(delim));
  rows.push('');

  // Section 1: KPI Resumen General
  rows.push(['1. RESUMEN DE VENTAS Y FACTURACION (ULTIMO PERIODO)'].map(c => escapeCsvCell(c, delim)).join(delim));
  rows.push(['CONCEPTO', 'CANTIDAD_OPERACIONES', 'SUBTOTAL_PEN', 'IGV_18_PEN', 'TOTAL_PEN', 'TOTAL_EQUIVALENTE_USD'].map(c => escapeCsvCell(c, delim)).join(delim));

  const totalSalesCount = sales.length;
  const totalSalesPen = sales.reduce((sum, s) => sum + (s.currency === 'USD' ? s.totalAmount * s.exchangeRate : s.totalAmount), 0);
  const totalSubtotalPen = sales.reduce((sum, s) => sum + (s.currency === 'USD' ? s.subtotal * s.exchangeRate : s.subtotal), 0);
  const totalIgvPen = sales.reduce((sum, s) => sum + (s.currency === 'USD' ? s.taxIgv * s.exchangeRate : s.taxIgv), 0);
  const totalSalesUsd = totalSalesPen / 3.78;

  rows.push([
    'Ventas Totales Registradas',
    totalSalesCount,
    totalSubtotalPen.toFixed(2),
    totalIgvPen.toFixed(2),
    totalSalesPen.toFixed(2),
    totalSalesUsd.toFixed(2)
  ].map(c => escapeCsvCell(c, delim)).join(delim));

  rows.push('');

  // Section 2: Resumen de Inventarios Activos
  rows.push(['2. VALORIZACION DE INVENTARIOS EN ALMACEN Y SALA DE VENTAS'].map(c => escapeCsvCell(c, delim)).join(delim));
  rows.push(['RUBRO_INVENTARIO', 'UNIDADES_EN_STOCK', 'VALOR_TOTAL_PEN', 'VALOR_TOTAL_USD', 'COSTO_ESTIMADO_PEN', 'MARGEN_ESTIMADO_PEN'].map(c => escapeCsvCell(c, delim)).join(delim));

  const totalVehiclesCount = vehicles.length;
  const totalVehiclesUsd = vehicles.reduce((sum, v) => sum + (v.priceUsd || 0), 0);
  const totalVehiclesPen = totalVehiclesUsd * 3.78;
  const totalVehiclesCostPen = totalVehiclesPen * 0.84;
  const totalVehiclesMarginPen = totalVehiclesPen - totalVehiclesCostPen;

  rows.push([
    'Inventario de Vehículos (0km y Seminuevos)',
    totalVehiclesCount,
    totalVehiclesPen.toFixed(2),
    totalVehiclesUsd.toFixed(2),
    totalVehiclesCostPen.toFixed(2),
    totalVehiclesMarginPen.toFixed(2)
  ].map(c => escapeCsvCell(c, delim)).join(delim));

  const totalPartsUnits = parts.reduce((sum, p) => {
    const match = (p.stockText || '').match(/\((\d+)\s*unidad/i);
    return sum + (match ? parseInt(match[1]) : (p.stockText?.toLowerCase().includes('agotad') ? 0 : 8));
  }, 0);
  const totalPartsValuePen = parts.reduce((sum, p) => {
    const match = (p.stockText || '').match(/\((\d+)\s*unidad/i);
    const qty = match ? parseInt(match[1]) : (p.stockText?.toLowerCase().includes('agotad') ? 0 : 8);
    return sum + (p.priceSoles * qty);
  }, 0);
  const totalPartsValueUsd = totalPartsValuePen / 3.78;
  const totalPartsCostPen = totalPartsValuePen * 0.65;
  const totalPartsMarginPen = totalPartsValuePen - totalPartsCostPen;

  rows.push([
    'Stock de Repuestos & Autopartes Almacén',
    totalPartsUnits,
    totalPartsValuePen.toFixed(2),
    totalPartsValueUsd.toFixed(2),
    totalPartsCostPen.toFixed(2),
    totalPartsMarginPen.toFixed(2)
  ].map(c => escapeCsvCell(c, delim)).join(delim));

  rows.push('');

  // Section 3: Servicios de Taller
  rows.push(['3. LIQUIDACION DE SERVICIOS Y TALLER'].map(c => escapeCsvCell(c, delim)).join(delim));
  rows.push(['CONCEPTO', 'CANTIDAD_ORDENES', 'MANO_OBRA_PEN', 'REPUESTOS_TALLER_PEN', 'TOTAL_FACTURADO_PEN'].map(c => escapeCsvCell(c, delim)).join(delim));

  const totalOtCount = orders.length;
  const totalLaborPen = orders.reduce((sum, o) => sum + o.laborCostSoles, 0);
  const totalPartsInOtPen = orders.reduce((sum, o) => sum + o.partsCostSoles, 0);
  const totalOtPen = orders.reduce((sum, o) => sum + o.totalSoles, 0);

  rows.push([
    'Órdenes de Trabajo de Taller',
    totalOtCount,
    totalLaborPen.toFixed(2),
    totalPartsInOtPen.toFixed(2),
    totalOtPen.toFixed(2)
  ].map(c => escapeCsvCell(c, delim)).join(delim));

  return {
    csvString: rows.join('\r\n'),
    rowCount: rows.length,
    filename,
  };
}
