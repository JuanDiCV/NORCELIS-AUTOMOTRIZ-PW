import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { HeroSlide } from '../types';
import { INITIAL_HERO_SLIDES } from '../data/mockData';

export const PromoHeroCarousel: React.FC = () => {
  const { setCurrentView, navigateToPartsCatalog, showToast, promoSlides } = useApp();
  const rawSlides = promoSlides && promoSlides.length > 0 ? promoSlides : INITIAL_HERO_SLIDES;
  const slides = rawSlides.filter((s) => s.active !== false);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const SLIDE_DURATION = 6000; // 6 seconds per slide

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  }, [slides.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, [slides.length]);

  // Smooth Auto Progress Bar & Slide Progression
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;

    const interval = 50; // Update progress every 50ms
    const step = (interval / SLIDE_DURATION) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [isHovered, slides.length, handleNext]);

  // Keep index valid
  useEffect(() => {
    if (currentSlideIndex >= slides.length && slides.length > 0) {
      setCurrentSlideIndex(0);
      setProgress(0);
    }
  }, [slides.length, currentSlideIndex]);

  const handleSlideClick = (slide: HeroSlide) => {
    if (slide.targetView === 'parts') {
      navigateToPartsCatalog(slide.targetCategory || 'todos', slide.targetBrand);
      showToast(`Explorando catálogo: ${slide.categoryTitle}`);
    } else if (slide.targetView === 'services') {
      setCurrentView('services');
      showToast('Redirigiendo a servicios y citas de taller...');
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

  if (!slides.length) return null;

  return (
    <section className="w-full">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full overflow-hidden shadow-2xl select-none group bg-[#212955]/[0.98] border-y border-white/15"
        style={{ minHeight: '480px' }}
      >
        {/* Slides Stack Container with Elegant Fade-In Transitions */}
        <div className="relative w-full min-h-[460px] sm:min-h-[500px] md:min-h-[540px] lg:min-h-[580px] xl:min-h-[620px]">
          {slides.map((slide, idx) => {
            const isCurrent = idx === currentSlideIndex;
            return (
              <div
                key={slide.id || idx}
                aria-hidden={!isCurrent}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                  isCurrent
                    ? 'opacity-100 z-10 pointer-events-auto'
                    : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Automotive Image with High Visibility & Subtle Corporate Gradient */}
                <div className="absolute inset-0 z-0 overflow-hidden bg-[#212955]/[0.98]">
                  <img
                    src={slide.backgroundImage}
                    alt={slide.categoryTitle}
                    className="w-full h-full object-cover object-center opacity-[0.98] transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  {/* Gradiente de Azul Empresarial (#212955) al 98% de opacidad */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#212955]/[0.98] via-[#212955]/70 to-transparent transition-opacity duration-700" />
                  {/* Gradiente sutil inferior hacia transparente para soporte de controles */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#212955]/[0.98] via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Slide Interactive Content */}
                <div
                  onClick={() => handleSlideClick(slide)}
                  className="relative z-10 w-full h-full min-h-[430px] sm:min-h-[480px] md:min-h-[520px] lg:min-h-[580px] xl:min-h-[620px] max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 items-center p-4 sm:p-8 md:p-10 lg:p-12 xl:p-14 cursor-pointer pb-14 sm:pb-18 md:pb-20 gap-4 sm:gap-6 lg:gap-8"
                >
                  {/* ZONE 1 (LEFT): Campaign badge, Category Title, Call to Action */}
                  <div className="col-span-12 md:col-span-4 lg:col-span-4 flex flex-col items-center md:items-start text-center md:text-left space-y-2 sm:space-y-3 md:space-y-4 z-20">
                    {/* Badge de Campaña Oficial */}
                    <div className="inline-flex items-center gap-2 bg-[#212955]/[0.98] backdrop-blur-md text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl shadow-lg border border-[#F07F00]/50 ring-1 ring-white/15 transition-transform hover:scale-105 duration-300">
                      <div className="bg-[#F07F00] text-white font-black text-xs px-2 py-0.5 rounded-md leading-none tracking-tight shadow-xs font-headline">
                        NC
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold leading-tight tracking-tight">
                        <span className="block text-[8px] sm:text-[9px] uppercase font-semibold text-[#9D9D9C]">Exclusivo</span>
                        <span className="font-extrabold text-[10px] sm:text-[11px] tracking-wider text-white font-headline uppercase">
                          {slide.campaignBadge}
                        </span>
                      </div>
                    </div>

                    {/* Titular Principal */}
                    <div className="space-y-0.5 sm:space-y-1">
                      <h2 className="font-['Bebas_Neue',sans-serif] font-normal text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl uppercase text-white drop-shadow-md leading-[0.95] tracking-wide">
                        {slide.categoryTitle}
                      </h2>
                      {slide.categorySubtitle && (
                        <p className="text-[#F07F00] font-bold text-[11px] sm:text-xs md:text-sm tracking-wider uppercase">
                          {slide.categorySubtitle}
                        </p>
                      )}
                    </div>

                    {/* Botón de Acción Principal */}
                    <div className="pt-0.5 sm:pt-1">
                      <button
                        type="button"
                        className="bg-[#F07F00] hover:bg-[#d97300] active:scale-95 text-white px-5 sm:px-6 md:px-7 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2 shadow-xl hover:shadow-[#F07F00]/30 hover:scale-105 transition-all duration-300 cursor-pointer border border-white/25"
                      >
                        <span>{slide.buttonText || '¡VER TODO!'}</span>
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/25 flex items-center justify-center text-xs font-bold">
                          ›
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* ZONE 2 (CENTER): Product Cutout / Image perfectly centered in its own column */}
                  <div className="col-span-12 md:col-span-4 lg:col-span-4 flex items-center justify-center z-20 px-2 my-1 sm:my-2 md:my-0">
                    <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-700 max-w-full">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-[#F07F00]/30 to-[#212955]/10 rounded-xl blur-2xl transform scale-95" />
                      <img
                        src={slide.productPng}
                        alt={slide.productTitle}
                        className="relative z-10 w-auto h-auto max-h-36 sm:max-h-48 md:max-h-56 lg:max-h-68 xl:max-h-76 max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)] filter transition-all duration-500 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* ZONE 3 (RIGHT): Product Details & Price Box aligned to the right */}
                  <div className="col-span-12 md:col-span-4 lg:col-span-4 flex flex-col items-center md:items-end text-center md:text-right space-y-2 sm:space-y-3 z-20">
                    <div className="text-center md:text-right w-full">
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#F07F00] drop-shadow-sm block">
                        {slide.productBrand}
                      </span>
                      <h3 className="text-xs sm:text-sm md:text-base font-bold text-white drop-shadow-md leading-snug line-clamp-2 mt-0.5">
                        {slide.productTitle}
                      </h3>
                    </div>

                    {/* Price Box Replica Exacto de la Imagen */}
                    <div className="bg-[#1E2644]/95 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-white/15 shadow-2xl flex items-center gap-2.5 sm:gap-3.5 md:gap-4 max-w-full overflow-hidden">
                      {/* Left: Solid Orange Badge with Big Price and PRECIO EXCLUSIVO */}
                      <div className="bg-[#F07F00] px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl flex flex-col items-center justify-center shadow-md min-w-[72px] sm:min-w-[85px] md:min-w-[95px] shrink-0">
                        <span className="font-['Bebas_Neue',sans-serif] text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-none text-white tracking-normal drop-shadow-sm whitespace-nowrap">
                          S/ {slide.productPrice.toLocaleString(undefined, { minimumFractionDigits: slide.productPrice % 1 !== 0 ? 2 : 0 })}
                        </span>
                        <span className="font-['Bebas_Neue',sans-serif] text-[9px] sm:text-[10px] md:text-[11px] tracking-wider uppercase text-white leading-none mt-0.5 text-center drop-shadow-sm whitespace-nowrap">
                          PRECIO EXCLUSIVO
                        </span>
                      </div>

                      {/* Right: Stacked Prices in Clean Single-Line Rows completely contained */}
                      <div className="flex flex-col justify-center text-left space-y-0.5 sm:space-y-1 shrink-0 pr-1">
                        <p className="text-[11px] sm:text-xs md:text-sm text-white font-bold leading-tight m-0 whitespace-nowrap flex items-baseline gap-1 sm:gap-1.5">
                          <span className="text-white/90">P. Oferta:</span>
                          <span className="text-[#F07F00] font-black text-xs sm:text-sm md:text-base">
                            S/ {slide.offerPrice.toLocaleString(undefined, { minimumFractionDigits: slide.offerPrice % 1 !== 0 ? 2 : 0 })}
                          </span>
                        </p>
                        <p className="text-[11px] sm:text-xs md:text-sm text-[#9D9D9C] font-semibold leading-tight m-0 whitespace-nowrap flex items-baseline gap-1 sm:gap-1.5">
                          <span className="text-[#9D9D9C]">P. Normal:</span>
                          <span className="line-through text-[#9D9D9C]/80">
                            S/ {slide.normalPrice.toLocaleString(undefined, { minimumFractionDigits: slide.normalPrice % 1 !== 0 ? 2 : 0 })}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM PAGINATION INDICATORS (Falabella Style Wheel Indicator: Clean rgba(52, 62, 73, 0.8) Capsule, No Heavy Borders) */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-[#343e49]/80 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlideIndex;
              const distance = Math.abs(idx - currentSlideIndex);

              let dotClass = 'w-2 h-2 bg-white/70';
              if (distance === 1) dotClass = 'w-2 h-2 bg-white/60';
              else if (distance === 2) dotClass = 'w-1.5 h-1.5 bg-white/45';
              else if (distance >= 3) dotClass = 'w-1.5 h-1.5 bg-white/35';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlideIndex(idx);
                    setProgress(0);
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer relative overflow-hidden shrink-0 ${
                    isActive
                      ? 'w-6 h-2 bg-white'
                      : `${dotClass} hover:bg-white hover:scale-125`
                  }`}
                  aria-label={`Ir a diapositiva ${idx + 1}: ${slide.categoryTitle}`}
                  title={slide.categoryTitle}
                >
                  {/* Active progress fill */}
                  {isActive && (
                    <div
                      className="absolute inset-0 bg-[#F07F00] transition-all duration-75"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SIDE FLOATING GLASSMORPHIC NAVIGATION ARROWS (Corporate Colors: Blue for Prev, Orange for Next) */}
        <button
          type="button"
          onClick={handlePrev}
          className="carousel-nav-buttons flex absolute left-2 sm:left-3.5 top-1/2 -translate-y-1/2 z-30 w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full btn-secondary-glass !p-0 items-center justify-center opacity-100 transition-all duration-300 shadow-md cursor-pointer hover:scale-105 active:scale-95"
          title="Diapositiva anterior"
          aria-label="Diapositiva anterior"
        >
          <span className="material-symbols-outlined text-[16px] sm:text-[17px] font-bold">chevron_left</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="carousel-nav-buttons flex absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-30 w-6.5 h-6.5 sm:w-7.5 sm:h-7.5 rounded-full btn-primary-glass !p-0 items-center justify-center opacity-100 transition-all duration-300 shadow-md shadow-[#F07F00]/25 cursor-pointer hover:scale-105 active:scale-95"
          title="Diapositiva siguiente"
          aria-label="Diapositiva siguiente"
        >
          <span className="material-symbols-outlined text-[16px] sm:text-[17px] font-bold">chevron_right</span>
        </button>
      </div>
    </section>
  );
};
