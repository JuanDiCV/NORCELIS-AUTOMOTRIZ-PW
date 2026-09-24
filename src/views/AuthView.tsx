import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NorCelisLogo } from '../components/NorCelisLogo';

export const AuthView: React.FC = () => {
  const { user, loginUser, logoutUser, setCurrentView, showToast } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [docType, setDocType] = useState('DNI');
  const [docNumber, setDocNumber] = useState('74819203');
  const [email, setEmail] = useState('carlos.mendoza@norcelis.pe');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Carlos Mendoza');
  const [phone, setPhone] = useState('987 654 321');
  const [carBrand, setCarBrand] = useState('Toyota');
  const [carModel, setCarModel] = useState('RAV4 Hybrid');
  const [carYear, setCarYear] = useState('2025');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(fullName || 'Carlos Mendoza', email);
    setCurrentView('home');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(fullName, email);
    showToast('¡Cuenta creada con éxito! Tu vehículo ha sido añadido a Mi Garaje.');
    setCurrentView('home');
  };

  return (
    <div className="max-w-6xl mx-auto px-gutter py-10">
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-container shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Brand Pillar (Screen 9 spec) */}
        <div className="lg:col-span-5 bg-primary text-white p-8 sm:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-1">
              <NorCelisLogo variant="full" theme="dark" size="custom" className="h-12 w-auto" />
              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-secondary-fixed bg-secondary/30 px-2 py-0.5 rounded border border-secondary-fixed/40">
                  Portal de Clientes &amp; Garaje
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-headline font-extrabold text-2xl text-white">
                Gestiona tus vehículos, repuestos y citas desde un solo lugar.
              </h2>
              <p className="text-xs text-surface-container-highest/80 leading-relaxed">
                Accede a tu historial de mantenimientos en taller, garantías activas, telemetría de pedidos y catálogo filtrado por tu número de VIN.
              </p>
            </div>

            {/* Feature pillars */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-surface-container-highest/90">
                <span className="material-symbols-outlined text-secondary-fixed text-lg">garage</span>
                <span><strong>Mi Garaje Virtual:</strong> Repuestos 100% compatibles sin buscar</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-surface-container-highest/90">
                <span className="material-symbols-outlined text-secondary-fixed text-lg">car_repair</span>
                <span><strong>Historial de Taller:</strong> Informes técnicos y fotos de inspección</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-surface-container-highest/90">
                <span className="material-symbols-outlined text-secondary-fixed text-lg">loyalty</span>
                <span><strong>Club VIP:</strong> Descuentos exclusivos de hasta 20% en repuestos</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-primary-container relative z-10 text-xs text-surface-container-highest/60 flex items-center justify-between">
            <span>Certificación ISO 9001:2015</span>
            <span>Seguridad Bancaria SSL</span>
          </div>
        </div>

        {/* Right Form Column (Screen 9 spec) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          {user.isLoggedIn ? (
            <div className="space-y-6 text-center py-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary text-secondary-container flex items-center justify-center font-bold text-2xl ring-4 ring-surface-container">
                CM
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl text-on-surface">
                  Sesión activa: {user.name}
                </h3>
                <p className="text-xs text-outline">{user.email}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setCurrentView('home')}
                  className="bg-primary hover:bg-primary-container text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                >
                  Ir al Portal Principal
                </button>
                <button
                  onClick={logoutUser}
                  className="bg-surface-container hover:bg-surface-container-high text-error text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs Switcher */}
              <div className="flex bg-surface-container-low p-1 rounded-2xl border border-surface-container text-xs font-bold">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
                    authMode === 'login'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2.5 rounded-xl transition-all text-center ${
                    authMode === 'register'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  Crear Cuenta Nueva
                </button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-xs font-bold text-on-surface mb-1">
                        Documento
                      </label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-primary"
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">Carné Ext.</option>
                        <option value="RUC">RUC 10/20</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-on-surface mb-1">
                        Número de Documento o Correo
                      </label>
                      <input
                        type="text"
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="74819203 o correo@email.com"
                        className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-on-surface">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => showToast('Hemos enviado un enlace de recuperación a tu correo')}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-container text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                    >
                      Ingresar a Mi Garaje
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">
                        Nombres y Apellidos
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Carlos Mendoza"
                        className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">
                        WhatsApp Móvil
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="987 654 321"
                        className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carlos.mendoza@email.com"
                      className="w-full bg-surface-container-low border border-surface-container rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                      required
                    />
                  </div>

                  {/* Vehicle Garage quick registration */}
                  <div className="bg-surface-container-low p-3 rounded-2xl border border-surface-container space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">garage</span>
                      Configurar Mi Vehículo Principal (Opcional)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={carBrand}
                        onChange={(e) => setCarBrand(e.target.value)}
                        className="bg-white border border-surface-container rounded-lg p-2 text-xs font-semibold"
                      >
                        <option>Toyota</option>
                        <option>Nissan</option>
                        <option>Hyundai</option>
                        <option>Kia</option>
                        <option>BMW</option>
                      </select>
                      <input
                        type="text"
                        value={carModel}
                        onChange={(e) => setCarModel(e.target.value)}
                        placeholder="Modelo"
                        className="bg-white border border-surface-container rounded-lg p-2 text-xs font-semibold"
                      />
                      <select
                        value={carYear}
                        onChange={(e) => setCarYear(e.target.value)}
                        className="bg-white border border-surface-container rounded-lg p-2 text-xs font-semibold"
                      >
                        <option>2025</option>
                        <option>2024</option>
                        <option>2023</option>
                        <option>2022</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-secondary-container hover:bg-secondary text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                    >
                      Crear Cuenta &amp; Activar Mi Garaje
                    </button>
                  </div>
                </form>
              )}

              {/* Social Login buttons */}
              <div className="pt-2 space-y-3">
                <div className="relative text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-container"></div>
                  </div>
                  <span className="relative bg-surface-container-lowest px-3 text-[11px] text-outline font-medium">
                    O continuar con
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      loginUser('Carlos Mendoza (Google)', 'carlos@gmail.com');
                      setCurrentView('home');
                    }}
                    className="p-2.5 rounded-xl border border-surface-container hover:bg-surface-container-low text-xs font-semibold text-on-surface flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-red-600">G</span>
                    <span>Google ID</span>
                  </button>
                  <button
                    onClick={() => {
                      loginUser('Carlos Mendoza (Apple)', 'carlos@apple.com');
                      setCurrentView('home');
                    }}
                    className="p-2.5 rounded-xl border border-surface-container hover:bg-surface-container-low text-xs font-semibold text-on-surface flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">apple</span>
                    <span>Apple ID</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
