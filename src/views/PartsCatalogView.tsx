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

  // State for multi-selection filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (catalogCategoryFilter && catalogCategoryFilter !== 'todos') {
      return [catalogCategoryFilter];
    }
    return [];
  });

  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    if (catalogBrandFilter && catalogBrandFilter !== 'todos') {
      return [catalogBrandFilter];
    }
    return [];
  });

  const [searchFilter, setSearchFilter] = useState<string>(catalogSearchQuery || '');
  const [brandSearchTerm, setBrandSearchTerm] = useState<string>('');
  const [brandSegment, setBrandSegment] = useState<'todos' | 'oficial' | 'alternativa'>('todos');
  const [onlyCompatible, setOnlyCompatible] = useState<boolean>(false);
  const [onlyOffers, setOnlyOffers] = useState<boolean>(false);
  const [priceMax, setPriceMax] = useState<number>(3500);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc'>('featured');
  const [vinInput, setVinInput] = useState('');
  const [vinValidated, setVinValidated] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [zoomModalPart, setZoomModalPart] = useState<AutoPart | null>(null);

  // Accordion open/close state (Falabella style)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    categories: true,
    brands: true,
    price: true,
    offers: true,
    compatibility: false,
  });

  const toggleSection = (sectionKey: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  // Sync when context changes (e.g. user clicked from mega menu or header)
  useEffect(() => {
    if (catalogCategoryFilter && catalogCategoryFilter !== 'todos') {
      setSelectedCategories([catalogCategoryFilter]);
    } else if (catalogCategoryFilter === 'todos') {
      setSelectedCategories([]);
    }
  }, [catalogCategoryFilter]);

  useEffect(() => {
    if (catalogBrandFilter && catalogBrandFilter !== 'todos') {
      setSelectedBrands([catalogBrandFilter]);
    } else if (catalogBrandFilter === 'todos') {
      setSelectedBrands([]);
    }
  }, [catalogBrandFilter]);

  useEffect(() => {
    if (catalogSearchQuery) {
      setSearchFilter(catalogSearchQuery);
    }
  }, [catalogSearchQuery]);

  // Categories config
  const CATEGORIES = [
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
  const ALL_PART_BRANDS = useMemo(() => [
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
    { id: 'Triangle Tire', label: 'Triangle Tire', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Sailun Tire', label: 'Sailun Tire', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Longji Brakes', label: 'Longji Brakes', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'SenSen Shocks', label: 'SenSen Shocks', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Camel Battery', label: 'Camel Battery', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Sakura Filters', label: 'Sakura Filters', segment: 'alternativa', badge: 'Alternativa A+' },
    { id: 'WINBO 4x4', label: 'WINBO 4x4', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Huayang Lighting', label: 'Huayang LED', segment: 'alternativa', badge: 'Marca China A+' },
    { id: 'Wanxiang Automotive', label: 'Wanxiang Auto', segment: 'alternativa', badge: 'Marca China A+' },
  ], []);

  // Multi-select helpers
  const handleToggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId)) {
        return prev.filter((id) => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleToggleBrand = (brandId: string) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brandId)) {
        return prev.filter((id) => id !== brandId);
      } else {
        return [...prev, brandId];
      }
    });
  };

  // Filtered Brands for display according to segment and brand search
  const visibleBrands = useMemo(() => {
    return ALL_PART_BRANDS.filter((b) => {
      // Segment filter
      if (brandSegment === 'oficial' && b.segment !== 'oficial') return false;
      if (brandSegment === 'alternativa' && b.segment !== 'alternativa') return false;

      // Internal brand search
      if (brandSearchTerm.trim() !== '') {
        const query = brandSearchTerm.toLowerCase();
        const matches =
          b.label.toLowerCase().includes(query) ||
          b.id.toLowerCase().includes(query) ||
          (b.badge && b.badge.toLowerCase().includes(query));
        if (!matches) return false;
      }

      return true;
    });
  }, [ALL_PART_BRANDS, brandSegment, brandSearchTerm]);

  // Main Filter & Sort Logic
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

        // Multi-Categoría (si está vacío muestra todas)
        if (selectedCategories.length > 0) {
          if (!selectedCategories.includes(part.category)) {
            return false;
          }
        }

        // Multi-Marca (si está vacío muestra todas)
        if (selectedBrands.length > 0) {
          const matchBrand = selectedBrands.some((b) => {
            return (
              part.brand.toLowerCase().includes(b.toLowerCase()) ||
              b.toLowerCase().includes(part.brand.toLowerCase())
            );
          });
          if (!matchBrand) return false;
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
          const isComp =
            compText.includes(garBrand) ||
            compText.includes(garModel) ||
            compText.includes('universal') ||
            compText.includes('todo tipo') ||
            compText.includes('garantizado');
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
        return (b.discount ? 1 : 0) - (a.discount ? 1 : 0) || b.rating - a.rating;
      });
  }, [
    autoParts,
    selectedCategories,
    selectedBrands,
    brandSegment,
    onlyOffers,
    priceMax,
    onlyCompatible,
    searchFilter,
    sortBy,
    activeGarage,
  ]);

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setBrandSegment('todos');
    setBrandSearchTerm('');
    setSearchFilter('');
    setOnlyCompatible(false);
    setOnlyOffers(false);
    setPriceMax(3500);
    setSortBy('featured');
    setVinValidated(false);
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
    setVinValidated(true);
    setOnlyCompatible(true);
    showToast(`✓ Chasis "${vinInput.toUpperCase()}" validado con catálogo oficial OEM. Mostrando solo repuestos compatibles.`);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += selectedCategories.length;
    count += selectedBrands.length;
    if (brandSegment !== 'todos') count++;
    if (searchFilter.trim() !== '') count++;
    if (onlyCompatible) count++;
    if (onlyOffers) count++;
    if (priceMax < 3500) count++;
    return count;
  }, [selectedCategories, selectedBrands, brandSegment, searchFilter, onlyCompatible, onlyOffers, priceMax]);

  // Reusable Filter Sidebar Content component (used both in Desktop and Mobile drawer)
  const renderFilterControls = (isMobile = false) => (
    <div className="space-y-4">
      {/* 1. TARJETA DESTACADA: ASISTENTE DE COMPATIBILIDAD & VIN */}
      <div className="bg-white rounded-2xl border border-[#9D9D9C]/40 p-4 shadow-sm relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#212955] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px] text-[#F07F00]">directions_car</span>
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F07F00] block">
                Tu Vehículo Guardado
              </span>
              <h4 className="font-bold text-xs text-[#212955] truncate max-w-[190px]">
                {activeGarage.brand} {activeGarage.model} ({activeGarage.year})
              </h4>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsGarageModalOpen(true)}
            className="text-[11px] font-bold text-[#F07F00] hover:underline cursor-pointer"
            title="Cambiar vehículo"
          >
            Cambiar
          </button>
        </div>

        {/* Toggle Solo Compatibles */}
        <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
          onlyCompatible
            ? 'bg-[#212955]/5 border-[#212955] text-[#212955]'
            : 'bg-gray-50 border-[#9D9D9C]/30 text-gray-700 hover:bg-gray-100'
        }`}>
          <input
            type="checkbox"
            checked={onlyCompatible}
            onChange={(e) => setOnlyCompatible(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-[#F07F00] rounded cursor-pointer shrink-0"
          />
          <div className="text-xs">
            <span className="font-bold block text-[#212955]">
              Solo repuestos 100% compatibles
            </span>
            <span className="text-[10px] text-gray-500 leading-tight block">
              Filtra piezas que calcen con {activeGarage.brand} {activeGarage.model.split(' ')[0]}
            </span>
          </div>
        </label>

        {/* VIN Check mini-form */}
        <div className="pt-2 border-t border-[#9D9D9C]/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#212955] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#F07F00]">pin</span>
              Validar por Chasis (VIN)
            </span>
            {vinValidated && (
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">verified</span>
                OEM OK
              </span>
            )}
          </div>
          <form onSubmit={handleVinValidate} className="flex gap-1.5">
            <input
              type="text"
              value={vinInput}
              onChange={(e) => setVinInput(e.target.value.toUpperCase())}
              placeholder="17 dígitos de chasis..."
              maxLength={17}
              className="flex-1 bg-gray-50 border border-[#9D9D9C]/50 rounded-xl px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-[#212955] focus:outline-none focus:border-[#212955] focus:bg-white"
            />
            <button
              type="submit"
              className="bg-[#212955] hover:bg-[#2b356e] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Cotejar
            </button>
          </form>
        </div>
      </div>

      {/* 2. PANEL PRINCIPAL DE FILTROS FACETADOS ESTILO FALABELLA */}
      <div className="bg-white rounded-2xl border border-[#9D9D9C]/40 shadow-sm overflow-hidden divide-y divide-[#9D9D9C]/20">
        {/* Cabecera del panel */}
        <div className="p-4 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F07F00] text-lg">tune</span>
            <span className="font-bold text-sm text-[#212955]">Filtros Seleccionados</span>
            {activeFiltersCount > 0 && (
              <span className="bg-[#F07F00] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-[#F07F00] hover:underline font-bold cursor-pointer"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {/* Buscador de texto rápido */}
        <div className="p-4">
          <label className="block text-[11px] font-bold text-[#212955] uppercase tracking-wider mb-1.5">
            Búsqueda de Repuesto / OEM
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="SKU, OEM, repuesto..."
              className="w-full bg-gray-50 border border-[#9D9D9C]/50 rounded-xl p-2.5 pl-8 text-xs font-medium text-[#212955] focus:outline-none focus:border-[#212955] focus:bg-white"
            />
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[#9D9D9C] text-base pointer-events-none">
              search
            </span>
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ACORDEÓN 1: CATEGORÍAS & SISTEMAS (Multi-selección) */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('categories')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#212955]">
                Categorías &amp; Sistemas
              </span>
              {selectedCategories.length > 0 && (
                <span className="bg-[#F07F00] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {selectedCategories.length}
                </span>
              )}
            </div>
            <span
              className={`material-symbols-outlined text-[#9D9D9C] text-lg transition-transform duration-200 ${
                openSections.categories ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {openSections.categories && (
            <div className="px-4 pb-4 pt-1 space-y-1.5 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
              {/* Botón para desmarcar todas */}
              {selectedCategories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="text-[11px] text-[#F07F00] hover:underline font-bold mb-1 flex items-center gap-1 cursor-pointer"
                >
                  <span>✕</span> Deseleccionar todas las categorías
                </button>
              )}

              {CATEGORIES.map((cat) => {
                const isChecked = selectedCategories.includes(cat.id);
                const count = autoParts.filter((p) => p.category === cat.id).length;

                return (
                  <label
                    key={cat.id}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-[#212955]/10 text-[#212955] font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleCategory(cat.id)}
                        className="w-4 h-4 accent-[#F07F00] rounded cursor-pointer shrink-0"
                      />
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                        isChecked
                          ? 'bg-[#212955] text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* ACORDEÓN 2: MARCAS & FABRICANTES (Multi-selección + Buscador interno) */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('brands')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#212955]">
                Marcas &amp; Fabricantes
              </span>
              {selectedBrands.length > 0 && (
                <span className="bg-[#F07F00] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {selectedBrands.length}
                </span>
              )}
            </div>
            <span
              className={`material-symbols-outlined text-[#9D9D9C] text-lg transition-transform duration-200 ${
                openSections.brands ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {openSections.brands && (
            <div className="px-4 pb-4 pt-1 space-y-2.5">
              {/* Buscador interno de marcas */}
              <div className="relative">
                <input
                  type="text"
                  value={brandSearchTerm}
                  onChange={(e) => setBrandSearchTerm(e.target.value)}
                  placeholder="Filtrar marca..."
                  className="w-full bg-gray-50 border border-[#9D9D9C]/40 rounded-lg py-1.5 pl-7 pr-6 text-xs text-[#212955] focus:outline-none focus:border-[#212955]"
                />
                <span className="material-symbols-outlined absolute left-2 top-2 text-[#9D9D9C] text-sm pointer-events-none">
                  search
                </span>
                {brandSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setBrandSearchTerm('')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Selector de Segmento: Oficial vs Alternativa / China */}
              <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setBrandSegment('todos')}
                  className={`py-1 px-1.5 rounded-lg transition-all text-center cursor-pointer ${
                    brandSegment === 'todos'
                      ? 'bg-[#212955] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setBrandSegment('oficial')}
                  className={`py-1 px-1.5 rounded-lg transition-all text-center cursor-pointer ${
                    brandSegment === 'oficial'
                      ? 'bg-[#212955] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  OEM Oficial
                </button>
                <button
                  type="button"
                  onClick={() => setBrandSegment('alternativa')}
                  className={`py-1 px-1.5 rounded-lg transition-all text-center cursor-pointer ${
                    brandSegment === 'alternativa'
                      ? 'bg-[#212955] text-white shadow-xs'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  China / Alt.
                </button>
              </div>

              {/* Botón para desmarcar marcas */}
              {selectedBrands.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedBrands([])}
                  className="text-[11px] text-[#F07F00] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>✕</span> Deseleccionar marcas ({selectedBrands.length})
                </button>
              )}

              {/* Lista con checkboxes de marcas */}
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {visibleBrands.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2 text-center">
                    No se encontró la marca "{brandSearchTerm}"
                  </p>
                ) : (
                  visibleBrands.map((b) => {
                    const isChecked = selectedBrands.includes(b.id);
                    const count = autoParts.filter(
                      (p) =>
                        p.brand.toLowerCase().includes(b.id.toLowerCase()) ||
                        b.id.toLowerCase().includes(p.brand.toLowerCase())
                    ).length;

                    return (
                      <label
                        key={b.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-[#212955]/10 text-[#212955] font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleBrand(b.id)}
                            className="w-4 h-4 accent-[#F07F00] rounded cursor-pointer shrink-0"
                          />
                          <span className="truncate">{b.label}</span>
                          {b.badge && (
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-bold shrink-0 ${
                                isChecked
                                  ? 'bg-[#212955] text-white'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {b.badge}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] ml-1 shrink-0 ${
                            isChecked ? 'text-[#212955] font-bold' : 'text-gray-400'
                          }`}
                        >
                          ({count})
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ACORDEÓN 3: RANGO DE PRECIO */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#212955]">
                Precio Máximo
              </span>
              {priceMax < 3500 && (
                <span className="bg-[#F07F00] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  1
                </span>
              )}
            </div>
            <span
              className={`material-symbols-outlined text-[#9D9D9C] text-lg transition-transform duration-200 ${
                openSections.price ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {openSections.price && (
            <div className="px-4 pb-4 pt-1 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Tope seleccionado:</span>
                <span className="font-extrabold text-sm text-[#212955] font-mono">
                  S/ {priceMax.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="3500"
                step="50"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#F07F00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#9D9D9C] font-mono">
                <span>S/ 50</span>
                <span>S/ 1,500</span>
                <span>S/ 3,500+</span>
              </div>

              {/* Presets rápidos de precio */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: '< S/ 250', val: 250 },
                  { label: '< S/ 600', val: 600 },
                  { label: '< S/ 1,200', val: 1200 },
                  { label: 'Todos', val: 3500 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPriceMax(preset.val)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer border ${
                      priceMax === preset.val
                        ? 'bg-[#212955] text-white border-[#212955]'
                        : 'bg-gray-50 text-gray-700 border-[#9D9D9C]/30 hover:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ACORDEÓN 4: OFERTAS & PROMOCIONES */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('offers')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#212955]">
                Ofertas &amp; Beneficios
              </span>
              {onlyOffers && (
                <span className="bg-[#F07F00] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  1
                </span>
              )}
            </div>
            <span
              className={`material-symbols-outlined text-[#9D9D9C] text-lg transition-transform duration-200 ${
                openSections.offers ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {openSections.offers && (
            <div className="px-4 pb-4 pt-1 space-y-2">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={onlyOffers}
                  onChange={(e) => setOnlyOffers(e.target.checked)}
                  className="w-4 h-4 accent-[#F07F00] rounded cursor-pointer"
                />
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-amber-500 text-sm">local_offer</span>
                  <span>Solo con Descuento o Promoción</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={onlyCompatible}
                  onChange={(e) => setOnlyCompatible(e.target.checked)}
                  className="w-4 h-4 accent-[#F07F00] rounded cursor-pointer"
                />
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-600 text-sm">verified</span>
                  <span>Garantía de Calce para {activeGarage.brand}</span>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* ACORDEÓN 5: CERTIFICACIÓN & GARANTÍA */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('compatibility')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#212955]">
                Garantía y Entrega
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-[#9D9D9C] text-lg transition-transform duration-200 ${
                openSections.compatibility ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {openSections.compatibility && (
            <div className="px-4 pb-4 pt-1 space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
                <span className="material-symbols-outlined text-emerald-600 text-base">local_shipping</span>
                <span>Despacho a todo el Perú (24-48 hrs)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
                <span className="material-symbols-outlined text-[#212955] text-base">build</span>
                <span>Instalación disponible en Taller Nor Celis</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
                <span className="material-symbols-outlined text-[#F07F00] text-base">verified_user</span>
                <span>12 meses de garantía oficial por defecto</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-gutter py-6 space-y-6">
      {/* Active Garage Vehicle Banner */}
      <div className="bg-[#212955] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-[#212955]/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F07F00] text-white flex items-center justify-center font-bold shadow-lg shrink-0">
              <span className="material-symbols-outlined text-3xl">garage</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#212955] bg-white px-2.5 py-0.5 rounded-full">
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
              <div className="text-xs text-gray-300 flex flex-wrap gap-2 mt-0.5 font-mono">
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
            <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer border transition-colors ${
              onlyCompatible ? 'bg-[#F07F00] text-white border-[#F07F00]' : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
            }`}>
              <input
                type="checkbox"
                checked={onlyCompatible}
                onChange={(e) => setOnlyCompatible(e.target.checked)}
                className="w-4 h-4 accent-white rounded cursor-pointer"
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
      <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-[#212955] flex items-center gap-1.5 uppercase tracking-wider">
            <span className="material-symbols-outlined text-[#F07F00] text-sm">stars</span>
            Marcas Oficiales Nor Celis
          </span>
          <span className="text-[11px] text-[#9D9D9C]">Click para filtrar o combinar marcas</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setSelectedBrands([])}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
              selectedBrands.length === 0
                ? 'bg-[#212955] text-white border-[#212955] shadow-xs'
                : 'bg-gray-50 text-gray-700 border-[#9D9D9C]/30 hover:border-[#212955]/40 hover:bg-gray-100'
            }`}
          >
            <span>Todas las Marcas</span>
          </button>
          {[
            { name: 'Mickey Thompson (M/T)', val: 'Mickey Thompson' },
            { name: 'KEKO 4x4', val: 'KEKO' },
            { name: 'Mobil 1', val: 'Mobil' },
            { name: 'LLumar', val: 'LLumar' },
            { name: 'BLACK RHINO', val: 'BLACK RHINO' },
            { name: '3M Auto', val: '3M' },
            { name: 'TRAKKO®', val: 'TRAKKO® AUTORUS' },
            { name: 'TOYOTA OEM', val: 'TOYOTA Genuino' },
            { name: 'Brembo', val: 'Brembo Official' },
            { name: 'Bosch', val: 'Bosch Automotive' },
            { name: 'KYB Shocks', val: 'KYB Shocks & Struts' },
            { name: 'Denso', val: 'Denso Corporation' },
            { name: 'Sailun Tire', val: 'Sailun Tire' },
            { name: 'Triangle', val: 'Triangle Tire' },
          ].map((b) => {
            const isSelected = selectedBrands.includes(b.val);
            return (
              <button
                key={b.val}
                onClick={() => handleToggleBrand(b.val)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 min-h-[38px] ${
                  isSelected
                    ? 'bg-[#F07F00] text-white border-[#F07F00] shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-[#9D9D9C]/30 hover:border-[#212955]/40 hover:bg-gray-100'
                }`}
              >
                <span>{b.name}</span>
                {isSelected && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Faceted Sidebar + Product Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden col-span-1 flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#9D9D9C]/30">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 bg-[#212955] text-white text-xs font-bold px-4 py-2.5 rounded-xl min-h-[44px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#F07F00]">tune</span>
            <span>Filtros y Categorías ({activeFiltersCount})</span>
          </button>
          <span className="text-xs text-gray-600 font-medium">
            <strong className="text-[#212955]">{filteredParts.length}</strong> productos
          </span>
        </div>

        {/* Sidebar Filters Desktop (CSS Target: .filter-panel-container) */}
        <aside className="filter-panel-container hidden lg:block lg:col-span-3 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin pr-1 pb-6">
          {renderFilterControls(false)}
        </aside>

        {/* Product Grid Content */}
        <main className="lg:col-span-9 space-y-4">
          {/* Active filter chips & Top Sort Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-[#9D9D9C]/30 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-gray-500 font-medium">
                Mostrando <strong className="text-[#212955] font-bold text-sm">{filteredParts.length}</strong> repuestos &amp; accesorios garantizados
              </div>
              <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-gray-500 hidden sm:inline">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-50 border border-[#9D9D9C]/40 text-[#212955] rounded-xl p-2 text-xs font-semibold focus:outline-none cursor-pointer min-h-[40px]"
                >
                  <option value="featured">Destacados &amp; Recomendados OEM</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="rating-desc">Mayor Calificación (5 Estrellas)</option>
                  <option value="name-asc">Nombre A - Z</option>
                </select>
              </div>
            </div>

            {/* Active filter chips tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
                <span className="text-[11px] font-bold text-gray-400">Filtros activos:</span>

                {/* Selected categories chips */}
                {selectedCategories.map((catId) => {
                  const catObj = CATEGORIES.find((c) => c.id === catId);
                  return (
                    <span
                      key={catId}
                      className="inline-flex items-center gap-1 bg-[#212955]/10 text-[#212955] font-bold px-2.5 py-1 rounded-lg border border-[#212955]/20"
                    >
                      <span>Cat: {catObj?.label || catId}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleCategory(catId)}
                        className="hover:text-red-500 font-black ml-1 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}

                {/* Selected brands chips */}
                {selectedBrands.map((brandId) => (
                  <span
                    key={brandId}
                    className="inline-flex items-center gap-1 bg-[#F07F00]/10 text-[#212955] font-bold px-2.5 py-1 rounded-lg border border-[#F07F00]/30"
                  >
                    <span>Marca: {brandId}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleBrand(brandId)}
                      className="hover:text-red-500 font-black ml-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {brandSegment !== 'todos' && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 font-bold px-2.5 py-1 rounded-lg border border-gray-200">
                    Línea: {brandSegment === 'oficial' ? 'OEM Oficial' : 'China / Alt.'}
                    <button
                      type="button"
                      onClick={() => setBrandSegment('todos')}
                      className="hover:text-red-500 font-black ml-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {searchFilter.trim() !== '' && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg border border-gray-200">
                    Búsqueda: "{searchFilter}"
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="hover:text-red-500 font-black ml-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {onlyOffers && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-lg">
                    Con Oferta / Promo
                    <button
                      type="button"
                      onClick={() => setOnlyOffers(false)}
                      className="hover:text-red-500 font-black ml-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {onlyCompatible && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-lg">
                    Compatible {activeGarage.model.split(' ')[0]}
                    <button
                      type="button"
                      onClick={() => setOnlyCompatible(false)}
                      className="hover:text-red-500 font-black ml-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {priceMax < 3500 && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 font-semibold px-2.5 py-1 rounded-lg">
                    Hasta S/ {priceMax.toLocaleString()}
                    <button
                      type="button"
                      onClick={() => setPriceMax(3500)}
                      className="hover:text-red-500 font-black ml-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}

                <button
                  type="button"
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
            <div className="bg-white p-12 rounded-3xl border border-[#9D9D9C]/30 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-[#9D9D9C]">
                <span className="material-symbols-outlined text-3xl">search_off</span>
              </div>
              <h3 className="text-lg font-bold text-[#212955]">
                No se encontraron repuestos con los filtros seleccionados
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Prueba ajustando el rango de precio, desmarcando algunas marcas o desactivando el filtro de compatibilidad estricta.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-[#212955] hover:bg-[#2b356e] text-white text-xs font-bold px-6 py-3 rounded-xl cursor-pointer min-h-[44px]"
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
                    className="bg-white rounded-3xl border border-[#9D9D9C]/30 hover:border-[#212955]/40 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Photo area with Quick Zoom Button */}
                    <div
                      onClick={() => openPartDetail(part.sku)}
                      className="relative aspect-video bg-gray-50 p-4 flex items-center justify-center overflow-hidden cursor-pointer"
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
                        <span className="absolute top-3 left-3 bg-[#212955] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm">
                          {part.badge}
                        </span>
                      )}
                      {part.discount && (
                        <span className="absolute bottom-3 left-3 bg-[#F07F00] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
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
                        className="absolute bottom-3 right-3 bg-white/90 hover:bg-[#212955] hover:text-white text-[#212955] text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-md border border-[#9D9D9C]/30 flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer z-10"
                        title="Ver con Zoom Focal HD"
                      >
                        <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                        <span className="hidden sm:inline">Zoom HD</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist({
                            id: part.id,
                            type: 'part',
                            title: part.name,
                            subtitle: `${part.brand} • SKU: ${part.sku}`,
                            sku: part.sku,
                            priceSoles: part.priceSoles,
                            priceUsd: part.priceUsd,
                            oldPriceSoles: part.oldPriceSoles,
                            image: part.image,
                            categoryBadge: part.brandType === 'alternativa' ? 'Alternativa / China' : 'OEM Oficial',
                          });
                        }}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs cursor-pointer ${
                          inWish ? 'bg-red-50 text-red-500' : 'bg-white/80 hover:bg-white text-gray-400 hover:text-red-500'
                        }`}
                        title={inWish ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {inWish ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>
                    </div>

                    {/* Part Details Info */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold uppercase tracking-wider text-[#F07F00]">
                            {part.brand}
                          </span>
                          <span className="font-mono text-gray-400 text-[10px]">
                            SKU: {part.sku}
                          </span>
                        </div>

                        <h3
                          onClick={() => openPartDetail(part.sku)}
                          className="font-bold text-sm text-[#212955] group-hover:text-[#F07F00] transition-colors line-clamp-2 cursor-pointer leading-snug"
                        >
                          {part.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                          <span className="truncate text-[11px] font-medium">
                            {part.compatibleVehicle}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {part.features.slice(0, 2).map((feat, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium truncate max-w-full"
                            >
                              • {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price & Action Button */}
                      <div className="pt-3 border-t border-gray-100 space-y-2.5">
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-headline font-black text-lg text-[#212955] font-mono">
                                S/ {part.priceSoles.toLocaleString()}
                              </span>
                              {part.oldPriceSoles && (
                                <span className="text-xs text-[#9D9D9C] line-through font-mono">
                                  S/ {part.oldPriceSoles.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">
                              (${part.priceUsd} USD aprox.)
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {part.stockText || 'En Stock'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => openPartDetail(part.sku)}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-[#212955] text-xs font-bold py-2 rounded-xl transition-all cursor-pointer min-h-[40px]"
                          >
                            Ver Ficha
                          </button>
                          <button
                            type="button"
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
                            className="w-full bg-[#212955] hover:bg-[#2b356e] text-white text-xs font-bold py-2 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer min-h-[40px]"
                          >
                            <span className="material-symbols-outlined text-base text-[#F07F00]">add_shopping_cart</span>
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
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#9D9D9C]/30">
              <h3 className="font-headline font-bold text-base text-[#212955] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F07F00]">tune</span>
                Filtros Especializados
              </h3>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#212955] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {renderFilterControls(true)}

            <div className="pt-4 border-t border-[#9D9D9C]/30 space-y-2">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-[#212955] text-white font-bold py-3 rounded-xl text-xs min-h-[44px] cursor-pointer"
              >
                Ver {filteredParts.length} repuestos
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full bg-gray-100 text-gray-700 font-bold py-2.5 rounded-xl text-xs min-h-[44px] cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#9D9D9C]/30 flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-5 flex items-center justify-between border-b border-gray-100 bg-gray-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-600 text-lg">zoom_in</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#F07F00]">
                    {zoomModalPart.brand} • SKU: {zoomModalPart.sku}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-bold text-[#212955] truncate max-w-md">
                  {zoomModalPart.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setZoomModalPart(null)}
                className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center shadow-xs cursor-pointer"
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

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Compatible: {zoomModalPart.compatibleVehicle}</div>
                  <div className="text-lg font-black text-[#212955] font-mono">
                    S/ {zoomModalPart.priceSoles.toLocaleString()} <span className="text-xs text-gray-400 font-normal">(${zoomModalPart.priceUsd} USD)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const sku = zoomModalPart.sku;
                      setZoomModalPart(null);
                      openPartDetail(sku);
                    }}
                    className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-[#212955] text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer min-h-[44px]"
                  >
                    Ver Ficha Completa
                  </button>
                  <button
                    type="button"
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
                    className="flex-1 sm:flex-none bg-[#212955] hover:bg-[#2b356e] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base text-[#F07F00]">add_shopping_cart</span>
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
