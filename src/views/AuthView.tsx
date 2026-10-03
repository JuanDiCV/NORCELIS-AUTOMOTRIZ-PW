import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NorCelisLogo } from '../components/NorCelisLogo';
import {
  DocumentType,
  validateDocument,
  formatDocumentInput,
  DocumentValidationResult,
} from '../utils/documentValidator';

export const AuthView: React.FC = () => {
  const {
    user,
    loginWithCredentials,
    registerAccount,
    logoutUser,
    setCurrentView,
    showToast,
    findAccountForRecovery,
    updateAccountPassword,
    navigateToTerms,
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery'>('login');

  // --- RECOVERY STATE ---
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryAccountData, setRecoveryAccountData] = useState<{
    found: boolean;
    maskedEmail?: string;
    maskedPhone?: string;
    accountName?: string;
    identifier?: string;
  } | null>(null);
  const [recoverySecurityCode, setRecoverySecurityCode] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState('');
  const [showRecoveryNewPassword, setShowRecoveryNewPassword] = useState(false);
  const [showRecoveryConfirmPassword, setShowRecoveryConfirmPassword] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryResendTimer, setRecoveryResendTimer] = useState<number>(0);
  const [isProcessingRecovery, setIsProcessingRecovery] = useState(false);

  // --- LOGIN STATE ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // --- REGISTER STATE ---
  const [regDocType, setRegDocType] = useState<DocumentType>('DNI');
  const [regDocNumber, setRegDocNumber] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regCarBrand, setRegCarBrand] = useState('Toyota');
  const [regCarModel, setRegCarModel] = useState('');
  const [regCarYear, setRegCarYear] = useState('2025');
  const [regAcceptTerms, setRegAcceptTerms] = useState(true);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // --- REAL-TIME DOCUMENT VALIDATION ---
  const docValidationResult: DocumentValidationResult = useMemo(() => {
    if (!regDocNumber) {
      return { isValid: false, error: null, formatted: '' };
    }
    return validateDocument(regDocType, regDocNumber);
  }, [regDocType, regDocNumber]);

  const handleDocNumberChange = (raw: string) => {
    const formatted = formatDocumentInput(regDocType, raw);
    setRegDocNumber(formatted);
    setRegErrors((prev) => ({ ...prev, docNumber: '' }));
  };

  // --- PASSWORD STRENGTH CRITERIA ---
  const passwordCriteria = useMemo(() => {
    return {
      minLength: regPassword.length >= 8,
      hasUpper: /[A-Z]/.test(regPassword),
      hasLower: /[a-z]/.test(regPassword),
      hasNumber: /[0-9]/.test(regPassword),
      hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(regPassword),
    };
  }, [regPassword]);

  const passwordStrengthScore = useMemo(() => {
    const { minLength, hasUpper, hasLower, hasNumber, hasSymbol } = passwordCriteria;
    let score = 0;
    if (minLength) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;
    if (regPassword.length >= 12 && score === 4) score += 1;
    return score; // 0 to 5
  }, [passwordCriteria, regPassword]);

  const passwordStrengthMeta = useMemo(() => {
    if (!regPassword) return { label: 'Sin ingresar', color: 'bg-outline/20 text-outline', width: '0%' };
    if (passwordStrengthScore <= 1) {
      return { label: 'Muy Débil', color: 'bg-red-500 text-red-600', width: '25%' };
    }
    if (passwordStrengthScore === 2) {
      return { label: 'Media', color: 'bg-amber-500 text-amber-600', width: '50%' };
    }
    if (passwordStrengthScore === 3) {
      return { label: 'Buena', color: 'bg-blue-500 text-blue-600', width: '75%' };
    }
    return { label: 'Excelente & Segura', color: 'bg-emerald-500 text-emerald-600', width: '100%' };
  }, [passwordStrengthScore, regPassword]);

  // --- SECURE PASSWORD GENERATOR ---
  const handleGeneratePassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()_-+=?';
    
    // Ensure at least 2 of each
    let generated = '';
    generated += upper[Math.floor(Math.random() * upper.length)];
    generated += upper[Math.floor(Math.random() * upper.length)];
    generated += lower[Math.floor(Math.random() * lower.length)];
    generated += lower[Math.floor(Math.random() * lower.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += symbols[Math.floor(Math.random() * symbols.length)];
    generated += symbols[Math.floor(Math.random() * symbols.length)];

    const all = upper + lower + numbers + symbols;
    for (let i = 0; i < 4; i++) {
      generated += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle characters
    const shuffled = generated.split('').sort(() => 0.5 - Math.random()).join('');
    setRegPassword(shuffled);
    setRegConfirmPassword(shuffled);
    setShowRegPassword(true);
    setShowRegConfirmPassword(true);
    showToast('¡Contraseña de alta seguridad generada y aplicada con éxito!');
  };

  // --- RECOVERY RESEND TIMER ---
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (recoveryResendTimer > 0) {
      interval = setInterval(() => {
        setRecoveryResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [recoveryResendTimer]);

  // --- RECOVERY PASSWORD STRENGTH ---
  const recoveryPasswordCriteria = useMemo(() => {
    return {
      minLength: recoveryNewPassword.length >= 8,
      hasUpper: /[A-Z]/.test(recoveryNewPassword),
      hasLower: /[a-z]/.test(recoveryNewPassword),
      hasNumber: /[0-9]/.test(recoveryNewPassword),
      hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(recoveryNewPassword),
    };
  }, [recoveryNewPassword]);

  const recoveryPasswordStrengthScore = useMemo(() => {
    const { minLength, hasUpper, hasLower, hasNumber, hasSymbol } = recoveryPasswordCriteria;
    let score = 0;
    if (minLength) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;
    if (recoveryNewPassword.length >= 12 && score === 4) score += 1;
    return score;
  }, [recoveryPasswordCriteria, recoveryNewPassword]);

  const recoveryPasswordStrengthMeta = useMemo(() => {
    if (!recoveryNewPassword) return { label: 'Sin ingresar', color: 'bg-outline/20 text-outline', width: '0%' };
    if (recoveryPasswordStrengthScore <= 1) {
      return { label: 'Muy Débil', color: 'bg-red-500 text-red-600', width: '25%' };
    }
    if (recoveryPasswordStrengthScore === 2) {
      return { label: 'Media', color: 'bg-amber-500 text-amber-600', width: '50%' };
    }
    if (recoveryPasswordStrengthScore === 3) {
      return { label: 'Buena', color: 'bg-blue-500 text-blue-600', width: '75%' };
    }
    return { label: 'Excelente & Segura', color: 'bg-emerald-500 text-emerald-600', width: '100%' };
  }, [recoveryPasswordStrengthScore, recoveryNewPassword]);

  const handleStartRecoverySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    const clean = recoveryIdentifier.trim();
    if (!clean) {
      setRecoveryError('Por favor ingresa tu correo electrónico o número de documento.');
      return;
    }

    setIsProcessingRecovery(true);
    setTimeout(() => {
      setIsProcessingRecovery(false);
      const result = findAccountForRecovery(clean);
      if (!result.found) {
        setRecoveryError('No encontramos ninguna cuenta registrada con este correo o documento. Verifica tus datos o crea una cuenta nueva.');
        return;
      }

      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setRecoverySecurityCode(generatedCode);
      setRecoveryAccountData(result);
      setRecoveryCodeInput('');
      setRecoveryStep(2);
      setRecoveryResendTimer(60);
      showToast(`✓ Código de verificación: ${generatedCode} generado para ${result.accountName}`);
    }, 500);
  };

  const handleResendRecoveryCode = () => {
    if (recoveryResendTimer > 0) return;
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setRecoverySecurityCode(generatedCode);
    setRecoveryResendTimer(60);
    setRecoveryCodeInput('');
    setRecoveryError(null);
    showToast(`✓ Nuevo código de seguridad generado: ${generatedCode}`);
  };

  const handleVerifyRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);
    const cleanCode = recoveryCodeInput.trim();
    if (!cleanCode) {
      setRecoveryError('Ingresa el código de 6 dígitos enviado.');
      return;
    }
    if (cleanCode !== recoverySecurityCode) {
      setRecoveryError('El código ingresado es incorrecto. Verifica el número o solicita uno nuevo.');
      return;
    }

    setIsProcessingRecovery(true);
    setTimeout(() => {
      setIsProcessingRecovery(false);
      setRecoveryStep(3);
      showToast('✓ Identidad validada correctamente. Ingresa tu nueva contraseña.');
    }, 400);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    if (recoveryNewPassword.length < 6) {
      setRecoveryError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (recoveryNewPassword !== recoveryConfirmPassword) {
      setRecoveryError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }
    if (!recoveryAccountData?.identifier) {
      setRecoveryError('No se pudo identificar la cuenta para actualizar. Inténtalo de nuevo.');
      return;
    }

    setIsProcessingRecovery(true);
    setTimeout(() => {
      setIsProcessingRecovery(false);
      const res = updateAccountPassword(recoveryAccountData.identifier!, recoveryNewPassword);
      if (!res.success) {
        setRecoveryError(res.message);
        return;
      }

      // Automatically log the user in with their brand new credentials
      const loginRes = loginWithCredentials(recoveryAccountData.identifier!, recoveryNewPassword);
      if (loginRes.success) {
        showToast(`¡Contraseña restablecida! Bienvenido, ${recoveryAccountData.accountName}.`);
        setCurrentView('account');
      } else {
        setLoginIdentifier(recoveryAccountData.identifier!);
        setLoginPassword(recoveryNewPassword);
        setAuthMode('login');
      }
    }, 600);
  };

  const handleGenerateRecoveryPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()_-+=?';
    
    let generated = '';
    generated += upper[Math.floor(Math.random() * upper.length)];
    generated += upper[Math.floor(Math.random() * upper.length)];
    generated += lower[Math.floor(Math.random() * lower.length)];
    generated += lower[Math.floor(Math.random() * lower.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += symbols[Math.floor(Math.random() * symbols.length)];
    generated += symbols[Math.floor(Math.random() * symbols.length)];

    const all = upper + lower + numbers + symbols;
    for (let i = 0; i < 4; i++) {
      generated += all[Math.floor(Math.random() * all.length)];
    }

    const shuffled = generated.split('').sort(() => 0.5 - Math.random()).join('');
    setRecoveryNewPassword(shuffled);
    setRecoveryConfirmPassword(shuffled);
    setShowRecoveryNewPassword(true);
    setShowRecoveryConfirmPassword(true);
    setRecoveryError(null);
    showToast('¡Contraseña de alta seguridad generada y lista para aplicar!');
  };

  // --- VALIDATE REGISTER FORM ---
  const validateRegister = (): boolean => {
    const errors: Record<string, string> = {};

    // Document validation
    const docCheck = validateDocument(regDocType, regDocNumber);
    if (!docCheck.isValid) {
      errors.docNumber = docCheck.error || 'Número de documento inválido';
    }

    // Full name validation
    const cleanName = regFullName.trim();
    if (!cleanName) {
      errors.fullName = 'Ingrese sus nombres y apellidos completos';
    } else if (cleanName.length < 4 || !cleanName.includes(' ')) {
      errors.fullName = 'Ingrese nombre y apellido (mínimo 2 palabras)';
    }

    // Email validation
    const cleanEmail = regEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Ingrese un correo electrónico válido (ej. usuario@dominio.com)';
    }

    // Phone validation
    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'El teléfono o WhatsApp móvil es obligatorio';
    } else if (cleanPhone.length !== 9 || !cleanPhone.startsWith('9')) {
      errors.phone = 'El número peruano debe tener 9 dígitos e iniciar con 9';
    }

    // Password validation
    if (!regPassword) {
      errors.password = 'La contraseña es obligatoria';
    } else if (regPassword.length < 8) {
      errors.password = 'La contraseña debe tener un mínimo de 8 caracteres';
    } else if (!passwordCriteria.hasUpper) {
      errors.password = 'Debe incluir al menos una letra mayúscula (A-Z)';
    } else if (!passwordCriteria.hasLower) {
      errors.password = 'Debe incluir al menos una letra minúscula (a-z)';
    } else if (!passwordCriteria.hasNumber) {
      errors.password = 'Debe incluir al menos un número (0-9)';
    } else if (!passwordCriteria.hasSymbol) {
      errors.password = 'Debe incluir al menos un símbolo especial (!@#$%^&*)';
    }

    // Confirm password
    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Terms
    if (!regAcceptTerms) {
      errors.terms = 'Debe aceptar los Términos y Condiciones y la Política de Privacidad';
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- SUBMIT LOGIN ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim()) {
      setLoginError('Por favor ingrese su correo electrónico o número de documento.');
      return;
    }

    if (!loginPassword) {
      setLoginError('Por favor ingrese su contraseña.');
      return;
    }

    setIsSubmittingLogin(true);

    setTimeout(() => {
      const result = loginWithCredentials(loginIdentifier, loginPassword);
      setIsSubmittingLogin(false);

      if (result.success) {
        if (result.user?.role === 'admin') {
          setCurrentView('admin');
        } else {
          setCurrentView('home');
        }
      } else {
        setLoginError(result.message);
      }
    }, 400);
  };

  // --- SUBMIT REGISTER ---
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) {
      showToast('Por favor complete todos los campos obligatorios correctamente');
      return;
    }

    setIsSubmittingReg(true);

    setTimeout(() => {
      const result = registerAccount({
        name: regFullName,
        email: regEmail,
        password: regPassword,
        docType: regDocType,
        docNumber: regDocNumber,
        phone: regPhone,
        vehicle: regCarModel
          ? {
              brand: regCarBrand,
              model: regCarModel,
              year: regCarYear,
            }
          : undefined,
      });

      setIsSubmittingReg(false);

      if (result.success) {
        setCurrentView('home');
      } else {
        setRegErrors((prev) => ({ ...prev, form: result.message }));
      }
    }, 450);
  };

  // NC-001 SEGURIDAD: Las funciones de demo con credenciales hardcodeadas fueron eliminadas.
  // No existen cuentas predefinidas — el administrador debe registrarse a través del
  // backend de WordPress/Hostinger. Contactar al equipo técnico para setup inicial.

  return (
    <div className="max-w-6xl mx-auto px-gutter py-10">
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-container shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Brand Pillar */}
        <div className="lg:col-span-5 bg-primary text-white p-8 sm:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-[#F07F00]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-1">
              <NorCelisLogo variant="full" theme="dark" size="custom" className="h-12 w-auto" />
            </div>

            <div className="space-y-2">
              <h2 className="font-headline font-extrabold text-2xl sm:text-3xl text-white leading-tight">
                Gestiona tus vehículos, repuestos y citas desde un solo lugar.
              </h2>
              <p className="text-xs text-surface-container-highest/80 leading-relaxed">
                Accede a tu historial de mantenimientos en taller, garantías vigentes, telemetría de compras y catálogo especializado.
              </p>
            </div>

            {/* Feature pillars */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#F07F00] text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">garage</span>
                </div>
                <div>
                  <div className="font-bold text-white">Mi Garaje Virtual</div>
                  <div className="text-[11px] text-white/70">Repuestos 100% compatibles sin búsquedas manuales</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">car_repair</span>
                </div>
                <div>
                  <div className="font-bold text-white">Historial de Taller</div>
                  <div className="text-[11px] text-white/70">Informes de inspección y certificados descargables</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">security</span>
                </div>
                <div>
                  <div className="font-bold text-white">Protección de Datos &amp; Roles</div>
                  <div className="text-[11px] text-white/70">Control de privilegios y privacidad de cuenta estricta</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 relative z-10 text-xs text-white/60 flex items-center justify-between">
            <span>Portal Oficial de Clientes &amp; Concesionario</span>
            <span>Nor Celis S.A.C.</span>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-6">
          {user.isLoggedIn ? (
            /* ACTIVE SESSION VIEW */
            <div className="space-y-6 text-center py-6">
              <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center font-headline font-black text-2xl shadow-xl ring-4 ${
                user.role === 'admin'
                  ? 'bg-gradient-to-br from-[#F07F00] to-[#212955] text-white ring-[#F07F00]/25'
                  : 'bg-primary text-white ring-primary/10'
              }`}>
                {user.name ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'NC'}
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1 shadow-xs border">
                  {user.role === 'admin' ? (
                    <span className="bg-[#F07F00] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified_user</span>
                      Cuenta Administrador
                    </span>
                  ) : (
                    <span className="bg-secondary-container/15 text-secondary px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-secondary-container/30">
                      <span className="material-symbols-outlined text-sm">person</span>
                      Cuenta Cliente Verificado
                    </span>
                  )}
                </div>
                <h3 className="font-headline font-bold text-2xl text-on-surface">
                  Sesión activa: {user.name}
                </h3>
                <p className="text-xs text-outline">{user.email}</p>
                {user.role === 'admin' && (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 mt-2 max-w-md mx-auto">
                    Tienes privilegios de administración activos. El acceso al panel está habilitado en el pie de página (footer) y en el botón inferior.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {user.role === 'admin' && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className="bg-gradient-to-r from-[#F07F00] to-[#d97300] hover:brightness-110 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                    <span>Abrir Panel de Administración</span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentView('account')}
                  className="bg-primary hover:bg-[#181e40] text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">account_circle</span>
                  <span>Mi Cuenta &amp; Garaje</span>
                </button>
                <button
                  onClick={() => setCurrentView('home')}
                  className="bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold px-5 py-3 rounded-xl border border-surface-container transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">home</span>
                  <span>Ir al Portal Principal</span>
                </button>
                <button
                  onClick={logoutUser}
                  className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-5 py-3 rounded-xl border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TABS SWITCHER */}
              <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-surface-container text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setLoginError(null);
                  }}
                  className={`flex-1 py-3 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setRegErrors({});
                  }}
                  className={`flex-1 py-3 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  <span>Crear Cuenta</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('recovery');
                    setRecoveryError(null);
                    if (loginIdentifier.trim() && !recoveryIdentifier) {
                      setRecoveryIdentifier(loginIdentifier.trim());
                    }
                  }}
                  className={`flex-1 py-3 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'recovery'
                      ? 'bg-[#F07F00] text-white shadow-md'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">lock_reset</span>
                  <span>Recuperar Clave</span>
                </button>
              </div>

              {/* LOGIN FORM */}
              {authMode === 'login' ? (
                <div className="space-y-5">
                  {loginError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-shake">
                      <span className="material-symbols-outlined text-base shrink-0 text-red-500">error</span>
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">
                        Correo Electrónico o N° Documento (DNI/RUC)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={loginIdentifier}
                          onChange={(e) => {
                            setLoginIdentifier(e.target.value);
                            setLoginError(null);
                          }}
                          placeholder="admin@norcelis.pe o 74819203"
                          className="w-full bg-surface-container-low border border-surface-container rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          required
                        />
                        <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-lg pointer-events-none">
                          badge
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-on-surface">
                          Contraseña
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('recovery');
                            setRecoveryStep(1);
                            setRecoveryError(null);
                            if (loginIdentifier.trim()) {
                              setRecoveryIdentifier(loginIdentifier.trim());
                            }
                          }}
                          className="text-[11px] text-[#F07F00] hover:text-[#d97300] hover:underline font-bold cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">lock_reset</span>
                          <span>¿Olvidaste tu contraseña?</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            setLoginError(null);
                          }}
                          placeholder="••••••••••••"
                          className="w-full bg-surface-container-low border border-surface-container rounded-xl pl-10 pr-10 py-3 text-xs font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                          required
                        />
                        <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-lg pointer-events-none">
                          lock
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-3 text-outline hover:text-on-surface text-lg cursor-pointer"
                          title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showLoginPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingLogin}
                        className="w-full bg-[#F07F00] hover:bg-[#d97300] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isSubmittingLogin ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>Verificando Credenciales...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-lg">login</span>
                            <span>Ingresar a Mi Garaje</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* QUICK DEMO CREDENTIALS BOX */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#F07F00]">vpn_key</span>
                        <span>Acceso Rápido para Pruebas del Sistema</span>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                        Demo
                      </span>
                    </div>

                    <p className="text-[11px] text-outline leading-relaxed">
                      El público general no visualiza el botón de administración en el footer. Al iniciar sesión como Administrador, el acceso al panel se desbloquea de inmediato:
                    </p>

                    {/* NC-001 SEGURIDAD: Acceso demo con credenciales eliminado.
                        Para acceder al panel de administración, registrar una cuenta
                        a través del backend de WordPress o contactar al equipo técnico. */}
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-amber-600 mt-0.5 flex-shrink-0">info</span>
                      <span>El acceso de administrador se configura desde el backend. Registra tu cuenta o contacta al equipo técnico en <strong>965171717</strong>.</span>
                    </div>
                  </div>
                </div>
              ) : authMode === 'register' ? (
                /* REGISTER FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {regErrors.form && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-base shrink-0 text-red-500">error</span>
                      <span>{regErrors.form}</span>
                    </div>
                  )}

                  {/* Document & Full Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label className="block text-xs font-bold text-on-surface mb-1">
                        Tipo de Doc. *
                      </label>
                      <select
                        value={regDocType}
                        onChange={(e) => {
                          const newType = e.target.value as DocumentType;
                          setRegDocType(newType);
                          // Re-format current value for the new document type
                          const formatted = formatDocumentInput(newType, regDocNumber);
                          setRegDocNumber(formatted);
                          setRegErrors((prev) => ({ ...prev, docNumber: '' }));
                        }}
                        className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="DNI" className="text-slate-900 bg-white">DNI (Perú - 8 dígitos)</option>
                        <option value="RUC" className="text-slate-900 bg-white">RUC (Perú - 11 dígitos)</option>
                        <option value="RUT" className="text-slate-900 bg-white">RUT (Internacional / DV)</option>
                        <option value="CE" className="text-slate-900 bg-white">Carné Extranjería (CE)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-8">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-on-surface">
                          N° de Documento *
                        </label>
                        {regDocType === 'RUT' && (
                          <span className="text-[10px] text-[#F07F00] font-semibold">
                            Incluye Dígito Verificador (0-9 o K)
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={regDocNumber}
                          onChange={(e) => handleDocNumberChange(e.target.value)}
                          placeholder={
                            regDocType === 'DNI'
                              ? '74819203'
                              : regDocType === 'RUC'
                              ? '20601849201'
                              : regDocType === 'RUT'
                              ? '12.345.678-K'
                              : '001234567'
                          }
                          className={`w-full bg-surface-container-low border rounded-xl p-2.5 pr-9 text-xs font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                            docValidationResult.isValid
                              ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/25'
                              : (regDocNumber.length >= 3 && !docValidationResult.isValid) || regErrors.docNumber
                              ? 'border-red-400 ring-1 ring-red-400 bg-red-50/30'
                              : 'border-surface-container focus:border-primary'
                          }`}
                          required
                        />
                        <div className="absolute right-3 top-2.5 pointer-events-none">
                          {docValidationResult.isValid ? (
                            <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                          ) : (regDocNumber.length >= 3 && !docValidationResult.isValid) || regErrors.docNumber ? (
                            <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                          ) : null}
                        </div>
                      </div>

                      {/* Real-time Visual Feedback Badge */}
                      {docValidationResult.isValid && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold mt-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs animate-fadeIn">
                          <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                          <span>{docValidationResult.helperText || 'Documento verificado correctamente'}</span>
                        </div>
                      )}
                      {!docValidationResult.isValid && regDocNumber.length >= 3 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-red-600 font-medium mt-1 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 animate-fadeIn">
                          <span className="material-symbols-outlined text-sm text-red-500 shrink-0">info</span>
                          <span>{docValidationResult.error}</span>
                        </div>
                      )}
                      {regErrors.docNumber && !docValidationResult.isValid && regDocNumber.length < 3 && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{regErrors.docNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">
                        Nombres y Apellidos *
                      </label>
                      <input
                        type="text"
                        value={regFullName}
                        onChange={(e) => {
                          setRegFullName(e.target.value);
                          setRegErrors((prev) => ({ ...prev, fullName: '' }));
                        }}
                        placeholder="Ej. Carlos Mendoza Silva"
                        className={`w-full bg-surface-container-low border rounded-xl p-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary ${
                          regErrors.fullName ? 'border-red-400 bg-red-50/50' : 'border-surface-container'
                        }`}
                        required
                      />
                      {regErrors.fullName && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{regErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">
                        WhatsApp Móvil (Perú) *
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => {
                          setRegPhone(e.target.value);
                          setRegErrors((prev) => ({ ...prev, phone: '' }));
                        }}
                        placeholder="987 654 321"
                        className={`w-full bg-surface-container-low border rounded-xl p-2.5 text-xs font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary ${
                          regErrors.phone ? 'border-red-400 bg-red-50/50' : 'border-surface-container'
                        }`}
                        required
                      />
                      {regErrors.phone && (
                        <p className="text-[11px] text-red-600 mt-1 font-medium">{regErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        setRegErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="carlos.mendoza@email.com"
                      className={`w-full bg-surface-container-low border rounded-xl p-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary ${
                        regErrors.email ? 'border-red-400 bg-red-50/50' : 'border-surface-container'
                      }`}
                      required
                    />
                    {regErrors.email && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium">{regErrors.email}</p>
                    )}
                  </div>

                  {/* Password & Generator */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#F07F00]">lock</span>
                        <span>Creación de Contraseña Segura *</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[11px] font-bold text-[#F07F00] hover:text-[#d97300] bg-[#F07F00]/10 hover:bg-[#F07F00]/20 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-[#F07F00]/30"
                      >
                        <span className="material-symbols-outlined text-xs">auto_awesome</span>
                        <span>Generar Contraseña Segura</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="relative">
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => {
                              setRegPassword(e.target.value);
                              setRegErrors((prev) => ({ ...prev, password: '' }));
                            }}
                            placeholder="Mínimo 8 caracteres"
                            className={`w-full bg-white border rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary ${
                              regErrors.password ? 'border-red-400 bg-red-50/50' : 'border-surface-container'
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-2.5 text-outline hover:text-on-surface cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">
                              {showRegPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="relative">
                          <input
                            type={showRegConfirmPassword ? 'text' : 'password'}
                            value={regConfirmPassword}
                            onChange={(e) => {
                              setRegConfirmPassword(e.target.value);
                              setRegErrors((prev) => ({ ...prev, confirmPassword: '' }));
                            }}
                            placeholder="Confirmar contraseña"
                            className={`w-full bg-white border rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary ${
                              regErrors.confirmPassword ? 'border-red-400 bg-red-50/50' : 'border-surface-container'
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="absolute right-3 top-2.5 text-outline hover:text-on-surface cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base">
                              {showRegConfirmPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Meter */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-outline">Seguridad de la contraseña:</span>
                        <span className={`font-bold ${passwordStrengthMeta.color.split(' ')[1]}`}>
                          {passwordStrengthMeta.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            passwordStrengthScore >= 1 ? passwordStrengthMeta.color.split(' ')[0] : 'bg-transparent'
                          }`}
                          style={{ width: '25%' }}
                        />
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            passwordStrengthScore >= 2 ? passwordStrengthMeta.color.split(' ')[0] : 'bg-transparent'
                          }`}
                          style={{ width: '25%' }}
                        />
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            passwordStrengthScore >= 3 ? passwordStrengthMeta.color.split(' ')[0] : 'bg-transparent'
                          }`}
                          style={{ width: '25%' }}
                        />
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            passwordStrengthScore >= 4 ? passwordStrengthMeta.color.split(' ')[0] : 'bg-transparent'
                          }`}
                          style={{ width: '25%' }}
                        />
                      </div>
                    </div>

                    {/* Visual Requirements Checklist */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 text-[10px]">
                      <div className={`flex items-center gap-1 ${passwordCriteria.minLength ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                        <span className="material-symbols-outlined text-xs">
                          {passwordCriteria.minLength ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>Mín. 8 caracteres</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.hasUpper ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                        <span className="material-symbols-outlined text-xs">
                          {passwordCriteria.hasUpper ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>Mayúscula (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.hasLower ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                        <span className="material-symbols-outlined text-xs">
                          {passwordCriteria.hasLower ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>Minúscula (a-z)</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                        <span className="material-symbols-outlined text-xs">
                          {passwordCriteria.hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>Número (0-9)</span>
                      </div>
                      <div className={`flex items-center gap-1 ${passwordCriteria.hasSymbol ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                        <span className="material-symbols-outlined text-xs">
                          {passwordCriteria.hasSymbol ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>Símbolo (!@#$%)</span>
                      </div>
                      <div className={`flex items-center gap-1 ${regPassword && regPassword === regConfirmPassword ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                        <span className="material-symbols-outlined text-xs">
                          {regPassword && regPassword === regConfirmPassword ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span>Coinciden</span>
                      </div>
                    </div>

                    {regErrors.password && (
                      <p className="text-[11px] text-red-600 font-medium">{regErrors.password}</p>
                    )}
                    {regErrors.confirmPassword && (
                      <p className="text-[11px] text-red-600 font-medium">{regErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Vehicle Garage registration (Optional) */}
                  <div className="bg-surface-container-low p-3.5 rounded-2xl border border-surface-container space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#F07F00]">garage</span>
                      <span>Configurar Mi Vehículo Principal en Garaje (Opcional)</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={regCarBrand}
                        onChange={(e) => setRegCarBrand(e.target.value)}
                        className="bg-white border border-surface-container rounded-lg p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="Toyota" className="text-slate-900 bg-white">Toyota</option>
                        <option value="Nissan" className="text-slate-900 bg-white">Nissan</option>
                        <option value="Hyundai" className="text-slate-900 bg-white">Hyundai</option>
                        <option value="Kia" className="text-slate-900 bg-white">Kia</option>
                        <option value="Ford" className="text-slate-900 bg-white">Ford</option>
                        <option value="BMW" className="text-slate-900 bg-white">BMW</option>
                        <option value="Mazda" className="text-slate-900 bg-white">Mazda</option>
                        <option value="Mitsubishi" className="text-slate-900 bg-white">Mitsubishi</option>
                      </select>
                      <input
                        type="text"
                        value={regCarModel}
                        onChange={(e) => setRegCarModel(e.target.value)}
                        placeholder="Modelo (ej. Hilux, RAV4)"
                        className="bg-white border border-surface-container rounded-lg p-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary"
                      />
                      <select
                        value={regCarYear}
                        onChange={(e) => setRegCarYear(e.target.value)}
                        className="bg-white border border-surface-container rounded-lg p-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-primary cursor-pointer"
                      >
                        <option value="2025" className="text-slate-900 bg-white">2025</option>
                        <option value="2024" className="text-slate-900 bg-white">2024</option>
                        <option value="2023" className="text-slate-900 bg-white">2023</option>
                        <option value="2022" className="text-slate-900 bg-white">2022</option>
                        <option value="2021" className="text-slate-900 bg-white">2021</option>
                        <option value="2020" className="text-slate-900 bg-white">2020</option>
                      </select>
                    </div>
                  </div>

                  {/* Terms acceptance */}
                  <div className="space-y-1">
                    <label className="flex items-start gap-2 cursor-pointer text-xs text-on-surface">
                      <input
                        type="checkbox"
                        checked={regAcceptTerms}
                        onChange={(e) => {
                          setRegAcceptTerms(e.target.checked);
                          setRegErrors((prev) => ({ ...prev, terms: '' }));
                        }}
                        className="mt-0.5 rounded text-[#F07F00] focus:ring-[#F07F00] cursor-pointer"
                      />
                      <span className="text-[11px] text-outline leading-tight">
                        Acepto los{' '}
                        <button type="button" onClick={() => navigateToTerms('terms')} className="font-bold text-[#F07F00] hover:underline cursor-pointer">
                          Términos y Condiciones
                        </button>
                        , las{' '}
                        <button type="button" onClick={() => navigateToTerms('sales')} className="font-bold text-[#F07F00] hover:underline cursor-pointer">
                          Políticas de Venta
                        </button>{' '}
                        y la{' '}
                        <button type="button" onClick={() => navigateToTerms('privacy')} className="font-bold text-[#F07F00] hover:underline cursor-pointer">
                          Política de Privacidad
                        </button>{' '}
                        de GRUPO MEVAC S.A.C. (Ley N° 29733), y autorizo el tratamiento de mis datos personales para gestionar mi cuenta y mis compras.
                      </span>
                    </label>
                    {regErrors.terms && (
                      <p className="text-[11px] text-red-600 font-medium">{regErrors.terms}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingReg}
                      className="w-full bg-[#F07F00] hover:bg-[#d97300] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmittingReg ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Creando Cuenta Segura...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">how_to_reg</span>
                          <span>Crear Cuenta &amp; Activar Mi Garaje</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* RECOVERY FLOW - 3 STEPS */
                <div className="space-y-6">
                  {/* Step Progress Indicators */}
                  <div className="bg-surface-container-low p-2.5 rounded-2xl border border-surface-container">
                    <div className="flex items-center justify-between gap-1">
                      {/* Step 1 Pill */}
                      <button
                        type="button"
                        onClick={() => {
                          if (recoveryStep > 1) {
                            setRecoveryStep(1);
                            setRecoveryError(null);
                          }
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          recoveryStep === 1
                            ? 'bg-[#212955] text-white shadow-sm'
                            : recoveryStep > 1
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'text-outline hover:text-on-surface'
                        }`}
                      >
                        {recoveryStep > 1 ? (
                          <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">1</span>
                        )}
                        <span className="truncate">1. Identificación</span>
                      </button>

                      {/* Divider */}
                      <div className={`h-0.5 w-3 sm:w-6 transition-colors ${recoveryStep >= 2 ? 'bg-emerald-500' : 'bg-surface-container'}`} />

                      {/* Step 2 Pill */}
                      <button
                        type="button"
                        onClick={() => {
                          if (recoveryStep === 3) {
                            setRecoveryStep(2);
                            setRecoveryError(null);
                          }
                        }}
                        disabled={recoveryStep < 2}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                          recoveryStep === 2
                            ? 'bg-[#F07F00] text-white shadow-sm'
                            : recoveryStep > 2
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer'
                            : 'text-outline/50 cursor-not-allowed opacity-60'
                        }`}
                      >
                        {recoveryStep > 2 ? (
                          <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">2</span>
                        )}
                        <span className="truncate">2. Código</span>
                      </button>

                      {/* Divider */}
                      <div className={`h-0.5 w-3 sm:w-6 transition-colors ${recoveryStep === 3 ? 'bg-[#F07F00]' : 'bg-surface-container'}`} />

                      {/* Step 3 Pill */}
                      <div
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                          recoveryStep === 3
                            ? 'bg-[#212955] text-white shadow-sm'
                            : 'text-outline/50 opacity-60'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">3</span>
                        <span className="truncate">3. Nueva Clave</span>
                      </div>
                    </div>
                  </div>

                  {/* ERROR ALERT */}
                  {recoveryError && (
                    <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-shake">
                      <span className="material-symbols-outlined text-base shrink-0 text-red-500">error</span>
                      <div className="flex-1">
                        <span className="font-bold block">Atención:</span>
                        <span>{recoveryError}</span>
                      </div>
                    </div>
                  )}

                  {/* STEP 1: IDENTIFICATION */}
                  {recoveryStep === 1 && (
                    <form onSubmit={handleStartRecoverySearch} className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xl">contact_support</span>
                          <span>Identifica tu cuenta de usuario</span>
                        </h4>
                        <p className="text-xs text-outline leading-relaxed">
                          Ingresa el correo electrónico o el número de documento de identidad (DNI o RUC) registrado en Nor Celis Automotriz.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1">
                          Correo Electrónico o N° Documento (DNI/RUC) *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={recoveryIdentifier}
                            onChange={(e) => {
                              setRecoveryIdentifier(e.target.value);
                              setRecoveryError(null);
                            }}
                            placeholder="ej. carlos.mendoza@norcelis.pe o 74819203"
                            className="w-full bg-surface-container-low border border-surface-container rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            required
                            autoFocus
                          />
                          <span className="material-symbols-outlined absolute left-3 top-3 text-outline text-lg pointer-events-none">
                            badge
                          </span>
                        </div>
                      </div>

                      {/* QUICK DEMO SELECTOR FOR RECOVERY */}
                      <div className="p-3.5 bg-surface-container-low rounded-2xl border border-surface-container space-y-2">
                        <div className="text-[11px] font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-[#F07F00]">smart_toy</span>
                          <span>Cuentas de prueba para recuperación rápida:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRecoveryIdentifier('carlos.mendoza@norcelis.pe');
                              setRecoveryError(null);
                            }}
                            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group"
                          >
                            <div className="font-bold text-[11px] text-[#212955] group-hover:text-[#F07F00] transition-colors flex items-center justify-between">
                              <span>Carlos Mendoza (Cliente)</span>
                              <span className="material-symbols-outlined text-xs">touch_app</span>
                            </div>
                            <div className="text-[10px] text-outline font-mono">carlos.mendoza@norcelis.pe</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRecoveryIdentifier('admin@norcelis.pe');
                              setRecoveryError(null);
                            }}
                            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group"
                          >
                            <div className="font-bold text-[11px] text-[#212955] group-hover:text-[#F07F00] transition-colors flex items-center justify-between">
                              <span>Admin Nor Celis</span>
                              <span className="material-symbols-outlined text-xs">touch_app</span>
                            </div>
                            <div className="text-[10px] text-outline font-mono">admin@norcelis.pe</div>
                          </button>
                        </div>
                      </div>

                      {/* Submit action */}
                      <div className="pt-2 space-y-2">
                        <button
                          type="submit"
                          disabled={isProcessingRecovery}
                          className="w-full bg-[#F07F00] hover:bg-[#d97300] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          {isProcessingRecovery ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span>Localizando cuenta en la red...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-lg">forward_to_inbox</span>
                              <span>Buscar Cuenta &amp; Enviar Código</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setRecoveryError(null);
                          }}
                          className="w-full py-2.5 text-xs font-bold text-outline hover:text-on-surface transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_back</span>
                          <span>Recordé mi contraseña, regresar a Iniciar Sesión</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 2: VERIFY SECURITY CODE */}
                  {recoveryStep === 2 && (
                    <form onSubmit={handleVerifyRecoveryCode} className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#F07F00] text-xl">mark_email_read</span>
                          <span>Código de Verificación Temporal</span>
                        </h4>
                        <p className="text-xs text-outline leading-relaxed">
                          Hemos generado un código de 6 dígitos para validar la identidad del titular de la cuenta.
                        </p>
                      </div>

                      {/* Target Account Badge */}
                      {recoveryAccountData && (
                        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-3.5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                            <span className="material-symbols-outlined text-lg">verified_user</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-on-surface truncate">
                              {recoveryAccountData.accountName}
                            </div>
                            <div className="text-[11px] text-outline flex flex-wrap gap-x-3 gap-y-0.5">
                              <span>Correo: <strong className="text-on-surface">{recoveryAccountData.maskedEmail}</strong></span>
                              <span>Teléfono: <strong className="text-on-surface">{recoveryAccountData.maskedPhone}</strong></span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SIMULATED CODE BANNER */}
                      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-[#F07F00]">notifications_active</span>
                            <span>Código de Seguridad Simulado (SMS / Correo)</span>
                          </div>
                          <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                            Prueba Rápida
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                          <div className="text-center sm:text-left">
                            <div className="text-[10px] text-outline font-semibold">CÓDIGO GENERADO:</div>
                            <div className="text-2xl font-mono font-black text-[#212955] tracking-widest select-all">
                              {recoverySecurityCode}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setRecoveryCodeInput(recoverySecurityCode);
                              setRecoveryError(null);
                              showToast('✓ Código autocompletado en el formulario');
                            }}
                            className="w-full sm:w-auto bg-[#212955] hover:bg-[#181f42] text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span className="material-symbols-outlined text-sm">content_paste</span>
                            <span>Autocompletar Código</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-amber-800 leading-tight">
                          En un entorno de producción, este código se envía vía SMS al celular y al correo certificado. En esta demo interactiva, puedes pulsar directamente &ldquo;Autocompletar Código&rdquo; para validar.
                        </p>
                      </div>

                      {/* Code input */}
                      <div>
                        <label className="block text-xs font-bold text-on-surface mb-1 text-center">
                          Ingresa los 6 dígitos recibidos
                        </label>
                        <div className="max-w-xs mx-auto">
                          <input
                            type="text"
                            maxLength={6}
                            value={recoveryCodeInput}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              setRecoveryCodeInput(val);
                              setRecoveryError(null);
                            }}
                            placeholder="000000"
                            className="w-full bg-surface-container-low border-2 border-surface-container rounded-2xl py-3 px-4 text-center font-mono font-black text-2xl tracking-[0.4em] text-[#212955] placeholder:text-slate-300 focus:outline-none focus:border-[#F07F00] focus:ring-2 focus:ring-[#F07F00]/20"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Resend timer */}
                      <div className="text-center pt-1">
                        {recoveryResendTimer > 0 ? (
                          <span className="text-xs text-outline font-medium flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-sm animate-spin">timelapse</span>
                            <span>Reenviar nuevo código en <strong>{recoveryResendTimer}s</strong></span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendRecoveryCode}
                            className="text-xs text-[#F07F00] hover:text-[#d97300] hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">cached</span>
                            <span>Reenviar un nuevo código de seguridad</span>
                          </button>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-2 space-y-2">
                        <button
                          type="submit"
                          disabled={isProcessingRecovery || recoveryCodeInput.length < 6}
                          className="w-full bg-[#F07F00] hover:bg-[#d97300] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isProcessingRecovery ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span>Validando código...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-lg">check_circle</span>
                              <span>Verificar Código &amp; Continuar</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRecoveryStep(1);
                            setRecoveryError(null);
                          }}
                          className="w-full py-2.5 text-xs font-bold text-outline hover:text-on-surface transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_back</span>
                          <span>Cambiar de cuenta o correo</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: NEW PASSWORD */}
                  {recoveryStep === 3 && (
                    <form onSubmit={handleSaveNewPassword} className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-xl">lock_open</span>
                          <span>Establece tu nueva contraseña</span>
                        </h4>
                        <p className="text-xs text-outline leading-relaxed">
                          Ingresa tu nueva clave de acceso para <strong>{recoveryAccountData?.accountName}</strong>. Asegúrate de que sea robusta para proteger tu historial automotriz.
                        </p>
                      </div>

                      {/* Automatic Secure Password Generator Button */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleGenerateRecoveryPassword}
                          className="text-[11px] font-bold text-primary hover:text-[#F07F00] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                          <span>Generar contraseña segura automática</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-on-surface mb-1">
                            Nueva Contraseña *
                          </label>
                          <div className="relative">
                            <input
                              type={showRecoveryNewPassword ? 'text' : 'password'}
                              value={recoveryNewPassword}
                              onChange={(e) => {
                                setRecoveryNewPassword(e.target.value);
                                setRecoveryError(null);
                              }}
                              placeholder="Mínimo 8 caracteres"
                              className="w-full bg-surface-container-low border border-surface-container rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              required
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setShowRecoveryNewPassword(!showRecoveryNewPassword)}
                              className="absolute right-3 top-2.5 text-outline hover:text-on-surface cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">
                                {showRecoveryNewPassword ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-on-surface mb-1">
                            Confirmar Nueva Contraseña *
                          </label>
                          <div className="relative">
                            <input
                              type={showRecoveryConfirmPassword ? 'text' : 'password'}
                              value={recoveryConfirmPassword}
                              onChange={(e) => {
                                setRecoveryConfirmPassword(e.target.value);
                                setRecoveryError(null);
                              }}
                              placeholder="Repite la contraseña"
                              className="w-full bg-surface-container-low border border-surface-container rounded-xl pl-3 pr-10 py-2.5 text-xs font-mono font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowRecoveryConfirmPassword(!showRecoveryConfirmPassword)}
                              className="absolute right-3 top-2.5 text-outline hover:text-on-surface cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">
                                {showRecoveryConfirmPassword ? 'visibility_off' : 'visibility'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Password Strength Meter */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-outline">Seguridad de la clave:</span>
                          <span className={`font-bold ${recoveryPasswordStrengthMeta.color.split(' ')[1]}`}>
                            {recoveryPasswordStrengthMeta.label}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex gap-1">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              recoveryPasswordStrengthScore >= 1 ? recoveryPasswordStrengthMeta.color.split(' ')[0] : 'bg-transparent'
                            }`}
                            style={{ width: '25%' }}
                          />
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              recoveryPasswordStrengthScore >= 2 ? recoveryPasswordStrengthMeta.color.split(' ')[0] : 'bg-transparent'
                            }`}
                            style={{ width: '25%' }}
                          />
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              recoveryPasswordStrengthScore >= 3 ? recoveryPasswordStrengthMeta.color.split(' ')[0] : 'bg-transparent'
                            }`}
                            style={{ width: '25%' }}
                          />
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              recoveryPasswordStrengthScore >= 4 ? recoveryPasswordStrengthMeta.color.split(' ')[0] : 'bg-transparent'
                            }`}
                            style={{ width: '25%' }}
                          />
                        </div>
                      </div>

                      {/* Visual Criteria Checklist */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 text-[10px]">
                        <div className={`flex items-center gap-1 ${recoveryPasswordCriteria.minLength ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                          <span className="material-symbols-outlined text-xs">
                            {recoveryPasswordCriteria.minLength ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>Mín. 8 caracteres</span>
                        </div>
                        <div className={`flex items-center gap-1 ${recoveryPasswordCriteria.hasUpper ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                          <span className="material-symbols-outlined text-xs">
                            {recoveryPasswordCriteria.hasUpper ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>Mayúscula (A-Z)</span>
                        </div>
                        <div className={`flex items-center gap-1 ${recoveryPasswordCriteria.hasLower ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                          <span className="material-symbols-outlined text-xs">
                            {recoveryPasswordCriteria.hasLower ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>Minúscula (a-z)</span>
                        </div>
                        <div className={`flex items-center gap-1 ${recoveryPasswordCriteria.hasNumber ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                          <span className="material-symbols-outlined text-xs">
                            {recoveryPasswordCriteria.hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>Número (0-9)</span>
                        </div>
                        <div className={`flex items-center gap-1 ${recoveryPasswordCriteria.hasSymbol ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                          <span className="material-symbols-outlined text-xs">
                            {recoveryPasswordCriteria.hasSymbol ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>Símbolo (!@#$%)</span>
                        </div>
                        <div className={`flex items-center gap-1 ${recoveryNewPassword && recoveryNewPassword === recoveryConfirmPassword ? 'text-emerald-700 font-bold' : 'text-outline'}`}>
                          <span className="material-symbols-outlined text-xs">
                            {recoveryNewPassword && recoveryNewPassword === recoveryConfirmPassword ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          <span>Coinciden</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 space-y-2">
                        <button
                          type="submit"
                          disabled={isProcessingRecovery}
                          className="w-full bg-[#212955] hover:bg-[#181f42] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          {isProcessingRecovery ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              <span>Actualizando clave y credenciales...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-lg">save</span>
                              <span>Guardar Nueva Contraseña &amp; Acceder</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setRecoveryError(null);
                          }}
                          className="w-full py-2.5 text-xs font-bold text-outline hover:text-on-surface transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                          <span>Cancelar y regresar</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
