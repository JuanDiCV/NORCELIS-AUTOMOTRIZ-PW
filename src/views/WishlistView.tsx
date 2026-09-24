import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const WishlistView: React.FC = () => {
  const {
    wishlistItems,
    removeFromWishlist,
    moveWishlistToCart,
    moveAllWishlistToCart,
    activeGarage,
    setCurrentView,
    setSelectedVehicleId,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'vehicle' | 'part' | 'service'>('all');

  const filteredItems = wishlistItems.filter((item) => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const totalValueSoles = wishlistItems.reduce((acc, item) => acc + item.priceSoles * (item.quantity || 1), 0);
  const totalValueUsd = Math.round(totalValueSoles / 3.75);

  return (
    <div className="max-w-7xl mx-auto px-gutter py-6 space-y-6">
      {/* Header (Screen 7 spec) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-container pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
            Guardados Personalizados
          </span>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
            Mi Lista de Deseos ({wishlistItems.length} ítems)
          </h1>
          <p className="text-xs text-outline mt-0.5">
            Monitorea disponibilidad de stock, cotizaciones y ofertas exclusivas guardadas en tu cuenta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => showToast('Enlace de tu lista de deseos copiado al portapapeles')}
            className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors border border-surface-container"
          >
            <span className="material-symbols-outlined text-[17px]">share</span>
            <span>Compartir</span>
          </button>
          <a
            href={`https://wa.me/51987654321?text=Hola,%20deseo%20asesoria%20sobre%20mi%20lista%20de%20deseos%20con%20${wishlistItems.length}%20items`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">chat</span>
            <span>Enviar a Asesor</span>
          </a>
          <button
            onClick={() => showToast('Generando cotización formal en PDF con membrete Nor Celis...')}
            className="p-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Cotización PDF</span>
          </button>
        </div>
      </div>

      {/* Rapid Purchase Ribbon (Screen 7 spec) */}
      {wishlistItems.length > 0 && (
        <div className="bg-primary text-white rounded-3xl p-5 shadow-lg border border-primary-container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-container text-white flex items-center justify-center font-bold text-2xl shadow-md">
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-secondary-fixed block">
                Resumen de tu Selección
              </span>
              <div className="font-headline font-extrabold text-xl text-white">
                Valor estimado: S/ {totalValueSoles.toLocaleString()}{' '}
                <span className="text-xs font-mono text-surface-container-highest/70 font-normal">
                  (~${totalValueUsd.toLocaleString()} USD)
                </span>
              </div>
              <p className="text-xs text-surface-container-highest/80">
                {wishlistItems.length} productos listos para despacho express o instalación en taller
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={moveAllWishlistToCart}
              className="flex-1 md:flex-none bg-secondary-container hover:bg-secondary text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              <span>Mover Todo al Carrito</span>
            </button>
            <button
              onClick={() => {
                moveAllWishlistToCart();
                setCurrentView('cart');
              }}
              className="flex-1 md:flex-none bg-white hover:bg-surface-container-lowest text-primary font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <span>Comprar con 1 Clic</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Garage Compatibility Indicator */}
      <div className="bg-surface-container-low p-3.5 rounded-2xl border border-surface-container flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
          <span className="text-outline">
            Verificando compatibilidad con: <strong className="text-on-surface">{activeGarage.brand} {activeGarage.model} ({activeGarage.year})</strong>
          </span>
        </div>
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
          100% Compatible
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-surface-container text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2.5 px-4 border-b-2 transition-all ${
            activeTab === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          Todos los Deseos ({wishlistItems.length})
        </button>
        <button
          onClick={() => setActiveTab('vehicle')}
          className={`py-2.5 px-4 border-b-2 transition-all ${
            activeTab === 'vehicle'
              ? 'border-primary text-primary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          Vehículos ({wishlistItems.filter(i => i.type === 'vehicle').length})
        </button>
        <button
          onClick={() => setActiveTab('part')}
          className={`py-2.5 px-4 border-b-2 transition-all ${
            activeTab === 'part'
              ? 'border-primary text-primary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          Repuestos OEM ({wishlistItems.filter(i => i.type === 'part').length})
        </button>
        <button
          onClick={() => setActiveTab('service')}
          className={`py-2.5 px-4 border-b-2 transition-all ${
            activeTab === 'service'
              ? 'border-primary text-primary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          Servicios de Taller ({wishlistItems.filter(i => i.type === 'service').length})
        </button>
      </div>

      {/* Wishlist Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-12 text-center space-y-3 border border-surface-container">
          <span className="material-symbols-outlined text-4xl text-outline">favorite_border</span>
          <h3 className="font-headline font-bold text-lg text-on-surface">Tu lista de deseos está vacía</h3>
          <p className="text-xs text-outline max-w-sm mx-auto">
            Explora nuestro catálogo de vehículos 2025 o repuestos originales y guarda tus preferidos haciendo clic en el corazón.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setCurrentView('parts')}
              className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
            >
              Explorar Repuestos OEM
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-5"
            >
              {/* Product Info Left */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-24 h-24 rounded-2xl bg-surface-container-low p-2 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {item.categoryBadge}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      Garantizado Compatible
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-sm text-on-surface">
                    {item.title}
                  </h4>
                  <p className="text-xs text-outline max-w-md line-clamp-1">
                    {item.subtitle}
                  </p>
                  <div className="text-[11px] text-outline font-mono">
                    SKU: {item.sku}
                  </div>
                </div>
              </div>

              {/* Price & Actions Right */}
              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-surface-container">
                <div className="text-left md:text-right">
                  {item.oldPriceSoles && (
                    <span className="text-xs text-outline line-through block font-mono">
                      S/ {item.oldPriceSoles.toLocaleString()}
                    </span>
                  )}
                  <div className="font-headline font-extrabold text-xl text-primary">
                    S/ {item.priceSoles.toLocaleString()}
                  </div>
                  {item.priceUsd && (
                    <div className="text-xs text-outline font-mono">
                      ~${item.priceUsd.toLocaleString()} USD
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.type === 'vehicle' ? (
                    <button
                      onClick={() => {
                        setSelectedVehicleId(item.sku);
                        setCurrentView('vehicle-pdp');
                      }}
                      className="bg-primary hover:bg-primary-container text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Ficha Técnica
                    </button>
                  ) : (
                    <button
                      onClick={() => moveWishlistToCart(item.id)}
                      className="bg-primary hover:bg-primary-container text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                      <span>Mover al Carrito</span>
                    </button>
                  )}

                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2.5 rounded-xl hover:bg-surface-container-low text-outline hover:text-error transition-colors"
                    title="Eliminar de la lista"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Technical Advisory Box (Screen 7 spec) */}
      <div className="bg-surface-container-low p-5 rounded-3xl border border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-container text-white flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">contact_support</span>
          </div>
          <div>
            <h5 className="font-headline font-bold text-xs text-primary">
              ¿Deseas confirmar la compatibilidad de toda tu lista?
            </h5>
            <p className="text-[11px] text-outline">
              El Ing. Carlos Mendoza verificará los códigos OEM con el manual de despiece de fábrica de tu chasis.
            </p>
          </div>
        </div>

        <a
          href="https://wa.me/51987654321?text=Hola%20Ing.%20Carlos,%20deseo%20validar%20mi%20lista%20de%20deseos%20con%20mi%20chasis%20VIN"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">chat</span>
          <span>Consultar por WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
