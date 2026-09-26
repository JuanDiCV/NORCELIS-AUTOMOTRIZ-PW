import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Vehicle } from '../types';
import { SafeImage } from '../components/SafeImage';
import { FocalZoomImage } from '../components/FocalZoomImage';
import { FALLBACK_IMAGES } from '../utils/imageAssets';

export const CarsCatalogView: React.FC = () => {
  const {
    vehicles,
    setSelectedVehicleId,
    setCurrentView,
    setIsViewer360Open,
    toggleWishlist,
    isInWishlist,
    showToast,
  } = useApp();

  // --- FILTROS AVANZADOS ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'nuevo' | 'seminuevo'>('all');
  const [bodyTypeFilter, setBodyTypeFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [brandSegment, setBrandSegment] = useState<'all' | 'oficial' | 'alternativa'>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [transmissionFilter, setTransmissionFilter] = useState<string>('all');
  const [tractionFilter, setTractionFilter] = useState<string>('all');
  const [fuelFilter, setFuelFilter] = useState<string>('all');

  // 1. Rango de precio (Soles)
  const MIN_POSSIBLE_PRICE = 60000;
  const MAX_POSSIBLE_PRICE = 250000;
  const [minPrice, setMinPrice] = useState<number>(MIN_POSSIBLE_PRICE);
  const [maxPrice, setMaxPrice] = useState<number>(MAX_POSSIBLE_PRICE);

  // 2. Kilometraje
  const MAX_POSSIBLE_MILEAGE = 80000;
  const [maxMileage, setMaxMileage] = useState<number>(MAX_POSSIBLE_MILEAGE);
  const [onlyZeroKm, setOnlyZeroKm] = useState<boolean>(false);

  // 3. Año de fabricación
  const MIN_POSSIBLE_YEAR = 2020;
  const MAX_POSSIBLE_YEAR = 2025;
  const [minYear, setMinYear] = useState<number>(MIN_POSSIBLE_YEAR);
  const [maxYear, setMaxYear] = useState<number>(MAX_POSSIBLE_YEAR);

  // 4. Tipo de combustible (multi-selección o individual)
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);

  // Ordenamiento
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'mileage-asc' | 'year-desc'>('featured');

  // Mobile drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);
  const [zoomModalVehicle, setZoomModalVehicle] = useState<Vehicle | null>(null);

  // --- Simulador de Crédito Rápido ---
  const [calcCarPrice] = useState<number>(121830);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanMonths, setLoanMonths] = useState<number>(48);

  const downPaymentAmount = (calcCarPrice * downPaymentPercent) / 100;
  const loanPrincipal = calcCarPrice - downPaymentAmount;
  const monthlyRate = 0.125 / 12;
  const calculatedMonthlySoles = Math.round(
    (loanPrincipal * (monthlyRate * Math.pow(1 + monthlyRate, loanMonths))) /
      (Math.pow(1 + monthlyRate, loanMonths) - 1)
  );

  // Función auxiliar para parsear kilometraje numérico
  const getCarMileage = (car: Vehicle): number => {
    if (car.condition === 'nuevo') return 0;
    if (!car.specs.mileage) return 0;
    const cleanNum = parseInt(car.specs.mileage.replace(/[^0-9]/g, ''), 10);
    return isNaN(cleanNum) ? 0 : cleanNum;
  };

  // Toggle de combustible
  const handleToggleFuel = (fuel: string) => {
    setSelectedFuels((prev) =>
      prev.includes(fuel) ? prev.filter((f) => f !== fuel) : [...prev, fuel]
    );
  };

  // Contadores dinámicos para los filtros de combustible
  const fuelCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Híbrido': 0,
      'Gasolina': 0,
      '100% Eléctrico': 0,
      'Diésel': 0,
    };
    vehicles.forEach((v) => {
      if (counts[v.fuelType] !== undefined) {
        counts[v.fuelType]++;
      }
    });
    return counts;
  }, [vehicles]);

  // Lista de años disponibles en catálogo
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    vehicles.forEach((v) => yearsSet.add(v.year));
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [vehicles]);

  // Lista de marcas disponibles
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    vehicles.forEach((v) => brandsSet.add(v.brand));
    return Array.from(brandsSet).sort();
  }, [vehicles]);

  // Lista de modelos disponibles (filtrados por marca si aplica)
  const availableModels = useMemo(() => {
    const list = brandFilter === 'all'
      ? vehicles
      : vehicles.filter((v) => v.brand === brandFilter);
    const modelsSet = new Set<string>();
    list.forEach((v) => {
      const cleanName = v.name.replace(new RegExp(`^${v.brand}\\s*`, 'i'), '').trim();
      modelsSet.add(cleanName || v.name);
    });
    return Array.from(modelsSet).sort();
  }, [vehicles, brandFilter]);

  // Reset total de filtros
  const handleResetFilters = () => {
    setSearchQuery('');
    setConditionFilter('all');
    setBodyTypeFilter('all');
    setBrandFilter('all');
    setBrandSegment('all');
    setModelFilter('all');
    setTransmissionFilter('all');
    setTractionFilter('all');
    setFuelFilter('all');
    setMinPrice(MIN_POSSIBLE_PRICE);
    setMaxPrice(MAX_POSSIBLE_PRICE);
    setMaxMileage(MAX_POSSIBLE_MILEAGE);
    setOnlyZeroKm(false);
    setMinYear(MIN_POSSIBLE_YEAR);
    setMaxYear(MAX_POSSIBLE_YEAR);
    setSelectedFuels([]);
    setSortBy('featured');
    showToast('Filtros restablecidos');
  };

  // Comprobar si hay filtros activos no predeterminados
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== '') count++;
    if (conditionFilter !== 'all') count++;
    if (bodyTypeFilter !== 'all') count++;
    if (brandFilter !== 'all') count++;
    if (brandSegment !== 'all') count++;
    if (modelFilter !== 'all') count++;
    if (transmissionFilter !== 'all') count++;
    if (tractionFilter !== 'all') count++;
    if (fuelFilter !== 'all') count++;
    if (minPrice > MIN_POSSIBLE_PRICE || maxPrice < MAX_POSSIBLE_PRICE) count++;
    if (maxMileage < MAX_POSSIBLE_MILEAGE || onlyZeroKm) count++;
    if (minYear > MIN_POSSIBLE_YEAR || maxYear < MAX_POSSIBLE_YEAR) count++;
    if (selectedFuels.length > 0) count += selectedFuels.length;
    return count;
  }, [
    searchQuery,
    conditionFilter,
    bodyTypeFilter,
    brandFilter,
    brandSegment,
    modelFilter,
    transmissionFilter,
    tractionFilter,
    fuelFilter,
    minPrice,
    maxPrice,
    maxMileage,
    onlyZeroKm,
    minYear,
    maxYear,
    selectedFuels,
  ]);

  // Filtrado y ordenamiento de vehículos
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        // Segmento de marca: Oficial vs Alternativa / China
        if (brandSegment === 'oficial' && v.brandType === 'alternativa') return false;
        if (brandSegment === 'alternativa' && v.brandType !== 'alternativa') return false;

        // Texto libre
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = v.name.toLowerCase().includes(q);
          const matchBrand = v.brand.toLowerCase().includes(q);
          const matchSubtitle = v.subtitle.toLowerCase().includes(q);
          const matchFuel = v.fuelType.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchSubtitle && !matchFuel) return false;
        }

        // Condición (Nuevo / Seminuevo)
        if (conditionFilter !== 'all' && v.condition !== conditionFilter) return false;

        // Carrocería
        if (bodyTypeFilter !== 'all' && v.bodyType !== bodyTypeFilter) return false;

        // Marca
        if (brandFilter !== 'all' && v.brand !== brandFilter) return false;

        // Modelo
        if (modelFilter !== 'all') {
          const cleanName = v.name.replace(new RegExp(`^${v.brand}\\s*`, 'i'), '').trim();
          if (cleanName !== modelFilter && !v.name.toLowerCase().includes(modelFilter.toLowerCase())) {
            return false;
          }
        }

        // Transmisión
        if (transmissionFilter !== 'all') {
          const t = (v.specs.transmission || '').toLowerCase();
          if (transmissionFilter === 'automatica' && !t.includes('auto') && !t.includes('dct') && !t.includes('steptronic') && !t.includes('zf') && !t.includes('sec')) return false;
          if (transmissionFilter === 'manual' && !t.includes('manual') && !t.includes('mecán')) return false;
          if (transmissionFilter === 'cvt' && !t.includes('cvt') && !t.includes('direct drive') && !t.includes('dht') && !t.includes('eléctric')) return false;
        }

        // Tracción
        if (tractionFilter !== 'all') {
          const tr = (v.specs.traction || '').toLowerCase();
          if (tractionFilter === '4x4' && !tr.includes('4x4') && !tr.includes('awd') && !tr.includes('quattro') && !tr.includes('htrac')) return false;
          if (tractionFilter === '4x2' && !tr.includes('fwd') && !tr.includes('delantera') && !tr.includes('4x2')) return false;
          if (tractionFilter === 'trasera' && !tr.includes('rwd') && !tr.includes('trasera')) return false;
        }

        // Combustible (vía select o selectedFuels)
        if (fuelFilter !== 'all' && v.fuelType !== fuelFilter) return false;
        if (selectedFuels.length > 0 && !selectedFuels.includes(v.fuelType)) return false;

        // Rango de precio
        if (v.priceSoles < minPrice || v.priceSoles > maxPrice) return false;

        // Kilometraje
        const mileage = getCarMileage(v);
        if (onlyZeroKm && mileage > 0) return false;
        if (mileage > maxMileage) return false;

        // Año de fabricación
        if (v.year < minYear || v.year > maxYear) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.priceSoles - b.priceSoles;
        if (sortBy === 'price-desc') return b.priceSoles - a.priceSoles;
        if (sortBy === 'mileage-asc') return getCarMileage(a) - getCarMileage(b);
        if (sortBy === 'year-desc') return b.year - a.year;
        // 'featured': Nuevos con bono primero, luego por precio descendente
        return (b.discountBonus ? 1 : 0) - (a.discountBonus ? 1 : 0);
      });
  }, [
    vehicles,
    searchQuery,
    conditionFilter,
    bodyTypeFilter,
    brandFilter,
    brandSegment,
    modelFilter,
    transmissionFilter,
    tractionFilter,
    fuelFilter,
    minPrice,
    maxPrice,
    maxMileage,
    onlyZeroKm,
    minYear,
    maxYear,
    selectedFuels,
    sortBy,
  ]);

  // Handler para botón de buscar vehículos
  const handleSearchVehiclesClick = () => {
    const el = document.getElementById('catalog-results-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Mostrando ${filteredVehicles.length} vehículos encontrados`);
    setIsMobileFiltersOpen(false);
  };

  // Contenido de filtros estructurado exactamente como la imagen de referencia con agregados
  const renderFilterControls = () => (
    <div className="space-y-4 text-left">
      {/* AGREGADO 1: Switch de Condición & Reset Rápido */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#212955]">
            Condición del Vehículo
          </span>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-[#F07F00] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]">restart_alt</span>
              Limpiar ({activeFiltersCount})
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-bold">
          <button
            type="button"
            onClick={() => setConditionFilter('all')}
            className={`py-1.5 px-1 rounded-md text-center transition-all cursor-pointer ${
              conditionFilter === 'all'
                ? 'bg-white text-[#212955] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            TODOS
          </button>
          <button
            type="button"
            onClick={() => setConditionFilter('nuevo')}
            className={`py-1.5 px-1 rounded-md text-center transition-all cursor-pointer ${
              conditionFilter === 'nuevo'
                ? 'bg-white text-[#212955] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            0 KM
          </button>
          <button
            type="button"
            onClick={() => setConditionFilter('seminuevo')}
            className={`py-1.5 px-1 rounded-md text-center transition-all cursor-pointer ${
              conditionFilter === 'seminuevo'
                ? 'bg-white text-[#212955] shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            SEMINUEVO
          </button>
        </div>
      </div>

      {/* 1. MARCA */}
      <div>
        <label className="block text-center text-xs font-bold text-[#212955] mb-1.5">
          Marca
        </label>
        <select
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value);
            setModelFilter('all');
          }}
          className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-xs font-bold text-center text-slate-700 uppercase focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all cursor-pointer shadow-2xs"
        >
          <option value="all">TODOS</option>
          {availableBrands.map((brand) => (
            <option key={brand} value={brand}>
              {brand} ({vehicles.filter((v) => v.brand === brand).length})
            </option>
          ))}
        </select>
      </div>

      {/* 2. MODELO */}
      <div>
        <label className="block text-center text-xs font-bold text-[#212955] mb-1.5">
          Modelo
        </label>
        <select
          value={modelFilter}
          onChange={(e) => setModelFilter(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-xs font-bold text-center text-slate-700 uppercase focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all cursor-pointer shadow-2xs"
        >
          <option value="all">TODOS</option>
          {availableModels.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* 3. TRANSMISIÓN */}
      <div>
        <label className="block text-center text-xs font-bold text-[#212955] mb-1.5">
          Transmisión
        </label>
        <select
          value={transmissionFilter}
          onChange={(e) => setTransmissionFilter(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-xs font-bold text-center text-slate-700 uppercase focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all cursor-pointer shadow-2xs"
        >
          <option value="all">TODAS</option>
          <option value="automatica">AUTOMÁTICA / SECUENCIAL</option>
          <option value="manual">MANUAL / MECÁNICA</option>
          <option value="cvt">CVT / E-CVT / ELÉCTRICA</option>
        </select>
      </div>

      {/* 4. TRACCIÓN */}
      <div>
        <label className="block text-center text-xs font-bold text-[#212955] mb-1.5">
          Tracción
        </label>
        <select
          value={tractionFilter}
          onChange={(e) => setTractionFilter(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-xs font-bold text-center text-slate-700 uppercase focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all cursor-pointer shadow-2xs"
        >
          <option value="all">TODAS</option>
          <option value="4x4">4X4 / AWD (TRACCIÓN TOTAL)</option>
          <option value="4x2">4X2 / FWD (DELANTERA)</option>
          <option value="trasera">TRASERA / RWD</option>
        </select>
      </div>

      {/* 5. COMBUSTIBLE */}
      <div>
        <label className="block text-center text-xs font-bold text-[#212955] mb-1.5">
          Combustible
        </label>
        <select
          value={fuelFilter}
          onChange={(e) => setFuelFilter(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-xs font-bold text-center text-slate-700 uppercase focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all cursor-pointer shadow-2xs"
        >
          <option value="all">TODOS</option>
          <option value="Híbrido">HÍBRIDO AUTORRECARGABLE ({fuelCounts['Híbrido'] || 0})</option>
          <option value="Gasolina">GASOLINA DIRECT-SHIFT ({fuelCounts['Gasolina'] || 0})</option>
          <option value="100% Eléctrico">100% ELÉCTRICO EV ({fuelCounts['100% Eléctrico'] || 0})</option>
          <option value="Diésel">TURBO DIÉSEL ({fuelCounts['Diésel'] || 0})</option>
        </select>
      </div>

      {/* 6. TIPO DE VEHÍCULO */}
      <div>
        <label className="block text-center text-xs font-bold text-[#212955] mb-1.5">
          Tipo de vehículo
        </label>
        <select
          value={bodyTypeFilter}
          onChange={(e) => setBodyTypeFilter(e.target.value)}
          className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-xs font-bold text-center text-slate-700 uppercase focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition-all cursor-pointer shadow-2xs"
        >
          <option value="all">TODOS</option>
          <option value="SUV">SUV ({vehicles.filter((v) => v.bodyType === 'SUV').length})</option>
          <option value="Sedán">SEDÁN ({vehicles.filter((v) => v.bodyType === 'Sedán').length})</option>
          <option value="Pick-Up">PICK-UP ({vehicles.filter((v) => v.bodyType === 'Pick-Up').length})</option>
          <option value="Hatchback">HATCHBACK ({vehicles.filter((v) => v.bodyType === 'Hatchback').length})</option>
        </select>
      </div>

      {/* 7. AÑO (DESDE) - AÑO (HASTA) */}
      <div className="pt-2">
        <label className="block text-center text-xs font-bold text-[#212955] mb-1">
          Año (Desde) - Año (Hasta)
        </label>
        <div className="text-center text-xs font-mono font-bold text-slate-700 mb-2">
          {minYear} - {maxYear}
        </div>
        
        {/* Barra de Rango Visual idéntica a la imagen */}
        <div className="px-1 py-1">
          <div className="h-2 bg-[#475569] rounded-full relative">
            <div
              className="absolute h-full bg-[#212955] rounded-full"
              style={{
                left: `${((minYear - MIN_POSSIBLE_YEAR) / (MAX_POSSIBLE_YEAR - MIN_POSSIBLE_YEAR)) * 100}%`,
                right: `${100 - ((maxYear - MIN_POSSIBLE_YEAR) / (MAX_POSSIBLE_YEAR - MIN_POSSIBLE_YEAR)) * 100}%`,
              }}
            />
            {/* Knob Izquierdo */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#212955] border-2 border-white rounded-xs shadow-md"
              style={{
                left: `calc(${((minYear - MIN_POSSIBLE_YEAR) / (MAX_POSSIBLE_YEAR - MIN_POSSIBLE_YEAR)) * 100}% - 7px)`,
              }}
            />
            {/* Knob Derecho */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#212955] border-2 border-white rounded-xs shadow-md"
              style={{
                left: `calc(${((maxYear - MIN_POSSIBLE_YEAR) / (MAX_POSSIBLE_YEAR - MIN_POSSIBLE_YEAR)) * 100}% - 7px)`,
              }}
            />
          </div>

          {/* Selectores Rápidos Desde / Hasta */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-slate-50 border border-slate-300 rounded-md p-1.5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Desde</span>
              <select
                value={minYear}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinYear(val);
                  if (val > maxYear) setMaxYear(val);
                }}
                className="bg-transparent text-xs font-bold text-[#212955] focus:outline-none cursor-pointer"
              >
                {availableYears.slice().reverse().map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-slate-50 border border-slate-300 rounded-md p-1.5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Hasta</span>
              <select
                value={maxYear}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxYear(val);
                  if (val < minYear) setMinYear(val);
                }}
                className="bg-transparent text-xs font-bold text-[#212955] focus:outline-none cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 8. RANGO DE PRECIOS */}
      <div className="pt-2">
        <label className="block text-center text-xs font-bold text-[#212955] mb-1">
          Rango de precios
        </label>
        <div className="text-center text-xs font-mono font-bold text-slate-700 mb-0.5">
          S/ {minPrice.toLocaleString()} - S/ {maxPrice.toLocaleString()}
        </div>
        <div className="text-center text-[10px] text-slate-500 mb-2">
          (~${Math.round(minPrice / 3.75).toLocaleString()} - ${Math.round(maxPrice / 3.75).toLocaleString()} USD)
        </div>

        {/* Barra de Rango Visual idéntica a la imagen */}
        <div className="px-1 py-1">
          <div className="h-2 bg-[#475569] rounded-full relative">
            <div
              className="absolute h-full bg-[#212955] rounded-full"
              style={{
                left: `${((minPrice - MIN_POSSIBLE_PRICE) / (MAX_POSSIBLE_PRICE - MIN_POSSIBLE_PRICE)) * 100}%`,
                right: `${100 - ((maxPrice - MIN_POSSIBLE_PRICE) / (MAX_POSSIBLE_PRICE - MIN_POSSIBLE_PRICE)) * 100}%`,
              }}
            />
            {/* Knob Izquierdo */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#212955] border-2 border-white rounded-xs shadow-md"
              style={{
                left: `calc(${((minPrice - MIN_POSSIBLE_PRICE) / (MAX_POSSIBLE_PRICE - MIN_POSSIBLE_PRICE)) * 100}% - 7px)`,
              }}
            />
            {/* Knob Derecho */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#212955] border-2 border-white rounded-xs shadow-md"
              style={{
                left: `calc(${((maxPrice - MIN_POSSIBLE_PRICE) / (MAX_POSSIBLE_PRICE - MIN_POSSIBLE_PRICE)) * 100}% - 7px)`,
              }}
            />
          </div>

          {/* Selectores Rápidos Min / Max */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-slate-50 border border-slate-300 rounded-md p-1.5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Min</span>
              <select
                value={minPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinPrice(val);
                  if (val > maxPrice) setMaxPrice(val);
                }}
                className="bg-transparent text-xs font-bold text-[#212955] focus:outline-none cursor-pointer"
              >
                {[60000, 80000, 100000, 120000, 150000, 180000].map((p) => (
                  <option key={p} value={p}>
                    S/ {p / 1000}k
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-slate-50 border border-slate-300 rounded-md p-1.5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Max</span>
              <select
                value={maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxPrice(val);
                  if (val < minPrice) setMinPrice(val);
                }}
                className="bg-transparent text-xs font-bold text-[#212955] focus:outline-none cursor-pointer"
              >
                {[100000, 120000, 150000, 180000, 220000, 250000].map((p) => (
                  <option key={p} value={p}>
                    S/ {p / 1000}k
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Presets Rápidos */}
          <div className="grid grid-cols-3 gap-1 pt-2 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => {
                setMinPrice(MIN_POSSIBLE_PRICE);
                setMaxPrice(95000);
              }}
              className={`py-1 rounded border text-center transition-all cursor-pointer ${
                maxPrice <= 95000 && minPrice === MIN_POSSIBLE_PRICE
                  ? 'bg-[#212955] text-white border-[#212955]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              &lt; S/ 95k
            </button>
            <button
              type="button"
              onClick={() => {
                setMinPrice(95000);
                setMaxPrice(150000);
              }}
              className={`py-1 rounded border text-center transition-all cursor-pointer ${
                minPrice === 95000 && maxPrice === 150000
                  ? 'bg-[#212955] text-white border-[#212955]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              95k - 150k
            </button>
            <button
              type="button"
              onClick={() => {
                setMinPrice(150000);
                setMaxPrice(MAX_POSSIBLE_PRICE);
              }}
              className={`py-1 rounded border text-center transition-all cursor-pointer ${
                minPrice === 150000 && maxPrice === MAX_POSSIBLE_PRICE
                  ? 'bg-[#212955] text-white border-[#212955]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              &gt; S/ 150k
            </button>
          </div>
        </div>
      </div>

      {/* 9. BOTÓN BUSCAR VEHÍCULOS IDÉNTICO A LA IMAGEN */}
      <div className="pt-3">
        <button
          type="button"
          onClick={handleSearchVehiclesClick}
          className="w-full bg-[#212955] hover:bg-[#191f42] text-white py-3.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">search</span>
          <span>BUSCAR VEHÍCULOS ({filteredVehicles.length})</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-gutter py-6 space-y-6">
      {/* Hero Banner with Finance Widget */}
      <div className="bg-primary text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-primary-container relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-3">
            <span className="bg-secondary-container text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Stock 2025 &amp; Flota Certificada Nor Celis
            </span>
            <h1 className="font-headline font-extrabold text-2xl sm:text-4xl text-white leading-tight">
              Catálogo de Vehículos Nuevos &amp; Seminuevos
            </h1>
            <p className="text-xs sm:text-sm text-surface-container-highest/80 leading-relaxed max-w-xl">
              Filtra entre unidades 0 km y seminuevos certificados por <strong className="text-white">precio, kilometraje, año y motorización</strong>. Asesoría y entrega rápida garantizada.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs text-surface-container-highest/70">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">task_alt</span>
                150 Puntos de Inspección
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">task_alt</span>
                Tasa Preferencial desde 9.99%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">task_alt</span>
                Plan Retoma de tu vehículo
              </span>
            </div>
          </div>

          {/* Floating Live Quick Finance Calculator */}
          <div className="lg:col-span-5 bg-surface-container-lowest text-on-surface rounded-2xl p-5 shadow-2xl border border-surface-container space-y-3">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-secondary-container">calculate</span>
                Simulador de Crédito Vehicular
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Pre-Aprobación 15m
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Vehículo de Referencia:</span>
                  <span className="text-primary font-bold">Toyota RAV4 Hybrid 2025</span>
                </div>
                <div className="text-xs text-outline font-mono">
                  Precio de Lista: S/ {calcCarPrice.toLocaleString()} (~$32,490 USD)
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Cuota Inicial ({downPaymentPercent}%):</span>
                  <span className="font-mono text-primary font-bold">S/ {downPaymentAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-secondary-container cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Plazo de Financiamiento:</span>
                  <span className="font-bold text-primary">{loanMonths} Meses</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                  {[24, 36, 48, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => setLoanMonths(m)}
                      className={`py-1.5 rounded-lg border text-center transition-all ${
                        loanMonths === m
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-surface-container-low border-surface-container text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Box */}
              <div className="bg-surface-container-low p-3 rounded-xl border border-surface-container flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-outline">Cuota Mensual Estimada</div>
                  <div className="font-headline font-extrabold text-xl text-secondary">
                    S/ {calculatedMonthlySoles.toLocaleString()}/mes
                  </div>
                </div>
                <button
                  onClick={() => showToast('Iniciando pre-evaluación crediticia con DNI...')}
                  className="bg-secondary-container hover:bg-secondary text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1"
                >
                  <span>Solicitar</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda Rápida y Condición */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Input de búsqueda por texto */}
          <div className="relative flex-1 max-w-xl">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por modelo, marca o motor (ej. RAV4, Diésel, Hybrid, Pro-4X)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-surface-container rounded-2xl text-xs font-medium focus:outline-none focus:border-primary shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary text-xs"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>

          {/* Botón de Filtros para Móviles & Segmented Condition Controller */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Filtros Avanzados</span>
              {activeFiltersCount > 0 && (
                <span className="bg-secondary-container text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Segmented Condition Controller (Nuevos / Seminuevos) */}
            <div className="flex bg-surface-container-low p-1 rounded-2xl border border-surface-container text-xs font-bold overflow-x-auto scrollbar-none">
              <button
                onClick={() => setConditionFilter('all')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap text-center cursor-pointer ${
                  conditionFilter === 'all'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                Todos ({vehicles.length})
              </button>
              <button
                onClick={() => setConditionFilter('nuevo')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap text-center cursor-pointer ${
                  conditionFilter === 'nuevo'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                Nuevos 0 km ({vehicles.filter((v) => v.condition === 'nuevo').length})
              </button>
              <button
                onClick={() => setConditionFilter('seminuevo')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap text-center cursor-pointer ${
                  conditionFilter === 'seminuevo'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                Seminuevos ({vehicles.filter((v) => v.condition === 'seminuevo').length})
              </button>
            </div>
          </div>
        </div>

        {/* Chips de Carrocería */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container pb-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-outline font-semibold whitespace-nowrap">Carrocería:</span>
            {['all', 'SUV', 'Sedán', 'Pick-Up'].map((b) => (
              <button
                key={b}
                onClick={() => setBodyTypeFilter(b)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  bodyTypeFilter === b
                    ? 'bg-primary text-white font-bold shadow-xs'
                    : 'bg-surface-container-low border border-surface-container text-outline hover:text-on-surface'
                }`}
              >
                {b === 'all' ? 'Todas' : b}
              </button>
            ))}
          </div>

          {/* Resumen de filtros activos */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-outline font-medium">
                {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro activo' : 'filtros activos'}
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-secondary-container hover:text-secondary font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BARRA DE FILTROS ACTIVOS (CHIPS REMOVIBLES) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-surface-container-low p-3 rounded-2xl border border-surface-container text-xs">
          <span className="text-[11px] font-bold text-outline uppercase tracking-wider">Filtros aplicados:</span>

          {/* Chip de Búsqueda */}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1 rounded-full border border-surface-container font-semibold text-primary">
              <span>Búsqueda: &ldquo;{searchQuery}&rdquo;</span>
              <button onClick={() => setSearchQuery('')} className="text-outline hover:text-primary">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}

          {/* Chip de Condición */}
          {conditionFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1 rounded-full border border-surface-container font-semibold text-primary">
              <span>Condición: {conditionFilter === 'nuevo' ? '0 km Nuevo' : 'Seminuevo'}</span>
              <button onClick={() => setConditionFilter('all')} className="text-outline hover:text-primary">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}

          {/* Chip de Rango de Precio */}
          {(minPrice > MIN_POSSIBLE_PRICE || maxPrice < MAX_POSSIBLE_PRICE) && (
            <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1 rounded-full border border-surface-container font-semibold text-primary">
              <span>Precio: S/ {minPrice.toLocaleString()} - S/ {maxPrice.toLocaleString()}</span>
              <button
                onClick={() => {
                  setMinPrice(MIN_POSSIBLE_PRICE);
                  setMaxPrice(MAX_POSSIBLE_PRICE);
                }}
                className="text-outline hover:text-primary"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}

          {/* Chip de Kilometraje */}
          {onlyZeroKm ? (
            <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1 rounded-full border border-surface-container font-semibold text-primary">
              <span>Kilometraje: Solo 0 km</span>
              <button onClick={() => setOnlyZeroKm(false)} className="text-outline hover:text-primary">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          ) : (
            maxMileage < MAX_POSSIBLE_MILEAGE && (
              <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1 rounded-full border border-surface-container font-semibold text-primary">
                <span>Km: Hasta {maxMileage.toLocaleString()} km</span>
                <button
                  onClick={() => setMaxMileage(MAX_POSSIBLE_MILEAGE)}
                  className="text-outline hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            )
          )}

          {/* Chip de Años */}
          {(minYear > MIN_POSSIBLE_YEAR || maxYear < MAX_POSSIBLE_YEAR) && (
            <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1 rounded-full border border-surface-container font-semibold text-primary">
              <span>
                Año: {minYear === maxYear ? minYear : `${minYear} - ${maxYear}`}
              </span>
              <button
                onClick={() => {
                  setMinYear(MIN_POSSIBLE_YEAR);
                  setMaxYear(MAX_POSSIBLE_YEAR);
                }}
                className="text-outline hover:text-primary"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}

          {/* Chips de Combustible */}
          {selectedFuels.map((fuel) => (
            <span
              key={fuel}
              className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1 rounded-full border border-surface-container font-semibold text-primary"
            >
              <span>Motor: {fuel}</span>
              <button onClick={() => handleToggleFuel(fuel)} className="text-outline hover:text-primary">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          ))}

          {/* Chip de Marca */}
          {brandFilter !== 'all' && (
            <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1 rounded-full border border-surface-container font-semibold text-primary">
              <span>Marca: {brandFilter}</span>
              <button onClick={() => setBrandFilter('all')} className="text-outline hover:text-primary">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-[11px] text-secondary hover:underline font-bold ml-auto"
          >
            Quitar todos
          </button>
        </div>
      )}

      {/* Main Grid: Faceted Sidebar + Vehicle Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Filters para Pantallas Medianas / Grandes */}
        <aside className="filter-panel-container hidden lg:block lg:col-span-3 space-y-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin pr-1 pb-6">
          <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h3 className="font-headline font-bold text-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
                <span>Filtros Avanzados</span>
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-secondary hover:underline font-semibold"
                >
                  Restablecer ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Controles de Filtros */}
            {renderFilterControls()}
          </div>

          {/* Plan Retoma Banner */}
          <div className="bg-surface-container-low p-5 rounded-3xl border border-surface-container space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
              Plan Retoma Nor Celis
            </span>
            <h4 className="font-headline font-bold text-sm text-primary">
              ¿Dejas tu auto en parte de pago?
            </h4>
            <p className="text-xs text-outline leading-relaxed">
              Tasamos tu vehículo de cualquier marca con precio de mercado y lo abonamos como cuota inicial de tu 0 km.
            </p>
            <button
              onClick={() => showToast('Formulario express de tasación por WhatsApp abierto')}
              className="w-full mt-2 bg-white hover:bg-surface-container text-primary border border-surface-container py-2 rounded-xl text-xs font-bold transition-all"
            >
              Tasar Mi Auto Ahora
            </button>
          </div>
        </aside>

        {/* Modal / Drawer para Filtros en Móviles */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end lg:hidden animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest w-full max-w-md h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-surface-container pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">tune</span>
                    <h3 className="font-headline font-extrabold text-base text-primary">
                      Filtros Avanzados ({activeFiltersCount})
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-1 rounded-lg text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {renderFilterControls()}
              </div>

              <div className="sticky bottom-0 bg-surface-container-lowest pt-4 border-t border-surface-container flex gap-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-3 rounded-xl border border-surface-container font-bold text-xs text-outline hover:text-on-surface"
                >
                  Restablecer
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs shadow-md"
                >
                  Ver {filteredVehicles.length} Resultados
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Grid */}
        <main className="lg:col-span-9 space-y-4">
          {/* Header de Resultados & Ordenamiento */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest px-5 py-3.5 rounded-2xl border border-surface-container">
            <div className="text-xs text-outline font-medium flex items-center gap-2">
              <span>
                Mostrando <strong className="text-on-surface font-bold">{filteredVehicles.length}</strong> de{' '}
                {vehicles.length} vehículos
              </span>
              {activeFiltersCount > 0 && (
                <span className="bg-secondary-container/10 text-secondary-container px-2 py-0.5 rounded-md font-bold text-[10px]">
                  Filtros activos
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-outline whitespace-nowrap">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-surface-container-low border border-surface-container rounded-xl px-3 py-1.5 text-xs font-semibold text-primary focus:outline-none cursor-pointer"
              >
                <option value="featured">Destacados con Bono</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="mileage-asc">Kilometraje: Menor a Mayor</option>
                <option value="year-desc">Año: Más Reciente</option>
              </select>
            </div>
          </div>

          {/* Empty State si no hay resultados con los filtros */}
          {filteredVehicles.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl border border-surface-container p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 bg-surface-container-low text-outline rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">directions_car</span>
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="font-headline font-bold text-lg text-primary">
                  No encontramos vehículos con estos filtros
                </h4>
                <p className="text-xs text-outline">
                  Prueba ampliando el rango de precio, el kilometraje máximo o seleccionando más tipos de combustible y años.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleResetFilters}
                  className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVehicles.map((car) => {
                const inWish = isInWishlist(car.id);
                const carMileage = getCarMileage(car);

                // Configuración visual por tipo de combustible
                const fuelBadgeConfig = {
                  'Híbrido': {
                    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    icon: 'bolt',
                  },
                  '100% Eléctrico': {
                    bg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
                    icon: 'electric_car',
                  },
                  'Gasolina': {
                    bg: 'bg-amber-50 text-amber-800 border-amber-200',
                    icon: 'local_gas_station',
                  },
                  'Diésel': {
                    bg: 'bg-slate-100 text-slate-800 border-slate-300',
                    icon: 'oil_barrel',
                  },
                }[car.fuelType] || {
                  bg: 'bg-surface-container text-on-surface border-surface-container-high',
                  icon: 'local_gas_station',
                };

                return (
                  <div
                    key={car.id}
                    className="bg-surface-container-lowest rounded-3xl border border-surface-container hover:border-primary/40 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Photo area */}
                    <div
                      className="relative aspect-[16/10] bg-surface-container-low overflow-hidden cursor-pointer"
                      onClick={() => {
                        setSelectedVehicleId(car.id);
                        setCurrentView('vehicle-pdp');
                      }}
                    >
                      <SafeImage
                        src={car.image}
                        fallbackSrc={FALLBACK_IMAGES.vehicleSuv}
                        typeHint="vehicle"
                        alt={car.name}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 hover:scale-110"
                      />

                      {/* Badges superiores */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1 ${
                            car.condition === 'nuevo'
                              ? 'bg-primary text-white'
                              : 'bg-emerald-700 text-white'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[13px]">
                            {car.condition === 'nuevo' ? 'stars' : 'verified'}
                          </span>
                          {car.condition === 'nuevo' ? '0 KM 2025' : '150 PUNTOS CERT.'}
                        </span>

                        {car.discountBonus && (
                          <span className="bg-secondary-container text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                            {car.discountBonus}
                          </span>
                        )}
                      </div>

                      {/* Botón Favoritos */}
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
                            categoryBadge:
                              car.condition === 'nuevo' ? 'Vehículo Nuevo 2025' : 'Seminuevo Certificado',
                          })
                        }
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-xs ${
                          inWish
                            ? 'bg-secondary-container text-white'
                            : 'bg-white/80 hover:bg-white text-on-surface'
                        }`}
                        title={inWish ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {inWish ? 'favorite' : 'favorite_border'}
                        </span>
                      </button>

                      {/* Barra inferior sobre la imagen con Año, Kilometraje y Botón Zoom HD */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-amber-400">calendar_month</span>
                            Año {car.year}
                          </span>
                          <span className="bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-emerald-400">speed</span>
                            {car.condition === 'nuevo' ? '0 km' : `${carMileage.toLocaleString()} km`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomModalVehicle(car);
                          }}
                          className="bg-white/90 hover:bg-primary hover:text-white text-on-surface text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm border border-white/40 flex items-center gap-1 transition-all opacity-90 group-hover:opacity-100 cursor-pointer"
                          title="Inspeccionar con Zoom Focal HD"
                        >
                          <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                          <span>Zoom HD</span>
                        </button>
                      </div>
                    </div>

                    {/* Body Specs */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Etiquetas de combustible y marca */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                          <span className="bg-surface-container px-2 py-0.5 rounded-md text-on-surface uppercase">
                            {car.brand}
                          </span>
                          {car.brandType === 'alternativa' ? (
                            <span className="bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                              <span className="material-symbols-outlined text-[12px] text-amber-600">stars</span>
                              <span>Marca Alternativa China • Garantía 5 Años</span>
                            </span>
                          ) : (
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                              OEM Oficial
                            </span>
                          )}
                          <span className="bg-surface-container px-2 py-0.5 rounded-md text-on-surface">
                            {car.bodyType}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${fuelBadgeConfig.bg}`}
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              {fuelBadgeConfig.icon}
                            </span>
                            <span>{car.fuelType}</span>
                          </span>
                        </div>

                        <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors mt-2">
                          {car.name}
                        </h3>

                        <p className="text-xs text-outline line-clamp-1 mt-0.5">
                          {car.subtitle}
                        </p>

                        {/* Technical specifications rápidas */}
                        <div className="grid grid-cols-3 gap-2 mt-3 text-[11px] text-on-surface-variant font-medium">
                          <div className="bg-surface-container p-2 rounded-xl text-center">
                            <span className="text-[10px] text-outline block">Motor</span>
                            <span className="font-bold truncate block">{car.specs.engine}</span>
                          </div>
                          <div className="bg-surface-container p-2 rounded-xl text-center">
                            <span className="text-[10px] text-outline block">Caja</span>
                            <span className="font-bold truncate block">{car.specs.transmission}</span>
                          </div>
                          <div className="bg-surface-container p-2 rounded-xl text-center">
                            <span className="text-[10px] text-outline block">Tracción</span>
                            <span className="font-bold truncate block">{car.specs.traction}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price and Action Buttons */}
                      <div className="border-t border-surface-container pt-3 space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div>
                            {car.oldPriceSoles && (
                              <span className="text-xs text-outline line-through mr-1 font-mono">
                                S/ {car.oldPriceSoles.toLocaleString()}
                              </span>
                            )}
                            <div className="font-headline font-extrabold text-xl text-primary">
                              S/ {car.priceSoles.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-mono text-outline">
                              ~${car.priceUsd.toLocaleString()} USD
                            </div>
                            <div className="text-xs font-bold text-secondary">
                              Cuotas S/ {car.monthlySoles}/mes
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setSelectedVehicleId(car.id);
                              setCurrentView('vehicle-pdp');
                            }}
                            className="bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer text-center"
                          >
                            Ficha Técnica &amp; Cuotas
                          </button>
                          <button
                            onClick={() => {
                              setSelectedVehicleId(car.id);
                              setIsViewer360Open(true);
                            }}
                            className="bg-surface-container hover:bg-surface-container-high text-primary py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">360</span>
                            <span>Visor 360°</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-surface-container-low text-outline">
                          <span className="flex items-center gap-1 truncate max-w-[170px]" title={car.warranty}>
                            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                            {car.warranty}
                          </span>
                          <a
                            href={`https://wa.me/51987654321?text=Hola,%20quisiera%20cotizar%20el%20vehiculo%20${encodeURIComponent(car.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-600 font-bold flex items-center gap-1 shrink-0"
                          >
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            Cotizar WhatsApp
                          </a>
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
      {/* Quick Focal Zoom Modal for Vehicles */}
      {zoomModalVehicle && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-surface-container flex flex-col max-h-[92vh]">
            <div className="p-4 md:p-5 flex items-center justify-between border-b border-surface-container bg-surface-container-low">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-600 text-lg">zoom_in</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    {zoomModalVehicle.brand} • {zoomModalVehicle.condition === 'nuevo' ? '0 KM 2025' : 'Seminuevo'}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-bold text-primary truncate max-w-lg">
                  {zoomModalVehicle.name}
                </h3>
              </div>
              <button
                onClick={() => setZoomModalVehicle(null)}
                className="w-9 h-9 rounded-full bg-white hover:bg-surface-container text-outline flex items-center justify-center shadow-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <FocalZoomImage
                src={zoomModalVehicle.image}
                alt={zoomModalVehicle.name}
                typeHint="vehicle"
                aspectRatioClass="h-72 sm:h-96 w-full"
                badge={zoomModalVehicle.condition === 'nuevo' ? '0 KM 2025' : 'Seminuevo Certificado'}
                discountBadge={zoomModalVehicle.discountBonus}
                subBadge={zoomModalVehicle.brandType === 'alternativa' ? 'Marca Alternativa Garantizada' : undefined}
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-surface-container">
                <div>
                  <div className="text-xs text-outline font-medium">{zoomModalVehicle.subtitle}</div>
                  <div className="text-xl font-black text-primary font-mono">
                    S/ {zoomModalVehicle.priceSoles.toLocaleString()}{' '}
                    <span className="text-xs text-outline font-normal">(${zoomModalVehicle.priceUsd.toLocaleString()} USD)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const id = zoomModalVehicle.id;
                      setZoomModalVehicle(null);
                      setSelectedVehicleId(id);
                      setIsViewer360Open(true);
                    }}
                    className="flex-1 sm:flex-none bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer min-h-[44px] flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-base">360</span>
                    <span>Visor 360°</span>
                  </button>
                  <button
                    onClick={() => {
                      const id = zoomModalVehicle.id;
                      setZoomModalVehicle(null);
                      setSelectedVehicleId(id);
                      setCurrentView('vehicle-pdp');
                    }}
                    className="flex-1 sm:flex-none bg-primary hover:bg-primary-container text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs cursor-pointer min-h-[44px]"
                  >
                    Ver Ficha Completa
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
