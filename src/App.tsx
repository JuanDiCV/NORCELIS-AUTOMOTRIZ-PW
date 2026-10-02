import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { GarageModal } from './components/GarageModal';
import { TestDriveModal } from './components/TestDriveModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { QuickQuoteModal } from './components/QuickQuoteModal';
import { FloatingHub } from './components/FloatingHub';
import { AdvisorChatbox } from './components/AdvisorChatbox';
import { HomeView } from './views/HomeView';
import { CarsCatalogView } from './views/CarsCatalogView';
import { VehiclePdpView } from './views/VehiclePdpView';
import { PartsCatalogView } from './views/PartsCatalogView';
import { PartPdpView } from './views/PartPdpView';
import { ServicesView } from './views/ServicesView';
import { MachineryRentalView } from './views/MachineryRentalView';
import { WishlistView } from './views/WishlistView';
import { CartView } from './views/CartView';
import { AuthView } from './views/AuthView';
import { TradeInView } from './views/TradeInView';
import { FinancingView } from './views/FinancingView';
import { AccountView } from './views/AccountView';
import { LocationsView } from './views/LocationsView';
import { ClaimsBookView } from './views/ClaimsBookView';
import { AboutView } from './views/AboutView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { TermsPoliciesView } from './views/TermsPoliciesView';
import { AdminPinModal } from './components/admin/AdminPinModal';

const MainContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    toastMessage,
    pdfModalData,
    closePdfModal,
    showToast,
    isAdminPinModalOpen,
    setIsAdminPinModalOpen,
    adminPin,
    setIsAdminUnlocked,
    isAdminUnlocked,
    user,
  } = useApp();

  // Scroll to top whenever current view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Register service-worker.js for push notifications and Mi Garaje alerts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            // Service Worker successfully registered
          })
          .catch((error) => {
            console.warn('Service Worker registration error:', error);
          });
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#212955] text-white antialiased selection:bg-[#F07F00] selection:text-white">
      {/* Sticky Header with active garage and search */}
      {currentView !== 'admin' && <Header />}

      {/* Main Body Routing */}
      <main className="flex-1 bg-[#212955]">
        {currentView === 'home' && <HomeView />}
        {currentView === 'cars' && <CarsCatalogView />}
        {currentView === 'vehicle-pdp' && <VehiclePdpView />}
        {currentView === 'parts' && <PartsCatalogView />}
        {currentView === 'part-pdp' && <PartPdpView />}
        {currentView === 'services' && <ServicesView />}
        {currentView === 'machinery' && <MachineryRentalView />}
        {currentView === 'wishlist' && <WishlistView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'login' && <AuthView />}
        {currentView === 'trade-in' && <TradeInView />}
        {currentView === 'financing' && <FinancingView />}
        {currentView === 'account' && <AccountView />}
        {currentView === 'locations' && <LocationsView />}
        {currentView === 'claims' && <ClaimsBookView />}
        {currentView === 'about' && <AboutView />}
        {currentView === 'admin' && (
          user.isLoggedIn && user.role === 'admin' ? (
            isAdminUnlocked ? (
              <AdminDashboardView />
            ) : (
              <div className="max-w-md mx-auto my-16 p-8 bg-[#181e40] rounded-none border border-[#F07F00]/50 text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 rounded-none bg-[#212955] text-[#F07F00] flex items-center justify-center mx-auto border border-[#F07F00]/40">
                  <span className="material-symbols-outlined text-3xl">key</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#F07F00] font-bold">
                    Autenticación en Dos Pasos (2FA)
                  </span>
                  <h2 className="font-headline font-bold text-xl text-white">
                    Consola de Administración Segura
                  </h2>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Has iniciado sesión como <strong>{user.name}</strong> (Administrador). Para acceder al panel de control y base de datos, ingresa tu PIN de seguridad.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentView('home')}
                    className="btn-secondary px-5 py-2.5 text-xs font-bold w-full sm:w-auto rounded-none"
                  >
                    Volver a la Tienda
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdminPinModalOpen(true)}
                    className="btn-primary px-5 py-2.5 text-xs font-bold w-full sm:w-auto rounded-none flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">lock_open</span>
                    Desbloquear con PIN
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Stealth 404 / Access Denied for non-admin accounts to prevent route enumeration & hacking */
            <div className="max-w-lg mx-auto my-20 p-8 bg-[#181e40]/90 rounded-none border border-white/10 text-center space-y-5 shadow-2xl">
              <div className="w-16 h-16 rounded-none bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
                <span className="material-symbols-outlined text-4xl">error_outline</span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-red-400 tracking-wider uppercase">
                  Código 404 • Recurso Privado o Inexistente
                </span>
                <h2 className="font-headline font-bold text-2xl text-white">
                  Página No Encontrada
                </h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                La ruta solicitada no está disponible públicamente o requiere credenciales de seguridad de nivel institucional no asociadas a esta sesión.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentView('home')}
                  className="btn-primary px-6 py-2.5 text-xs font-bold w-full sm:w-auto rounded-none"
                >
                  Ir al Inicio de Nor Celis
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('cars')}
                  className="btn-secondary px-5 py-2.5 text-xs font-bold w-full sm:w-auto rounded-none"
                >
                  Ver Catálogo de Autos
                </button>
              </div>
            </div>
          )
        )}
        {currentView === 'order-tracking' && <OrderTrackingView />}
        {currentView === 'terms-policies' && <TermsPoliciesView />}
      </main>

      {/* Dealership Footer */}
      {currentView !== 'admin' && <Footer />}

      {/* Modals & Dialogs */}
      <GarageModal />
      <TestDriveModal />
      <QuickQuoteModal />
      <PdfPreviewModal data={pdfModalData} onClose={closePdfModal} onShowToast={showToast} />
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={() => {
          setIsAdminUnlocked(true);
          setIsAdminPinModalOpen(false);
          setCurrentView('admin');
          showToast('✓ Acceso administrativo concedido');
        }}
        currentPin={adminPin}
      />

      {/* Floating Speed Dial Hub (Cotización Principal Naranja, Asesor Virtual, WhatsApp) */}
      <FloatingHub />

      {/* Floating Automotive Advisor Chatbox & WhatsApp */}
      <AdvisorChatbox />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#212955] text-white text-xs font-semibold px-5 py-3 rounded-none shadow-2xl border border-[#F07F00] flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
