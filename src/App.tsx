import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { GarageModal } from './components/GarageModal';
import { TestDriveModal } from './components/TestDriveModal';
import { Viewer360Modal } from './components/Viewer360Modal';
import { AdvisorChatbox } from './components/AdvisorChatbox';
import { HomeView } from './views/HomeView';
import { CarsCatalogView } from './views/CarsCatalogView';
import { VehiclePdpView } from './views/VehiclePdpView';
import { PartsCatalogView } from './views/PartsCatalogView';
import { PartPdpView } from './views/PartPdpView';
import { ServicesView } from './views/ServicesView';
import { WishlistView } from './views/WishlistView';
import { CartView } from './views/CartView';
import { AuthView } from './views/AuthView';
import { TradeInView } from './views/TradeInView';
import { FinancingView } from './views/FinancingView';
import { AccountView } from './views/AccountView';
import { LocationsView } from './views/LocationsView';
import { ClaimsBookView } from './views/ClaimsBookView';
import { AboutView } from './views/AboutView';

const MainContent: React.FC = () => {
  const { currentView, toastMessage } = useApp();

  // Scroll to top whenever current view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased selection:bg-secondary-container selection:text-white">
      {/* Sticky Header with active garage and search */}
      <Header />

      {/* Main Body Routing */}
      <main className="flex-1">
        {currentView === 'home' && <HomeView />}
        {currentView === 'cars' && <CarsCatalogView />}
        {currentView === 'vehicle-pdp' && <VehiclePdpView />}
        {currentView === 'parts' && <PartsCatalogView />}
        {currentView === 'part-pdp' && <PartPdpView />}
        {currentView === 'services' && <ServicesView />}
        {currentView === 'wishlist' && <WishlistView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'login' && <AuthView />}
        {currentView === 'trade-in' && <TradeInView />}
        {currentView === 'financing' && <FinancingView />}
        {currentView === 'account' && <AccountView />}
        {currentView === 'locations' && <LocationsView />}
        {currentView === 'claims' && <ClaimsBookView />}
        {currentView === 'about' && <AboutView />}
      </main>

      {/* Dealership Footer */}
      <Footer />

      {/* Modals & Dialogs */}
      <GarageModal />
      <TestDriveModal />
      <Viewer360Modal />

      {/* Floating Automotive Advisor Chatbox & WhatsApp */}
      <AdvisorChatbox />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-2xl border border-primary-container flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
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
