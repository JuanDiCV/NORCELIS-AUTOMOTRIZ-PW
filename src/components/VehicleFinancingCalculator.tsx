import React, { useState, useMemo } from 'react';
import { Vehicle } from '../types';
import { useApp } from '../context/AppContext';

interface VehicleFinancingCalculatorProps {
  vehicle: Vehicle;
  compact?: boolean;
}

interface BankOption {
  id: string;
  name: string;
  tea: number; // Tasa Efectiva Anual en %
  badge: string;
  logoText: string;
}

const BANK_OPTIONS: BankOption[] = [
  {
    id: 'santander',
    name: 'Santander Consumer',
    tea: 11.49,
    badge: 'Tasa Exclusiva Nor Celis',
    logoText: 'Santander',
  },
  {
    id: 'bbva',
    name: 'BBVA Consumer Finance',
    tea: 12.25,
    badge: 'Aprobación Inmediata',
    logoText: 'BBVA',
  },
  {
    id: 'bcp',
    name: 'BCP Vehicular',
    tea: 12.99,
    badge: 'Canje de Millas',
    logoText: 'BCP',
  },
  {
    id: 'interbank',
    name: 'Interbank Crédito Auto',
    tea: 12.70,
    badge: 'Hasta 72 meses',
    logoText: 'Interbank',
  },
];

export const VehicleFinancingCalculator: React.FC<VehicleFinancingCalculatorProps> = ({
  vehicle,
  compact = false,
}) => {
  const { showToast } = useApp();

  // Moneda activa: 'soles' | 'usd'
  const [currency, setCurrency] = useState<'soles' | 'usd'>('soles');

  // Precio del auto según moneda
  const currentPrice = currency === 'soles' ? vehicle.priceSoles : vehicle.priceUsd;
  const currencySymbol = currency === 'soles' ? 'S/' : '$';

  // Parámetros de simulación
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(48);
  const [selectedBankId, setSelectedBankId] = useState<string>('santander');
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);
  const [doubleGratificationBonus, setDoubleGratificationBonus] = useState<boolean>(false);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);

  // Modal de Pre-calificación rápida
  const [isPreApproveModalOpen, setIsPreApproveModalOpen] = useState<boolean>(false);
  const [clientDni, setClientDni] = useState<string>('');
  const [clientIncome, setClientIncome] = useState<string>('4500');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);
  const [approvalResult, setApprovalResult] = useState<'idle' | 'approved'>('idle');

  // Banco seleccionado
  const currentBank = BANK_OPTIONS.find((b) => b.id === selectedBankId) || BANK_OPTIONS[0];

  // Cuota inicial calculada
  const downPaymentAmount = Math.round((currentPrice * downPaymentPercent) / 100);
  const principal = currentPrice - downPaymentAmount;

  // Seguro vehicular mensual estimado (aprox 0.25% mensual del valor del vehículo)
  const monthlyInsurance = includeInsurance
    ? Math.round(currency === 'soles' ? (vehicle.priceSoles * 0.0018) : (vehicle.priceUsd * 0.0018))
    : 0;

  // Cálculo financiero real utilizando la fórmula francesa de cuota fija:
  // Tasa Efectiva Mensual (TEM) a partir de la TEA: TEM = (1 + TEA)^(1/12) - 1
  const annualRate = currentBank.tea / 100;
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

  // Cuota base mensual sin seguro
  // Si aplica cuotas dobles (14 cuotas al año: 2 extraordinarias en Julio y Diciembre)
  const effectiveMonths = doubleGratificationBonus
    ? loanTermMonths + Math.floor(loanTermMonths / 12) * 2
    : loanTermMonths;

  const baseMonthlyPayment = useMemo(() => {
    if (principal <= 0) return 0;
    const factor = Math.pow(1 + monthlyRate, effectiveMonths);
    const payment = (principal * (monthlyRate * factor)) / (factor - 1);
    return Math.round(payment);
  }, [principal, monthlyRate, effectiveMonths]);

  // Total cuota mensual estimada (con seguro si está activado)
  const totalMonthlyPayment = baseMonthlyPayment + monthlyInsurance;

  // Total de intereses generados durante el crédito
  const totalInterest = Math.round(baseMonthlyPayment * effectiveMonths - principal);
  const totalCost = downPaymentAmount + (totalMonthlyPayment * loanTermMonths);

  // Tabla simulada de primeras cuotas de amortización
  const amortizationSchedule = useMemo(() => {
    const rows = [];
    let remaining = principal;
    const count = Math.min(loanTermMonths, 6); // Mostrar primeras 6 cuotas para previsualización

    for (let i = 1; i <= count; i++) {
      const interestPortion = Math.round(remaining * monthlyRate);
      const principalPortion = Math.round(baseMonthlyPayment - interestPortion);
      remaining = Math.max(0, remaining - principalPortion);

      rows.push({
        month: i,
        payment: totalMonthlyPayment,
        principalPortion,
        interestPortion,
        insurance: monthlyInsurance,
        remainingBalance: remaining,
      });
    }
    return rows;
  }, [principal, monthlyRate, baseMonthlyPayment, totalMonthlyPayment, monthlyInsurance, loanTermMonths]);

  const handlePreApprovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientDni.length < 8) {
      showToast('Por favor ingresa un DNI o CE válido de 8 dígitos');
      return;
    }
    setIsSubmittingApproval(true);
    setTimeout(() => {
      setIsSubmittingApproval(false);
      setApprovalResult('approved');
      showToast('¡Crédito Pre-Aprobado con éxito!');
    }, 1200);
  };

  const whatsappMessage = encodeURIComponent(
    `Hola Asesor Nor Celis, coticé el vehículo ${vehicle.name} (${currencySymbol} ${currentPrice.toLocaleString()}). ` +
    `Simulé una cuota inicial de ${downPaymentPercent}% (${currencySymbol} ${downPaymentAmount.toLocaleString()}) ` +
    `a ${loanTermMonths} meses con ${currentBank.name} (TEA ${currentBank.tea}%). ` +
    `Mi cuota estimada es de ${currencySymbol} ${totalMonthlyPayment.toLocaleString()}/mes. Deseo gestionar mi crédito formal.`
  );

  return (
    <div className="bg-surface-container-lowest rounded-3xl border border-surface-container shadow-sm overflow-hidden space-y-6">
      {/* Header del Componente con selector de moneda y entidad */}
      <div className="bg-primary text-white p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-secondary-container text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Nor Celis Financial Services
              </span>
              <span className="text-[11px] text-surface-container-highest/80 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-400">check_circle</span>
                Respuesta en 15 minutos
              </span>
            </div>
            <h3 className="font-headline font-extrabold text-xl sm:text-2xl text-white">
              Calculadora de Financiamiento Vehicular
            </h3>
            <p className="text-xs text-surface-container-highest/80 max-w-xl">
              Simula tu cuota mensual a medida con las entidades bancarias más sólidas del país. Tasa preferencial para unidades 0 km y seminuevos certificados.
            </p>
          </div>

          {/* Selector de Moneda */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="text-xs text-white/80 font-semibold">Moneda:</span>
            <div className="bg-white/10 p-1 rounded-xl border border-white/20 flex text-xs font-bold">
              <button
                onClick={() => setCurrency('soles')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currency === 'soles'
                    ? 'bg-secondary-container text-white shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Soles (S/)
              </button>
              <button
                onClick={() => setCurrency('usd')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currency === 'usd'
                    ? 'bg-secondary-container text-white shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Dólares ($ USD)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cuerpo Principal del Simulador */}
      <div className="p-6 sm:p-7 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Parámetros y Sliders (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Precio del Vehículo y Bono */}
            <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">
                  Valor del Vehículo
                </span>
                <div className="font-headline font-extrabold text-xl sm:text-2xl text-primary">
                  {currencySymbol} {currentPrice.toLocaleString()}
                </div>
                <div className="text-[11px] text-outline">
                  {vehicle.name} • {vehicle.year}
                </div>
              </div>

              {vehicle.discountBonus && (
                <div className="bg-secondary-fixed/50 border border-secondary-fixed-dim px-3 py-1.5 rounded-xl text-right">
                  <span className="text-[10px] font-bold text-secondary uppercase block">
                    Bono Aplicado
                  </span>
                  <span className="text-xs font-extrabold text-secondary">
                    {vehicle.discountBonus}
                  </span>
                </div>
              )}
            </div>

            {/* 2. Cuota Inicial */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">savings</span>
                  Cuota Inicial
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary font-mono bg-surface-container-low px-2.5 py-1 rounded-lg border border-surface-container">
                    {currencySymbol} {downPaymentAmount.toLocaleString()} ({downPaymentPercent}%)
                  </span>
                </div>
              </div>

              {/* Slider de porcentaje de inicial */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-secondary-container cursor-pointer h-2 bg-surface-container rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-outline">
                  <span>10% (Mínimo)</span>
                  <span>20%</span>
                  <span>30%</span>
                  <span>40%</span>
                  <span>50%</span>
                  <span>60%</span>
                </div>
              </div>

              {/* Presets rápidos de porcentaje */}
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 20, 30, 40, 50].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setDownPaymentPercent(pct)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      downPaymentPercent === pct
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-container-low border-surface-container text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              <div className="text-[11px] text-outline flex items-center justify-between pt-1">
                <span>Saldo neto a financiar:</span>
                <span className="font-bold text-primary font-mono">
                  {currencySymbol} {principal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 3. Plazo de Financiamiento */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">date_range</span>
                  Plazo del Crédito
                </label>
                <span className="text-xs font-bold text-primary font-mono bg-surface-container-low px-2.5 py-1 rounded-lg border border-surface-container">
                  {loanTermMonths} Meses ({loanTermMonths / 12} {loanTermMonths === 12 ? 'Año' : 'Años'})
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {[12, 24, 36, 48, 60].map((months) => (
                  <button
                    key={months}
                    onClick={() => setLoanTermMonths(months)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      loanTermMonths === months
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-surface-container-low border-surface-container text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {months}m
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Entidad Bancaria & TEA */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">account_balance</span>
                Entidad Financiera en Convenio
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BANK_OPTIONS.map((bank) => {
                  const isSelected = selectedBankId === bank.id;
                  return (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-primary/5 border-primary ring-1 ring-primary/20 shadow-xs'
                          : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-primary' : 'border-outline'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-on-surface">{bank.name}</div>
                          <span className="text-[10px] text-secondary font-semibold block">
                            {bank.badge}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-extrabold text-primary">
                          {bank.tea}%
                        </span>
                        <span className="text-[9px] text-outline block uppercase">TEA Ref.</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Opciones Adicionales (Seguro y Gratificaciones) */}
            <div className="space-y-2 pt-2 border-t border-surface-container">
              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container cursor-pointer hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={includeInsurance}
                    onChange={(e) => setIncludeInsurance(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-on-surface block">
                      Incluir Seguro Vehicular Integral Contra Todo Riesgo
                    </span>
                    <span className="text-[11px] text-outline block">
                      Cobertura total por robo, daños propios, accidentes y asistencia vial 24/7.
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-primary whitespace-nowrap pl-2">
                  +{currencySymbol} {monthlyInsurance.toLocaleString()}/mes
                </span>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low border border-surface-container cursor-pointer hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={doubleGratificationBonus}
                    onChange={(e) => setDoubleGratificationBonus(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-on-surface block">
                      Plan Cuotas Dobles (Julio y Diciembre)
                    </span>
                    <span className="text-[11px] text-outline block">
                      Aprovecha gratificaciones laborales peruanas para reducir tu cuota mensual ordinaria.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Reduce cuota
                </span>
              </label>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta de Resultados y Acciones (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-surface-container-low p-6 rounded-3xl border border-surface-container shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-outline">
                  Resumen de tu Cotización
                </span>
                <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-md">
                  TEA {currentBank.tea}%
                </span>
              </div>

              {/* Monto de la Cuota Principal */}
              <div className="text-center py-2 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-outline block">
                  Tu Cuota Mensual Estimada
                </span>
                <div className="font-headline font-extrabold text-3xl sm:text-4xl text-secondary">
                  {currencySymbol} {totalMonthlyPayment.toLocaleString()}
                  <span className="text-sm font-semibold text-outline">/mes</span>
                </div>
                <p className="text-[11px] text-outline">
                  Calculado para un plazo de <strong>{loanTermMonths} meses</strong> con cuota inicial de{' '}
                  <strong>{downPaymentPercent}%</strong>.
                </p>
              </div>

              {/* Desglose de Valores */}
              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container text-xs space-y-2.5 font-medium">
                <div className="flex justify-between items-center text-outline">
                  <span>Precio de lista del vehículo:</span>
                  <span className="font-mono text-on-surface font-semibold">
                    {currencySymbol} {currentPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-outline">
                  <span>Cuota inicial ({downPaymentPercent}%):</span>
                  <span className="font-mono text-emerald-700 font-semibold">
                    -{currencySymbol} {downPaymentAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-outline">
                  <span>Monto neto de préstamo:</span>
                  <span className="font-mono text-primary font-bold">
                    {currencySymbol} {principal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-outline">
                  <span>Intereses referenciales:</span>
                  <span className="font-mono text-outline">
                    +{currencySymbol} {totalInterest.toLocaleString()}
                  </span>
                </div>
                {includeInsurance && (
                  <div className="flex justify-between items-center text-outline">
                    <span>Seguro vehicular multirriesgo:</span>
                    <span className="font-mono text-outline">
                      {currencySymbol} {monthlyInsurance.toLocaleString()}/mes
                    </span>
                  </div>
                )}
                <div className="border-t border-surface-container pt-2 flex justify-between items-center text-xs font-bold text-primary">
                  <span>Costo total estimado (Auto + Crédito):</span>
                  <span className="font-mono text-sm">
                    {currencySymbol} {totalCost.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Botones de Acción Primaria */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setIsPreApproveModalOpen(true)}
                  className="w-full bg-secondary-container hover:bg-secondary text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Pre-Calificar Mi Crédito Ahora</span>
                </button>

                <a
                  href={`https://wa.me/51987654321?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Enviar Cotización a Asesor Oficial</span>
                </a>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setShowAmortization(!showAmortization)}
                    className="py-2.5 px-3 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container font-bold text-[11px] text-primary transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">table_rows</span>
                    <span>{showAmortization ? 'Ocultar Tabla' : 'Ver Cronograma'}</span>
                  </button>

                  <button
                    onClick={() => {
                      window.print();
                      showToast('Generando vista de impresión de la simulación...');
                    }}
                    className="py-2.5 px-3 rounded-xl border border-surface-container bg-surface-container-lowest hover:bg-surface-container font-bold text-[11px] text-primary transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">print</span>
                    <span>Imprimir / PDF</span>
                  </button>
                </div>
              </div>

              {/* Nota Legal Regulatoria */}
              <div className="text-[10px] text-outline leading-tight text-justify pt-1">
                * Simulación referencial sujeta a evaluación crediticia por parte de la entidad financiera aliada según perfil del solicitante, historial en centrales de riesgo e ingresos acreditados. Tasa referencial TEA sujeta a variaciones de mercado.
              </div>
            </div>
          </div>
        </div>

        {/* Tabla Desplegable de Cronograma de Amortización */}
        {showAmortization && (
          <div className="bg-surface-container-low p-5 rounded-3xl border border-surface-container space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-headline font-bold text-sm text-primary">
                  Proyección de Amortización (Primeras Cuotas)
                </h4>
                <p className="text-[11px] text-outline">
                  Distribución mensual de capital, intereses y seguro con sistema francés.
                </p>
              </div>
              <span className="text-xs text-primary font-bold">
                Plazo: {loanTermMonths} meses
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-surface-container text-[10px] font-bold uppercase text-outline">
                    <th className="py-2">Cuota #</th>
                    <th className="py-2">Pago Mensual</th>
                    <th className="py-2">Amortización Capital</th>
                    <th className="py-2">Interés Mensual</th>
                    <th className="py-2">Seguro Vehicular</th>
                    <th className="py-2 text-right">Saldo Deudor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-mono text-[11px]">
                  {amortizationSchedule.map((row) => (
                    <tr key={row.month} className="hover:bg-surface-container-lowest/50">
                      <td className="py-2.5 font-bold text-on-surface">Mes {row.month}</td>
                      <td className="py-2.5 font-bold text-secondary">
                        {currencySymbol} {row.payment.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-primary">
                        {currencySymbol} {row.principalPortion.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-outline">
                        {currencySymbol} {row.interestPortion.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-outline">
                        {currencySymbol} {row.insurance.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-bold text-on-surface">
                        {currencySymbol} {row.remainingBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-right text-outline">
              * Mostrando las primeras cuotas ilustrativas. El cronograma completo de {loanTermMonths} cuotas se emitirá al firmar el contrato.
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE PRE-CALIFICACIÓN EN LÍNEA */}
      {isPreApproveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl border border-surface-container shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 relative">
            <button
              onClick={() => {
                setIsPreApproveModalOpen(false);
                setApprovalResult('idle');
              }}
              className="absolute top-5 right-5 p-1 rounded-lg text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {approvalResult === 'idle' ? (
              <form onSubmit={handlePreApprovalSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary-container bg-secondary-container/10 px-2.5 py-0.5 rounded-full">
                    Pre-Evaluación Crediticia 100% Digital
                  </span>
                  <h4 className="font-headline font-extrabold text-xl text-primary">
                    Solicita tu Pre-Aprobación Inmediata
                  </h4>
                  <p className="text-xs text-outline">
                    Ingresa tus datos para validar en línea con la plataforma de Santander y BBVA. No afecta tu historial crediticio.
                  </p>
                </div>

                <div className="bg-surface-container-low p-3.5 rounded-2xl border border-surface-container text-xs space-y-1">
                  <div className="font-bold text-primary flex items-center justify-between">
                    <span>{vehicle.name}</span>
                    <span className="font-mono text-secondary">{currencySymbol} {totalMonthlyPayment.toLocaleString()}/mes</span>
                  </div>
                  <div className="text-[11px] text-outline">
                    Inicial: {currencySymbol} {downPaymentAmount.toLocaleString()} ({downPaymentPercent}%) • Plazo: {loanTermMonths} meses • Banco: {currentBank.name}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1">
                      Documento de Identidad (DNI / Carné de Extranjería):
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      placeholder="Ej. 45892134"
                      value={clientDni}
                      onChange={(e) => setClientDni(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1">
                      Ingreso Mensual Neto Demostrable (Soles):
                    </label>
                    <input
                      type="number"
                      required
                      min={1500}
                      step={100}
                      value={clientIncome}
                      onChange={(e) => setClientIncome(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-mono font-bold focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-on-surface block mb-1">
                      Número Celular / WhatsApp:
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 987 654 321"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingApproval}
                  className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingApproval ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      <span>Consultando scoring bancario...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">bolt</span>
                      <span>Evaluar Crédito en 15 Segundos</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-3 py-0.5 rounded-full uppercase">
                    Scoring Aprobado
                  </span>
                  <h4 className="font-headline font-extrabold text-2xl text-primary mt-1">
                    ¡Pre-Aprobación Exitosa!
                  </h4>
                  <p className="text-xs text-outline max-w-sm mx-auto">
                    Tu crédito vehicular para el <strong className="text-on-surface">{vehicle.name}</strong> ha sido pre-calificado con cuotas desde <strong className="text-secondary">{currencySymbol} {totalMonthlyPayment.toLocaleString()}/mes</strong>.
                  </p>
                </div>

                <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-outline">Código de Pre-Aprobación:</span>
                    <span className="font-mono font-bold text-primary">NC-FIN-{Math.floor(100000 + Math.random() * 900000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Entidad Aprobatoria:</span>
                    <span className="font-bold text-on-surface">{currentBank.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-outline">Tasa Otorgada:</span>
                    <span className="font-mono font-bold text-emerald-700">TEA {currentBank.tea}% Preferencial</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <a
                    href={`https://wa.me/51987654321?text=${encodeURIComponent(
                      `Hola Carlos Mendoza, tengo mi código de crédito pre-aprobado para el ${vehicle.name} (${currencySymbol} ${totalMonthlyPayment}/mes). Deseo coordinar la firma y entrega del vehículo.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    <span>Contactar con Asesor Financiero</span>
                  </a>

                  <button
                    onClick={() => {
                      setIsPreApproveModalOpen(false);
                      setApprovalResult('idle');
                    }}
                    className="w-full py-2.5 rounded-xl border border-surface-container text-xs font-bold text-outline hover:text-on-surface"
                  >
                    Volver a la Ficha del Vehículo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
