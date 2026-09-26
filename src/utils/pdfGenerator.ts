/**
 * Nor Celis Automotriz - Generador Oficial de Cotizaciones y Documentos PDF
 * GRUPO MEVAC S.A.C. (Nombre Comercial: NORCELIS AUTOMOTRIZ) - RUC 20610829318
 * 
 * Estructura estricta comercial, cálculos exactos con IGV, descuentos,
 * cuentas bancarias autorizadas, detracciones Banco de la Nación y políticas oficiales.
 */

import { jsPDF } from 'jspdf';
import { Vehicle, WishlistItem, ActiveGarageVehicle, MaintenanceRecord } from '../types';

export interface QuotationItem {
  itemNumber: number;
  codigo: string;
  unidadMedida: string;
  cantidad: number;
  descripcion: string;
  precioUnitario: number;
  descuentoPorcentaje: number;
  unitarioConDescuento: number;
  importeTotal: number;
}

export interface CommercialQuotationData {
  numeroDocumento: string; // Formato correlativo: ej. 2026-004812
  cliente: {
    nombreOrazonSocial: string;
    rucOdni?: string;
    direccion: string;
    telefono: string;
    correo: string;
    placaVehiculo: string;
  };
  fechaEmision: string; // DD/MM/YYYY
  fechaVencimiento: string; // DD/MM/YYYY (+7 días)
  moneda: 'PEN' | 'USD';
  formaPago: string; // ej. Efectivo, Transferencia Bancaria, Crédito
  asesorVentas: string;
  items: QuotationItem[];
  observaciones?: string;
}

export interface FinancingPdfParams {
  vehicleName: string;
  vehicleYear: number;
  vehiclePriceSoles: number;
  vehiclePriceUsd: number;
  bankName: string;
  downPaymentSoles: number;
  downPaymentPercent: number;
  loanAmountSoles: number;
  loanTermMonths: number;
  monthlyPaymentSoles: number;
  teaPercent: number;
  amortizationRows?: Array<{
    month: number;
    initialBalance: number;
    principal: number;
    interest: number;
    insurance: number;
    totalPayment: number;
    endingBalance: number;
  }>;
}

// Datos Fijos Oficiales de la Empresa
export const COMPANY_DATA = {
  razonSocial: 'GRUPO MEVAC S.A.C.',
  nombreComercial: 'NORCELIS AUTOMOTRIZ',
  ruc: '20610829318',
  sucursales: [
    {
      sede: 'Sede Cajamarca',
      direccion: 'Av. Vía de Evitamiento Sur 6003, Cajamarca - Perú',
      telefonos: '965171717 - 963134961',
    },
    {
      sede: 'Sede Lima',
      direccion: 'Av. Elmer Faucett 1450, Callao / Lima - Perú',
      telefonos: '965171717 - 963134961',
    },
  ],
  telefonos: '965171717 - 963134961',
  correos: 'ventas1@norcelis.com / ventas2@norcelis.com',
  web: 'www.norcelis.com',
  colors: {
    azulEmpresarial: [33, 41, 85] as [number, number, number], // #212955
    naranjaEmpresarial: [240, 127, 0] as [number, number, number], // #F07F00
    grisEmpresarial: [157, 157, 156] as [number, number, number], // #9D9D9C
    blanco: [255, 255, 255] as [number, number, number], // #FFFFFF
    slateBg: [248, 250, 252] as [number, number, number], // #f8fafc
    borderGrey: [226, 232, 240] as [number, number, number], // #e2e8f0
  },
  cuentasBancarias: {
    titular: 'GRUPO MEVAC S.A.C. - RUC: 20610829318',
    soles: [
      { banco: 'BCP', cuenta: '245-9966172-0-49', cci: '002-245-00996617204992' },
      { banco: 'BBVA', cuenta: '0011-0248-0100034831', cci: '011-248-00010003483125' },
      { banco: 'Scotiabank', cuenta: '000-4949476', cci: '009-010-00000494947605' },
    ],
    dolares: [
      { banco: 'BCP', cuenta: '245-9964344-1-94', cci: '002-245-00996434419494' },
      { banco: 'BBVA', cuenta: '0011-0248-0100034874', cci: '011-248-00010003487428' },
      { banco: 'Scotiabank', cuenta: '000-4949488', cci: '009-010-00000494948809' },
    ],
    detraccionesBN: {
      banco: 'Banco de la Nación (Cuenta Detracciones)',
      cuenta: '00-772-001053',
    },
  },
  politicas: [
    'La presente cotización tiene validez por 7 días, los productos tienen un stock limitado.',
    'Los precios pueden variar según diagnóstico final del vehículo o disponibilidad de repuestos al momento de la confirmación del vehículo.',
  ],
  mensajeCierre:
    'Gracias por confiar en NORCELIS AUTOMOTRIZ especialistas en autopartes, accesorios y servicios automotrices. NORCELIS AUTOMOTRIZ CALIDAD, CONFIANZA Y TECNOLOGÍA PARA TU VEHICULO.',
};

/**
 * Conversión de números a letras oficial en español (estilo bancario y comercial peruano)
 */
export function numeroALetras(monto: number, moneda: 'PEN' | 'USD' = 'PEN'): string {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const diezY = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const veinti = ['', 'VEINTIUNO', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertirCentenas(num: number): string {
    if (num === 0) return '';
    if (num === 100) return 'CIEN';
    const c = Math.floor(num / 100);
    const d = Math.floor((num % 100) / 10);
    const u = num % 10;
    let str = centenas[c];
    if (d === 1) {
      str += (str ? ' ' : '') + diezY[u];
    } else if (d === 2 && u > 0) {
      str += (str ? ' ' : '') + veinti[u];
    } else if (d === 2 && u === 0) {
      str += (str ? ' ' : '') + 'VEINTE';
    } else if (d > 2) {
      str += (str ? ' ' : '') + decenas[d] + (u > 0 ? ' Y ' + unidades[u] : '');
    } else if (u > 0) {
      str += (str ? ' ' : '') + unidades[u];
    }
    return str.trim();
  }

  const parteEntera = Math.floor(Math.abs(monto));
  const centavos = Math.round((Math.abs(monto) - parteEntera) * 100);
  const centavosStr = centavos < 10 ? `0${centavos}` : `${centavos}`;

  let texto = '';
  if (parteEntera === 0) {
    texto = 'CERO';
  } else if (parteEntera < 1000) {
    texto = convertirCentenas(parteEntera);
  } else if (parteEntera < 1000000) {
    const miles = Math.floor(parteEntera / 1000);
    const resto = parteEntera % 1000;
    texto = miles === 1 ? 'MIL' : `${convertirCentenas(miles)} MIL`;
    if (resto > 0) {
      texto += ` ${convertirCentenas(resto)}`;
    }
  } else {
    const millones = Math.floor(parteEntera / 1000000);
    const restoMillones = parteEntera % 1000000;
    texto = millones === 1 ? 'UN MILLÓN' : `${convertirCentenas(millones)} MILLONES`;
    if (restoMillones >= 1000) {
      const miles = Math.floor(restoMillones / 1000);
      const restoMiles = restoMillones % 1000;
      texto += ` ${miles === 1 ? 'MIL' : convertirCentenas(miles) + ' MIL'}`;
      if (restoMiles > 0) texto += ` ${convertirCentenas(restoMiles)}`;
    } else if (restoMillones > 0) {
      texto += ` ${convertirCentenas(restoMillones)}`;
    }
  }

  const nombreMoneda = moneda === 'USD' ? 'DÓLARES AMERICANOS' : 'SOLES';
  return `SON: ${texto} CON ${centavosStr}/100 ${nombreMoneda}`;
}

/**
 * Formatear fecha a DD/MM/YYYY
 */
export function formatearFecha(date: Date = new Date()): string {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

/**
 * Obtener fecha +7 días
 */
export function obtenerFechaVencimiento7Dias(date: Date = new Date()): string {
  const vDate = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
  return formatearFecha(vDate);
}

/**
 * Genera número de correlativo oficial (ej. 2026-004812)
 */
export function generarCorrelativoOficial(prefixYear = 2026): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefixYear}-${randomNum}`;
}

/**
 * Dibuja la cabecera oficial corporativa con datos obligatorios de GRUPO MEVAC S.A.C.
 */
function drawOfficialHeader(
  doc: jsPDF,
  documentTitle: string,
  docNumber: string,
  fechaEmision: string,
  fechaVencimiento: string
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Barra superior Naranja Empresarial (#F07F00)
  doc.setFillColor(...COMPANY_DATA.colors.naranjaEmpresarial);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Razón Social y Nombre Comercial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.text(COMPANY_DATA.razonSocial, 14, 14);

  doc.setFontSize(10);
  doc.setTextColor(...COMPANY_DATA.colors.naranjaEmpresarial);
  doc.text(`Nombre comercial: ${COMPANY_DATA.nombreComercial}`, 14, 19);

  // RUC y Datos de Contacto
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`RUC: ${COMPANY_DATA.ruc}  •  Web: ${COMPANY_DATA.web}`, 14, 24);
  doc.text(`Sucursales: Lima y Cajamarca  •  Teléfonos: ${COMPANY_DATA.telefonos}`, 14, 28);
  doc.text(`Correos Oficiales: ${COMPANY_DATA.correos}`, 14, 32);

  // Recuadro Oficial de Cotización (Lado Derecho)
  const boxWidth = 68;
  const boxHeight = 24;
  const boxX = pageWidth - 14 - boxWidth;
  const boxY = 8;

  // Fondo del recuadro
  doc.setFillColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COMPANY_DATA.colors.blanco);
  doc.text(documentTitle.toUpperCase(), boxX + boxWidth / 2, boxY + 6, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(...COMPANY_DATA.colors.naranjaEmpresarial);
  doc.text(`N° ${docNumber}`, boxX + boxWidth / 2, boxY + 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COMPANY_DATA.colors.blanco);
  doc.text(`Emisión: ${fechaEmision}   |   Vence: ${fechaVencimiento}`, boxX + boxWidth / 2, boxY + 18, {
    align: 'center',
  });

  // Línea divisoria elegante
  doc.setDrawColor(...COMPANY_DATA.colors.naranjaEmpresarial);
  doc.setLineWidth(0.6);
  doc.line(14, 36, pageWidth - 14, 36);
}

/**
 * Dibuja el pie de página con políticas oficiales, cuentas bancarias y cierre
 */
function drawOfficialFooterAndTerms(doc: jsPDF, currentY: number, pageNum = 1, totalPages = 1) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = currentY;

  // 1. Sección "A TOMAR EN CUENTA:"
  doc.setFillColor(...COMPANY_DATA.colors.slateBg);
  doc.roundedRect(14, y, pageWidth - 28, 16, 1.5, 1.5, 'F');
  doc.setDrawColor(...COMPANY_DATA.colors.borderGrey);
  doc.roundedRect(14, y, pageWidth - 28, 16, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.text('A TOMAR EN CUENTA:', 17, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`1. ${COMPANY_DATA.politicas[0]}`, 17, y + 9);
  doc.text(`2. ${COMPANY_DATA.politicas[1]}`, 17, y + 13);

  y += 19;

  // 2. Sección Cuentas Bancarias y Detracciones
  doc.setFillColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.roundedRect(14, y, pageWidth - 28, 20, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COMPANY_DATA.colors.naranjaEmpresarial);
  doc.text(`CUENTAS CORRIENTES AUTORIZADAS (${COMPANY_DATA.cuentasBancarias.titular}):`, 17, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COMPANY_DATA.colors.blanco);
  doc.text(
    'SOLES: BCP: 245-9966172-0-49 (CCI 002-245-00996617204992) | BBVA: 0011-0248-0100034831 | SCOTIABANK: 000-4949476',
    17,
    y + 9
  );
  doc.text(
    'DÓLARES: BCP: 245-9964344-1-94 (CCI 002-245-00996434419494) | BBVA: 0011-0248-0100034874 | SCOTIABANK: 000-4949488',
    17,
    y + 13.5
  );
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COMPANY_DATA.colors.naranjaEmpresarial);
  doc.text(`DETRACCIONES BANCO DE LA NACIÓN: N° ${COMPANY_DATA.cuentasBancarias.detraccionesBN.cuenta}`, 17, y + 17.5);

  y += 23;

  // 3. Mensaje de Cierre Oficial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
  const splitCierre = doc.splitTextToSize(COMPANY_DATA.mensajeCierre, pageWidth - 28);
  doc.text(splitCierre, pageWidth / 2, y, { align: 'center' });

  // Pie de página con numeración
  doc.setDrawColor(...COMPANY_DATA.colors.borderGrey);
  doc.line(14, pageHeight - 8, pageWidth - 14, pageHeight - 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...COMPANY_DATA.colors.grisEmpresarial);
  doc.text(
    `Documento oficial generado para fines comerciales. ${COMPANY_DATA.razonSocial} - RUC: ${COMPANY_DATA.ruc}`,
    14,
    pageHeight - 5
  );
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 14, pageHeight - 5, { align: 'right' });
}

// --------------------------------------------------------------------------
// DOWNLOAD HELPER SEGURO PARA IFRAMES Y NAVEGADORES
// --------------------------------------------------------------------------
export function downloadPdfSafely(doc: jsPDF, fileName: string): string {
  try {
    doc.save(fileName);
  } catch (err) {
    console.warn('Fallo doc.save, usando fallback con Blob:', err);
  }

  try {
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch (blobErr) {
    console.error('Error en Blob fallback:', blobErr);
  }

  return fileName;
}

// --------------------------------------------------------------------------
// GENERADOR OFICIAL DE COTIZACIÓN COMERCIAL PDF (NORCELIS AUTOMOTRIZ)
// --------------------------------------------------------------------------
export function generateCommercialQuotePdf(quoteData: CommercialQuotationData): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  const fechaEmision = quoteData.fechaEmision || formatearFecha();
  const fechaVencimiento = quoteData.fechaVencimiento || obtenerFechaVencimiento7Dias();
  const docNumero = quoteData.numeroDocumento || generarCorrelativoOficial();

  drawOfficialHeader(doc, 'Cotización Comercial', docNumero, fechaEmision, fechaVencimiento);

  let y = 41;

  // 1. Recuadro de Datos del Cliente y del Documento
  doc.setFillColor(...COMPANY_DATA.colors.slateBg);
  doc.roundedRect(14, y, pageWidth - 28, 22, 1.5, 1.5, 'F');
  doc.setDrawColor(...COMPANY_DATA.colors.borderGrey);
  doc.roundedRect(14, y, pageWidth - 28, 22, 1.5, 1.5, 'S');

  // Columna Izquierda: Cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.text('DATOS DEL CLIENTE:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(`Nombre / R. Social: ${quoteData.cliente.nombreOrazonSocial}`, 18, y + 9.5);
  doc.text(`Dirección: ${quoteData.cliente.direccion || 'Cajamarca / Lima - Perú'}`, 18, y + 13.5);
  doc.text(
    `Teléfono: ${quoteData.cliente.telefono || 'N/A'}   •   Correo: ${quoteData.cliente.correo || 'N/A'}`,
    18,
    y + 17.5
  );

  // Columna Derecha: Documento, Placa, Asesor
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.text('DATOS DE LA OPERACIÓN:', 115, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(`Placa del Vehículo: ${quoteData.cliente.placaVehiculo || 'EN TRÁMITE / N/A'}`, 115, y + 9.5);
  doc.text(
    `Moneda: ${quoteData.moneda === 'USD' ? 'DÓLARES AMERICANOS (USD)' : 'SOLES (PEN)'}   •   Pago: ${
      quoteData.formaPago || 'Contado / Transferencia'
    }`,
    115,
    y + 13.5
  );
  doc.text(`Asesor Comercial: ${quoteData.asesorVentas || 'Asesor Oficial Norcelis'}`, 115, y + 17.5);

  y += 26;

  // 2. Tabla de Ítems (Columnas obligatorias en orden estricto)
  // ITEM | CODIGO | U. MED | CANT. | DESCRIPCION | PRECIO UNIT | DSCTO % | UNIT CON DSCTO | IMPORTE TOTAL
  const colX = {
    item: 14,
    codigo: 23,
    uMed: 44,
    cant: 56,
    desc: 68,
    pUnit: 122,
    dscto: 140,
    unitDscto: 156,
    total: 175,
  };

  const tableWidth = pageWidth - 28;

  // Encabezado de la tabla (Azul Empresarial)
  doc.setFillColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.rect(14, y, tableWidth, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COMPANY_DATA.colors.blanco);

  doc.text('ITEM', colX.item + 1, y + 4.5);
  doc.text('CODIGO', colX.codigo, y + 4.5);
  doc.text('U. MED', colX.uMed, y + 4.5);
  doc.text('CANT.', colX.cant, y + 4.5);
  doc.text('DESCRIPCION', colX.desc, y + 4.5);
  doc.text('P. UNIT', colX.pUnit, y + 4.5);
  doc.text('DSCTO %', colX.dscto, y + 4.5);
  doc.text('UNIT C/DSC', colX.unitDscto, y + 4.5);
  doc.text('IMPORTE TOT', colX.total, y + 4.5);

  y += 6.5;

  let totalGeneral = 0;
  let totalDescuentoValor = 0;
  const monedaSimbolo = quoteData.moneda === 'USD' ? '$' : 'S/';

  quoteData.items.forEach((item, index) => {
    // Cálculo exacto de UNIT CON DSCTO e IMPORTE TOTAL
    const pUnit = item.precioUnitario;
    const dsctoPct = item.descuentoPorcentaje || 0;
    const unitConDscto = Math.round(pUnit * (1 - dsctoPct / 100) * 100) / 100;
    const importeTotal = Math.round(item.cantidad * unitConDscto * 100) / 100;

    const ahorroFila = Math.round(item.cantidad * (pUnit - unitConDscto) * 100) / 100;
    totalDescuentoValor += ahorroFila;
    totalGeneral += importeTotal;

    const rowHeight = 7;

    // Fila cebra
    if (index % 2 === 1) {
      doc.setFillColor(...COMPANY_DATA.colors.slateBg);
      doc.rect(14, y, tableWidth, rowHeight, 'F');
    }

    doc.setDrawColor(...COMPANY_DATA.colors.borderGrey);
    doc.setLineWidth(0.2);
    doc.rect(14, y, tableWidth, rowHeight, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 41, 59);

    doc.text(String(item.itemNumber || index + 1), colX.item + 2.5, y + 4.5);
    doc.text((item.codigo || 'N/A').slice(0, 12), colX.codigo, y + 4.5);
    doc.text((item.unidadMedida || 'UND').slice(0, 6), colX.uMed, y + 4.5);
    doc.text(String(item.cantidad), colX.cant + 2, y + 4.5);

    // Descripción truncada limpia
    doc.setFont('helvetica', 'bold');
    doc.text(item.descripcion.slice(0, 36), colX.desc, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.text(`${monedaSimbolo} ${pUnit.toFixed(2)}`, colX.pUnit, y + 4.5);
    doc.text(`${dsctoPct}%`, colX.dscto + 2, y + 4.5);
    doc.text(`${monedaSimbolo} ${unitConDscto.toFixed(2)}`, colX.unitDscto, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
    doc.text(`${monedaSimbolo} ${importeTotal.toFixed(2)}`, colX.total, y + 4.5);

    y += rowHeight;
  });

  y += 4;

  // 3. Cálculos Financieros: OP. GRAVADA, DESCUENTO TOTAL, IGV (18%), IMPORTE TOTAL
  const opGravada = Math.round((totalGeneral / 1.18) * 100) / 100;
  const igv18 = Math.round((totalGeneral - opGravada) * 100) / 100;

  // Recuadro de Cifra en Letras (Lado Izquierdo)
  const textoLetras = numeroALetras(totalGeneral, quoteData.moneda);
  doc.setFillColor(...COMPANY_DATA.colors.slateBg);
  doc.roundedRect(14, y, 105, 24, 1.5, 1.5, 'F');
  doc.setDrawColor(...COMPANY_DATA.colors.borderGrey);
  doc.roundedRect(14, y, 105, 24, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.text('IMPORTE EN LETRAS OBLIGATORIO:', 17, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...COMPANY_DATA.colors.naranjaEmpresarial);
  const splitLetras = doc.splitTextToSize(textoLetras, 99);
  doc.text(splitLetras, 17, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('Comprobante emitido según normativa tributaria SUNAT vigente.', 17, y + 20);

  // Recuadro de Totales (Lado Derecho)
  const totalsBoxX = 124;
  const totalsBoxW = pageWidth - 14 - totalsBoxX;

  doc.setDrawColor(...COMPANY_DATA.colors.borderGrey);
  doc.rect(totalsBoxX, y, totalsBoxW, 24, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);

  doc.text('OP. GRAVADA:', totalsBoxX + 3, y + 5.5);
  doc.text(`${monedaSimbolo} ${opGravada.toFixed(2)}`, pageWidth - 17, y + 5.5, { align: 'right' });

  doc.text('DSCTO TOTAL:', totalsBoxX + 3, y + 10);
  doc.text(`${monedaSimbolo} ${totalDescuentoValor.toFixed(2)}`, pageWidth - 17, y + 10, { align: 'right' });

  doc.text('I.G.V. (18%):', totalsBoxX + 3, y + 14.5);
  doc.text(`${monedaSimbolo} ${igv18.toFixed(2)}`, pageWidth - 17, y + 14.5, { align: 'right' });

  // IMPORTE TOTAL DESTACADO
  doc.setFillColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.rect(totalsBoxX, y + 16.5, totalsBoxW, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COMPANY_DATA.colors.blanco);
  doc.text('IMPORTE TOTAL:', totalsBoxX + 3, y + 21.5);

  doc.setTextColor(...COMPANY_DATA.colors.naranjaEmpresarial);
  doc.text(`${monedaSimbolo} ${totalGeneral.toFixed(2)}`, pageWidth - 17, y + 21.5, { align: 'right' });

  y += 28;

  // 4. Términos, Políticas, Cuentas Bancarias y Cierre
  drawOfficialFooterAndTerms(doc, y, 1, 1);

  const fileName = `Cotizacion_Comercial_${COMPANY_DATA.nombreComercial}_${docNumero}.pdf`;
  downloadPdfSafely(doc, fileName);
  return fileName;
}

// --------------------------------------------------------------------------
// COTIZACIÓN FORMAL DE VEHÍCULO NUEVO / SEMINUEVO
// --------------------------------------------------------------------------
export function generateVehicleQuotePdf(vehicle: Vehicle, selectedColorName = 'Blanco Perlado Premium'): string {
  const correlativo = generarCorrelativoOficial();
  const fechaEmision = formatearFecha();
  const fechaVencimiento = obtenerFechaVencimiento7Dias();

  const precioUnit = vehicle.priceSoles;
  const dsctoPct = vehicle.oldPriceSoles && vehicle.oldPriceSoles > vehicle.priceSoles
    ? Math.round(((vehicle.oldPriceSoles - vehicle.priceSoles) / vehicle.oldPriceSoles) * 100)
    : 0;

  const quoteData: CommercialQuotationData = {
    numeroDocumento: correlativo,
    cliente: {
      nombreOrazonSocial: 'Cliente Comercial Norcelis',
      direccion: 'Cajamarca / Lima - Perú',
      telefono: COMPANY_DATA.telefonos,
      correo: 'ventas1@norcelis.com',
      placaVehiculo: vehicle.condition === 'nuevo' ? '0 KM POR ASIGNAR' : 'CERTIFICADA',
    },
    fechaEmision,
    fechaVencimiento,
    moneda: 'PEN',
    formaPago: 'Contado / Crédito Bancario',
    asesorVentas: 'Marco Valdivia Córdova - Asesor Comercial',
    items: [
      {
        itemNumber: 1,
        codigo: vehicle.id.toUpperCase(),
        unidadMedida: 'UND',
        cantidad: 1,
        descripcion: `${vehicle.brand.toUpperCase()} ${vehicle.name.toUpperCase()} (${selectedColorName})`,
        precioUnitario: vehicle.oldPriceSoles || precioUnit,
        descuentoPorcentaje: dsctoPct,
        unitarioConDescuento: precioUnit,
        importeTotal: precioUnit,
      },
    ],
  };

  return generateCommercialQuotePdf(quoteData);
}

// --------------------------------------------------------------------------
// PROFORMA DE CARRITO / WISHLIST DE REPUESTOS
// --------------------------------------------------------------------------
export function generateWishlistQuotePdf(
  items: WishlistItem[],
  customerName = 'Juan Carlos Mendoza',
  customerPlate = 'ABC-123'
): string {
  const correlativo = generarCorrelativoOficial();
  const fechaEmision = formatearFecha();
  const fechaVencimiento = obtenerFechaVencimiento7Dias();

  const formattedItems: QuotationItem[] = items.map((item, idx) => {
    const pUnit = item.priceSoles;
    const dscto = 0;
    const unitConDscto = pUnit;
    const cant = item.quantity || 1;
    const tot = cant * unitConDscto;

    return {
      itemNumber: idx + 1,
      codigo: item.sku || `REP-${item.id.slice(0, 6).toUpperCase()}`,
      unidadMedida: 'UND',
      cantidad: cant,
      descripcion: item.title,
      precioUnitario: pUnit,
      descuentoPorcentaje: dscto,
      unitarioConDescuento: unitConDscto,
      importeTotal: tot,
    };
  });

  const quoteData: CommercialQuotationData = {
    numeroDocumento: correlativo,
    cliente: {
      nombreOrazonSocial: customerName,
      direccion: 'Cajamarca / Lima - Perú',
      telefono: '965171717',
      correo: 'ventas1@norcelis.com',
      placaVehiculo: customerPlate,
    },
    fechaEmision,
    fechaVencimiento,
    moneda: 'PEN',
    formaPago: 'Transferencia Bancaria / Yape / Plin',
    asesorVentas: 'Asesor Especialista en Autopartes',
    items: formattedItems,
  };

  return generateCommercialQuotePdf(quoteData);
}

// --------------------------------------------------------------------------
// SIMULACIÓN DE CRÉDITO VEHICULAR PDF
// --------------------------------------------------------------------------
export function generateFinancingSimulationPdf(params: FinancingPdfParams): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const docNumber = generarCorrelativoOficial();
  const fechaEmision = formatearFecha();
  const fechaVencimiento = obtenerFechaVencimiento7Dias();

  drawOfficialHeader(doc, 'Simulación de Crédito', docNumber, fechaEmision, fechaVencimiento);

  let y = 42;

  // Resumen del Vehículo y Entidad
  doc.setFillColor(...COMPANY_DATA.colors.slateBg);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 20, 1.5, 1.5, 'F');
  doc.setDrawColor(...COMPANY_DATA.colors.borderGrey);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 20, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.text(`VEHÍCULO: ${params.vehicleName} (${params.vehicleYear})`, 18, y + 6);
  doc.text(`BANCO: ${params.bankName.toUpperCase()}   •   TASA TEA: ${params.teaPercent}%`, 18, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Precio: S/ ${params.vehiclePriceSoles.toLocaleString()}  •  Inicial: S/ ${params.downPaymentSoles.toLocaleString()} (${params.downPaymentPercent}%)  •  Saldo: S/ ${params.loanAmountSoles.toLocaleString()}`, 18, y + 17);

  y += 25;

  // Cuota mensual destacada
  doc.setFillColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 14, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COMPANY_DATA.colors.blanco);
  doc.text(`CUOTA MENSUAL ESTIMADA (${params.loanTermMonths} MESES):`, 18, y + 9);
  doc.setFontSize(13);
  doc.setTextColor(...COMPANY_DATA.colors.naranjaEmpresarial);
  doc.text(`S/ ${params.monthlyPaymentSoles.toLocaleString()}`, doc.internal.pageSize.getWidth() - 20, y + 9.5, { align: 'right' });

  y += 20;

  // Cifra en letras de la cuota
  const letrasCuota = numeroALetras(params.monthlyPaymentSoles, 'PEN');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.text(letrasCuota, 14, y);

  y += 10;

  drawOfficialFooterAndTerms(doc, y, 1, 1);

  const fileName = `Simulacion_Credito_${params.bankName}_${docNumber}.pdf`;
  downloadPdfSafely(doc, fileName);
  return fileName;
}

// --------------------------------------------------------------------------
// CERTIFICADO DE MANTENIMIENTO TALLER PDF
// --------------------------------------------------------------------------
export function generateMaintenanceCertificatePdf(
  record: MaintenanceRecord,
  vehicle?: ActiveGarageVehicle
): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const docNumber = generarCorrelativoOficial();
  const fechaEmision = formatearFecha();
  const fechaVencimiento = obtenerFechaVencimiento7Dias();

  drawOfficialHeader(doc, 'Certificado de Servicio', docNumber, fechaEmision, fechaVencimiento);

  let y = 42;

  // Detalles del servicio
  doc.setFillColor(...COMPANY_DATA.colors.slateBg);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 30, 1.5, 1.5, 'F');
  doc.setDrawColor(...COMPANY_DATA.colors.borderGrey);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 30, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.text(`SERVICIO: ${record.serviceType.toUpperCase()}`, 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Vehículo: ${vehicle?.brand || 'Toyota'} ${vehicle?.model || 'RAV4'}   •   Placa: ${record.vehiclePlate}`, 18, y + 13);
  doc.text(`Kilometraje Registrado: ${record.mileage.toLocaleString()} KM   •   Taller: ${record.workshop || 'Sede Cajamarca'}`, 18, y + 18);
  doc.text(`Técnico Responsable: ${record.technician}   •   Garantía: ${record.warrantyCertified ? 'Certificada 6 Meses o 10,000 km' : 'Garantía Estándar'}`, 18, y + 23);

  y += 36;

  // Resumen Financiero
  doc.setFillColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.roundedRect(14, y, doc.internal.pageSize.getWidth() - 28, 12, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COMPANY_DATA.colors.blanco);
  doc.text('TOTAL DE LA ORDEN DE SERVICIO (INC. IGV):', 18, y + 8);
  doc.setFontSize(11);
  doc.setTextColor(...COMPANY_DATA.colors.naranjaEmpresarial);
  doc.text(`S/ ${record.costSoles.toFixed(2)}`, doc.internal.pageSize.getWidth() - 20, y + 8, { align: 'right' });

  y += 18;

  const letrasCosto = numeroALetras(record.costSoles, 'PEN');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COMPANY_DATA.colors.azulEmpresarial);
  doc.text(letrasCosto, 14, y);

  y += 10;

  drawOfficialFooterAndTerms(doc, y, 1, 1);

  const fileName = `Certificado_Mantenimiento_${record.vehiclePlate}_${docNumber}.pdf`;
  downloadPdfSafely(doc, fileName);
  return fileName;
}
