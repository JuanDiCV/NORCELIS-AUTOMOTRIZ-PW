import React, { useState, useRef, useCallback } from 'react';
import { SafeImage } from './SafeImage';

interface FocalZoomImageProps {
  src: string;
  alt: string;
  typeHint?: 'vehicle' | 'part' | 'service';
  categoryHint?: string;
  fallbackSrc?: string;
  className?: string;
  aspectRatioClass?: string;
  badge?: string;
  discountBadge?: string;
  subBadge?: string;
  showMagnifierControls?: boolean;
  onOpenFullscreen?: () => void;
}

export const FocalZoomImage: React.FC<FocalZoomImageProps> = ({
  src,
  alt,
  typeHint = 'part',
  categoryHint,
  fallbackSrc,
  className = '',
  aspectRatioClass = 'aspect-[16/10]',
  badge,
  discountBadge,
  subBadge,
  showMagnifierControls = true,
  onOpenFullscreen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(2.8);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, []);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenFullscreen) {
      onOpenFullscreen();
    } else {
      setIsFullscreenModalOpen(true);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={() => setIsZooming(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setIsZooming(false);
          setZoomOrigin({ x: 50, y: 50 });
        }}
        onTouchStart={() => setIsZooming(true)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          setIsZooming(false);
          setZoomOrigin({ x: 50, y: 50 });
        }}
        className={`relative ${aspectRatioClass} bg-surface-container-lowest rounded-3xl border border-surface-container overflow-hidden shadow-sm group select-none cursor-crosshair ${className}`}
      >
        {/* Main Image with transform origin & scale */}
        <div className="w-full h-full p-4 flex items-center justify-center overflow-hidden">
          <SafeImage
            src={src}
            fallbackSrc={fallbackSrc}
            typeHint={typeHint}
            categoryHint={categoryHint}
            alt={alt}
            style={{
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              transform: isZooming ? `scale(${zoomLevel})` : 'scale(1)',
              transition: isZooming
                ? 'transform-origin 0.04s ease-out, transform 0.15s ease-out'
                : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform-origin 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              imageRendering: 'auto',
            }}
            className="max-h-full max-w-full object-contain pointer-events-none will-change-transform"
          />
        </div>

        {/* Badges overlay */}
        <div
          className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none transition-opacity duration-200"
          style={{ opacity: isZooming ? 0.35 : 1 }}
        >
          {badge && (
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-lg shadow-md">
              {badge}
            </span>
          )}
          {discountBadge && (
            <span className="bg-secondary-container text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md">
              {discountBadge}
            </span>
          )}
          {subBadge && (
            <span className="bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md">
              {subBadge}
            </span>
          )}
        </div>

        {/* Reticle targeting crosshair when zooming */}
        {isZooming && (
          <div
            className="absolute pointer-events-none w-16 h-16 -ml-8 -mt-8 rounded-full border-2 border-cyan-400/90 shadow-[0_0_15px_rgba(6,182,212,0.6)] backdrop-brightness-110 flex items-center justify-center transition-all duration-75 z-10"
            style={{ left: `${zoomOrigin.x}%`, top: `${zoomOrigin.y}%` }}
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm animate-ping" />
            <div className="absolute w-3 h-0.5 bg-cyan-300 -left-1" />
            <div className="absolute w-3 h-0.5 bg-cyan-300 -right-1" />
            <div className="absolute h-3 w-0.5 bg-cyan-300 -top-1" />
            <div className="absolute h-3 w-0.5 bg-cyan-300 -bottom-1" />
          </div>
        )}

        {/* Interactive Top HUD with Zoom Magnification Selector */}
        {showMagnifierControls && (
          <div
            className={`absolute top-4 right-4 z-20 flex items-center gap-2 transition-all duration-200 ${
              isZooming ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'
            }`}
          >
            {isZooming ? (
              <div className="bg-black/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-cyan-400/40 shadow-xl flex items-center gap-2.5 pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-1.5 pointer-events-none">
                  <span className="material-symbols-outlined text-[15px] text-cyan-300 animate-pulse">
                    zoom_in
                  </span>
                  <span className="text-[11px]">Zoom Focal ({zoomLevel}x)</span>
                </div>
                <div className="h-3 w-px bg-white/30" />
                <div className="flex items-center gap-1 text-[11px]">
                  {[2.0, 2.8, 3.8].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomLevel(lvl);
                      }}
                      className={`px-1.5 py-0.5 rounded font-extrabold transition-all cursor-pointer ${
                        zoomLevel === lvl
                          ? 'bg-cyan-500 text-white shadow-xs'
                          : 'bg-white/20 text-white/80 hover:bg-white/40'
                      }`}
                    >
                      {lvl}x
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-outline border border-surface-container shadow-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">search</span>
                <span>Pasa el cursor para Zoom Focal HD</span>
              </div>
            )}

            {/* Expand / Fullscreen button */}
            <button
              type="button"
              onClick={handleOpenModal}
              title="Inspeccionar en Pantalla Completa HD"
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-on-surface flex items-center justify-center shadow-md border border-surface-container cursor-pointer transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-base text-primary">fullscreen</span>
            </button>
          </div>
        )}

        {/* Bottom Hint */}
        <div
          className="absolute bottom-3 right-3 pointer-events-none transition-opacity duration-200"
          style={{ opacity: isZooming ? 0 : 0.9 }}
        >
          <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-md font-mono backdrop-blur-xs">
            Detalle &amp; Textura HD
          </span>
        </div>
      </div>

      {/* Fullscreen HD Inspection Modal */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 md:p-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-cyan-400">zoom_in</span>
              <div>
                <h3 className="font-bold text-base md:text-lg">{alt}</h3>
                <p className="text-xs text-white/70">Inspección de Textura, Grabado y Acabado de Alta Resolución</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs">
                <span className="px-2 text-white/70">Nivel de Zoom:</span>
                {[2.0, 2.8, 4.0, 5.5].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setZoomLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      zoomLevel === lvl ? 'bg-cyan-500 text-white' : 'hover:bg-white/20 text-white/80'
                    }`}
                  >
                    {lvl}x
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsFullscreenModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Large Interactive Focal Area */}
          <div
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="flex-1 relative flex items-center justify-center overflow-hidden cursor-crosshair mt-4 rounded-3xl bg-neutral-900 border border-white/10"
          >
            <SafeImage
              src={src}
              fallbackSrc={fallbackSrc}
              typeHint={typeHint}
              categoryHint={categoryHint}
              alt={alt}
              style={{
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                transform: `scale(${zoomLevel})`,
                transition: 'transform-origin 0.03s ease-out, transform 0.15s ease-out',
              }}
              className="max-h-[85vh] max-w-[85vw] object-contain select-none pointer-events-none will-change-transform"
            />

            {/* Targeting Reticle in modal */}
            <div
              className="absolute pointer-events-none w-20 h-20 -ml-10 -mt-10 rounded-full border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)] backdrop-brightness-125 flex items-center justify-center"
              style={{ left: `${zoomOrigin.x}%`, top: `${zoomOrigin.y}%` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm animate-ping" />
              <div className="absolute w-4 h-0.5 bg-cyan-300 -left-2" />
              <div className="absolute w-4 h-0.5 bg-cyan-300 -right-2" />
              <div className="absolute h-4 w-0.5 bg-cyan-300 -top-2" />
              <div className="absolute h-4 w-0.5 bg-cyan-300 -bottom-2" />
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white/90 border border-white/20 flex items-center gap-2 pointer-events-none">
              <span className="material-symbols-outlined text-cyan-400 text-sm">touch_app</span>
              <span>Mueve el cursor o dedo para inspeccionar cada detalle y grabado del repuesto</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
