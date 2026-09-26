import React from 'react';
import { useApp } from '../context/AppContext';
import { NorCelisLogo } from '../components/NorCelisLogo';

export const AboutView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="min-h-screen py-8 px-gutter">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/70">
          <button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors cursor-pointer">
            Inicio
          </button>
          <span>/</span>
          <span className="text-white font-semibold">Sobre Nosotros &amp; Garantías</span>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary via-[#172242] to-primary text-white p-8 md:p-16 shadow-2xl">
          <div className="max-w-3xl space-y-6 relative z-10">
            <NorCelisLogo variant="full" theme="dark" size="lg" />

            <div className="space-y-3 pt-2">
              <span className="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary-fixed text-xs font-bold uppercase tracking-wider border border-secondary-container/40">
                Más de 24 Años de Trayectoria • Fundada en 2001
              </span>
              <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight leading-tight">
                Ingeniería automotriz de alta precisión y confianza sin concesiones
              </h1>
              <p className="text-surface-container-highest/85 text-sm md:text-base leading-relaxed">
                En <strong>Nor Celis Automotriz</strong> transformamos la experiencia de compra y mantenimiento vehicular en el Perú. Combinamos laboratorios de diagnóstico electrónico láser, técnicos certificados internacionalmente y un compromiso inquebrantable con la originalidad OEM.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setCurrentView('services')}
                className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">car_repair</span>
                Conocer Servicios de Taller
              </button>
              <button
                onClick={() => setCurrentView('locations')}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-colors border border-white/20 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">storefront</span>
                Visitar Concesionario &amp; Taller Cajamarca
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Counter Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { metric: '+35,000', label: 'Vehículos Atendidos', desc: 'En nuestro taller central y showroom en Cajamarca' },
            { metric: '+12,500', label: 'Autos Entregados', desc: 'Nuevos 0km y Seminuevos Certificados' },
            { metric: '99.4%', label: 'Satisfacción Oficial', desc: 'Auditada según estándares ISO 9001' },
            { metric: '100%', label: 'Repuestos OEM', desc: 'Trazabilidad y procedencia certificada' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-surface-container shadow-xs text-center space-y-2 hover:shadow-md transition-shadow"
            >
              <div className="text-3xl md:text-4xl font-headline font-black text-primary">
                {item.metric}
              </div>
              <div className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">
                {item.label}
              </div>
              <div className="text-[11px] text-outline">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* SECTION: 4 Institutional Pillars */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-primary">
              Nuestros 4 Pilares de Excelencia Automotriz
            </h2>
            <p className="text-xs text-outline">
              Cada auto vendido y cada repuesto instalado pasa por rigurosos protocolos de ingeniería y seguridad vial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: 'precision_manufacturing',
                title: '1. Diagnóstico Láser 3D y Homologación OEM',
                desc: 'Contamos con escáneres multimarca de nivel concesionario (Toyota Techstream, Bosch KTS, Launch X431) y alineadoras láser 3D de 4 cabezales sin contacto de aro, garantizando tolerancias milimétricas de fábrica.',
                tag: 'Certificación ISO 9001:2015',
              },
              {
                icon: 'verified_user',
                title: '2. Peritaje de 150 Puntos en Seminuevos',
                desc: 'Ningún vehículo seminuevo ingresa a nuestro showroom sin superar una exhaustiva revisión estructural: comprobación de chasis, compresión de cilindros, historial notarial sin gravámenes y odómetro certificado.',
                tag: 'Garantía Escrita 1 Año',
              },
              {
                icon: 'shield_with_heart',
                title: '3. Repuestos con Garantía Total de Fábrica',
                desc: 'Trabajamos en alianza directa con fabricantes globales: Brembo, Bosch, KYB, Mann-Filter, Denso y Motul. Cero piezas falsificadas o reacondicionadas en nuestros almacenes.',
                tag: '100% Autenticidad',
              },
              {
                icon: 'eco',
                title: '4. Taller Ecoeficiente & Gestión Verde',
                desc: 'Cumplimos con estrictas normativas ambientales peruanas para el reciclaje y disposición certificada de aceites sintéticos, baterías de ácido-plomo y filtros usados.',
                tag: 'Eco-Taller Responsable',
              },
            ].map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 md:p-8 border border-surface-container shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">{p.icon}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary-container/10 text-secondary px-2.5 py-1 rounded-full border border-secondary-container/20">
                      {p.tag}
                    </span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-primary">{p.title}</h3>
                  <p className="text-xs text-outline leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: Technology & Workshop Infrastructure */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-surface-container shadow-xs space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">
              Infraestructura y Equipamiento
            </span>
            <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-primary">
              La tecnología detrás de nuestro servicio técnico
            </h2>
            <p className="text-xs text-outline">
              Instalaciones diseñadas para la precisión quirúrgica de los sistemas automotrices modernos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <img
                src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80"
                alt="Alineación Láser"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=600&q=80";
                }}
                className="w-full h-48 object-cover rounded-2xl bg-surface-container-low"
              />
              <h3 className="font-headline font-bold text-sm text-primary">
                Alineación Láser 3D Computarizada
              </h3>
              <p className="text-xs text-outline">
                Cámaras ópticas de alta definición que miden convergencia, cámber y cáster en tiempo real con compensación de altura dinámica.
              </p>
            </div>

            <div className="space-y-3">
              <img
                src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80"
                alt="Cabina de Pintura"
                className="w-full h-48 object-cover rounded-2xl bg-surface-container-low"
              />
              <h3 className="font-headline font-bold text-sm text-primary">
                Cabinas Presurizadas de Pintura al Horno
              </h3>
              <p className="text-xs text-outline">
                Filtrado de aire al 99.8% libre de partículas, secado infrarrojo de onda corta y espectrofotómetro digital para igualación exacta del color de fábrica.
              </p>
            </div>

            <div className="space-y-3">
              <img
                src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80"
                alt="Diagnóstico de Híbridos"
                className="w-full h-48 object-cover rounded-2xl bg-surface-container-low"
              />
              <h3 className="font-headline font-bold text-sm text-primary">
                Laboratorio para Híbridos y Eléctricos
              </h3>
              <p className="text-xs text-outline">
                Bancos de balanceo de módulos de baterías de alto voltaje (HV), aislación dieléctrica certificada y calibración de radares ADAS.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: Identidad de Marca Oficial */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-surface-container shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
              Manual de Marca Oficial
            </span>
            <h2 className="text-2xl font-headline font-extrabold text-primary">
              Identidad Visual &amp; Aplicaciones Corporativas
            </h2>
            <p className="text-xs text-outline">
              El isotipo representa la precisión del velocímetro/indicador a 90° y la velocidad de respuesta, combinado con la solidez institucional de Nor Celis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            {/* 1. Con Isotipo Oficial */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container flex flex-col items-center justify-between text-center space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-outline">
                1. Con Isotipo Oficial
              </div>
              <div className="py-2 flex items-center justify-center">
                <NorCelisLogo variant="full" theme="light" size="custom" className="h-14 w-auto" />
              </div>
              <p className="text-[11px] text-outline">
                Uso principal en membretes, cabecera web y fachadas principales.
              </p>
            </div>

            {/* 2. Solo Logotipo + Tagline */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container flex flex-col items-center justify-between text-center space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-outline">
                2. Solo Logo + Tagline
              </div>
              <div className="py-2 flex items-center justify-center">
                <NorCelisLogo variant="text-only" theme="light" size="custom" className="h-14 w-auto" />
              </div>
              <p className="text-[11px] text-outline">
                Uso compacto en formatos reducidos y merchandising técnico.
              </p>
            </div>

            {/* 3. Monocromático Marino */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container flex flex-col items-center justify-between text-center space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-outline">
                3. Monocromático Marino
              </div>
              <div className="py-2 flex items-center justify-center">
                <NorCelisLogo variant="full" theme="monochrome-navy" size="custom" className="h-14 w-auto" />
              </div>
              <p className="text-[11px] text-outline">
                Uso en papelería notarial, sellos y contratos Sunarp.
              </p>
            </div>

            {/* 4. Monocromático Blanco sobre fondo Azul Marino */}
            <div className="bg-[#072642] p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-between text-center space-y-4 text-white">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                4. Negativo / Fondo Oscuro
              </div>
              <div className="py-2 flex items-center justify-center">
                <NorCelisLogo variant="full" theme="monochrome-white" size="custom" className="h-14 w-auto" />
              </div>
              <p className="text-[11px] text-slate-400">
                Uso en pie de página, uniformes de mecánicos y fondos oscuros.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION: Engineering Leadership */}
        <div className="bg-surface-container-low rounded-3xl p-8 md:p-12 border border-surface-container space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-headline font-extrabold text-primary">
              Equipo de Dirección e Ingeniería
            </h2>
            <p className="text-xs text-outline">
              Profesionales con amplia trayectoria en las principales terminales automotrices del continente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Ing. Fernando Noriega Celis',
                role: 'Fundador & Gerente General',
                spec: '28 años de experiencia en gestión de concesionarios y postventa',
              },
              {
                name: 'Ing. Renzo Valdivia',
                role: 'Director Técnico de Operaciones',
                spec: 'Certificación Master Technician Toyota & Híbridos VAG',
              },
              {
                name: 'Dra. Patricia Arévalo',
                role: 'Directora Legal & Notarial',
                spec: 'Especialista en transferencias registrales Sunarp y garantías vehiculares',
              },
              {
                name: 'Ing. Marco Antonio Quispe',
                role: 'Jefe de Laboratorio Láser 3D',
                spec: 'Especialista en calibración ADAS, mecatrónica y suspensión de competición',
              },
            ].map((leader, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-surface-container space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {leader.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-primary">{leader.name}</h4>
                  <div className="text-xs font-semibold text-secondary">{leader.role}</div>
                  <p className="text-[11px] text-outline mt-1">{leader.spec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
