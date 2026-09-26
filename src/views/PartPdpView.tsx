import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AUTO_PARTS_DATA } from '../data/mockData';
import { SafeImage } from '../components/SafeImage';
import { FocalZoomImage } from '../components/FocalZoomImage';

export const PartPdpView: React.FC = () => {
  const {
    selectedPartSku,
    setSelectedPartSku,
    activeGarage,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setCurrentView,
    showToast,
    autoParts,
  } = useApp();

  const part = (autoParts && autoParts.length > 0 ? autoParts : AUTO_PARTS_DATA).find((p) => p.sku === selectedPartSku) || autoParts[0] || AUTO_PARTS_DATA[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [includeInstallation, setIncludeInstallation] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Gallery of high-res photos
  const gallery = [
    part.image,
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
  ];

  const installationFeeSoles = 85;
  const isWishlisted = isInWishlist(part.id);

  // Check garage compatibility
  const isCompatibleWithGarage =
    part.compatibleVehicle.toLowerCase().includes(activeGarage.brand.toLowerCase()) ||
    part.compatibleVehicle.toLowerCase().includes(activeGarage.model.toLowerCase().split(' ')[0]);

  // Comprehensive compatibility list
  const compatibilityList = [
    { brand: 'Toyota', model: 'RAV4 (5ta Gen / XA50)', years: '2019 - 2025', engine: '2.5L Hybrid (A25A-FXS) / 2.0L Gasolina' },
    { brand: 'Toyota', model: 'Corolla Cross', years: '2021 - 2025', engine: '1.8L Hybrid / 2.0L Dynamic Force' },
    { brand: 'Toyota', model: 'Camry', years: '2018 - 2024', engine: '2.5L DOHC Dual VVT-i' },
    { brand: 'Toyota', model: 'Hilux Revo / Rocco', years: '2016 - 2024', engine: '2.4L / 2.8L 1GD-FTV Turbo Diésel' },
    { brand: 'Lexus', model: 'NX 250 / NX 350h', years: '2022 - 2025', engine: '2.5L HEV E-Four' },
  ];

  const handleAddToCart = () => {
    addToCart({
      type: 'part',
      title: `${part.name} - ${part.brand}`,
      skuOrCode: part.sku,
      priceSoles: part.priceSoles,
      image: part.image,
      specsSubtitle: `${part.badge || 'Repuesto OEM'} • Código: ${part.oemCode}`,
      hasWorkshopInstallation: includeInstallation,
      installationFeeSoles: includeInstallation ? installationFeeSoles : 0,
      quantity,
    });
    showToast(`"${part.name}" añadido al carrito de compras`);
  };

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 px-gutter">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-outline flex-wrap">
          <button onClick={() => setCurrentView('home')} className="hover:text-primary transition-colors">
            Inicio
          </button>
          <span>/</span>
          <button onClick={() => setCurrentView('parts')} className="hover:text-primary transition-colors">
            Repuestos &amp; Autopartes OEM
          </button>
          <span>/</span>
          <span className="capitalize">{part.category}</span>
          <span>/</span>
          <span className="text-on-surface font-semibold line-clamp-1 max-w-[300px]">{part.name}</span>
        </nav>

        {/* Garage Active Compatibility Alert Banner */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
            isCompatibleWithGarage
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <span className="material-symbols-outlined text-2xl shrink-0 mt-0.5 sm:mt-0">
              {isCompatibleWithGarage ? 'check_circle' : 'warning'}
            </span>
            <div>
              <span className="font-bold block break-words">
                {isCompatibleWithGarage
                  ? `✓ Pieza 100% Homologada para tu Garaje Activo: ${activeGarage.brand} ${activeGarage.model} (${activeGarage.year})`
                  : `⚠️ Atención: Verifica compatibilidad para tu ${activeGarage.brand} ${activeGarage.model}`}
              </span>
              <span className="text-[11px] opacity-85 block break-words">
                Placa registrada: <strong className="font-mono">{activeGarage.plate}</strong> • Código OEM: {part.oemCode}
              </span>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('parts')}
            className="text-[11px] font-bold underline hover:opacity-80 shrink-0 self-end sm:self-auto cursor-pointer"
          >
            Buscar por otro chasis / VIN
          </button>
        </div>

        {/* Product Master Section: Gallery + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white rounded-3xl p-6 md:p-10 border border-surface-container shadow-xs">
          {/* Gallery Column (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <FocalZoomImage
              src={gallery[selectedImageIndex]}
              alt={part.name}
              typeHint="part"
              categoryHint={part.category}
              aspectRatioClass="h-80 sm:h-96 w-full"
              badge={part.badge || (part.brandType === 'alternativa' ? 'Marca Alternativa A+' : 'OEM Oficial')}
              discountBadge={part.discount}
              subBadge={part.brandOrigin === 'china' ? 'Calidad China A+' : undefined}
            />

            {/* Thumbnail selector */}
            <div className="flex gap-3">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all p-1 bg-surface-container-low ${
                    selectedImageIndex === idx
                      ? 'border-primary ring-2 ring-primary/20 scale-105'
                      : 'border-surface-container hover:border-outline'
                  }`}
                >
                  <SafeImage src={img} alt="Miniatura" typeHint="part" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Details & Purchase Column (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {part.brand} OEM Certified
                </span>
                <button
                  onClick={() =>
                    toggleWishlist({
                      id: part.id,
                      type: 'part',
                      title: part.name,
                      subtitle: `${part.brand} • ${part.sku}`,
                      sku: part.sku,
                      priceSoles: part.priceSoles,
                      priceUsd: part.priceUsd,
                      oldPriceSoles: part.oldPriceSoles,
                      image: part.image,
                      categoryBadge: part.badge || 'Repuesto OEM',
                    })
                  }
                  className={`p-2 rounded-full border transition-colors ${
                    isWishlisted
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'border-surface-container hover:bg-surface-container-low text-outline'
                  }`}
                  title={isWishlisted ? 'En Favoritos' : 'Guardar en Favoritos'}
                >
                  <span className={`material-symbols-outlined text-xl ${isWishlisted ? 'fill-1' : ''}`}>
                    favorite
                  </span>
                </button>
              </div>

              <h1 className="text-2xl md:text-3xl font-headline font-extrabold text-primary leading-tight">
                {part.name}
              </h1>

              <div className="flex items-center gap-3 text-xs text-outline pt-1">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <span className="material-symbols-outlined text-base fill-1">star</span>
                  <span>{part.rating}</span>
                </div>
                <span>•</span>
                <span>({part.reviewCount} valoraciones de talleres certificados)</span>
                <span>•</span>
                <span className="font-mono text-primary font-bold">SKU: {part.sku}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-headline font-black text-primary">
                  S/ {part.priceSoles.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-outline">
                  (${part.priceUsd.toLocaleString()} USD)
                </span>
                {part.oldPriceSoles && (
                  <span className="text-sm line-through text-outline">
                    S/ {part.oldPriceSoles.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-outline">
                Incluye IGV (18%). Boleta o Factura Electrónica con crédito fiscal.
              </p>
            </div>

            {/* Installation Option */}
            <div
              onClick={() => setIncludeInstallation(!includeInstallation)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                includeInstallation
                  ? 'border-primary bg-primary/5'
                  : 'border-surface-container hover:border-outline bg-surface-container-lowest'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                    includeInstallation ? 'bg-primary text-white border-primary' : 'border-outline'
                  }`}
                >
                  {includeInstallation && <span className="material-symbols-outlined text-sm">check</span>}
                </div>
                <div>
                  <span className="font-bold text-xs text-primary block leading-tight">
                    Instalación Certificada en Taller Nor Celis (+S/ {installationFeeSoles}.00)
                  </span>
                  <span className="text-[11px] text-outline leading-tight block mt-0.5">
                    Incluye purga de líneas, rectificado de contacto y 12 meses de garantía en mano de obra.
                  </span>
                </div>
              </div>
              <span className="font-bold text-xs text-primary shrink-0 self-end sm:self-auto">+S/ {installationFeeSoles}</span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center border border-surface-container rounded-xl bg-surface-container-low p-1 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-xs">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center font-bold text-base cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-outline">
                  <span className="text-emerald-700 font-bold block">✓ En Stock Almacén Central</span>
                  <span className="break-words">Disponibilidad inmediata para retiro en Concesionario &amp; Taller: AV. VIA DE EVITAMIENTO SUR 6003 – CAJAMARCA o despacho a nivel nacional</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="bg-primary hover:bg-primary-container text-white py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-base">shopping_cart</span>
                  Añadir al Carrito
                </button>

                <a
                  href={`https://wa.me/51987654321?text=Hola%20Nor%20Celis,%20consulto%20stock%20del%20repuesto%20${part.name}%20(SKU:%20${part.sku})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Technical Specifications & Detailed Compatibility Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Detailed Compatibility Table (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-surface-container shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-4">
              <div>
                <h3 className="text-lg font-headline font-bold text-primary">
                  Tabla Exhaustiva de Compatibilidad Multimarca
                </h3>
                <p className="text-xs text-outline">
                  Verificación milimétrica con tolerancias OEM de fábrica
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-surface-container text-outline font-bold text-[11px] uppercase">
                    <th className="py-2.5 px-3">Marca</th>
                    <th className="py-2.5 px-3">Modelo</th>
                    <th className="py-2.5 px-3">Años</th>
                    <th className="py-2.5 px-3">Motorización Homologada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-on-surface">
                  {compatibilityList.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-3 font-bold text-primary">{row.brand}</td>
                      <td className="py-3 px-3 font-medium">{row.model}</td>
                      <td className="py-3 px-3 text-outline">{row.years}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-outline">{row.engine}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Technical Specs (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-surface-container shadow-xs space-y-4">
            <h3 className="text-lg font-headline font-bold text-primary border-b border-surface-container pb-4">
              Especificaciones de Fabricación
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-surface-container">
                <span className="text-outline">Marca Fabricante:</span>
                <span className="font-bold text-primary">{part.brand}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surface-container">
                <span className="text-outline">País de Procedencia:</span>
                <span className="font-bold text-on-surface">Alemania / Japón (Certificado)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surface-container">
                <span className="text-outline">Compuesto de Fricción:</span>
                <span className="font-bold text-on-surface">Cerámica Avanzada Low-Metallic</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surface-container">
                <span className="text-outline">Norma de Homologación:</span>
                <span className="font-bold text-emerald-700">ECE-R90 &amp; DOT FMVSS 135</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surface-container">
                <span className="text-outline">Garantía Escrita:</span>
                <span className="font-bold text-on-surface">12 Meses o 20,000 km</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-outline">Vida Útil Estimada:</span>
                <span className="font-bold text-on-surface">45,000 - 60,000 km en condiciones urbanas</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container text-xs text-outline space-y-1">
              <strong className="text-primary block font-bold">Sellado y Holograma de Seguridad</strong>
              Cada caja incluye código QR de autenticidad verificable en la red oficial de Nor Celis para evitar falsificaciones en el mercado peruano.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
