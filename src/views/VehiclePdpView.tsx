import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { VehicleFinancingCalculator } from '../components/VehicleFinancingCalculator';
import { SafeImage } from '../components/SafeImage';
import { generateVehicleQuotePdf } from '../utils/pdfGenerator';
import {
  HorsepowerIcon,
  FuelDispenserIcon,
  Drivetrain4wdIcon,
  CertifiedShieldIcon,
  SpeedometerGaugeIcon,
  Showroom360Icon,
  OfficialQuoteIcon,
  BankFinancingIcon,
  OnlineAdvisorIcon,
  EngineIcon,
  TransmissionGearIcon,
  SuspensionSpringIcon,
  BrakeDiscIcon,
  CarDoorCapacityIcon,
  AppleHeartIcon,
  AppleIconBadge,
  AppleVerifiedSealIcon,
  AppleTuneSlidersIcon,
  AppleCartIcon,
  AppleSearchIcon,
  PlanRetomaIcon,
} from '../components/AutoIcons';

export const VehiclePdpView: React.FC = () => {
  const {
    vehicles,
    selectedVehicleId,
    setIsViewer360Open,
    setIsTestDriveModalOpen,
    addToCart,
    toggleWishlist,
    isInWishlist,
    showToast,
    autoParts,
    setCurrentView,
    openPdfModal,
  } = useApp();

  const currentCar = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const calculatorRef = useRef<HTMLDivElement>(null);
  const imgBoxRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'ficha' | 'seguridad' | 'garantia' | 'beneficios'>('ficha');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [activeThumb, setActiveThumb] = useState(0);

  // Dynamic focal zoom on vehicle image with variable magnification
  const [isZooming, setIsZooming] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(2.8);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgBoxRef.current) return;
    const rect = imgBoxRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  // Quick Loan calculator teaser
  const [downPercent, setDownPercent] = useState<number>(20);
  const [loanTerm, setLoanTerm] = useState<number>(48);

  const downAmount = (currentCar.priceSoles * downPercent) / 100;
  const principal = currentCar.priceSoles - downAmount;
  const monthlyRate = 0.125 / 12;
  const monthlyPayment = Math.round(
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))) /
      (Math.pow(1 + monthlyRate, loanTerm) - 1)
  );

  const scrollToCalculator = () => {
    if (calculatorRef.current) {
      calculatorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const colors = currentCar.colors || [
    { name: 'Blanco Perlado Premium (070)', hex: '#F4F4F6' },
    { name: 'Gris Grafito Metálico (1G3)', hex: '#585C63' },
    { name: 'Azul Cosmos Profundo (8X8)', hex: '#1C2C4A' },
    { name: 'Negro Mica Ébano (218)', hex: '#151618' },
    { name: 'Rojo Emoción Vulcano (3T3)', hex: '#8F141B' },
  ];

  const thumbnails = [
    { label: 'Exterior 3/4', img: currentCar.image },
    { label: 'Visor 360°', img: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Cabina Interior', img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=80' },
  ];

  const inWish = isInWishlist(currentCar.id);

  // Compatible parts for cross-selling
  const compatibleParts = autoParts.slice(0, 3);

  const handleReserveNow = () => {
    addToCart({
      type: 'vehicle_reservation',
      title: `Reserva Oficial: ${currentCar.name}`,
      skuOrCode: `RES-${currentCar.id}`,
      priceSoles: 1850,
      image: currentCar.image,
      specsSubtitle: `Color: ${colors[selectedColorIdx].name} • Bono aplicado: ${currentCar.discountBonus || 'S/ 5,630'}`,
    });
    showToast(`Reserva agregada al carrito con S/ 1,850 (~$500 USD)`);
  };

  return (
    <div className="max-w-7xl mx-auto px-gutter py-6 space-y-8">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs text-outline">
        <span>Inicio</span>
        <span>/</span>
        <span>Autos Nuevos 2025</span>
        <span>/</span>
        <span>{currentCar.brand}</span>
        <span>/</span>
        <span className="text-primary font-bold">{currentCar.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Gallery & Color Customizer */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visual Box with Dynamic Focal Zoom */}
          <div
            ref={imgBoxRef}
            onMouseEnter={() => setIsZooming(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              setIsZooming(false);
              setZoomOrigin({ x: 50, y: 50 });
            }}
            className="relative aspect-[16/10] bg-surface-container-lowest rounded-3xl border border-surface-container overflow-hidden shadow-lg group cursor-crosshair"
          >
            <img
              src={thumbnails[activeThumb].img}
              alt={currentCar.name}
              loading="eager"
              onError={(e) => {
                (e.target as HTMLImageElement).src = currentCar.image;
              }}
              style={{
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                transform: isZooming ? `scale(${zoomLevel})` : 'scale(1)',
                transition: isZooming ? 'transform-origin 0.05s ease-out, transform 0.18s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform-origin 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                imageRendering: 'auto',
              }}
              className="w-full h-full object-cover pointer-events-none will-change-transform select-none"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none transition-opacity duration-200" style={{ opacity: isZooming ? 0.3 : 1 }}>
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                0 KM 2025
              </span>
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
                {currentCar.brandType === 'alternativa' ? 'Marca Alternativa Garantizada' : 'Híbrido e-Four AWD'}
              </span>
            </div>

            {/* Targeting Reticle Overlay following mouse when zooming */}
            {isZooming && (
              <div 
                className="absolute pointer-events-none w-16 h-16 -ml-8 -mt-8 rounded-full border-2 border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.6)] backdrop-brightness-110 flex items-center justify-center transition-all duration-75"
                style={{ left: `${zoomOrigin.x}%`, top: `${zoomOrigin.y}%` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm animate-ping" />
                <div className="absolute w-2.5 h-0.5 bg-white/70 -left-1" />
                <div className="absolute w-2.5 h-0.5 bg-white/70 -right-1" />
                <div className="absolute h-2.5 w-0.5 bg-white/70 -top-1" />
                <div className="absolute h-2.5 w-0.5 bg-white/70 -bottom-1" />
              </div>
            )}

            {/* Helper Tag de Zoom Activo con selector de aumento */}
            {isZooming && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-3 pointer-events-auto animate-in fade-in zoom-in-95 duration-150 z-20">
                <div className="flex items-center gap-1.5 pointer-events-none">
                  <span className="material-symbols-outlined text-[15px] text-cyan-300">zoom_in</span>
                  <span>Zoom Focal ({zoomLevel}x)</span>
                </div>
                <div className="h-3.5 w-px bg-white/30" />
                <div className="flex items-center gap-1 text-[11px]">
                  {[2.2, 2.8, 3.6].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomLevel(lvl);
                      }}
                      className={`px-2 py-0.5 rounded-md font-extrabold transition-all cursor-pointer ${
                        zoomLevel === lvl ? 'bg-cyan-400 text-black shadow-xs' : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {lvl}x
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isZooming && (
              <div className="absolute top-4 right-16 bg-black/60 backdrop-blur-md text-white/80 text-[11px] font-bold px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1.5 pointer-events-none">
                <span className="material-symbols-outlined text-[14px]">search</span>
                <span>Pasa el mouse para zoom guiado</span>
              </div>
            )}

            {/* Interactive 360 Overlay Trigger */}
            <button
              onClick={() => setIsViewer360Open(true)}
              className="absolute bottom-4 left-4 bg-primary/90 hover:bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2 transition-all cursor-pointer group-hover:scale-105 z-10"
            >
              <Showroom360Icon size={18} className="text-[#F07F00]" />
              <span>Lanzar Visor 360° &amp; Modo Noche</span>
            </button>

            {/* Favorite button */}
            <button
              onClick={() =>
                toggleWishlist({
                  id: currentCar.id,
                  type: 'vehicle',
                  title: currentCar.name,
                  subtitle: currentCar.subtitle,
                  sku: currentCar.id,
                  priceSoles: currentCar.priceSoles,
                  priceUsd: currentCar.priceUsd,
                  oldPriceSoles: currentCar.oldPriceSoles,
                  image: currentCar.image,
                  categoryBadge: 'Vehículo Nuevo 2025',
                })
              }
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md ${
                inWish ? 'bg-secondary-container text-white' : 'bg-white/80 hover:bg-white text-on-surface'
              }`}
            >
              <AppleHeartIcon size={20} />
            </button>
          </div>

          {/* Thumbnails list */}
          <div className="grid grid-cols-3 gap-3">
            {thumbnails.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setActiveThumb(idx)}
                className={`relative aspect-[16/10] rounded-2xl overflow-hidden border-2 transition-all ${
                  activeThumb === idx
                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                    : 'border-surface-container opacity-80 hover:opacity-100'
                }`}
              >
                <SafeImage src={t.img} alt={t.label} typeHint="vehicle" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 inset-x-1 text-[10px] bg-black/60 text-white font-bold text-center py-0.5 rounded truncate">
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          {/* Color Customizer */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-outline">
                Color de Carrocería Disponible:
              </span>
              <span className="text-xs font-bold text-primary">
                {colors[selectedColorIdx].name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {colors.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedColorIdx(idx);
                    showToast(`Color seleccionado: ${c.name}`);
                  }}
                  className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                    selectedColorIdx === idx
                      ? 'border-secondary-container scale-110 ring-2 ring-primary/30'
                      : 'border-surface-container hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {selectedColorIdx === idx && (
                    <span className="material-symbols-outlined text-sm text-secondary-container drop-shadow">
                      check
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Specs & Actions */}
        <div className="lg:col-span-5 space-y-5">
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-secondary tracking-wider">
                {currentCar.brand} Concesionario Oficial
              </span>
              <span className="text-outline">•</span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <AppleVerifiedSealIcon size={14} />
                Entrega Inmediata (48h)
              </span>
            </div>

            <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface mt-1 leading-tight">
              {currentCar.name}
            </h1>
            <p className="text-xs text-outline mt-1">
              {currentCar.subtitle}
            </p>
          </div>

          {/* Key Specs Pills Estilo Apple */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container flex flex-col items-center gap-1 group hover:border-[#F07F00]/30 transition-colors">
              <AppleIconBadge variant="subtle-orange" size="xs">
                <HorsepowerIcon size={14} />
              </AppleIconBadge>
              <span className="text-[10px] text-outline block">Potencia</span>
              <span className="font-bold text-primary">219 HP</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container flex flex-col items-center gap-1 group hover:border-emerald-500/30 transition-colors">
              <AppleIconBadge variant="emerald" size="xs">
                <FuelDispenserIcon size={14} className="text-white" />
              </AppleIconBadge>
              <span className="text-[10px] text-outline block">Rendimiento</span>
              <span className="font-bold text-emerald-700">72 km/gal</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container flex flex-col items-center gap-1 group hover:border-[#212955]/30 transition-colors">
              <AppleIconBadge variant="secondary" size="xs">
                <Drivetrain4wdIcon size={14} className="text-white" />
              </AppleIconBadge>
              <span className="text-[10px] text-outline block">Tracción</span>
              <span className="font-bold text-primary">e-Four AWD</span>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container flex flex-col items-center gap-1 group hover:border-[#212955]/30 transition-colors">
              <AppleIconBadge variant="subtle-blue" size="xs">
                <CertifiedShieldIcon size={14} className="text-[#212955]" />
              </AppleIconBadge>
              <span className="text-[10px] text-outline block">Seguridad</span>
              <span className="font-bold text-primary">TSS 3.0</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm space-y-4">
            <div className="flex items-baseline justify-between border-b border-surface-container pb-3">
              <div>
                {currentCar.oldPriceSoles && (
                  <div className="text-xs text-outline line-through font-mono">
                    Precio Regular: S/ {currentCar.oldPriceSoles.toLocaleString()}
                  </div>
                )}
                <div className="font-headline font-extrabold text-3xl text-primary">
                  S/ {currentCar.priceSoles.toLocaleString()}
                </div>
                <div className="text-xs font-mono text-outline">
                  Tipo de cambio ref.: ~${currentCar.priceUsd.toLocaleString()} USD
                </div>
              </div>

              {currentCar.discountBonus && (
                <div className="bg-secondary-fixed/40 border border-secondary-fixed-dim p-2 rounded-xl text-right">
                  <span className="text-[10px] uppercase font-bold text-secondary-fixed-variant block">
                    Bono Exclusivo
                  </span>
                  <span className="text-xs font-extrabold text-secondary">
                    {currentCar.discountBonus}
                  </span>
                </div>
              )}
            </div>

            {/* Reservation Banner */}
            <div className="bg-surface-container-low p-3.5 rounded-2xl border border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-primary block">
                  Reserva Online tu Unidad
                </span>
                <span className="text-[11px] text-outline">
                  Separa tu VIN de fábrica con solo S/ 1,850 (~$500 USD)
                </span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded shrink-0">
                100% Reembolsable
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleReserveNow}
                className="w-full min-h-[48px] btn-primary text-sm uppercase py-3 px-4 flex items-center justify-center gap-2"
              >
                <AppleVerifiedSealIcon size={18} className="shrink-0" />
                <span>Reservar esta Unidad (S/ 1,850)</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => setIsTestDriveModalOpen(true)}
                  className="min-h-[42px] btn-secondary text-xs uppercase py-2.5 px-3 flex items-center justify-center gap-1.5"
                >
                  <SpeedometerGaugeIcon size={16} className="shrink-0" />
                  <span>Agendar Test Drive</span>
                </button>
                <button
                  onClick={() => setIsViewer360Open(true)}
                  className="min-h-[42px] btn-ghost text-xs py-2.5 px-3 flex items-center justify-center gap-1.5"
                >
                  <Showroom360Icon size={16} className="shrink-0" />
                  <span>Showroom 360°</span>
                </button>
              </div>

              {/* Botón de Descarga de Ficha Técnica & Cotización Oficial en PDF */}
              <button
                onClick={() => {
                  try {
                    const colorName = colors[selectedColorIdx]?.name || 'Blanco Perlado';
                    const fileName = generateVehicleQuotePdf(currentCar, colorName);
                    const quoteCode = `COT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                    openPdfModal({
                      isOpen: true,
                      docType: 'vehiculo',
                      title: `Cotización Oficial: ${currentCar.name}`,
                      code: quoteCode,
                      vehicle: currentCar,
                      selectedColor: colorName,
                      fileName,
                    });
                    showToast(`✓ Cotización en PDF generada y lista: ${fileName}`);
                  } catch (err) {
                    showToast('Descargando cotización oficial del vehículo en PDF...');
                  }
                }}
                className="w-full min-h-[42px] btn-outline-primary text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-2"
                title="Descargar Ficha Técnica Oficial y Cotización con Membrete Nor Celis en PDF"
              >
                <OfficialQuoteIcon size={18} className="shrink-0 text-[#F07F00]" />
                <span>Descargar Cotización Oficial (PDF)</span>
              </button>
            </div>
          </div>

          {/* Interactive Credit Simulator Quick Teaser */}
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <BankFinancingIcon size={16} className="text-[#212955]" />
                Simulador Financiero Nor Celis
              </span>
              <button
                onClick={scrollToCalculator}
                className="text-[11px] font-bold text-secondary hover:underline flex items-center gap-0.5"
              >
                <span>Avanzado</span>
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Cuota Inicial ({downPercent}%):</span>
                  <span className="font-mono font-bold text-primary">S/ {downAmount.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[20, 30, 40].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setDownPercent(pct)}
                      className={`py-1.5 rounded-lg border font-bold transition-all ${
                        downPercent === pct
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Plazo en Meses:</span>
                  <span className="font-bold text-primary">{loanTerm} Meses</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[24, 36, 48, 60].map((t) => (
                    <button
                      key={t}
                      onClick={() => setLoanTerm(t)}
                      className={`py-1.5 rounded-lg border font-bold transition-all ${
                        loanTerm === t
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {t}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline block">Cuota Referencial</span>
                  <span className="font-headline font-extrabold text-xl text-secondary">
                    S/ {monthlyPayment.toLocaleString()}/mes
                  </span>
                </div>
                <button
                  onClick={scrollToCalculator}
                  className="bg-secondary-container hover:bg-secondary text-white font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Simulador Detallado</span>
                  <AppleTuneSlidersIcon size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-surface-container">
                <button
                  onClick={() => setCurrentView('financing')}
                  className="bg-surface-container-low hover:bg-surface-container text-primary font-bold text-[11px] py-2 px-2.5 rounded-xl border border-surface-container flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BankFinancingIcon size={14} className="text-primary" />
                  <span>Evaluar con Bancos</span>
                </button>
                <button
                  onClick={() => setCurrentView('trade-in')}
                  className="bg-surface-container-low hover:bg-surface-container text-secondary font-bold text-[11px] py-2 px-2.5 rounded-xl border border-surface-container flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PlanRetomaIcon size={14} className="text-secondary" />
                  <span>Bono Retoma S/ 7,500</span>
                </button>
              </div>
            </div>
          </div>

          {/* Master Advisor Card */}
          <div className="bg-surface-container-low p-4 rounded-3xl border border-surface-container flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-white">
              CM
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                Master Advisor Nor Celis
              </span>
              <h5 className="font-headline font-bold text-xs text-on-surface">
                Ing. Carlos Mendoza
              </h5>
              <p className="text-[11px] text-outline">
                Especialista en híbridos Toyota &amp; financiamiento VIP
              </p>
            </div>
            <a
              href="https://wa.me/51987654321?text=Hola%20Ing.%20Carlos%20Mendoza,%20tengo%20consultas%20sobre%20el%20Toyota%20RAV4%202025"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
              title="Chat directo con Carlos Mendoza"
            >
              <OnlineAdvisorIcon size={18} className="text-white" />
            </a>
          </div>
        </div>
      </div>

      {/* Calculadora Integral de Financiamiento Vehicular */}
      <div ref={calculatorRef} id="calculadora-financiamiento" className="scroll-mt-24">
        <VehicleFinancingCalculator vehicle={currentCar} />
      </div>

      {/* Tabs with Comprehensive Technical Specs (Screen 4 spec) */}
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-container shadow-sm overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex border-b border-surface-container overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('ficha')}
            className={`px-6 py-4 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'ficha'
                ? 'border-primary text-primary bg-surface-container-low/50 font-bold'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <EngineIcon size={16} />
            <span>Ficha Técnica Detallada</span>
          </button>
          <button
            onClick={() => setActiveTab('seguridad')}
            className={`px-6 py-4 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'seguridad'
                ? 'border-primary text-primary bg-surface-container-low/50 font-bold'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <CertifiedShieldIcon size={16} />
            <span>Toyota Safety Sense 3.0</span>
          </button>
          <button
            onClick={() => setActiveTab('garantia')}
            className={`px-6 py-4 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'garantia'
                ? 'border-primary text-primary bg-surface-container-low/50 font-bold'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <AppleVerifiedSealIcon size={16} />
            <span>Garantía Oficial &amp; Mantenimientos</span>
          </button>
          <button
            onClick={() => setActiveTab('beneficios')}
            className={`px-6 py-4 border-b-2 transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'beneficios'
                ? 'border-primary text-primary bg-surface-container-low/50 font-bold'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <OfficialQuoteIcon size={16} />
            <span>Beneficios Exclusivos Nor Celis</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 text-xs text-on-surface leading-relaxed">
          {activeTab === 'ficha' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AppleIconBadge variant="subtle-orange" size="xs">
                    <EngineIcon size={14} />
                  </AppleIconBadge>
                  <h4 className="font-headline font-bold text-sm text-primary uppercase tracking-wider">
                    Motor &amp; Desempeño
                  </h4>
                </div>
                <ul className="space-y-1.5 text-on-surface-variant">
                  <li><strong>Motor a combustión:</strong> 2.5L 4 cilindros DOHC 16V VVT-iE (A25A-FXS)</li>
                  <li><strong>Potencia combinada:</strong> 219 HP @ 5,700 rpm</li>
                  <li><strong>Torque motor térmico:</strong> 221 Nm @ 3,600 - 5,200 rpm</li>
                  <li><strong>Motores eléctricos:</strong> Delantero (118 HP) + Trasero (53 HP e-Four)</li>
                  <li><strong>Transmisión:</strong> Electrónica Continuamente Variable (e-CVT)</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AppleIconBadge variant="subtle-blue" size="xs">
                    <CarDoorCapacityIcon size={14} />
                  </AppleIconBadge>
                  <h4 className="font-headline font-bold text-sm text-primary uppercase tracking-wider">
                    Chasis &amp; Dimensiones
                  </h4>
                </div>
                <ul className="space-y-1.5 text-on-surface-variant">
                  <li><strong>Plataforma:</strong> TNGA-K de alta rigidez estructural</li>
                  <li><strong>Largo x Ancho x Alto:</strong> 4,600 x 1,855 x 1,685 mm</li>
                  <li><strong>Distancia entre ejes:</strong> 2,690 mm</li>
                  <li><strong>Despeje del suelo:</strong> 190 mm</li>
                  <li><strong>Capacidad de maletera:</strong> 580 litros expandible a 1,690 L</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AppleIconBadge variant="primary" size="xs">
                    <BrakeDiscIcon size={14} />
                  </AppleIconBadge>
                  <h4 className="font-headline font-bold text-sm text-primary uppercase tracking-wider">
                    Frenos &amp; Suspensión
                  </h4>
                </div>
                <ul className="space-y-1.5 text-on-surface-variant">
                  <li><strong>Suspensión delantera:</strong> Independiente tipo MacPherson con barra estabilizadora</li>
                  <li><strong>Suspensión trasera:</strong> Doble horquilla independiente con barra estabilizadora</li>
                  <li><strong>Frenos:</strong> Discos ventilados delanteros 305mm / Sólidos traseros 281mm</li>
                  <li><strong>Frenado regenerativo:</strong> Control electrónico de frenado inteligente (ECB)</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="space-y-4">
              <p className="text-outline">
                El Toyota RAV4 2025 incorpora el paquete de seguridad activa más avanzado de la industria:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                  <div className="font-bold text-primary mb-1">Sistema Pre-Colisión (PCS)</div>
                  <div className="text-[11px] text-outline">Detección de vehículos, peatones de día/noche y ciclistas con frenado autónomo de emergencia.</div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                  <div className="font-bold text-primary mb-1">Control Crucero Adaptativo (DRCC)</div>
                  <div className="text-[11px] text-outline">Regulación automática de distancia con función Stop &amp; Go para tráfico urbano.</div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                  <div className="font-bold text-primary mb-1">Alerta de Cambio de Carril (LDA / LTA)</div>
                  <div className="text-[11px] text-outline">Asistencia activa de dirección para mantener el vehículo centrado en la vía.</div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                  <div className="font-bold text-primary mb-1">7 Airbags Homologados</div>
                  <div className="text-[11px] text-outline">Frontales, laterales, de cortina para ambas filas y de rodilla para conductor.</div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                  <div className="font-bold text-primary mb-1">Cámara 360° HD</div>
                  <div className="text-[11px] text-outline">Visión perimétrica panorámica con sensores delanteros y traseros sonoros.</div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                  <div className="font-bold text-primary mb-1">Luces Altas Automáticas (AHB)</div>
                  <div className="text-[11px] text-outline">Conmutación inteligente para evitar encandilamiento a otros conductores.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'garantia' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-headline font-bold text-sm text-primary uppercase tracking-wider">
                  Cobertura Oficial Toyota
                </h4>
                <ul className="space-y-2 text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <AppleVerifiedSealIcon size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>5 años o 100,000 km</strong> de garantía de fábrica para tren motriz y carrocería.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppleVerifiedSealIcon size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span><strong>8 años o 160,000 km</strong> de garantía extendida para el sistema híbrido y la batería de tracción.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-headline font-bold text-sm text-primary uppercase tracking-wider">
                  Mantenimientos en Taller Nor Celis
                </h4>
                <p className="text-on-surface-variant">
                  Atención preferencial en nuestro Concesionario y Taller en AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA con técnicos Master certificados por Toyota Motor Corporation. Citas express de 45 minutos para mantenimiento preventivo.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'beneficios' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                <div className="font-bold text-primary mb-1">Plan Retoma Garantizado</div>
                <div className="text-[11px] text-outline">Tasación con sobreprecio de mercado para recibir tu vehículo actual en parte de pago.</div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                <div className="font-bold text-primary mb-1">Asistencia en Ruta 24/7</div>
                <div className="text-[11px] text-outline">Grúa sin costo, auxilio mecánico y reposición de combustible en todo el territorio nacional.</div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                <div className="font-bold text-primary mb-1">Club Nor Celis VIP</div>
                <div className="text-[11px] text-outline">Descuentos de 20% permanente en repuestos OEM, accesorios y servicios de estética automotriz.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cross-selling: Repuestos y Equipamiento Compatible (Screen 4 spec) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div>
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">
              Accesorios &amp; Mantenimiento
            </span>
            <h3 className="font-headline font-bold text-xl text-on-surface">
              Equipamiento Original para tu RAV4 2025
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {compatibleParts.map((part) => (
            <div
              key={part.id}
              className="bg-surface-container-lowest p-4 rounded-3xl border border-surface-container hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center gap-3">
                <SafeImage src={part.image} alt={part.name} typeHint="part" className="w-20 h-20 object-contain rounded-xl bg-surface-container-low p-1" />
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    100% Compatible
                  </span>
                  <h5 className="font-headline font-bold text-xs text-on-surface line-clamp-2 mt-1">
                    {part.name}
                  </h5>
                  <div className="font-bold text-primary text-sm mt-0.5">
                    S/ {part.priceSoles.toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  addToCart({
                    type: 'part',
                    title: part.name,
                    skuOrCode: part.sku,
                    priceSoles: part.priceSoles,
                    image: part.image,
                    specsSubtitle: 'Accesorio homologado RAV4 2025',
                  })
                }
                className="mt-3 w-full bg-primary hover:bg-primary-container text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <AppleCartIcon size={15} />
                <span>Añadir al Carrito</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
