import React from 'react';
import { useApp } from '../context/AppContext';
import { NorCelisLogo } from './NorCelisLogo';

export const Footer: React.FC = () => {
  const {
    user,
    setCurrentView,
    setSelectedPartSku,
    showToast,
    setIsAdminUnlocked,
    navigateToTracking,
    navigateToTerms,
    setIsGarageModalOpen,
  } = useApp();

  return (
    <footer className="mt-16 sm:mt-24 border-t border-[#262c38] text-slate-300 font-sans shadow-2xl overflow-hidden">
      {/* =========================================================================
          BLOQUE 1: CINTILLO DE CONFIANZA & VALOR AUTOMOTRIZ (Gris Grafito Suave #1e232d)
          Inspirado en Falabella & HG Performance Autoparts
          ========================================================================= */}
      <div className="bg-[#1e232d] border-b border-[#2b3240] py-6 sm:py-7 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {/* Pilar 1: Envíos Nacionales Shalom */}
          <div className="flex items-center gap-3.5 p-3 rounded-sm bg-[#161920]/60 border border-white/5 hover:border-[#F07F00]/40 transition-colors">
            <div className="w-11 h-11 rounded-none bg-[#F07F00]/15 border border-[#F07F00]/30 flex items-center justify-center shrink-0 text-[#F07F00]">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <div>
              <div className="text-white font-headline font-bold text-xs uppercase tracking-wide">
                Envíos a Todo el Perú
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Alianza con <strong className="text-white font-semibold">Shalom Express</strong> y Olva Courier con guía en vivo.
              </p>
            </div>
          </div>

          {/* Pilar 2: Pagos 100% Seguros */}
          <div className="flex items-center gap-3.5 p-3 rounded-sm bg-[#161920]/60 border border-white/5 hover:border-[#2563eb]/40 transition-colors">
            <div className="w-11 h-11 rounded-none bg-[#2563eb]/15 border border-[#2563eb]/30 flex items-center justify-center shrink-0 text-[#60a5fa]">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
            </div>
            <div>
              <div className="text-white font-headline font-bold text-xs uppercase tracking-wide">
                Pagos 100% Protegidos
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Tarjetas, Yape, Plin y transferencias con cifrado SSL 256-Bit.
              </p>
            </div>
          </div>

          {/* Pilar 3: Garantía Oficial OEM */}
          <div className="flex items-center gap-3.5 p-3 rounded-sm bg-[#161920]/60 border border-white/5 hover:border-[#10b981]/40 transition-colors">
            <div className="w-11 h-11 rounded-none bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center shrink-0 text-[#34d399]">
              <span className="material-symbols-outlined text-2xl">workspace_premium</span>
            </div>
            <div>
              <div className="text-white font-headline font-bold text-xs uppercase tracking-wide">
                Garantía OEM Certificada
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Repuestos 100% originales con respaldo de fábrica e inspección técnica.
              </p>
            </div>
          </div>

          {/* Pilar 4: Asesoría Técnica Especializada */}
          <div className="flex items-center gap-3.5 p-3 rounded-sm bg-[#161920]/60 border border-white/5 hover:border-[#22c55e]/40 transition-colors">
            <div className="w-11 h-11 rounded-none bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center shrink-0 text-[#4ade80]">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <div>
              <div className="text-white font-headline font-bold text-xs uppercase tracking-wide">
                Asesoría Técnica en Línea
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                Validación de repuestos por chasis/VIN con ingenieros mecánicos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BLOQUE 2: 4 COLUMNAS DE NAVEGACIÓN Y ATENCIÓN (Gris Grafito #161920)
          Estructura tradicional clara agrupada por catálogo y servicio
          ========================================================================= */}
      <div className="bg-[#161920] py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Columna 1: Catálogo & Repuestos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
              <span className="material-symbols-outlined text-[#F07F00] text-lg">build_circle</span>
              <h4 className="font-headline font-extrabold text-white text-xs uppercase tracking-wider">
                Catálogo &amp; Repuestos
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPartSku('PART-TOY-BRK-01');
                    setCurrentView('part-pdp');
                  }}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Kits de Freno &amp; Pastillas Cerámicas</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('parts')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Baterías Bosch AGM Libres de Mant.</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('parts')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Amortiguadores KYB &amp; Suspensión</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('parts')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Filtros y Afinamiento Mayor OEM</span>
                </button>
              </li>
              <li>
                {/* Enlace destacado a Maquinaria Pesada */}
                <button
                  type="button"
                  onClick={() => setCurrentView('machinery')}
                  className="inline-flex items-center gap-2 text-[#F07F00] hover:text-white font-bold transition-colors cursor-pointer group"
                >
                  <span className="material-symbols-outlined text-[15px]">precision_manufacturing</span>
                  <span className="underline underline-offset-2">Alquiler de Maquinaria Pesada</span>
                  <span className="text-[10px] bg-[#F07F00]/20 text-[#F07F00] font-semibold px-1.5 py-0.5 rounded-xs uppercase">
                    Nuevo
                  </span>
                </button>
              </li>
              <li className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsGarageModalOpen(true)}
                  className="hover:text-white text-slate-400 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#F07F00]">pin</span>
                  <span>Buscar piezas por Chasis / VIN</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 2: Vehículos & Servicios */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
              <span className="material-symbols-outlined text-[#F07F00] text-lg">directions_car</span>
              <h4 className="font-headline font-extrabold text-white text-xs uppercase tracking-wider">
                Vehículos &amp; Taller
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('cars')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Autos Nuevos 2025 (0 km multimarca)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('cars')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Seminuevos Certificados (150 Puntos)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('services')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Tratamiento Cerámico 9H &amp; Detailing</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('services')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Enllantado &amp; Alineamiento Láser 3D</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('trade-in')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group font-semibold text-white"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F07F00]"></span>
                  <span>Plan Retoma &amp; Tasación Online (+S/ 7,500)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('financing')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Simulador de Crédito Multibanco</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Atención al Cliente & Sedes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
              <span className="material-symbols-outlined text-[#F07F00] text-lg">storefront</span>
              <h4 className="font-headline font-extrabold text-white text-xs uppercase tracking-wider">
                Atención &amp; Sedes
              </h4>
            </div>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[17px] text-[#F07F00] shrink-0 mt-0.5">location_on</span>
                <div>
                  <strong className="text-white block font-medium">Sede Central Concesionario &amp; Taller:</strong>
                  <span className="text-slate-400">Av. Vía de Evitamiento Sur N° 6003, Cajamarca</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[17px] text-[#F07F00] shrink-0 mt-0.5">schedule</span>
                <div>
                  <span className="text-slate-400">Lun - Sáb: 7:30 AM - 7:00 PM</span>
                  <span className="block text-slate-400">Dom: 9:00 AM - 2:00 PM</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[17px] text-[#F07F00] shrink-0">call</span>
                <span className="text-slate-300">Central: (076) 364-520</span>
              </div>
              <div className="pt-1">
                <a
                  href="https://wa.me/51987654321?text=Hola%20Nor%20Celis,%20deseo%20asesoria%20personalizada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#25D366] hover:text-white font-bold transition-colors cursor-pointer text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">chat</span>
                  <span>WhatsApp: +51 987 654 321</span>
                </a>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setCurrentView('locations')}
                  className="text-xs text-[#F07F00] hover:text-white underline font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Ver mapa de ubicación y facilidades</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Columna 4: Legales & Información Institucional */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
              <span className="material-symbols-outlined text-[#F07F00] text-lg">shield</span>
              <h4 className="font-headline font-extrabold text-white text-xs uppercase tracking-wider">
                Legales &amp; Empresa
              </h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTerms('terms')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Términos y Condiciones Generales</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTerms('privacy')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Políticas de Privacidad (Ley N° 29733)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToTerms('warranty')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Garantías de Fábrica &amp; Cobertura</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentView('about')}
                  className="hover:text-[#F07F00] transition-colors flex items-center gap-2 text-left cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-[#F07F00] transition-colors"></span>
                  <span>Sobre Nor Celis Automotriz</span>
                </button>
              </li>
            </ul>

            {/* Redes Sociales Oficiales */}
            <div className="pt-3 border-t border-white/10">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Síguenos en Redes
              </span>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.facebook.com/norcelisautomotriz"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Nor Celis Automotriz"
                  title="Facebook - Nor Celis Automotriz"
                  className="w-8 h-8 rounded-none bg-white/5 hover:bg-[#1877F2] text-white flex items-center justify-center border border-white/10 transition-all hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/norcelis_automotriz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Nor Celis Automotriz"
                  title="Instagram - @norcelis_automotriz"
                  className="w-8 h-8 rounded-none bg-white/5 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-white flex items-center justify-center border border-white/10 transition-all hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@norcelis.automotriz"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok Nor Celis Automotriz"
                  title="TikTok - @norcelis.automotriz"
                  className="w-8 h-8 rounded-none bg-white/5 hover:bg-black text-white flex items-center justify-center border border-white/10 transition-all hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.88-4.47V8.65a8.28 8.28 0 0 0 3.89 1.47v-3.43z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BLOQUE 3: CONFIANZA NACIONAL & TRANSACCIONAL (Azul Marino Corporativo #1b2247)
          Inspirado en Falabella Perú & Safari.com.pe
          Medios de pago peruanos, Envíos nacionales Shalom y Libro de Reclamaciones Oficial
          ========================================================================= */}
      <div className="bg-[#1b2247] border-t border-b border-white/10 py-9 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sub-bloque 3.1: Medios de Pago Peruanos & Tarjetas (Col 1 a 5) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F07F00] text-sm">credit_card</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Medios de Pago Seguros
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Aceptamos billeteras digitales y tarjetas de crédito o débito con acreditación inmediata:
            </p>
            {/* Badges de Pago */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Yape */}
              <div
                className="h-7 px-2.5 rounded-sm bg-[#742284] text-white flex items-center justify-center font-extrabold text-[11px] shadow-sm tracking-tight"
                title="Paga al instante con Yape"
              >
                Yape
              </div>
              {/* Plin */}
              <div
                className="h-7 px-2.5 rounded-sm bg-[#00D2D3] text-[#0f2430] flex items-center justify-center font-black text-[11px] shadow-sm tracking-tight"
                title="Paga con Plin (Interbank, Scotiabank, BBVA)"
              >
                plin
              </div>
              {/* Visa */}
              <div
                className="h-7 px-2.5 rounded-sm bg-white text-[#1a1f71] flex items-center justify-center font-black text-[12px] shadow-sm tracking-wider italic"
                title="Tarjetas de Débito y Crédito Visa"
              >
                VISA
              </div>
              {/* Mastercard */}
              <div
                className="h-7 px-2 rounded-sm bg-white flex items-center justify-center gap-0.5 shadow-sm"
                title="Mastercard Débito y Crédito"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90 inline-block"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90 -ml-2 inline-block"></span>
                <span className="text-[9px] font-bold text-slate-800 ml-1">Mastercard</span>
              </div>
              {/* American Express */}
              <div
                className="h-7 px-2 rounded-sm bg-[#002663] text-white flex items-center justify-center font-extrabold text-[10px] shadow-sm"
                title="American Express"
              >
                AMEX
              </div>
              {/* Diners Club */}
              <div
                className="h-7 px-2 rounded-sm bg-white text-[#004a97] flex items-center justify-center font-bold text-[10px] shadow-sm"
                title="Diners Club International"
              >
                Diners
              </div>
              {/* BCP & BBVA */}
              <div
                className="h-7 px-2 rounded-sm bg-[#002A8F] text-white flex items-center justify-center font-bold text-[10px] shadow-sm"
                title="Transferencias BCP y BBVA"
              >
                BCP / BBVA
              </div>
              {/* Culqi */}
              <div
                className="h-7 px-2 rounded-sm bg-[#001D4A] border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-mono text-[10px] font-bold shadow-sm"
                title="Pasarela de Pagos Culqi"
              >
                Culqi
              </div>
            </div>
          </div>

          {/* Sub-bloque 3.2: Envíos Nacionales Shalom & Couriers (Col 6 a 8) */}
          <div className="lg:col-span-3 space-y-3 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6 pt-5 lg:pt-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F07F00] text-sm">local_shipping</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Logística &amp; Despacho
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Despachos diarios a agencias y entrega a domicilio con cobertura 100% Perú:
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {/* Shalom Express Badge */}
              <div
                className="h-7 px-2.5 rounded-sm bg-[#E31B23] text-white flex items-center gap-1 font-headline font-black text-[11px] shadow-sm tracking-wide"
                title="Envíos diarios vía Shalom Express"
              >
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                <span>SHALOM</span>
              </div>
              {/* Marvisur */}
              <div
                className="h-7 px-2 rounded-sm bg-[#0C3B78] text-white flex items-center justify-center font-bold text-[10px] shadow-sm"
                title="Transportes y Carga Marvisur"
              >
                MARVISUR
              </div>
              {/* Olva Courier */}
              <div
                className="h-7 px-2 rounded-sm bg-[#FFCC00] text-[#1E1E1E] flex items-center justify-center font-extrabold text-[10px] shadow-sm"
                title="Olva Courier Express"
              >
                OLVA COURIER
              </div>
            </div>
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => navigateToTracking()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F07F00] hover:text-white transition-colors cursor-pointer group"
              >
                <span className="material-symbols-outlined text-[15px] group-hover:translate-x-0.5 transition-transform">
                  search
                </span>
                <span className="underline underline-offset-2">Rastrear mi Guía en Shalom →</span>
              </button>
            </div>
          </div>

          {/* Sub-bloque 3.3: Sello Oficial Libro de Reclamaciones (Col 9 a 12) */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6 pt-5 lg:pt-0">
            <div
              onClick={() => setCurrentView('claims')}
              className="group bg-[#161920]/90 hover:bg-[#161920] border-2 border-[#d97300]/50 hover:border-[#F07F00] p-4 rounded-sm transition-all duration-200 cursor-pointer shadow-md"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setCurrentView('claims');
                }
              }}
              title="Libro de Reclamaciones Virtual - Conforme a ley N° 29571"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-none bg-[#F07F00] text-[#212955] flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-3xl font-bold">menu_book</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-headline font-black text-xs uppercase tracking-wide">
                      Libro de Reclamaciones
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded-xs uppercase">
                      Virtual
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-300 leading-snug">
                    Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571).
                  </p>
                  <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-[#F07F00] group-hover:text-white transition-colors">
                    <span>Ingresar queja o reclamo virtual</span>
                    <span className="material-symbols-outlined text-[13px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BLOQUE 4: CRÉDITOS CORPORATIVOS & LEGALES (Gris Grafito Ultra-Profundo #0f1115)
          Información societaria, RUC, seguridad y acceso administrativo
          ========================================================================= */}
      <div className="bg-[#0f1115] py-7 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          {/* Logo y Razón Social */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="cursor-pointer" onClick={() => setCurrentView('home')}>
              <NorCelisLogo variant="full" theme="dark" size="sm" className="h-7 w-auto drop-shadow-sm" />
            </div>
            <div className="hidden sm:block text-slate-600">|</div>
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold text-slate-200">NOR CELIS AUTOMOTRIZ S.A.C.</span>
              <span className="mx-1.5 text-slate-600">•</span>
              <span className="font-mono text-slate-300">RUC: 20541982311</span>
              <span className="mx-1.5 text-slate-600">•</span>
              <span>Concesionario &amp; Taller Oficial Multimarca</span>
            </div>
          </div>

          {/* Enlaces y Sellos de Seguridad */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-sm">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span className="font-medium">Certificado SSL 256-Bit</span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sobre Nosotros
            </button>

            <button
              type="button"
              onClick={() => navigateToTerms('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacidad
            </button>

            {/* Acceso para Administrador si está logueado */}
            {user.isLoggedIn && user.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  setIsAdminUnlocked(true);
                  setCurrentView('admin');
                  showToast('Accediendo al Panel de Administración');
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-white border border-amber-500/30 transition-colors cursor-pointer font-semibold rounded-xs"
                title="Acceso autorizado a gestión administrativa"
              >
                <span className="material-symbols-outlined text-[13px]">admin_panel_settings</span>
                <span>Panel Admin</span>
              </button>
            )}

            <span className="text-slate-500">
              © {new Date().getFullYear()} Nor Celis Automotriz. Todos los derechos reservados.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
