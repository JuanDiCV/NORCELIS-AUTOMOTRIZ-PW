import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const ServicesView: React.FC = () => {
  const { services, addToCart, showToast } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'mecanica' | 'estetica' | 'seguridad'>('all');

  // Appointment scheduler state
  const [selectedService, setSelectedService] = useState('srv-ceramico');
  const [selectedSede, setSelectedSede] = useState('cajamarca');
  const [appointmentDate, setAppointmentDate] = useState('2025-03-27');
  const [appointmentTime, setAppointmentTime] = useState('09:30');
  const [clientPlate, setClientPlate] = useState('ABC-123');
  const [clientName, setClientName] = useState('Carlos Mendoza');
  const [clientPhone, setClientPhone] = useState('987654321');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredServices = services.filter((s) => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false;
    return true;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceObj = services.find((s) => s.id === selectedService) || services[0];
    addToCart({
      type: 'service',
      title: serviceObj.name,
      skuOrCode: serviceObj.id.toUpperCase(),
      priceSoles: serviceObj.priceStartingSoles,
      image: serviceObj.image,
      specsSubtitle: `Cita: ${appointmentDate} ${appointmentTime} • Taller: AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA • Placa: ${clientPlate}`,
    });
    showToast(`¡Cita agendada para ${serviceObj.name}! Se agregó al carrito para confirmar reserva.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-gutter py-6 space-y-10">
      {/* Hero Section (Screen 6 spec) */}
      <section className="bg-primary text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-primary-container relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-4">
            <span className="bg-secondary-container text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Centro Técnico de Alta Ingeniería
            </span>
            <h1 className="font-headline font-extrabold text-2xl sm:text-4xl text-white leading-tight">
              Taller Mecánico Especializado &amp; Car Care Premium
            </h1>
            <p className="text-xs sm:text-sm text-surface-container-highest/80 leading-relaxed max-w-xl">
              Equipamiento con tecnología alemana e italiana, alineamiento láser 3D sin contacto en llantas, cabina presurizada de detailing y certificación de fábrica en cada procedimiento.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
                <span className="font-headline font-extrabold text-xl text-secondary-fixed block">8</span>
                <span className="text-[11px] text-surface-container-highest/70">Bahías Activas</span>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
                <span className="font-headline font-extrabold text-xl text-secondary-fixed block">15+</span>
                <span className="text-[11px] text-surface-container-highest/70">Años Experiencia</span>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
                <span className="font-headline font-extrabold text-xl text-secondary-fixed block">99.4%</span>
                <span className="text-[11px] text-surface-container-highest/70">Satisfacción</span>
              </div>
            </div>
          </div>

          {/* Quick Cotizador Card */}
          <div className="lg:col-span-5 bg-surface-container-lowest text-on-surface rounded-3xl p-6 shadow-2xl border border-surface-container space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary-container">build_circle</span>
                Cotizador Express de Taller
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Precios Transparentes
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Selecciona el Servicio
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 font-semibold focus:outline-none focus:border-primary"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Desde S/ {s.priceStartingSoles}{s.priceUnitText || ''})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-on-surface mb-1">
                    Concesionario &amp; Taller
                  </label>
                  <select
                    value={selectedSede}
                    onChange={(e) => setSelectedSede(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 font-semibold focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="cajamarca">AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">
                    Placa
                  </label>
                  <input
                    type="text"
                    value={clientPlate}
                    onChange={(e) => setClientPlate(e.target.value.toUpperCase())}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 font-bold uppercase focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <a
                href="#agendar-form"
                className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer block text-center"
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                <span>Agendar Cita en Menos de 2 Minutos</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-secondary-container">verified</span>
          <div>
            <div className="text-xs font-bold text-primary">Garantía Escrita</div>
            <div className="text-[11px] text-outline">Hasta 3 años de durabilidad</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-secondary-container">engineering</span>
          <div>
            <div className="text-xs font-bold text-primary">Técnicos Certificados</div>
            <div className="text-[11px] text-outline">Entrenados por OEMs oficiales</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-secondary-container">straighten</span>
          <div>
            <div className="text-xs font-bold text-primary">Medición Láser 3D</div>
            <div className="text-[11px] text-outline">Precisión milimétrica</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-secondary-container">videocam</span>
          <div>
            <div className="text-xs font-bold text-primary">Monitoreo en Vivo</div>
            <div className="text-[11px] text-outline">Seguimiento por cámara de tu auto</div>
          </div>
        </div>
      </section>

      {/* Category Pills Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container pb-4">
        <div>
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            Nuestros 8 Servicios Especializados
          </span>
          <h2 className="font-headline font-bold text-2xl text-on-surface">
            Catálogo de Servicios y Car Care
          </h2>
        </div>

        <div className="flex bg-surface-container-low p-1 rounded-2xl border border-surface-container text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeCategory === 'all' ? 'bg-primary text-white font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            Todos (8)
          </button>
          <button
            onClick={() => setActiveCategory('mecanica')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeCategory === 'mecanica' ? 'bg-primary text-white font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            Mecánica &amp; Enllantado
          </button>
          <button
            onClick={() => setActiveCategory('estetica')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeCategory === 'estetica' ? 'bg-primary text-white font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            Detailing &amp; Confort
          </button>
          <button
            onClick={() => setActiveCategory('seguridad')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeCategory === 'seguridad' ? 'bg-primary text-white font-bold' : 'text-outline hover:text-on-surface'
            }`}
          >
            Seguridad &amp; Blindaje
          </button>
        </div>
      </div>

      {/* 8 Services Grid (Screen 6 spec) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-surface-container-lowest rounded-3xl border border-surface-container hover:border-primary/40 hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
          >
            {/* Photo & Badge */}
            <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden">
              <img
                src={srv.image}
                alt={srv.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow-sm">
                {srv.badge}
              </span>
              <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded">
                ⏱ {srv.estimatedDuration}
              </span>
            </div>

            {/* Info */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {srv.categoryLabel}
                </span>
                <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors mt-0.5 leading-snug">
                  {srv.name}
                </h3>
                <p className="text-xs text-outline leading-relaxed mt-2 line-clamp-3">
                  {srv.description}
                </p>

                {/* Features */}
                <ul className="mt-3 space-y-1 text-[11px] text-on-surface-variant font-medium">
                  {srv.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-emerald-600">check</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price & Book CTA */}
              <div className="border-t border-surface-container pt-3">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-xs text-outline">Precio Inicial:</span>
                  <div className="text-right">
                    <span className="font-headline font-extrabold text-lg text-primary">
                      S/ {srv.priceStartingSoles.toLocaleString()}
                    </span>
                    {srv.priceUnitText && (
                      <span className="text-xs text-outline ml-0.5">{srv.priceUnitText}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedService(srv.id);
                      addToCart({
                        type: 'service',
                        title: srv.name,
                        skuOrCode: srv.id.toUpperCase(),
                        priceSoles: srv.priceStartingSoles,
                        image: srv.image,
                        specsSubtitle: `Servicio en Taller Nor Celis (AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA) • Duración: ${srv.estimatedDuration}`,
                      });
                    }}
                    className="w-full bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">calendar_add_on</span>
                    <span>Reservar Servicio</span>
                  </button>

                  <a
                    href={`https://wa.me/51987654321?text=Hola,%20quisiera%20cotizar%20el%20servicio%20${encodeURIComponent(srv.name)}%20para%20mi%20auto`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-surface-container hover:bg-surface-container-high text-primary py-2 rounded-xl font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">chat</span>
                    <span>Consultar por WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment Scheduling Form (Screen 6 spec) */}
      <section id="agendar-form" className="bg-surface-container-lowest rounded-3xl border border-surface-container p-6 sm:p-10 shadow-lg">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Reserva Inmediata en Línea
            </span>
            <h3 className="font-headline font-extrabold text-2xl sm:text-3xl text-primary">
              Agenda tu Turno en Menos de 2 Minutos
            </h3>
            <p className="text-xs text-outline">
              Atención directa en nuestro taller oficial en Cajamarca, confirma tu servicio en fecha y hora preferida.
            </p>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  1. Concesionario &amp; Taller Nor Celis
                </label>
                <select
                  value={selectedSede}
                  onChange={(e) => setSelectedSede(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-primary"
                >
                  <option value="cajamarca">AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  2. Servicio Requerido
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-primary"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} - Desde S/ {s.priceStartingSoles}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  3. Placa del Vehículo
                </label>
                <input
                  type="text"
                  value={clientPlate}
                  onChange={(e) => setClientPlate(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC-123"
                  maxLength={8}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-bold uppercase focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  4. Fecha de Cita
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min="2025-03-24"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  5. Horario
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-primary"
                >
                  <option value="08:30">08:30 AM (Turno Mañana)</option>
                  <option value="09:30">09:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">02:00 PM (Turno Tarde)</option>
                  <option value="15:30">03:30 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Nombre del Propietario
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Carlos Mendoza"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  WhatsApp para Confirmación
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="987 654 321"
                  className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-secondary-container hover:bg-secondary text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">event_available</span>
                <span>Confirmar Cita &amp; Añadir a Carrito</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Workshop FAQ Accordion (Screen 6 spec) */}
      <section className="bg-surface-container-lowest rounded-3xl border border-surface-container p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 border-b border-surface-container pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-secondary-container flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-2xl">help</span>
          </div>
          <div>
            <h4 className="font-headline font-bold text-lg text-primary">
              Preguntas Frecuentes del Taller Especializado
            </h4>
            <p className="text-xs text-outline">
              Respuestas oficiales avaladas por el Jefe de Taller Ing. Fernando Vidal
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              q: '¿Por qué el enllantado computarizado no raya mis aros de aleación?',
              a: 'Utilizamos desmontadoras automáticas de plato neumático con uñas de teflón sin contacto metálico directo con el labio del aro. Garantizamos cero rozaduras incluso en aros diamantados de 18 a 22 pulgadas.',
            },
            {
              q: '¿Cuánto dura el tratamiento cerámico 9H y qué cuidados requiere?',
              a: 'La nanocerámica 9H tiene una durabilidad certificada de 1 a 3 años según el plan seleccionado. Para conservarlo, solo requiere lavados con shampoo de pH neutro y un booster de recubrimiento anual sin pulir.',
            },
            {
              q: '¿Las láminas de seguridad polarizadas cumplen con la normativa del MTC y PNP?',
              a: 'Sí, todas nuestras películas de polarizado nanocerámico cuentan con homologación oficial y entregamos el certificado de transmitancia luminosa correspondiente para la tramitación de tu permiso de lunas oscurecidas.',
            },
            {
              q: '¿Puedo esperar en el concesionario mientras realizan el servicio?',
              a: 'Por supuesto. Disponemos de salas VIP climatizadas con WiFi de alta velocidad, café de cortesía y monitores con vista en directo a las bahías de trabajo para ver el avance de tu auto en tiempo real.',
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="border border-surface-container rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left font-bold text-xs text-on-surface flex items-center justify-between hover:bg-surface-container-low transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`material-symbols-outlined text-lg text-primary transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>
                  keyboard_arrow_down
                </span>
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 pt-1 text-xs text-outline leading-relaxed border-t border-surface-container-low bg-surface-container-low/30">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
