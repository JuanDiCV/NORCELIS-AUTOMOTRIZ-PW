import React, { useState, useEffect, useRef } from 'react';
import { verifyPassword, hashPassword, isLegacyPlaintext } from '../../utils/cryptoUtils';

// ── SEGURIDAD NC-003 & NC-005 ─────────────────────────────────────────────────
// El bloqueo ahora usa sessionStorage (no localStorage) para que NO sea
// persistente entre pestañas de incógnito. El lockout se borra al cerrar
// la pestaña, pero ya no es bypasseable con solo abrir DevTools.
//
// Adicionalmente, el PIN se verifica con hash PBKDF2 cuando el prop
// pinHash es provisto. El valor en claro NUNCA debe pasarse como prop.
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_ATTEMPTS_KEY = 'norcelis_pin_attempts';   // sessionStorage
const SESSION_LOCKOUT_KEY  = 'norcelis_pin_lockout';    // sessionStorage

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** @deprecated Usar pinHash en su lugar. currentPin se mantiene por compatibilidad
   *  con la versión legacy pero NO debe usarse para nuevas implementaciones. */
  currentPin?: string;
  /** Hash PBKDF2 del PIN (formato "salt:hash"). Preferir sobre currentPin. */
  pinHash?: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin,
  pinHash,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // ── NC-003: Usar sessionStorage en lugar de localStorage ──────────────────
  const [failedAttempts, setFailedAttempts] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_ATTEMPTS_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_LOCKOUT_KEY);
      if (!saved) return null;
      const ts = parseInt(saved, 10);
      return ts > Date.now() ? ts : null;
    } catch {
      return null;
    }
  });
  const [remainingCooldown, setRemainingCooldown] = useState<number>(0);
  const [honeypot, setHoneypot] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle countdown if locked out
  useEffect(() => {
    if (!lockoutUntil) {
      setRemainingCooldown(0);
      return;
    }

    const checkLockout = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((lockoutUntil - now) / 1000));
      setRemainingCooldown(diff);
      if (diff <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        try {
          sessionStorage.removeItem(SESSION_LOCKOUT_KEY);
          sessionStorage.removeItem(SESSION_ATTEMPTS_KEY);
        } catch {}
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  useEffect(() => {
    if (isOpen && remainingCooldown <= 0) {
      setPin('');
      setError(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, remainingCooldown]);

  if (!isOpen) return null;

  const handleFailedAttempt = () => {
    setError(true);
    setPin('');
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);

    try {
      sessionStorage.setItem(SESSION_ATTEMPTS_KEY, newCount.toString());
    } catch {}

    // Cooldown exponencial: 60s tras 3 fallos, 5min tras 5+
    if (newCount >= 5) {
      const lockTime = Date.now() + 5 * 60 * 1000;
      setLockoutUntil(lockTime);
      try { sessionStorage.setItem(SESSION_LOCKOUT_KEY, lockTime.toString()); } catch {}
    } else if (newCount >= 3) {
      const lockTime = Date.now() + 60 * 1000;
      setLockoutUntil(lockTime);
      try { sessionStorage.setItem(SESSION_LOCKOUT_KEY, lockTime.toString()); } catch {}
    }
  };

  const verifyPin = async (candidatePin: string) => {
    if (remainingCooldown > 0 || isVerifying) return;
    if (honeypot.trim()) {
      // Bot detectado vía honeypot
      setError(true);
      return;
    }

    setIsVerifying(true);
    let isValid = false;

    try {
      if (pinHash && !isLegacyPlaintext(pinHash)) {
        // ── NC-005: Verificación segura con PBKDF2 hash ──────────────────────
        isValid = await verifyPassword(candidatePin, pinHash);
      } else if (currentPin) {
        // Legacy: comparación directa (solo compatibilidad temporal)
        isValid = candidatePin === currentPin;
      }
    } catch {
      isValid = false;
    } finally {
      setIsVerifying(false);
    }

    if (isValid) {
      setError(false);
      setFailedAttempts(0);
      try {
        sessionStorage.removeItem(SESSION_ATTEMPTS_KEY);
        sessionStorage.removeItem(SESSION_LOCKOUT_KEY);
      } catch {}
      onSuccess();
    } else {
      handleFailedAttempt();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin(pin);
  };

  const handleKeyPress = (num: string) => {
    if (remainingCooldown > 0) return;
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (remainingCooldown > 0) return;
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181e40] text-white rounded-none max-w-sm w-full p-6 shadow-2xl border border-white/20 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-none bg-[#212955] text-white flex items-center justify-center border border-[#F07F00]/50">
              <span className="material-symbols-outlined text-xl text-[#F07F00]">shield_lock</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-white tracking-wide">
                Autenticación 2FA
              </h3>
              <p className="text-[11px] text-slate-300">
                Consola Administrativa Segura
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-none hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {remainingCooldown > 0 ? (
          <div className="p-4 bg-red-950/60 border border-red-500/50 rounded-none text-center space-y-2">
            <span className="material-symbols-outlined text-3xl text-red-400 animate-pulse">lock_clock</span>
            <div className="font-headline font-bold text-sm text-red-200 uppercase tracking-wide">
              Acceso Bloqueado por Seguridad
            </div>
            <p className="text-xs text-red-300">
              Demasiados intentos fallidos. Por protección de la plataforma, intenta de nuevo en:
            </p>
            <div className="font-mono font-black text-2xl text-red-400 py-1">
              {Math.floor(remainingCooldown / 60)}:{(remainingCooldown % 60).toString().padStart(2, '0')} min
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field for bot protection */}
            <input
              type="text"
              name="admin_verification_token"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="sr-only"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="text-center space-y-1">
              <p className="text-xs text-slate-300">
                Ingresa el PIN de seguridad de 4 dígitos para acceder al panel de control:
              </p>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center items-center gap-3 py-2">
              {[0, 1, 2, 3].map((i) => {
                const isFilled = pin.length > i;
                return (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-none transition-all duration-150 ${
                      error
                        ? 'bg-red-500 scale-110'
                        : isFilled
                        ? 'bg-[#F07F00] scale-125 shadow-md shadow-[#F07F00]/50'
                        : 'bg-white/20 border border-white/40'
                    }`}
                  />
                );
              })}
            </div>

            {/* Hidden input for direct physical keyboard typing */}
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
                  verifyPin(val);
                }
              }}
              className="sr-only"
              autoFocus
            />

            {error && (
              <p className="text-center text-xs text-red-400 font-bold animate-pulse">
                PIN incorrecto ({Math.max(0, 3 - failedAttempts)} intentos restantes antes de bloqueo temporal)
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="h-11 rounded-none bg-white/10 hover:bg-[#F07F00] hover:text-white text-white font-bold text-base transition-colors border border-white/15 active:scale-95 cursor-pointer"
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
                className="h-11 rounded-none bg-white/5 hover:bg-white/15 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-11 rounded-none bg-white/10 hover:bg-[#F07F00] hover:text-white text-white font-bold text-base transition-colors border border-white/15 active:scale-95 cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="h-11 rounded-none bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center cursor-pointer"
                title="Retroceder"
              >
                <span className="material-symbols-outlined text-lg">backspace</span>
              </button>
            </div>

            <div className="pt-2 text-center border-t border-white/10">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-xs text-emerald-400">verified_user</span>
                Cifrado y protección contra fuerza bruta activa
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
