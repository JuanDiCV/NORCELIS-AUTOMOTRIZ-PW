import React from 'react';
import { useApp } from '../context/AppContext';

export const LocationsView: React.FC = () => {
  const { setCurrentView } = useApp();

  const sede = {
    name: 'Concesionario Oficial & Taller Central Nor Celis',
    category: 'Concesionario y Taller Integral',
    city: 'Cajamarca',
    address: 'AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA',
    reference: 'Frente al eje vial sur / Zona comercial automotriz de Cajamarca',
    phone: '(076) 364-520',
    mobile: '+51 987 654 321',
    whatsapp: '51987654321',
    email: 'contacto@norcelis.pe',
    googleMapsUrl: 'https://maps.google.com/?q=Av.+Via+de+Evitamiento+Sur+6003,+Cajamarca',
    wazeUrl: 'https://waze.com/ul?q=Av.+Via+de+Evitamiento+Sur+6003,+Cajamarca',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    hours: {
      sales: 'Lunes a Sábado: 8:00 AM – 7:00 PM | Domingos: 9:00 AM – 2:00 PM',
      workshop: 'Lunes a Viernes: 7:30 AM – 6:30 PM | Sábados: 8:00 AM – 2:00 PM',
      parts: 'Lunes a Sábado: 8:00 AM – 6:30 PM (Venta en mostrador & despacho provincial)',
    },
    workshopLiveStatus: {
      totalBays: 14,
      busyBays: 9,
      freeBays: 5,
      averageWaitMinutes: 10,
      statusText: 'Disponibilidad Alta',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    facilities: [
      {
        title: 'Showroom de Vehículos Nuevos & Seminuevos',
        desc: 'Exhibición de modelos 0km Toyota, Lexus, BYD y unidades seminuevas multimarca con peritaje de 150 puntos y garantía por escrito.',
        icon: 'directions_car',
      },
      {
        title: 'Taller Mecánico Especializado & Diagnóstico Láser 3D',
        desc: '14 bahías de servicio con elevadores hidráulicos, escáneres OEM, alineación láser computarizada y laboratorio para vehículos híbridos y 4x4.',
        icon: 'car_repair',
      },
      {
        title: 'Almacén Central de Repuestos OEM Homologados',
        desc: 'Más de 12,000 ítems en stock permanente: pastillas cerámicas, discos, filtros, amortiguadores, lubricantes sintéticos y accesorios mineros.',
        icon: 'tune',
      },
      {
        title: 'Módulo de Tasación & Plan Retoma Inmediata',
        desc: 'Evaluación técnica y notarial in situ para recibir tu auto actual como parte de pago con bono de hasta S/ 7,500.',
        icon: 'swap_horiz',
      },
      {
        title: 'Zona VIP & Sala de Espera Clientes',
        desc: 'Espacio climatizado con visualización directa al área de trabajo del taller, cafetería de especialidad y conexión Wi-Fi de alta velocidad.',
        icon: 'coffee',
      },
      {
        title: 'Atención a Flotas Comerciales & Mineras',
        desc: 'Bahías reforzadas para camionetas Hilux, pickups de faena, jaulas antivuelco certificadas y mantenimientos preventivos programados.',
        icon: 'local_shipping',
      },
    ],
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 px-gutter">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-outline">
          <button onClick={() => setCurrentView('home')} className="hover:text-primary transition-colors">
            Inicio
          </button>
          <span>/</span>
          <span className="text-on-surface font-semibold">Sede &amp; Ubicación Oficial</span>
        </nav>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary via-[#172242] to-primary text-white p-8 md:p-12 shadow-xl">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-white text-xs font-bold tracking-wide uppercase shadow-sm">
              <span className="material-symbols-outlined text-sm">location_on</span>
              Concesionario &amp; Taller • Cajamarca
            </div>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight leading-tight">
              Concesionario Oficial &amp; Taller Central
            </h1>
            <p className="text-surface-container-highest/85 text-sm md:text-base leading-relaxed">
              Nuestras instalaciones integradas concentran el Showroom de vehículos 0km y Seminuevos, el Taller Mecánico Multimarca con tecnología láser 3D y el Almacén Central de Repuestos OEM para toda la región.
            </p>
            <div className="flex items-center gap-2 font-mono text-xs text-amber-300 bg-black/30 w-fit px-3 py-1.5 rounded-lg border border-amber-300/30">
              <span className="material-symbols-outlined text-sm">pin_drop</span>
              <span className="font-bold tracking-wider">AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA</span>
            </div>
          </div>
        </div>

        {/* Main Location Master Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Detailed Information (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-surface-container shadow-xs space-y-6">
            {/* Header / Badges */}
            <div className="space-y-2 border-b border-surface-container pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {sede.category}
                </span>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${sede.workshopLiveStatus.statusColor}`}>
                  {sede.workshopLiveStatus.statusText} • {sede.workshopLiveStatus.freeBays} Bahías Libres
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-headline font-black text-primary">
                {sede.name}
              </h2>
              <div className="flex items-start gap-2 text-xs text-on-surface pt-1">
                <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">place</span>
                <div>
                  <strong className="text-sm font-semibold">{sede.address}</strong>
                  <span className="text-outline block text-[11px]">{sede.reference} • Cajamarca, Perú</span>
                </div>
              </div>
            </div>

            {/* Live Workshop Status */}
            <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-primary">
                    Ocupación del Taller en Tiempo Real (Cajamarca)
                  </span>
                </div>
                <span className="text-[10px] text-outline font-mono">Actualizado hace 2 min</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-surface-container">
                  <div className="text-2xl md:text-3xl font-headline font-black text-primary">
                    {sede.workshopLiveStatus.freeBays}
                  </div>
                  <div className="text-[11px] text-outline">Bahías Disponibles</div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-surface-container">
                  <div className="text-2xl md:text-3xl font-headline font-black text-on-surface">
                    {sede.workshopLiveStatus.busyBays}
                  </div>
                  <div className="text-[11px] text-outline">En Mantenimiento</div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-surface-container">
                  <div className="text-2xl md:text-3xl font-headline font-black text-secondary">
                    ~{sede.workshopLiveStatus.averageWaitMinutes}m
                  </div>
                  <div className="text-[11px] text-outline">Espera en Recepción</div>
                </div>
              </div>
            </div>

            {/* Schedules */}
            <div className="space-y-3">
              <h3 className="text-xs font-headline font-bold text-primary uppercase tracking-wider">
                Horarios de Atención en Cajamarca
              </h3>
              <div className="space-y-2 text-xs bg-surface-container-lowest p-4 rounded-2xl border border-surface-container">
                <div className="flex items-start gap-2.5 pb-2 border-b border-surface-container/60">
                  <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">directions_car</span>
                  <div className="flex-1">
                    <strong className="text-on-surface block font-bold">Ventas &amp; Showroom (0km / Seminuevos):</strong>
                    <span className="text-outline">{sede.hours.sales}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 pb-2 border-b border-surface-container/60">
                  <span className="material-symbols-outlined text-secondary text-base shrink-0 mt-0.5">car_repair</span>
                  <div className="flex-1">
                    <strong className="text-on-surface block font-bold">Taller Mecánico &amp; Diagnóstico 3D:</strong>
                    <span className="text-outline">{sede.hours.workshop}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">tune</span>
                  <div className="flex-1">
                    <strong className="text-on-surface block font-bold">Almacén Central de Repuestos OEM &amp; Despachos:</strong>
                    <span className="text-outline">{sede.hours.parts}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <a
                href={sede.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-container text-white py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-base">map</span>
                Abrir en Google Maps
              </a>

              <a
                href={sede.wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#33ccff]/20 hover:bg-[#33ccff]/30 text-[#006699] py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-[#33ccff]/40 transition-colors"
              >
                <span className="material-symbols-outlined text-base">navigation</span>
                Navegar con Waze
              </a>

              <a
                href={`https://wa.me/${sede.whatsapp}?text=Hola%20Nor%20Celis%20Cajamarca,%20quisiera%20consultar%20sobre%20atenci%C3%B3n%20en%20la%20Sede%20Av.%20V%C3%ADa%20de%20Evitamiento%20Sur%206003`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                WhatsApp Sede
              </a>
            </div>
          </div>

          {/* Location Visual & Direct Contact (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Building / Facility Photo */}
            <div className="relative rounded-3xl overflow-hidden h-72 bg-surface-container-low border border-surface-container shadow-xs group">
              <img
                src={sede.image}
                alt={sede.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary px-2.5 py-0.5 rounded shadow-sm">
                  Cajamarca • Instalaciones Centrales
                </span>
                <h3 className="text-lg font-headline font-bold">{sede.address}</h3>
                <p className="text-xs text-white/80">Cajamarca, Perú</p>
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-xs space-y-4">
              <h3 className="text-xs font-headline font-bold text-primary uppercase tracking-wider border-b border-surface-container pb-2">
                Canales Telefónicos y de Contacto
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-base">call</span>
                    <div>
                      <span className="text-outline text-[10px] block">Central Telefónica Cajamarca</span>
                      <strong className="text-on-surface font-mono">{sede.phone}</strong>
                    </div>
                  </div>
                  <a
                    href={`tel:${sede.phone}`}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    Llamar
                  </a>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600 text-base">smartphone</span>
                    <div>
                      <span className="text-outline text-[10px] block">Móvil &amp; Asesoría WhatsApp</span>
                      <strong className="text-on-surface font-mono">{sede.mobile}</strong>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${sede.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-600 hover:underline"
                  >
                    Escribir
                  </a>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-secondary text-base">mail</span>
                    <div>
                      <span className="text-outline text-[10px] block">Correo Electrónico Oficial</span>
                      <strong className="text-on-surface font-mono">{sede.email}</strong>
                    </div>
                  </div>
                  <a
                    href={`mailto:${sede.email}`}
                    className="text-[11px] font-bold text-secondary hover:underline"
                  >
                    Enviar
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('services')}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Agendar Cita de Taller en Cajamarca
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Complete Sede Facilities Breakdown */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-surface-container shadow-xs space-y-6">
          <div className="border-b border-surface-container pb-4">
            <h2 className="text-xl md:text-2xl font-headline font-bold text-primary">
              Infraestructura y Áreas Integrales en Sede Cajamarca
            </h2>
            <p className="text-xs text-outline">
              Todo el ciclo vehicular en un solo complejo automotriz: adquisición, postventa técnica, repuestos originales y retoma.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sede.facilities.map((fac, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container hover:border-primary/40 hover:shadow-xs transition-all space-y-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">{fac.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-sm text-primary">{fac.title}</h3>
                <p className="text-xs text-outline leading-relaxed">{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
