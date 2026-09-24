import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

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
  const [couponCode, setCouponCode] = useState('NORCELIS5');
  const [couponApplied, setCouponApplied] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<'yape' | 'card' | 'transfer'>('card');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Discount calculation
  const discountAmount = couponApplied ? Math.round(cartSubtotalSoles * 0.05) : 0;
  const shippingCost = deliveryMethod === 'shipping' ? 0 : 0; // Free promo
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
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      showToast('¡Orden generada con éxito! N° Pedido: NC-2025-9941. Hemos enviado los detalles a tu WhatsApp.');
    }, 1200);
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
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
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

          {/* Right Column: Checkout Summary (Screen 8 spec) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Fulfillment selector */}
            <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-outline block">
                Método de Entrega
              </span>
              <div className="space-y-2">
                <label
                  onClick={() => setDeliveryMethod('shipping')}
                  className={`flex items-center justify-between p-3.5 min-h-[44px] rounded-xl border cursor-pointer transition-all ${
                    deliveryMethod === 'shipping'
                      ? 'border-primary bg-surface-container-low ring-1 ring-primary'
                      : 'border-surface-container'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-xl">local_shipping</span>
                    <div>
                      <div className="text-xs font-bold text-on-surface">Envío Express a Domicilio</div>
                      <div className="text-[11px] text-outline">Cajamarca y Provincias (Entrega Rápida)</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">GRATIS</span>
                </label>

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
                  <span>Subtotal:</span>
                  <span className="font-mono text-on-surface font-semibold">S/ {cartSubtotalSoles.toLocaleString()}</span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Descuento NORCELIS5 (5%):</span>
                    <span className="font-mono">-S/ {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-outline">
                  <span>Despacho a Domicilio:</span>
                  <span className="text-emerald-700 font-bold">Gratis</span>
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
                  Método de Pago Preferido:
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  <button
                    onClick={() => setSelectedPayment('card')}
                    className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center ${
                      selectedPayment === 'card'
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    Tarjetas
                  </button>
                  <button
                    onClick={() => setSelectedPayment('yape')}
                    className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center ${
                      selectedPayment === 'yape'
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    Yape / Plin
                  </button>
                  <button
                    onClick={() => setSelectedPayment('transfer')}
                    className={`min-h-[44px] py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center ${
                      selectedPayment === 'transfer'
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-surface-container bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    BCP / BBVA
                  </button>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="pt-2">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full min-h-[48px] bg-secondary-container hover:bg-secondary text-white py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer text-center leading-tight"
                >
                  {isCheckingOut ? (
                    <span>Procesando Pago Seguro...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px] shrink-0">lock</span>
                      <span className="break-words">Proceder al Pago Seguro (S/ {finalTotalSoles.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-[10px] text-outline flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
                <span>Transacción encriptada SSL 256-bit certificada por Niubiz</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
