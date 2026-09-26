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
    <section className="px-0 sm:px-gutter">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative max-w-7xl mx-auto overflow-hidden sm:rounded-3xl shadow-2xl select-none group bg-[#212955] border border-white/15"
        style={{ minHeight: '360px' }}
      >
        {/* Slides Stack Container with Elegant Fade-In Transitions */}
        <div className="relative w-full min-h-[360px] md:min-h-[400px] lg:min-h-[430px]">
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
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={slide.backgroundImage}
                    alt={slide.categoryTitle}
                    className="w-full h-full object-cover object-center opacity-85 sm:opacity-90 transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  {/* Gradiente sutil de Azul Empresarial (#212955) a transparente para contraste del texto sin oscurecer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#212955]/90 via-[#212955]/50 to-transparent transition-opacity duration-700" />
                  {/* Gradiente sutil inferior hacia transparente para soporte de controles */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#212955]/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Slide Interactive Content */}
                <div
                  onClick={() => handleSlideClick(slide)}
                  className="relative z-10 w-full h-full min-h-[360px] md:min-h-[400px] lg:min-h-[430px] flex flex-col md:flex-row items-center justify-between p-6 sm:p-10 lg:p-12 cursor-pointer pb-14 sm:pb-16"
                >
                  {/* LEFT ZONE: Campaign badge, Category Title, Call to Action */}
                  <div className="w-full md:w-5/12 flex flex-col items-start justify-center space-y-3.5 lg:space-y-4.5 z-20">
                    {/* Badge de Campaña Oficial */}
                    <div className="inline-flex items-center gap-2.5 bg-[#212955]/90 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl shadow-lg border border-[#F07F00]/50 ring-1 ring-white/15 transition-transform hover:scale-105 duration-300">
                      <div className="bg-[#F07F00] text-white font-black text-sm px-2 py-0.5 rounded-md leading-none tracking-tight shadow-xs font-headline">
                        NC
                      </div>
                      <div className="text-xs font-bold leading-tight tracking-tight">
                        <span className="block text-[10px] uppercase font-semibold text-[#9D9D9C]">Exclusivo</span>
                        <span className="font-extrabold text-xs tracking-wider text-white font-headline uppercase">
                          {slide.campaignBadge}
                        </span>
                      </div>
                    </div>

                    {/* Titular Principal en Tipografía Bebas Neue */}
                    <div className="space-y-1">
                      <h2 className="font-headline font-black text-3xl sm:text-4xl lg:text-5xl tracking-normal uppercase text-white drop-shadow-md leading-[1.05]">
                        {slide.categoryTitle}
                      </h2>
                      {slide.categorySubtitle && (
                        <p className="text-[#F07F00] font-bold text-xs sm:text-sm tracking-widest uppercase font-headline">
                          {slide.categorySubtitle}
                        </p>
                      )}
                    </div>

                    {/* Botón de Acción Principal */}
                    <div className="pt-1">
                      <button
                        type="button"
                        className="bg-[#F07F00] hover:bg-[#d97300] active:scale-95 text-white px-7 sm:px-9 py-2.5 sm:py-3 rounded-full font-black text-sm tracking-wider flex items-center gap-3 shadow-xl hover:shadow-[#F07F00]/30 hover:scale-105 transition-all duration-300 cursor-pointer border border-white/25 font-headline"
                      >
                        <span>{slide.buttonText || '¡VER TODO!'}</span>
                        <span className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                          ›
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* RIGHT ZONE: Hero PNG Product Cutout with Studio Backdrop Glow & Pricing Card */}
                  <div className="w-full md:w-7/12 flex flex-col sm:flex-row items-center justify-end mt-6 md:mt-0 gap-6 lg:gap-8 z-20">
                    {/* Transparent Cutout PNG Product with Radial Studio Backlight */}
                    <div className="relative flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-700">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-[#F07F00]/30 to-[#212955]/10 rounded-full blur-2xl transform scale-95" />
                      <img
                        src={slide.productPng}
                        alt={slide.productTitle}
                        className="relative z-10 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)] filter transition-all duration-500"
                      />
                    </div>

                    {/* Product Details & Refined Pricing Tag */}
                    <div className="flex flex-col items-start sm:items-end text-left sm:text-right space-y-2.5 max-w-xs">
                      <div>
                        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#F07F00] drop-shadow-sm block font-headline">
                          {slide.productBrand}
                        </span>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white drop-shadow-md leading-snug line-clamp-2">
                          {slide.productTitle}
                        </h3>
                      </div>

                      {/* Clean Corporate Price Box */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-[#212955]/90 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-2xl">
                        {/* Orange Price Tag */}
                        <div className="bg-[#F07F00] text-white px-4 py-2 rounded-xl text-center shadow-lg flex flex-col justify-center min-w-[110px]">
                          <span className="font-headline font-black text-xl sm:text-2xl lg:text-3xl leading-none tracking-tight">
                            S/ {slide.productPrice.toLocaleString(undefined, { minimumFractionDigits: slide.productPrice % 1 !== 0 ? 2 : 0 })}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider opacity-95 leading-tight mt-0.5 font-headline">
                            Precio Exclusivo
                          </span>
                        </div>

                        {/* Comparative Offer / Normal prices */}
                        <div className="text-xs sm:text-sm text-white font-medium leading-tight space-y-1 text-left pr-2">
                          <div>
                            P. Oferta: <strong className="text-[#F07F00] font-black">S/ {slide.offerPrice.toLocaleString(undefined, { minimumFractionDigits: slide.offerPrice % 1 !== 0 ? 2 : 0 })}</strong>
                          </div>
                          <div className="text-[#9D9D9C]">
                            P. Normal: <span className="line-through">S/ {slide.normalPrice.toLocaleString(undefined, { minimumFractionDigits: slide.normalPrice % 1 !== 0 ? 2 : 0 })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM PAGINATION INDICATORS (Restored Clean Design with Nor Celis Corporate Orange Active Pill) */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#212955]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl">
          {/* Dots Navigation with Active Elongated Orange Pill */}
          <div className="flex items-center gap-2">
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlideIndex(idx);
                    setProgress(0);
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'w-7 sm:w-8 h-2.5 bg-gradient-to-r from-[#F07F00] to-[#ff9926] shadow-md shadow-[#F07F00]/50 ring-1 ring-white/50'
                      : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/70 hover:scale-125'
                  }`}
                  aria-label={`Ir a diapositiva ${idx + 1}: ${slide.categoryTitle}`}
                  title={slide.categoryTitle}
                >
                  {/* Subtle timer progress inside active pill */}
                  {isActive && (
                    <div
                      className="absolute inset-0 bg-white/25 transition-all duration-75"
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
