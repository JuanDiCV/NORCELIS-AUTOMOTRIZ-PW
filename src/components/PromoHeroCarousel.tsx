import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { HeroSlide } from '../types';
import { INITIAL_HERO_SLIDES } from '../data/mockData';

export const PromoHeroCarousel: React.FC = () => {
  const { setCurrentView, navigateToPartsCatalog, showToast, promoSlides } = useApp();
  const slides = (promoSlides && promoSlides.length > 0 ? promoSlides : INITIAL_HERO_SLIDES).filter((s) => s.active !== false);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  // Auto slide progression
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  // Ensure index stays valid if slides array length changes
  useEffect(() => {
    if (currentSlideIndex >= slides.length) {
      setCurrentSlideIndex(0);
    }
  }, [slides.length, currentSlideIndex]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
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

  const activeSlide = slides[currentSlideIndex] || slides[0];
  if (!activeSlide) return null;

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
          {slides.map((_, idx) => {
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
