import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { PromoHeroCarousel } from '../components/PromoHeroCarousel';
import { SafeImage } from '../components/SafeImage';
import { FALLBACK_IMAGES } from '../utils/imageAssets';
import {
  TireOffRoadIcon,
  Equip4x4Icon,
  LubricantOilIcon,
  DetailingPPFIcon,
  SuspensionHDIcon,
  WorkshopServiceIcon,
  PlanRetomaIcon,
  AutoPartsIcon,
  VehicleIcon,
  AppleVerifiedSealIcon,
  AppleIconBadge,
  AppleSearchIcon,
  AppleTuneSlidersIcon,
  AppleHeartIcon,
  AppleCartIcon,
  AppleChevronRightIcon,
  ExpressDeliveryVanIcon,
  BrakeDiscIcon,
  EngineIcon,
  CarBatteryIcon,
  CertifiedShieldIcon,
  SpeedometerGaugeIcon,
} from '../components/AutoIcons';

import { DEFAULT_CINEMATIC_CATEGORIES, DEFAULT_OFFICIAL_BRANDS } from '../data/homeShowcaseData';

export const HomeView: React.FC = () => {
  const {
    setCurrentView,
    setSelectedVehicleId,
    setSelectedPartSku,
    vehicles,
    autoParts,
    addToCart,
    toggleWishlist,
    isInWishlist,
    showToast,
    navigateToPartsCatalog,
    homeCategories,
    officialBrands,
    panoramicBanner,
    topOfferCards,
    bottomOfferCards,
  } = useApp();

  const categoriesList = useMemo(
    () => (homeCategories && homeCategories.length > 0 ? homeCategories : DEFAULT_CINEMATIC_CATEGORIES),
    [homeCategories]
  );
  const brandsList = useMemo(
    () => (officialBrands && officialBrands.length > 0 ? officialBrands : DEFAULT_OFFICIAL_BRANDS),
    [officialBrands]
  );

  const [heroTab, setHeroTab] = useState<'parts' | 'workshop' | 'new_cars' | 'used_cars'>('parts');
  const [filterYear, setFilterYear] = useState('2025');
  const [filterBrand, setFilterBrand] = useState('Toyota');
  const [filterModel, setFilterModel] = useState('RAV4 Hybrid');
  const [filterPlate, setFilterPlate] = useState('');
  const [partsShowcaseCategory, setPartsShowcaseCategory] = useState<string>('todos');
  const [categoryDisplayMode, setCategoryDisplayMode] = useState<'flagship' | 'all'>('flagship');

  const newCars = useMemo(() => vehicles.filter((v) => v.condition === 'nuevo'), [vehicles]);
  const usedCars = useMemo(() => vehicles.filter((v) => v.condition === 'seminuevo'), [vehicles]);

  // Memoized filter for homepage parts showcase
  const displayedParts = useMemo(() => {
    return partsShowcaseCategory === 'todos'
      ? autoParts.slice(0, 8)
      : autoParts.filter((p) => p.category === partsShowcaseCategory).slice(0, 8);
  }, [autoParts, partsShowcaseCategory]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroTab === 'parts') {
      showToast(`Filtrando repuestos compatibles con ${filterBrand} ${filterModel} (${filterYear})`);
      navigateToPartsCatalog('todos', filterBrand);
    } else if (heroTab === 'workshop') {
      showToast('Redirigiendo a reserva de citas en taller...');
      setCurrentView('services');
    } else {
      showToast(`Mostrando vehículos para ${filterBrand}`);
      setCurrentView('cars');
    }
  };

  const handleAddToCart = (part: typeof autoParts[0], withInstallation: boolean = false) => {
    addToCart({
      type: 'part',
      title: part.name,
      skuOrCode: part.sku,
      priceSoles: part.priceSoles,
      image: part.image,
      specsSubtitle: `${part.brand} • ${part.category}`,
      hasWorkshopInstallation: withInstallation,
      installationFeeSoles: withInstallation ? 45 : 0,
      quantity: 1,
    });
    showToast(`${part.name} agregado al carrito`);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Hero Promo Showcase Carousel (Saga Falabella Clean Style) */}
      <section className="w-full">
        <PromoHeroCarousel />
      </section>

      {/* 2. CATEGORÍAS POPULARES DE AUTOPARTES & MARCAS - CINEMATIC CARDS + INFINITE MARQUEE */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header with Title and Mode Switcher */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#F07F00] mb-1.5 block">
                Líneas Especializadas Nor Celis
              </span>
              <h2 className="font-headline font-black text-2xl sm:text-3xl text-white tracking-wide">
                Categorías de Autopartes &amp; Repuestos
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1 font-medium max-w-2xl">
                Autopartes de ingeniería certificada con garantía de fábrica y servicio de instalación opcional en taller.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Toggle 4 Flagship vs 6 All */}
              <div className="flex bg-white/10 p-1 rounded-md border border-white/15 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCategoryDisplayMode('flagship')}
                  className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                    categoryDisplayMode === 'flagship'
                      ? 'bg-[#F07F00] text-white shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Líneas Principales (4)
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryDisplayMode('all')}
                  className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                    categoryDisplayMode === 'all'
                      ? 'bg-[#F07F00] text-white shadow-sm'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Todas las Líneas (6)
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigateToPartsCatalog('todos')}
                className="min-h-[40px] px-4 py-2 text-xs font-bold text-white hover:text-[#F07F00] bg-white/10 hover:bg-white/20 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              >
                <span>Ver Catálogo Completo ({autoParts.length})</span>
                <AppleChevronRightIcon size={16} />
              </button>
            </div>
          </div>

          {/* Cinematic Category Cards (Inspired by Fox Factory / Live Valve Reference) */}
          <div
            className={`grid gap-2.5 sm:gap-3 lg:gap-3.5 ${
              categoryDisplayMode === 'flagship'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {(categoryDisplayMode === 'flagship'
              ? categoriesList.slice(0, 4)
              : categoriesList
            ).map((cat) => (
              <button
                key={cat.code}
                type="button"
                onClick={() => navigateToPartsCatalog(cat.code)}
                className="group relative h-[440px] sm:h-[480px] rounded-md overflow-hidden border border-white/15 hover:border-white/80 transition-all duration-500 text-left flex flex-col justify-end p-5 sm:p-6 cursor-pointer shadow-2xl hover:shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:-translate-y-1"
              >
                {/* Background Image with Grayscale-to-Color + Smooth Scale on hover */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.25] brightness-[0.55] group-hover:grayscale-0 group-hover:contrast-[1.15] group-hover:brightness-[1.1] group-hover:scale-105 transition-all duration-700 ease-out cinematic-card-img"
                  loading="lazy"
                />

                {/* Dark cinematic gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20 opacity-90 group-hover:opacity-75 transition-opacity duration-500" />

                {/* Ambient warm glow at the base on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#F07F00]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Top Floating Category Labels */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#F07F00] drop-shadow-md">
                    {cat.tag}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 drop-shadow-md">
                    {cat.badge}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 space-y-2 text-center flex flex-col items-center">
                  <h3 className="font-extrabold text-xl sm:text-2xl lg:text-3xl text-white tracking-tight leading-tight uppercase drop-shadow-md group-hover:text-white transition-colors text-center">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/75 line-clamp-2 leading-relaxed font-medium text-center">
                    {cat.subtitle}
                  </p>

                  {/* Action Link like "LEARN MORE ↗" in reference image */}
                  <div className="pt-3 border-t border-white/20 w-full flex items-center justify-between gap-2">
                    <span className="font-bold tracking-wider text-xs sm:text-sm text-white group-hover:text-[#F07F00] inline-flex items-center justify-center gap-1.5 transition-colors text-center whitespace-nowrap">
                      <span>VER REPUESTOS</span>
                      <span className="text-sm sm:text-base group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                        ↗
                      </span>
                    </span>
                    <span className="text-[11px] font-bold text-white/60 group-hover:text-white transition-colors shrink-0 text-center whitespace-nowrap">
                      {cat.count}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Marcas Oficiales - Pasarela Continua Infinita (Infinite Marquee Carousel) */}
          <div className="space-y-3 pt-2">
            <div className="px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Marcas Oficiales Garantizadas en Nor Celis Automotriz
              </h3>
            </div>

            {/* Marquee Track with Smooth Left/Right Gradient Mask */}
            <div className="relative overflow-hidden rounded-2xl bg-black/40 border border-white/10 p-3 backdrop-blur-md">
              {/* Left & Right gradient fades for smooth marquee blending */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black/85 to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black/85 to-transparent z-10" />

              <div className="animate-marquee-infinite flex gap-4 py-1">
                {/* Batch 1 */}
                {brandsList.map((brand, bIdx) => (
                  <button
                    key={`brand-1-${bIdx}`}
                    type="button"
                    onClick={() => navigateToPartsCatalog('todos', brand.code)}
                    className="group shrink-0 flex items-center gap-3.5 px-5 py-3 rounded-md bg-white/[0.05] hover:bg-white/[0.14] border border-white/10 hover:border-[#F07F00]/70 transition-all duration-300 text-left cursor-pointer shadow-md hover:shadow-[0_0_25px_rgba(240,127,0,0.3)] hover:scale-105"
                  >
                    <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center font-headline font-black text-sm text-white/90 border border-white/15 group-hover:border-[#F07F00] group-hover:text-[#F07F00] group-hover:bg-[#F07F00]/15 transition-all overflow-hidden p-1">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
                      ) : (
                        brand.iconText
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-wider group-hover:text-[#F07F00] transition-colors flex items-center gap-1">
                        <span>{brand.name}</span>
                        <span className="text-xs text-white/40 group-hover:text-[#F07F00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                          ↗
                        </span>
                      </div>
                      <div className="text-[10px] text-white/60 flex items-center gap-1.5 mt-0.5">
                        <span>{brand.tag}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30"></span>
                        <span className="text-white/40">{brand.origin}</span>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Batch 2 (Duplicate for continuous infinite loop without seams) */}
                {brandsList.map((brand, bIdx) => (
                  <button
                    key={`brand-2-${bIdx}`}
                    type="button"
                    onClick={() => navigateToPartsCatalog('todos', brand.code)}
                    className="group shrink-0 flex items-center gap-3.5 px-5 py-3 rounded-md bg-white/[0.05] hover:bg-white/[0.14] border border-white/10 hover:border-[#F07F00]/70 transition-all duration-300 text-left cursor-pointer shadow-md hover:shadow-[0_0_25px_rgba(240,127,0,0.3)] hover:scale-105"
                  >
                    <div className="w-10 h-10 rounded-sm bg-white/10 flex items-center justify-center font-headline font-black text-sm text-white/90 border border-white/15 group-hover:border-[#F07F00] group-hover:text-[#F07F00] group-hover:bg-[#F07F00]/15 transition-all overflow-hidden p-1">
                      {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
                      ) : (
                        brand.iconText
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-wider group-hover:text-[#F07F00] transition-colors flex items-center gap-1">
                        <span>{brand.name}</span>
                        <span className="text-xs text-white/40 group-hover:text-[#F07F00] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                          ↗
                        </span>
                      </div>
                      <div className="text-[10px] text-white/60 flex items-center gap-1.5 mt-0.5">
                        <span>{brand.tag}</span>
                        <span className="w-1 h-1 rounded-full bg-white/30"></span>
                        <span className="text-white/40">{brand.origin}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quick Compatibility & Auto Parts Finder */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-container-lowest text-on-surface rounded-lg shadow-xl border border-surface-container overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 bg-surface-container-low border-b border-surface-container text-xs font-bold">
              <button
                type="button"
                onClick={() => setHeroTab('parts')}
                className={`p-3.5 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  heroTab === 'parts'
                    ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-xs font-black'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <AutoPartsIcon size={20} className={heroTab === 'parts' ? 'text-[#F07F00]' : 'text-primary'} />
                <span>Repuestos OEM</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroTab('workshop')}
                className={`p-3.5 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  heroTab === 'workshop'
                    ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-xs font-black'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <WorkshopServiceIcon size={20} className={heroTab === 'workshop' ? 'text-[#F07F00]' : 'text-[#212955]'} />
                <span>Citas Taller</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroTab('new_cars')}
                className={`p-3.5 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  heroTab === 'new_cars'
                    ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-xs font-black'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <VehicleIcon size={20} className={heroTab === 'new_cars' ? 'text-[#F07F00]' : 'text-[#212955]'} />
                <span>Autos 2025</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroTab('used_cars')}
                className={`p-3.5 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  heroTab === 'used_cars'
                    ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-xs font-black'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <AppleVerifiedSealIcon size={20} className={heroTab === 'used_cars' ? 'text-[#F07F00]' : 'text-[#212955]'} />
                <span>Seminuevos</span>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleHeroSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-surface-container pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-[#212955] flex items-center gap-1.5 uppercase tracking-wider font-headline text-sm">
                    <AppleTuneSlidersIcon size={18} className="text-[#F07F00]" />
                    Buscador Rápido de Compatibilidad
                  </span>
                  <p className="text-xs text-[#9D9D9C] font-body font-medium m-0">
                    {heroTab === 'parts' && 'Filtra y verifica repuestos compatibles con tu vehículo al instante'}
                    {heroTab === 'workshop' && 'Reserva turno prioritario en nuestro taller de alta tecnología en Cajamarca'}
                    {heroTab === 'new_cars' && 'Cotiza vehículos 0 km 2025 con bonos especiales'}
                    {heroTab === 'used_cars' && 'Seminuevos certificados con 150 puntos y garantía mecánica'}
                  </p>
                </div>
                <span className="text-[10px] bg-[#212955] text-white font-bold px-2.5 py-1 rounded-md border border-[#F07F00]/50 shrink-0 font-headline uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F07F00] animate-pulse"></span>
                  Compatibilidad &amp; Stock en Tiempo Real
                </span>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1.5">
                    Año del Vehículo
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-md px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                    <option value="2020">2020</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1.5">
                    Marca
                  </label>
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-md px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="Toyota">Toyota</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="Ford">Ford</option>
                    <option value="Mitsubishi">Mitsubishi</option>
                    <option value="Geely">Geely</option>
                    <option value="Jetour">Jetour</option>
                    <option value="BYD">BYD</option>
                    <option value="BMW">BMW</option>
                    <option value="Audi">Audi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1.5">
                    Modelo
                  </label>
                  <select
                    value={filterModel}
                    onChange={(e) => setFilterModel(e.target.value)}
                    className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-md px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="RAV4 Hybrid">RAV4 Hybrid</option>
                    <option value="Hilux Revo">Hilux Revo</option>
                    <option value="Frontier Pro-4X">Frontier Pro-4X</option>
                    <option value="Tucson Limited">Tucson Limited</option>
                    <option value="Coolray Sport">Coolray Sport</option>
                    <option value="Dashing Kunpeng">Dashing Kunpeng</option>
                    <option value="Corolla Cross">Corolla Cross</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1.5">
                    O buscar por Placa / Chasis VIN
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filterPlate}
                      onChange={(e) => setFilterPlate(e.target.value.toUpperCase())}
                      placeholder="Ej: ABC-123 / 4T1B11..."
                      maxLength={17}
                      className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-md px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-primary font-mono"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                      <AppleVerifiedSealIcon size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface mb-1.5">
                    Categoría / Sistema
                  </label>
                  <select
                    className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-md px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="todos">Todos los Sistemas &amp; Accesorios</option>
                    <option value="frenos">Frenos &amp; Pastillas OEM</option>
                    <option value="suspension">Suspensión &amp; Lift Kits</option>
                    <option value="llantas">Llantas &amp; Aros Off-Road</option>
                    <option value="accesorios4x4">Equipamiento 4x4 &amp; Tolva</option>
                    <option value="lubricantes">Aceites Sintéticos &amp; Fluidos</option>
                    <option value="baterias">Baterías AGM</option>
                    <option value="filtros">Filtros &amp; Mantenimiento</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] btn-primary py-3 px-6 text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2"
              >
                <AppleSearchIcon size={18} />
                <span>Consultar Catálogo Especializado</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 4. MAIN SPOTLIGHT: AUTOPARTES & REPUESTOS MÁS VENDIDOS (PRIORIDAD PRINCIPAL) */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F07F00]/20 text-[#F07F00] text-xs font-extrabold uppercase tracking-wider mb-1 border border-[#F07F00]/30">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                Alta Demanda &amp; Stock Inmediato
              </div>
              <h2 className="font-extrabold text-xl sm:text-2xl lg:text-3xl text-white tracking-tight">
                Autopartes &amp; Repuestos Originales
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-0.5 font-medium">
                Componentes OEM certificados con garantía oficial y servicio de instalación opcional en taller.
              </p>
            </div>

            <button
              onClick={() => navigateToPartsCatalog('todos')}
              className="min-h-[44px] px-4 py-2.5 bg-[#F07F00] hover:bg-[#d97300] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Explorar Todo el Catálogo de Repuestos</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>

          {/* Interactive Category Filter Pills for Autoparts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {[
              { id: 'todos', label: 'Todos los Repuestos' },
              { id: 'frenos', label: 'Frenos & Discos' },
              { id: 'lubricantes', label: 'Aceites & Filtros' },
              { id: 'suspension', label: 'Suspensión & Lift' },
              { id: 'accesorios4x4', label: 'Equipamiento 4x4' },
              { id: 'llantas', label: 'Llantas & Aros' },
              { id: 'baterias', label: 'Baterías AGM' },
              { id: 'seguridad', label: 'Láminas de Seguridad' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setPartsShowcaseCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[38px] ${
                  partsShowcaseCategory === cat.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-surface-container'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Autoparts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayedParts.map((part) => {
              const inWish = isInWishlist(part.sku);
              return (
                <div
                  key={part.sku}
                  className="bg-surface-container-lowest rounded-md border border-surface-container hover:border-primary/40 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
                >
                  {/* Image and Badges */}
                  <div className="relative aspect-[4/3] bg-surface-container-low p-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={part.image}
                      alt={part.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                    />

                    {/* Brand Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-xs uppercase tracking-wider shadow-sm">
                        {part.brand}
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={() =>
                        toggleWishlist({
                          id: part.sku,
                          type: 'part',
                          title: part.name,
                          subtitle: `${part.brand} • SKU: ${part.sku}`,
                          sku: part.sku,
                          priceSoles: part.priceSoles,
                          oldPriceSoles: part.oldPriceSoles,
                          image: part.image,
                          categoryBadge: part.category,
                        })
                      }
                      className={`absolute top-3 right-3 w-8 h-8 rounded-md flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                        inWish ? 'bg-secondary-container text-white' : 'bg-white/90 hover:bg-white text-on-surface'
                      }`}
                      aria-label="Favorito"
                    >
                      <AppleHeartIcon size={16} />
                    </button>

                    {part.stockText && (
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xs text-emerald-800 font-bold border border-emerald-200 shadow-xs text-center">
                        <span className="flex items-center justify-center gap-1 text-center">
                          {part.stockText}
                        </span>
                        <span className="font-mono text-outline text-[9px] text-center">SKU: {part.sku}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                        {part.category.toUpperCase()}
                      </div>
                      <h3
                        onClick={() => {
                          setSelectedPartSku(part.sku);
                          setCurrentView('part-pdp');
                        }}
                        className="font-bold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors cursor-pointer line-clamp-2 mt-0.5"
                      >
                        {part.name}
                      </h3>
                      <p className="text-[11px] text-outline line-clamp-1 mt-1">
                        {part.compatibleVehicle || (part.features && part.features[0]) || 'Garantía oficial'}
                      </p>
                    </div>

                    {/* Price and Add to Cart Action */}
                    <div className="pt-2 border-t border-surface-container space-y-2.5">
                      <div className="flex items-center justify-between gap-2 min-h-[46px]">
                        <div className="flex flex-col justify-center shrink-0 whitespace-nowrap">
                          {part.oldPriceSoles && (
                            <span className="text-[11px] text-outline line-through block leading-none font-mono mb-1 whitespace-nowrap">
                              S/ {part.oldPriceSoles.toLocaleString()}
                            </span>
                          )}
                          <span className="font-black text-lg text-primary font-mono leading-none whitespace-nowrap">
                            S/ {part.priceSoles.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] text-secondary font-bold bg-secondary-container/10 px-2 py-1 rounded-xs shrink-0 whitespace-nowrap text-center flex items-center justify-center">
                          Instalación +S/ 45
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedPartSku(part.sku);
                            setCurrentView('part-pdp');
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 btn-ghost text-xs text-center"
                        >
                          Ficha Técnica
                        </button>
                        <button
                          onClick={() => handleAddToCart(part, false)}
                          className="min-h-[38px] px-2.5 py-1.5 btn-primary text-xs uppercase flex items-center justify-center gap-1.5"
                        >
                          <AppleCartIcon size={16} />
                          <span>Comprar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. ESCAPARATE COMERCIAL DE OFERTAS & ESPECIALIDADES (ESTILO RETAIL / SAGA FALABELLA EXACT LAYOUT) */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header centered as in reference */}
          <div className="text-center max-w-3xl mx-auto space-y-1">
            <h2 className="font-extrabold text-xl sm:text-2xl lg:text-3xl text-white tracking-tight flex items-center justify-center gap-1">
              <span>Especialidades &amp; Tecnología Automotriz</span>
              <span className="text-[#F07F00] text-2xl sm:text-4xl leading-none">.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#9D9D9C] font-semibold">
              Potencia, seguridad y rendimiento certificado para tu vehículo con facilidades de pago en hasta 12 cuotas
            </p>
          </div>

          {/* LEVEL 1: TOP 4 CARDS (Exact Saga Falabella Retail Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {topOfferCards.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => {
                  if (item.type === 'service') {
                    setCurrentView('services');
                    showToast(`Redirigiendo a agenda de ${item.title}`);
                  } else {
                    setSelectedPartSku(item.sku);
                    setCurrentView('part-pdp');
                  }
                }}
                className="bg-[#FFFFFF] rounded-none overflow-hidden shadow-lg border border-[#9D9D9C]/25 hover:border-[#F07F00] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between group cursor-pointer"
              >
                {/* Image Container with Top Installment Badge & Bottom Category Bar */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Top-Left Cuotas Badge in Corporate Orange #F07F00 */}
                  <div className="absolute top-2 left-2 bg-[#F07F00] text-white px-2 py-0.5 rounded-none shadow-md flex items-center gap-1 border border-white/30 z-10">
                    <span className="w-1.5 h-1.5 rounded-none bg-white animate-pulse"></span>
                    <span className="text-[9px] font-extrabold uppercase tracking-tight text-white leading-none">
                      12 cuotas
                    </span>
                    <span className="text-[11px] font-black text-white font-mono leading-none">
                      S/ {item.cuota}
                    </span>
                  </div>

                  {/* Top-Right Quick Add Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.type === 'service') {
                        setCurrentView('services');
                        showToast(`Agendando ${item.title}`);
                      } else {
                        addToCart({
                          type: 'part',
                          title: item.title,
                          skuOrCode: item.sku,
                          priceSoles: item.priceSoles,
                          image: item.image,
                          specsSubtitle: `${item.brand} • ${item.categoryLabel}`,
                          hasWorkshopInstallation: false,
                          installationFeeSoles: 0,
                          quantity: 1,
                        });
                        showToast(`${item.title} agregado al carrito`);
                      }
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-none bg-white/90 hover:bg-[#F07F00] text-[#212955] hover:text-white flex items-center justify-center transition-colors shadow-sm z-10 cursor-pointer"
                    title={item.type === 'service' ? 'Agendar cita' : 'Agregar al carrito'}
                  >
                    <AppleCartIcon size={16} />
                  </button>

                  {/* Bottom Category Bar on Image */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-2 px-3 text-center z-10">
                    <span className="font-extrabold text-xs sm:text-sm tracking-wider text-white uppercase drop-shadow-md">
                      {item.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Bottom Information Block (Split Left & Right) */}
                <div className="p-3 bg-[#FFFFFF] flex items-stretch justify-between gap-2 border-t border-[#9D9D9C]/20 flex-1">
                  {/* Left: Brand & Product Name */}
                  <div className="flex-1 min-w-0 pr-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-black text-[#212955] uppercase tracking-wider block">
                        {item.brand}
                      </span>
                      <h4 className="text-[11px] sm:text-xs text-[#212955] font-semibold line-clamp-2 leading-tight mt-0.5" title={item.title}>
                        {item.title}
                      </h4>
                    </div>
                    <div className="mt-2 text-[10px] text-[#9D9D9C] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-none bg-emerald-500"></span>
                      <span>{item.stockText || 'Stock en Cajamarca'}</span>
                    </div>
                  </div>

                  {/* Right: Price Box in Official Orange #F07F00 */}
                  <div className="w-24 sm:w-28 bg-[#F07F00] rounded-none p-2 flex flex-col items-center justify-center text-center shrink-0 shadow-xs group-hover:bg-[#d97300] transition-colors">
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-none bg-[#212955] text-white leading-tight mb-0.5">
                      OFERTA
                    </span>
                    <div className="font-black text-base sm:text-lg text-white font-mono leading-none tracking-tight">
                      S/ {item.priceSoles.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-white/85 line-through font-mono mt-0.5">
                      S/ {item.normalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* LEVEL 2: PANORAMIC POWER BANNER (Dynamic Center Feature) */}
          <div className={`w-full bg-[#212955] border border-white/20 rounded-none overflow-hidden shadow-2xl p-4 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-6 relative group ${panoramicBanner.bgGradient || ''}`}>
            {/* Background Pattern Subtle Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#212955] via-[#212955]/95 to-[#181e40] z-0 pointer-events-none" />

            {/* Left Featured Item */}
            <div
              onClick={() => {
                setSelectedPartSku(panoramicBanner.leftCard.sku || 'PART-KEKO-BAR-01');
                setCurrentView('part-pdp');
              }}
              className="relative z-10 flex items-center gap-4 bg-white/10 hover:bg-white/15 p-3 rounded-none border border-white/15 cursor-pointer transition-all duration-300 w-full lg:w-auto lg:min-w-[300px] flex-1"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-900 rounded-none overflow-hidden shrink-0 relative">
                <img
                  src={panoramicBanner.leftCard.image}
                  alt={panoramicBanner.leftCard.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-1 left-1 bg-[#F07F00] text-white text-[8px] font-black px-1.5 py-0.5 rounded-none">
                  {panoramicBanner.leftCard.installmentText || '12c'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-[#F07F00] tracking-wider">
                  {panoramicBanner.leftCard.brand}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                  {panoramicBanner.leftCard.title}
                </h4>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-black text-base sm:text-lg text-white font-mono">
                    S/ {panoramicBanner.leftCard.priceSoles.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#9D9D9C] line-through font-mono">
                    S/ {panoramicBanner.leftCard.normalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Center Call to Action & Category Teaser */}
            <div className="relative z-10 text-center space-y-2.5 px-4 max-w-md shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-[#F07F00]/20 text-[#F07F00] text-[10px] font-black uppercase tracking-widest border border-[#F07F00]/40">
                {panoramicBanner.tag}
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl lg:text-3xl text-white tracking-wide leading-tight uppercase">
                {panoramicBanner.title}
              </h3>
              <div>
                <button
                  type="button"
                  onClick={() => navigateToPartsCatalog(panoramicBanner.targetCategory || 'accesorios4x4')}
                  className="inline-flex items-center gap-2 bg-[#F07F00] hover:bg-[#d97300] active:scale-95 text-white text-xs font-bold px-6 py-2.5 rounded-none tracking-wider uppercase shadow-lg hover:shadow-[#F07F00]/30 transition-all cursor-pointer border border-white/20"
                >
                  <span>{panoramicBanner.buttonText || '¡VER TODO!'}</span>
                  <AppleChevronRightIcon size={14} />
                </button>
              </div>
            </div>

            {/* Right Featured Item */}
            <div
              onClick={() => {
                setSelectedPartSku(panoramicBanner.rightCard.sku || 'PART-WARN-WINCH-01');
                setCurrentView('part-pdp');
              }}
              className="relative z-10 flex items-center gap-4 bg-white/10 hover:bg-white/15 p-3 rounded-none border border-white/15 cursor-pointer transition-all duration-300 w-full lg:w-auto lg:min-w-[300px] flex-1"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-900 rounded-none overflow-hidden shrink-0 relative">
                <img
                  src={panoramicBanner.rightCard.image}
                  alt={panoramicBanner.rightCard.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute top-1 left-1 bg-[#F07F00] text-white text-[8px] font-black px-1.5 py-0.5 rounded-none">
                  {panoramicBanner.rightCard.installmentText || '12c'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-[#F07F00] tracking-wider font-headline">
                  {panoramicBanner.rightCard.brand}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                  {panoramicBanner.rightCard.title}
                </h4>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-headline font-black text-lg text-white font-mono">
                    S/ {panoramicBanner.rightCard.priceSoles.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#9D9D9C] line-through font-mono">
                    S/ {panoramicBanner.rightCard.normalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* LEVEL 3: BOTTOM 4 CARDS (Exact Saga Falabella Retail Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {bottomOfferCards.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => {
                  if (item.type === 'service') {
                    setCurrentView('services');
                    showToast(`Redirigiendo a agenda de ${item.title}`);
                  } else {
                    setSelectedPartSku(item.sku);
                    setCurrentView('part-pdp');
                  }
                }}
                className="bg-[#FFFFFF] rounded-none overflow-hidden shadow-lg border border-[#9D9D9C]/25 hover:border-[#F07F00] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between group cursor-pointer"
              >
                {/* Image Container with Top Installment Badge & Bottom Category Bar */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />

                  {/* Top-Left Cuotas Badge in Corporate Orange #F07F00 */}
                  <div className="absolute top-2 left-2 bg-[#F07F00] text-white px-2 py-0.5 rounded-none shadow-md flex items-center gap-1 border border-white/30 z-10">
                    <span className="w-1.5 h-1.5 rounded-none bg-white animate-pulse"></span>
                    <span className="text-[9px] font-extrabold uppercase tracking-tight text-white leading-none">
                      12 cuotas
                    </span>
                    <span className="text-[11px] font-black text-white font-mono leading-none">
                      S/ {item.cuota}
                    </span>
                  </div>

                  {/* Top-Right Quick Add/Book Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.type === 'service') {
                        setCurrentView('services');
                        showToast(`Agendando ${item.title}`);
                      } else {
                        addToCart({
                          type: 'part',
                          title: item.title,
                          skuOrCode: item.sku,
                          priceSoles: item.priceSoles,
                          image: item.image,
                          specsSubtitle: `${item.brand} • ${item.categoryLabel}`,
                          hasWorkshopInstallation: false,
                          installationFeeSoles: 0,
                          quantity: 1,
                        });
                        showToast(`${item.title} agregado al carrito`);
                      }
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-none bg-white/90 hover:bg-[#F07F00] text-[#212955] hover:text-white flex items-center justify-center transition-colors shadow-sm z-10 cursor-pointer"
                    title={item.type === 'service' ? 'Agendar cita' : 'Agregar al carrito'}
                  >
                    <AppleCartIcon size={16} />
                  </button>

                  {/* Bottom Category Bar on Image */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-6 pb-2 px-3 text-center z-10">
                    <span className="font-headline font-black text-xs sm:text-sm tracking-widest text-white uppercase drop-shadow-md">
                      {item.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Bottom Information Block */}
                <div className="p-3 bg-[#FFFFFF] flex items-stretch justify-between gap-2 border-t border-[#9D9D9C]/20 flex-1">
                  {/* Left: Brand & Product Name */}
                  <div className="flex-1 min-w-0 pr-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-black text-[#212955] uppercase tracking-wider block font-headline">
                        {item.brand}
                      </span>
                      <h4 className="text-[11px] sm:text-xs text-[#212955] font-semibold line-clamp-2 leading-tight mt-0.5" title={item.title}>
                        {item.title}
                      </h4>
                    </div>
                    <div className="mt-2 text-[10px] text-[#9D9D9C] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-none bg-emerald-500"></span>
                      <span>{item.stockText || (item.type === 'service' ? 'Taller Cajamarca' : 'Stock en Cajamarca')}</span>
                    </div>
                  </div>

                  {/* Right: Price Box in Official Orange #F07F00 */}
                  <div className="w-24 sm:w-28 bg-[#F07F00] rounded-none p-2 flex flex-col items-center justify-center text-center shrink-0 shadow-xs group-hover:bg-[#d97300] transition-colors">
                    <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-none bg-[#212955] text-white leading-tight mb-0.5 font-headline">
                      OFERTA
                    </span>
                    <div className="font-headline font-black text-base sm:text-lg text-white font-mono leading-none tracking-tight">
                      S/ {item.priceSoles.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-white/85 line-through font-mono mt-0.5">
                      S/ {item.normalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. VEHICLES COMPACT SHOWCASE */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-white/15 pb-4">
            <div>
              <span className="text-xs font-bold text-[#F07F00] uppercase tracking-wider">
                Concesionario Multimarca 2025
              </span>
              <h2 className="font-headline font-bold text-2xl text-white">
                Vehículos 0 km con Bonos Especiales
              </h2>
              <p className="text-xs text-white/80 mt-0.5 font-medium">
                Modelos seleccionados listos para entrega inmediata con financiamiento y retoma.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('cars')}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-white hover:text-[#F07F00] bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-1 transition-colors cursor-pointer border border-white/20"
            >
              <span>Ver catálogo completo de autos ({vehicles.length})</span>
              <AppleChevronRightIcon size={16} />
            </button>
          </div>

          {/* Compact 3-car showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newCars.slice(0, 3).map((car) => {
              const inWish = isInWishlist(car.id);
              return (
                <div
                  key={car.id}
                  className="bg-surface-container-lowest rounded-md border border-surface-container hover:border-primary/40 hover:shadow-xl transition-all overflow-hidden flex flex-col group"
                >
                  {/* Photo & Badges */}
                  <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden group">
                    <SafeImage
                      src={car.image}
                      fallbackSrc={FALLBACK_IMAGES.vehicleSuv}
                      typeHint="vehicle"
                      alt={car.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 hover:scale-110 cursor-pointer"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-xs shadow-sm">
                        0 KM 2025
                      </span>
                      {car.discountBonus && (
                        <span className="bg-secondary-container text-white text-[10px] font-bold px-2 py-0.5 rounded-xs shadow-sm">
                          {car.discountBonus}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        toggleWishlist({
                          id: car.id,
                          type: 'vehicle',
                          title: car.name,
                          subtitle: car.subtitle,
                          sku: car.id,
                          priceSoles: car.priceSoles,
                          priceUsd: car.priceUsd,
                          oldPriceSoles: car.oldPriceSoles,
                          image: car.image,
                          categoryBadge: 'Vehículo Nuevo 2025',
                        })
                      }
                      className={`absolute top-3 right-3 min-w-[38px] min-h-[38px] rounded-md flex items-center justify-center transition-colors shadow-md cursor-pointer ${
                        inWish ? 'bg-secondary-container text-white' : 'bg-white/90 hover:bg-white text-on-surface'
                      }`}
                      aria-label="Guardar en lista de deseos"
                    >
                      <AppleHeartIcon size={18} />
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-outline flex items-center gap-1.5">
                        <span>{car.brand}</span>
                        <span>•</span>
                        <span>{car.bodyType}</span>
                        <span>•</span>
                        <span className="text-emerald-700">{car.fuelType}</span>
                      </div>
                      <h3 className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors mt-0.5">
                        {car.name}
                      </h3>
                      <p className="text-xs text-outline line-clamp-1 mt-0.5">
                        {car.subtitle}
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="border-t border-surface-container pt-3">
                      <div className="flex items-end justify-between gap-2 min-h-[46px]">
                        <div className="flex flex-col justify-end shrink-0 whitespace-nowrap">
                          {car.oldPriceSoles && (
                            <span className="text-[11px] text-outline line-through block leading-none font-mono mb-1 whitespace-nowrap">
                              S/ {car.oldPriceSoles.toLocaleString()}
                            </span>
                          )}
                          <div className="font-headline font-extrabold text-lg text-primary font-mono leading-none whitespace-nowrap">
                            S/ {car.priceSoles.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right shrink-0 whitespace-nowrap">
                          <div className="text-[10px] text-outline font-mono leading-tight">
                            ~${car.priceUsd.toLocaleString()} USD
                          </div>
                          <div className="text-xs font-bold text-secondary leading-tight mt-0.5">
                            Cuotas S/ {car.monthlySoles}/mes
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <button
                          onClick={() => {
                            setSelectedVehicleId(car.id);
                            setCurrentView('vehicle-pdp');
                          }}
                          className="w-full min-h-[38px] px-4 py-2 btn-secondary text-xs uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Ver Ficha Técnica</span>
                          <AppleChevronRightIcon size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. SEMINUEVOS CERTIFICADOS BANNER */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-surface-container-high via-surface-container-low to-surface-container rounded-lg p-6 sm:p-10 border border-surface-container flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary">
              Seminuevos con la misma confianza que un auto nuevo.
            </h3>
            <p className="text-xs sm:text-sm text-outline leading-relaxed">
              Cada vehículo seminuevo en Nor Celis es sometido a un riguroso escaneo de motor, caja, suspensión y récord de siniestros. Te entregamos 1 año de garantía escrita y kilometraje garantizado por contrato.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setCurrentView('cars')}
                className="min-h-[44px] bg-primary hover:bg-primary-container text-white text-xs font-bold px-5 py-3 rounded-md shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Ver Seminuevos Disponibles ({usedCars.length})</span>
                <AppleChevronRightIcon size={16} />
              </button>
              <button
                onClick={() => setCurrentView('trade-in')}
                className="min-h-[44px] bg-white hover:bg-surface-container-lowest text-primary text-xs font-bold px-5 py-3 rounded-md border border-surface-container transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PlanRetomaIcon size={18} className="text-secondary" />
                <span>Plan Retoma: Tasar mi auto actual</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            {usedCars.slice(0, 2).map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  setSelectedVehicleId(u.id);
                  setCurrentView('cars');
                }}
                className="bg-white p-3 rounded-md border border-surface-container hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="overflow-hidden rounded-sm mb-2">
                  <SafeImage
                    src={u.image}
                    fallbackSrc={FALLBACK_IMAGES.vehicleSedan}
                    typeHint="vehicle"
                    alt={u.name}
                    className="w-44 h-28 object-cover rounded-sm transition-transform duration-500 ease-out group-hover:scale-110 hover:scale-110"
                  />
                </div>
                <div className="text-xs font-bold text-on-surface truncate">{u.name}</div>
                <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                  S/ {u.priceSoles.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
