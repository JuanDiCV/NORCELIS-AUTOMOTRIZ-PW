import React, { useState, useMemo } from 'react';
import { AutoPart } from '../types';
import { useApp } from '../context/AppContext';
import { getCrossSellingComplements } from '../utils/crossSellingHelper';
import { AppleCartIcon } from './AutoIcons';

interface FrequentlyBoughtTogetherProps {
  currentPart: AutoPart;
  allParts: AutoPart[];
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  currentPart,
  allParts,
}) => {
  const { addToCart, setSelectedPartSku, showToast } = useApp();

  // Find 2-3 synergistic cross-selling complements
  const complements = useMemo(() => {
    return getCrossSellingComplements(currentPart, allParts, 3);
  }, [currentPart, allParts]);

  // Combined bundle items: current product first, then complements
  const bundleItems = useMemo(() => {
    return [currentPart, ...complements];
  }, [currentPart, complements]);

  // Track which items are checked in the bundle
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(() => {
    return new Set(bundleItems.map((p) => p.sku));
  });

  // Keep state in sync if current product changes
  React.useEffect(() => {
    setSelectedSkus(new Set([currentPart.sku, ...complements.map((c) => c.sku)]));
  }, [currentPart.sku, complements]);

  const toggleItem = (sku: string) => {
    setSelectedSkus((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) {
        // Allow unchecking even if it's the current product, as long as customer wants
        next.delete(sku);
      } else {
        next.add(sku);
      }
      return next;
    });
  };

  // Selected products calculation
  const selectedProducts = useMemo(() => {
    return bundleItems.filter((item) => selectedSkus.has(item.sku));
  }, [bundleItems, selectedSkus]);

  const selectedCount = selectedProducts.length;

  // Regular price total (sum of oldPrice or normal price)
  const regularTotal = useMemo(() => {
    return selectedProducts.reduce((sum, item) => {
      const regular = item.oldPriceSoles && item.oldPriceSoles > item.priceSoles
        ? item.oldPriceSoles
        : Math.round(item.priceSoles * 1.15);
      return sum + regular;
    }, 0);
  }, [selectedProducts]);

  // Catalog sale price total
  const baseTotal = useMemo(() => {
    return selectedProducts.reduce((sum, item) => sum + item.priceSoles, 0);
  }, [selectedProducts]);

  // 5% Extra Bundle discount when 2 or more products are selected
  const hasBundleDiscount = selectedCount >= 2;
  const bundleDiscountPercent = hasBundleDiscount ? 0.05 : 0;
  const bundleDiscountAmount = baseTotal * bundleDiscountPercent;
  const finalBundlePrice = baseTotal - bundleDiscountAmount;
  const totalSavings = (regularTotal - finalBundlePrice);

  const handleAddBundleToCart = () => {
    if (selectedCount === 0) {
      showToast('Selecciona al menos un producto para agregar al carrito');
      return;
    }

    // Add each selected product to the cart
    selectedProducts.forEach((item) => {
      // If bundle discount applies, proportional discounted price or normal promo price
      const itemFinalPrice = hasBundleDiscount
        ? Math.round(item.priceSoles * 0.95 * 10) / 10
        : item.priceSoles;

      addToCart({
        type: 'part',
        title: `${item.name} - ${item.brand}`,
        skuOrCode: item.sku,
        priceSoles: itemFinalPrice,
        image: item.image,
        specsSubtitle: `${item.badge || 'Repuesto OEM'} • ${hasBundleDiscount ? 'Combo Cross-Selling (-5% OFF)' : 'Código: ' + item.oemCode}`,
        hasWorkshopInstallation: false,
        installationFeeSoles: 0,
        quantity: 1,
      });
    });

    if (hasBundleDiscount) {
      showToast(`¡Combo añadido! Se agregaron ${selectedCount} productos con 5% de descuento adicional`);
    } else {
      showToast(`Se agregó ${selectedCount} producto al carrito`);
    }
  };

  const handleNavigateToPart = (sku: string) => {
    setSelectedPartSku(sku);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (bundleItems.length <= 1) {
    return null;
  }

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
      {/* Falabella Style Header: btr-h-container */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#212955]/10 text-[#212955] flex items-center justify-center">
            <AppleCartIcon size={20} className="text-[#212955]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#212955] tracking-tight font-headline">
              Comprados juntos frecuentemente
            </h3>
            <p className="text-xs text-slate-500">
              Combina componentes compatibles recomendados para tu vehículo con un 5% de descuento especial en el paquete
            </p>
          </div>
        </div>

        {hasBundleDiscount && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            5% OFF en Combo
          </span>
        )}
      </div>

      {/* Main Container: Pods + Summary Action Block */}
      <div className="flex flex-col xl:flex-row items-stretch gap-6 lg:gap-8">
        {/* Horizontal Pods Chain: btr-pods */}
        <div className="flex-1 overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex items-center gap-2 sm:gap-3 min-w-max">
            {bundleItems.map((item, index) => {
              const isCurrent = item.sku === currentPart.sku;
              const isChecked = selectedSkus.has(item.sku);
              const regularPrice = item.oldPriceSoles && item.oldPriceSoles > item.priceSoles
                ? item.oldPriceSoles
                : Math.round(item.priceSoles * 1.15);

              return (
                <React.Fragment key={item.sku}>
                  {/* Plus separator between pods */}
                  {index > 0 && (
                    <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-bold text-lg select-none">
                      +
                    </div>
                  )}

                  {/* Individual Product Pod: btr-pod-container */}
                  <div
                    className={`relative w-44 sm:w-52 p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shrink-0 bg-white ${
                      isChecked
                        ? 'border-[#212955]/30 shadow-sm ring-1 ring-[#212955]/15'
                        : 'border-slate-200/70 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* Badge: "Este producto" on the first item */}
                    {isCurrent && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-[#212955] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shadow-xs">
                          Este producto
                        </span>
                      </div>
                    )}

                    {/* Product Image */}
                    <div
                      onClick={() => !isCurrent && handleNavigateToPart(item.sku)}
                      className={`relative aspect-square w-full rounded-xl bg-slate-50 p-3 flex items-center justify-center overflow-hidden mb-2.5 ${
                        !isCurrent ? 'cursor-pointer group' : ''
                      }`}
                      title={!isCurrent ? `Ver detalle de ${item.name}` : item.name}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1 mb-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block truncate">
                        {item.brand}
                      </span>
                      <h4
                        onClick={() => !isCurrent && handleNavigateToPart(item.sku)}
                        className={`text-xs font-semibold text-[#212955] line-clamp-2 leading-tight ${
                          !isCurrent ? 'cursor-pointer hover:text-[#F07F00] transition-colors' : ''
                        }`}
                        title={item.name}
                      >
                        {item.name}
                      </h4>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 border-t border-slate-100 mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono font-black text-sm text-[#F07F00]">
                          S/ {item.priceSoles.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                        {regularPrice > item.priceSoles && (
                          <span className="font-mono text-[11px] text-slate-400 line-through">
                            S/ {regularPrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Falabella Style Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleItem(item.sku)}
                        className="w-4 h-4 rounded text-[#212955] border-slate-300 focus:ring-[#212955] cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {isCurrent ? 'Incluir este producto' : 'Agregar al paquete'}
                      </span>
                    </label>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Falabella Bundle Summary Footer / Side Card: btr-f-container */}
        <div className="w-full xl:w-80 shrink-0 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Resumen del Paquete
              </span>
              <span className="text-xs font-extrabold text-[#212955] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                {selectedCount} de {bundleItems.length} seleccionados
              </span>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Precio regular:</span>
                <span className="font-mono line-through">
                  S/ {regularTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {hasBundleDiscount && (
                <div className="flex justify-between text-xs font-bold text-emerald-600">
                  <span>Descuento de combo (5%):</span>
                  <span className="font-mono">
                    - S/ {bundleDiscountAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Total del paquete:</span>
                  <span className="text-[10px] text-slate-500">Incluye IGV (Factura / Boleta)</span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black font-mono text-[#212955] block leading-none">
                    S/ {finalBundlePrice.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Savings Callout Banner */}
            {totalSavings > 0 && (
              <div className="bg-emerald-50 text-emerald-800 rounded-xl p-2.5 border border-emerald-200/60 flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-base text-emerald-600 shrink-0">
                  savings
                </span>
                <span className="font-bold leading-tight">
                  Ahorras S/ {totalSavings.toLocaleString('es-PE', { minimumFractionDigits: 2 })} comprando en combo
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleAddBundleToCart}
              disabled={selectedCount === 0}
              className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer ${
                selectedCount > 0
                  ? 'bg-[#212955] hover:bg-[#181e40] active:scale-[0.98] text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <AppleCartIcon size={18} className="text-white" />
              <span>
                {selectedCount > 0
                  ? `Agregar seleccionados al carro (${selectedCount})`
                  : 'Selecciona al menos 1 producto'}
              </span>
            </button>

            <p className="text-[10px] text-center text-slate-400">
              Garantía oficial Nor Celis y despacho conjunto en un solo paquete
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
