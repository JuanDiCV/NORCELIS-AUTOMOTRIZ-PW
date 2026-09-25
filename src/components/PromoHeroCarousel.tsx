import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

interface HeroSlide {
  id: string;
  campaignBadge: string;
  categoryTitle: string;
  categorySubtitle?: string;
  buttonText: string;
  targetView: 'parts' | 'services' | 'cars';
  targetCategory?: string;
  targetBrand?: string;
  productBrand: string;
  productTitle: string;
  productPrice: number;
  offerPrice: number;
  normalPrice: number;
  productPng: string;
  backgroundImage: string;
  bgGradient: string;
}

const SLIDES: HeroSlide[] = [
  {
    id: 'slide-tools-parts',
    campaignBadge: 'Día del Shopping',
    categoryTitle: 'HERRAMIENTAS & EQUIPOS',
    categorySubtitle: 'TALLER AUTOMOTRIZ & BRICOLAJE',
    buttonText: '¡VER TODO!',
    targetView: 'parts',
    targetCategory: 'herramientas',
    productBrand: 'PRETUL / TOPTUL PRO',
    productTitle: 'Maletín de 104 Herramientas Mecánicas y Dados Cromo',
    productPrice: 99,
    offerPrice: 119,
    normalPrice: 181.70,
    // Transparent PNG cutout of mechanic tool set
    productPng: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=700&q=80',
    backgroundImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80',
    bgGradient: 'from-[#65a30d]/90 via-[#4d7c0f]/80 to-[#1e3a8a]/70',
  },
  {
    id: 'slide-brakes-oem',
    campaignBadge: 'Día del Repuesto',
    categoryTitle: 'FRENOS & DISCOS OEM',
    categorySubtitle: 'MÁXIMA SEGURIDAD Y FRENADO',
    buttonText: '¡VER TODO!',
    targetView: 'parts',
    targetCategory: 'frenos',
    productBrand: 'BREMBO RACING',
    productTitle: 'Juego de Discos Ventilados + Pastillas Cerámicas',
    productPrice: 295,
    offerPrice: 340,
    normalPrice: 420,
    productPng: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm2ZVyPDgaG_gT5Wlg5rKy4I0y0Y_fr6zB51Ec6gRO9a7UFdIO1N0ljWWg_U6h2wgDrYr2yed5l2g6yIoSBO0O3rK22XateCDgT6pxwfz8tPd8N8z5MZqE5Q_qtDqThCSeAz5RnI3Zxa1HZvziVUiK0IaPbFuspln3dVL-Bdmgt2mDj1rbqvT1S1UrNC8kr6JdBPLRstTEB7C10Ni__fvF0uRzB1pc-VBBtjEZmy1nTX_wD-VBIBJc',
    backgroundImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1920&q=80',
    bgGradient: 'from-[#84cc16]/90 via-[#65a30d]/80 to-[#0f172a]/75',
  },
  {
    id: 'slide-workshop-maintenance',
    campaignBadge: 'Día del Taller',
    categoryTitle: 'MANTENIMIENTO PRO',
    categorySubtitle: 'PAQUETES 10K / 20K / 40K',
    buttonText: '¡VER TODO!',
    targetView: 'services',
    productBrand: 'NOR CELIS SERVICE',
    productTitle: 'Mantenimiento Preventivo 10,000 km + Escaneo 3D',
    productPrice: 280,
    offerPrice: 350,
    normalPrice: 450,
    productPng: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=700&q=80',
    backgroundImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80',
    bgGradient: 'from-[#0284c7]/90 via-[#0369a1]/80 to-[#0f172a]/75',
  },
  {
    id: 'slide-4x4-accessories',
    campaignBadge: 'Cyber 4x4 Off-Road',
    categoryTitle: 'EQUIPAMIENTO 4X4',
    categorySubtitle: 'EXPEDICIÓN & SUSPENSIÓN',
    buttonText: '¡VER TODO!',
    targetView: 'parts',
    targetCategory: 'accesorios4x4',
    productBrand: 'KEKO / IRONMAN 4X4',
    productTitle: 'Barra Antivuelco K3 Heavy Duty + Winche 12000 lbs',
    productPrice: 1450,
    offerPrice: 1720,
    normalPrice: 1980,
    productPng: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdfVk_uYU8eyl8B4OWkZBEHTgEzsPGkIncWquDyZZjMrwZFQQJKU56rlYaGlskvXDCkuAzLoEgwFmTBOx7MpraATJaeBjdVy72h8TGgX_9kyc6zinSO3C2W8zat5rg0JLFAwbtKUOqE-cEYvsfgnBBYaBBrY36BEYRMbRJUloNvSFA7u82WjHQ7p2fRNUZm_ilig0UZpRPV6VE-xoDtcZI8UvbupdMs4YqOPtxDElx2yFMOzPAoh1T',
    backgroundImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1920&q=80',
    bgGradient: 'from-[#84cc16]/90 via-[#4d7c0f]/80 to-[#1e293b]/75',
  },
  {
    id: 'slide-oem-filters-oil',
    campaignBadge: 'Promo Especial',
    categoryTitle: 'ACEITES & FILTROS',
    categorySubtitle: '100% SINTÉTICO CERTIFICADO',
    buttonText: '¡VER TODO!',
    targetView: 'parts',
    targetCategory: 'lubricantes',
    productBrand: 'MOBIL 1 FULL SYNTHETIC',
    productTitle: 'Galón 5W-30 Dexos1 Gen3 + Filtro de Aceite OEM',
    productPrice: 165,
    offerPrice: 195,
    normalPrice: 240,
    productPng: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f?auto=format&fit=crop&w=700&q=80',
    backgroundImage: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=1920&q=80',
    bgGradient: 'from-[#059669]/90 via-[#047857]/80 to-[#0f172a]/75',
  },
];

export const PromoHeroCarousel: React.FC = () => {
  const { setCurrentView, navigateToPartsCatalog, showToast } = useApp();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Auto slide progression
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handleSlideClick = (slide: HeroSlide) => {
    if (slide.targetView === 'parts') {
      navigateToPartsCatalog(slide.targetCategory || 'todos', slide.targetBrand);
      showToast(`Mostrando ofertas de ${slide.categoryTitle}`);
    } else if (slide.targetView === 'services') {
      setCurrentView('services');
      showToast('Redirigiendo a servicios de taller...');
    } else {
      setCurrentView('cars');
      showToast('Mostrando catálogo de vehículos...');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (deltaX > 45) {
      handlePrev();
    } else if (deltaX < -45) {
      handleNext();
    }
    touchStartXRef.current = null;
  };

  const activeSlide = SLIDES[currentSlideIndex];

  return (
    <section className="px-0 sm:px-gutter">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative max-w-7xl mx-auto overflow-hidden sm:rounded-2xl shadow-lg select-none group bg-slate-900"
        style={{
          minHeight: '320px',
        }}
      >
        {/* Background photo + gradient overlay without blocking */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeSlide.backgroundImage}
            alt={activeSlide.categoryTitle}
            className="w-full h-full object-cover object-center transition-all duration-700 opacity-60 scale-105 group-hover:scale-100"
          />
          {/* Dynamic Falabella-style gradient: Lime / Blue / Emerald vibrant tint */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${activeSlide.bgGradient} mix-blend-multiply opacity-90 transition-all duration-700`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>

        {/* Slide Content: Clean, Open Layout (No White Box!), Large Legible Typography */}
        <div
          onClick={() => handleSlideClick(activeSlide)}
          className="relative z-10 w-full min-h-[320px] md:min-h-[360px] lg:min-h-[390px] flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 lg:p-12 cursor-pointer"
        >
          {/* LEFT ZONE: Prominent campaign logo, Extra-large category headline & ¡VER TODO! button */}
          <div className="w-full md:w-5/12 flex flex-col items-start justify-center space-y-4 lg:space-y-5 z-20">
            {/* Logo de Campaña (Estilo DS Día del Shopping Falabella) */}
            <div className="inline-flex items-center gap-2.5 bg-[#1d4ed8] text-white px-4 py-2 rounded-2xl shadow-lg border border-blue-400/40">
              <div className="bg-white text-[#1d4ed8] font-black text-base px-2 py-0.5 rounded-lg leading-none tracking-tight shadow-xs">
                DS
              </div>
              <div className="text-sm font-bold leading-tight tracking-tight">
                <span className="block text-[11px] uppercase font-semibold text-blue-200">Día del</span>
                <span className="font-extrabold text-sm tracking-wide">{activeSlide.campaignBadge.replace('Día del ', '')}</span>
              </div>
            </div>

            {/* Titular de Categoría en Letras Grandes y Legibles */}
            <div className="space-y-1">
              <h2 className="font-headline font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight uppercase text-white drop-shadow-md leading-[1.08]">
                {activeSlide.categoryTitle}
              </h2>
              {activeSlide.categorySubtitle && (
                <p className="text-white/80 font-bold text-xs sm:text-sm tracking-widest uppercase">
                  {activeSlide.categorySubtitle}
                </p>
              )}
            </div>

            {/* Botón ¡VER TODO! (Pill Button con flecha) */}
            <div className="pt-2">
              <button
                type="button"
                className="bg-[#18181b] hover:bg-black text-white px-7 py-3 rounded-full font-black text-sm tracking-wider flex items-center gap-3 shadow-xl hover:scale-105 transition-all cursor-pointer border border-white/20"
              >
                <span>{activeSlide.buttonText}</span>
                <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                  ›
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT ZONE: Hero PNG Product without background + Large Price Showcase */}
          <div className="w-full md:w-7/12 flex flex-col sm:flex-row items-center justify-end mt-6 md:mt-0 gap-6 lg:gap-8 z-20">
            {/* Transparent Cutout PNG Product Image (Large & Crisp) */}
            <div className="relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500">
              <img
                src={activeSlide.productPng}
                alt={activeSlide.productTitle}
                className="w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] filter"
              />
            </div>

            {/* Product Details & Lime Green Price Box (Over the background, completely free of white container) */}
            <div className="flex flex-col items-start sm:items-end text-left sm:text-right space-y-3 max-w-xs">
              <div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-lime-300 drop-shadow-md block">
                  {activeSlide.productBrand}
                </span>
                <h3 className="text-base sm:text-lg lg:text-xl font-black text-white drop-shadow-lg leading-tight line-clamp-2">
                  {activeSlide.productTitle}
                </h3>
              </div>

              {/* Price Banner: Big Lime Green Tag + Offer/Normal Compare */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-black/40 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-xl">
                {/* Lime green big price box (Falabella highlight) */}
                <div className="bg-[#a3e635] text-[#142303] px-4 py-2 rounded-xl text-center shadow-md flex flex-col justify-center min-w-[110px]">
                  <span className="font-headline font-black text-xl sm:text-2xl lg:text-3xl leading-none tracking-tight">
                    S/ {activeSlide.productPrice.toLocaleString(undefined, { minimumFractionDigits: activeSlide.productPrice % 1 !== 0 ? 2 : 0 })}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-tight opacity-95 leading-tight mt-0.5">
                    Oportunidad Única
                  </span>
                </div>

                {/* Offer & Normal prices in crisp, legible typography */}
                <div className="text-xs sm:text-sm text-white font-medium leading-tight space-y-1 text-left pr-2">
                  <div>
                    P. Oferta: <strong className="text-white font-black">S/ {activeSlide.offerPrice.toLocaleString(undefined, { minimumFractionDigits: activeSlide.offerPrice % 1 !== 0 ? 2 : 0 })}</strong>
                  </div>
                  <div className="text-white/70">
                    P. Normal: <span className="line-through">S/ {activeSlide.normalPrice.toLocaleString(undefined, { minimumFractionDigits: activeSlide.normalPrice % 1 !== 0 ? 2 : 0 })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Bottom Center Dot Indicators (Falabella style) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
          {SLIDES.map((_, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-7 h-2.5 bg-[#a3e635] shadow-xs'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Ir a la diapositiva ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm border border-white/20"
          aria-label="Diapositiva anterior"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm border border-white/20"
          aria-label="Diapositiva siguiente"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </section>
  );
};
