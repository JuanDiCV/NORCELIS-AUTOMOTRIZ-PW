import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useApp } from '../context/AppContext';

// Container variant with staggerChildren for sequential entrance
const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    transition: {
      staggerChildren: 0.06,
      staggerDirection: -1,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
      duration: 0.2,
    },
  },
};

// Item variant with gentle spring and bounce effect
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.75,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 22,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.8,
    transition: {
      duration: 0.15,
      ease: 'easeInOut' as const,
    },
  },
};

export const FloatingHub: React.FC = () => {
  const {
    openQuickQuote,
    isAdvisorChatOpen,
    setIsAdvisorChatOpen,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const hubRef = useRef<HTMLDivElement>(null);

  // Close Speed Dial when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hubRef.current && !hubRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // When advisor chat is open, we minimize the hub so it doesn't obstruct the chat window
  if (isAdvisorChatOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40 pointer-events-auto">
        <motion.button
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 10 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAdvisorChatOpen(false)}
          className="flex items-center gap-2 bg-[#F07F00] hover:bg-[#d97300] text-white px-4 py-2.5 rounded-full shadow-2xl font-bold text-xs border border-white/30 transition-colors cursor-pointer"
          title="Minimizar Asesor Virtual"
          aria-label="Cerrar chatbox"
        >
          <span className="material-symbols-outlined text-base">expand_more</span>
          <span>Cerrar Chat Don Celis</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div
      ref={hubRef}
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto select-none"
    >
      {/* SPEED DIAL EXPANDED ITEMS */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="speed-dial-items"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-end gap-3 mb-3"
          >
            {/* ICONO 1: ASESOR VIRTUAL IA (Don Celis) */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2.5 group"
            >
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                className="bg-[#212955] text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg border border-white/10 opacity-95 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
              >
                Asesor Virtual Don Celis IA (24/7)
              </motion.span>
              <motion.button
                whileHover={{ scale: 1.08, rotate: 2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setIsAdvisorChatOpen(true);
                  setIsExpanded(false);
                }}
                className="w-13 h-13 rounded-2xl bg-[#212955] hover:bg-[#181e40] text-white flex items-center justify-center shadow-xl hover:shadow-indigo-950/40 border-2 border-[#F07F00] transition-colors cursor-pointer relative"
                title="Abrir Asesor Automotriz Virtual Don Celis IA"
                aria-label="Asesor Virtual IA"
              >
                <span className="material-symbols-outlined text-2xl text-[#F07F00]">smart_toy</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-[#212955] rounded-full animate-pulse indicator-dot" />
              </motion.button>
            </motion.div>

            {/* ICONO 2: WHATSAPP OFICIAL (Asesor Humano) */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2.5 group"
            >
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                className="bg-[#128C7E] text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-lg border border-white/10 opacity-95 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
              >
                WhatsApp Oficial (910 446 152)
              </motion.span>
              <motion.a
                whileHover={{ scale: 1.08, rotate: -2 }}
                whileTap={{ scale: 0.92 }}
                href="https://wa.me/51910446152?text=Hola%20Nor%20Celis,%20deseo%20asesoria%20personalizada%20y%20cotizaciones"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsExpanded(false)}
                className="w-13 h-13 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-xl hover:shadow-green-500/30 border-2 border-white/30 transition-colors cursor-pointer"
                title="Contactar Asesor Humano por WhatsApp"
                aria-label="WhatsApp Asesor Humano"
              >
                <span className="material-symbols-outlined text-2xl">chat</span>
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÓN PRINCIPAL DE COTIZACIÓN (NARANJA NORCELIS - SPEED DIAL TRIGGER) */}
      <div className="flex items-center gap-2">
        {/* En estado expandido, botón de cierre rápido */}
        <AnimatePresence>
          {isExpanded && (
            <motion.button
              key="close-btn"
              initial={{ opacity: 0, scale: 0.7, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: 45 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              whileHover={{ scale: 1.08, backgroundColor: 'rgba(15, 23, 42, 1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(false)}
              className="w-10 h-10 rounded-full bg-slate-800/90 text-white flex items-center justify-center shadow-md border border-white/20 transition-colors cursor-pointer"
              title="Cerrar menú Speed Dial"
              aria-label="Cerrar opciones"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* BOTÓN PRINCIPAL NARANJA ANIMADO */}
        <motion.button
          layout
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          onClick={() => {
            if (isExpanded) {
              openQuickQuote();
              setIsExpanded(false);
            } else {
              setIsExpanded(true);
            }
          }}
          className={`group flex items-center gap-3 px-4 sm:px-5 py-3.5 rounded-2xl shadow-2xl border cursor-pointer ${
            isExpanded
              ? 'bg-[#F07F00] hover:bg-[#d97300] text-white border-white/40 ring-4 ring-[#F07F00]/30'
              : 'bg-gradient-to-r from-[#F07F00] via-[#ff8800] to-[#e67300] hover:from-[#e07500] hover:to-[#cc6600] text-white border-white/30 shadow-orange-950/40'
          }`}
          title={
            isExpanded
              ? 'Clic para abrir Cotizador Rápido Oficial'
              : 'Cotización Rápida y Canales de Atención Norcelis'
          }
          aria-expanded={isExpanded}
          aria-label="Botón Principal de Cotización Norcelis"
        >
          {/* Icono de Cotización Principal */}
          <div className="relative w-7 h-7 flex items-center justify-center text-white">
            <motion.span
              animate={{ rotate: isExpanded ? 12 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="material-symbols-outlined text-2xl group-hover:rotate-6 transition-transform"
            >
              request_quote
            </motion.span>
            {!isExpanded && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping indicator-dot" />
            )}
          </div>

          {/* Texto y Etiqueta Principal */}
          <div className="text-left">
            <div className="text-[10px] font-black uppercase text-amber-100 font-headline leading-tight tracking-wider">
              {isExpanded ? 'Abrir Formulario' : 'Cotización Rápida'}
            </div>
            <div className="text-xs sm:text-sm font-black tracking-wide leading-tight text-white font-headline">
              {isExpanded ? 'Cotizar en PDF' : 'Cotizar Ahora'}
            </div>
          </div>

          {/* Indicador de Despliegue Speed Dial */}
          <div className="ml-1 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="material-symbols-outlined text-sm"
            >
              expand_less
            </motion.span>
          </div>
        </motion.button>
      </div>
    </div>
  );
};
