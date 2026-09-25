import React from 'react';
import { useApp } from '../context/AppContext';
import { NorCelisLogo } from './NorCelisLogo';

export const Footer: React.FC = () => {
  const { setCurrentView, setSelectedPartSku, showToast } = useApp();

  return (
    <footer className="bg-primary text-surface-container-highest border-t border-primary-container mt-16">
      {/* Top Banner Support */}
      <div className="border-b border-primary-container/80 py-8 px-gutter">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container text-white flex items-center justify-center font-bold text-2xl shadow-lg">
              <span className="material-symbols-outlined text-3xl">support_agent</span>
            </div>
            <div>
              <h4 className="font-headline font-bold text-white text-lg">
                ¿Necesitas asesoría técnica especializada?
              </h4>
              <p className="text-surface-container-highest/80 text-xs mt-0.5">
                Ingenieros automotrices y asesores oficiales en línea para verificar compatibilidad y cotizaciones.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <a
              href="https://wa.me/51987654321?text=Hola%20Nor%20Celis,%20deseo%20asesoria%20personalizada"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md text-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>WhatsApp Oficial: +51 987 654 321</span>
            </a>
            <button
              onClick={() => {
                setCurrentView('services');
                showToast('Desplazando a agenda de citas en taller');
              }}
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 bg-surface-container-high/15 hover:bg-surface-container-high/25 text-white font-semibold text-xs px-5 py-3 rounded-xl border border-white/20 transition-all text-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Agendar Cita en Taller</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 4 Column Content */}
      <div className="px-gutter py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand & Sede */}
          <div className="space-y-4">
            <div className="flex items-center">
              <NorCelisLogo variant="full" theme="dark" size="custom" className="h-12 w-auto drop-shadow-sm" />
            </div>
            <p className="text-xs text-surface-container-highest/70 leading-relaxed">
              Más de 24 años liderando la distribución automotriz en Perú. Concesionario oficial multimarca, taller de alta ingeniería y repuestos certificados OEM.
            </p>
            <div className="space-y-2 text-xs text-surface-container-highest/90">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary-fixed mt-0.5">location_on</span>
                <span>Concesionario &amp; Taller: AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary-fixed">schedule</span>
                <span>Lun - Sáb: 7:30 AM - 7:00 PM | Dom: 9:00 AM - 2:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary-fixed">call</span>
                <span>Central: (076) 364-520 • WhatsApp: +51 987 654 321</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary-fixed">mail</span>
                <span>contacto@norcelis.pe</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('locations')}
                  className="min-h-[44px] inline-flex items-center gap-1.5 text-secondary-fixed hover:text-white font-bold text-xs transition-colors underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">storefront</span>
                  <span>Ver Concesionario &amp; Taller Cajamarca →</span>
                </button>
              </div>
            </div>

            {/* Redes Sociales Oficiales */}
            <div className="pt-3 border-t border-white/10">
              <div className="text-[11px] font-bold text-surface-container-highest uppercase tracking-wider mb-2.5">
                Canales Oficiales
              </div>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.facebook.com/norcelisautomotriz"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Nor Celis Automotriz"
                  title="Facebook - Nor Celis Automotriz"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm group cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/norcelis_automotriz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Nor Celis Automotriz"
                  title="Instagram - @norcelis_automotriz"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm group cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@norcelis.automotriz"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok Nor Celis Automotriz"
                  title="TikTok - @norcelis.automotriz"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-black text-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm group hover:ring-1 hover:ring-[#00f2fe] cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.88-4.47V8.65a8.28 8.28 0 0 0 3.89 1.47v-3.43z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Vehículos */}
          <div className="space-y-3">
            <h5 className="font-headline font-bold text-white text-sm uppercase tracking-wider">
              Vehículos 2025 &amp; Usados
            </h5>
            <ul className="space-y-2 text-xs text-surface-container-highest/75">
              <li>
                <button
                  onClick={() => setCurrentView('cars')}
                  className="hover:text-white transition-colors"
                >
                  Autos Nuevos 2025 (0 km)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('cars')}
                  className="hover:text-white transition-colors"
                >
                  Seminuevos Certificados (150 Puntos)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('vehicle-pdp')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                  Toyota RAV4 2025 Ficha Técnica
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('financing')}
                  className="hover:text-white transition-colors"
                >
                  Simulador de Crédito Vehicular (Multibanco)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('trade-in')}
                  className="hover:text-white transition-colors text-secondary-fixed font-bold"
                >
                  Plan Retoma &amp; Tasación Online (+S/ 7,500)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Repuestos OEM */}
          <div className="space-y-3">
            <h5 className="font-headline font-bold text-white text-sm uppercase tracking-wider">
              Repuestos &amp; Autopartes
            </h5>
            <ul className="space-y-2 text-xs text-surface-container-highest/75">
              <li>
                <button
                  onClick={() => {
                    setSelectedPartSku('PART-TOY-BRK-01');
                    setCurrentView('part-pdp');
                  }}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                  Kits de Freno Brembo &amp; Pastillas Cerámicas
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('parts')}
                  className="hover:text-white transition-colors"
                >
                  Baterías Bosch AGM Libre Mantenimiento
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('parts')}
                  className="hover:text-white transition-colors"
                >
                  Amortiguadores KYB Excel-G Gas
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('parts')}
                  className="hover:text-white transition-colors"
                >
                  Kits Mantenimiento Mayor 40,000 km
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('parts')}
                  className="hover:text-white transition-colors"
                >
                  Búsqueda por Chasis / Número VIN
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Taller y Servicios */}
          <div className="space-y-3">
            <h5 className="font-headline font-bold text-white text-sm uppercase tracking-wider">
              Taller &amp; Car Care
            </h5>
            <ul className="space-y-2 text-xs text-surface-container-highest/75">
              <li>
                <button
                  onClick={() => setCurrentView('services')}
                  className="hover:text-white transition-colors"
                >
                  Tratamiento Cerámico 9H Profundo
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('services')}
                  className="hover:text-white transition-colors"
                >
                  Enllantado &amp; Alineamiento Láser 3D
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('services')}
                  className="hover:text-white transition-colors"
                >
                  Laminado Antiasalto 8-16 Micras
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('services')}
                  className="hover:text-white transition-colors"
                >
                  Tapizado en Cuero y Vinil Premium
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('services')}
                  className="hover:text-white transition-colors"
                >
                  Equipamiento Minero &amp; Flotas 4x4
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-container/80 py-6 px-gutter bg-primary/70 text-xs text-surface-container-highest/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-center md:text-left">
            <span>© 2025 Nor Celis Automotriz S.A.C. RUC: 20541982311. Todos los derechos reservados.</span>
            <span className="hidden sm:inline">•</span>
            <button onClick={() => setCurrentView('claims')} className="min-h-[44px] inline-flex items-center px-1.5 underline hover:text-white font-semibold cursor-pointer">
              Libro de Reclamaciones
            </button>
            <span className="hidden sm:inline">•</span>
            <button onClick={() => setCurrentView('about')} className="min-h-[44px] inline-flex items-center px-1.5 underline hover:text-white font-semibold cursor-pointer">
              Sobre Nosotros &amp; Garantías
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-surface-container-highest/80">Pagos Seguros:</span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] bg-white/10 px-2 py-1 rounded">
              <span className="text-white font-bold">VISA</span>
              <span>•</span>
              <span className="text-white font-bold">MC</span>
              <span>•</span>
              <span className="text-purple-300 font-bold">YAPE</span>
              <span>•</span>
              <span className="text-cyan-300 font-bold">PLIN</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
