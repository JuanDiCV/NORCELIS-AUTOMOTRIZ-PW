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
  Showroom360Icon,
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
    setIsViewer360Open,
    vehicles,
    autoParts,
    addToCart,
    toggleWishlist,
    isInWishlist,
    showToast,
    navigateToPartsCatalog,
    homeCategories,
    officialBrands,
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
              <div className="flex bg-white/10 p-1 rounded-xl border border-white/15 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCategoryDisplayMode('flagship')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
                className="min-h-[40px] px-4 py-2 text-xs font-bold text-white hover:text-[#F07F00] bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              >
                <span>Ver Catálogo Completo ({autoParts.length})</span>
                <AppleChevronRightIcon size={16} />
              </button>
            </div>
          </div>

          {/* Cinematic Category Cards (Inspired by Fox Factory / Live Valve Reference) */}
          <div
            className={`grid gap-4 sm:gap-5 ${
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
                className="group relative h-[440px] sm:h-[480px] rounded-3xl overflow-hidden border border-white/15 hover:border-white/80 transition-all duration-500 text-left flex flex-col justify-end p-6 cursor-pointer shadow-2xl hover:shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:-translate-y-1"
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

                {/* Top Floating Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F07F00] bg-black/75 px-3 py-1 rounded-full border border-[#F07F00]/30 backdrop-blur-md">
                    {cat.tag}
                  </span>
                  <span className="text-[10px] font-bold text-white/70 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-md">
                    {cat.badge}
                  </span>
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-10 space-y-2">
                  <h3 className="font-headline font-black text-3xl sm:text-4xl text-white tracking-wider leading-none uppercase drop-shadow-md group-hover:text-white transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/75 line-clamp-2 leading-relaxed font-medium">
                    {cat.subtitle}
                  </p>

                  {/* Action Link like "LEARN MORE ↗" in reference image */}
                  <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                    <span className="font-headline font-black tracking-widest text-sm text-white group-hover:text-[#F07F00] flex items-center gap-1.5 transition-colors">
                      <span>VER REPUESTOS</span>
                      <span className="text-base group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                        ↗
                      </span>
                    </span>
                    <span className="text-[11px] font-bold text-white/60 group-hover:text-white transition-colors">
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
                    className="group shrink-0 flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.14] border border-white/10 hover:border-[#F07F00]/70 transition-all duration-300 text-left cursor-pointer shadow-md hover:shadow-[0_0_25px_rgba(240,127,0,0.3)] hover:scale-105"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-headline font-black text-sm text-white/90 border border-white/15 group-hover:border-[#F07F00] group-hover:text-[#F07F00] group-hover:bg-[#F07F00]/15 transition-all overflow-hidden p-1">
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
                    className="group shrink-0 flex items-center gap-3.5 px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.14] border border-white/10 hover:border-[#F07F00]/70 transition-all duration-300 text-left cursor-pointer shadow-md hover:shadow-[0_0_25px_rgba(240,127,0,0.3)] hover:scale-105"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-headline font-black text-sm text-white/90 border border-white/15 group-hover:border-[#F07F00] group-hover:text-[#F07F00] group-hover:bg-[#F07F00]/15 transition-all overflow-hidden p-1">
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
          <div className="bg-surface-container-lowest text-on-surface rounded-3xl shadow-xl border border-surface-container overflow-hidden">
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
                <span className="text-[10px] bg-[#212955] text-white font-bold px-3 py-1 rounded-full border border-[#F07F00]/50 shrink-0 font-headline uppercase tracking-wider shadow-xs flex items-center gap-1.5">
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
                    className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
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
                    className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
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
                    className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
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
                      className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-primary font-mono"
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
                    className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-primary cursor-pointer"
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

      {/* 4. Trust Strip con Estilo Apple y Microgradientes */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm group hover:border-emerald-500/40 transition-colors">
            <AppleIconBadge variant="emerald" size="md">
              <AppleVerifiedSealIcon size={22} className="text-white" />
            </AppleIconBadge>
            <div>
              <div className="text-xs font-bold text-primary">Autopartes 100% Originales</div>
              <div className="text-[11px] text-outline">Garantía oficial de fábrica y boleta/factura</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm group hover:border-[#212955]/40 transition-colors">
            <AppleIconBadge variant="secondary" size="md">
              <AutoPartsIcon size={22} className="text-white" />
            </AppleIconBadge>
            <div>
              <div className="text-xs font-bold text-primary">Compatibilidad Verificada</div>
              <div className="text-[11px] text-outline">Por catálogo técnico OEM y chasis VIN</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm group hover:border-[#F07F00]/40 transition-colors">
            <AppleIconBadge variant="primary" size="md">
              <ExpressDeliveryVanIcon size={22} className="text-white" />
            </AppleIconBadge>
            <div>
              <div className="text-xs font-bold text-primary">Despacho 24h &amp; Retiro</div>
              <div className="text-[11px] text-outline">Sede Cajamarca: Av. Vía de Evitamiento Sur 6003</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm group hover:border-[#212955]/40 transition-colors">
            <AppleIconBadge variant="subtle-blue" size="md">
              <WorkshopServiceIcon size={22} className="text-[#212955]" />
            </AppleIconBadge>
            <div>
              <div className="text-xs font-bold text-primary">Instalación Opcional en Taller</div>
              <div className="text-[11px] text-outline">Mano de obra certificada e inspección</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MAIN SPOTLIGHT: AUTOPARTES & REPUESTOS MÁS VENDIDOS (PRIORIDAD PRINCIPAL) */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F07F00]/20 text-[#F07F00] text-xs font-extrabold uppercase tracking-wider mb-1 border border-[#F07F00]/30">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                Alta Demanda &amp; Stock Inmediato
              </div>
              <h2 className="font-headline font-black text-2xl sm:text-3xl text-white">
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
                  className="bg-surface-container-lowest rounded-2xl border border-surface-container hover:border-primary/40 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
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
                      <span className="bg-primary/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
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
                      className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                        inWish ? 'bg-secondary-container text-white' : 'bg-white/90 hover:bg-white text-on-surface'
                      }`}
                      aria-label="Favorito"
                    >
                      <AppleHeartIcon size={16} />
                    </button>

                    {part.stockText && (
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-emerald-800 font-bold border border-emerald-200">
                        <span className="flex items-center gap-1">
                          {part.stockText}
                        </span>
                        <span className="font-mono text-outline">SKU: {part.sku}</span>
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
                        className="font-headline font-bold text-xs sm:text-sm text-on-surface group-hover:text-primary transition-colors cursor-pointer line-clamp-2 mt-0.5"
                      >
                        {part.name}
                      </h3>
                      <p className="text-[11px] text-outline line-clamp-1 mt-1">
                        {part.compatibleVehicle || (part.features && part.features[0]) || 'Garantía oficial'}
                      </p>
                    </div>

                    {/* Price and Add to Cart Action */}
                    <div className="pt-2 border-t border-surface-container space-y-2.5">
                      <div className="flex items-end justify-between gap-2 min-h-[46px]">
                        <div className="flex flex-col justify-end shrink-0 whitespace-nowrap">
                          {part.oldPriceSoles && (
                            <span className="text-[11px] text-outline line-through block leading-none font-mono mb-1 whitespace-nowrap">
                              S/ {part.oldPriceSoles.toLocaleString()}
                            </span>
                          )}
                          <span className="font-headline font-black text-lg text-primary font-mono leading-none whitespace-nowrap">
                            S/ {part.priceSoles.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] text-secondary font-bold bg-secondary-container/10 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
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

      {/* 5. WORKSHOP & DETAILING SERVICES SECTION */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-white/15 pb-4">
            <div>
              <span className="text-xs font-bold text-[#F07F00] uppercase tracking-wider flex items-center gap-1">
                <WorkshopServiceIcon size={16} className="text-[#F07F00]" />
                Centro de Alta Ingeniería Automotriz • Sede Cajamarca
              </span>
              <h2 className="font-headline font-bold text-2xl text-white">
                Servicios Especializados de Taller &amp; Detailing
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('services')}
              className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-white hover:text-[#F07F00] bg-white/10 hover:bg-white/20 rounded-xl flex items-center gap-1 transition-colors cursor-pointer border border-white/20"
            >
              <span>Ver los 8 Paquetes &amp; Agendar Cita</span>
              <AppleChevronRightIcon size={16} />
            </button>
          </div>

          {/* Quick Service Cards Grid con Iconos Apple Especializados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Mantenimiento Preventivo 10k/20k/40k',
                desc: 'Escaneo Techstream, cambio de fluidos Mobil 1 y 25 puntos de inspección.',
                price: 'Desde S/ 280',
                time: 'Tiempo: 90 min',
                icon: WorkshopServiceIcon,
                badge: 'Más Solicitado',
                badgeColor: 'bg-primary text-white',
                badgeVariant: 'primary' as const,
              },
              {
                title: 'Alineamiento 3D & Enllantado',
                desc: 'Alineación láser sin contacto de aro y balanceo dinámico con plomos adhesivos.',
                price: 'Desde S/ 49 /rueda',
                time: 'Tiempo: 45 min',
                icon: TireOffRoadIcon,
                badge: 'Tecnología Láser',
                badgeColor: 'bg-amber-600 text-white',
                badgeVariant: 'amber' as const,
              },
              {
                title: 'Láminas Nanocerámicas LLumar',
                desc: '96% de rechazo infrarrojo, 99% bloqueo UV y certificado para permiso PNP.',
                price: 'Desde S/ 420',
                time: 'Cabina presurizada',
                icon: CertifiedShieldIcon,
                badge: 'Garantía 10 Años',
                badgeColor: 'bg-emerald-600 text-white',
                badgeVariant: 'emerald' as const,
              },
              {
                title: 'Detailing Cerámico 9H 3M',
                desc: 'Corrección de laca en 3 pasos, descontaminado de pintura y sellado 9H.',
                price: 'Desde S/ 850',
                time: 'Tiempo: 24h',
                icon: DetailingPPFIcon,
                badge: 'Acabado Espejo',
                badgeColor: 'bg-purple-600 text-white',
                badgeVariant: 'secondary' as const,
              },
              {
                title: 'Frenos & Discos OEM Brembo/Toyota',
                desc: 'Cambio de pastillas cerámicas, rectificado de discos y purga electrónica.',
                price: 'Desde S/ 190',
                time: 'Tiempo: 60 min',
                icon: BrakeDiscIcon,
                badge: 'Repuesto Original',
                badgeColor: 'bg-blue-600 text-white',
                badgeVariant: 'subtle-orange' as const,
              },
              {
                title: 'Suspensión Pesada & Lift Kits 4x4',
                desc: 'Instalación de paquetes TRAKKO® +2", amortiguadores reforzados y gemelas.',
                price: 'Cotización a medida',
                time: 'Para Trocha y Minería',
                icon: SuspensionHDIcon,
                badge: 'Off-Road Pro',
                badgeColor: 'bg-cyan-700 text-white',
                badgeVariant: 'subtle-blue' as const,
              },
            ].map((svc, idx) => {
              const ServiceIcon = svc.icon;
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentView('services')}
                  className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container hover:border-primary hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <AppleIconBadge variant={svc.badgeVariant} size="md">
                        <ServiceIcon size={20} />
                      </AppleIconBadge>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${svc.badgeColor}`}>
                        {svc.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                        {svc.title}
                      </h3>
                      <p className="text-xs text-outline mt-1 leading-relaxed">
                        {svc.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-primary font-mono">{svc.price}</span>
                      <div className="text-[10px] text-outline">{svc.time}</div>
                    </div>
                    <span className="text-xs font-bold text-secondary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>Agendar</span>
                      <AppleChevronRightIcon size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Workshop & Detailing Hero Feature Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-950 text-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
            <div className="lg:col-span-7 space-y-4 z-10">
              <span className="text-xs uppercase font-bold tracking-widest text-[#F07F00]">
                Taller Oficial &amp; Centro de Mantenimiento Nor Celis
              </span>
              <h3 className="font-headline font-extrabold text-2xl sm:text-3xl text-white">
                Equipamiento de Última Generación en Cajamarca
              </h3>
              <p className="text-xs sm:text-sm text-surface-container-highest/80 leading-relaxed">
                Contamos con alineadoras láser 3D, cabina presurizada de pintura y detailing, escáneres multimarca oficiales y técnicos certificados con garantía en cada servicio.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('services')}
                  className="min-h-[46px] btn-primary text-sm uppercase px-7 py-3.5 flex items-center gap-2"
                >
                  <WorkshopServiceIcon size={18} />
                  <span>Agendar Cita en Taller Sin Colas</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 z-10">
              <div
                onClick={() => setCurrentView('services')}
                className="w-full h-56 sm:h-64 rounded-2xl p-6 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/15 hover:border-[#F07F00]/50 shadow-2xl flex flex-col items-center justify-center text-center group transition-all duration-300 cursor-pointer relative overflow-hidden"
              >
                {/* Subtle ambient light */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#F07F00]/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Garage Icon Emblem */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#F07F00] to-[#d97300] text-white flex items-center justify-center shadow-xl shadow-[#F07F00]/30 mb-3.5 group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
                  <span className="material-symbols-outlined text-4xl sm:text-5xl">garage</span>
                </div>

                <div className="space-y-1 relative z-10">
                  <h4 className="font-headline font-bold text-base sm:text-lg text-white group-hover:text-[#F07F00] transition-colors flex items-center justify-center gap-1.5">
                    <span>Garaje &amp; Bahías de Taller</span>
                  </h4>
                  <p className="text-xs text-white/70 max-w-xs leading-relaxed">
                    Equipamiento oficial, elevadores hidráulicos y diagnóstico por escáner OEM.
                  </p>
                </div>

                <div className="mt-3.5 flex items-center gap-2 relative z-10">
                  <span className="text-[11px] font-bold text-[#F07F00] bg-[#F07F00]/15 px-3 py-1 rounded-full border border-[#F07F00]/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F07F00] animate-pulse"></span>
                    <span>Bahías de Servicio Activas</span>
                  </span>
                </div>
              </div>
            </div>
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
                  className="bg-surface-container-lowest rounded-2xl border border-surface-container hover:border-primary/40 hover:shadow-xl transition-all overflow-hidden flex flex-col group"
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
                      <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                        0 KM 2025
                      </span>
                      {car.discountBonus && (
                        <span className="bg-secondary-container text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
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
                      className={`absolute top-3 right-3 min-w-[38px] min-h-[38px] rounded-xl flex items-center justify-center transition-colors shadow-md cursor-pointer ${
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

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                          onClick={() => {
                            setSelectedVehicleId(car.id);
                            setCurrentView('vehicle-pdp');
                          }}
                          className="min-h-[38px] px-3 py-2 btn-secondary text-xs uppercase"
                        >
                          Ficha Técnica
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVehicleId(car.id);
                            setIsViewer360Open(true);
                          }}
                          className="min-h-[38px] px-3 py-2 btn-ghost text-xs flex items-center justify-center gap-1.5"
                        >
                          <Showroom360Icon size={16} />
                          <span>Visor 360°</span>
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
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-surface-container-high via-surface-container-low to-surface-container rounded-3xl p-6 sm:p-10 border border-surface-container flex flex-col lg:flex-row items-center justify-between gap-8">
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
                className="min-h-[44px] bg-primary hover:bg-primary-container text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Ver Seminuevos Disponibles ({usedCars.length})</span>
                <AppleChevronRightIcon size={16} />
              </button>
              <button
                onClick={() => setCurrentView('trade-in')}
                className="min-h-[44px] bg-white hover:bg-surface-container-lowest text-primary text-xs font-bold px-5 py-3 rounded-xl border border-surface-container transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
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
                className="bg-white p-3 rounded-2xl border border-surface-container hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="overflow-hidden rounded-xl mb-2">
                  <SafeImage
                    src={u.image}
                    fallbackSrc={FALLBACK_IMAGES.vehicleSedan}
                    typeHint="vehicle"
                    alt={u.name}
                    className="w-44 h-28 object-cover rounded-xl transition-transform duration-500 ease-out group-hover:scale-110 hover:scale-110"
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
