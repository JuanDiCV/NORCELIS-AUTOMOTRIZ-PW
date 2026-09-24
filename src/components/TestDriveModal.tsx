import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const TestDriveModal: React.FC = () => {
  const { isTestDriveModalOpen, setIsTestDriveModalOpen, showToast } = useApp();

  const [sede, setSede] = useState('cajamarca');
  const [date, setDate] = useState('2025-03-28');
  const [time, setTime] = useState('10:00');
  const [fullName, setFullName] = useState('Carlos Mendoza');
  const [phone, setPhone] = useState('987654321');
  const [driverLicense, setDriverLicense] = useState('Q45981204');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isTestDriveModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsTestDriveModalOpen(false);
      showToast('¡Tu Test Drive ha sido agendado! Un asesor de Nor Celis te contactará por WhatsApp para confirmar.');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full shadow-2xl border border-surface-container overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-2xl">speed</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg">Agendar Test Drive Exclusivo</h3>
              <p className="text-xs text-surface-container-highest/80">
                Toyota RAV4 2.5L Hybrid Limited AWD 2025
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTestDriveModalOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Benefits bar */}
        <div className="bg-secondary-fixed/30 border-b border-secondary-fixed-dim/40 px-5 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-xs text-secondary-fixed-variant font-medium">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
            Seguro a todo riesgo incluido
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">timer</span>
            Prueba de 45 min en ruta
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Concesionario y Modalidad
            </label>
            <select
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="cajamarca">Concesionario Oficial: AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA</option>
              <option value="domicilio">Test Drive VIP a Domicilio en Cajamarca</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Fecha Preferida
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min="2025-03-24"
                className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Horario
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
              >
                <option value="09:00">09:00 AM - 10:00 AM</option>
                <option value="10:30">10:30 AM - 11:30 AM</option>
                <option value="14:00">02:00 PM - 03:00 PM</option>
                <option value="16:00">04:00 PM - 05:00 PM</option>
                <option value="17:30">05:30 PM - 06:30 PM</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Nombre y Apellidos
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre completo"
                className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                WhatsApp de Contacto
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="987 654 321"
                className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Brevete / Licencia de Conducir
            </label>
            <input
              type="text"
              value={driverLicense}
              onChange={(e) => setDriverLicense(e.target.value)}
              placeholder="Número de licencia de conducir vigente"
              className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary-container hover:bg-secondary text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Confirmando Reserva...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">event_available</span>
                  Confirmar Cita para Test Drive
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
