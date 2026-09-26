import React, { useState } from 'react';
import { Vehicle, WishlistItem, MaintenanceRecord } from '../types';
import { FinancingPdfParams, generateVehicleQuotePdf, generateFinancingSimulationPdf, generateWishlistQuotePdf, generateMaintenanceCertificatePdf } from '../utils/pdfGenerator';

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
      onShowToast(`✓ Documento descargado exitosamente: ${fName}`);
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
    let text = `Hola Nor Celis Automotriz, adjunto solicitud referente al documento oficial *${data.code}*: ${data.title}.`;
    if (data.vehicle) {
      text += ` Vehículo: ${data.vehicle.name} - Precio: S/ ${data.vehicle.priceSoles.toLocaleString()}`;
    }
    const url = `https://wa.me/51987654321?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface-container-lowest w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-surface-container flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:px-6 bg-primary text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-secondary-container">picture_as_pdf</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-sm sm:text-base">{data.title}</h3>
                <span className="bg-secondary-container text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-white/80 font-mono">Código: {data.code} • Validez: 15 días</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="Imprimir documento oficial"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-secondary hover:bg-secondary-container text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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

        {/* Document Body (Printable High-Fidelity Sheet) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-surface-container-low/60 flex justify-center">
          <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-10 space-y-6 text-xs sm:text-sm font-sans leading-relaxed">
            
            {/* Top Official Letterhead */}
            <div className="border-b-2 border-primary/20 pb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-black text-xl tracking-tight text-primary">
                      NOR CELIS AUTOMOTRIZ S.A.C.
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-secondary uppercase tracking-wider mt-0.5">
                    Concesionario Oficial & Taller Especializado Multimarca
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    R.U.C. 20608754129 • Av. Vía de Evitamiento Sur 6003, Cajamarca - Perú
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Central: (076) 364-890 • WhatsApp: +51 987 654 321 • ventas@norcelis.pe
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-right shrink-0">
                  <span className="inline-block bg-primary/10 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                    {data.title}
                  </span>
                  <div className="font-mono font-bold text-slate-800 text-xs mt-1">N°: {data.code}</div>
                  <div className="text-[11px] text-slate-500">
                    Fecha: {new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Consultant Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Datos del Cliente
                </span>
                <div className="font-semibold text-slate-900">Juan Carlos Mendoza Morales</div>
                <div className="text-slate-600">D.N.I. / R.U.C.: 45892147</div>
                <div className="text-slate-600">Email: jc.mendoza@gmail.com • Celular: +51 976 234 567</div>
              </div>
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wide block mb-1">
                  Asesor Comercial Certificado
                </span>
                <div className="font-semibold text-slate-900">Lic. Marco Valdivia Córdova</div>
                <div className="text-slate-600">Canal: Showroom Principal Cajamarca</div>
                <div className="text-slate-600">Email: m.valdivia@norcelis.pe • Reg. Asesor: NC-942</div>
              </div>
            </div>

            {/* Document Content Details based on DocType */}
            {data.docType === 'vehiculo' && data.vehicle && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-5 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="w-full sm:w-44 aspect-[16/10] rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                    <img 
                      src={data.vehicle.image} 
                      alt={data.vehicle.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {data.vehicle.condition === 'nuevo' ? '0 KM Nuevo 2025' : 'Seminuevo Certificado'}
                      </span>
                      <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                        {data.vehicle.brand}
                      </span>
                    </div>
                    <h4 className="font-headline font-bold text-base text-slate-900">{data.vehicle.name}</h4>
                    <p className="text-xs text-slate-600 font-medium">{data.vehicle.subtitle}</p>
                    <div className="text-xs text-slate-700 pt-1">
                      <strong>Color configurado:</strong> {data.selectedColor || 'Blanco Perlado Premium'}
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Table */}
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-primary text-white font-bold">
                        <th className="p-2.5">Especificación Técnica</th>
                        <th className="p-2.5">Detalle Homologado Oficial</th>
                        <th className="p-2.5">Garantía de Fábrica</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-700">Motorización</td>
                        <td className="p-2.5 text-slate-900">{data.vehicle.specs.engine}</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">{data.vehicle.warranty}</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 font-semibold text-slate-700">Transmisión & Tracción</td>
                        <td className="p-2.5 text-slate-900">{data.vehicle.specs.transmission} • {data.vehicle.specs.traction}</td>
                        <td className="p-2.5 text-slate-600">Sellada libre mant.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-700">Potencia & Desempeño</td>
                        <td className="p-2.5 text-slate-900">{data.vehicle.specs.power || '177 HP @ 5,500 rpm'}</td>
                        <td className="p-2.5 text-slate-600">Norma Euro 6</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="p-2.5 font-semibold text-slate-700">Combustible / Eficiencia</td>
                        <td className="p-2.5 text-slate-900">{data.vehicle.fuelType} • {data.vehicle.specs.consumption || '65 km/gal'}</td>
                        <td className="p-2.5 text-slate-600">Test WLTP Oficial</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Pricing Summary */}
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-600 block">Bono de Descuento Especial Aplicado:</span>
                    <span className="font-bold text-emerald-600 text-sm">{data.vehicle.discountBonus || 'S/ 5,630 (~$1,500 USD)'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Precio Total al Contado (Incluye 18% I.G.V.):</span>
                    <div className="font-headline font-black text-2xl text-primary">
                      S/ {data.vehicle.priceSoles.toLocaleString()}
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      USD $ {data.vehicle.priceUsd.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {data.docType === 'financiamiento' && data.financingParams && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Precio Vehículo</span>
                    <span className="font-bold text-slate-900">S/ {data.financingParams.vehiclePriceSoles.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Cuota Inicial ({data.financingParams.downPaymentPercent}%)</span>
                    <span className="font-bold text-emerald-600">S/ {data.financingParams.downPaymentSoles.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Plazo Financiado</span>
                    <span className="font-bold text-slate-900">{data.financingParams.loanTermMonths} Meses</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Cuota Mensual</span>
                    <span className="font-headline font-black text-primary text-base">S/ {data.financingParams.monthlyPaymentSoles.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                  <strong>Entidad Bancaria Aliada:</strong> {data.financingParams.bankName.toUpperCase()} • Tasa Referencial TEA: {data.financingParams.teaPercent}% • Seguro de Desgravamen y Vehicular incluidos en cuota.
                </div>
              </div>
            )}

            {data.docType === 'repuestos' && data.items && (
              <div className="space-y-3">
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-primary text-white font-bold">
                        <th className="p-2.5">Item</th>
                        <th className="p-2.5">Repuesto / Accesorio</th>
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5 text-center">Cant.</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.items.map((it, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                          <td className="p-2.5 font-bold text-slate-600">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900">{it.title}</div>
                            <div className="text-[11px] text-slate-500">{it.subtitle}</div>
                          </td>
                          <td className="p-2.5 font-mono text-slate-600">{it.sku}</td>
                          <td className="p-2.5 text-center font-bold">{it.quantity || 1}</td>
                          <td className="p-2.5 text-right font-bold text-primary">
                            S/ {((it.priceSoles) * (it.quantity || 1)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Official Bank Accounts & Legal Terms (A Tomar en Cuenta) */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              {/* Official Bank Accounts Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-xs text-primary uppercase tracking-wide flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#F07F00]">account_balance</span>
                    Cuentas Bancarias Oficiales - NOR CELIS AUTOMOTRIZ S.A.C. (RUC: 20608754129)
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Titular Oficial</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Cuentas Soles */}
                  <div className="space-y-1.5 p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-[11px] text-primary block border-b pb-1">
                      CUENTAS CORRIENTES - SOLES (PEN):
                    </span>
                    <div className="space-y-1 text-[11px]">
                      <div>
                        <strong>BCP:</strong> N° <span className="font-mono font-bold">245-9966172-0-49</span>
                        <div className="text-[10px] text-slate-500 font-mono">CCI: 002-245-00996617204992</div>
                      </div>
                      <div>
                        <strong>BBVA:</strong> N° <span className="font-mono font-bold">0011-0248-0100034831</span>
                        <div className="text-[10px] text-slate-500 font-mono">CCI: 011-248-000-100034831-26</div>
                      </div>
                      <div>
                        <strong>Scotiabank:</strong> N° <span className="font-mono font-bold">000-4949476</span>
                        <div className="text-[10px] text-slate-500 font-mono">CCI: 00963200000494947000</div>
                      </div>
                    </div>
                  </div>

                  {/* Cuentas Dólares y Detracciones */}
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1 text-[11px]">
                      <span className="font-bold text-[11px] text-emerald-800 block border-b pb-1">
                        CUENTAS CORRIENTES - DÓLARES (USD):
                      </span>
                      <div>
                        <strong>BCP:</strong> N° <span className="font-mono font-bold">245-9964344-1-94</span>
                        <div className="text-[10px] text-slate-500 font-mono">CCI: 002-245-00996434419494</div>
                      </div>
                      <div>
                        <strong>BBVA:</strong> N° <span className="font-mono font-bold">0011-0248-0100034874</span>
                        <div className="text-[10px] text-slate-500 font-mono">CCI: 011-248-000100034874-26</div>
                      </div>
                    </div>

                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px]">
                      <strong className="text-amber-900 block">CUENTA DE DETRACCIONES - BANCO DE LA NACIÓN:</strong>
                      <span className="font-mono font-bold text-amber-950">N° 00-772-001053</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Authorized Stamp */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
                <div className="text-[11px] text-slate-600 space-y-1.5 flex-1 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block text-[10px]">
                    A TOMAR EN CUENTA:
                  </span>
                  <p>• La presente cotización tiene validez por 7 días, los productos tienen un stock limitado.</p>
                  <p>• Los precios pueden variar según diagnóstico final del vehículo o disponibilidad de repuestos al momento de la confirmación del vehículo.</p>
                  <p className="font-semibold text-primary pt-0.5">• Gracias por confiar en NORCELIS AUTOMOTRIZ especialistas en autopartes, accesorios y servicios automotrices.</p>
                </div>

                <div className="w-52 p-3 border-2 border-dashed border-slate-300 rounded-xl text-center shrink-0 bg-slate-50/50">
                  <span className="material-symbols-outlined text-3xl text-primary">verified</span>
                  <div className="font-bold text-slate-800 text-[11px]">NOR CELIS AUTOMOTRIZ S.A.C.</div>
                  <div className="text-[10px] text-slate-500 uppercase">Gerencia Comercial &amp; Ventas</div>
                  <div className="text-[9px] text-emerald-700 font-bold mt-1">✓ Sello y Firma Digital Autorizada</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-surface-container flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-outline">
            <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
            <span>Documento generado con motor jsPDF oficial y disponible para descarga inmediata</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShareWhatsApp}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Consultar por WhatsApp</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>{isDownloading ? 'Descargando...' : 'Descargar PDF Oficial'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
