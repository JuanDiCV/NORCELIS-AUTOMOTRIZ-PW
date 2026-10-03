import React, { useState, useEffect, useMemo } from 'react';
import { useApp, QuickQuoteItem } from '../context/AppContext';
import { VEHICLES_DATA, WORKSHOP_SERVICES_DATA } from '../data/mockData';
import { PARTS_CATALOG_DATA } from '../data/partsCatalog';
import {
  generateCommercialQuotePdf,
  CommercialQuotationData,
  generarCorrelativoOficial,
  formatearFecha,
  obtenerFechaVencimiento7Dias,
  COMPANY_DATA,
} from '../utils/pdfGenerator';

export interface QuickQuoteModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialItem?: QuickQuoteItem | null;
}

export const QuickQuoteModal: React.FC<QuickQuoteModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialItem: propInitialItem,
}) => {
  const {
    isQuickQuoteOpen: contextIsOpen,
    closeQuickQuote: contextClose,
    quickQuoteItem: contextItem,
    activeGarage,
    user,
    showToast,
  } = useApp();

  const isModalOpen = propIsOpen !== undefined ? propIsOpen : contextIsOpen;
  const handleClose = propOnClose || contextClose;
  const activeInitialItem = propInitialItem !== undefined ? propInitialItem : contextItem;

  // Mode: 'vehicle' | 'part' | 'service' | 'custom'
  const [selectedCategory, setSelectedCategory] = useState<'vehicle' | 'part' | 'service' | 'custom'>('vehicle');
  
  // Specific item selected
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(VEHICLES_DATA[0]?.id || '');
  const [selectedPartSku, setSelectedPartSku] = useState<string>(PARTS_CATALOG_DATA[0]?.sku || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(WORKSHOP_SERVICES_DATA[0]?.id || '');
  
  // Custom item fields
  const [customDescription, setCustomDescription] = useState('');
  const [customPriceSoles, setCustomPriceSoles] = useState<number>(350);

  // Quantity
  const [quantity, setQuantity] = useState<number>(1);

  // Customer Data
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientPhone, setClientPhone] = useState('965171717');
  const [clientDoc, setClientDoc] = useState('');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [selectedBranch, setSelectedBranch] = useState<'cajamarca' | 'lima' | 'shalom'>('cajamarca');
  const [vehiclePlateOrModel, setVehiclePlateOrModel] = useState(
    activeGarage?.model ? `${activeGarage.brand} ${activeGarage.model} (${activeGarage.plate || 'En trámite'})` : 'Toyota Hilux 2025'
  );
  const [notes, setNotes] = useState('');

  // Discount percentage (default 5% promo web)
  const [discountPercent, setDiscountPercent] = useState<number>(5);

  // Loading state for PDF generation
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Correlative document number (memoized per modal session)
  const [docCorrelative, setDocCorrelative] = useState(() => generarCorrelativoOficial());

  // Update form if preselected item comes from PDP or elsewhere
  useEffect(() => {
    if (activeInitialItem) {
      if (activeInitialItem.type === 'vehicle') {
        setSelectedCategory('vehicle');
        if (activeInitialItem.id) setSelectedVehicleId(activeInitialItem.id);
      } else if (activeInitialItem.type === 'part') {
        setSelectedCategory('part');
        if (activeInitialItem.skuOrCode) setSelectedPartSku(activeInitialItem.skuOrCode);
      } else if (activeInitialItem.type === 'service') {
        setSelectedCategory('service');
        if (activeInitialItem.id) setSelectedServiceId(activeInitialItem.id);
      } else {
        setSelectedCategory('custom');
        setCustomDescription(activeInitialItem.title);
        setCustomPriceSoles(activeInitialItem.priceSoles);
      }
    }
  }, [activeInitialItem]);

  // Sync user info if available
  useEffect(() => {
    if (user?.isLoggedIn) {
      if (user.name) setClientName(user.name);
      if (user.email) setClientEmail(user.email);
    }
  }, [user]);

  // Regenerate correlative on open
  useEffect(() => {
    if (isModalOpen) {
      setDocCorrelative(generarCorrelativoOficial());
    }
  }, [isModalOpen]);

  // Derived current item details
  const activeItemDetails = useMemo(() => {
    if (selectedCategory === 'vehicle') {
      const veh = VEHICLES_DATA.find((v) => v.id === selectedVehicleId) || VEHICLES_DATA[0];
      return {
        title: veh.name,
        code: `VEH-${veh.year}-${veh.brand.toUpperCase()}`,
        unitPrice: veh.priceSoles,
        priceUsd: veh.priceUsd,
        unit: 'UND',
        specs: `${veh.year} • ${veh.fuelType} • ${veh.specs.transmission} • ${veh.specs.engine}`,
        image: veh.image,
        brand: veh.brand,
      };
    } else if (selectedCategory === 'part') {
      const part = PARTS_CATALOG_DATA.find((p) => p.sku === selectedPartSku) || PARTS_CATALOG_DATA[0];
      const oemDisplay = part.crossOemCodes && part.crossOemCodes.length > 0 ? part.crossOemCodes.join(', ') : part.oemCode;
      return {
        title: part.name,
        code: part.sku,
        unitPrice: part.priceSoles,
        priceUsd: Math.round(part.priceSoles / 3.75),
        unit: 'PZA',
        specs: `${part.brand} • ${part.badge || part.category} • OEM: ${oemDisplay}`,
        image: part.image,
        brand: part.brand,
      };
    } else if (selectedCategory === 'service') {
      const serv = WORKSHOP_SERVICES_DATA.find((s) => s.id === selectedServiceId) || WORKSHOP_SERVICES_DATA[0];
      return {
        title: serv.name,
        code: `SRV-${serv.id.toUpperCase()}`,
        unitPrice: serv.priceStartingSoles,
        priceUsd: Math.round(serv.priceStartingSoles / 3.75),
        unit: 'SRV',
        specs: `${serv.estimatedDuration} • ${serv.categoryLabel} • Técnico Especialista`,
        image: serv.image,
        brand: 'Taller Norcelis',
      };
    } else {
      return {
        title: customDescription || 'Repuesto / Accesorio Automotriz a Medida',
        code: 'COT-ESP-01',
        unitPrice: customPriceSoles || 0,
        priceUsd: Math.round((customPriceSoles || 0) / 3.75),
        unit: 'UND',
        specs: 'Requerimiento específico del cliente para importación o pedido especial',
        image: '',
        brand: 'Multimarca',
      };
    }
  }, [
    selectedCategory,
    selectedVehicleId,
    selectedPartSku,
    selectedServiceId,
    customDescription,
    customPriceSoles,
  ]);

  // Economic calculations
  const unitPrice = activeItemDetails.unitPrice;
  const unitWithDiscount = Math.round(unitPrice * (1 - discountPercent / 100) * 100) / 100;
  const totalPriceSoles = Math.round(unitWithDiscount * quantity * 100) / 100;
  const totalPriceUsd = Math.round((totalPriceSoles / 3.75) * 100) / 100;
  const savingsSoles = Math.round((unitPrice * quantity - totalPriceSoles) * 100) / 100;

  // Handler: Generate & Download Official Commercial PDF
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      const quotationData: CommercialQuotationData = {
        numeroDocumento: docCorrelative,
        cliente: {
          nombreOrazonSocial: clientName.trim() || 'CLIENTE EXCLUSIVO NORCELIS',
          rucOdni: clientDoc.trim() || 'N/A',
          direccion:
            selectedBranch === 'cajamarca'
              ? 'Sede Cajamarca: Cas. Huacariz Mz A Lote S/N'
              : selectedBranch === 'lima'
              ? 'Sede Lima: Av. Elmer Faucett 1450'
              : 'Despacho Nacional Express (Shalom Express)',
          telefono: clientPhone.trim() || '965171717',
          correo: clientEmail.trim() || 'cliente@norcelis.com',
          placaVehiculo: vehiclePlateOrModel.trim() || 'POR ASIGNAR',
        },
        fechaEmision: formatearFecha(),
        fechaVencimiento: obtenerFechaVencimiento7Dias(),
        moneda: 'PEN',
        formaPago: 'Contado / Transferencia Bancaria Oficial',
        asesorVentas: 'Asesor Comercial Oficial - Norcelis Automotriz',
        items: [
          {
            itemNumber: 1,
            codigo: activeItemDetails.code,
            unidadMedida: activeItemDetails.unit,
            cantidad: quantity,
            descripcion: `${activeItemDetails.title} (${activeItemDetails.brand})`,
            precioUnitario: unitPrice,
            descuentoPorcentaje: discountPercent,
            unitarioConDescuento: unitWithDiscount,
            importeTotal: totalPriceSoles,
          },
        ],
        observaciones: notes.trim()
          ? `${notes.trim()} • Validez comercial 7 días. Precios incluyen IGV.`
          : 'Cotización emitida en línea por plataforma oficial Norcelis Automotriz. Precios incluyen IGV.',
      };

      const fileName = generateCommercialQuotePdf(quotationData);
      showToast(`✓ Cotización oficial generada y descargada: ${fileName}`);
    } catch (error) {
      console.error('Error generando cotización PDF:', error);
      showToast('Error al generar el PDF. Por favor reintenta.');
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 600);
    }
  };

  // Handler: Send directly to WhatsApp
  const handleSendWhatsApp = () => {
    const branchLabel =
      selectedBranch === 'cajamarca'
        ? 'Sede Cajamarca (Cas. Huacariz Mz A Lote S/N)'
        : selectedBranch === 'lima'
        ? 'Sede Lima (Av. Faucett 1450)'
        : 'Despacho Nacional Shalom Express';

    const messageLines = [
      `*COTIZACIÓN OFICIAL - NORCELIS AUTOMOTRIZ*`,
      `📄 *N° Documento:* ${docCorrelative}`,
      `👤 *Cliente:* ${clientName.trim() || 'Interesado Web'}`,
      `📞 *Teléfono:* ${clientPhone.trim() || '965171717'}`,
      clientDoc ? `🆔 *DNI / RUC:* ${clientDoc}` : '',
      `📍 *Sede / Entrega:* ${branchLabel}`,
      `🚗 *Vehículo Referencia:* ${vehiclePlateOrModel}`,
      `----------------------------------------`,
      `📦 *Ítem Cotizado:* ${activeItemDetails.title}`,
      `🔖 *Código / SKU:* ${activeItemDetails.code}`,
      `🏷️ *Marca:* ${activeItemDetails.brand}`,
      `🔢 *Cantidad:* ${quantity} ${activeItemDetails.unit}`,
      `💵 *Precio Unitario:* S/ ${unitPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
      discountPercent > 0 ? `🎁 *Descuento Aplicado:* ${discountPercent}%` : '',
      `💰 *MONTO TOTAL (Inc. IGV):* S/ ${totalPriceSoles.toLocaleString('es-PE', { minimumFractionDigits: 2 })} (~$ ${totalPriceUsd.toLocaleString('es-PE', { minimumFractionDigits: 2 })} USD)`,
      notes ? `📝 *Observaciones:* ${notes}` : '',
      `----------------------------------------`,
      `*GRUPO MEVAC S.A.C. - RUC: 20610829318*`,
      `Hola asesor Norcelis, deseo confirmar disponibilidad, facturación y coordinar la entrega.`,
    ].filter(Boolean);

    const fullMessage = messageLines.join('\n');
    const url = `https://wa.me/51965171717?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    showToast('✓ Redirigiendo a WhatsApp con tu cotización oficial prellenada');
  };

  // Handler: Copy summary text
  const handleCopySummary = () => {
    const summary = `Cotización Norcelis ${docCorrelative}: ${quantity}x ${activeItemDetails.title} - Total: S/ ${totalPriceSoles.toFixed(2)} (Inc. IGV). Contacto: 965171717`;
    navigator.clipboard?.writeText(summary);
    showToast('✓ Resumen de cotización copiado al portapapeles');
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER CORPORATIVO CON COLORES NORCELIS */}
        <div className="bg-[#212955] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#F07F00] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F07F00] to-[#d97300] text-white flex items-center justify-center shadow-lg shadow-orange-950/30">
              <span className="material-symbols-outlined text-2xl">request_quote</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-black text-[#F07F00] tracking-wider font-headline">
                  GRUPO MEVAC S.A.C. • RUC: 20610829318
                </span>
                <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  N° {docCorrelative}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-headline text-white tracking-tight flex items-center gap-2">
                Cotizador Rápido Oficial
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30 hidden sm:inline-block">
                  Validez 7 Días
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar cotizador"
            aria-label="Cerrar modal de cotización"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* BODY CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60">
          {/* CATEGORY SELECTOR TABS */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2 font-headline">
              1. Selecciona el Tipo de Producto o Requerimiento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('vehicle')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedCategory === 'vehicle'
                    ? 'bg-[#212955] text-white border-[#212955] shadow-md shadow-[#212955]/20 scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg text-[#F07F00]">directions_car</span>
                <span>Vehículos 0km</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('part')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedCategory === 'part'
                    ? 'bg-[#212955] text-white border-[#212955] shadow-md shadow-[#212955]/20 scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg text-[#F07F00]">settings</span>
                <span>Repuestos & DOT</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('service')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedCategory === 'service'
                    ? 'bg-[#212955] text-white border-[#212955] shadow-md shadow-[#212955]/20 scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg text-[#F07F00]">engineering</span>
                <span>Taller & Servicio</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCategory('custom')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                  selectedCategory === 'custom'
                    ? 'bg-[#212955] text-white border-[#212955] shadow-md shadow-[#212955]/20 scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg text-[#F07F00]">edit_note</span>
                <span>Personalizado</span>
              </button>
            </div>
          </div>

          {/* ITEM SELECTOR DROPDOWN & QUANTITY */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 font-headline">
                2. Detalle del Ítem a Cotizar
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Cantidad:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-800">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* If Category is Vehicle */}
            {selectedCategory === 'vehicle' && (
              <div>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955] transition-all"
                >
                  {VEHICLES_DATA.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} • S/ {v.priceSoles.toLocaleString()} (~${v.priceUsd.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If Category is Part */}
            {selectedCategory === 'part' && (
              <div>
                <select
                  value={selectedPartSku}
                  onChange={(e) => setSelectedPartSku(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955] transition-all"
                >
                  {PARTS_CATALOG_DATA.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      [{p.sku}] {p.name} ({p.brand}) • S/ {p.priceSoles.toFixed(2)}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#F07F00]">info</span>
                  <span>Incluye fluidos sintéticos Brembo DOT 4 y DOT 5.1, pastillas cerámicas y filtros OEM.</span>
                </div>
              </div>
            )}

            {/* If Category is Service */}
            {selectedCategory === 'service' && (
              <div>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955] transition-all"
                >
                  {WORKSHOP_SERVICES_DATA.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.estimatedDuration}) • Desde S/ {s.priceStartingSoles.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If Category is Custom */}
            {selectedCategory === 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Descripción del requerimiento</label>
                  <input
                    type="text"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Ej. Juego de Llantas Mickey Thompson 265/70R17 con aros..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Precio Unitario Ref. (S/)</label>
                  <input
                    type="number"
                    value={customPriceSoles}
                    onChange={(e) => setCustomPriceSoles(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955]"
                  />
                </div>
              </div>
            )}

            {/* Live Selected Item Preview Card */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {activeItemDetails.image ? (
                  <img
                    src={activeItemDetails.image}
                    alt={activeItemDetails.title}
                    className="w-14 h-14 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-orange-100 text-[#F07F00] flex items-center justify-center font-bold text-xl border border-orange-200 shrink-0">
                    <span className="material-symbols-outlined">inventory_2</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase text-[#F07F00] tracking-wider block">
                    {activeItemDetails.brand} • {activeItemDetails.code}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {activeItemDetails.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{activeItemDetails.specs}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-500 block">Unitario Ref.</span>
                <span className="text-sm sm:text-base font-black text-slate-900 font-headline">
                  S/ {unitPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-500 block">~${activeItemDetails.priceUsd.toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {/* CUSTOMER & DELIVERY DATA FORM */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 font-headline">
                3. Datos del Titular & Destino de Entrega
              </label>
              <span className="text-[10px] text-slate-500">Datos requeridos para membrete oficial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nombre Completo o Razón Social</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Juan Carlos Pérez o Empresa S.A.C."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">WhatsApp / Celular de Contacto *</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="965171717"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">DNI o RUC (Facturación)</label>
                <input
                  type="text"
                  value={clientDoc}
                  onChange={(e) => setClientDoc(e.target.value)}
                  placeholder="Ej. 72819201 o 20123456789"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Sede de Retiro o Despacho</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955]"
                >
                  <option value="cajamarca">Sede Cajamarca (Vía Cas. Huacariz Mz A Lote S/N)</option>
                  <option value="lima">Sede Lima / Callao (Av. Faucett 1450)</option>
                  <option value="shalom">Despacho Nacional Shalom Express (Todo el Perú)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Vehículo / Placa (Compatibilidad)</label>
                <input
                  type="text"
                  value={vehiclePlateOrModel}
                  onChange={(e) => setVehiclePlateOrModel(e.target.value)}
                  placeholder="Ej. Toyota Hilux 2024 / ABC-123"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Bono Promocional Web (%)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="flex-1 accent-[#F07F00] cursor-pointer"
                  />
                  <span className="w-10 text-right text-xs font-bold text-[#F07F00]">{discountPercent}%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Observaciones o Requerimientos Especiales (Opcional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Requiero instalación en taller y factura con detracción..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#212955]"
              />
            </div>
          </div>

          {/* FINANCIAL SUMMARY BOX */}
          <div className="bg-[#212955] text-white p-4 sm:p-5 rounded-2xl shadow-lg border border-[#F07F00]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-[#F07F00] tracking-wider">
                Desglose Económico Oficial (Inc. IGV 18%)
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span>Unitario Bruto: S/ {(unitPrice * quantity).toFixed(2)}</span>
                {savingsSoles > 0 && (
                  <span className="text-emerald-400 font-semibold">
                    Ahorro Web (-{discountPercent}%): S/ {savingsSoles.toFixed(2)}
                  </span>
                )}
                <span>Cuentas BCP / BBVA / Scotiabank</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Titular: {COMPANY_DATA.cuentasBancarias.titular}
              </p>
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6 shrink-0">
              <span className="text-xs text-slate-400 block font-medium">TOTAL A PAGAR / COTIZADO:</span>
              <div className="text-2xl sm:text-3xl font-black text-[#F07F00] font-headline tracking-tight">
                S/ {totalPriceSoles.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-300 font-semibold block">
                Equivalente Ref.: ${totalPriceUsd.toLocaleString('es-PE', { minimumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER CON ACCIONES CLAVE */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopySummary}
              className="text-slate-600 hover:text-slate-900 underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              <span>Copiar Resumen</span>
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Documento comercial válido por 7 días
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* ACTION 1: DOWNLOAD OFFICIAL PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#212955] hover:bg-[#181e40] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
              title="Descargar cotización oficial en formato PDF"
            >
              <span className="material-symbols-outlined text-base text-[#F07F00]">
                picture_as_pdf
              </span>
              <span>{isGeneratingPdf ? 'Generando PDF...' : 'Descargar Cotización PDF'}</span>
            </button>

            {/* ACTION 2: SEND TO WHATSAPP */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102 cursor-pointer"
              title="Enviar cotización a un asesor por WhatsApp"
            >
              <span className="material-symbols-outlined text-base">chat</span>
              <span>Enviar a WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
