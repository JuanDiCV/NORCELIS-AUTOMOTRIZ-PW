import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AutoPart } from '../types';
import { SafeImage } from '../components/SafeImage';
import { FocalZoomImage } from '../components/FocalZoomImage';
import { FALLBACK_IMAGES } from '../utils/imageAssets';

export const PartsCatalogView: React.FC = () => {
  const {
    activeGarage,
    setIsGarageModalOpen,
    autoParts,
    addToCart,
    toggleWishlist,
    isInWishlist,
    showToast,
    setCurrentView,
    setSelectedPartSku,
    catalogCategoryFilter,
    setCatalogCategoryFilter,
    catalogBrandFilter,
    setCatalogBrandFilter,
    catalogSearchQuery,
    setCatalogSearchQuery,
  } = useApp();

  const openPartDetail = (sku: string) => {
    setSelectedPartSku(sku);
    setCurrentView('part-pdp');
  };

  // Synchronize with context filters if set
  const [selectedCategory, setSelectedCategory] = useState<string>(catalogCategoryFilter || 'todos');
  const [selectedBrand, setSelectedBrand] = useState<string>(catalogBrandFilter || 'todos');
  const [searchFilter, setSearchFilter] = useState<string>(catalogSearchQuery || '');
  const [onlyCompatible, setOnlyCompatible] = useState<boolean>(false);
  const [onlyOffers, setOnlyOffers] = useState<boolean>(false);
  const [priceMax, setPriceMax] = useState<number>(3500);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc'>('featured');
  const [vinInput, setVinInput] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [zoomModalPart, setZoomModalPart] = useState<AutoPart | null>(null);

  // Sync when context changes (e.g. user clicked from mega menu)
  useEffect(() => {
    if (catalogCategoryFilter) setSelectedCategory(catalogCategoryFilter);
  }, [catalogCategoryFilter]);

  useEffect(() => {
    if (catalogBrandFilter) setSelectedBrand(catalogBrandFilter);
  }, [catalogBrandFilter]);

  useEffect(() => {
    if (catalogSearchQuery) setSearchFilter(catalogSearchQuery);
  }, [catalogSearchQuery]);

  // Categories config
  const CATEGORIES = [
    { id: 'todos', label: 'Todos los Repuestos & Accesorios', icon: 'category' },
    { id: 'llantas', label: 'Llantas & Aros Off-Road', icon: 'tire_repair' },
    { id: 'accesorios4x4', label: 'Accesorios & Equipamiento 4x4', icon: 'shield_with_heart' },
    { id: 'lubricantes', label: 'Aceites & Lubricantes de Motor', icon: 'oil_barrel' },
    { id: 'seguridad', label: 'Láminas de Seguridad & Polarizados', icon: 'security' },
    { id: 'detailing', label: 'Car Care, PPF & Detailing', icon: 'auto_fix_high' },
    { id: 'frenos', label: 'Frenos, Discos & Pastillas OEM', icon: 'album' },
    { id: 'suspension', label: 'Suspensión, Lift Kits & Amortiguadores', icon: 'car_repair' },
    { id: 'filtros', label: 'Filtros & Mantenimiento Preventivo', icon: 'filter_alt' },
    { id: 'baterias', label: 'Baterías AGM & Sistema Eléctrico', icon: 'battery_charging_full' },
    { id: 'motor', label: 'Bujías & Componentes de Motor', icon: 'speed' },
  ];

  // Brands: Official OEM & Alternative / Chinese Brands
  const [brandSegment, setBrandSegment] = useState<'todos' | 'oficial' | 'alternativa'>('todos');

  const ALL_PART_BRANDS = useMemo(() => [
    { id: 'todos', label: 'Todas las Marcas', segment: 'todos' },
    // Marcas Oficiales OEM & Tradicionales
    { id: 'TOYOTA Genuino', label: 'TOYOTA Genuino', segment: 'oficial', badge: 'OEM Oficial' },
    { id: 'Mickey Thompson', label: 'MICKEY THOMPSON (M/T)', segment: 'oficial', badge: 'USA' },
    { id: 'KEKO', label: 'KEKO 4x4', segment: 'oficial', badge: 'Brasil' },
    { id: 'Mobil', label: 'Mobil Lubricantes', segment: 'oficial', badge: 'USA' },
    { id: 'LLumar', label: 'LLumar Seguridad', segment: 'oficial', badge: 'USA' },
    { id: 'BLACK RHINO', label: 'BLACK RHINO Aros', segment: 'oficial', badge: 'USA' },
    { id: '3M', label: '3M Auto & PPF', segment: 'oficial', badge: 'USA' },
    { id: 'TRAKKO® AUTORUS', label: 'TRAKKO® AUTORUS', segment: 'oficial', badge: 'Lift Pro' },
    { id: 'Brembo Official', label: 'Brembo Official', segment: 'oficial', badge: 'Italia' },
    { id: 'Bosch Automotive', label: 'Bosch Automotive', segment: 'oficial', badge: 'Alemania' },
    { id: 'KYB Shocks & Struts', label: 'KYB Shocks', segment: 'oficial', badge: 'Japón' },
    { id: 'Denso Corporation', label: 'Denso Corporation', segment: 'oficial', badge: 'Japón' },
    { id: 'Aisin Seiki', label: 'Aisin Seiki', segment: 'oficial', badge: 'Japón' },
    { id: 'K&N Engineering', label: 'K&N Engineering', segment: 'oficial', badge: 'USA' },
    // Marcas Alternativas & Chinas Garantizadas
    { id: 'Triangle Tire', label: 'Triangle Tire (China)', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Sailun Tire', label: 'Sailun Tire (China)', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Longji Brakes', label: 'Longji Brakes (China)', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'SenSen Shocks', label: 'SenSen Shocks (China)', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Camel Battery', label: 'Camel Battery (China)', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Sakura Filters', label: 'Sakura Filters (Alternativa)', segment: 'alternativa', badge: 'Alternativa A+' },
    { id: 'WINBO 4x4', label: 'WINBO 4x4 (China)', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Huayang Lighting', label: 'Huayang LED (China)', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Wanxiang Automotive', label: 'Wanxiang (China)', segment: 'alternativa', badge: 'Marca China A+' },
  ], []);

  // Filter & Sort Logic
  const filteredParts = useMemo(() => {
    return autoParts
      .filter((part) => {
        // Segmento: Oficial vs Alternativa / China
        if (brandSegment === 'oficial' && part.brandType === 'alternativa') {
          return false;
        }
        if (brandSegment === 'alternativa' && part.brandType !== 'alternativa' && part.brandOrigin !== 'china') {
          return false;
        }

        // Categoría
        if (selectedCategory !== 'todos' && part.category !== selectedCategory) {
          return false;
        }

        // Marca
        if (selectedBrand !== 'todos') {
          const brandMatch = part.brand.toLowerCase().includes(selectedBrand.toLowerCase()) ||
                             selectedBrand.toLowerCase().includes(part.brand.toLowerCase());
          if (!brandMatch) return false;
        }

        // Solo ofertas
        if (onlyOffers && !part.discount) {
          return false;
        }

        // Precio Máximo
        if (part.priceSoles > priceMax) {
          return false;
        }

        // Compatibilidad con Garaje Activo
        if (onlyCompatible) {
          const garBrand = activeGarage.brand.toLowerCase();
          const garModel = activeGarage.model.toLowerCase();
          const compText = (part.compatibleVehicle || '').toLowerCase();
          const isComp = compText.includes(garBrand) || compText.includes(garModel) || compText.includes('universal') || compText.includes('todo tipo') || compText.includes('garantizado');
          if (!isComp) return false;
        }

        // Búsqueda de texto (Nombre, SKU, OEM, Marca, Compatibilidad)
        if (searchFilter.trim() !== '') {
          const q = searchFilter.toLowerCase();
          const match =
            part.name.toLowerCase().includes(q) ||
            part.sku.toLowerCase().includes(q) ||
            part.oemCode.toLowerCase().includes(q) ||
            part.brand.toLowerCase().includes(q) ||
            part.compatibleVehicle.toLowerCase().includes(q) ||
            part.features.some((f) => f.toLowerCase().includes(q));
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.priceSoles - b.priceSoles;
        if (sortBy === 'price-desc') return b.priceSoles - a.priceSoles;
        if (sortBy === 'rating-desc') return b.rating - a.rating;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        // 'featured': prioriza los que tienen descuento y rating alto
        return (b.discount ? 1 : 0) - (a.discount ? 1 : 0) || b.rating - a.rating;
      });
  }, [autoParts, selectedCategory, selectedBrand, brandSegment, onlyOffers, priceMax, onlyCompatible, searchFilter, sortBy, activeGarage]);

  const handleResetFilters = () => {
    setSelectedCategory('todos');
    setSelectedBrand('todos');
    setBrandSegment('todos');
    setSearchFilter('');
    setOnlyCompatible(false);
    setOnlyOffers(false);
    setPriceMax(3500);
    setSortBy('featured');
    setCatalogCategoryFilter('todos');
    setCatalogBrandFilter('todos');
    setCatalogSearchQuery('');
    showToast('Filtros de repuestos restablecidos');
  };

  const handleVinValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vinInput.trim() || vinInput.trim().length < 6) {
      showToast('Ingresa los dígitos de tu chasis / VIN para verificar compatibilidad');
      return;
    }
    showToast(`✓ Chasis "${vinInput.toUpperCase()}" validado con catálogo de fábrica de ${activeGarage.brand}. Mostrando productos 100% compatibles.`);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'todos') count++;
    if (selectedBrand !== 'todos') count++;
    if (brandSegment !== 'todos') count++;
    if (searchFilter.trim() !== '') count++;
    if (onlyCompatible) count++;
    if (onlyOffers) count++;
    if (priceMax < 3500) count++;
    return count;
  }, [selectedCategory, selectedBrand, brandSegment, searchFilter, onlyCompatible, onlyOffers, priceMax]);

  return (
    <div className="max-w-7xl mx-auto px-gutter py-6 space-y-6">
      {/* Active Garage Vehicle Banner */}
      <div className="bg-primary text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-primary-container relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary-container text-white flex items-center justify-center font-bold shadow-lg shrink-0">
              <span className="material-symbols-outlined text-3xl">garage</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-secondary-fixed bg-secondary/80 px-2.5 py-0.5 rounded-full">
                  Tu Garaje Activo
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  Compatibilidad Verificada por Catálogo OEM
                </span>
              </div>
              <h2 className="font-headline font-bold text-xl sm:text-2xl text-white mt-1">
                {activeGarage.brand} {activeGarage.model} ({activeGarage.year})
              </h2>
              <div className="text-xs text-surface-container-highest/80 flex flex-wrap gap-2 mt-0.5 font-mono">
                <span>Placa: <strong className="text-white">{activeGarage.plate}</strong></span>
                <span>•</span>
                <span>{activeGarage.engine}</span>
                {activeGarage.vin && (
                  <>
                    <span>•</span>
                    <span>VIN: {activeGarage.vin}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle switch for compatible only */}
            <label className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border border-white/15 transition-colors">
              <input
                type="checkbox"
                checked={onlyCompatible}
                onChange={(e) => setOnlyCompatible(e.target.checked)}
                className="w-4 h-4 accent-secondary-container rounded cursor-pointer"
              />
              <span>Filtrar solo compatibles con {activeGarage.model.split(' ')[0]}</span>
            </label>

            <button
              onClick={() => setIsGarageModalOpen(true)}
              className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              Cambiar Vehículo
            </button>
          </div>
        </div>
      </div>

      {/* Brand Logos Quick Carousel / Pills */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
            <span className="material-symbols-outlined text-secondary text-sm">stars</span>
            Marcas Oficiales Nor Celis
          </span>
          <span className="text-[11px] text-outline">Click para filtrar por fabricante</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {[
            { name: 'Todas', val: 'todos', count: autoParts.length },
            { name: 'Mickey Thompson (M/T)', val: 'Mickey Thompson' },
            { name: 'KEKO', val: 'KEKO' },
            { name: 'Mobil', val: 'Mobil' },
            { name: 'LLumar', val: 'LLumar' },
            { name: 'BLACK RHINO', val: 'BLACK RHINO' },
            { name: '3M', val: '3M' },
            { name: 'TRAKKO® AUTORUS', val: 'TRAKKO® AUTORUS' },
            { name: 'TOYOTA OEM', val: 'TOYOTA Genuino' },
            { name: 'Brembo', val: 'Brembo Official' },
            { name: 'Bosch', val: 'Bosch Automotive' },
            { name: 'KYB', val: 'KYB Shocks & Struts' },
            { name: 'Denso', val: 'Denso Corporation' },
          ].map((b) => (
            <button
              key={b.val}
              onClick={() => setSelectedBrand(selectedBrand === b.val ? 'todos' : b.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                selectedBrand === b.val
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface border-surface-container hover:border-primary/40 hover:bg-surface-container'
              }`}
            >
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Faceted Sidebar + Product Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden col-span-1 flex items-center justify-between bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl min-h-[44px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span>Filtros y Categorías ({activeFiltersCount})</span>
          </button>
          <span className="text-xs text-outline font-medium">
            <strong>{filteredParts.length}</strong> productos
          </span>
        </div>

        {/* Sidebar Filters Desktop */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5">
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-headline font-bold text-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-secondary">filter_list</span>
                Filtros Especializados
                {activeFiltersCount > 0 && (
                  <span className="bg-secondary-container text-white text-[10px] font-extrabold px-2 py-0.2 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-secondary hover:underline font-bold cursor-pointer"
                >
                  Limpiar Todo
                </button>
              )}
            </div>

            {/* Quick Text Filter */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Búsqueda Rápida
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="SKU, OEM, repuesto o marca..."
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 pl-8 text-xs font-medium focus:outline-none focus:border-primary"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-outline text-base">
                  search
                </span>
                {searchFilter && (
                  <button
                    onClick={() => setSearchFilter('')}
                    className="absolute right-2.5 top-2.5 text-outline hover:text-on-surface text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Categorías del Sistema */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Categorías &amp; Sistemas
              </label>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => {
                  const count = cat.id === 'todos' 
                    ? autoParts.length 
                    : autoParts.filter((p) => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-primary text-white font-bold shadow-xs'
                          : 'text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="truncate pr-1">{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full shrink-0 ${
                          selectedCategory === cat.id
                            ? 'bg-white/20 text-white'
                            : 'bg-surface-container text-outline'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tipo de Marca: Oficiales OEM vs Alternativas / Chinas */}
            <div className="space-y-2 pt-2 border-t border-surface-container">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Línea de Marca
              </label>
              <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setBrandSegment('todos')}
                  className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    brandSegment === 'todos'
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setBrandSegment('oficial')}
                  className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    brandSegment === 'oficial'
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  Oficial OEM
                </button>
                <button
                  type="button"
                  onClick={() => setBrandSegment('alternativa')}
                  className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                    brandSegment === 'alternativa'
                      ? 'bg-primary text-white font-bold shadow-xs'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  Alternativa / China
                </button>
              </div>
            </div>

            {/* Fabricantes y Marcas */}
            <div className="space-y-2 pt-2 border-t border-surface-container">
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
                Marca / Fabricante
              </label>
              <div className="space-y-1 text-xs max-h-56 overflow-y-auto pr-1">
                {ALL_PART_BRANDS.filter((b) => brandSegment === 'todos' || b.segment === 'todos' || b.segment === brandSegment).map((b) => {
                  const isSelected = selectedBrand === b.id;
                  const count = b.id === 'todos'
                    ? autoParts.length
                    : autoParts.filter((p) => p.brand.toLowerCase().includes(b.id.toLowerCase()) || b.id.toLowerCase().includes(p.brand.toLowerCase())).length;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrand(b.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-secondary text-white font-bold'
                          : 'text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{b.label}</span>
                        {b.badge && (
                          <span className={`text-[9px] px-1 py-0.2 rounded font-bold shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-surface-container text-outline'}`}>
                            {b.badge}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] shrink-0 ml-1 ${isSelected ? 'text-white' : 'text-outline'}`}>
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2 pt-2 border-t border-surface-container">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="uppercase tracking-wider">Precio Máximo</span>
                <span className="text-primary font-mono font-bold">S/ {priceMax.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="50"
                max="3500"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-outline font-mono">
                <span>S/ 50</span>
                <span>S/ 3,500+</span>
              </div>
            </div>

            {/* Checkboxes extra */}
            <div className="space-y-2.5 pt-2 border-t border-surface-container">
              <label className="flex items-center gap-2 text-xs font-semibold text-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyOffers}
                  onChange={(e) => setOnlyOffers(e.target.checked)}
                  className="w-4 h-4 accent-secondary-container rounded cursor-pointer"
                />
                <span>Solo productos con Descuento / Promo</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyCompatible}
                  onChange={(e) => setOnlyCompatible(e.target.checked)}
                  className="w-4 h-4 accent-secondary-container rounded cursor-pointer"
                />
                <span>Solo compatibles con mi vehículo activo</span>
              </label>
            </div>
          </div>

          {/* Live VIN Validator Box */}
          <div className="bg-surface-container-low p-5 rounded-3xl border border-surface-container space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-base text-secondary">pin</span>
              ¿Dudas de Compatibilidad?
            </div>
            <p className="text-xs text-outline leading-relaxed">
              Ingresa los 17 dígitos del número de Chasis (VIN) de tu tarjeta de propiedad y nuestro sistema cotejará la compatibilidad de fábrica al 100%.
            </p>
            <form onSubmit={handleVinValidate} className="space-y-2">
              <input
                type="text"
                value={vinInput}
                onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                placeholder="Ej: 4T1B11HK5JU123456"
                maxLength={17}
                className="w-full bg-white border border-surface-container rounded-xl p-2.5 text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px]"
              >
                Validar Compatibilidad de Fábrica
              </button>
            </form>
          </div>
        </aside>

        {/* Product Grid Content */}
        <main className="lg:col-span-9 space-y-4">
          {/* Active filter chips & Top Sort Toolbar */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-outline font-medium">
                Mostrando <strong className="text-on-surface font-bold text-sm text-primary">{filteredParts.length}</strong> repuestos &amp; accesorios garantizados
              </div>
              <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-outline hidden sm:inline">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-surface-container-low border border-surface-container rounded-xl p-2 text-xs font-semibold focus:outline-none cursor-pointer min-h-[40px]"
                >
                  <option value="featured">Destacados &amp; Recomendados OEM</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="rating-desc">Mayor Calificación (5 Estrellas)</option>
                  <option value="name-asc">Nombre A - Z</option>
                </select>
              </div>
            </div>

            {/* Active filter tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-surface-container text-xs">
                <span className="text-[11px] font-bold text-outline">Filtros activos:</span>
                {selectedCategory !== 'todos' && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-lg border border-primary/20">
                    Cat: {CATEGORIES.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                    <button onClick={() => setSelectedCategory('todos')} className="hover:text-red-500 font-black ml-1">✕</button>
                  </span>
                )}
                {selectedBrand !== 'todos' && (
                  <span className="inline-flex items-center gap-1 bg-secondary/10 text-secondary font-bold px-2.5 py-1 rounded-lg border border-secondary/20">
                    Marca: {selectedBrand}
                    <button onClick={() => setSelectedBrand('todos')} className="hover:text-red-500 font-black ml-1">✕</button>
                  </span>
                )}
                {searchFilter.trim() !== '' && (
                  <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface font-semibold px-2.5 py-1 rounded-lg border border-surface-container-high">
                    Búsqueda: "{searchFilter}"
                    <button onClick={() => setSearchFilter('')} className="hover:text-red-500 font-black ml-1">✕</button>
                  </span>
                )}
                {onlyOffers && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-lg">
                    Con Oferta / Promo
                    <button onClick={() => setOnlyOffers(false)} className="hover:text-red-500 font-black ml-1">✕</button>
                  </span>
                )}
                {onlyCompatible && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-lg">
                    Compatible {activeGarage.model.split(' ')[0]}
                    <button onClick={() => setOnlyCompatible(false)} className="hover:text-red-500 font-black ml-1">✕</button>
                  </span>
                )}
                {priceMax < 3500 && (
                  <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface font-semibold px-2.5 py-1 rounded-lg">
                    Hasta S/ {priceMax}
                    <button onClick={() => setPriceMax(3500)} className="hover:text-red-500 font-black ml-1">✕</button>
                  </span>
                )}
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-red-600 hover:underline font-bold ml-auto cursor-pointer"
                >
                  Restablecer todos
                </button>
              </div>
            )}
          </div>

          {/* Product Cards Grid */}
          {filteredParts.length === 0 ? (
            <div className="bg-surface-container-lowest p-12 rounded-3xl border border-surface-container text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mx-auto text-outline">
                <span className="material-symbols-outlined text-3xl">search_off</span>
              </div>
              <h3 className="text-lg font-bold text-primary">No se encontraron repuestos con los filtros seleccionados</h3>
              <p className="text-xs text-outline max-w-md mx-auto">
                Prueba ajustando el rango de precio, cambiando la marca o desactivando el filtro de compatibilidad estricta.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer min-h-[44px]"
              >
                Restablecer Filtros de Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredParts.map((part) => {
                const inWish = isInWishlist(part.id);
                return (
                  <div
                    key={part.id}
                    className="bg-surface-container-lowest rounded-3xl border border-surface-container hover:border-primary/40 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Photo area with Quick Zoom Button */}
                    <div
                      onClick={() => openPartDetail(part.sku)}
                      className="relative aspect-video bg-surface-container-low p-4 flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                      <SafeImage
                        src={part.image}
                        fallbackSrc={FALLBACK_IMAGES.partDefault}
                        typeHint="part"
                        categoryHint={part.category}
                        alt={part.name}
                        className="max-h-36 object-contain transition-transform duration-500 ease-out group-hover:scale-110 hover:scale-110"
                        loading="lazy"
                      />
                      {part.badge && (
                        <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm">
                          {part.badge}
                        </span>
                      )}
                      {part.discount && (
                        <span className="absolute bottom-3 left-3 bg-secondary-container text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          {part.discount}
                        </span>
                      )}

                      {/* Quick Focal Zoom Trigger Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomModalPart(part);
                        }}
                        className="absolute bottom-3 right-3 bg-white/90 hover:bg-primary hover:text-white text-on-surface text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-md border border-surface-container flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer z-10"
                        title="Ver con Zoom Focal HD"
                      >
                        <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                        <span className="hidden sm:inline">Zoom HD</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist({
                            id: part.id,
                            type: 'part',
                            title: part.name,
                            subtitle: part.compatibleVehicle,
                            sku: part.sku,
                            priceSoles: part.priceSoles,
                            priceUsd: part.priceUsd,
                            oldPriceSoles: part.oldPriceSoles,
                            image: part.image,
                            categoryBadge: 'Repuesto Oficial',
                          });
                        }}
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer z-10 ${
                          inWish
                            ? 'bg-secondary-container text-white shadow-md'
                            : 'bg-white/80 hover:bg-white text-on-surface shadow-xs'
                        }`}
                        title="Guardar en lista de deseos"
                        aria-label="Guardar en favoritos"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {inWish ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                    </div>

                    {/* Content area */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Brand & SKU */}
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="font-bold text-secondary uppercase tracking-wider">{part.brand}</span>
                          <span className="text-outline">SKU: {part.sku}</span>
                        </div>

                        {/* Title */}
                        <h4
                          onClick={() => openPartDetail(part.sku)}
                          className="font-headline font-bold text-sm text-on-surface hover:text-primary transition-colors cursor-pointer line-clamp-2"
                          title={part.name}
                        >
                          {part.name}
                        </h4>

                        {/* OEM & Compatibility */}
                        <div className="space-y-1">
                          <div className="text-[11px] text-outline font-mono flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                            <span>OEM: <strong className="text-on-surface">{part.oemCode}</strong></span>
                          </div>
                          <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg font-medium line-clamp-1">
                            {part.compatibleVehicle}
                          </div>
                        </div>

                        {/* Features bullet list */}
                        <ul className="space-y-0.5 text-[11px] text-outline pt-1">
                          {part.features.slice(0, 2).map((feat, i) => (
                            <li key={i} className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0"></span>
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="space-y-3 pt-3 border-t border-surface-container">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="text-xs text-outline">Precio Final:</div>
                            <div className="text-lg font-black text-primary font-mono">
                              S/ {part.priceSoles.toLocaleString()}
                              <span className="text-xs text-outline font-normal ml-1.5">
                                (${part.priceUsd} USD)
                              </span>
                            </div>
                          </div>
                          {part.oldPriceSoles && (
                            <div className="text-right">
                              <span className="text-xs text-outline line-through font-mono">
                                S/ {part.oldPriceSoles.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="text-[10px] text-outline font-medium flex items-center gap-1 truncate">
                          <span className="material-symbols-outlined text-[13px] text-emerald-600">inventory_2</span>
                          <span className="truncate">{part.stockText}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => openPartDetail(part.sku)}
                            className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold py-2.5 rounded-xl transition-all text-center cursor-pointer min-h-[44px] flex items-center justify-center"
                          >
                            Ver Ficha
                          </button>
                          <button
                            onClick={() =>
                              addToCart({
                                type: 'part',
                                title: part.name,
                                skuOrCode: part.sku,
                                priceSoles: part.priceSoles,
                                image: part.image,
                                specsSubtitle: `${part.brand} • ${part.oemCode}`,
                              })
                            }
                            className="w-full bg-primary hover:bg-primary-container text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                          >
                            <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                            <span>Agregar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <h3 className="font-headline font-bold text-base text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">tune</span>
                Filtros de Repuestos
              </h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-outline cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Text Filter */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">Búsqueda</label>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="SKU, marca, repuesto..."
                className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs"
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface uppercase">Categoría</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs ${
                      selectedCategory === cat.id ? 'bg-primary text-white font-bold' : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brands Line Segment */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface uppercase">Tipo de Marca</label>
              <div className="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBrandSegment('todos')}
                  className={`py-1.5 px-2 rounded-lg text-center ${
                    brandSegment === 'todos' ? 'bg-primary text-white font-bold' : 'text-on-surface'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setBrandSegment('oficial')}
                  className={`py-1.5 px-2 rounded-lg text-center ${
                    brandSegment === 'oficial' ? 'bg-primary text-white font-bold' : 'text-on-surface'
                  }`}
                >
                  Oficial OEM
                </button>
                <button
                  type="button"
                  onClick={() => setBrandSegment('alternativa')}
                  className={`py-1.5 px-2 rounded-lg text-center ${
                    brandSegment === 'alternativa' ? 'bg-primary text-white font-bold' : 'text-on-surface'
                  }`}
                >
                  China/Alt.
                </button>
              </div>
            </div>

            {/* Brands */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface uppercase">Marca / Fabricante</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {ALL_PART_BRANDS.filter((b) => brandSegment === 'todos' || b.segment === 'todos' || b.segment === brandSegment).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs ${
                      selectedBrand === b.id ? 'bg-secondary text-white font-bold' : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span>{b.label}</span>
                    {b.badge && (
                      <span className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-outline font-bold">
                        {b.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Precio Máx:</span>
                <span className="text-primary">S/ {priceMax}</span>
              </div>
              <input
                type="range"
                min="50"
                max="3500"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <div className="pt-4 border-t border-surface-container space-y-2">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl text-xs min-h-[44px]"
              >
                Aplicar Filtros ({filteredParts.length} resultados)
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full bg-surface-container text-outline font-bold py-2.5 rounded-xl text-xs min-h-[44px]"
              >
                Limpiar Todo
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Focal Zoom Modal on Product */}
      {zoomModalPart && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-surface-container flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-5 flex items-center justify-between border-b border-surface-container bg-surface-container-low">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-600 text-lg">zoom_in</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    {zoomModalPart.brand} • SKU: {zoomModalPart.sku}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-bold text-primary truncate max-w-md">
                  {zoomModalPart.name}
                </h3>
              </div>
              <button
                onClick={() => setZoomModalPart(null)}
                className="w-9 h-9 rounded-full bg-white hover:bg-surface-container text-outline flex items-center justify-center shadow-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <FocalZoomImage
                src={zoomModalPart.image}
                alt={zoomModalPart.name}
                typeHint="part"
                categoryHint={zoomModalPart.category}
                aspectRatioClass="h-72 sm:h-80 w-full"
                badge={zoomModalPart.badge || (zoomModalPart.brandType === 'alternativa' ? 'Marca China / Alt.' : 'OEM Oficial')}
                discountBadge={zoomModalPart.discount}
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-surface-container">
                <div>
                  <div className="text-xs text-outline font-medium">Compatible: {zoomModalPart.compatibleVehicle}</div>
                  <div className="text-lg font-black text-primary font-mono">
                    S/ {zoomModalPart.priceSoles.toLocaleString()} <span className="text-xs text-outline font-normal">(${zoomModalPart.priceUsd} USD)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const sku = zoomModalPart.sku;
                      setZoomModalPart(null);
                      openPartDetail(sku);
                    }}
                    className="flex-1 sm:flex-none bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer min-h-[44px]"
                  >
                    Ver Ficha Completa
                  </button>
                  <button
                    onClick={() => {
                      addToCart({
                        type: 'part',
                        title: zoomModalPart.name,
                        skuOrCode: zoomModalPart.sku,
                        priceSoles: zoomModalPart.priceSoles,
                        image: zoomModalPart.image,
                        specsSubtitle: `${zoomModalPart.brand} • ${zoomModalPart.oemCode}`,
                      });
                      setZoomModalPart(null);
                    }}
                    className="flex-1 sm:flex-none bg-primary hover:bg-primary-container text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                    <span>Agregar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
