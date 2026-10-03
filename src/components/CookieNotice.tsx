import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const STORAGE_KEY = 'norcelis_cookie_notice_v1';

/**
 * Aviso de cookies y almacenamiento local. El sitio solo usa almacenamiento necesario
 * para funcionar (sesión, carrito, garaje); el aviso informa y enlaza la política.
 */
export const CookieNotice: React.FC = () => {
  const { navigateToTerms } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(!localStorage.getItem(STORAGE_KEY));
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // sin almacenamiento disponible: el aviso se mostrará de nuevo
    }
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-3xl mx-auto bg-white text-[#212955] rounded-2xl shadow-[var(--shadow-xl)] border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <p className="text-xs sm:text-[13px] leading-relaxed text-gray-700 flex-1">
          Usamos cookies y almacenamiento local necesarios para que el sitio funcione (sesión, carrito y tu garaje).
          Conoce más en nuestra{' '}
          <button
            type="button"
            onClick={() => navigateToTerms('cookies')}
            className="font-bold text-[#F07F00] hover:underline cursor-pointer"
          >
            Política de Cookies
          </button>{' '}
          y en la{' '}
          <button
            type="button"
            onClick={() => navigateToTerms('privacy')}
            className="font-bold text-[#F07F00] hover:underline cursor-pointer"
          >
            Política de Privacidad
          </button>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="btn-primary min-h-[44px] px-6 text-sm shrink-0"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
