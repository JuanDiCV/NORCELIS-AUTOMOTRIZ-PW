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
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5">
            <div className="space-y-3">
              <span className="section-eyebrow">Líneas especializadas</span>
              <h2 className="section-title">Categorías de autopartes y repuestos</h2>
              <p className="section-subtitle">
                Autopartes de ingeniería certificada con garantía de fábrica e instalación opcional en nuestro taller.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigateToPartsCatalog('todos')}
              className="group min-h-[44px] px-5 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-full flex items-center gap-2 transition-colors cursor-pointer border border-white/20 shrink-0"
            >
              <span>Ver catálogo completo ({autoParts.length})</span>
              <span className="group-hover:translate-x-0.5 transition-transform">
                <AppleChevronRightIcon size={16} />
              </span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoriesList.map((cat) => (
              <button
                key={cat.code}
                type="button"
                onClick={() => navigateToPartsCatalog(cat.code)}
                className="group relative h-[340px] sm:h-[380px] rounded-2xl overflow-hidden text-left flex flex-col justify-end p-6 cursor-pointer shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] transition-shadow duration-500"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101530] via-[#101530]/45 to-transparent" />

                <span className="absolute top-5 left-5 z-10 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold uppercase tracking-wider text-white">
                  {cat.tag}
                </span>

                <div className="relative z-10 space-y-2">
                  <h3 className="font-extrabold text-2xl text-white tracking-tight leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-white/75 line-clamp-2 leading-relaxed">{cat.subtitle}</p>
                  <div className="pt-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-[#F07F00]">
                      Ver repuestos
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                    <span className="text-xs font-semibold text-white/65">{cat.count}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-center text-sm font-bold uppercase tracking-[0.18em] text-white">
              Marcas oficiales garantizadas en Nor Celis Automotriz
            </h3>

            <div className="relative overflow-hidden py-1">
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#212955] to-transparent z-10" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#212955] to-transparent z-10" />

              <div className="animate-marquee-infinite">
                {[0, 1].map((batch) =>
                  brandsList.map((brand, bIdx) => (
                    <button
                      key={`brand-${batch}-${bIdx}`}
                      type="button"
                      aria-hidden={batch === 1}
                      tabIndex={batch === 1 ? -1 : 0}
                      onClick={() => navigateToPartsCatalog('todos', brand.code)}
                      className="group shrink-0 mr-3 flex items-center gap-3 pl-3 pr-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-[#F07F00]/60 transition-colors duration-300 text-left cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-black text-sm text-[#212955] overflow-hidden p-1.5">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain" />
                        ) : (
                          brand.iconText
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-[#F07F00] transition-colors">
                          {brand.name}
                        </div>
                        <div className="text-[11px] text-white/55">
                          {brand.tag} · {brand.origin}
                        </div>
                      </div>
                    </button>
                  ))
                )}
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
                      className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-md px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-primary"
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

      {/* 4. Repuestos más vendidos */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
            <div className="space-y-3">
              <span className="section-eyebrow">Más vendidos</span>
              <h2 className="section-title">Autopartes y repuestos originales</h2>
              <p className="section-subtitle">
                Componentes OEM certificados con garantía oficial e instalación opcional en taller.
              </p>
            </div>

            <button
              onClick={() => navigateToPartsCatalog('todos')}
              className="group min-h-[44px] px-5 bg-[#F07F00] hover:bg-[#d97300] text-white rounded-full text-sm font-semibold transition-colors shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Explorar todo el catálogo</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Filtrar por categoría">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'frenos', label: 'Frenos y discos' },
              { id: 'lubricantes', label: 'Aceites y filtros' },
              { id: 'suspension', label: 'Suspensión y lift' },
              { id: 'accesorios4x4', label: 'Equipamiento 4x4' },
              { id: 'llantas', label: 'Llantas y aros' },
              { id: 'baterias', label: 'Baterías AGM' },
              { id: 'seguridad', label: 'Láminas de seguridad' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={partsShowcaseCategory === cat.id}
                onClick={() => setPartsShowcaseCategory(cat.id)}
                className="chip shrink-0"
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayedParts.map((part) => {
              const inWish = isInWishlist(part.sku);
              const openPdp = () => {
                setSelectedPartSku(part.sku);
                setCurrentView('part-pdp');
              };
              const discount =
                part.oldPriceSoles && part.oldPriceSoles > part.priceSoles
                  ? Math.round((1 - part.priceSoles / part.oldPriceSoles) * 100)
                  : 0;
              return (
                <article key={part.sku} className="product-card flex flex-col group">
                  <div className="relative aspect-[4/3] bg-gradient-to-b from-[#f4f5f8] to-[#e8ebf0] p-6 flex items-center justify-center overflow-hidden">
                    <button
                      type="button"
                      onClick={openPdp}
                      aria-label={`Ver ${part.name}`}
                      className="absolute inset-0 w-full h-full flex items-center justify-center p-6 cursor-pointer"
                    >
                      <img
                        src={part.image}
                        alt={part.name}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </button>

                    <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 pointer-events-none">
                      {discount > 0 && (
                        <span className="bg-[#F07F00] text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
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
                      aria-pressed={inWish}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                        inWish ? 'bg-[#F07F00] text-white' : 'bg-white text-[#212955] hover:text-[#F07F00]'
                      }`}
                      aria-label={inWish ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      <AppleHeartIcon size={16} />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider">
                        <span className="text-[#212955]/60">{part.brand}</span>
                        {part.stockText && <span className="text-emerald-700 normal-case tracking-normal">{part.stockText}</span>}
                      </div>
                      <h3
                        onClick={openPdp}
                        className="font-bold text-[15px] leading-snug text-[#212955] group-hover:text-[#F07F00] transition-colors cursor-pointer line-clamp-2"
                      >
                        {part.name}
                      </h3>
                      <p className="text-xs text-[#525866] line-clamp-1">
                        {part.compatibleVehicle || (part.features && part.features[0]) || 'Garantía oficial'}
                      </p>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div className="flex flex-col">
                        {part.oldPriceSoles && (
                          <span className="price text-xs text-[#9D9D9C] line-through leading-none mb-1">
                            S/ {part.oldPriceSoles.toLocaleString()}
                          </span>
                        )}
                        <span className="price font-extrabold text-xl text-[#212955] leading-none">
                          S/ {part.priceSoles.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#525866] font-medium text-right leading-tight">
                        Instalación
                        <br />
                        +S/ 45
                      </span>
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(part, false)}
                        className="min-h-[44px] px-4 btn-primary text-sm"
                      >
                        <AppleCartIcon size={16} />
                        <span>Agregar</span>
                      </button>
                      <button
                        type="button"
                        onClick={openPdp}
                        className="min-h-[44px] px-4 btn-outline-primary text-sm"
                      >
                        Detalles
                      </button>
                    </div>
                  </div>
                </article>
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
