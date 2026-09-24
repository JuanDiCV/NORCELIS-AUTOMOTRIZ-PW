import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const HomeView: React.FC = () => {
  const {
    setCurrentView,
    setSelectedVehicleId,
    setIsViewer360Open,
    setIsTestDriveModalOpen,
    vehicles,
    addToCart,
    toggleWishlist,
    isInWishlist,
    showToast,
    navigateToPartsCatalog,
  } = useApp();

  const [heroTab, setHeroTab] = useState<'parts' | 'new_cars' | 'used_cars' | 'workshop'>('parts');
  const [filterYear, setFilterYear] = useState('2025');
  const [filterBrand, setFilterBrand] = useState('Toyota');
  const [filterModel, setFilterModel] = useState('RAV4 Hybrid');
  const [filterPlate, setFilterPlate] = useState('');

  const newCars = vehicles.filter((v) => v.condition === 'nuevo');
  const usedCars = vehicles.filter((v) => v.condition === 'seminuevo');

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroTab === 'parts') {
      showToast(`Filtrando repuestos compatibles con ${filterBrand} ${filterModel} (${filterYear})`);
      setCurrentView('parts');
    } else if (heroTab === 'new_cars' || heroTab === 'used_cars') {
      showToast(`Mostrando vehículos para ${filterBrand}`);
      setCurrentView('cars');
    } else {
      showToast('Redirigiendo a reserva de citas en taller...');
      setCurrentView('services');
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-primary text-white overflow-hidden py-10 lg:py-14 px-gutter rounded-b-3xl shadow-xl">
        {/* Background texture & accents */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-container to-primary pointer-events-none opacity-95"></div>
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headlines & Benefits */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/10 text-secondary-fixed text-xs font-semibold px-3 py-1 rounded-full border border-white/15">
              <span className="material-symbols-outlined text-[15px] text-secondary-container">verified</span>
              <span>Concesionario Multimarca &amp; Autopartes Oficiales</span>
            </div>

            <h1 className="font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight text-white">
              Tu próximo vehículo o repuesto OEM, con <span className="text-secondary-fixed">garantía de ingeniería.</span>
            </h1>

            <p className="text-surface-container-highest/80 text-sm sm:text-base leading-relaxed max-w-xl">
              Encuentra repuestos con compatibilidad verificada al 100%, adquiere vehículos 2025 con bonos de hasta <strong className="text-white font-bold">S/ 7,500</strong> y agenda servicios en nuestro taller de alta tecnología.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentView('vehicle-pdp')}
                className="bg-secondary-container hover:bg-secondary text-white font-bold text-xs sm:text-sm px-6 py-3.5 min-h-[44px] rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explorar RAV4 Hybrid 2025</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>

              <button
                onClick={() => setIsViewer360Open(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-3.5 min-h-[44px] rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">360</span>
                <span>Visor 360° Showroom</span>
              </button>
            </div>

            <div className="pt-3 flex items-center gap-6 text-xs text-surface-container-highest/70">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                Entrega en 48 Horas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                Crédito en 15 Minutos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">check_circle</span>
                Taller Láser 3D
              </span>
            </div>
          </div>

          {/* Right Column: Dynamic Finder Box */}
          <div className="lg:col-span-6">
            <div className="bg-surface-container-lowest text-on-surface rounded-3xl shadow-2xl border border-surface-container overflow-hidden">
              {/* Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 bg-surface-container-low border-b border-surface-container text-xs font-bold">
                <button
                  onClick={() => setHeroTab('parts')}
                  className={`p-3 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    heroTab === 'parts'
                      ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">settings_suggest</span>
                  <span>Repuestos</span>
                </button>
                <button
                  onClick={() => setHeroTab('new_cars')}
                  className={`p-3 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    heroTab === 'new_cars'
                      ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">directions_car</span>
                  <span>Autos 2025</span>
                </button>
                <button
                  onClick={() => setHeroTab('used_cars')}
                  className={`p-3 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    heroTab === 'used_cars'
                      ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">verified</span>
                  <span>Seminuevos</span>
                </button>
                <button
                  onClick={() => setHeroTab('workshop')}
                  className={`p-3 min-h-[48px] text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    heroTab === 'workshop'
                      ? 'bg-surface-container-lowest text-primary border-b-2 border-primary shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>Citas Taller</span>
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleHeroSubmit} className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">
                    {heroTab === 'parts' && 'Encuentra repuestos 100% compatibles'}
                    {heroTab === 'new_cars' && 'Cotiza tu auto nuevo 0 km con bonos'}
                    {heroTab === 'used_cars' && 'Seminuevos certificados con 150 puntos'}
                    {heroTab === 'workshop' && 'Agenda turno express en taller especializado'}
                  </span>
                  <span className="text-[10px] bg-secondary-fixed/50 text-secondary font-bold px-2 py-0.5 rounded">
                    Filtro Rápido
                  </span>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface mb-1.5">
                      Año
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
                      <option value="BMW">BMW</option>
                      <option value="Audi">Audi</option>
                      <option value="Kia">Kia</option>
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
                      <option value="Sportage GT">Sportage GT</option>
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
                        placeholder="Ej: ABC-123"
                        maxLength={8}
                        className="w-full min-h-[44px] bg-surface-container-low border border-surface-container rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-primary"
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
                      <option value="todos">Todos los Sistemas</option>
                      <option value="frenos">Frenos &amp; Discos</option>
                      <option value="suspension">Suspensión &amp; Amortiguadores</option>
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
        </div>
      </section>

      {/* Retail Trust Strip */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">verified</span>
            </div>
            <div>
              <div className="text-xs font-bold text-primary">Garantía Mecánica 1 Año</div>
              <div className="text-[11px] text-outline">En seminuevos certificados</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">precision_manufacturing</span>
            </div>
            <div>
              <div className="text-xs font-bold text-primary">Compatibilidad 100%</div>
              <div className="text-[11px] text-outline">Verificada por catálogo OEM</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-center flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <div>
              <div className="text-xs font-bold text-primary">Despacho 24h &amp; Retiro</div>
              <div className="text-[11px] text-outline">Concesionario &amp; Taller: AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
              <div className="text-xs font-bold text-primary">Financiamiento Inmediato</div>
              <div className="text-[11px] text-outline">Pre-evaluación en 15 minutos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Populares de Repuestos & Equipamiento */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-surface-container pb-4">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Autopartes &amp; Accesorios Oficiales
              </span>
              <h2 className="font-headline font-bold text-2xl text-on-surface">
                Categorías Destacadas Nor Celis
              </h2>
            </div>
            <button
              onClick={() => navigateToPartsCatalog('todos')}
              className="min-h-[44px] px-3 py-2 text-xs font-bold text-primary hover:text-secondary-container rounded-xl hover:bg-surface-container-low flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver todas las autopartes</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { name: 'Llantas Off-Road', icon: 'tire_repair', desc: 'Mickey Thompson & BR', code: 'llantas' },
              { name: 'Equipamiento 4x4', icon: 'shield_with_heart', desc: 'KEKO Barras & Tapas', code: 'accesorios4x4' },
              { name: 'Aceites & Fluidos', icon: 'oil_barrel', desc: 'Mobil 1 & Delvac', code: 'lubricantes' },
              { name: 'Láminas Seguridad', icon: 'security', desc: 'LLumar Nanocerámica', code: 'seguridad' },
              { name: 'Detailing & PPF', icon: 'auto_fix_high', desc: '3M Ceramic Coating', code: 'detailing' },
              { name: 'Suspensión HD', icon: 'car_repair', desc: 'TRAKKO® & KYB Lift', code: 'suspension' },
            ].map((cat, i) => (
              <button
                key={i}
                onClick={() => navigateToPartsCatalog(cat.code)}
                className="p-4 min-h-[44px] rounded-2xl bg-surface-container-lowest border border-surface-container hover:border-primary hover:shadow-md transition-all text-center group cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-surface-container group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center mb-3 transition-colors">
                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                </div>
                <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                  {cat.name}
                </div>
                <div className="text-[10px] text-outline mt-0.5 truncate">{cat.desc}</div>
              </button>
            ))}
          </div>

          {/* Marcas Oficiales Quick Filter Banner */}
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl border border-surface-container shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-secondary text-sm">stars</span>
                Marcas Oficiales Garantizadas en Nor Celis Automotriz
              </span>
              <span className="text-[11px] text-outline">Click en cualquier marca para ver su despiece</span>
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

      {/* Featured 0 km Vehicles 2025 */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-surface-container pb-4">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                Concesionario Oficial 2025
              </span>
              <h2 className="font-headline font-bold text-2xl text-on-surface">
                Vehículos 0 km con Bonos Exclusivos
              </h2>
            </div>
            <button
              onClick={() => setCurrentView('cars')}
              className="min-h-[44px] px-3 py-2 text-xs font-bold text-primary hover:text-secondary-container rounded-xl hover:bg-surface-container-low flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ver catálogo completo (26 unidades)</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newCars.map((car) => {
              const inWish = isInWishlist(car.id);
              return (
                <div
                  key={car.id}
                  className="bg-surface-container-lowest rounded-2xl border border-surface-container hover:border-primary/40 hover:shadow-xl transition-all overflow-hidden flex flex-col group"
                >
                  {/* Photo & Badges */}
                  <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden group">
                    <img
                      src={car.image}
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
                      className={`absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors shadow-md cursor-pointer ${
                        inWish ? 'bg-secondary-container text-white' : 'bg-white/90 hover:bg-white text-on-surface'
                      }`}
                      aria-label="Guardar en lista de deseos"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {inWish ? 'favorite' : 'favorite_border'}
                      </span>
                    </button>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase text-outline flex items-center gap-1.5">
                        <span>{car.brand}</span>
                        <span>•</span>
                        <span>{car.bodyType}</span>
                        <span>•</span>
                        <span className="text-emerald-700">{car.fuelType}</span>
                      </div>
                      <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors mt-0.5">
                        {car.name}
                      </h3>
                      <p className="text-xs text-outline line-clamp-1 mt-1">
                        {car.subtitle}
                      </p>

                      {/* Specs tags */}
                      <div className="flex flex-wrap gap-2 mt-3 text-[11px] text-on-surface-variant font-medium">
                        <span className="bg-surface-container px-2.5 py-1 rounded-lg">
                          {car.specs.engine}
                        </span>
                        <span className="bg-surface-container px-2.5 py-1 rounded-lg">
                          {car.specs.transmission}
                        </span>
                        <span className="bg-surface-container px-2.5 py-1 rounded-lg">
                          {car.specs.traction}
                        </span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="border-t border-surface-container pt-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-xs text-outline line-through">
                            {car.oldPriceSoles ? `S/ ${car.oldPriceSoles.toLocaleString()}` : ''}
                          </div>
                          <div className="font-headline font-extrabold text-xl text-primary">
                            S/ {car.priceSoles.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[11px] text-outline font-mono">
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
                          className="min-h-[44px] px-3 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center"
                        >
                          Ficha Técnica
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVehicleId(car.id);
                            setIsViewer360Open(true);
                          }}
                          className="min-h-[44px] px-3 py-2.5 bg-surface-container hover:bg-surface-container-high text-primary rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
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

      {/* Seminuevos Certificados Banner */}
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
                <span className="material-symbols-outlined text-sm text-secondary">swap_horiz</span>
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
                  <img
                    src={u.image}
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

      {/* Workshop & Detailing Promotion */}
      <section className="px-gutter">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-primary text-white p-8 sm:p-12 rounded-3xl shadow-xl overflow-hidden relative">
          <div className="lg:col-span-7 space-y-4 z-10">
            <span className="text-xs uppercase font-bold tracking-widest text-secondary-container">
              Centro de Alta Ingeniería Automotriz
            </span>
            <h3 className="font-headline font-extrabold text-2xl sm:text-3xl text-white">
              Taller Especializado, Car Care &amp; Detailing Cerámico 9H
            </h3>
            <p className="text-xs sm:text-sm text-surface-container-highest/80 leading-relaxed">
              Equipamiento con alineadoras láser 3D sin contacto de aro, cabina presurizada de pintura, técnicos certificados y garantía oficial Nor Celis en cada servicio.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-secondary-fixed">Enllantado 3D</div>
                <div className="text-[10px] text-surface-container-highest/70">Desde S/ 49 /rueda</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-secondary-fixed">Cerámico 9H</div>
                <div className="text-[10px] text-surface-container-highest/70">Desde S/ 850</div>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                <div className="text-xs font-bold text-secondary-fixed">Laminado 12 micras</div>
                <div className="text-[10px] text-surface-container-highest/70">Desde S/ 420</div>
              </div>
            </div>
            <div className="pt-3">
              <button
                onClick={() => setCurrentView('services')}
                className="min-h-[44px] bg-secondary-container hover:bg-secondary text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Conoce los 8 Servicios &amp; Agenda Cita</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 z-10">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSjI_tIAIGiT6wyiJbp0Fa_bV8tFCUZH1ukGx28Esv2LM-NxulgReRQMUAHbYA3VkYAzuU_0-TlyRO_iD872KGC6R4RM4o1F-WNokWD5Q_a2RnWiF2Kr0VQ3jp5-IsvkySgMGjIrqIx-VJzpYQHiys_1cuFjbPE1s2eI_QMAudhThsULZbqgdVwD8JvlTUle2ialiatbl3Oa5tHE9M5-pE2DpsKz8dB0ufSUmmKw4NtwLKSMUAoJi_"
                alt="Taller Nor Celis"
                className="w-full h-64 object-cover transition-transform duration-500 ease-out group-hover:scale-110 hover:scale-110 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
