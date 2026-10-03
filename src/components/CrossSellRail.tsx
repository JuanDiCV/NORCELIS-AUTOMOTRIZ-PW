import React from 'react';
import { AutoPart } from '../types';
import { useApp } from '../context/AppContext';
import { SafeImage } from './SafeImage';

interface CrossSellRailProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  items: AutoPart[];
  /** Texto que se guarda en el carrito como subtítulo de la compra */
  contextLabel: string;
}

const Stars: React.FC<{ rating: number; count: number }> = ({ rating, count }) => (
  <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
    <span className="text-secondary-container tracking-tight" aria-hidden="true">
      {'★'.repeat(Math.round(rating))}
      <span className="text-outline-variant">{'★'.repeat(5 - Math.round(rating))}</span>
    </span>
    <span>({count})</span>
  </div>
);

/**
 * Carrusel horizontal de productos recomendados (cross-selling).
 * Se reutiliza en la ficha de vehículos y de repuestos.
 */
export const CrossSellRail: React.FC<CrossSellRailProps> = ({
  eyebrow,
  title,
  subtitle,
  items,
  contextLabel,
}) => {
  const { addToCart, setSelectedPartSku, setCurrentView, showToast } = useApp();

  if (items.length === 0) return null;

  const openPart = (sku: string) => {
    setSelectedPartSku(sku);
    setCurrentView('part-pdp');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = (part: AutoPart) => {
    addToCart({
      type: 'part',
      title: `${part.name} - ${part.brand}`,
      skuOrCode: part.sku,
      priceSoles: part.priceSoles,
      image: part.image,
      specsSubtitle: contextLabel,
      hasWorkshopInstallation: false,
      installationFeeSoles: 0,
      quantity: 1,
    });
    showToast(`${part.name} agregado al carrito`);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-[0.18em]">{eyebrow}</span>
          <h3 className="font-headline font-bold text-xl sm:text-2xl text-primary tracking-tight">{title}</h3>
          {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
        </div>
        <button
          onClick={() => setCurrentView('parts')}
          className="text-sm font-bold text-primary hover:text-secondary transition-colors cursor-pointer flex items-center gap-1"
        >
          Ver catálogo completo
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1 scrollbar-hide">
        {items.map((part) => {
          const hasDiscount = part.oldPriceSoles && part.oldPriceSoles > part.priceSoles;
          const pct = hasDiscount
            ? Math.round((1 - part.priceSoles / (part.oldPriceSoles as number)) * 100)
            : 0;

          return (
            <article
              key={part.id}
              className="group snap-start shrink-0 w-[70%] sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)] bg-surface-container-lowest rounded-3xl border border-surface-container overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <button
                onClick={() => openPart(part.sku)}
                className="relative aspect-square bg-gradient-to-b from-surface-container-low to-white p-6 cursor-pointer"
                aria-label={`Ver detalle de ${part.name}`}
              >
                {part.badge && (
                  <span className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-wide bg-primary text-white px-2.5 py-1 rounded-full">
                    {part.badge}
                  </span>
                )}
                {pct > 0 && (
                  <span className="absolute top-3 right-3 z-10 text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full">
                    -{pct}%
                  </span>
                )}
                <SafeImage
                  src={part.image}
                  alt={part.name}
                  typeHint="part"
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </button>

              <div className="p-4 flex flex-col flex-1 gap-2">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{part.brand}</span>
                <h4 className="font-headline font-bold text-sm text-on-surface leading-snug line-clamp-2 min-h-[2.5rem]">
                  {part.name}
                </h4>
                <Stars rating={part.rating || 4.5} count={part.reviewCount || 0} />

                <div className="mt-auto pt-2 flex items-baseline gap-2">
                  <span className="font-headline font-extrabold text-lg text-primary">
                    S/ {part.priceSoles.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-outline line-through">S/ {(part.oldPriceSoles as number).toLocaleString()}</span>
                  )}
                </div>

                <button
                  onClick={() => handleAdd(part)}
                  className="mt-2 w-full bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                  Añadir al carrito
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
