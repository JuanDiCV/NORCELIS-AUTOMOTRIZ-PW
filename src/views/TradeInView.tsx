import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VEHICLES_DATA } from '../data/mockData';

export const TradeInView: React.FC = () => {
  const { setCurrentView, setSelectedVehicleId, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Car Info
  const [brand, setBrand] = useState('Toyota');
  const [model, setModel] = useState('Corolla');
  const [year, setYear] = useState('2020');
  const [mileage, setMileage] = useState('45000');
  const [plate, setPlate] = useState('BXY-482');
  const [transmission, setTransmission] = useState<'Automática' | 'Mecánica'>('Automática');
  const [fuelType, setFuelType] = useState('Gasolina');
  const [bodyState, setBodyState] = useState<'Excelente' | 'Bueno' | 'Detalles Leves'>('Excelente');
  const [mechanicalState, setMechanicalState] = useState<'Óptimo' | 'Mantenimiento Pendiente'>('Óptimo');
  const [maintenanceHistory, setMaintenanceHistory] = useState<'Concesionario Oficial' | 'Taller Particular' | 'Mixto'>('Concesionario Oficial');
  const [accidentFree, setAccidentFree] = useState(true);

  // Step 2: Vehicle to buy
  const [selectedTargetVehicleId, setSelectedTargetVehicleId] = useState(VEHICLES_DATA[0].id);

  // Step 3: Inspection appointment
  const [photosUploaded, setPhotosUploaded] = useState<Record<string, boolean>>({
    frontal: true,
    lateral: true,
    posterior: false,
    tablero: true,
    motor: false,
  });
  const [inspectionType, setInspectionType] = useState<'concesionario' | 'domicilio'>('concesionario');
  const [selectedBranch, setSelectedBranch] = useState('AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA');
  const [inspectionDate, setInspectionDate] = useState('2025-10-15');
  const [inspectionTime, setInspectionTime] = useState('10:30 AM');
  const [clientName, setClientName] = useState('Carlos Mendoza');
  const [clientPhone, setClientPhone] = useState('987654321');
  const [clientDni, setClientDni] = useState('45892104');
  const [address, setAddress] = useState('Av. Vía de Evitamiento Sur 6003, Cajamarca');

  // Completed code modal / state
  const [retomaCode, setRetomaCode] = useState<string | null>(null);

  // Dynamic Valuation calculation
  const calculateValuation = () => {
    const baseValue = 58000;
    const yearDiff = (2025 - parseInt(year || '2020')) * 2800;
    const kmFactor = (parseInt(mileage || '45000') / 10000) * 850;
    let computed = baseValue - yearDiff - kmFactor;
    if (brand === 'Toyota' || brand === 'Honda') computed += 3500;
    if (bodyState === 'Excelente') computed += 1800;
    if (maintenanceHistory === 'Concesionario Oficial') computed += 2200;
    if (accidentFree) computed += 1500;

    const marketValue = Math.max(30000, Math.round(computed / 500) * 500);
    const bonusNorCelis = 5500; // Guaranteed trade-in bonus
    const totalTradeInOffer = marketValue + bonusNorCelis;

    return { marketValue, bonusNorCelis, totalTradeInOffer };
  };

  const valuation = calculateValuation();
  const targetVehicle = VEHICLES_DATA.find((v) => v.id === selectedTargetVehicleId) || VEHICLES_DATA[0];
  const balanceToPay = Math.max(0, targetVehicle.priceSoles - valuation.totalTradeInOffer);

  const togglePhoto = (key: string) => {
    setPhotosUploaded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    showToast(`Foto ${photosUploaded[key] ? 'eliminada' : 'cargada con éxito'}`);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `RETOMA-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    setRetomaCode(code);
    showToast(`¡Solicitud aprobada con éxito! Código ${code}`);
  };

  return (
    <div className="min-h-screen py-8 px-gutter">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/70">
          <button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors cursor-pointer">
            Inicio
          </button>
          <span>/</span>
          <span className="text-white font-semibold">Plan Retoma &amp; Tasación Online</span>
        </nav>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary via-primary-container to-primary text-white p-8 md:p-12 shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold tracking-wide uppercase shadow-sm">
              <span className="material-symbols-outlined text-sm">verified</span>
              Bono Retoma Exclusivo hasta S/ 7,500
            </div>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight leading-tight">
              Deja tu auto actual como parte de pago y estrena tu nuevo vehículo hoy
            </h1>
            <p className="text-surface-container-highest/85 text-sm md:text-base leading-relaxed">
              Tasamos tu vehículo multimarca con algoritmos de valor de mercado real, peritaje certificado en 150 puntos y garantía de transferencia notarial 100% segura a nombre de Nor Celis Automotriz.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/15">
              <div>
                <div className="text-2xl font-black text-secondary-fixed">30 Min</div>
                <div className="text-xs text-white/70">Tasación Online Rápida</div>
              </div>
              <div>
                <div className="text-2xl font-black text-secondary-fixed">+S/ 7,500</div>
                <div className="text-xs text-white/70">Bono de Sobre-Tasación</div>
              </div>
              <div>
                <div className="text-2xl font-black text-secondary-fixed">0 Trámites</div>
                <div className="text-xs text-white/70">Gestión Notarial Gratuita</div>
              </div>
              <div>
                <div className="text-2xl font-black text-secondary-fixed">100% Multimarca</div>
                <div className="text-xs text-white/70">Aceptamos Cualquier Marca</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stepper Navigation */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-surface-container flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { num: 1, title: '1. Datos de tu Auto Actual', desc: 'Marca, año, km y estado' },
            { num: 2, title: '2. Valoración & Auto a Llevar', desc: 'Bono Nor Celis y saldo' },
            { num: 3, title: '3. Peritaje & Cierre', desc: 'Sede o a domicilio' },
          ].map((item) => (
            <button
              key={item.num}
              onClick={() => setStep(item.num as any)}
              className={`flex-1 min-w-[200px] flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                step === item.num
                  ? 'bg-primary text-white shadow-md'
                  : step > item.num
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  step === item.num
                    ? 'bg-secondary text-white'
                    : step > item.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-surface-container text-outline'
                }`}
              >
                {step > item.num ? (
                  <span className="material-symbols-outlined text-lg">check</span>
                ) : (
                  item.num
                )}
              </div>
              <div>
                <div className="font-bold text-xs">{item.title}</div>
                <div className={`text-[11px] ${step === item.num ? 'text-white/80' : 'text-outline'}`}>
                  {item.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Modal of Success Code if finished */}
        {retomaCode && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-surface-container space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-extrabold text-primary">
                  ¡Cita de Peritaje Reservada!
                </h3>
                <p className="text-xs text-outline">
                  Tu bono de retoma de <strong className="text-primary">S/ {valuation.bonusNorCelis.toLocaleString()}</strong> y la cotización referencial de tu vehículo han quedado asegurados.
                </p>
              </div>

              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-outline">Código Único:</span>
                  <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">
                    {retomaCode}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-outline">Valor Estimado Retoma:</span>
                  <span className="font-bold text-emerald-700">
                    S/ {valuation.totalTradeInOffer.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-outline">Vehículo a Llevar:</span>
                  <span className="font-bold text-on-surface truncate max-w-[200px]">
                    {targetVehicle.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-outline">Modalidad:</span>
                  <span className="font-medium text-on-surface">
                    {inspectionType === 'concesionario' ? selectedBranch : 'A Domicilio'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-outline">Fecha &amp; Hora:</span>
                  <span className="font-medium text-on-surface">{inspectionDate} a las {inspectionTime}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <a
                  href={`https://wa.me/51987654321?text=Hola%20Nor%20Celis,%20tengo%20el%20codigo%20de%20retoma%20${retomaCode}%20para%20tasar%20mi%20${brand}%20${model}%20${year}%20por%20S/%20${valuation.totalTradeInOffer}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-lg">chat</span>
                  Validar Código por WhatsApp con Tasador Jefe
                </a>
                <button
                  onClick={() => {
                    setRetomaCode(null);
                    setCurrentView('cars');
                  }}
                  className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
                >
                  Explorar Catálogo de Nuevos Autos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Current Car Info */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-surface-container shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-surface-container pb-4">
                <span className="material-symbols-outlined text-primary text-2xl">drive_eta</span>
                <div>
                  <h2 className="text-xl font-headline font-bold text-primary">
                    Paso 1: Información Detallada de tu Auto Actual
                  </h2>
                  <p className="text-xs text-outline">
                    Completa los datos técnicos para estimar el valor algorítmico de mercado
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Marca</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Toyota">Toyota</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Kia">Kia</option>
                    <option value="Honda">Honda</option>
                    <option value="Mazda">Mazda</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="Ford">Ford</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Mitsubishi">Mitsubishi</option>
                    <option value="Otra">Otra Marca</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Modelo Exacto</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ej: Corolla XLi 1.8"
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Año de Fabricación</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010].map(
                      (y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Kilometraje Actual</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none pr-10"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-bold text-outline">KM</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Placa Vehicular</label>
                  <input
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder="ABC-123"
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest uppercase focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Transmisión</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Automática', 'Mecánica'] as const).map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTransmission(t)}
                        className={`py-2 text-xs rounded-xl font-bold border transition-colors ${
                          transmission === t
                            ? 'bg-primary text-white border-primary'
                            : 'bg-surface-container-low text-outline border-surface-container'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* State & History */}
              <div className="border-t border-surface-container pt-6 space-y-4">
                <h3 className="text-sm font-headline font-bold text-primary">Estado y Mantenimientos</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Estado de Carrocería</label>
                    <select
                      value={bodyState}
                      onChange={(e) => setBodyState(e.target.value as any)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="Excelente">Excelente (Pintura original sin raspones)</option>
                      <option value="Bueno">Bueno (Detalles menores de uso)</option>
                      <option value="Detalles Leves">Detalles Leves (Requiere repintado de paño)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Estado Mecánico / Motor</label>
                    <select
                      value={mechanicalState}
                      onChange={(e) => setMechanicalState(e.target.value as any)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="Óptimo">Óptimo (Sin fugas, compresión al 100%)</option>
                      <option value="Mantenimiento Pendiente">Requiere mantenimiento o cambio de fluidos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Récord de Mantenimiento</label>
                    <select
                      value={maintenanceHistory}
                      onChange={(e) => setMaintenanceHistory(e.target.value as any)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="Concesionario Oficial">100% En Concesionario Oficial</option>
                      <option value="Mixto">Mixto (Concesionario y taller particular)</option>
                      <option value="Taller Particular">Taller Particular Certificado</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                  <input
                    type="checkbox"
                    id="accident"
                    checked={accidentFree}
                    onChange={(e) => setAccidentFree(e.target.checked)}
                    className="w-5 h-5 text-primary rounded accent-primary cursor-pointer"
                  />
                  <label htmlFor="accident" className="text-xs text-on-surface cursor-pointer">
                    <strong className="block font-bold">Vehículo Libre de Siniestros Estructurales</strong>
                    Declaro que el vehículo no cuenta con activación de airbags ni afectación de largueros/chasis.
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md hover:scale-[1.02]"
                >
                  <span>Continuar a Valoración &amp; Auto Nuevo</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Valuation Sidebar Live Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-outline uppercase tracking-wider">
                    Valoración Preliminar
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    En Vivo
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-outline">Valor de Mercado:</span>
                    <span className="font-bold text-on-surface">S/ {valuation.marketValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-secondary font-bold bg-secondary/10 p-2.5 rounded-xl border border-secondary/20">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">card_giftcard</span>
                      <span>Bono Retoma Nor Celis:</span>
                    </div>
                    <span>+S/ {valuation.bonusNorCelis.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-surface-container pt-3">
                    <div className="text-[11px] text-outline">Oferta Total Retoma:</div>
                    <div className="text-3xl font-headline font-black text-primary">
                      S/ {valuation.totalTradeInOffer.toLocaleString()}
                    </div>
                    <p className="text-[10px] text-outline mt-1">
                      *Monto sujeto a validación física durante el peritaje técnico de 150 puntos.
                    </p>
                  </div>
                </div>

                <div className="bg-surface-container-low p-3 rounded-xl space-y-1.5 text-[11px] text-outline border border-surface-container">
                  <div className="flex items-center gap-1.5 text-on-surface font-semibold">
                    <span className="material-symbols-outlined text-emerald-600 text-sm">shield</span>
                    Garantías Nor Celis
                  </div>
                  <div>• Pago inmediato en cuenta bancaria o abono directo a tu nuevo vehículo.</div>
                  <div>• Levantamiento de prenda y trámites notariales 100% asumidos por Nor Celis.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Selection of New Vehicle & Gap Analysis */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-surface-container shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-surface-container pb-4">
                  <div>
                    <h2 className="text-xl font-headline font-bold text-primary">
                      Paso 2: Elige el Vehículo al que Aplicarás tu Retoma
                    </h2>
                    <p className="text-xs text-outline">
                      Tu oferta de <strong className="text-primary">S/ {valuation.totalTradeInOffer.toLocaleString()}</strong> se descontará directamente del precio de lista.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Editar mi auto
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {VEHICLES_DATA.map((veh) => {
                    const isSelected = veh.id === selectedTargetVehicleId;
                    const diff = Math.max(0, veh.priceSoles - valuation.totalTradeInOffer);
                    return (
                      <div
                        key={veh.id}
                        onClick={() => setSelectedTargetVehicleId(veh.id)}
                        className={`rounded-2xl p-4 border-2 transition-all cursor-pointer space-y-3 relative ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                            : 'border-surface-container bg-surface-container-lowest hover:border-outline'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">check</span> Seleccionado
                          </div>
                        )}
                        <img
                          src={veh.image}
                          alt={veh.name}
                          className="w-full h-36 object-contain rounded-xl bg-white p-2"
                        />
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-outline">
                            {veh.condition.toUpperCase()} • {veh.year}
                          </div>
                          <h4 className="font-headline font-bold text-sm text-primary line-clamp-1">
                            {veh.name}
                          </h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-extrabold text-on-surface">
                              S/ {veh.priceSoles.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-outline">(${veh.priceUsd.toLocaleString()})</span>
                          </div>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-surface-container text-xs">
                          <div className="flex justify-between items-center text-outline text-[11px]">
                            <span>Saldo a Financiar / Pagar:</span>
                            <span className="font-black text-secondary text-sm">
                              S/ {diff.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-outline hover:text-primary px-4 py-2"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="bg-primary hover:bg-primary-container text-white px-8 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md hover:scale-[1.02]"
                  >
                    <span>Continuar a Peritaje &amp; Cierre</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Gap Summary Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-xs space-y-4">
                <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider">
                  Resumen de la Transacción
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-outline">
                    <span>Precio Vehículo Seleccionado:</span>
                    <span className="font-bold text-on-surface">
                      S/ {targetVehicle.priceSoles.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>- Valor de tu Auto Actual:</span>
                    <span>-S/ {valuation.marketValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-secondary font-bold bg-secondary/10 p-2 rounded-lg">
                    <span>- Bono Retoma Nor Celis:</span>
                    <span>-S/ {valuation.bonusNorCelis.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-surface-container pt-3">
                    <div className="text-xs font-semibold text-outline">Diferencia Neta a Pagar:</div>
                    <div className="text-3xl font-headline font-black text-primary">
                      S/ {balanceToPay.toLocaleString()}
                    </div>
                    <div className="text-xs text-outline mt-1">
                      O financiable desde <strong className="text-primary font-bold">S/ {Math.round(balanceToPay / 48 * 1.15).toLocaleString()}/mes</strong> a 48 meses.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedVehicleId(targetVehicle.id);
                    setCurrentView('vehicle-pdp');
                  }}
                  className="w-full bg-surface-container-low hover:bg-surface-container text-primary font-bold py-2 rounded-xl text-xs transition-colors border border-surface-container"
                >
                  Ver Ficha Técnica de {targetVehicle.name.split(' ')[0]} {targetVehicle.name.split(' ')[1]}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Photos & Inspection Scheduling */}
        {step === 3 && (
          <form onSubmit={handleFinish} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-surface-container shadow-xs space-y-6">
              <div className="flex items-center gap-2 border-b border-surface-container pb-4">
                <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                <div>
                  <h2 className="text-xl font-headline font-bold text-primary">
                    Paso 3: Subida de Fotos &amp; Reserva de Peritaje Técnico
                  </h2>
                  <p className="text-xs text-outline">
                    Para formalizar tu bono, sube fotos referenciales y elige dónde y cuándo deseas que revisemos tu auto.
                  </p>
                </div>
              </div>

              {/* Photos upload mock */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-on-surface">
                    Fotos de Inspección Preliminar (Haz clic para cargar/simular)
                  </label>
                  <span className="text-[11px] text-outline">
                    {Object.values(photosUploaded).filter(Boolean).length} de 5 cargadas
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { id: 'frontal', label: '1. Frontal', icon: 'directions_car' },
                    { id: 'lateral', label: '2. Lateral', icon: 'side_navigation' },
                    { id: 'posterior', label: '3. Posterior', icon: 'car_repair' },
                    { id: 'tablero', label: '4. Odómetro', icon: 'speed' },
                    { id: 'motor', label: '5. Compartimento', icon: 'engineering' },
                  ].map((p) => {
                    const isUp = photosUploaded[p.id];
                    return (
                      <div
                        key={p.id}
                        onClick={() => togglePhoto(p.id)}
                        className={`border-2 border-dashed rounded-2xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[110px] ${
                          isUp
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-surface-container hover:border-primary text-outline bg-surface-container-low'
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl mb-1">
                          {isUp ? 'check_circle' : p.icon}
                        </span>
                        <span className="text-[11px] font-bold">{p.label}</span>
                        <span className="text-[9px] mt-0.5">
                          {isUp ? 'Cargada ✓' : 'Subir foto'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inspection Modality */}
              <div className="space-y-3 border-t border-surface-container pt-6">
                <label className="text-xs font-bold text-on-surface">
                  Modalidad de Peritaje Técnico
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setInspectionType('concesionario')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      inspectionType === 'concesionario'
                        ? 'border-primary bg-primary/5 shadow-xs'
                        : 'border-surface-container hover:border-outline'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-primary mb-1">
                      <span className="material-symbols-outlined text-lg">store</span>
                      En Concesionario &amp; Taller Nor Celis
                    </div>
                    <p className="text-[11px] text-outline">
                      Acércate con tu auto a nuestro complejo en AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA con café de cortesía y peritaje en elevador hidráulico.
                    </p>
                  </div>

                  <div
                    onClick={() => setInspectionType('domicilio')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      inspectionType === 'domicilio'
                        ? 'border-secondary bg-secondary/5 shadow-xs'
                        : 'border-surface-container hover:border-outline'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-secondary mb-1">
                      <span className="material-symbols-outlined text-lg">home_pin</span>
                      A Domicilio / Oficina (VIP Gratuito)
                    </div>
                    <p className="text-[11px] text-outline">
                      Un perito oficial con equipo portátil de escaneo láser visita tu domicilio en Cajamarca sin costo alguno.
                    </p>
                  </div>
                </div>
              </div>

              {/* Branch / Address */}
              {inspectionType === 'concesionario' ? (
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Concesionario y Taller Nor Celis</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA">
                      Concesionario &amp; Taller: AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA
                    </option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Dirección de Visita</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ej: Urb. Toribio Casanova, Cajamarca"
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Fecha Deseada</label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Turno Horario</label>
                  <select
                    value={inspectionTime}
                    onChange={(e) => setInspectionTime(e.target.value)}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="09:00 AM">09:00 AM (Primer turno mañana)</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="03:00 PM">03:00 PM (Turno tarde)</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              {/* Personal Data */}
              <div className="border-t border-surface-container pt-6 space-y-4">
                <h3 className="text-xs font-headline font-bold text-primary uppercase tracking-wider">
                  Datos del Propietario
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Nombres y Apellidos</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">Teléfono WhatsApp</label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">DNI / CE</label>
                    <input
                      type="text"
                      value={clientDni}
                      onChange={(e) => setClientDni(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-mono font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-outline hover:text-primary px-4 py-2"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="bg-secondary hover:bg-secondary/90 text-white px-8 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-sm">task_alt</span>
                  <span>Confirmar Solicitud &amp; Asegurar Bono</span>
                </button>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-surface-container shadow-xs space-y-4">
                <h3 className="font-headline font-bold text-sm text-primary uppercase tracking-wider">
                  Detalle Final del Plan Retoma
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-outline">
                    <span>Auto a Entregar:</span>
                    <span className="font-bold text-on-surface">{brand} {model} ({year})</span>
                  </div>
                  <div className="flex justify-between text-outline">
                    <span>Placa:</span>
                    <span className="font-mono font-bold">{plate}</span>
                  </div>
                  <div className="flex justify-between text-outline">
                    <span>Kilometraje:</span>
                    <span className="font-bold">{parseInt(mileage).toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold border-t border-surface-container pt-2">
                    <span>Valor Tasación + Bono:</span>
                    <span>S/ {valuation.totalTradeInOffer.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-surface-container pt-3 space-y-1">
                    <span className="text-outline text-[11px]">Vehículo a Adquirir:</span>
                    <div className="font-bold text-primary line-clamp-1">{targetVehicle.name}</div>
                    <div className="text-lg font-black text-secondary">
                      Saldo: S/ {balanceToPay.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-secondary-container/10 rounded-xl text-[11px] text-secondary border border-secondary-container/20">
                  <strong>¡Garantía Notarial Incluida!</strong> Nor Celis tramita la transferencia ante Sunarp en un plazo de 24 horas hábiles.
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
