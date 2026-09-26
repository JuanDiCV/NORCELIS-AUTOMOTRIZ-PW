/**
 * Nor Celis Automotriz - Official PDF Document Generator
 * Generates high-fidelity, printable PDF documents with official letterhead,
 * itemized tables, financial schedules, and warranty certificates.
 */

import { jsPDF } from 'jspdf';
import { Vehicle, WishlistItem, ActiveGarageVehicle, MaintenanceRecord } from '../types';

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

const BRAND = {
  name: 'NOR CELIS AUTOMOTRIZ S.A.C.',
  ruc: 'R.U.C. 20608754129',
  address: 'Av. Vía de Evitamiento Sur 6003, Cajamarca - Perú',
  phone: 'Central: (076) 364-890 / WhatsApp: +51 987 654 321',
  email: 'ventas@norcelis.pe / atencion@norcelis.pe',
  web: 'www.norcelis.pe',
  primaryColor: [12, 25, 56], // #0c1938
  secondaryColor: [29, 78, 216], // #1d4ed8
  slateDark: [30, 41, 59], // #1e293b
  slateLight: [241, 245, 249], // #f1f5f9
  borderGrey: [203, 213, 225], // #cbd5e1
};

/**
 * Draws the official Nor Celis letterhead at the top of a page.
 */
function drawLetterhead(doc: jsPDF, documentTitle: string, docNumber: string) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top color bar
  doc.setFillColor(BRAND.secondaryColor[0], BRAND.secondaryColor[1], BRAND.secondaryColor[2]);
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text('NOR CELIS AUTOMOTRIZ', 14, 18);

  // Slogan & RUC
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CONCESIONARIO OFICIAL & TALLER ESPECIALIZADO MULTIMARCA', 14, 23);
  doc.text(`${BRAND.ruc} • ${BRAND.address}`, 14, 28);
  doc.text(`${BRAND.phone} • ${BRAND.web}`, 14, 33);

  // Document Tag Box (Right)
  doc.setFillColor(BRAND.slateLight[0], BRAND.slateLight[1], BRAND.slateLight[2]);
  doc.roundedRect(pageWidth - 75, 10, 61, 25, 2, 2, 'F');
  doc.setDrawColor(BRAND.borderGrey[0], BRAND.borderGrey[1], BRAND.borderGrey[2]);
  doc.roundedRect(pageWidth - 75, 10, 61, 25, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(BRAND.secondaryColor[0], BRAND.secondaryColor[1], BRAND.secondaryColor[2]);
  doc.text(documentTitle.toUpperCase(), pageWidth - 45, 17, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`N°: ${docNumber}`, pageWidth - 45, 23, { align: 'center' });
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 45, 29, { align: 'center' });

  // Divider line
  doc.setDrawColor(BRAND.borderGrey[0], BRAND.borderGrey[1], BRAND.borderGrey[2]);
  doc.setLineWidth(0.5);
  doc.line(14, 38, pageWidth - 14, 38);
}

/**
 * Draws footer on document
 */
function drawFooter(doc: jsPDF, pageNum = 1, totalPages = 1) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(BRAND.borderGrey[0], BRAND.borderGrey[1], BRAND.borderGrey[2]);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Documento oficial emitido por Nor Celis Automotriz S.A.C. Válido por 15 días calendario.', 14, pageHeight - 10);
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
}

// --------------------------------------------------------------------------
// DOWNLOAD HELPER (Iframe & Safari resilient)
// --------------------------------------------------------------------------
export function downloadPdfSafely(doc: jsPDF, fileName: string): string {
  try {
    // 1. Try native jsPDF save
    doc.save(fileName);
  } catch (err) {
    console.warn('doc.save encountered an issue, trying Blob download fallback:', err);
  }

  try {
    // 2. Direct Blob anchor trigger (reliable inside iframes / sandboxes)
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
    console.error('Blob download fallback error:', blobErr);
  }

  return fileName;
}

export function getPdfBlob(doc: jsPDF): Blob {
  return doc.output('blob');
}

// --------------------------------------------------------------------------
// 1. VEHICLE FORMAL QUOTATION PDF (Cotización de Vehículo)
// --------------------------------------------------------------------------
export function generateVehicleQuotePdf(vehicle: Vehicle, selectedColorName = 'Blanco Perlado Premium') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const quoteCode = `COT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  drawLetterhead(doc, 'Cotización Oficial', quoteCode);

  let y = 46;

  // Customer & Advisor Box
  doc.setFillColor(BRAND.slateLight[0], BRAND.slateLight[1], BRAND.slateLight[2]);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text('DATOS DEL CLIENTE', 18, y + 6);
  doc.text('ASESOR COMERCIAL ASIGNADO', 110, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Cliente: Juan Carlos Mendoza', 18, y + 11);
  doc.text('DNI / RUC: 45892147', 18, y + 16);
  doc.text('Asesor: Lic. Marco Valdivia C.', 110, y + 11);
  doc.text('Canal: Concesionario Sede Cajamarca', 110, y + 16);

  y += 28;

  // Vehicle Details Card Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text('VEHÍCULO COTIZADO', 14, y);

  y += 5;

  // Table Header
  doc.setFillColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPCIÓN', 18, y + 4.8);
  doc.text('AÑO', 115, y + 4.8);
  doc.text('CONDICIÓN', 135, y + 4.8);
  doc.text('PRECIO OFICIAL', 170, y + 4.8);

  y += 7;

  // Vehicle Row
  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 14, 'F');
  doc.setDrawColor(BRAND.borderGrey[0], BRAND.borderGrey[1], BRAND.borderGrey[2]);
  doc.rect(14, y, 182, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(vehicle.name, 18, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Color: ${selectedColorName} • ${vehicle.subtitle}`, 18, y + 10);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${vehicle.year}`, 115, y + 7.5);
  doc.text(vehicle.condition === 'nuevo' ? '0 KM Nuevo' : 'Seminuevo Cert.', 135, y + 7.5);

  doc.setFont('helvetica', 'bold');
  doc.text(`S/ ${vehicle.priceSoles.toLocaleString()}`, 165, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`($ ${vehicle.priceUsd.toLocaleString()} USD)`, 165, y + 10.5);

  y += 20;

  // Technical Specs Grid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text('FICHA TÉCNICA Y ESPECIFICACIONES HOMOLOGADAS', 14, y);

  y += 5;
  const specs = [
    ['Motor:', vehicle.specs.engine || '2.5L Dynamic Force Hybrid'],
    ['Transmisión:', vehicle.specs.transmission || 'Automática E-CVT'],
    ['Tracción:', vehicle.specs.traction || 'e-Four AWD Inteligente'],
    ['Potencia / Torque:', `${vehicle.specs.power || '219 HP'} / 221 Nm`],
    ['Combustible:', vehicle.fuelType],
    ['Consumo Homologado:', vehicle.specs.consumption || '72 km/gal'],
    ['Carrocería:', vehicle.bodyType],
    ['Garantía Oficial:', vehicle.warranty || '5 Años o 100,000 km'],
  ];

  doc.setFillColor(BRAND.slateLight[0], BRAND.slateLight[1], BRAND.slateLight[2]);
  doc.roundedRect(14, y, 182, 34, 2, 2, 'F');

  let specY = y + 6;
  for (let i = 0; i < specs.length; i += 2) {
    const s1 = specs[i];
    const s2 = specs[i + 1];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(s1[0], 18, specY);
    doc.setFont('helvetica', 'normal');
    doc.text(s1[1], 52, specY);

    if (s2) {
      doc.setFont('helvetica', 'bold');
      doc.text(s2[0], 108, specY);
      doc.setFont('helvetica', 'normal');
      doc.text(s2[1], 142, specY);
    }
    specY += 7;
  }

  y += 42;

  // Pricing & Commercial Bonus Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text('RESUMEN COMERCIAL & CONDICIONES DE RESERVA', 14, y);

  y += 5;
  doc.setDrawColor(BRAND.borderGrey[0], BRAND.borderGrey[1], BRAND.borderGrey[2]);
  doc.rect(14, y, 182, 32, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Precio de Lista:', 20, y + 7);
  doc.text(`S/ ${(vehicle.oldPriceSoles || vehicle.priceSoles + 5000).toLocaleString()}`, 80, y + 7);

  doc.text('Bono de Descuento Exclusivo Concesionario:', 20, y + 13);
  doc.setTextColor(22, 101, 52); // green
  doc.text(`- S/ ${vehicle.discountBonus || '5,000'}`, 80, y + 13);

  doc.setTextColor(71, 85, 105);
  doc.text('Monto de Reserva para Inmovilizar Chasis (48h):', 20, y + 19);
  doc.text('S/ 1,850 (~$500 USD) - 100% Reembolsable', 80, y + 19);

  doc.text('Cuota Mensual Estimada (48 meses / 20% inicial):', 20, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BRAND.secondaryColor[0], BRAND.secondaryColor[1], BRAND.secondaryColor[2]);
  doc.text(`S/ ${vehicle.monthlySoles?.toLocaleString() || '1,460'} / mes`, 80, y + 25);

  // Total Final Highlight Box (Right)
  doc.setFillColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.rect(125, y, 71, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('PRECIO FINAL AL CONTADO', 160, y + 9, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`S/ ${vehicle.priceSoles.toLocaleString()}`, 160, y + 18, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`USD $ ${vehicle.priceUsd.toLocaleString()}`, 160, y + 25, { align: 'center' });

  y += 40;

  // Commercial Notes & Official Bank Accounts & Seal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text('A TOMAR EN CUENTA:', 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('• La presente cotización tiene validez por 7 días, los productos tienen un stock limitado.', 14, y + 4);
  doc.text('• Los precios pueden variar según diagnóstico final del vehículo o disponibilidad de repuestos al momento de confirmación.', 14, y + 8);
  doc.text('• Gracias por confiar en NORCELIS AUTOMOTRIZ especialistas en autopartes, accesorios y servicios automotrices.', 14, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(BRAND.secondaryColor[0], BRAND.secondaryColor[1], BRAND.secondaryColor[2]);
  doc.text('CUENTAS CORRIENTES OFICIALES (NOR CELIS AUTOMOTRIZ S.A.C. - RUC 20608754129):', 14, y + 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Soles: BCP 245-9966172-0-49 (CCI 002-245-00996617204992) • BBVA 0011-0248-0100034831 • Scotiabank 000-4949476', 14, y + 21);
  doc.text('Dólares: BCP 245-9964344-1-94 (CCI 002-245-00996434419494) • BBVA 0011-0248-0100034874 | Detracciones BN: 00-772-001053', 14, y + 25);

  // Stamped Signature Box
  doc.setDrawColor(BRAND.borderGrey[0], BRAND.borderGrey[1], BRAND.borderGrey[2]);
  doc.rect(pageWidth - 65, y, 51, 26, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text('NOR CELIS AUTOMOTRIZ S.A.C.', pageWidth - 39.5, y + 13, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('GERENCIA COMERCIAL & VENTAS', pageWidth - 39.5, y + 17, { align: 'center' });
  doc.text('Firma y Sello Autorizado', pageWidth - 39.5, y + 21, { align: 'center' });

  drawFooter(doc, 1, 1);

  // Save document
  const fileName = `Cotizacion_NorCelis_${vehicle.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  downloadPdfSafely(doc, fileName);
  return fileName;
}

// --------------------------------------------------------------------------
// 2. VEHICLE FINANCING SIMULATION & AMORTIZATION PDF
// --------------------------------------------------------------------------
export function generateFinancingSimulationPdf(params: FinancingPdfParams) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const simCode = `FIN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  drawLetterhead(doc, 'Simulación Crédito', simCode);

  let y = 46;

  // Vehicle & Credit Summary Card
  doc.setFillColor(BRAND.slateLight[0], BRAND.slateLight[1], BRAND.slateLight[2]);
  doc.roundedRect(14, y, 182, 38, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text(`VEHÍCULO: ${params.vehicleName} (${params.vehicleYear})`, 20, y + 7);
  doc.text(`ENTIDAD FINANCIERA: ${params.bankName.toUpperCase()}`, 110, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Precio de Lista Oficial: S/ ${params.vehiclePriceSoles.toLocaleString()} ($ ${params.vehiclePriceUsd.toLocaleString()} USD)`, 20, y + 14);
  doc.text(`Cuota Inicial (${params.downPaymentPercent}%): S/ ${params.downPaymentSoles.toLocaleString()}`, 20, y + 20);
  doc.text(`Monto a Financiar (Capital): S/ ${params.loanAmountSoles.toLocaleString()}`, 20, y + 26);
  doc.text(`Plazo Solicitado: ${params.loanTermMonths} Meses (${params.loanTermMonths / 12} Años)`, 20, y + 32);

  doc.text(`Tasa Efectiva Anual (TEA): ${params.teaPercent.toFixed(2)}%`, 110, y + 14);
  doc.text(`Moneda del Crédito: Soles (PEN)`, 110, y + 20);
  doc.text(`Seguro de Desgravamen: Incluido en cuota`, 110, y + 26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BRAND.secondaryColor[0], BRAND.secondaryColor[1], BRAND.secondaryColor[2]);
  doc.text(`CUOTA MENSUAL ESTIMADA: S/ ${params.monthlyPaymentSoles.toLocaleString()}`, 110, y + 33);

  y += 45;

  // Amortization Schedule Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text(`CRONOGRAMA DE AMORTIZACIÓN PROYECTADO (${params.loanTermMonths} CUOTAS)`, 14, y);

  y += 5;
  doc.setFillColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.rect(14, y, 182, 6.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('N°', 18, y + 4.5);
  doc.text('SALDO INICIAL', 32, y + 4.5);
  doc.text('CAPITAL', 68, y + 4.5);
  doc.text('INTERÉS', 98, y + 4.5);
  doc.text('DESGRAVAMEN', 126, y + 4.5);
  doc.text('CUOTA TOTAL', 155, y + 4.5);
  doc.text('SALDO FINAL', 178, y + 4.5);

  y += 6.5;

  // Generate or use amortization rows (display first 16 payments)
  const rows = params.amortizationRows || [];
  const rowsToDisplay = rows.length > 0 ? rows.slice(0, 16) : generateMockAmortizationRows(params, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  rowsToDisplay.forEach((r, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 5.5, 'F');
    }
    doc.setTextColor(51, 65, 85);
    doc.text(`${r.month}`, 18, y + 4);
    doc.text(`S/ ${r.initialBalance.toLocaleString()}`, 32, y + 4);
    doc.text(`S/ ${r.principal.toLocaleString()}`, 68, y + 4);
    doc.text(`S/ ${r.interest.toLocaleString()}`, 98, y + 4);
    doc.text(`S/ ${r.insurance.toLocaleString()}`, 126, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND.secondaryColor[0], BRAND.secondaryColor[1], BRAND.secondaryColor[2]);
    doc.text(`S/ ${r.totalPayment.toLocaleString()}`, 155, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`S/ ${r.endingBalance.toLocaleString()}`, 178, y + 4);

    y += 5.5;
  });

  if (params.loanTermMonths > 16) {
    doc.setFillColor(BRAND.slateLight[0], BRAND.slateLight[1], BRAND.slateLight[2]);
    doc.rect(14, y, 182, 5, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`... y ${params.loanTermMonths - 16} cuotas sucesivas idénticas hasta la cancelación total del crédito.`, 18, y + 3.5);
    y += 8;
  }

  y += 5;

  // Regulatory Disclaimer Box
  doc.setFillColor(254, 243, 199); // amber 100
  doc.roundedRect(14, y, 182, 16, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(14, y, 182, 16, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text('NOTA IMPORTANTE DE REGULACIÓN SBS:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text('La presente simulación es informativa y referencial. La aprobación final del crédito, tasa TEA definitiva y condiciones accesorias están sujetas a evaluación crediticia por parte de la entidad financiera elegida, de acuerdo con la política de riesgos y sustento de ingresos del cliente.', 18, y + 9, { maxWidth: 174 });

  drawFooter(doc, 1, 1);

  const fileName = `Cronograma_Credito_${params.bankName.replace(/\s+/g, '_')}_${params.vehicleName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  downloadPdfSafely(doc, fileName);
  return fileName;
}

// Helper to project realistic mock amortization rows
function generateMockAmortizationRows(p: FinancingPdfParams, count: number) {
  const list = [];
  let balance = p.loanAmountSoles;
  const monthlyRate = (p.teaPercent / 100) / 12;
  const monthlyPayment = p.monthlyPaymentSoles;

  for (let m = 1; m <= count && m <= p.loanTermMonths; m++) {
    const interest = Math.round(balance * monthlyRate);
    const insurance = Math.round(balance * 0.00065); // 0.065% desgravamen
    const principal = Math.max(0, monthlyPayment - interest - insurance);
    const ending = Math.max(0, balance - principal);

    list.push({
      month: m,
      initialBalance: balance,
      principal,
      interest,
      insurance,
      totalPayment: monthlyPayment,
      endingBalance: ending,
    });
    balance = ending;
  }
  return list;
}

// --------------------------------------------------------------------------
// 3. WISHLIST / SHOPPING CART FORMAL PROFORMA PDF
// --------------------------------------------------------------------------
export function generateWishlistQuotePdf(items: WishlistItem[], customerName = 'Juan Carlos Mendoza') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const code = `PRO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  drawLetterhead(doc, 'Proforma Comercial', code);

  let y = 46;

  // Customer Box
  doc.setFillColor(BRAND.slateLight[0], BRAND.slateLight[1], BRAND.slateLight[2]);
  doc.roundedRect(14, y, 182, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text('CLIENTE:', 18, y + 6);
  doc.text('CANAL:', 110, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`${customerName} (contacto@norcelis.pe)`, 35, y + 6);
  doc.text('Web Nor Celis / Carrito & Lista de Deseos', 125, y + 6);

  doc.text('CONDICIONES: Precios incluyen I.G.V. (18%) • Despacho Nacional 24/48h', 18, y + 12);

  y += 22;

  // Table
  doc.setFillColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('ITEM', 18, y + 5);
  doc.text('DESCRIPCIÓN DEL REPUESTO / VEHÍCULO', 32, y + 5);
  doc.text('SKU / CÓDIGO', 125, y + 5);
  doc.text('CANT.', 155, y + 5);
  doc.text('TOTAL PEN', 172, y + 5);

  y += 7;

  let totalSoles = 0;

  items.forEach((item, idx) => {
    const rowTotal = item.priceSoles * (item.quantity || 1);
    totalSoles += rowTotal;

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 11, 'F');
    }
    doc.setDrawColor(BRAND.borderGrey[0], BRAND.borderGrey[1], BRAND.borderGrey[2]);
    doc.rect(14, y, 182, 11, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`${idx + 1}`, 18, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.text(item.title.slice(0, 52), 32, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.subtitle ? item.subtitle.slice(0, 60) : 'Repuesto / Accesorio Oficial Garantizado', 32, y + 9);

    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(item.sku || 'N/A', 125, y + 6.5);
    doc.text(`${item.quantity || 1}`, 158, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
    doc.text(`S/ ${rowTotal.toLocaleString()}`, 172, y + 6.5);

    y += 11;
  });

  y += 5;

  // Subtotal, IGV and Total Box
  doc.setDrawColor(BRAND.borderGrey[0], BRAND.borderGrey[1], BRAND.borderGrey[2]);
  doc.rect(pageWidth - 85, y, 71, 24, 'S');

  const subtotal = Math.round((totalSoles / 1.18) * 100) / 100;
  const igv = Math.round((totalSoles - subtotal) * 100) / 100;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', pageWidth - 80, y + 6);
  doc.text(`S/ ${subtotal.toLocaleString()}`, pageWidth - 20, y + 6, { align: 'right' });

  doc.text('I.G.V. (18%):', pageWidth - 80, y + 12);
  doc.text(`S/ ${igv.toLocaleString()}`, pageWidth - 20, y + 12, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BRAND.secondaryColor[0], BRAND.secondaryColor[1], BRAND.secondaryColor[2]);
  doc.text('TOTAL A PAGAR:', pageWidth - 80, y + 19);
  doc.text(`S/ ${totalSoles.toLocaleString()}`, pageWidth - 20, y + 19, { align: 'right' });

  y += 28;

  // Notes & Official Accounts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text('A TOMAR EN CUENTA:', 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('• La presente cotización tiene validez por 7 días, los productos tienen un stock limitado.', 14, y + 4);
  doc.text('• Los precios pueden variar según diagnóstico final del vehículo o disponibilidad de repuestos al momento de la confirmación.', 14, y + 8);
  doc.text('• Gracias por confiar en NORCELIS AUTOMOTRIZ especialistas en autopartes, accesorios y servicios automotrices.', 14, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(BRAND.secondaryColor[0], BRAND.secondaryColor[1], BRAND.secondaryColor[2]);
  doc.text('CUENTAS CORRIENTES OFICIALES (NOR CELIS AUTOMOTRIZ S.A.C. - RUC 20608754129):', 14, y + 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Soles: BCP 245-9966172-0-49 (CCI 002-245-00996617204992) • BBVA 0011-0248-0100034831 • Scotiabank 000-4949476', 14, y + 21);
  doc.text('Dólares: BCP 245-9964344-1-94 (CCI 002-245-00996434419494) • BBVA 0011-0248-0100034874 | Detracciones BN: 00-772-001053', 14, y + 25);

  drawFooter(doc, 1, 1);

  const fileName = `Cotizacion_Repuestos_NorCelis_${code}.pdf`;
  downloadPdfSafely(doc, fileName);
  return fileName;
}

// --------------------------------------------------------------------------
// 4. MAINTENANCE CERTIFICATE & WORK ORDER PDF
// --------------------------------------------------------------------------
export function generateMaintenanceCertificatePdf(record: MaintenanceRecord, vehicle?: ActiveGarageVehicle) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const code = `CERT-${record.id}`;

  drawLetterhead(doc, 'Certificado Oficial', code);

  let y = 48;

  // Official Certificate Banner
  doc.setFillColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('CERTIFICADO OFICIAL DE MANTENIMIENTO PREVENTIVO', 105, y + 8, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text('Garantía Oficial de Mano de Obra y Repuestos OEM Nor Celis Automotriz', 105, y + 14, { align: 'center' });

  y += 24;

  // Vehicle Information
  doc.setFillColor(BRAND.slateLight[0], BRAND.slateLight[1], BRAND.slateLight[2]);
  doc.roundedRect(14, y, 182, 26, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text('DATOS DEL VEHÍCULO CERTIFICADO', 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Vehículo: ${vehicle?.brand || 'Toyota'} ${vehicle?.model || 'RAV4 Hybrid'} (${vehicle?.year || 2025})`, 20, y + 12);
  doc.text(`Placa de Rodaje: ${record.vehiclePlate || 'ABC-123'}`, 20, y + 18);
  doc.text(`Kilometraje Registrado: ${record.mileage.toLocaleString()} km`, 20, y + 23);

  doc.text(`Fecha del Servicio: ${record.date}`, 110, y + 12);
  doc.text(`Técnico Responsable: ${record.technician}`, 110, y + 18);
  doc.text(`Sede: Taller Oficial Cajamarca (Av. Vía Evitamiento Sur 6003)`, 110, y + 23);

  y += 32;

  // Work Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(BRAND.primaryColor[0], BRAND.primaryColor[1], BRAND.primaryColor[2]);
  doc.text(`LABORES REALIZADAS EN SERVICIO: ${record.serviceType.toUpperCase()}`, 14, y);

  y += 5;
  record.workSummary.forEach((work) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(BRAND.borderGrey[0], BRAND.borderGrey[1], BRAND.borderGrey[2]);
    doc.rect(14, y, 182, 8, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52); // green check
    doc.text('✓', 18, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(work, 25, y + 5.5);

    y += 8;
  });

  y += 8;

  // Stamped Warranty Validation Box
  doc.setFillColor(240, 253, 244); // green 50
  doc.roundedRect(14, y, 182, 24, 2, 2, 'F');
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(14, y, 182, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61);
  doc.text('VALIDEZ DE GARANTÍA NOR CELIS AUTOMOTRIZ', 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Este certificado acredita que el mantenimiento se ejecutó conforme a los estándares de fábrica con fluidos y repuestos 100% genuinos. La garantía de mano de obra cubre 6 meses o 10,000 km adicionales.', 18, y + 13, { maxWidth: 172 });

  drawFooter(doc, 1, 1);

  const fileName = `Certificado_Mantenimiento_${record.vehiclePlate}_${code}.pdf`;
  downloadPdfSafely(doc, fileName);
  return fileName;
}
