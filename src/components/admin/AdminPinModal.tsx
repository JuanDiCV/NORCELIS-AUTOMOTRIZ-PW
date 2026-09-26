import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPin: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === currentPin) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPin('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        if (nextPin === currentPin) {
          onSuccess();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 300);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#9D9D9C]/30 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#212955] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-[#F07F00]">admin_panel_settings</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-[#212955]">
                Acceso Administrativo
              </h3>
              <p className="text-[11px] text-gray-500">
                Nor Celis Automotriz
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-600">
              Ingresa el código PIN de 4 dígitos para ingresar al panel de publicidad y catálogo:
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map((i) => {
              const isFilled = pin.length > i;
              return (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                    error
                      ? 'bg-red-500 scale-110'
                      : isFilled
                      ? 'bg-[#F07F00] scale-125'
                      : 'bg-gray-200 border border-[#9D9D9C]/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Hidden input for direct typing */}
          <input
            ref={inputRef}
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPin(val);
              setError(false);
              if (val.length === 4) {
                if (val === currentPin) {
                  onSuccess();
                } else {
                  setError(true);
                  setTimeout(() => setPin(''), 300);
                }
              }
            }}
            className="sr-only"
            autoFocus
          />

          {error && (
            <p className="text-center text-xs text-red-600 font-bold animate-pulse">
              PIN incorrecto. Intenta nuevamente.
            </p>
          )}

          {/* Numeric Keypad for fast touch & mouse interaction */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="h-11 rounded-xl bg-gray-50 hover:bg-[#212955] hover:text-white text-[#212955] font-bold text-base transition-colors border border-[#9D9D9C]/20 active:scale-95 cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPin('');
                setError(false);
              }}
              className="h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold cursor-pointer"
            >
              Borrar
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-11 rounded-xl bg-gray-50 hover:bg-[#212955] hover:text-white text-[#212955] font-bold text-base transition-colors border border-[#9D9D9C]/20 active:scale-95 cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
              title="Retroceder"
            >
              <span className="material-symbols-outlined text-lg">backspace</span>
            </button>
          </div>

          <div className="pt-2 text-center border-t border-gray-100">
            <span className="text-[11px] text-gray-400 block">
              PIN predeterminado de fábrica:{' '}
              <strong className="text-[#212955] font-mono">1234</strong>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
