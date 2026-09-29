import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AutoPart, Vehicle, WorkshopService } from '../types';
import { NorCelisLogo } from './NorCelisLogo';
import { MegaMenuModal } from './MegaMenuModal';
import { SafeImage } from './SafeImage';
import { PARTS_CATALOG_DATA, VEHICLES_DATA, WORKSHOP_SERVICES_DATA } from '../data/mockData';
import { SITE_CONFIG } from '../config/siteConfig';
import {
  AutoPartsIcon,
  VehicleIcon,
  WorkshopServiceIcon,
  PlanRetomaIcon,
  Showroom360Icon,
  MasterCatalogIcon,
  GarageLiftIcon,
  DealershipPinIcon,
  AppleSearchIcon,
  AppleHeartIcon,
  AppleCartIcon,
  AppleMenuIcon,
  AppleCloseIcon,
  AppleChevronDownIcon,
  AppleIconBadge,
  BankFinancingIcon,
  AppleChevronRightIcon,
  AppleUserIcon,
  OfficialQuoteIcon,
} from './AutoIcons';

type NavDropdownType = 'none' | 'vehiculos' | 'repuestos' | 'finanzas' | 'taller';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeGarage,
    setIsGarageModalOpen,
    cartTotalCount,
    wishlistTotalCount,
    user,
    showToast,
    setIsViewer360Open,
    setIsTestDriveModalOpen,
    navigateToPartsCatalog,
    setSelectedVehicleId,
    setSelectedPartSku,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<NavDropdownType>('none');
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (type: NavDropdownType) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(type);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown('none');
    }, 200);
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Compute live search suggestions
  const liveSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { parts: [], vehicles: [], services: [], brands: [] };

    const parts = PARTS_CATALOG_DATA.filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchOem = (p.oemCode || '').toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      const matchCompat = (p.compatibleVehicle || '').toLowerCase().includes(q);
      return matchName || matchBrand || matchSku || matchOem || matchCat || matchCompat;
    }).slice(0, 4);

    const vehicles = VEHICLES_DATA.filter((v) => {
      const matchName = v.name.toLowerCase().includes(q);
      const matchBrand = v.brand.toLowerCase().includes(q);
      const matchSubtitle = (v.subtitle || '').toLowerCase().includes(q);
      const matchBody = v.bodyType.toLowerCase().includes(q);
      const matchFuel = v.fuelType.toLowerCase().includes(q);
      return matchName || matchBrand || matchSubtitle || matchBody || matchFuel;
    }).slice(0, 3);

    const services = WORKSHOP_SERVICES_DATA.filter((s) => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchCat = s.category.toLowerCase().includes(q);
      const matchDesc = s.description.toLowerCase().includes(q);
      return matchName || matchCat || matchDesc;
    }).slice(0, 2);

    const allBrands = [
      'Toyota', 'Nissan', 'Hyundai', 'Kia', 'Ford', 'Mobil', '3M', 'K&N',
      'Brembo', 'Bosch', 'Denso', 'LLumar', 'KEKO', 'Mickey Thompson', 'Castrol', 'Motul'
    ];
    const brands = allBrands.filter((b) => b.toLowerCase().includes(q)).slice(0, 4);

    return { parts, vehicles, services, brands };
  }, [searchQuery]);

  const hasSuggestions =
    liveSuggestions.parts.length > 0 ||
    liveSuggestions.vehicles.length > 0 ||
    liveSuggestions.services.length > 0 ||
    liveSuggestions.brands.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      showToast('Ingresa un término de búsqueda');
      return;
    }
    setIsMobileNavOpen(false);
    setIsMegaMenuOpen(false);
    setIsSearchDropdownOpen(false);

    const q = query.toLowerCase();

    // Specific vehicle filter keywords (exact vehicle purchasing intent)
    const isVehicleSpecific =
      q === 'auto nuevo' ||
      q === 'autos nuevos' ||
      q === 'auto seminuevo' ||
      q === 'autos seminuevos' ||
      q === 'seminuevos' ||
      q === 'seminuevo' ||
      q === '0km' ||
      q === 'autos 0km' ||
      q === 'vehiculos' ||
      q === 'vehículos' ||
      q === 'comprar auto' ||
      q === 'catalogo de autos' ||
      q === 'catálogo de autos';

    // Specific service filter keywords (exact workshop appointment intent)
    const isServiceSpecific =
      q === 'taller' ||
      q === 'cita taller' ||
      q === 'cita de taller' ||
      q === 'taller mecanico' ||
      q === 'taller mecánico' ||
      q === 'servicios de taller';

    if (isServiceSpecific) {
      setCurrentView('services');
      showToast(`Mostrando servicios de taller para "${query}"`);
    } else if (isVehicleSpecific) {
      setCurrentView('cars');
      showToast(`Mostrando catálogo de vehículos para "${query}"`);
    } else {
      // Primary e-commerce catalog: Navigate to parts catalog with exact search query
      navigateToPartsCatalog('todos', 'todos', query);
      showToast(`Filtrando repuestos y accesorios para "${query}"...`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-surface-container shadow-sm">
      {/* Main Bar */}
      <div className="px-3 sm:px-5 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Brand - Desplazado ligeramente hacia la izquierda para mayor presencia institucional */}
          <div className="flex items-center gap-2 sm:gap-3 -ml-1 sm:-ml-2.5 shrink-0">
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl hover:bg-surface-container text-[#212955] hover:text-[#F07F00] transition-colors cursor-pointer"
              aria-label="Abrir mega menú de navegación"
            >
              {isMegaMenuOpen ? <AppleCloseIcon size={26} /> : <AppleMenuIcon size={26} />}
            </button>

            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center text-left focus:outline-none group cursor-pointer py-1 min-h-[46px]"
              title="Nor Celis Automotriz - Inicio"
            >
              <NorCelisLogo
                variant="full"
                theme="light"
                size="custom"
                className="h-10 sm:h-12 md:h-13 w-auto group-hover:scale-[1.02] transition-transform drop-shadow-xs"
              />
            </button>
          </div>

          {/* Botón Menú Estilo Falabella con colores corporativos */}
          <div className="relative hidden lg:block shrink-0">
            <button
              onClick={() => setIsMegaMenuOpen((prev) => !prev)}
              className={`flex items-center gap-3 font-bold text-sm px-4.5 py-2.5 min-h-[48px] rounded-xl shadow-xs transition-all cursor-pointer ring-1 group ${
                isMegaMenuOpen
                  ? 'bg-[#212955] text-white ring-2 ring-[#F07F00]'
                  : 'bg-[#212955] hover:bg-[#181e40] text-white ring-[#212955]/30'
              }`}
              title="Abrir Menú de Departamentos y Repuestos (Estilo Falabella)"
              aria-expanded={isMegaMenuOpen}
            >
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                {isMegaMenuOpen ? (
                  <AppleCloseIcon size={20} className="text-[#F07F00]" />
                ) : (
                  <MasterCatalogIcon size={20} className="text-[#F07F00]" />
                )}
              </div>
              <span className={isMegaMenuOpen ? 'text-[#F07F00] font-headline text-lg tracking-wider' : 'text-white font-headline text-lg tracking-wider'}>
                {isMegaMenuOpen ? '✕ Menú' : 'Menú'}
              </span>
            </button>
          </div>

          {/* Search bar con UNA SOLA lupa grande estilo Apple y sugerencias en tiempo real */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-xl lg:max-w-2xl hidden md:block">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-surface-container-low rounded-xl border border-surface-container focus-within:border-[#212955] focus-within:ring-2 focus-within:ring-[#212955]/15 transition-all overflow-hidden min-h-[46px]"
            >
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                placeholder="Buscar por Repuesto, Marca Oficial (M/T, KEKO, Mobil, 3M, LLumar, Toyota)..."
                className="flex-1 pl-4 pr-3 py-2.5 min-h-[46px] text-sm bg-transparent focus:outline-none placeholder:text-[#9D9D9C] text-on-surface font-body"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchDropdownOpen(false);
                  }}
                  className="p-2 text-[#9D9D9C] hover:text-on-surface cursor-pointer transition-colors"
                  title="Limpiar búsqueda"
                >
                  <AppleCloseIcon size={18} />
                </button>
              )}
              <button
                type="submit"
                className="min-w-[48px] min-h-[48px] flex items-center justify-center p-2.5 pr-4 text-[#212955] hover:text-[#F07F00] transition-colors cursor-pointer group"
                title="Buscar"
                aria-label="Buscar"
              >
                <AppleSearchIcon size={28} className="group-hover:scale-105" />
              </button>
            </form>

            {/* Live Autocomplete Overlay */}
            {isSearchDropdownOpen && searchQuery.trim().length >= 1 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-surface-container z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] overflow-y-auto">
                {hasSuggestions ? (
                  <div className="divide-y divide-gray-100">
                    {/* 1. Autopartes y Repuestos */}
                    {liveSuggestions.parts.length > 0 && (
                      <div className="p-3">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9D9D9C] mb-2 px-1 flex items-center justify-between">
                          <span>Repuestos &amp; Accesorios OEM</span>
                          <span className="text-primary font-bold">{liveSuggestions.parts.length} coincidencias</span>
                        </div>
                        <div className="space-y-1">
                          {liveSuggestions.parts.map((p) => (
                            <div
                              key={p.sku}
                              onClick={() => {
                                setSelectedPartSku(p.sku);
                                setCurrentView('part-pdp');
                                setSearchQuery('');
                                setIsSearchDropdownOpen(false);
                              }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-100 p-1 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                                <SafeImage src={p.image} alt={p.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-[#212955] group-hover:text-[#F07F00] transition-colors truncate">
                                  {p.name}
                                </div>
                                <div className="text-[11px] text-[#9D9D9C] flex items-center gap-1.5 truncate">
                                  <span className="font-semibold text-gray-700">{p.brand}</span>
                                  <span>•</span>
                                  <span className="font-mono">SKU: {p.sku}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-bold text-primary">S/ {p.priceSoles.toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Vehículos en catálogo */}
                    {liveSuggestions.vehicles.length > 0 && (
                      <div className="p-3 bg-gray-50/60">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9D9D9C] mb-2 px-1">
                          Vehículos
                        </div>
                        <div className="space-y-1">
                          {liveSuggestions.vehicles.map((v) => (
                            <div
                              key={v.id}
                              onClick={() => {
                                setSelectedVehicleId(v.id);
                                setCurrentView('vehicle-pdp');
                                setSearchQuery('');
                                setIsSearchDropdownOpen(false);
                              }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors cursor-pointer group border border-transparent hover:border-gray-200"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                                <SafeImage src={v.image} alt={v.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-[#212955] group-hover:text-[#F07F00] transition-colors truncate">
                                  {v.name}
                                </div>
                                <div className="text-[11px] text-gray-500 truncate">
                                  {v.brand} • {v.year} • {v.fuelType}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-bold text-primary">S/ {v.priceSoles.toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. Servicios de Taller */}
                    {liveSuggestions.services.length > 0 && (
                      <div className="p-3">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9D9D9C] mb-2 px-1">
                          Servicios de Taller
                        </div>
                        <div className="space-y-1">
                          {liveSuggestions.services.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setCurrentView('services');
                                setSearchQuery('');
                                setIsSearchDropdownOpen(false);
                              }}
                              className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="material-symbols-outlined text-base text-[#F07F00]">build</span>
                                <span className="text-xs font-bold text-[#212955] group-hover:text-[#F07F00] transition-colors truncate">
                                  {s.name}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-primary">S/ {s.priceStartingSoles.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Marcas sugeridas */}
                    {liveSuggestions.brands.length > 0 && (
                      <div className="p-3 bg-gray-50/40">
                        <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9D9D9C] mb-2 px-1">
                          Marcas Oficiales
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {liveSuggestions.brands.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => {
                                navigateToPartsCatalog('todos', b, '');
                                setSearchQuery('');
                                setIsSearchDropdownOpen(false);
                              }}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[#212955] hover:border-[#F07F00] hover:text-[#F07F00] transition-colors cursor-pointer"
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer: Ver todos */}
                    <div className="p-2.5 bg-primary/5 hover:bg-primary/10 transition-colors">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="w-full py-1 text-center text-xs font-bold text-primary hover:text-secondary flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Ver todos los resultados para &quot;{searchQuery}&quot;</span>
                        <AppleChevronRightIcon size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <span className="material-symbols-outlined text-3xl text-gray-400">search_off</span>
                    <p className="text-xs font-semibold text-gray-700">No encontramos coincidencias directas para &quot;{searchQuery}&quot;</p>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="text-xs font-bold text-[#F07F00] hover:underline cursor-pointer"
                    >
                      Buscar de todas formas en el catálogo completo →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Active Garage Selector */}
            <button
              onClick={() => setIsGarageModalOpen(true)}
              className="flex items-center gap-2.5 px-3 py-2 min-h-[48px] rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-left transition-all group cursor-pointer"
              title={activeGarage ? `Mi Garaje: ${activeGarage.brand} ${activeGarage.model}` : "Agregar auto a Mi Garaje"}
              aria-label={activeGarage ? `Mi Garaje: ${activeGarage.brand} ${activeGarage.model}` : "Agregar auto"}
            >
              <AppleIconBadge variant={activeGarage ? "secondary" : "subtle-orange"} size="md">
                <GarageLiftIcon size={22} className={activeGarage ? "text-[#F07F00]" : "text-[#F07F00]"} />
              </AppleIconBadge>
              <div className="hidden xl:block">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9D9D9C] flex items-center gap-1.5 font-body">
                  <span>Mi Garaje</span>
                </div>
                <div className="text-xs font-bold text-[#212955] max-w-[125px] truncate font-body">
                  {activeGarage ? activeGarage.model : 'Agregar auto'}
                </div>
              </div>
            </button>

            {/* Wishlist Link - Apple SF Heart */}
            <button
              onClick={() => setCurrentView('wishlist')}
              className={`relative min-w-[48px] min-h-[48px] flex items-center justify-center p-2 rounded-xl hover:bg-surface-container transition-all cursor-pointer group ${
                currentView === 'wishlist' ? 'bg-surface-container text-[#F07F00]' : 'text-[#212955] hover:text-[#F07F00]'
              }`}
              title="Ver Lista de Deseos"
              aria-label="Ver Lista de Deseos"
            >
              <AppleHeartIcon size={32} className="transition-transform group-hover:scale-110" />
              {wishlistTotalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#F07F00] text-white text-[11px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md font-headline ring-2 ring-white">
                  {wishlistTotalCount}
                </span>
              )}
            </button>

            {/* Cart Link - Apple SF Cart */}
            <button
              onClick={() => setCurrentView('cart')}
              className={`relative min-w-[48px] min-h-[48px] flex items-center justify-center p-2 rounded-xl hover:bg-surface-container transition-all cursor-pointer group ${
                currentView === 'cart' ? 'bg-surface-container text-[#F07F00]' : 'text-[#212955] hover:text-[#F07F00]'
              }`}
              title="Ver Carrito de Compras"
              aria-label="Ver Carrito de Compras"
            >
              <AppleCartIcon size={32} className="transition-transform group-hover:scale-110" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#F07F00] text-white text-[11px] font-black min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center shadow-md font-headline ring-2 ring-white">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            <button
              onClick={() => setCurrentView(user.isLoggedIn ? 'account' : 'login')}
              className={`flex items-center gap-2.5 min-h-[48px] p-1.5 pl-2 pr-3 rounded-xl transition-colors text-left cursor-pointer ${
                currentView === 'account' || currentView === 'login'
                  ? 'bg-[#212955]/10 ring-2 ring-[#212955]'
                  : 'hover:bg-surface-container'
              }`}
              title={user.isLoggedIn ? 'Mi Cuenta & Dashboard' : 'Iniciar Sesión / Registro'}
              aria-label="Mi Cuenta y Garaje"
            >
              {user.isLoggedIn ? (
                <>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-surface-container shrink-0 shadow-xs font-headline tracking-wider ${
                    user.role === 'admin'
                      ? 'bg-gradient-to-br from-[#F07F00] to-[#212955] text-white ring-[#F07F00]/50'
                      : 'bg-[#212955] text-white'
                  }`}>
                    {user.name
                      ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                      : 'NC'}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-[10px] text-[#9D9D9C] font-normal font-body flex items-center gap-1">
                      <span>Mi Cuenta</span>
                      {user.role === 'admin' && (
                        <span className="bg-[#F07F00] text-white text-[8px] font-black px-1 rounded uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#212955] font-body max-w-[110px] truncate">
                      Hola, {user.name.split(' ')[0] || 'Usuario'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-surface-container-high text-[#212955] flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-[10px] text-[#9D9D9C] font-normal font-body">Bienvenido</div>
                    <div className="text-xs font-bold text-[#F07F00] font-body">
                      Iniciar Sesión
                    </div>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subnav Desktop with Interactive Hover Mega Dropdowns */}
      <div
        className="border-t border-surface-container bg-surface-container-lowest relative px-4 sm:px-6 lg:px-8 hidden md:block"
        onMouseLeave={handleMouseLeave}
      >
        <nav aria-label="Categorías principales" className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 py-2 text-xs font-semibold">
          {/* Autopartes y Accesorios Nav Item */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('repuestos')}
          >
            <button
              onClick={() => navigateToPartsCatalog('todos')}
              className={`px-3.5 py-2 min-h-[42px] rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
                currentView === 'parts' || currentView === 'part-pdp' || activeDropdown === 'repuestos'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <AutoPartsIcon size={20} className="text-[#F07F00]" />
              <span className="font-headline text-base tracking-wide">Autopartes y Accesorios</span>
              <AppleChevronDownIcon size={14} className="text-[#9D9D9C] transition-transform duration-200" />
            </button>
          </div>

          {/* Servicios Nav Item */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('taller')}
          >
            <button
              onClick={() => setCurrentView('services')}
              className={`px-3.5 py-2 min-h-[42px] rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
                currentView === 'services' || activeDropdown === 'taller'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <WorkshopServiceIcon size={20} className="text-[#212955]" />
              <span className="font-headline text-base tracking-wide">Servicios de Taller</span>
              <AppleChevronDownIcon size={14} className="text-[#9D9D9C] transition-transform duration-200" />
            </button>
          </div>

          {/* Vehículos Nav Item */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('vehiculos')}
          >
            <button
              onClick={() => setCurrentView('cars')}
              className={`px-3.5 py-2 min-h-[42px] rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
                currentView === 'cars' || currentView === 'vehicle-pdp' || activeDropdown === 'vehiculos'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <VehicleIcon size={20} className="text-[#212955]" />
              <span className="font-headline text-base tracking-wide">Vehículos 2025</span>
              <AppleChevronDownIcon size={14} className="text-[#9D9D9C] transition-transform duration-200" />
            </button>
          </div>

          {/* Plan Retoma & Financiamiento Nav Item */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('finanzas')}
          >
            <button
              onClick={() => setCurrentView('trade-in')}
              className={`px-3.5 py-2 min-h-[42px] rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
                currentView === 'trade-in' || currentView === 'financing' || activeDropdown === 'finanzas'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <PlanRetomaIcon size={20} className="text-[#F07F00]" />
              <span className="text-[#212955] font-headline text-base tracking-wide">Plan Retoma &amp; Cuotas</span>
              <AppleChevronDownIcon size={14} className="text-[#9D9D9C] transition-transform duration-200" />
            </button>
          </div>

          {/* Showroom 360° */}
          <button
            onClick={() => setIsViewer360Open(true)}
            className="px-3.5 py-2 min-h-[42px] rounded-xl bg-secondary-container/10 text-secondary hover:bg-secondary-container hover:text-white transition-all flex items-center gap-2 font-bold cursor-pointer border border-secondary-container/30"
          >
            <Showroom360Icon size={20} className="text-[#F07F00]" />
            <span className="font-headline text-base tracking-wide">Showroom 360°</span>
          </button>

          {/* Sede Cajamarca */}
          <button
            onClick={() => setCurrentView('locations')}
            className={`px-3.5 py-2 min-h-[42px] rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
              currentView === 'locations'
                ? 'bg-primary text-white font-bold'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
            }`}
          >
            <DealershipPinIcon size={20} className="text-[#F07F00]" />
            <span className="font-headline text-base tracking-wide">Sede Cajamarca</span>
          </button>
        </nav>

        {/* Dynamic Nav Dropdowns (Mega Flyout on Desktop) */}
        {activeDropdown === 'vehiculos' && (
          <div
            className="absolute top-full left-0 w-full bg-white shadow-2xl border-b border-surface-container z-40 py-6 animate-in fade-in slide-in-from-top-2 duration-150"
            onMouseEnter={() => handleMouseEnter('vehiculos')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-gutter grid grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="text-xs font-bold text-primary border-b border-surface-container pb-1 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-secondary">verified</span>
                  Modelos 2025 0 KM
                </div>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button
                      onClick={() => { setSelectedVehicleId('veh-rav4-2025'); setCurrentView('vehicle-pdp'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Toyota RAV4 Hybrid 2025 Limited AWD
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setSelectedVehicleId('veh-frontier-2025'); setCurrentView('vehicle-pdp'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Nissan Frontier Pro-4X 2.3L Bi-Turbo
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setSelectedVehicleId('veh-hyundai-tucson-2025'); setCurrentView('vehicle-pdp'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Hyundai Tucson Limited 2025 Smartstream
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setSelectedVehicleId('veh-volvo-ex30-2024'); setCurrentView('vehicle-pdp'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Volvo EX30 Ultra 100% Eléctrico
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-primary border-b border-surface-container pb-1 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-600">shield</span>
                  Seminuevos Garantizados
                </div>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button
                      onClick={() => { setSelectedVehicleId('veh-bmw-520i-2021'); setCurrentView('vehicle-pdp'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      BMW 520i Executive 2021 (38,000 km)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setSelectedVehicleId('veh-audi-q8-2023'); setCurrentView('vehicle-pdp'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Audi Q8 e-tron 2023 Quattro Eléctrico
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setSelectedVehicleId('veh-hilux-diesel-2020'); setCurrentView('vehicle-pdp'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Toyota Hilux 2.4L D/C 4x4 SR 2020
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setCurrentView('cars'); setActiveDropdown('none'); }}
                      className="text-left font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Ver todo el stock seminuevo</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-primary border-b border-surface-container pb-1 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-secondary">touch_app</span>
                  Experiencias Digitales
                </div>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button
                      onClick={() => { setIsViewer360Open(true); setActiveDropdown('none'); }}
                      className="text-left font-medium text-secondary hover:text-secondary-container hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">360</span>
                      <span>Showroom Interactivo 360°</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setIsTestDriveModalOpen(true); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">electric_car</span>
                      <span>Solicitar Test Drive a Domicilio</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setCurrentView('financing'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">calculate</span>
                      <span>Simulador de Cuotas BCP / BBVA</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Promo Card */}
              <div className="bg-gradient-to-br from-primary to-primary-container text-white p-4 rounded-2xl shadow-md flex flex-col justify-between">
                <div>
                  <span className="bg-secondary text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    BONO S/ 7,500
                  </span>
                  <h4 className="font-headline font-bold text-base mt-2">Plan Retoma tu Auto</h4>
                  <p className="text-xs text-surface-container-highest mt-1">
                    Entrega tu auto en parte de pago y llévate tu 0 KM hoy mismo con tasación online.
                  </p>
                </div>
                <button
                  onClick={() => { setCurrentView('trade-in'); setActiveDropdown('none'); }}
                  className="mt-3 bg-white text-primary text-xs font-bold py-2 px-3 rounded-xl hover:bg-surface-container-lowest transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Tasar mi auto ahora</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeDropdown === 'repuestos' && (
          <div
            className="absolute top-full left-0 w-full bg-white shadow-2xl border-b border-surface-container z-40 py-6 animate-in fade-in slide-in-from-top-2 duration-150"
            onMouseEnter={() => handleMouseEnter('repuestos')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-gutter grid grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="text-xs font-bold text-primary border-b border-surface-container pb-1 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-amber-600">tire_repair</span>
                  Mickey Thompson &amp; Black Rhino
                </div>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('llantas', 'Mickey Thompson', 'Baja Boss'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Baja Boss A/T 265/65R17 (PowerPly XD)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('llantas', 'Mickey Thompson', 'Legend'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Baja Legend MTZ 285/70R17 Mud-Terrain
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('llantas', 'BLACK RHINO', 'Boxer'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Aros Black Rhino Boxer 17x8.0 Gunmetal
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('llantas', 'BLACK RHINO', 'Armory'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Aros Militares Armory 18x9.0 Desert Sand
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-primary border-b border-surface-container pb-1 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-red-600">shield_with_heart</span>
                  KEKO 4x4 &amp; Suspensión HD
                </div>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('accesorios4x4', 'KEKO', 'K3'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Barra Antivuelco KEKO K3 Black Hilux
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('accesorios4x4', 'KEKO', 'Roll Cover'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Tapa Retráctil Roll Cover de Aluminio
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('suspension', 'TRAKKO® AUTORUS', 'Lift'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Kit Lift +2" TRAKKO® AUTORUS HD
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('suspension', 'KYB'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Amortiguadores de Gas KYB Shocks
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-primary border-b border-surface-container pb-1 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-blue-700">oil_barrel</span>
                  Mobil, LLumar &amp; 3M Detailing
                </div>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('lubricantes', 'Mobil', 'ESP'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Aceite Mobil 1 ESP 5W-30 Galón 4L
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('seguridad', 'LLumar', 'CTX'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      LLumar CTX Nanocerámica 50 Micras Anti-Impacto
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('detailing', '3M', 'Ceramic'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      3M Ceramic Coating Kit 9H Dureza
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { navigateToPartsCatalog('todos', 'TOYOTA Genuino'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Repuestos Genuinos TOYOTA OEM
                    </button>
                  </li>
                </ul>
              </div>

              {/* Master Catalog Shortcut Card */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-secondary font-bold uppercase tracking-wider">
                    Despiece Completo
                  </div>
                  <h4 className="font-headline font-bold text-base text-primary mt-1">
                    Ver Catálogo por Marca
                  </h4>
                  <p className="text-xs text-outline mt-1">
                    Filtra por VIN de tu Garaje, número de parte o marca autorizada en Cajamarca.
                  </p>
                </div>
                <button
                  onClick={() => { navigateToPartsCatalog('todos'); setActiveDropdown('none'); }}
                  className="mt-3 bg-primary text-white text-xs font-bold py-2 px-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Abrir Catálogo de Repuestos</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeDropdown === 'finanzas' && (
          <div
            className="absolute top-full left-0 w-full bg-white shadow-2xl border-b border-surface-container z-40 py-6 animate-in fade-in slide-in-from-top-2 duration-150"
            onMouseEnter={() => handleMouseEnter('finanzas')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-gutter grid grid-cols-3 gap-6">
              {/* Plan Retoma Card */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-emerald-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      BONO S/ 7,500
                    </span>
                    <span className="material-symbols-outlined text-emerald-700 text-xl">swap_horiz</span>
                  </div>
                  <h4 className="font-headline font-bold text-base text-emerald-950">Plan Retoma Nor Celis</h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Tasamos tu vehículo usado en 15 minutos. Usalo como cuota inicial de tu nuevo 0 KM o seminuevo.
                  </p>
                </div>
                <button
                  onClick={() => { setCurrentView('trade-in'); setActiveDropdown('none'); }}
                  className="mt-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Tasar Online mi Auto Usado</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Simulador Financiamiento */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      DESDE 9.99% TEA
                    </span>
                    <span className="material-symbols-outlined text-blue-700 text-xl">account_balance</span>
                  </div>
                  <h4 className="font-headline font-bold text-base text-blue-950">Simulador de Financiamiento</h4>
                  <p className="text-xs text-blue-800 mt-1">
                    Calcula tus cuotas mensuales a 12, 24, 36, 48 o 60 meses con bancos aliados (BCP, BBVA, Santander).
                  </p>
                </div>
                <button
                  onClick={() => { setCurrentView('financing'); setActiveDropdown('none'); }}
                  className="mt-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Simular Cuotas Mensuales</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Mi Garaje Virtual */}
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-purple-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      GARANTIZADO
                    </span>
                    <span className="material-symbols-outlined text-purple-700 text-xl">garage</span>
                  </div>
                  <h4 className="font-headline font-bold text-base text-purple-950">Mi Garaje Virtual</h4>
                  <p className="text-xs text-purple-800 mt-1">
                    Registra tu auto, valida compatibilidad 100% por VIN y revisa tu historial de mantenimiento.
                  </p>
                </div>
                <button
                  onClick={() => { setIsGarageModalOpen(true); setActiveDropdown('none'); }}
                  className="mt-4 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Gestionar Mi Garaje</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeDropdown === 'taller' && (
          <div
            className="absolute top-full left-0 w-full bg-white shadow-2xl border-b border-surface-container z-40 py-6 animate-in fade-in slide-in-from-top-2 duration-150"
            onMouseEnter={() => handleMouseEnter('taller')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto px-gutter grid grid-cols-4 gap-6">
              <div className="space-y-3">
                <div className="text-xs font-bold text-primary border-b border-surface-container pb-1 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">build</span>
                  Mantenimiento &amp; Taller
                </div>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <button
                      onClick={() => { setCurrentView('services'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Mantenimiento Preventivo 5k / 10k / 20k / 40k
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setCurrentView('services'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Cambio de Aceite Sintético Mobil 1 Express
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setCurrentView('services'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Diagnóstico Electrónico con Escáner Oficial
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-primary border-b border-surface-container pb-1 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-amber-600">tire_repair</span>
                  Llantas &amp; Geometría 3D
                </div>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <button
                      onClick={() => { setCurrentView('services'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Enllantado y Balanceo Dinámico Láser 3D
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setCurrentView('services'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Alineamiento Computarizado Multieje
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setCurrentView('services'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Instalación de Kit Lift TRAKKO® +2"
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-primary border-b border-surface-container pb-1 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-emerald-600">security</span>
                  Cabina LLumar &amp; Detailing 3M
                </div>
                <ul className="space-y-1.5 text-xs">
                  <li>
                    <button
                      onClick={() => { setCurrentView('services'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Láminas LLumar Nanocerámica Homologadas PNP
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setCurrentView('services'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Tratamiento Cerámico 3M 9H &amp; PPF
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setCurrentView('services'); setActiveDropdown('none'); }}
                      className="text-left font-medium text-on-surface hover:text-primary hover:underline cursor-pointer"
                    >
                      Instalación de GPS Satelital con Bloqueo
                    </button>
                  </li>
                </ul>
              </div>

              {/* Book Appointment CTA Card */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-purple-700 font-bold uppercase tracking-wider">
                    Atención Inmediata
                  </div>
                  <h4 className="font-headline font-bold text-base text-primary mt-1">
                    Cita de Taller Online
                  </h4>
                  <p className="text-xs text-outline mt-1">
                    Reserva tu turno sin colas en nuestro concesionario de Av. Vía de Evitamiento Sur 6003.
                  </p>
                </div>
                <button
                  onClick={() => { setCurrentView('services'); setActiveDropdown('none'); }}
                  className="mt-3 bg-primary text-white text-xs font-bold py-2 px-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Agendar Cita en Taller</span>
                  <span className="material-symbols-outlined text-sm">event_available</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileNavOpen && (
        <div className="md:hidden bg-white border-b border-surface-container p-4 space-y-4 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-surface-container">
            <NorCelisLogo variant="full" theme="light" size="custom" className="h-8 w-auto" />
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-container text-[#212955] cursor-pointer"
              aria-label="Cerrar menú"
            >
              <AppleCloseIcon size={20} />
            </button>
          </div>

          {/* Master Mega Menu Mobile Trigger Banner */}
          <button
            onClick={() => { setIsMegaMenuOpen(true); setIsMobileNavOpen(false); }}
            className="w-full p-3.5 min-h-[50px] flex items-center justify-between text-left bg-gradient-to-r from-primary via-primary to-primary-container text-white rounded-2xl font-bold cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <AppleIconBadge variant="subtle-orange" size="sm">
                <MasterCatalogIcon size={18} className="text-[#F07F00]" />
              </AppleIconBadge>
              <div>
                <div className="text-xs uppercase tracking-wider text-secondary-fixed font-mono font-bold">
                  Catálogo Completo
                </div>
                <div className="text-sm font-headline">Explorar Mega Menú de Categorías</div>
              </div>
            </div>
            <AppleChevronRightIcon size={18} className="text-white" />
          </button>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-surface-container-low p-1.5 pl-3 rounded-xl border border-surface-container min-h-[44px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar repuestos, marcas, autos..."
              className="flex-1 bg-transparent text-sm focus:outline-none min-h-[40px]"
            />
            <button
              type="submit"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-primary hover:bg-surface-container cursor-pointer"
              aria-label="Ejecutar búsqueda"
            >
              <AppleSearchIcon size={20} />
            </button>
          </form>

          {/* Primary Quick Sections */}
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            <button
              onClick={() => { setCurrentView('home'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[46px] flex items-center gap-2 text-left bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors"
            >
              <AppleIconBadge variant="subtle-blue" size="sm">
                <span className="text-xs font-bold">NH</span>
              </AppleIconBadge>
              <span>Inicio</span>
            </button>
            <button
              onClick={() => { navigateToPartsCatalog('todos'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[46px] flex items-center gap-2 text-left bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors"
            >
              <AppleIconBadge variant="subtle-orange" size="sm">
                <AutoPartsIcon size={16} />
              </AppleIconBadge>
              <span>Autopartes y Accesorios</span>
            </button>
            <button
              onClick={() => { setCurrentView('services'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[46px] flex items-center gap-2 text-left bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors"
            >
              <AppleIconBadge variant="subtle-blue" size="sm">
                <WorkshopServiceIcon size={16} />
              </AppleIconBadge>
              <span>Servicios</span>
            </button>
            <button
              onClick={() => { setCurrentView('cars'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[46px] flex items-center gap-2 text-left bg-surface-container-low rounded-xl cursor-pointer hover:bg-surface-container transition-colors"
            >
              <AppleIconBadge variant="secondary" size="sm">
                <VehicleIcon size={16} />
              </AppleIconBadge>
              <span>Vehículos</span>
            </button>
          </div>

          {/* Critical Sections Banner Grid */}
          <div className="space-y-2 pt-1 border-t border-surface-container">
            <div className="text-xs font-bold text-outline uppercase tracking-wider px-1">
              Soluciones Críticas Nor Celis
            </div>

            <button
              onClick={() => { setCurrentView('trade-in'); setIsMobileNavOpen(false); }}
              className="w-full p-3 min-h-[46px] flex items-center justify-between text-left bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <AppleIconBadge variant="emerald" size="sm">
                  <PlanRetomaIcon size={16} className="text-white" />
                </AppleIconBadge>
                <span>Plan Retoma (Bono hasta S/ 7,500)</span>
              </div>
              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full uppercase">
                TASACIÓN
              </span>
            </button>

            <button
              onClick={() => { setCurrentView('financing'); setIsMobileNavOpen(false); }}
              className="w-full p-3 min-h-[46px] flex items-center justify-between text-left bg-blue-50 border border-blue-200 text-blue-950 rounded-xl font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <AppleIconBadge variant="secondary" size="sm">
                  <BankFinancingIcon size={16} className="text-white" />
                </AppleIconBadge>
                <span>Simulador de Cuotas &amp; Crédito</span>
              </div>
              <span className="text-[10px] bg-blue-700 text-white px-2 py-0.5 rounded-full uppercase">
                9.99% TEA
              </span>
            </button>

            <button
              onClick={() => { setIsGarageModalOpen(true); setIsMobileNavOpen(false); }}
              className="w-full p-3 min-h-[46px] flex items-center justify-between text-left bg-surface-container-low border border-surface-container text-on-surface rounded-xl font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <AppleIconBadge variant="primary" size="sm">
                  <GarageLiftIcon size={16} className="text-white" />
                </AppleIconBadge>
                <span>Mi Garaje Virtual (Compatibilidad VIN)</span>
              </div>
              <span className={`text-xs font-bold ${activeGarage ? 'text-emerald-600' : 'text-[#F07F00]'}`}>
                {activeGarage ? activeGarage.model : '+ Agregar auto'}
              </span>
            </button>

            <button
              onClick={() => { setIsViewer360Open(true); setIsMobileNavOpen(false); }}
              className="w-full p-3 min-h-[46px] flex items-center justify-between text-left bg-surface-container-low border border-surface-container text-secondary rounded-xl font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <AppleIconBadge variant="subtle-orange" size="sm">
                  <Showroom360Icon size={16} />
                </AppleIconBadge>
                <span>Showroom Interactivo 360°</span>
              </div>
              <AppleChevronDownIcon size={14} className="-rotate-90 text-[#9D9D9C]" />
            </button>
          </div>

          {/* Quick Repuestos por Marca */}
          <div className="space-y-2 pt-1 border-t border-surface-container">
            <div className="text-xs font-bold text-outline uppercase tracking-wider px-1">
              Marcas Oficiales Garantizadas
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Mickey Thompson', code: 'Mickey Thompson', cat: 'llantas' },
                { name: 'KEKO 4x4', code: 'KEKO', cat: 'accesorios4x4' },
                { name: 'Mobil 1', code: 'Mobil', cat: 'lubricantes' },
                { name: 'LLumar', code: 'LLumar', cat: 'seguridad' },
                { name: 'Black Rhino', code: 'BLACK RHINO', cat: 'llantas' },
                { name: '3M Detailing', code: '3M', cat: 'detailing' },
                { name: 'TRAKKO® HD', code: 'TRAKKO® AUTORUS', cat: 'suspension' },
                { name: 'Toyota Genuino', code: 'TOYOTA Genuino', cat: 'todos' },
              ].map((brand, bIdx) => (
                <button
                  key={bIdx}
                  onClick={() => { navigateToPartsCatalog(brand.cat, brand.code); setIsMobileNavOpen(false); }}
                  className="px-2.5 py-1.5 rounded-lg bg-surface-container-low text-xs font-bold text-on-surface hover:bg-primary hover:text-white border border-surface-container cursor-pointer transition-colors"
                >
                  {brand.name}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Items in Mobile Menu */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container text-xs font-bold">
            <button
              onClick={() => { setCurrentView('account'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[44px] flex items-center justify-center gap-2 text-center bg-primary text-white rounded-xl cursor-pointer"
            >
              <AppleUserIcon size={16} />
              <span>Mi Cuenta</span>
            </button>
            <button
              onClick={() => { setCurrentView('claims'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[44px] flex items-center justify-center gap-2 text-center bg-surface-container-low text-on-surface rounded-xl cursor-pointer"
            >
              <OfficialQuoteIcon size={16} />
              <span>Reclamaciones</span>
            </button>
          </div>
        </div>
      )}

      {/* Complete Mega Menu Modal */}
      <MegaMenuModal
        isOpen={isMegaMenuOpen}
        onClose={() => setIsMegaMenuOpen(false)}
      />
    </header>
  );
};
