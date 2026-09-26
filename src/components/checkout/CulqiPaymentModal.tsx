import React, { useState } from 'react';

interface CulqiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (details: { method: string; transactionId: string; amount: number }) => void;
  totalAmountSoles: number;
  orderNumber?: string;
}

type CulqiMethod = 'card' | 'yape' | 'pos' | 'pagoefectivo';

export const CulqiPaymentModal: React.FC<CulqiPaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  totalAmountSoles,
  orderNumber = 'NC-2026-9941',
}) => {
  if (!isOpen) return null;

  const [activeCulqiTab, setActiveCulqiTab] = useState<CulqiMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<{ transactionId: string; authCode: string } | null>(null);

  // Form State for Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('Juan Carlos Mendoza');
  const [cardEmail, setCardEmail] = useState('carlos.mendoza@norcelis.pe');
  const [cardInstallments, setCardInstallments] = useState('1');

  // Form State for Yape
  const [yapePhone, setYapePhone] = useState('987654321');
  const [yapeOtp, setYapeOtp] = useState('');

  // Form State for POS Culqi
  const [posLocation, setPosLocation] = useState<'concesionario' | 'contraentrega'>('concesionario');
  const [posNotes, setPosNotes] = useState('');

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    return raw.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    return raw;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const fakeTxId = `culqi_charge_${Date.now().toString().slice(-8)}`;
      const fakeAuth = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

      setSuccessResult({
        transactionId: fakeTxId,
        authCode: fakeAuth,
      });

      setTimeout(() => {
        onPaymentSuccess({
          method:
            activeCulqiTab === 'card'
              ? 'Tarjeta Culqi (Visa/Mastercard)'
              : activeCulqiTab === 'yape'
              ? 'Yape con Aprobación Culqi'
              : activeCulqiTab === 'pos'
              ? 'Terminal POS Culqi Inalámbrico'
              : 'PagoEfectivo CIP',
          transactionId: fakeTxId,
          amount: totalAmountSoles,
        });
      }, 1500);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Culqi Brand Header */}
        <div className="bg-[#002A8F] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#002A8F] flex items-center justify-center font-black text-lg shadow-sm">
              <span className="text-[#002A8F] font-bold">C</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-wide">Culqi Checkout</span>
                <span className="bg-[#00B4D8] text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                  Seguro
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Nor Celis Automotriz • Pedido {orderNumber}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-blue-200 uppercase block font-semibold">Total a Pagar</span>
            <span className="font-headline font-black text-lg sm:text-xl text-[#F07F00]">
              S/ {totalAmountSoles.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        {successResult ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-headline font-bold text-lg text-[#212955]">
                ¡Pago Procesado Exitosamente por Culqi!
              </h3>
              <p className="text-xs text-gray-500">
                Tu transacción ha sido autorizada y confirmada en tiempo real.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400">ID Transacción:</span>
                <span className="font-bold text-[#212955]">{successResult.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Código Autorización:</span>
                <span className="font-bold text-emerald-700">{successResult.authCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Monto Cobrado:</span>
                <span className="font-bold text-[#F07F00]">S/ {totalAmountSoles.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Canal:</span>
                <span className="font-bold text-[#212955]">Culqi Payments API</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              Redirigiendo a la confirmación de pedido con guía de envío...
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Method Tabs inside Culqi */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveCulqiTab('card')}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeCulqiTab === 'card'
                    ? 'bg-white text-[#002A8F] shadow-xs font-bold'
                    : 'text-gray-600 hover:text-[#002A8F]'
                }`}
              >
                <span className="material-symbols-outlined text-base">credit_card</span>
                <span className="text-[10px] leading-tight">Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCulqiTab('yape')}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeCulqiTab === 'yape'
                    ? 'bg-[#742284] text-white shadow-xs font-bold'
                    : 'text-gray-600 hover:text-[#742284]'
                }`}
              >
                <span className="material-symbols-outlined text-base">qr_code_2</span>
                <span className="text-[10px] leading-tight">Yape Culqi</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCulqiTab('pos')}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeCulqiTab === 'pos'
                    ? 'bg-[#002A8F] text-white shadow-xs font-bold'
                    : 'text-gray-600 hover:text-[#002A8F]'
                }`}
              >
                <span className="material-symbols-outlined text-base">point_of_sale</span>
                <span className="text-[10px] leading-tight">POS Físico</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCulqiTab('pagoefectivo')}
                className={`py-2 px-1 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  activeCulqiTab === 'pagoefectivo'
                    ? 'bg-[#F07F00] text-white shadow-xs font-bold'
                    : 'text-gray-600 hover:text-[#F07F00]'
                }`}
              >
                <span className="material-symbols-outlined text-base">receipt</span>
                <span className="text-[10px] leading-tight">PagoEfectivo</span>
              </button>
            </div>

            {/* FORM: TARJETA DE CRÉDITO / DÉBITO */}
            {activeCulqiTab === 'card' && (
              <form onSubmit={handleSubmit} className="space-y-3 animate-in fade-in duration-150">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Número de Tarjeta</label>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <span>Visa</span> • <span>Mastercard</span> • <span>Amex</span> • <span>Diners</span>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                      credit_card
                    </span>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4557 0000 0000 0000"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#002A8F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Vencimiento (MM/AA)</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="12/28"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#002A8F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">CVV / CVC (3 dígitos)</label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="•••"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#002A8F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Titular (como figura en la tarjeta)</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="JUAN CARLOS MENDOZA"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 uppercase focus:outline-none focus:border-[#002A8F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email para Comprobante</label>
                    <input
                      type="email"
                      required
                      value={cardEmail}
                      onChange={(e) => setCardEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#002A8F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cuotas</label>
                    <select
                      value={cardInstallments}
                      onChange={(e) => setCardInstallments(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 min-h-[36px]"
                    >
                      <option value="1">Sin cuotas (1 pago)</option>
                      <option value="3">3 cuotas fijas</option>
                      <option value="6">6 cuotas fijas</option>
                      <option value="12">12 cuotas fijas</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full min-h-[46px] bg-[#002A8F] hover:bg-[#001f66] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isProcessing ? (
                    <span>Conectando con Culqi Token Gateway...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">lock</span>
                      <span>Pagar S/ {totalAmountSoles.toLocaleString()} con Culqi</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORM: YAPE CON CÓDIGO DE APROBACIÓN CULQI */}
            {activeCulqiTab === 'yape' && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-[#742284]/10 p-4 rounded-2xl border border-[#742284]/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#742284] font-black text-sm">Instrucciones Yape con Culqi:</span>
                  </div>
                  <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside leading-relaxed">
                    <li>Abre tu aplicación <strong>Yape</strong> en tu teléfono.</li>
                    <li>Toca el menú lateral y selecciona <strong>&quot;Código de Aprobación&quot;</strong>.</li>
                    <li>Copia el código de 6 dígitos e ingrésalo a continuación.</li>
                  </ol>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Número de Celular Yape</label>
                  <input
                    type="tel"
                    required
                    value={yapePhone}
                    onChange={(e) => setYapePhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="987654321"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-[#742284]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Código de Aprobación Yape (6 dígitos)</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={yapeOtp}
                    onChange={(e) => setYapeOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-center text-sm font-mono tracking-widest font-black text-[#742284] focus:outline-none focus:border-[#742284]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full min-h-[46px] bg-[#742284] hover:bg-[#5c1969] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Validando con Yape Culqi...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">verified</span>
                      <span>Yapear S/ {totalAmountSoles.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORM: POS FÍSICO CULQI */}
            {activeCulqiTab === 'pos' && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2 text-[#002A8F]">
                    <span className="material-symbols-outlined text-xl">point_of_sale</span>
                    <span className="font-bold text-xs sm:text-sm">Cobro con Terminal POS Culqi Inalámbrico</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Nor Celis Automotriz dispone de terminales POS Culqi inalámbricos homologados para pagos con cualquier tarjeta física o chip sin contacto (Contactless / Apple Pay / Google Pay).
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">Modalidad de Uso del POS:</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label
                      onClick={() => setPosLocation('concesionario')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        posLocation === 'concesionario'
                          ? 'border-[#002A8F] bg-blue-50/50 ring-1 ring-[#002A8F]'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span className="font-bold text-[#212955]">En Concesionario</span>
                      <span className="text-[11px] text-gray-500 mt-1">Sede Cajamarca (Vía Evitamiento)</span>
                    </label>

                    <label
                      onClick={() => setPosLocation('contraentrega')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        posLocation === 'contraentrega'
                          ? 'border-[#002A8F] bg-blue-50/50 ring-1 ring-[#002A8F]'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span className="font-bold text-[#212955]">Contraentrega</span>
                      <span className="text-[11px] text-gray-500 mt-1">POS inalámbrico con el repartidor</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Observaciones o Persona que Recibe:</label>
                  <input
                    type="text"
                    value={posNotes}
                    onChange={(e) => setPosNotes(e.target.value)}
                    placeholder="Ej: Solicitar voucher impreso a nombre de empresa"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full min-h-[46px] bg-[#002A8F] hover:bg-[#001f66] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Programando orden con POS Culqi...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">check</span>
                      <span>Confirmar Pago con POS Culqi (S/ {totalAmountSoles.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORM: PAGOEFECTIVO CIP */}
            {activeCulqiTab === 'pagoefectivo' && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                    <span className="material-symbols-outlined">receipt_long</span>
                    <span>Código CIP de PagoEfectivo (vía Culqi)</span>
                  </div>
                  <p className="text-xs text-amber-900/80 leading-relaxed">
                    Se generará un código de pago CIP para cancelar en cualquier agente o banca por internet (BCP, BBVA, Interbank, Scotiabank, BanBif, Tambo o Kasnet) dentro de las próximas 24 horas.
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-center font-mono space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Código CIP Referencial</span>
                  <div className="font-headline font-black text-xl text-[#212955]">
                    CIP: {Math.floor(10000000 + Math.random() * 90000000)}
                  </div>
                  <span className="text-[11px] text-gray-500 block">Vence en 24 horas</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full min-h-[46px] bg-[#F07F00] hover:bg-[#d97300] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Generando CIP Culqi...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">download_done</span>
                      <span>Generar Código CIP (S/ {totalAmountSoles.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Security footer */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-emerald-600">verified_user</span>
                Cifrado TLS 1.3 con tokenización PCI-DSS
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 font-semibold cursor-pointer underline"
              >
                Cancelar y volver
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
