import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PromoHeroCarousel } from '../components/PromoHeroCarousel';
import { SafeImage } from '../components/SafeImage';
import { FALLBACK_IMAGES } from '../utils/imageAssets';
import {
  TireOffRoadIcon,
  Equip4x4Icon,
  LubricantOilIcon,
  SecurityFilmIcon,
  DetailingPPFIcon,
  SuspensionHDIcon,
  WorkshopServiceIcon,
  PlanRetomaIcon,
} from '../components/AutoIcons';

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
  } = useApp();

  const [heroTab, setHeroTab] = useState<'parts' | 'workshop' | 'new_cars' | 'used_cars'>('parts');
  const [filterYear, setFilterYear] = useState('2025');
  const [filterBrand, setFilterBrand] = useState('Toyota');
  const [filterModel, setFilterModel] = useState('RAV4 Hybrid');
  const [filterPlate, setFilterPlate] = useState('');
  const [partsShowcaseCategory, setPartsShowcaseCategory] = useState<string>('todos');

  const newCars = vehicles.filter((v) => v.condition === 'nuevo');
  const usedCars = vehicles.filter((v) => v.condition === 'seminuevo');

  // Filter parts for the homepage showcase
  const displayedParts = partsShowcaseCategory === 'todos'
    ? autoParts.slice(0, 8)
    : autoParts.filter((p) => p.category === partsShowcaseCategory).slice(0, 8);

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

      {/* 2. Quick Compatibility & Auto Parts Finder */}
      <section className="px-gutter -mt-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-container-lowest text-on-surface rounded-3xl shadow-xl border border-surface-container overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 bg-surface-container-low border-b border-surface-container text-xs font-bold">
              <button
                type="button"
                onClick={() => setHeroTab('parts')}
                className={`p-3.5 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  heroTab === 'parts'
                    ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-xs font-black'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg text-primary">settings_suggest</span>
                <span>Repuestos OEM</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroTab('workshop')}
                className={`p-3.5 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  heroTab === 'workshop'
                    ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-xs font-black'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg text-secondary">calendar_month</span>
                <span>Citas Taller</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroTab('new_cars')}
                className={`p-3.5 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  heroTab === 'new_cars'
                    ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-xs font-black'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg text-emerald-600">directions_car</span>
                <span>Autos 2025</span>
              </button>
              <button
                type="button"
                onClick={() => setHeroTab('used_cars')}
                className={`p-3.5 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  heroTab === 'used_cars'
                    ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-xs font-black'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg text-purple-600">verified</span>
                <span>Seminuevos</span>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleHeroSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm text-secondary">tune</span>
                    Buscador Rápido de Compatibilidad
                  </span>
                  <p className="text-xs text-outline">
                    {heroTab === 'parts' && 'Filtra y verifica repuestos compatibles con tu vehículo al instante'}
                    {heroTab === 'workshop' && 'Reserva turno prioritario en nuestro taller de alta tecnología en Cajamarca'}
                    {heroTab === 'new_cars' && 'Cotiza vehículos 0 km 2025 con bonos especiales'}
                    {heroTab === 'used_cars' && 'Seminuevos certificados con 150 puntos y garantía mecánica'}
                  </p>
                </div>
                <span className="text-[10px] bg-secondary-container/15 text-secondary font-bold px-2.5 py-1 rounded-full border border-secondary-container/30 shrink-0">
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
                    <span className="material-symbols-outlined absolute right-3 top-3 text-outline text-lg pointer-events-none">
                      badge
                    </span>
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
                className="w-full min-h-[48px] bg-primary hover:bg-primary-container text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span>Consultar Catálogo Especializado</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <div>
              <div className="text-xs font-bold text-primary">Autopartes 100% Originales</div>
              <div className="text-[11px] text-outline">Garantía oficial de fábrica y boleta/factura</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">precision_manufacturing</span>
            </div>
            <div>
              <div className="text-xs font-bold text-primary">Compatibilidad Verificada</div>
              <div className="text-[11px] text-outline">Por catálogo técnico OEM y chasis VIN</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <div>
              <div className="text-xs font-bold text-primary">Despacho 24h &amp; Retiro</div>
              <div className="text-[11px] text-outline">Sede Cajamarca: Av. Vía de Evitamiento Sur 6003</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">build</span>
            </div>
            <div>
              <div className="text-xs font-bold text-primary">Instalación Opcional en Taller</div>
              <div className="text-[11px] text-outline">Mano de obra certificada e inspección</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORÍAS POPULARES DE AUTOPARTES & MARCAS */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-surface-container pb-4">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Líneas Especializadas Nor Celis
              </span>
              <h2 className="font-headline font-bold text-2xl text-on-surface">
                Categorías de Autopartes &amp; Repuestos
              </h2>
            </div>
            <button
              onClick={() => navigateToPartsCatalog('todos')}
              className="min-h-[44px] px-3 py-2 text-xs font-bold text-primary hover:text-secondary-container rounded-xl hover:bg-surface-container-low flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver todas las autopartes ({autoParts.length})</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { name: 'Llantas Off-Road', icon: TireOffRoadIcon, desc: 'Mickey Thompson & BR', code: 'llantas' },
              { name: 'Equipamiento 4x4', icon: Equip4x4Icon, desc: 'KEKO Barras & Tapas', code: 'accesorios4x4' },
              { name: 'Aceites & Fluidos', icon: LubricantOilIcon, desc: 'Mobil 1 & Delvac', code: 'lubricantes' },
              { name: 'Frenos & Pastillas', icon: WorkshopServiceIcon, desc: 'Brembo & Toyota OEM', code: 'frenos' },
              { name: 'Detailing & PPF', icon: DetailingPPFIcon, desc: '3M Ceramic Coating', code: 'detailing' },
              { name: 'Suspensión HD', icon: SuspensionHDIcon, desc: 'TRAKKO® & KYB Lift', code: 'suspension' },
            ].map((cat, i) => {
              const IconComp = cat.icon;
              return (
                <button
                  key={i}
                  onClick={() => navigateToPartsCatalog(cat.code)}
                  className="p-4 min-h-[44px] rounded-2xl bg-surface-container-lowest border border-surface-container hover:border-primary hover:shadow-md transition-all text-center group cursor-pointer"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-surface-container group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center mb-3 transition-colors">
                    <IconComp size={24} />
                  </div>
                  <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-outline mt-0.5 truncate">{cat.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Marcas Oficiales Quick Filter Banner */}
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-secondary text-sm">stars</span>
                Marcas Oficiales Garantizadas en Nor Celis Automotriz
              </span>
              <span className="text-[11px] text-outline">Click en cualquier marca para ver repuestos</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { name: 'TOYOTA Genuino', code: 'TOYOTA Genuino' },
                { name: 'MICKEY THOMPSON (M/T)', code: 'Mickey Thompson' },
                { name: 'KEKO 4X4', code: 'KEKO' },
                { name: 'Mobil Lubricantes', code: 'Mobil' },
                { name: 'LLumar Seguridad', code: 'LLumar' },
                { name: 'BLACK RHINO Aros', code: 'BLACK RHINO' },
                { name: '3M Automotive', code: '3M' },
                { name: 'TRAKKO® AUTORUS', code: 'TRAKKO® AUTORUS' },
                { name: 'Brembo Official', code: 'Brembo Official' },
                { name: 'Bosch Automotive', code: 'Bosch Automotive' },
                { name: 'KYB Shocks', code: 'KYB Shocks & Struts' },
                { name: 'Denso Corp', code: 'Denso Corporation' },
              ].map((brand, bIdx) => (
                <button
                  key={bIdx}
                  onClick={() => navigateToPartsCatalog('todos', brand.code)}
                  className="px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-primary hover:text-white text-on-surface text-xs font-bold border border-surface-container hover:border-primary transition-all cursor-pointer shadow-2xs flex items-center gap-1 min-h-[38px]"
                >
                  <span>{brand.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN SPOTLIGHT: AUTOPARTES & REPUESTOS MÁS VENDIDOS (PRIORIDAD PRINCIPAL) */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-surface-container pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/15 text-secondary text-xs font-extrabold uppercase tracking-wider mb-1">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
                Alta Demanda &amp; Stock Inmediato
              </div>
              <h2 className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
                Autopartes &amp; Repuestos Originales
              </h2>
              <p className="text-xs sm:text-sm text-outline mt-0.5">
                Componentes OEM certificados con garantía oficial y servicio de instalación opcional en taller.
              </p>
            </div>

            <button
              onClick={() => navigateToPartsCatalog('todos')}
              className="min-h-[44px] px-4 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
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
                      className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                        inWish ? 'bg-secondary-container text-white' : 'bg-white/90 hover:bg-white text-on-surface'
                      }`}
                      aria-label="Favorito"
                    >
                      <span className="material-symbols-outlined text-base">
                        {inWish ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>

                    {part.stockText && (
                      <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md text-emerald-800 font-bold border border-emerald-200">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                      <div className="flex items-baseline justify-between">
                        <div>
                          {part.oldPriceSoles && (
                            <span className="text-[11px] text-outline line-through block">
                              S/ {part.oldPriceSoles.toLocaleString()}
                            </span>
                          )}
                          <span className="font-headline font-black text-lg text-primary">
                            S/ {part.priceSoles.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[10px] text-secondary font-bold bg-secondary-container/10 px-2 py-0.5 rounded-md">
                          Instalación +S/ 45
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedPartSku(part.sku);
                            setCurrentView('part-pdp');
                          }}
                          className="min-h-[38px] px-2.5 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                        >
                          Ficha Técnica
                        </button>
                        <button
                          onClick={() => handleAddToCart(part, false)}
                          className="min-h-[38px] px-2.5 py-1.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span className="material-symbols-outlined text-sm">shopping_cart</span>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-surface-container pb-4">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1">
                <WorkshopServiceIcon size={16} className="text-secondary" />
                Centro de Alta Ingeniería Automotriz • Sede Cajamarca
              </span>
              <h2 className="font-headline font-bold text-2xl text-on-surface">
                Servicios Especializados de Taller &amp; Detailing
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('services')}
              className="min-h-[44px] px-3 py-2 text-xs font-bold text-primary hover:text-secondary-container rounded-xl hover:bg-surface-container-low flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver los 8 Paquetes &amp; Agendar Cita</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {/* Quick Service Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Mantenimiento Preventivo 10k/20k/40k',
                desc: 'Escaneo Techstream, cambio de fluidos Mobil 1 y 25 puntos de inspección.',
                price: 'Desde S/ 280',
                time: 'Tiempo: 90 min',
                icon: 'build_circle',
                badge: 'Más Solicitado',
                badgeColor: 'bg-primary text-white',
              },
              {
                title: 'Alineamiento 3D & Enllantado',
                desc: 'Alineación láser sin contacto de aro y balanceo dinámico con plomos adhesivos.',
                price: 'Desde S/ 49 /rueda',
                time: 'Tiempo: 45 min',
                icon: 'tire_repair',
                badge: 'Tecnología Láser',
                badgeColor: 'bg-amber-600 text-white',
              },
              {
                title: 'Láminas Nanocerámicas LLumar',
                desc: '96% de rechazo infrarrojo, 99% bloqueo UV y certificado para permiso PNP.',
                price: 'Desde S/ 420',
                time: 'Cabina presurizada',
                icon: 'shield',
                badge: 'Garantía 10 Años',
                badgeColor: 'bg-emerald-600 text-white',
              },
              {
                title: 'Detailing Cerámico 9H 3M',
                desc: 'Corrección de laca en 3 pasos, descontaminado de pintura y sellado 9H.',
                price: 'Desde S/ 850',
                time: 'Tiempo: 24h',
                icon: 'auto_fix_high',
                badge: 'Acabado Espejo',
                badgeColor: 'bg-purple-600 text-white',
              },
              {
                title: 'Frenos & Discos OEM Brembo/Toyota',
                desc: 'Cambio de pastillas cerámicas, rectificado de discos y purga electrónica.',
                price: 'Desde S/ 190',
                time: 'Tiempo: 60 min',
                icon: 'speed',
                badge: 'Repuesto Original',
                badgeColor: 'bg-blue-600 text-white',
              },
              {
                title: 'Suspensión Pesada & Lift Kits 4x4',
                desc: 'Instalación de paquetes TRAKKO® +2", amortiguadores reforzados y gemelas.',
                price: 'Cotización a medida',
                time: 'Para Trocha y Minería',
                icon: 'engineering',
                badge: 'Off-Road Pro',
                badgeColor: 'bg-cyan-700 text-white',
              },
            ].map((svc, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentView('services')}
                className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container hover:border-primary hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-2xl">{svc.icon}</span>
                    </div>
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
                  <span className="text-xs font-bold text-secondary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    <span>Agendar</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Workshop & Detailing Hero Feature Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-primary text-white p-8 sm:p-10 rounded-3xl shadow-xl overflow-hidden relative">
            <div className="lg:col-span-7 space-y-4 z-10">
              <span className="text-xs uppercase font-bold tracking-widest text-secondary-container">
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
                  className="min-h-[44px] bg-secondary-container hover:bg-secondary text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  <span>Agendar Cita en Taller Sin Colas</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 z-10">
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 group">
                <SafeImage
                  src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80"
                  fallbackSrc={FALLBACK_IMAGES.serviceDetailing}
                  typeHint="service"
                  alt="Taller Nor Celis"
                  className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 ease-out group-hover:scale-110 hover:scale-110 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VEHICLES COMPACT SHOWCASE (REDUCIDO A 3 DESTACADOS PARA PRIORIZAR AUTOPARTES) */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-surface-container pb-4">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Concesionario Multimarca 2025
              </span>
              <h2 className="font-headline font-bold text-2xl text-on-surface">
                Vehículos 0 km con Bonos Especiales
              </h2>
              <p className="text-xs text-outline mt-0.5">
                Modelos seleccionados listos para entrega inmediata con financiamiento y retoma.
              </p>
            </div>
            <button
              onClick={() => setCurrentView('cars')}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-primary hover:text-secondary-container rounded-xl hover:bg-surface-container-low flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver catálogo completo de autos ({vehicles.length})</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
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
                      <span className="material-symbols-outlined text-lg">
                        {inWish ? 'favorite' : 'favorite_border'}
                      </span>
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
                      <div className="flex items-baseline justify-between">
                        <div>
                          {car.oldPriceSoles && (
                            <span className="text-[11px] text-outline line-through block">
                              S/ {car.oldPriceSoles.toLocaleString()}
                            </span>
                          )}
                          <div className="font-headline font-extrabold text-lg text-primary">
                            S/ {car.priceSoles.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-outline font-mono">
                            ~${car.priceUsd.toLocaleString()} USD
                          </div>
                          <div className="text-xs font-bold text-secondary">
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
                          className="min-h-[38px] px-3 py-2 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center"
                        >
                          Ficha Técnica
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVehicleId(car.id);
                            setIsViewer360Open(true);
                          }}
                          className="min-h-[38px] px-3 py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">360</span>
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
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
              Certificación 150 Puntos de Control
            </span>
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
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
