import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SafeImage } from '../components/SafeImage';
import { SHALOM_DESTINATIONS } from '../data/bankAccountsData';
import { CulqiPaymentModal } from '../components/checkout/CulqiPaymentModal';
import { BankAccountsList } from '../components/checkout/BankAccountsList';

export const CartView: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    toggleCartInstallation,
    cartSubtotalSoles,
    activeGarage,
    setCurrentView,
    showToast,
    addToCart,
  } = useApp();

  const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');
  const [selectedShalomDestination, setSelectedShalomDestination] = useState<string>('cajamarca-local');
  const [shalomDeliveryType, setShalomDeliveryType] = useState<'domicilio' | 'agencia'>('domicilio');
  const [customerAddress, setCustomerAddress] = useState<string>('Jr. Dos de Mayo 450, Cajamarca');
  const [customerDniRuc, setCustomerDniRuc] = useState<string>('45892147');

  const [couponCode, setCouponCode] = useState('NORCELIS5');
  const [couponApplied, setCouponApplied] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<'culqi' | 'transfer' | 'yape'>('culqi');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCulqiModalOpen, setIsCulqiModalOpen] = useState(false);

  const [completedOrder, setCompletedOrder] = useState<{
    orderNumber: string;
    shalomGuide?: string;
    paymentMethod: string;
    amount: number;
    destinationLabel: string;
    estimatedDelivery: string;
  } | null>(null);

  // Dynamic Shalom Shipping Cost calculation
  const selectedDestObj = SHALOM_DESTINATIONS.find((d) => d.id === selectedShalomDestination) || SHALOM_DESTINATIONS[0];
  const shippingCost = deliveryMethod === 'shipping' ? selectedDestObj.cost : 0;

  // Discount calculation
  const discountAmount = couponApplied ? Math.round(cartSubtotalSoles * 0.05) : 0;
  const finalTotalSoles = cartSubtotalSoles - discountAmount + shippingCost;
  const finalTotalUsd = Math.round(finalTotalSoles / 3.75);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'NORCELIS5') {
      setCouponApplied(true);
      showToast('¡Cupón NORCELIS5 aplicado! 5% de descuento adicional');
    } else {
      showToast('Cupón inválido o expirado');
    }
  };

  const handleCheckout = () => {
    if (selectedPayment === 'culqi') {
      setIsCulqiModalOpen(true);
      return;
    }

    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      const generatedOrder = `NC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedGuide = deliveryMethod === 'shipping' ? `SHA-CAJ-${Math.floor(100000 + Math.random() * 900000)}` : undefined;

      setCompletedOrder({
        orderNumber: generatedOrder,
        shalomGuide: generatedGuide,
        paymentMethod: selectedPayment === 'transfer' ? 'Transferencia Bancaria Oficial' : 'Yape / Plin Directo',
        amount: finalTotalSoles,
        destinationLabel: deliveryMethod === 'shipping' ? `${selectedDestObj.label} (${shalomDeliveryType === 'domicilio' ? 'A Domicilio' : 'Agencia Shalom'})` : 'Retiro en Concesionario Cajamarca',
        estimatedDelivery: deliveryMethod === 'shipping' ? selectedDestObj.estimatedTime : 'Inmediato en Sede',
      });

      showToast(`¡Pedido ${generatedOrder} confirmado! Hemos registrado tu solicitud.`);
    }, 1000);
  };

  const handleCulqiSuccess = (details: { method: string; transactionId: string; amount: number }) => {
    setIsCulqiModalOpen(false);
    const generatedOrder = `NC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedGuide = deliveryMethod === 'shipping' ? `SHA-CAJ-${Math.floor(100000 + Math.random() * 900000)}` : undefined;

    setCompletedOrder({
      orderNumber: generatedOrder,
      shalomGuide: generatedGuide,
      paymentMethod: details.method,
      amount: details.amount,
      destinationLabel: deliveryMethod === 'shipping' ? `${selectedDestObj.label} (${shalomDeliveryType === 'domicilio' ? 'A Domicilio' : 'Agencia Shalom'})` : 'Retiro en Concesionario Cajamarca',
      estimatedDelivery: deliveryMethod === 'shipping' ? selectedDestObj.estimatedTime : 'Inmediato en Sede',
    });

    showToast(`¡Pago con Culqi exitoso! Pedido ${generatedOrder} confirmado con guía Shalom.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-gutter py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-surface-container pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-secondary">
          Bolsa de Compras
        </span>
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
          Carrito de Compras ({cartItems.length} ítems)
        </h1>
      </div>

      {/* Free Shipping Progress Ribbon (Screen 8 spec) */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-emerald-700">local_shipping</span>
          <div>
            <span className="font-bold text-xs text-emerald-900 block">
              ¡Felicidades! Tienes Despacho Express Gratuito en Cajamarca y a nivel regional
            </span>
            <span className="text-[11px] text-emerald-700">
              Entrega en menos de 24 horas con seguimiento en vivo
            </span>
          </div>
        </div>
        <div className="w-full sm:w-48 bg-emerald-200 rounded-full h-2.5 overflow-hidden">
          <div className="bg-emerald-600 h-2.5 rounded-full w-full"></div>
        </div>
      </div>

      {/* Active Garage Check */}
      <div className="bg-surface-container-low p-3.5 rounded-2xl border border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg shrink-0">garage</span>
          <span className="text-outline break-words">
            Repuestos validados para: <strong className="text-on-surface">{activeGarage.brand} {activeGarage.model} ({activeGarage.year})</strong>
          </span>
        </div>
        <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px] shrink-0">
          100% Compatibilidad Garantizada
        </span>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center space-y-3 border border-surface-container">
          <span className="material-symbols-outlined text-4xl text-outline">shopping_cart</span>
          <h3 className="font-headline font-bold text-lg text-on-surface">Tu carrito está vacío</h3>
          <p className="text-xs text-outline max-w-sm mx-auto">
            Explora repuestos con compatibilidad OEM o servicios de taller y añádelos con un clic.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentView('parts')}
              className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-6 py-3 min-h-[44px] rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              Ir al Catálogo de Repuestos
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const itemTotal = item.priceSoles * item.quantity;
              const installFee = item.hasWorkshopInstallation ? (item.installationFeeSoles || 60) * item.quantity : 0;

              return (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-container-low p-2 flex items-center justify-center shrink-0 overflow-hidden">
                        <SafeImage
                          src={item.image}
                          alt={item.title}
                          typeHint={item.type === 'vehicle_reservation' ? 'vehicle' : item.type === 'service' ? 'service' : 'part'}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded inline-block">
                          {item.type === 'service' ? 'Servicio Taller' : item.type === 'vehicle_reservation' ? 'Reserva 0 km' : 'Repuesto OEM'}
                        </span>
                        <h4 className="font-headline font-bold text-sm text-on-surface break-words leading-tight">
                          {item.title}
                        </h4>
                        {item.specsSubtitle && (
                          <p className="text-xs text-outline line-clamp-1 break-words">
                            {item.specsSubtitle}
                          </p>
                        )}
                        <div className="text-[11px] text-outline font-mono">
                          Código: {item.skuOrCode}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-left sm:text-right shrink-0">
                      <div className="font-headline font-extrabold text-xl text-primary">
                        S/ {itemTotal.toLocaleString()}
                      </div>
                      <div className="text-xs text-outline font-mono">
                        (S/ {item.priceSoles.toLocaleString()} c/u)
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Workshop Install Option */}
                  <div className="border-t border-surface-container-low pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Installation toggle */}
                    {item.type === 'part' && (
                      <label className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container">
                        <input
                          type="checkbox"
                          checked={item.hasWorkshopInstallation || false}
                          onChange={() => toggleCartInstallation(item.id)}
                          className="accent-secondary-container w-4 h-4 cursor-pointer shrink-0"
                        />
                        <span className="leading-tight">Instalación profesional en Taller (+S/ 60 c/u)</span>
                      </label>
                    )}

                    {item.type === 'service' && item.scheduledDate && (
                      <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <span className="material-symbols-outlined text-[16px] shrink-0">calendar_month</span>
                        <span className="leading-tight">Cita Programada: {item.scheduledLocation}</span>
                      </div>
                    )}

                    {/* Quantity & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                      <div className="flex items-center bg-surface-container-low border border-surface-container rounded-xl overflow-hidden min-h-[44px]">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface-container text-on-surface font-bold transition-colors cursor-pointer text-base"
                          aria-label="Disminuir cantidad"
                        >
                          -
                        </button>
                        <span className="px-3 min-w-[32px] text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-surface-container text-on-surface font-bold transition-colors cursor-pointer text-base"
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-container text-outline hover:text-error transition-colors cursor-pointer"
                        title="Eliminar del carrito"
                        aria-label="Eliminar producto"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Frequently Bought Together (Screen 8 spec) */}
            <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm space-y-3">
              <h4 className="font-headline font-bold text-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-secondary-container">recommend</span>
                Frecuentemente Comprados Juntos con tu RAV4
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold block">OEM Toyota</span>
                    <span className="font-bold text-xs text-on-surface block">Juego 4 Bujías Denso Iridium</span>
                    <span className="text-xs text-primary font-bold">S/ 180</span>
                  </div>
                  <button
                    onClick={() =>
                      addToCart({
                        type: 'part',
                        title: 'Juego 4 Bujías Denso Iridium OEM',
                        skuOrCode: 'DEN-SK20HR11',
                        priceSoles: 180,
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKz1SYjrs-3GKo-V8XkeonlDibb17wgATNHQlbxiJ6FRb1FZwT_M5fUVexlwm8_Lmi8fairJQ19u8ERMhn98tfwECJsKKg-YCAphr9Fm2yK8FPFK8YAU13fbQ-4RgmO5LH191mYSI28Aliv2GVJ8uA3qGphqHZNIvuY0EbwlSC0MyN-HsNU4EcXN8o94Vb_rYG2UMjDDXWdPZxQD4XewGwDzYC6VVW2uamPANl8K0z4VqfASWjM4NF',
                        specsSubtitle: 'Compatibilidad 100% verificada',
                      })
                    }
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shrink-0 cursor-pointer flex items-center justify-center transition-colors"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold block">Car Care</span>
                    <span className="font-bold text-xs text-on-surface block">Sellador Cerámico Rápido 500ml</span>
                    <span className="text-xs text-primary font-bold">S/ 95</span>
                  </div>
                  <button
                    onClick={() =>
                      addToCart({
                        type: 'part',
                        title: 'Sellador Cerámico Rápido SiO2 500ml',
                        skuOrCode: 'NC-CAR-CER500',
                        priceSoles: 95,
                        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSjI_tIAIGiT6wyiJbp0Fa_bV8tFCUZH1ukGx28Esv2LM-NxulgReRQMUAHbYA3VkYAzuU_0-TlyRO_iD872KGC6R4RM4o1F-WNokWD5Q_a2RnWiF2Kr0VQ3jp5-IsvkySgMGjIrqIx-VJzpYQHiys_1cuFjbPE1s2eI_QMAudhThsULZbqgdVwD8JvlTUle2ialiatbl3Oa5tHE9M5-pE2DpsKz8dB0ufSUmmKw4NtwLKSMUAoJi_',
                        specsSubtitle: 'Protección hidrofóbica instantánea',
                      })
                    }
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shrink-0 cursor-pointer flex items-center justify-center transition-colors"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Summary & Logistics */}
          <div className="lg:col-span-4 space-y-4">
            {/* Fulfillment selector */}
            <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-outline block">
                  Método de Entrega
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">local_shipping</span>
                  Shalom Express
                </span>
              </div>

              <div className="space-y-2">
                <label
                  onClick={() => setDeliveryMethod('shipping')}
                  className={`flex items-start justify-between p-3.5 min-h-[44px] rounded-xl border cursor-pointer transition-all ${
                    deliveryMethod === 'shipping'
                      ? 'border-primary bg-surface-container-low ring-1 ring-primary'
                      : 'border-surface-container'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#F07F00] text-xl mt-0.5">local_shipping</span>
                    <div>
                      <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <span>Envío Express a Domicilio / Agencia</span>
                      </div>
                      <div className="text-[11px] text-outline">
                        Operado por <strong>Shalom Express</strong> (Nacional)
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 shrink-0">
                    {selectedDestObj.cost === 0 ? 'GRATIS' : `S/ ${selectedDestObj.cost}`}
                  </span>
                </label>

                {/* Expanded Shalom Delivery Configuration */}
                {deliveryMethod === 'shipping' && (
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 animate-in fade-in duration-150">
                    <div>
                      <label className="text-[11px] font-bold text-[#212955] block mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-[#F07F00]">pin_drop</span>
                        Destino de Envío Shalom:
                      </label>
                      <select
                        value={selectedShalomDestination}
                        onChange={(e) => setSelectedShalomDestination(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary"
                      >
                        {SHALOM_DESTINATIONS.map((dest) => (
                          <option key={dest.id} value={dest.id}>
                            {dest.label} — {dest.cost === 0 ? 'Gratis' : `S/ ${dest.cost}`} ({dest.estimatedTime})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShalomDeliveryType('domicilio')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                          shalomDeliveryType === 'domicilio'
                            ? 'bg-[#212955] text-white border-[#212955] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        A Domicilio
                      </button>
                      <button
                        type="button"
                        onClick={() => setShalomDeliveryType('agencia')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                          shalomDeliveryType === 'agencia'
                            ? 'bg-[#212955] text-white border-[#212955] shadow-xs'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        Agencia Shalom
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder={shalomDeliveryType === 'domicilio' ? 'Dirección exacta de entrega' : 'Nombre o referencia de Agencia Shalom'}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        value={customerDniRuc}
                        onChange={(e) => setCustomerDniRuc(e.target.value)}
                        placeholder="DNI o RUC del consignatario para la guía"
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="text-[10px] text-gray-500 bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-between">
                      <span>Plazo Estimado: <strong>{selectedDestObj.estimatedTime}</strong></span>
                      <span className="font-bold text-[#F07F00]">Guía Shalom Incluida</span>
                    </div>
                  </div>
                )}

                <label
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`flex items-center justify-between p-3.5 min-h-[44px] rounded-xl border cursor-pointer transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'border-primary bg-surface-container-low ring-1 ring-primary'
                      : 'border-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-xl">store</span>
                    <div>
                      <div className="text-xs font-bold text-on-surface">Retiro en Concesionario Cajamarca</div>
                      <div className="text-[11px] text-outline font-medium">AV. VIA DE EVITAMIENTO SUR 6003</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">GRATIS</span>
                </label>
              </div>
            </div>

            {/* Order Summary & Coupon */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-surface-container shadow-sm space-y-4">
              <h3 className="font-headline font-bold text-base text-primary border-b border-surface-container pb-3">
                Resumen del Pedido
              </h3>

              {/* Coupon input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Cupón de descuento"
                  className="flex-1 min-h-[44px] bg-surface-container-low border border-surface-container rounded-xl px-3.5 py-2.5 text-xs font-mono uppercase focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="min-h-[44px] bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Aplicar
                </button>
              </form>

              {couponApplied && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between min-h-[44px]">
                  <span>Código NORCELIS5 (-5%) aplicado</span>
                  <button onClick={() => setCouponApplied(false)} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-error font-bold text-lg cursor-pointer">×</button>
                </div>
              )}

              {/* Breakdown */}
              <div className="space-y-2 text-xs border-t border-surface-container-low pt-3">
                <div className="flex justify-between text-outline">
                  <span>Subtotal repuestos / servicios:</span>
                  <span className="font-mono text-on-surface font-semibold">S/ {cartSubtotalSoles.toLocaleString()}</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Descuento NORCELIS5 (5%):</span>
                    <span className="font-mono">-S/ {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-outline">
                  <span>Envío Shalom Express ({deliveryMethod === 'shipping' ? selectedDestObj.label : 'Retiro en Sede'}):</span>
                  <span className={`font-mono font-bold ${shippingCost === 0 ? 'text-emerald-700' : 'text-on-surface'}`}>
                    {shippingCost === 0 ? 'Gratis' : `S/ ${shippingCost}`}
                  </span>
                </div>

                <div className="border-t border-surface-container pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="font-headline font-extrabold text-base text-on-surface block">Total Final:</span>
                    <span className="text-xs text-outline font-mono">~${finalTotalUsd.toLocaleString()} USD</span>
                  </div>
                  <span className="font-headline font-extrabold text-2xl text-primary">
                    S/ {finalTotalSoles.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-outline block">
                  Selecciona tu Método de Pago:
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('culqi')}
                    className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      selectedPayment === 'culqi'
                        ? 'border-[#002A8F] bg-[#002A8F] text-white shadow-sm'
                        : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="font-extrabold">Culqi</span>
                    <span className="text-[9px] opacity-80">Tarjetas / POS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('transfer')}
                    className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      selectedPayment === 'transfer'
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="font-extrabold">Transferencia</span>
                    <span className="text-[9px] opacity-80">BCP / BBVA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('yape')}
                    className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      selectedPayment === 'yape'
                        ? 'border-[#742284] bg-[#742284] text-white shadow-sm'
                        : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <span className="font-extrabold">Yape</span>
                    <span className="text-[9px] opacity-80">Directo</span>
                  </button>
                </div>
              </div>

              {/* Bank Accounts Accordion / Preview when Transfer is chosen */}
              {selectedPayment === 'transfer' && (
                <div className="pt-2 animate-in fade-in duration-150 w-full max-w-full overflow-hidden">
                  <BankAccountsList
                    compact={true}
                    onCopySuccess={(msg) => showToast(msg)}
                  />
                </div>
              )}

              {/* Yape preview when direct Yape is chosen */}
              {selectedPayment === 'yape' && (
                <div className="p-3 bg-[#742284]/10 rounded-2xl border border-[#742284]/20 space-y-1 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-[#742284] font-bold">
                    <span className="material-symbols-outlined text-base">qr_code_2</span>
                    <span>Yape Directo Concesionario</span>
                  </div>
                  <p className="text-[11px] text-gray-700">
                    Número Oficial: <strong>987 654 321</strong> (NOR CELIS AUTOMOTRIZ S.A.C.)
                  </p>
                  <span className="text-[10px] text-gray-500 block">
                    Al confirmar el pedido se registrará tu solicitud y podrás adjuntar tu captura de Yape por WhatsApp.
                  </span>
                </div>
              )}

              {/* Checkout CTA */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className={`w-full min-h-[48px] py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center leading-tight ${
                    selectedPayment === 'culqi'
                      ? 'bg-[#002A8F] hover:bg-[#001f66] text-white'
                      : 'bg-secondary-container hover:bg-secondary text-white hover:shadow-orange-500/25'
                  }`}
                >
                  {isCheckingOut ? (
                    <span>Procesando Pedido...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px] shrink-0">
                        {selectedPayment === 'culqi' ? 'credit_card' : 'lock'}
                      </span>
                      <span className="break-words">
                        {selectedPayment === 'culqi'
                          ? `Pagar con Culqi (S/ ${finalTotalSoles.toLocaleString()})`
                          : selectedPayment === 'transfer'
                          ? `Confirmar Pedido & Transferir (S/ ${finalTotalSoles.toLocaleString()})`
                          : `Confirmar Pedido por Yape (S/ ${finalTotalSoles.toLocaleString()})`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-[10px] text-outline flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
                <span>Transacción segura y protegida por Culqi &amp; Nor Celis Automotriz</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Culqi Checkout Modal */}
      <CulqiPaymentModal
        isOpen={isCulqiModalOpen}
        onClose={() => setIsCulqiModalOpen(false)}
        onPaymentSuccess={handleCulqiSuccess}
        totalAmountSoles={finalTotalSoles}
        orderNumber={`NC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`}
      />

      {/* Order Completed Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-[#0f172a]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#212955] p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base">¡Pedido Confirmado con Éxito!</h3>
                  <p className="text-xs text-blue-200">Nor Celis Automotriz • Sede Cajamarca</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletedOrder(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-500">Número de Pedido:</span>
                  <span className="font-mono font-bold text-[#212955] text-sm">{completedOrder.orderNumber}</span>
                </div>
                {completedOrder.shalomGuide && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#F07F00]">local_shipping</span>
                      Guía Shalom Express:
                    </span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {completedOrder.shalomGuide}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-500">Método de Pago:</span>
                  <span className="font-bold text-[#212955]">{completedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-500">Destino / Entrega:</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[240px] truncate">
                    {completedOrder.destinationLabel}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-500">Tiempo Estimado:</span>
                  <span className="font-bold text-gray-800">{completedOrder.estimatedDelivery}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-700">Total Pagado:</span>
                  <span className="font-black text-base text-[#F07F00]">
                    S/ {completedOrder.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Shalom Tracking Status Card */}
              {completedOrder.shalomGuide && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base text-[#F07F00]">schedule</span>
                      Estado de Envío Shalom Express
                    </span>
                    <span className="bg-amber-200/80 px-2 py-0.5 rounded text-[10px]">En Preparación</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Tu guía <strong>{completedOrder.shalomGuide}</strong> ha sido pre-registrada en el sistema de Shalom. Te notificaremos por WhatsApp cuando el paquete sea admitido en agencia.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/51987654321?text=Hola%20Nor%20Celis,%20adjunto%20mi%20pedido%20${completedOrder.orderNumber}%20con%20guía%20Shalom%20${completedOrder.shalomGuide || 'retiro'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>Contactar a un Asesor por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setCompletedOrder(null)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Continuar Explorando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
