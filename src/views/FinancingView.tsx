import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VEHICLES_DATA } from '../data/mockData';

interface BankPartner {
  id: string;
  name: string;
  logoText: string;
  badge: string;
  teaRate: number; // e.g. 11.99
  tceaRate: number; // e.g. 13.5
  maxTermMonths: number;
  minInitialPercent: number;
  highlight: string;
  specialBenefits: string[];
}

const BANK_PARTNERS: BankPartner[] = [
  {
    id: 'santander',
    name: 'Santander Consumer Perú',
    logoText: 'Santander',
    badge: 'Aliado Principal Oficial',
    teaRate: 10.99,
    tceaRate: 12.8,
    maxTermMonths: 72,
    minInitialPercent: 10,
    highlight: 'Tasa preferencial exclusiva clientes Nor Celis + 3 primeras cuotas con 50% dscto.',
    specialBenefits: [
      'Aprobación inmediata en 15 minutos con solo DNI',
      'Hasta 72 meses de plazo',
      'Financiamiento del 100% del seguro vehicular y GPS',
      'Bono de retoma acumulable con el crédito',
    ],
  },
  {
    id: 'bbva',
    name: 'BBVA Consumer Finance',
    logoText: 'BBVA',
    badge: 'Tasa Verde Híbridos/EV',
    teaRate: 11.49,
    tceaRate: 13.2,
    maxTermMonths: 60,
    minInitialPercent: 15,
    highlight: 'Tasa especial 9.99% para modelos Híbridos y Eléctricos + Bono S/ 1,500 en gasolina.',
    specialBenefits: [
      'Puntos BBVA dobles en cuotas pagadas a tiempo',
      'Periodo de gracia de hasta 3 meses',
      'Opción de Cuotas Dobles en Julio y Diciembre',
      'Sin penalidad por amortizaciones o cancelación anticipada',
    ],
  },
  {
    id: 'bcp',
    name: 'BCP Crédito Vehicular',
    logoText: 'BCP',
    badge: 'Mayor Cobertura Nacional',
    teaRate: 11.99,
    tceaRate: 13.9,
    maxTermMonths: 60,
    minInitialPercent: 20,
    highlight: 'Plan Compra Inteligente BCP: renueva tu auto cada 2 o 3 años con cuota residual 50%.',
    specialBenefits: [
      'Canje de Millas LATAM Pass por cada S/ 1,000 financiados',
      'Débito automático con descuentos en cuota mensual',
      'Seguro vehicular Rímac integrado con asistencia en ruta 24/7',
      'Atención preferente en agencias BCP',
    ],
  },
  {
    id: 'interbank',
    name: 'Interbank Crédito Auto',
    logoText: 'Interbank',
    badge: 'Proceso 100% Digital',
    teaRate: 12.25,
    tceaRate: 14.2,
    maxTermMonths: 60,
    minInitialPercent: 10,
    highlight: 'Desembolso 100% digital a través del App Interbank sin acudir a notaría física.',
    specialBenefits: [
      'Aprobación con firma biométrica digital',
      'Millas Benefit acumulables',
      'Financiamiento de accesorios y equipamiento adicional',
      'Cuota balón optativa al final del periodo',
    ],
  },
];

export const FinancingView: React.FC = () => {
  const { setCurrentView, setSelectedVehicleId, showToast } = useApp();

  // Mode: 'by-car-price' vs 'by-monthly-budget'
  const [calcMode, setCalcMode] = useState<'price' | 'budget'>('price');

  // Input states
  const [vehiclePrice, setVehiclePrice] = useState<number>(115000);
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [initialPercent, setInitialPercent] = useState<number>(20);
  const [termMonths, setTermMonths] = useState<number>(48);
  const [selectedBankId, setSelectedBankId] = useState<string>('santander');
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);

  // Income Calculator
  const [clientProfile, setClientProfile] = useState<'dependiente' | 'independiente' | 'empresa'>('dependiente');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(6500);
  const [existingDebts, setExistingDebts] = useState<number>(800);

  // Pre-approval Form
  const [dni, setDni] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPreApprovedModalOpen, setIsPreApprovedModalOpen] = useState(false);
  const [preApprovalCode, setPreApprovalCode] = useState('');

  const selectedBank = BANK_PARTNERS.find((b) => b.id === selectedBankId) || BANK_PARTNERS[0];

  // Mathematical Calculation for Monthly Quote (French Amortization System)
  const calculateQuote = (bank: BankPartner) => {
    const initialAmount = (vehiclePrice * initialPercent) / 100;
    const loanAmount = Math.max(0, vehiclePrice - initialAmount);
    
    // Monthly rate
    const monthlyRate = Math.pow(1 + bank.teaRate / 100, 1 / 12) - 1;
    let baseMonthlyQuote =
      monthlyRate > 0
        ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
          (Math.pow(1 + monthlyRate, termMonths) - 1)
        : loanAmount / termMonths;

    // Desgravamen & Vehicle Insurance
    const desgravamen = loanAmount * 0.00075;
    const vehicleInsurance = includeInsurance ? (vehiclePrice * 0.038) / 12 : 0;
    const totalMonthlyQuote = Math.round(baseMonthlyQuote + desgravamen + vehicleInsurance);

    return {
      loanAmount,
      initialAmount,
      baseMonthlyQuote: Math.round(baseMonthlyQuote),
      desgravamen: Math.round(desgravamen),
      vehicleInsurance: Math.round(vehicleInsurance),
      totalMonthlyQuote,
    };
  };

  const currentCalc = calculateQuote(selectedBank);

  // SBS Debt Capacity Analysis
  // SBS recommends max 35% of net income for auto debt
  const maxSafeMonthlyQuote = Math.round(Math.max(0, (monthlyIncome * 0.35) - existingDebts));
  const estimatedMaxAffordableCar = Math.round((maxSafeMonthlyQuote * termMonths * 0.85) / (1 - initialPercent / 100));

  const handlePreApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni || !fullName || !phone) {
      showToast('Por favor completa todos los campos del formulario');
      return;
    }
    const code = `FIN-NC-${Math.floor(10000 + Math.random() * 90000)}`;
    setPreApprovalCode(code);
    setIsPreApprovedModalOpen(true);
    showToast('¡Evaluación crediticia preliminar aprobada con éxito!');
  };

  return (
    <div className="min-h-screen py-8 px-gutter">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/70">
          <button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors cursor-pointer">
            Inicio
          </button>
          <span>/</span>
          <span className="text-white font-semibold">Portal de Financiamiento Vehicular</span>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary via-[#16203D] to-primary text-white p-8 md:p-12 shadow-xl">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-white text-xs font-bold tracking-wide uppercase shadow-sm">
              <span className="material-symbols-outlined text-sm">account_balance</span>
              Convenios Directos Multibanco • Tasa desde 10.99% TEA
            </div>
            <h1 className="text-3xl md:text-5xl font-headline font-extrabold tracking-tight leading-tight">
              Financia tu próximo vehículo con las cuotas más bajas del mercado
            </h1>
            <p className="text-surface-container-highest/85 text-sm md:text-base leading-relaxed">
              Compara en tiempo real las ofertas de <strong>Santander Consumer</strong>, <strong>BBVA</strong>, <strong>BCP</strong> e <strong>Interbank</strong>. Pre-aprobación en 15 minutos, plazos de 12 a 72 meses y opción de retoma de tu vehículo actual como cuota inicial.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/15">
              <div>
                <div className="text-2xl font-black text-secondary-fixed">15 Min</div>
                <div className="text-xs text-white/70">Aprobación Inmediata</div>
              </div>
              <div>
                <div className="text-2xl font-black text-secondary-fixed">Desde 10%</div>
                <div className="text-xs text-white/70">Cuota Inicial Mínima</div>
              </div>
              <div>
                <div className="text-2xl font-black text-secondary-fixed">Hasta 72</div>
                <div className="text-xs text-white/70">Meses de Financiamiento</div>
              </div>
              <div>
                <div className="text-2xl font-black text-secondary-fixed">100% Online</div>
                <div className="text-xs text-white/70">Trámite Sin Papeleos</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Master Credit Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-surface-container shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container pb-4">
              <div>
                <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">calculate</span>
                  Simulador de Crédito Personalizado
                </h2>
                <p className="text-xs text-outline">Ajusta el precio, inicial y plazo para proyectar tu cuota exacta</p>
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-surface-container self-start">
                <button
                  type="button"
                  onClick={() => setCurrency('PEN')}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    currency === 'PEN'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Soles (S/)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Dólares ($)
                </button>
              </div>
            </div>

            {/* Vehicle Value Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-on-surface">Valor del Vehículo</label>
                <span className="font-headline font-black text-lg text-primary">
                  {currency === 'PEN' ? 'S/' : '$'} {vehiclePrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={35000}
                max={300000}
                step={2500}
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Number(e.target.value))}
                className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-outline font-mono">
                <span>Min: {currency === 'PEN' ? 'S/' : '$'} 35k</span>
                <span className="hidden sm:inline">Ref: {currency === 'PEN' ? 'S/' : '$'} 150k</span>
                <span>Max: {currency === 'PEN' ? 'S/' : '$'} 300k</span>
              </div>
            </div>

            {/* Initial Percentage */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-on-surface">Cuota Inicial ({initialPercent}%)</label>
                <span className="font-bold text-on-surface">
                  {currency === 'PEN' ? 'S/' : '$'} {((vehiclePrice * initialPercent) / 100).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[10, 20, 30, 40, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setInitialPercent(pct)}
                    className={`min-h-[44px] py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                      initialPercent === pct
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-container-low text-outline border-surface-container hover:border-outline'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Term (Months) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-on-surface">Plazo del Crédito ({termMonths} meses / {termMonths / 12} años)</label>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[12, 24, 36, 48, 60, 72].slice(0, 5).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTermMonths(m)}
                    className={`min-h-[44px] py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                      termMonths === m
                        ? 'bg-secondary text-white border-secondary shadow-xs'
                        : 'bg-surface-container-low text-outline border-surface-container hover:border-outline'
                    }`}
                  >
                    {m} m
                  </button>
                ))}
              </div>
            </div>

            {/* Insurance Checkbox */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3.5 bg-surface-container-low rounded-2xl border border-surface-container text-xs">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="inc-ins"
                  checked={includeInsurance}
                  onChange={(e) => setIncludeInsurance(e.target.checked)}
                  className="w-4 h-4 text-primary accent-primary rounded cursor-pointer shrink-0"
                />
                <label htmlFor="inc-ins" className="cursor-pointer">
                  <span className="font-bold text-on-surface block leading-tight">Incluir Seguro Vehicular Todo Riesgo &amp; GPS</span>
                  <span className="text-[11px] text-outline leading-tight">Póliza anual financiada mes a mes con Rímac / Pacífico</span>
                </label>
              </div>
              <span className="font-mono text-xs font-bold text-primary shrink-0">
                +{currency === 'PEN' ? 'S/' : '$'} {currentCalc.vehicleInsurance}/mes
              </span>
            </div>
          </div>

          {/* Result Card Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-linear-to-b from-primary to-[#182343] text-white rounded-3xl p-7 shadow-xl space-y-6 border border-primary-container">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs uppercase tracking-widest text-secondary-fixed font-bold">
                    Tu Cuota Mensual Estimada
                  </span>
                  <div className="text-4xl font-headline font-black text-white mt-1">
                    {currency === 'PEN' ? 'S/' : '$'} {currentCalc.totalMonthlyQuote.toLocaleString()}
                    <span className="text-xs font-normal text-white/70 ml-1">/ mes</span>
                  </div>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-xl text-right">
                  <span className="text-[10px] text-white/70 block">Banco Seleccionado</span>
                  <span className="text-xs font-bold text-secondary-fixed">{selectedBank.name.split(' ')[0]}</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs border-t border-white/15 pt-4">
                <div className="flex justify-between text-white/80">
                  <span>Monto Total del Préstamo:</span>
                  <span className="font-bold text-white">
                    {currency === 'PEN' ? 'S/' : '$'} {currentCalc.loanAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Cuota Inicial ({initialPercent}%):</span>
                  <span className="font-bold text-white">
                    {currency === 'PEN' ? 'S/' : '$'} {currentCalc.initialAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Tasa de Interés (TEA):</span>
                  <span className="font-bold text-emerald-400">{selectedBank.teaRate}%</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>TCEA Referencial:</span>
                  <span className="font-bold text-white">{selectedBank.tceaRate}%</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Seguro de Desgravamen:</span>
                  <span className="font-bold text-white">
                    {currency === 'PEN' ? 'S/' : '$'} {currentCalc.desgravamen}/mes
                  </span>
                </div>
              </div>

              <div className="bg-white/10 p-3 rounded-2xl text-[11px] text-white/90 space-y-1">
                <div className="font-bold text-secondary-fixed flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">stars</span>
                  Beneficio Nor Celis:
                </div>
                <div>{selectedBank.highlight}</div>
              </div>

              <a
                href={`https://wa.me/51987654321?text=Hola%20Nor%20Celis,%20coticé%20un%20crédito%20con%20${selectedBank.name}%20por%20${currency}%20${vehiclePrice}%20(Cuota%20estimada:%20${currency}%20${currentCalc.totalMonthlyQuote}/mes).%20Deseo%20iniciar%20mi%20pre-aprobación.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] text-center leading-tight cursor-pointer"
              >
                <span className="material-symbols-outlined text-base shrink-0">chat</span>
                <span className="break-words">Solicitar Pre-Aprobación Inmediata vía WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* SECTION 2: Official Bank Comparison Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-headline font-extrabold text-primary">
              Comparador Oficial de Entidades Financieras Aliadas
            </h2>
            <p className="text-xs text-outline">
              Elige el banco de tu preferencia. En Nor Celis gestionamos tu carpeta crediticia simultáneamente para obtener la mejor tasa del mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BANK_PARTNERS.map((bank) => {
              const isSelected = bank.id === selectedBankId;
              const quote = calculateQuote(bank);

              return (
                <div
                  key={bank.id}
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'border-primary bg-white shadow-xl ring-2 ring-primary/20 scale-[1.02]'
                      : 'border-surface-container bg-white hover:border-outline hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-surface-container-low text-primary border border-surface-container">
                        {bank.badge}
                      </span>
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm">check</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-headline font-bold text-base text-primary">{bank.name}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-on-surface">
                          {currency === 'PEN' ? 'S/' : '$'} {quote.totalMonthlyQuote.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-outline">/ mes</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low p-2.5 rounded-xl border border-surface-container">
                      <div>
                        <div className="text-[10px] text-outline">TEA Mínima</div>
                        <div className="font-bold text-primary">{bank.teaRate}%</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-outline">TCEA Ref.</div>
                        <div className="font-bold text-on-surface">{bank.tceaRate}%</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <div className="text-[11px] font-bold text-on-surface">Beneficios Destacados:</div>
                      <ul className="space-y-1 text-[11px] text-outline">
                        {bank.specialBenefits.slice(0, 3).map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="material-symbols-outlined text-emerald-600 text-xs mt-0.5">check_circle</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-surface-container-low text-primary hover:bg-surface-container'
                    }`}
                  >
                    {isSelected ? 'Seleccionado' : 'Simular con este Banco'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Debt Capacity & Eligibility Calculator */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-surface-container shadow-xs space-y-8">
          <div className="border-b border-surface-container pb-4">
            <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">trending_up</span>
              Calculadora de Capacidad de Endeudamiento (Criterio SBS)
            </h2>
            <p className="text-xs text-outline">
              Evalúa qué valor de vehículo puedes adquirir de forma responsable sin sobrepasar el 35% de tus ingresos familiares netos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              {/* Profile Selector */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">Tu Perfil Laboral</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'dependiente', label: 'Dependiente', sub: 'Planilla 5ta Categoría' },
                    { id: 'independiente', label: 'Independiente', sub: 'Recibos / RUC 4ta' },
                    { id: 'empresa', label: 'Empresa', sub: 'RUC 20 / Negocio' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setClientProfile(p.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        clientProfile === p.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-surface-container hover:border-outline'
                      }`}
                    >
                      <div className="font-bold text-xs text-primary">{p.label}</div>
                      <div className="text-[10px] text-outline">{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Incomes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Ingreso Mensual Neto Familiar (S/)
                  </label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Math.max(1000, Number(e.target.value)))}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-outline">Sueldo neto en cuenta bancaria</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Deudas Financieras Actuales (S/)
                  </label>
                  <input
                    type="number"
                    value={existingDebts}
                    onChange={(e) => setExistingDebts(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-bold text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <span className="text-[10px] text-outline">Tarjetas, préstamos o hipotecas</span>
                </div>
              </div>

              {/* Requirements accordions based on profile */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container space-y-2">
                <div className="font-bold text-xs text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">inventory_2</span>
                  Requisitos para perfil {clientProfile.toUpperCase()}:
                </div>
                {clientProfile === 'dependiente' && (
                  <ul className="text-xs text-outline space-y-1 list-disc list-inside">
                    <li>DNI / Carné de Extranjería vigente (titular y cónyuge).</li>
                    <li>3 últimas boletas de pago mensuales.</li>
                    <li>Último recibo de luz, agua o teléfono de residencia actual.</li>
                    <li>Continuidad laboral mínima de 6 a 12 meses.</li>
                  </ul>
                )}
                {clientProfile === 'independiente' && (
                  <ul className="text-xs text-outline space-y-1 list-disc list-inside">
                    <li>Ficha RUC activa y habida (4ta categoría).</li>
                    <li>6 últimos recibos por honorarios emitidos y pagados.</li>
                    <li>Última Declaración Jurada Anual del Impuesto a la Renta (PDT).</li>
                    <li>3 últimos estados de cuenta corrientes o de ahorros.</li>
                  </ul>
                )}
                {clientProfile === 'empresa' && (
                  <ul className="text-xs text-outline space-y-1 list-disc list-inside">
                    <li>Ficha RUC 20 con mínimo 2 años de actividad comercial.</li>
                    <li>Últimos 6 pagos mensuales de IGV-Renta (PDT 621).</li>
                    <li>Vigencia de poder de representante legal no mayor a 30 días.</li>
                    <li>Último balance general y estado de ganancias y pérdidas.</li>
                  </ul>
                )}
              </div>
            </div>

            {/* Results Sidebar */}
            <div className="lg:col-span-5 bg-surface-container-low p-6 rounded-3xl border border-surface-container space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs uppercase font-bold tracking-wider text-outline">
                  Diagnóstico de Capacidad Crediticia
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-2xl border border-surface-container">
                    <span className="text-[11px] text-outline">Cuota Máxima Mensual Recomendada:</span>
                    <div className="text-3xl font-headline font-black text-emerald-700">
                      S/ {maxSafeMonthlyQuote.toLocaleString()}
                      <span className="text-xs font-normal text-outline">/mes</span>
                    </div>
                    <span className="text-[10px] text-outline">
                      (Equivalente al 35% de ingresos menos tus deudas declaradas)
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-surface-container">
                    <span className="text-[11px] text-outline">Rango de Vehículo al que Puedes Acceder:</span>
                    <div className="text-2xl font-headline font-black text-primary">
                      Hasta S/ {estimatedMaxAffordableCar.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-outline">
                      Calculado a un plazo de {termMonths} meses con {initialPercent}% de inicial
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setVehiclePrice(Math.min(estimatedMaxAffordableCar, 180000));
                  showToast('¡Simulador sincronizado con tu capacidad máxima!');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="w-full bg-primary hover:bg-primary-container text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Ajustar Simulador a mi Capacidad de S/ {maxSafeMonthlyQuote.toLocaleString()}/mes
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: Fast Pre-Approval Application Form */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-surface-container shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xl font-headline font-bold text-primary">
              Pre-Calificación Crediticia en 15 Minutos
            </h2>
            <p className="text-xs text-outline">
              Ingresa tus datos para una consulta inmediata en el buró de créditos (Sentinel / Equifax) sin costo ni impacto negativo en tu score financiero.
            </p>
          </div>

          <form onSubmit={handlePreApproveSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">DNI o Carné Extranjería *</label>
              <input
                type="text"
                required
                maxLength={9}
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="8 dígitos"
                className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Nombres y Apellidos *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Como figura en DNI"
                className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Teléfono Móvil (WhatsApp) *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="987 654 321"
                className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full bg-surface-container-low border border-surface-container rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-surface-container">
              <span className="text-[11px] text-outline">
                Al enviar este formulario autorizas el tratamiento de tus datos personales conforme a la Ley N° 29733.
              </span>
              <button
                type="submit"
                className="w-full sm:w-auto bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-8 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Pre-Calificar Ahora con {selectedBank.name.split(' ')[0]}
              </button>
            </div>
          </form>
        </div>

        {/* Pre-approved Success Dialog */}
        {isPreApprovedModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-surface-container space-y-6 text-center animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl">task_alt</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-headline font-extrabold text-primary">
                  ¡Pre-Aprobación Exitosa!
                </h3>
                <p className="text-xs text-outline">
                  Estimado(a) <strong>{fullName}</strong>, tu perfil califica preliminarmente con{' '}
                  <strong>{selectedBank.name}</strong> para financiar hasta{' '}
                  <strong>{currency === 'PEN' ? 'S/' : '$'} {vehiclePrice.toLocaleString()}</strong>.
                </p>
              </div>

              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container text-left space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-outline">Código de Consulta:</span>
                  <span className="font-mono font-bold text-primary">{preApprovalCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Cuota Proyectada:</span>
                  <span className="font-bold text-emerald-700">
                    {currency === 'PEN' ? 'S/' : '$'} {currentCalc.totalMonthlyQuote.toLocaleString()} / mes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Plazo:</span>
                  <span className="font-medium">{termMonths} meses</span>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href={`https://wa.me/51987654321?text=Hola%20Nor%20Celis,%20tengo%20el%20codigo%20de%20pre-aprobacion%20${preApprovalCode}%20con%20${selectedBank.name}%20por%20${currency}%20${vehiclePrice}.%20Deseo%20cerrar%20el%20credito.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  Continuar por WhatsApp con Asesor de Créditos
                </a>
                <button
                  onClick={() => setIsPreApprovedModalOpen(false)}
                  className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-2 rounded-xl text-xs transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
