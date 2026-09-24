import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NorCelisLogo } from './NorCelisLogo';
import { MegaMenuModal } from './MegaMenuModal';

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
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<NavDropdownType>('none');
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuDropdownRef = useRef<HTMLDivElement | null>(null);

  // Click outside to close Menu dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMenuDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      showToast('Ingresa un término de búsqueda');
      return;
    }
    // Búsqueda inteligente por palabras clave
    const q = searchQuery.toLowerCase();
    if (
      q.includes('freno') ||
      q.includes('disco') ||
      q.includes('bateria') ||
      q.includes('amortiguador') ||
      q.includes('filtro') ||
      q.includes('llanta') ||
      q.includes('aceite') ||
      q.includes('mickey') ||
      q.includes('keko') ||
      q.includes('mobil') ||
      q.includes('llumar') ||
      q.includes('3m') ||
      q.includes('trakko') ||
      q.includes('suspension') ||
      q.includes('repuesto')
    ) {
      navigateToPartsCatalog('todos', 'todos', searchQuery);
    } else if (
      q.includes('taller') ||
      q.includes('mantenimiento') ||
      q.includes('alineamiento') ||
      q.includes('pintura') ||
      q.includes('detailing') ||
      q.includes('servicio')
    ) {
      setCurrentView('services');
    } else {
      setCurrentView('cars');
    }
    showToast(`Buscando "${searchQuery}" en el catálogo...`);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-surface-container shadow-sm">
      {/* Top Utility Bar */}
      <div className="bg-primary text-surface-container-highest font-label-md py-1.5 px-gutter hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-space-lg text-xs">
            <span className="flex items-center gap-1 font-semibold text-secondary-fixed">
              <span className="material-symbols-outlined text-[16px]">call</span>
              Central: (076) 364-520
            </span>
            <span className="text-outline-variant opacity-60">|</span>
            <button
              onClick={() => setCurrentView('locations')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium"
            >
              <span className="material-symbols-outlined text-[15px] text-amber-300">location_on</span>
              Concesionario y Taller: AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA
            </button>
            <span className="text-outline-variant opacity-60">|</span>
            <button
              onClick={() => setCurrentView('trade-in')}
              className="hover:text-white transition-colors cursor-pointer text-secondary-fixed font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
              Bono Retoma hasta S/ 7,500
            </button>
          </div>
          <div className="flex items-center gap-space-lg text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              Garantía Nor Celis de 1 a 5 Años
            </span>
            <span className="text-outline-variant opacity-60">|</span>
            <button
              onClick={() => setCurrentView('claims')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">menu_book</span>
              Libro de Reclamaciones
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-gutter py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-space-md">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-xl hover:bg-surface-container text-on-surface cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center text-left focus:outline-none group cursor-pointer py-1 min-h-[44px]"
              title="Nor Celis Automotriz - Inicio"
            >
              <NorCelisLogo
                variant="full"
                theme="light"
                size="custom"
                className="h-9 sm:h-11 md:h-12 w-auto group-hover:scale-[1.02] transition-transform drop-shadow-xs"
              />
            </button>
          </div>

          {/* Master Menu Button with Attached Dropdown */}
          <div className="relative hidden lg:block" ref={menuDropdownRef}>
            <button
              onClick={() => setIsMenuDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm px-4 py-2.5 min-h-[44px] rounded-xl shadow-xs transition-all cursor-pointer ring-1 ring-primary/20 group ${
                isMenuDropdownOpen ? 'bg-primary/95 ring-2 ring-secondary' : ''
              }`}
              title="Abrir Menú de Navegación y Departamentos"
              aria-expanded={isMenuDropdownOpen}
            >
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                <span className="material-symbols-outlined text-sm text-secondary-fixed">menu</span>
              </div>
              <span>Menú</span>
              <span
                className={`material-symbols-outlined text-sm text-surface-container-highest/80 transition-transform duration-200 ${
                  isMenuDropdownOpen ? 'rotate-180 text-secondary' : ''
                }`}
              >
                keyboard_arrow_down
              </span>
            </button>

            {/* Interactive Attached Dropdown */}
            {isMenuDropdownOpen && (
              <div className="absolute top-full mt-2 left-0 w-[580px] bg-white rounded-2xl shadow-2xl border border-surface-container z-50 p-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-surface-container pb-3 mb-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <span className="material-symbols-outlined text-secondary text-lg">widgets</span>
                    <span>Explorador de Departamentos &amp; Servicios</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuDropdownOpen(false);
                      setIsMegaMenuOpen(true);
                    }}
                    className="text-[11px] font-bold text-primary hover:text-secondary flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Ver Pantalla Completa</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Columna 1: Vehículos & Compra */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-outline px-2 mb-1">
                      Vehículos &amp; Financiamiento
                    </div>
                    <button
                      onClick={() => {
                        setCurrentView('cars');
                        setIsMenuDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">directions_car</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface group-hover:text-primary">
                          Vehículos 2025 0 KM
                        </div>
                        <div className="text-[11px] text-outline">
                          SUVs 4x4, Pickups, Híbridos y Seminuevos
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('trade-in');
                        setIsMenuDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">swap_horiz</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                          <span>Plan Retoma</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-extrabold">
                            +S/ 7.5K
                          </span>
                        </div>
                        <div className="text-[11px] text-outline">
                          Tasación en 30 min como parte de pago
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('financing');
                        setIsMenuDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-secondary-container/10 text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary-container group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">calculate</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface group-hover:text-primary">
                          Simulador de Financiamiento
                        </div>
                        <div className="text-[11px] text-outline">
                          Cuotas BCP, BBVA, Santander
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsViewer360Open(true);
                        setIsMenuDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">360</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface group-hover:text-primary">
                          Showroom Interactivo 360°
                        </div>
                        <div className="text-[11px] text-outline">
                          Inspección 3D y telemetría en vivo
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Columna 2: Repuestos, Taller & Servicios */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-outline px-2 mb-1">
                      Repuestos &amp; Postventa
                    </div>
                    <button
                      onClick={() => {
                        navigateToPartsCatalog('todos');
                        setIsMenuDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">tune</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface group-hover:text-primary">
                          Repuestos por Marca Oficial
                        </div>
                        <div className="text-[11px] text-outline">
                          Mickey Thompson, Keko, Mobil, 3M, LLumar
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('services');
                        setIsMenuDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">car_repair</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface group-hover:text-primary">
                          Taller Mecánico &amp; Detailing
                        </div>
                        <div className="text-[11px] text-outline">
                          Citas online prioritarias y diagnóstico 3D
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsGarageModalOpen(true);
                        setIsMenuDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">garage</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface group-hover:text-primary">
                          Mi Garaje Virtual
                        </div>
                        <div className="text-[11px] text-outline">
                          Compatibilidad garantizada por VIN
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('locations');
                        setIsMenuDropdownOpen(false);
                      }}
                      className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors text-left group cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">location_on</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-on-surface group-hover:text-primary">
                          Sedes &amp; Concesionario
                        </div>
                        <div className="text-[11px] text-outline">
                          Av. Vía de Evitamiento Sur 6003
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Footer del dropdown */}
                <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setCurrentView('claims');
                      setIsMenuDropdownOpen(false);
                    }}
                    className="text-outline hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">menu_book</span>
                    <span>Libro de Reclamaciones</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('about');
                      setIsMenuDropdownOpen(false);
                    }}
                    className="text-outline hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span>Garantías &amp; Empresa</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search bar con UNA SOLA lupa */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-2xl hidden md:flex items-center bg-surface-container-low rounded-xl border border-surface-container focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all overflow-hidden min-h-[44px]"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por Repuesto, Marca Oficial (M/T, KEKO, Mobil, 3M, LLumar, Toyota)..."
              className="flex-1 pl-4 pr-3 py-2.5 min-h-[44px] text-sm bg-transparent focus:outline-none placeholder:text-outline text-on-surface"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-2 text-outline hover:text-on-surface cursor-pointer"
                title="Limpiar búsqueda"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
            <button
              type="submit"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 pr-4 text-primary hover:text-secondary transition-colors cursor-pointer"
              title="Buscar"
              aria-label="Buscar"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>
          </form>

          {/* Header Action Items */}
          <div className="flex items-center gap-space-sm sm:gap-space-md">
            {/* Active Garage Selector */}
            <button
              onClick={() => setIsGarageModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-left transition-all group cursor-pointer"
              title="Configurar Mi Garaje para ver compatibilidad exacta"
              aria-label="Configurar Mi Garaje"
            >
              <div className="w-8 h-8 rounded-lg bg-primary text-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">garage</span>
              </div>
              <div className="hidden xl:block">
                <div className="text-[10px] font-bold uppercase tracking-wider text-outline flex items-center gap-1">
                  <span>Mi Garaje</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <div className="text-xs font-bold text-on-surface max-w-[130px] truncate">
                  {activeGarage.model}
                </div>
              </div>
            </button>

            {/* Wishlist Link */}
            <button
              onClick={() => setCurrentView('wishlist')}
              className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer ${
                currentView === 'wishlist' ? 'bg-surface-container text-primary' : 'text-on-surface'
              }`}
              title="Ver Lista de Deseos"
              aria-label="Ver Lista de Deseos"
            >
              <span className="material-symbols-outlined text-2xl">favorite</span>
              {wishlistTotalCount > 0 && (
                <span className="absolute top-1 right-1 bg-secondary-container text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistTotalCount}
                </span>
              )}
            </button>

            {/* Cart Link */}
            <button
              onClick={() => setCurrentView('cart')}
              className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-xl hover:bg-surface-container transition-colors cursor-pointer ${
                currentView === 'cart' ? 'bg-surface-container text-primary' : 'text-on-surface'
              }`}
              title="Ver Carrito de Compras"
              aria-label="Ver Carrito de Compras"
            >
              <span className="material-symbols-outlined text-2xl">shopping_cart</span>
              {cartTotalCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm">
                  {cartTotalCount}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            <button
              onClick={() => setCurrentView('account')}
              className={`flex items-center gap-2.5 min-h-[44px] p-1.5 pl-2.5 pr-3 rounded-xl transition-colors text-left cursor-pointer ${
                currentView === 'account' ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-surface-container'
              }`}
              title="Mi Cuenta & Dashboard"
              aria-label="Mi Cuenta y Garaje"
            >
              <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs ring-2 ring-surface-container shrink-0">
                CM
              </div>
              <div className="hidden lg:block">
                <div className="text-[10px] text-outline font-medium">Hola, Carlos</div>
                <div className="text-xs font-bold text-on-surface">Mi Cuenta</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Subnav Desktop with Interactive Hover Mega Dropdowns */}
      <div
        className="border-t border-surface-container bg-surface-container-lowest relative px-gutter hidden md:block"
        onMouseLeave={handleMouseLeave}
      >
        <nav aria-label="Categorías principales" className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 py-1.5 text-xs font-semibold">
          {/* Direct Mega Menu Quick Trigger */}
          <button
            onClick={() => setIsMegaMenuOpen(true)}
            className="px-3 py-2 min-h-[40px] rounded-xl bg-surface-container text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 font-bold cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>Todas las Categorías</span>
          </button>

          {/* Vehículos Nav Item */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('vehiculos')}
          >
            <button
              onClick={() => setCurrentView('cars')}
              className={`px-3 py-2 min-h-[40px] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'cars' || currentView === 'vehicle-pdp' || activeDropdown === 'vehiculos'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">directions_car</span>
              <span>Vehículos</span>
              <span className="bg-secondary-container text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                0 KM
              </span>
              <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </button>
          </div>

          {/* Repuestos & Marcas Oficiales Nav Item */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('repuestos')}
          >
            <button
              onClick={() => navigateToPartsCatalog('todos')}
              className={`px-3 py-2 min-h-[40px] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'parts' || currentView === 'part-pdp' || activeDropdown === 'repuestos'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Autopartes y Accesorios</span>
              <span className="bg-primary text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                OFICIAL
              </span>
              <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </button>
          </div>

          {/* Servicios Nav Item */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('taller')}
          >
            <button
              onClick={() => setCurrentView('services')}
              className={`px-3 py-2 min-h-[40px] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'services' || activeDropdown === 'taller'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">car_repair</span>
              <span>Servicios</span>
              <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </button>
          </div>

          {/* Plan Retoma & Financiamiento Nav Item */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('finanzas')}
          >
            <button
              onClick={() => setCurrentView('trade-in')}
              className={`px-3 py-2 min-h-[40px] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'trade-in' || currentView === 'financing' || activeDropdown === 'finanzas'
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600">swap_horiz</span>
              <span className="text-emerald-800 font-bold">Plan Retoma &amp; Cuotas</span>
              <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                BONO S/ 7.5K
              </span>
              <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </button>
          </div>

          {/* Showroom 360° */}
          <button
            onClick={() => setIsViewer360Open(true)}
            className="px-3 py-2 min-h-[40px] rounded-xl bg-secondary-container/10 text-secondary hover:bg-secondary-container hover:text-white transition-all flex items-center gap-1.5 font-bold cursor-pointer border border-secondary-container/30"
          >
            <span className="material-symbols-outlined text-[16px]">360</span>
            <span>Showroom 360°</span>
          </button>

          {/* Sede Cajamarca */}
          <button
            onClick={() => setCurrentView('locations')}
            className={`px-3 py-2 min-h-[40px] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'locations'
                ? 'bg-primary text-white font-bold'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span>Cajamarca</span>
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
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-container text-outline cursor-pointer"
              aria-label="Cerrar menú"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* Master Mega Menu Mobile Trigger Banner */}
          <button
            onClick={() => { setIsMegaMenuOpen(true); setIsMobileNavOpen(false); }}
            className="w-full p-3.5 min-h-[50px] flex items-center justify-between text-left bg-gradient-to-r from-primary via-primary to-primary-container text-white rounded-2xl font-bold cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-2xl text-secondary-fixed">apps</span>
              <div>
                <div className="text-xs uppercase tracking-wider text-secondary-fixed font-mono font-bold">
                  Catálogo Completo
                </div>
                <div className="text-sm font-headline">Explorar Mega Menú de Categorías</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
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
              <span className="material-symbols-outlined">search</span>
            </button>
          </form>

          {/* Primary Quick Sections */}
          <div className="grid grid-cols-2 gap-2 text-sm font-semibold">
            <button
              onClick={() => { setCurrentView('home'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[46px] flex items-center gap-2 text-left bg-surface-container-low rounded-xl cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-primary">home</span>
              <span>Inicio</span>
            </button>
            <button
              onClick={() => { setCurrentView('cars'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[46px] flex items-center gap-2 text-left bg-surface-container-low rounded-xl cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-primary">directions_car</span>
              <span>Vehículos</span>
            </button>
            <button
              onClick={() => { navigateToPartsCatalog('todos'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[46px] flex items-center gap-2 text-left bg-surface-container-low rounded-xl cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-primary">tune</span>
              <span>Autopartes y Accesorios</span>
            </button>
            <button
              onClick={() => { setCurrentView('services'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[46px] flex items-center gap-2 text-left bg-surface-container-low rounded-xl cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-primary">car_repair</span>
              <span>Servicios</span>
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
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-emerald-700">swap_horiz</span>
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
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-blue-700">account_balance</span>
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
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-primary">garage</span>
                <span>Mi Garaje Virtual (Compatibilidad VIN)</span>
              </div>
              <span className="text-xs text-emerald-600 font-bold">{activeGarage.model}</span>
            </button>

            <button
              onClick={() => { setIsViewer360Open(true); setIsMobileNavOpen(false); }}
              className="w-full p-3 min-h-[46px] flex items-center justify-between text-left bg-surface-container-low border border-surface-container text-secondary rounded-xl font-bold cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">360</span>
                <span>Showroom Interactivo 360°</span>
              </div>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
              className="p-3 min-h-[44px] flex items-center justify-center gap-1.5 text-center bg-primary text-white rounded-xl cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">person</span>
              <span>Mi Cuenta</span>
            </button>
            <button
              onClick={() => { setCurrentView('claims'); setIsMobileNavOpen(false); }}
              className="p-3 min-h-[44px] flex items-center justify-center gap-1.5 text-center bg-surface-container-low text-on-surface rounded-xl cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">menu_book</span>
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
