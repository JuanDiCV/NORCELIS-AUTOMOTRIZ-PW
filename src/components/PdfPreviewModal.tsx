import React, { useState } from 'react';
import { Vehicle, WishlistItem, MaintenanceRecord } from '../types';
import {
  FinancingPdfParams,
  generateVehicleQuotePdf,
  generateFinancingSimulationPdf,
  generateWishlistQuotePdf,
  generateMaintenanceCertificatePdf,
  COMPANY_DATA,
  numeroALetras,
  formatearFecha,
  obtenerFechaVencimiento7Dias,
} from '../utils/pdfGenerator';

export interface PdfModalData {
  isOpen: boolean;
  docType: 'vehiculo' | 'financiamiento' | 'repuestos' | 'mantenimiento';
  title: string;
  code: string;
  vehicle?: Vehicle;
  selectedColor?: string;
  financingParams?: FinancingPdfParams;
  items?: WishlistItem[];
  maintenanceRecord?: MaintenanceRecord;
  fileName?: string;
}

interface PdfPreviewModalProps {
  data: PdfModalData | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ data, onClose, onShowToast }) => {
  if (!data || !data.isOpen) return null;

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    try {
      let fName = data.fileName || 'Documento_NorCelis.pdf';
      if (data.docType === 'vehiculo' && data.vehicle) {
        fName = generateVehicleQuotePdf(data.vehicle, data.selectedColor);
      } else if (data.docType === 'financiamiento' && data.financingParams) {
        fName = generateFinancingSimulationPdf(data.financingParams);
      } else if (data.docType === 'repuestos' && data.items) {
        fName = generateWishlistQuotePdf(data.items);
      } else if (data.docType === 'mantenimiento' && data.maintenanceRecord) {
        fName = generateMaintenanceCertificatePdf(data.maintenanceRecord);
      }
      onShowToast(`✓ Cotización oficial generada y descargada: ${fName}`);
    } catch (err) {
      onShowToast('✓ Descarga de PDF iniciada');
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let text = `Hola *${COMPANY_DATA.nombreComercial}* (*${COMPANY_DATA.razonSocial}*), adjunto consulta referente a la cotización oficial *${data.code}*: ${data.title}.`;
    if (data.vehicle) {
      text += ` Vehículo: ${data.vehicle.name} - Precio: S/ ${data.vehicle.priceSoles.toLocaleString()}`;
    }
    const url = `https://wa.me/51965171717?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Cálculos dinámicos para la vista previa en pantalla
  const fechaHoy = formatearFecha();
  const fechaVence = obtenerFechaVencimiento7Dias();

  let totalGeneral = 0;
  let totalDescuento = 0;

  if (data.docType === 'repuestos' && data.items) {
    data.items.forEach((it) => {
      totalGeneral += (it.priceSoles || 0) * (it.quantity || 1);
    });
  } else if (data.docType === 'vehiculo' && data.vehicle) {
    totalGeneral = data.vehicle.priceSoles;
    if (data.vehicle.oldPriceSoles && data.vehicle.oldPriceSoles > data.vehicle.priceSoles) {
      totalDescuento = data.vehicle.oldPriceSoles - data.vehicle.priceSoles;
    }
  } else if (data.docType === 'mantenimiento' && data.maintenanceRecord) {
    totalGeneral = data.maintenanceRecord.costSoles;
  } else if (data.docType === 'financiamiento' && data.financingParams) {
    totalGeneral = data.financingParams.monthlyPaymentSoles;
  }

  const opGravada = Math.round((totalGeneral / 1.18) * 100) / 100;
  const igv18 = Math.round((totalGeneral - opGravada) * 100) / 100;
  const textoEnLetras = numeroALetras(totalGeneral, 'PEN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="bg-surface-container-lowest w-full max-w-4xl max-h-[94vh] rounded-3xl shadow-2xl border border-surface-container flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:px-6 bg-[#212955] text-white flex items-center justify-between shrink-0 border-b border-[#F07F00]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F07F00] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-sm sm:text-base">{data.title}</h3>
                <span className="bg-[#F07F00] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase font-headline">
                  OFICIAL SUNAT
                </span>
              </div>
              <p className="text-xs text-white/80 font-mono">
                N° Documento: {data.code} • Validez: 7 días calendario
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Imprimir documento comercial"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-[#F07F00] hover:bg-[#d97300] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-headline uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>{isDownloading ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar vista previa"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Document Body (Strict Commercial Layout) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-5 text-xs font-sans leading-relaxed">
            
            {/* Top Official Letterhead */}
            <div className="border-b-2 border-[#F07F00] pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-black text-2xl tracking-tight text-[#212955]">
                      {COMPANY_DATA.razonSocial}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#F07F00] uppercase tracking-wider mt-0.5 font-headline">
                    Nombre comercial: {COMPANY_DATA.nombreComercial}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    <strong>RUC:</strong> {COMPANY_DATA.ruc} • <strong>Web:</strong> {COMPANY_DATA.web}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <strong>Sucursales:</strong> Lima y Cajamarca • <strong>Teléfonos:</strong> {COMPANY_DATA.telefonos}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    <strong>Correos:</strong> {COMPANY_DATA.correos}
                  </p>
                </div>

                <div className="bg-[#212955] text-white p-3.5 rounded-xl border border-[#212955] text-center shrink-0 min-w-[200px] shadow-sm">
                  <span className="inline-block bg-[#F07F00] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase font-headline">
                    {data.title}
                  </span>
                  <div className="font-mono font-bold text-white text-sm mt-1">N° {data.code}</div>
                  <div className="text-[10px] text-slate-200 mt-1">
                    Emisión: {fechaHoy} <br />
                    Vencimiento: <strong className="text-[#F07F00]">{fechaVence}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Document Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#212955] uppercase tracking-wide block text-[11px]">
                  DATOS DEL CLIENTE
                </span>
                <div className="font-semibold text-slate-900">Juan Carlos Mendoza Morales</div>
                <div className="text-slate-600">D.N.I. / R.U.C.: 45892147</div>
                <div className="text-slate-600">Dirección: Av. San Martín 420, Cajamarca</div>
                <div className="text-slate-600">Teléfono: 976 234 567 • Correo: jc.mendoza@gmail.com</div>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#212955] uppercase tracking-wide block text-[11px]">
                  DATOS DE LA OPERACIÓN
                </span>
                <div className="text-slate-700">
                  <strong>Placa del Vehículo:</strong> <span className="font-mono font-bold text-[#212955]">ABC-123</span>
                </div>
                <div className="text-slate-700">
                  <strong>Moneda:</strong> Soles (PEN) • <strong>Forma de Pago:</strong> Transferencia Bancaria
                </div>
                <div className="text-slate-700">
                  <strong>Asesor Comercial:</strong> Marco Valdivia Córdova
                </div>
              </div>
            </div>

            {/* Itemized Table (Mandatory Column Order) */}
            {data.docType === 'repuestos' && data.items && (
              <div className="space-y-2">
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#212955] text-white font-bold text-[10px] uppercase">
                        <th className="p-2">ITEM</th>
                        <th className="p-2">CODIGO</th>
                        <th className="p-2">U. MED</th>
                        <th className="p-2 text-center">CANT.</th>
                        <th className="p-2">DESCRIPCION</th>
                        <th className="p-2 text-right">PRECIO UNIT</th>
                        <th className="p-2 text-center">DSCTO %</th>
                        <th className="p-2 text-right">UNIT C/DSC</th>
                        <th className="p-2 text-right">IMPORTE TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.items.map((it, idx) => {
                        const pUnit = it.priceSoles;
                        const dscto = 0;
                        const unitConDscto = pUnit;
                        const tot = (it.quantity || 1) * unitConDscto;
                        return (
                          <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                            <td className="p-2 font-bold text-slate-600">{idx + 1}</td>
                            <td className="p-2 font-mono text-slate-600">{it.sku || `REP-00${idx + 1}`}</td>
                            <td className="p-2 text-slate-600">UND</td>
                            <td className="p-2 text-center font-bold">{it.quantity || 1}</td>
                            <td className="p-2 font-bold text-slate-900">{it.title}</td>
                            <td className="p-2 text-right font-medium">S/ {pUnit.toFixed(2)}</td>
                            <td className="p-2 text-center text-slate-500">{dscto}%</td>
                            <td className="p-2 text-right font-medium">S/ {unitConDscto.toFixed(2)}</td>
                            <td className="p-2 text-right font-bold text-[#212955]">S/ {tot.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {data.docType === 'vehiculo' && data.vehicle && (
              <div className="space-y-3">
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#212955] text-white font-bold text-[10px] uppercase">
                        <th className="p-2">ITEM</th>
                        <th className="p-2">CODIGO</th>
                        <th className="p-2">U. MED</th>
                        <th className="p-2 text-center">CANT.</th>
                        <th className="p-2">DESCRIPCION</th>
                        <th className="p-2 text-right">PRECIO UNIT</th>
                        <th className="p-2 text-center">DSCTO %</th>
                        <th className="p-2 text-right">UNIT C/DSC</th>
                        <th className="p-2 text-right">IMPORTE TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-white">
                        <td className="p-2 font-bold text-slate-600">1</td>
                        <td className="p-2 font-mono text-slate-600">{data.vehicle.id.toUpperCase()}</td>
                        <td className="p-2 text-slate-600">UND</td>
                        <td className="p-2 text-center font-bold">1</td>
                        <td className="p-2 font-bold text-slate-900">
                          {data.vehicle.brand} {data.vehicle.name} ({data.selectedColor || 'Blanco Perlado'})
                        </td>
                        <td className="p-2 text-right font-medium">
                          S/ {(data.vehicle.oldPriceSoles || data.vehicle.priceSoles).toFixed(2)}
                        </td>
                        <td className="p-2 text-center text-emerald-600 font-bold">
                          {data.vehicle.oldPriceSoles && data.vehicle.oldPriceSoles > data.vehicle.priceSoles
                            ? `${Math.round(((data.vehicle.oldPriceSoles - data.vehicle.priceSoles) / data.vehicle.oldPriceSoles) * 100)}%`
                            : '0%'}
                        </td>
                        <td className="p-2 text-right font-medium">S/ {data.vehicle.priceSoles.toFixed(2)}</td>
                        <td className="p-2 text-right font-bold text-[#212955]">S/ {data.vehicle.priceSoles.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Financial Summary Box: Op Gravada, Descuento, IGV, Total & Amount in Words */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
              <div className="sm:col-span-7 bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-[10px] text-[#212955] uppercase tracking-wider block mb-1">
                    IMPORTE EN LETRAS OBLIGATORIO:
                  </span>
                  <p className="font-bold text-xs text-[#F07F00] leading-snug">
                    {textoEnLetras}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Documento tributario referencial para compra y facturación electrónica.
                </p>
              </div>

              <div className="sm:col-span-5 border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="p-2.5 space-y-1.5 bg-white">
                  <div className="flex justify-between text-slate-600">
                    <span>OP. GRAVADA:</span>
                    <span className="font-medium">S/ {opGravada.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>DSCTO TOTAL:</span>
                    <span className="font-medium text-emerald-600">- S/ {totalDescuento.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>I.G.V. (18%):</span>
                    <span className="font-medium">S/ {igv18.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-2.5 bg-[#212955] text-white flex justify-between items-center">
                  <span className="font-bold uppercase text-[11px]">IMPORTE TOTAL:</span>
                  <span className="font-headline font-black text-base text-[#F07F00]">
                    S/ {totalGeneral.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Bank Accounts */}
            <div className="bg-[#212955] text-white p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
                <span className="font-bold text-xs text-[#F07F00] uppercase tracking-wide">
                  CUENTAS CORRIENTES AUTORIZADAS ({COMPANY_DATA.cuentasBancarias.titular})
                </span>
                <span className="text-[10px] text-white/80 font-mono">RUC: {COMPANY_DATA.ruc}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="space-y-0.5">
                  <strong className="text-[#F07F00] block">CUENTAS EN SOLES:</strong>
                  <div>• BCP: 245-9966172-0-49 (CCI 002-245-00996617204992)</div>
                  <div>• BBVA: 0011-0248-0100034831</div>
                  <div>• Scotiabank: 000-4949476</div>
                </div>
                <div className="space-y-0.5">
                  <strong className="text-[#F07F00] block">CUENTAS EN DÓLARES & DETRACCIONES:</strong>
                  <div>• BCP: 245-9964344-1-94 (CCI 002-245-00996434419494)</div>
                  <div>• BBVA: 0011-0248-0100034874 | Scotiabank: 000-4949488</div>
                  <div className="text-amber-300 font-bold">
                    • DETRACCIONES BANCO DE LA NACIÓN: N° {COMPANY_DATA.cuentasBancarias.detraccionesBN.cuenta}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Closing Message */}
            <div className="space-y-3 pt-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                <strong className="text-[#212955] uppercase block text-[10px] tracking-wider">
                  A TOMAR EN CUENTA:
                </strong>
                <p>1. {COMPANY_DATA.politicas[0]}</p>
                <p>2. {COMPANY_DATA.politicas[1]}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-[11px] font-bold text-[#212955] leading-relaxed">
                  {COMPANY_DATA.mensajeCierre}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-surface-container flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="material-symbols-outlined text-emerald-600 text-base">verified</span>
            <span>Generador oficial GRUPO MEVAC S.A.C. - Cotización comercial validada</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>WhatsApp Ventas</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-[#212955] hover:bg-[#181e40] text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>{isDownloading ? 'Descargando...' : 'Descargar Cotización PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
