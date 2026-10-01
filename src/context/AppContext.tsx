import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { hashPassword, verifyPassword, isLegacyPlaintext } from '../utils/cryptoUtils';
import { ViewMode, ActiveGarageVehicle, CartItem, WishlistItem, Vehicle, AutoPart, WorkshopService, HeroSlide, AppUser, UserRole, StoredUserAccount, CinematicCategory, OfficialBrand, PanoramicBannerConfig, ShowcaseOfferCard } from '../types';
import { INITIAL_ACTIVE_GARAGE, AVAILABLE_GARAGE_VEHICLES, VEHICLES_DATA, AUTO_PARTS_DATA, WORKSHOP_SERVICES_DATA, INITIAL_HERO_SLIDES } from '../data/mockData';
import { DEFAULT_CINEMATIC_CATEGORIES, DEFAULT_OFFICIAL_BRANDS, DEFAULT_PANORAMIC_BANNER, DEFAULT_TOP_OFFER_CARDS, DEFAULT_BOTTOM_OFFER_CARDS } from '../data/homeShowcaseData';
import { PdfModalData } from '../components/PdfPreviewModal';
import {
  getNotificationPermission,
  getPriceAlertsEnabled,
  setPriceAlertsEnabled,
  requestNotificationPermission as requestBrowserNotificationPermission,
  checkPriceVariationsForGarage,
  triggerTestPriceAlertNotification,
  NotificationPermissionStatus,
  PriceAlertCheckResult,
} from '../services/notificationService';
import { parseCurrentUrl, buildUrlForRoute, RouteState } from '../utils/urlRouter';

export interface QuickQuoteItem {
  type: 'vehicle' | 'part' | 'service' | 'custom';
  id?: string;
  title: string;
  skuOrCode: string;
  priceSoles: number;
  priceUsd?: number;
  image?: string;
  specs?: string;
}

interface AppContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  selectedPartSku: string;
  setSelectedPartSku: (sku: string) => void;
  activeGarage: ActiveGarageVehicle | null;
  setActiveGarage: (garage: ActiveGarageVehicle | null) => void;
  garageVehicles: ActiveGarageVehicle[];
  addGarageVehicle: (vehicle: Omit<ActiveGarageVehicle, 'id'>) => void;
  updateGarageVehicle: (vehicleIdOrPlate: string, updatedData: Partial<ActiveGarageVehicle>) => void;
  deleteGarageVehicle: (vehicleIdOrPlate: string) => void;
  isGarageModalOpen: boolean;
  setIsGarageModalOpen: (open: boolean) => void;
  alertsEnabled: boolean;
  permissionStatus: NotificationPermissionStatus;
  requestNotificationPermission: () => Promise<NotificationPermissionStatus>;
  setPriceAlertsSubscription: (enabled: boolean) => Promise<boolean>;
  checkGaragePriceChanges: (onNavigateToVehicle?: (vehicleId: string) => void) => PriceAlertCheckResult;
  sendTestPriceAlert: (onNavigateToVehicle?: (vehicleId: string) => void) => boolean;
  isViewer360Open: boolean;
  setIsViewer360Open: (open: boolean) => void;
  isTestDriveModalOpen: boolean;
  setIsTestDriveModalOpen: (open: boolean) => void;
  isQuickQuoteOpen: boolean;
  setIsQuickQuoteOpen: (open: boolean) => void;
  quickQuoteItem: QuickQuoteItem | null;
  openQuickQuote: (item?: QuickQuoteItem) => void;
  closeQuickQuote: () => void;
  isAdvisorChatOpen: boolean;
  setIsAdvisorChatOpen: (open: boolean) => void;
  toggleAdvisorChat: () => void;
  pdfModalData: PdfModalData | null;
  openPdfModal: (data: PdfModalData) => void;
  closePdfModal: () => void;
  
  cartItems: CartItem[];
  addToCart: (item: {
    type: 'part' | 'service' | 'vehicle_reservation';
    title: string;
    skuOrCode: string;
    priceSoles: number;
    image: string;
    specsSubtitle?: string;
    hasWorkshopInstallation?: boolean;
    installationFeeSoles?: number;
    quantity?: number;
  }) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  toggleCartInstallation: (id: string) => void;
  cartTotalCount: number;
  cartSubtotalSoles: number;

  wishlistItems: WishlistItem[];
  toggleWishlist: (item: {
    id: string;
    type: 'vehicle' | 'part' | 'service';
    title: string;
    subtitle: string;
    sku: string;
    priceSoles: number;
    priceUsd?: number;
    oldPriceSoles?: number;
    image: string;
    categoryBadge: string;
  }) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  moveWishlistToCart: (wishlistId: string) => void;
  moveAllWishlistToCart: () => void;
  wishlistTotalCount: number;

  toastMessage: string | null;
  showToast: (msg: string) => void;

  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updated: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;

  promoSlides: HeroSlide[];
  addPromoSlide: (slide: Omit<HeroSlide, 'id'>) => void;
  updatePromoSlide: (id: string, updated: Partial<HeroSlide>) => void;
  deletePromoSlide: (id: string) => void;
  reorderPromoSlides: (slides: HeroSlide[]) => void;

  autoParts: AutoPart[];
  addAutoPart: (part: Omit<AutoPart, 'id'>) => void;
  updateAutoPart: (id: string, updated: Partial<AutoPart>) => void;
  deleteAutoPart: (id: string) => void;

  services: WorkshopService[];

  adminPin: string;
  setAdminPin: (pin: string) => void;
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (val: boolean) => void;
  isAdminPinModalOpen: boolean;
  setIsAdminPinModalOpen: (open: boolean) => void;
  resetToDefaultData: () => void;

  user: AppUser;
  loginUser: (name: string, email: string, role?: UserRole) => void;
  loginWithCredentials: (
    emailOrDoc: string,
    password: string
  ) => { success: boolean; message: string; user?: AppUser };
  loginWithCredentialsAsync: (
    emailOrDoc: string,
    password: string
  ) => Promise<{ success: boolean; message: string; user?: AppUser }>;
  registerAccount: (data: {
    name: string;
    email: string;
    password: string;
    docType: string;
    docNumber: string;
    phone: string;
    vehicle?: { brand: string; model: string; year: string };
  }) => { success: boolean; message: string; user?: AppUser };
  logoutUser: () => void;
  registeredAccounts: StoredUserAccount[];
  findAccountForRecovery: (emailOrDoc: string) => {
    found: boolean;
    maskedEmail?: string;
    maskedPhone?: string;
    accountName?: string;
    identifier?: string;
  };
  updateAccountPassword: (identifier: string, newPassword: string) => {
    success: boolean;
    message: string;
  };

  catalogCategoryFilter: string;
  setCatalogCategoryFilter: (cat: string) => void;
  catalogBrandFilter: string;
  setCatalogBrandFilter: (brand: string) => void;
  catalogSearchQuery: string;
  setCatalogSearchQuery: (query: string) => void;
  navigateToPartsCatalog: (category?: string, brand?: string, search?: string) => void;

  trackingOrderCode: string;
  setTrackingOrderCode: (code: string) => void;
  termsActiveTab: 'terms' | 'privacy' | 'warranty' | 'shipping';
  setTermsActiveTab: (tab: 'terms' | 'privacy' | 'warranty' | 'shipping') => void;
  navigateToTracking: (orderCode?: string) => void;
  navigateToTerms: (tab?: 'terms' | 'privacy' | 'warranty' | 'shipping') => void;

  homeCategories: CinematicCategory[];
  updateHomeCategory: (code: string, updated: Partial<CinematicCategory>) => void;
  resetHomeCategories: () => void;
  officialBrands: OfficialBrand[];
  addOfficialBrand: (brand: OfficialBrand) => void;
  updateOfficialBrand: (code: string, updated: Partial<OfficialBrand>) => void;
  deleteOfficialBrand: (code: string) => void;
  resetOfficialBrands: () => void;

  panoramicBanner: PanoramicBannerConfig;
  updatePanoramicBanner: (updated: Partial<PanoramicBannerConfig>) => void;
  resetPanoramicBanner: () => void;

  topOfferCards: ShowcaseOfferCard[];
  updateTopOfferCard: (id: string, updated: Partial<ShowcaseOfferCard>) => void;
  resetTopOfferCards: () => void;

  bottomOfferCards: ShowcaseOfferCard[];
  updateBottomOfferCard: (id: string, updated: Partial<ShowcaseOfferCard>) => void;
  resetBottomOfferCards: () => void;

  resetAllBannersAndShowcase: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialRouteRef = useRef<RouteState>(typeof window !== 'undefined' ? parseCurrentUrl() : { view: 'home' });
  const initialRoute = initialRouteRef.current;

  const [currentView, setCurrentView] = useState<ViewMode>(initialRoute.view || 'home');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialRoute.vehicleId || 'veh-rav4-2025');
  const [selectedPartSku, setSelectedPartSku] = useState<string>(initialRoute.partSku || 'PART-TOY-BRK-01');

  const [garageVehicles, setGarageVehicles] = useState<ActiveGarageVehicle[]>(() => {
    try {
      // Remove legacy non-user scoped keys
      localStorage.removeItem('norcelis_garage_vehicles');
      localStorage.removeItem('norcelis_active_garage');

      const savedAuth = localStorage.getItem('norcelis_current_auth_user');
      let userId = 'guest';
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed?.isLoggedIn && parsed?.id) {
          userId = parsed.id;
        }
      }
      const storageKey = userId === 'guest' ? 'norcelis_garage_vehicles_guest' : `norcelis_garage_vehicles_${userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading garage vehicles from localStorage', e);
    }
    // Guests and new accounts have NO vehicles by default (empty)
    return [];
  });

  const [activeGarage, setActiveGarage] = useState<ActiveGarageVehicle | null>(() => {
    try {
      const savedAuth = localStorage.getItem('norcelis_current_auth_user');
      let userId = 'guest';
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed?.isLoggedIn && parsed?.id) {
          userId = parsed.id;
        }
      }
      const storageKey = userId === 'guest' ? 'norcelis_active_garage_guest' : `norcelis_active_garage_${userId}`;
      const savedActive = localStorage.getItem(storageKey);
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        if (parsed && parsed.brand) return parsed;
      }
    } catch (e) {
      console.error('Error loading active garage from localStorage', e);
    }
    // Starts with null if no vehicle registered
    return null;
  });



  const addGarageVehicle = (newVeh: Omit<ActiveGarageVehicle, 'id'>) => {
    const created: ActiveGarageVehicle = {
      ...newVeh,
      id: `gar-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setGarageVehicles((prev) => [created, ...prev]);
    setActiveGarage(created);
    showToast(`¡${created.brand} ${created.model} registrado y activado en Mi Garaje!`);
  };

  const updateGarageVehicle = (vehicleIdOrPlate: string, updatedData: Partial<ActiveGarageVehicle>) => {
    setGarageVehicles((prev) =>
      prev.map((v) => {
        const matches = v.id === vehicleIdOrPlate || v.plate === vehicleIdOrPlate || v.vin === vehicleIdOrPlate;
        if (!matches) return v;
        const updated = { ...v, ...updatedData };
        // If active vehicle is being updated, update activeGarage state too
        if (activeGarage && (activeGarage.id === v.id || activeGarage.plate === v.plate || activeGarage.vin === v.vin)) {
          setActiveGarage(updated);
        }
        return updated;
      })
    );
    showToast(`Datos del vehículo actualizados con éxito`);
  };

  const deleteGarageVehicle = (vehicleIdOrPlate: string) => {
    const targetVehicle = garageVehicles.find(
      (v) => v.id === vehicleIdOrPlate || v.plate === vehicleIdOrPlate || v.vin === vehicleIdOrPlate
    );

    const remaining = garageVehicles.filter(
      (v) => !(v.id === vehicleIdOrPlate || v.plate === vehicleIdOrPlate || v.vin === vehicleIdOrPlate)
    );

    setGarageVehicles(remaining);

    // If deleted vehicle was currently active, auto-select the next available vehicle or null
    const wasActive =
      activeGarage &&
      (activeGarage.id === vehicleIdOrPlate ||
        activeGarage.plate === vehicleIdOrPlate ||
        activeGarage.vin === vehicleIdOrPlate ||
        (targetVehicle && activeGarage.model === targetVehicle.model && activeGarage.year === targetVehicle.year));

    if (wasActive) {
      const nextVehicle = remaining.length > 0 ? remaining[0] : null;
      setActiveGarage(nextVehicle);
      if (nextVehicle) {
        showToast(
          `Vehículo eliminado. Se activó automáticamente ${nextVehicle.brand} ${nextVehicle.model}.`
        );
      } else {
        showToast(`Vehículo eliminado. Tu garaje ahora está vacío.`);
      }
    } else {
      showToast(`Vehículo eliminado de Mi Garaje`);
    }
  };
  
  const [isGarageModalOpen, setIsGarageModalOpen] = useState(() => initialRoute.modal === 'garage');

  // Notification & Price Alerts State
  const [alertsEnabled, setAlertsEnabledState] = useState<boolean>(() => getPriceAlertsEnabled());
  const [permissionStatus, setPermissionStatusState] = useState<NotificationPermissionStatus>(() =>
    getNotificationPermission()
  );

  useEffect(() => {
    setPermissionStatusState(getNotificationPermission());
    setAlertsEnabledState(getPriceAlertsEnabled());
  }, [isGarageModalOpen]);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
    const status = await requestBrowserNotificationPermission();
    setPermissionStatusState(status);
    if (status === 'granted') {
      setAlertsEnabledState(true);
      setPriceAlertsEnabled(true);
      showToast('✓ Permiso concedido: Alertas de precio web activadas para Mi Garaje.');
    } else if (status === 'denied') {
      setAlertsEnabledState(false);
      setPriceAlertsEnabled(false);
      showToast('Las notificaciones están bloqueadas en la configuración de tu navegador.');
    }
    return status;
  }, []);

  const setPriceAlertsSubscription = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (enabled) {
      const currentPerm = getNotificationPermission();
      if (currentPerm === 'granted') {
        setAlertsEnabledState(true);
        setPriceAlertsEnabled(true);
        showToast('✓ Alertas de precio web activadas para Mi Garaje.');
        return true;
      } else {
        const result = await requestBrowserNotificationPermission();
        setPermissionStatusState(result);
        if (result === 'granted') {
          setAlertsEnabledState(true);
          setPriceAlertsEnabled(true);
          showToast('✓ Permiso concedido: Alertas de precio web activadas para Mi Garaje.');
          return true;
        } else {
          setAlertsEnabledState(false);
          setPriceAlertsEnabled(false);
          if (result === 'denied') {
            showToast('Las notificaciones están bloqueadas en la configuración del navegador.');
          } else {
            showToast('Permiso de notificaciones no otorgado.');
          }
          return false;
        }
      }
    } else {
      setAlertsEnabledState(false);
      setPriceAlertsEnabled(false);
      showToast('Alertas de precio desactivadas.');
      return false;
    }
  }, []);

  const checkGaragePriceChanges = useCallback((onNavigateToVehicle?: (vehicleId: string) => void): PriceAlertCheckResult => {
    return checkPriceVariationsForGarage(garageVehicles, undefined, onNavigateToVehicle);
  }, [garageVehicles]);

  const sendTestPriceAlert = useCallback((onNavigateToVehicle?: (vehicleId: string) => void): boolean => {
    const targetVeh = activeGarage || garageVehicles[0] || {
      brand: 'Toyota',
      model: 'Hilux Revo 4x4 D-Cab',
      year: 2025,
      plate: 'ABC-123',
      engine: '2.8L Turbo Diésel',
    };
    return triggerTestPriceAlertNotification(targetVeh, undefined, onNavigateToVehicle);
  }, [activeGarage, garageVehicles]);

  const [isViewer360Open, setIsViewer360Open] = useState(() => initialRoute.modal === 'viewer-360');
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState(() => initialRoute.modal === 'test-drive');
  const [pdfModalData, setPdfModalData] = useState<PdfModalData | null>(null);
  const [isQuickQuoteOpen, setIsQuickQuoteOpen] = useState(() => initialRoute.modal === 'quote');
  const [quickQuoteItem, setQuickQuoteItem] = useState<QuickQuoteItem | null>(null);

  const openQuickQuote = (item?: QuickQuoteItem) => {
    if (item) {
      setQuickQuoteItem(item);
    }
    setIsQuickQuoteOpen(true);
  };

  const closeQuickQuote = () => {
    setIsQuickQuoteOpen(false);
  };

  const [isAdvisorChatOpen, setIsAdvisorChatOpen] = useState(false);
  const toggleAdvisorChat = () => setIsAdvisorChatOpen((prev) => !prev);

  const openPdfModal = (data: PdfModalData) => {
    setPdfModalData(data);
  };

  const closePdfModal = () => {
    setPdfModalData(null);
  };

  // Cart & Wishlist initialized empty for unauthenticated visitors and new accounts
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedUserStr = localStorage.getItem('norcelis_current_auth_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && savedUser.isLoggedIn && savedUser.id) {
          const userCart = localStorage.getItem(`norcelis_cart_${savedUser.id}`);
          if (userCart) return JSON.parse(userCart);
        }
      }
    } catch (e) {}
    return [];
  });

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => {
    try {
      const savedUserStr = localStorage.getItem('norcelis_current_auth_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && savedUser.isLoggedIn && savedUser.id) {
          const userWishlist = localStorage.getItem(`norcelis_wishlist_${savedUser.id}`);
          if (userWishlist) return JSON.parse(userWishlist);
        }
      }
    } catch (e) {}
    return [];
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ─── SEGURIDAD: NO hay cuentas predefinidas en el código fuente. ───────────
  // Las cuentas de administrador y clientes viven ÚNICAMENTE en la base de
  // datos de WordPress/Hostinger y se obtienen vía API REST al activar
  // VITE_ENABLE_REMOTE_API=true. El modo offline/demo opera sin cuentas
  // predefinidas — el admin puede crear su cuenta la primera vez que se
  // conecte al backend.
  // ─────────────────────────────────────────────────────────────────────────────

  const [registeredAccounts, setRegisteredAccounts] = useState<StoredUserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_registered_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading registered accounts', e);
    }
    // Sin cuentas predefinidas — array vacío hasta que el admin configure el backend
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_registered_accounts', JSON.stringify(registeredAccounts));
    } catch (e) {
      console.error('Error saving registered accounts', e);
    }
  }, [registeredAccounts]);

  const [user, setUser] = useState<AppUser>(() => {
    try {
      const saved = localStorage.getItem('norcelis_current_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.name === 'string') {
          return parsed;
        }
      }
    } catch (e) {}
    // Default guest session (unauthenticated) - Starts with NO active session!
    return {
      id: 'usr_guest',
      name: 'Invitado',
      email: '',
      role: 'customer',
      isLoggedIn: false,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_current_auth_user', JSON.stringify(user));
    } catch (e) {}
  }, [user]);

  // Track previous authenticated user ID to prevent race conditions or cross-account leakage
  const prevUserIdRef = useRef<string | null>(null);

  // Sync cart, wishlist, and garage whenever active authenticated user changes (login, logout, new registration)
  useEffect(() => {
    const currentUserId = user.isLoggedIn && user.id ? user.id : null;

    // Initial mount check
    if (prevUserIdRef.current === null) {
      prevUserIdRef.current = currentUserId || 'guest';
      if (!currentUserId) {
        setCartItems([]);
        setWishlistItems([]);
        try {
          localStorage.removeItem('norcelis_cart_guest');
          localStorage.removeItem('norcelis_wishlist_guest');
        } catch (e) {}
      }
      return;
    }

    // Account change or logout detected
    if (prevUserIdRef.current !== (currentUserId || 'guest')) {
      prevUserIdRef.current = currentUserId || 'guest';

      if (user.isLoggedIn && user.id) {
        // Authenticated user: load their specific saved cart, wishlist, and garage
        try {
          const userCart = localStorage.getItem(`norcelis_cart_${user.id}`);
          setCartItems(userCart ? JSON.parse(userCart) : []);
        } catch {
          setCartItems([]);
        }
        try {
          const userWishlist = localStorage.getItem(`norcelis_wishlist_${user.id}`);
          setWishlistItems(userWishlist ? JSON.parse(userWishlist) : []);
        } catch {
          setWishlistItems([]);
        }
        try {
          const userGarage = localStorage.getItem(`norcelis_garage_vehicles_${user.id}`);
          const parsedGarage = userGarage ? JSON.parse(userGarage) : [];
          setGarageVehicles(Array.isArray(parsedGarage) ? parsedGarage : []);
          const userActive = localStorage.getItem(`norcelis_active_garage_${user.id}`);
          setActiveGarage(userActive ? JSON.parse(userActive) : (parsedGarage[0] || null));
        } catch {
          setGarageVehicles([]);
          setActiveGarage(null);
        }
      } else {
        // Unauthenticated visitor / guest / logged out: strictly empty cart and favorites, load guest garage if any
        setCartItems([]);
        setWishlistItems([]);
        try {
          localStorage.removeItem('norcelis_cart_guest');
          localStorage.removeItem('norcelis_wishlist_guest');
          const guestGarage = localStorage.getItem('norcelis_garage_vehicles_guest');
          const parsedGuestGarage = guestGarage ? JSON.parse(guestGarage) : [];
          setGarageVehicles(Array.isArray(parsedGuestGarage) ? parsedGuestGarage : []);
          const guestActive = localStorage.getItem('norcelis_active_garage_guest');
          setActiveGarage(guestActive ? JSON.parse(guestActive) : (parsedGuestGarage[0] || null));
        } catch (e) {
          setGarageVehicles([]);
          setActiveGarage(null);
        }
      }
    }
  }, [user.isLoggedIn, user.id]);

  // Persist cartItems ONLY when a valid user is logged in
  useEffect(() => {
    try {
      if (user.isLoggedIn && user.id) {
        localStorage.setItem(`norcelis_cart_${user.id}`, JSON.stringify(cartItems));
      } else {
        // For unauthenticated visitors, do NOT store persistent cart items
        localStorage.removeItem('norcelis_cart_guest');
      }
    } catch (e) {}
  }, [cartItems, user.isLoggedIn, user.id]);

  // Persist wishlistItems ONLY when a valid user is logged in
  useEffect(() => {
    try {
      if (user.isLoggedIn && user.id) {
        localStorage.setItem(`norcelis_wishlist_${user.id}`, JSON.stringify(wishlistItems));
      } else {
        // For unauthenticated visitors, do NOT store persistent wishlist items
        localStorage.removeItem('norcelis_wishlist_guest');
      }
    } catch (e) {}
  }, [wishlistItems, user.isLoggedIn, user.id]);

  // Sync garageVehicles to localStorage for guest or user
  useEffect(() => {
    try {
      const storageKey = user.isLoggedIn && user.id
        ? `norcelis_garage_vehicles_${user.id}`
        : 'norcelis_garage_vehicles_guest';
      localStorage.setItem(storageKey, JSON.stringify(garageVehicles));
    } catch (e) {
      console.error('Error saving garage vehicles to localStorage', e);
    }
  }, [garageVehicles, user.isLoggedIn, user.id]);

  // Sync activeGarage to localStorage for guest or user
  useEffect(() => {
    try {
      const storageKey = user.isLoggedIn && user.id
        ? `norcelis_active_garage_${user.id}`
        : 'norcelis_active_garage_guest';
      if (activeGarage) {
        localStorage.setItem(storageKey, JSON.stringify(activeGarage));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (e) {
      console.error('Error saving active garage to localStorage', e);
    }
  }, [activeGarage, user.isLoggedIn, user.id]);

  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>(() => initialRoute.category || 'todos');
  const [catalogBrandFilter, setCatalogBrandFilter] = useState<string>(() => initialRoute.brand || 'todos');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>(() => initialRoute.search || '');

  const navigateToPartsCatalog = (category?: string, brand?: string, search?: string) => {
    setSelectedPartSku('');
    if (category !== undefined) setCatalogCategoryFilter(category);
    if (brand !== undefined) setCatalogBrandFilter(brand);
    if (search !== undefined) setCatalogSearchQuery(search);
    setCurrentView('parts');
  };

  const [trackingOrderCode, setTrackingOrderCode] = useState<string>(() => initialRoute.trackingCode || '');
  const [termsActiveTab, setTermsActiveTab] = useState<'terms' | 'privacy' | 'warranty' | 'shipping'>(() => initialRoute.termsTab || 'terms');

  const navigateToTracking = (orderCode?: string) => {
    if (orderCode) setTrackingOrderCode(orderCode);
    setCurrentView('order-tracking');
  };

  const navigateToTerms = (tab?: 'terms' | 'privacy' | 'warranty' | 'shipping') => {
    if (tab) setTermsActiveTab(tab);
    setCurrentView('terms-policies');
  };

  // Vehicles dynamic state
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_custom_vehicles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading vehicles from localStorage', e);
    }
    return VEHICLES_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_custom_vehicles', JSON.stringify(vehicles));
    } catch (e) {
      console.error('Error saving vehicles to localStorage', e);
    }
  }, [vehicles]);

  const addVehicle = (newVeh: Omit<Vehicle, 'id'>) => {
    const created: Vehicle = {
      ...newVeh,
      id: `veh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setVehicles((prev) => [created, ...prev]);
    showToast(`Vehículo ${created.brand} ${created.name} publicado`);
  };

  const updateVehicle = (id: string, updatedData: Partial<Vehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedData } : v))
    );
    showToast(`Vehículo actualizado correctamente`);
  };

  const deleteVehicle = (id: string) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    showToast(`Vehículo retirado del catálogo`);
  };

  // Promo Slides dynamic state
  const [promoSlides, setPromoSlides] = useState<HeroSlide[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_promo_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading promo slides from localStorage', e);
    }
    return INITIAL_HERO_SLIDES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_promo_slides', JSON.stringify(promoSlides));
    } catch (e) {
      console.error('Error saving promo slides to localStorage', e);
    }
  }, [promoSlides]);

  const addPromoSlide = (newSlide: Omit<HeroSlide, 'id'>) => {
    const created: HeroSlide = {
      ...newSlide,
      id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setPromoSlides((prev) => [created, ...prev]);
    showToast(`Banner publicitario añadido exitosamente`);
  };

  const updatePromoSlide = (id: string, updatedData: Partial<HeroSlide>) => {
    setPromoSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
    showToast(`Banner publicitario actualizado`);
  };

  const deletePromoSlide = (id: string) => {
    setPromoSlides((prev) => prev.filter((s) => s.id !== id));
    showToast(`Banner eliminado de la rotación`);
  };

  const reorderPromoSlides = (newSlides: HeroSlide[]) => {
    setPromoSlides(newSlides);
    showToast(`Orden de banners actualizado`);
  };

  // Admin PIN & Security state
  const [adminPin, setAdminPinState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('norcelis_admin_pin');
      if (saved && saved.length === 4) return saved;
    } catch (e) {}
    return '1234';
  });

  const setAdminPin = (pin: string) => {
    setAdminPinState(pin);
    try {
      localStorage.setItem('norcelis_admin_pin', pin);
    } catch (e) {}
    showToast('PIN de administrador actualizado exitosamente');
  };

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);

  // Auto Parts dynamic state
  const [autoParts, setAutoParts] = useState<AutoPart[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_custom_parts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= AUTO_PARTS_DATA.length) {
          const hasDot51 = parsed.some((p: AutoPart) => p.sku === 'BRM-DOT51-500');
          if (hasDot51) return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading auto parts from localStorage', e);
    }
    return AUTO_PARTS_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_custom_parts', JSON.stringify(autoParts));
    } catch (e) {
      console.error('Error saving auto parts to localStorage', e);
    }
  }, [autoParts]);

  const addAutoPart = (newPart: Omit<AutoPart, 'id'>) => {
    const created: AutoPart = {
      ...newPart,
      id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setAutoParts((prev) => [created, ...prev]);
    showToast(`Repuesto "${created.name}" publicado en catálogo`);
  };

  const updateAutoPart = (id: string, updatedData: Partial<AutoPart>) => {
    setAutoParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
    showToast(`Repuesto actualizado correctamente`);
  };

  const deleteAutoPart = (id: string) => {
    setAutoParts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Repuesto retirado del catálogo`);
  };

  // Cinematic Home Categories state & persistence
  const [homeCategories, setHomeCategories] = useState<CinematicCategory[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_home_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading home categories from localStorage', e);
    }
    return DEFAULT_CINEMATIC_CATEGORIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_home_categories', JSON.stringify(homeCategories));
    } catch (e) {
      console.error('Error saving home categories to localStorage', e);
    }
  }, [homeCategories]);

  const updateHomeCategory = (code: string, updatedData: Partial<CinematicCategory>) => {
    setHomeCategories((prev) =>
      prev.map((cat) => (cat.code === code ? { ...cat, ...updatedData } : cat))
    );
    showToast('Categoría actualizada correctamente');
  };

  const resetHomeCategories = () => {
    setHomeCategories(DEFAULT_CINEMATIC_CATEGORIES);
    try {
      localStorage.setItem('norcelis_home_categories', JSON.stringify(DEFAULT_CINEMATIC_CATEGORIES));
    } catch (e) {}
    showToast('Categorías restablecidas a sus valores de fábrica');
  };

  // Official Brands state & persistence
  const [officialBrands, setOfficialBrands] = useState<OfficialBrand[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_official_brands');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading official brands from localStorage', e);
    }
    return DEFAULT_OFFICIAL_BRANDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_official_brands', JSON.stringify(officialBrands));
    } catch (e) {
      console.error('Error saving official brands to localStorage', e);
    }
  }, [officialBrands]);

  const addOfficialBrand = (newBrand: OfficialBrand) => {
    setOfficialBrands((prev) => {
      const filtered = prev.filter((b) => b.code !== newBrand.code);
      return [...filtered, newBrand];
    });
    showToast(`Marca oficial "${newBrand.name}" agregada a la pasarela`);
  };

  const updateOfficialBrand = (code: string, updatedData: Partial<OfficialBrand>) => {
    setOfficialBrands((prev) =>
      prev.map((b) => (b.code === code ? { ...b, ...updatedData } : b))
    );
    showToast('Marca oficial actualizada correctamente');
  };

  const deleteOfficialBrand = (code: string) => {
    setOfficialBrands((prev) => prev.filter((b) => b.code !== code));
    showToast('Marca retirada de la pasarela');
  };

  const resetOfficialBrands = () => {
    setOfficialBrands(DEFAULT_OFFICIAL_BRANDS);
    try {
      localStorage.setItem('norcelis_official_brands', JSON.stringify(DEFAULT_OFFICIAL_BRANDS));
    } catch (e) {}
    showToast('Pasarela de marcas restablecida a los valores oficiales');
  };

  // Panoramic Power Banner state & persistence
  const [panoramicBanner, setPanoramicBanner] = useState<PanoramicBannerConfig>(() => {
    try {
      const saved = localStorage.getItem('norcelis_panoramic_banner');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.title && parsed.leftCard && parsed.rightCard) return parsed;
      }
    } catch (e) {
      console.error('Error loading panoramic banner from localStorage', e);
    }
    return DEFAULT_PANORAMIC_BANNER;
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_panoramic_banner', JSON.stringify(panoramicBanner));
    } catch (e) {
      console.error('Error saving panoramic banner to localStorage', e);
    }
  }, [panoramicBanner]);

  const updatePanoramicBanner = (updatedData: Partial<PanoramicBannerConfig>) => {
    setPanoramicBanner((prev) => ({
      ...prev,
      ...updatedData,
      leftCard: updatedData.leftCard ? { ...prev.leftCard, ...updatedData.leftCard } : prev.leftCard,
      rightCard: updatedData.rightCard ? { ...prev.rightCard, ...updatedData.rightCard } : prev.rightCard,
    }));
    showToast('Banner Panorámico 4x4 actualizado con éxito');
  };

  const resetPanoramicBanner = () => {
    setPanoramicBanner(DEFAULT_PANORAMIC_BANNER);
    try {
      localStorage.setItem('norcelis_panoramic_banner', JSON.stringify(DEFAULT_PANORAMIC_BANNER));
    } catch (e) {}
    showToast('Banner Panorámico 4x4 restablecido a su diseño original');
  };

  // Top 4 Retail Offer Cards state & persistence
  const [topOfferCards, setTopOfferCards] = useState<ShowcaseOfferCard[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_top_offer_cards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading top offer cards from localStorage', e);
    }
    return DEFAULT_TOP_OFFER_CARDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_top_offer_cards', JSON.stringify(topOfferCards));
    } catch (e) {
      console.error('Error saving top offer cards to localStorage', e);
    }
  }, [topOfferCards]);

  const updateTopOfferCard = (id: string, updatedData: Partial<ShowcaseOfferCard>) => {
    setTopOfferCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updatedData } : card))
    );
    showToast('Tarjeta de oferta actualizada correctamente');
  };

  const resetTopOfferCards = () => {
    setTopOfferCards(DEFAULT_TOP_OFFER_CARDS);
    try {
      localStorage.setItem('norcelis_top_offer_cards', JSON.stringify(DEFAULT_TOP_OFFER_CARDS));
    } catch (e) {}
    showToast('Tarjetas superiores restablecidas');
  };

  // Bottom 4 Retail Offer Cards state & persistence
  const [bottomOfferCards, setBottomOfferCards] = useState<ShowcaseOfferCard[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_bottom_offer_cards');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading bottom offer cards from localStorage', e);
    }
    return DEFAULT_BOTTOM_OFFER_CARDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('norcelis_bottom_offer_cards', JSON.stringify(bottomOfferCards));
    } catch (e) {
      console.error('Error saving bottom offer cards to localStorage', e);
    }
  }, [bottomOfferCards]);

  const updateBottomOfferCard = (id: string, updatedData: Partial<ShowcaseOfferCard>) => {
    setBottomOfferCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updatedData } : card))
    );
    showToast('Tarjeta de servicio/repuesto actualizada');
  };

  const resetBottomOfferCards = () => {
    setBottomOfferCards(DEFAULT_BOTTOM_OFFER_CARDS);
    try {
      localStorage.setItem('norcelis_bottom_offer_cards', JSON.stringify(DEFAULT_BOTTOM_OFFER_CARDS));
    } catch (e) {}
    showToast('Tarjetas inferiores restablecidas');
  };

  const resetAllBannersAndShowcase = () => {
    setPromoSlides(INITIAL_HERO_SLIDES);
    setPanoramicBanner(DEFAULT_PANORAMIC_BANNER);
    setTopOfferCards(DEFAULT_TOP_OFFER_CARDS);
    setBottomOfferCards(DEFAULT_BOTTOM_OFFER_CARDS);
    try {
      localStorage.setItem('norcelis_promo_slides', JSON.stringify(INITIAL_HERO_SLIDES));
      localStorage.setItem('norcelis_panoramic_banner', JSON.stringify(DEFAULT_PANORAMIC_BANNER));
      localStorage.setItem('norcelis_top_offer_cards', JSON.stringify(DEFAULT_TOP_OFFER_CARDS));
      localStorage.setItem('norcelis_bottom_offer_cards', JSON.stringify(DEFAULT_BOTTOM_OFFER_CARDS));
    } catch (e) {}
    showToast('¡Todos los banners publicitarios y vitrinas sincronizados con la última versión oficial!');
  };

  const resetToDefaultData = () => {
    setVehicles(VEHICLES_DATA);
    setPromoSlides(INITIAL_HERO_SLIDES);
    setAutoParts(AUTO_PARTS_DATA);
    setHomeCategories(DEFAULT_CINEMATIC_CATEGORIES);
    setOfficialBrands(DEFAULT_OFFICIAL_BRANDS);
    setPanoramicBanner(DEFAULT_PANORAMIC_BANNER);
    setTopOfferCards(DEFAULT_TOP_OFFER_CARDS);
    setBottomOfferCards(DEFAULT_BOTTOM_OFFER_CARDS);
    setAdminPinState('1234');
    setCartItems([]);
    setWishlistItems([]);
    try {
      localStorage.removeItem('norcelis_custom_vehicles');
      localStorage.removeItem('norcelis_promo_slides');
      localStorage.removeItem('norcelis_panoramic_banner');
      localStorage.removeItem('norcelis_top_offer_cards');
      localStorage.removeItem('norcelis_bottom_offer_cards');
      localStorage.removeItem('norcelis_custom_parts');
      localStorage.removeItem('norcelis_home_categories');
      localStorage.removeItem('norcelis_official_brands');
      localStorage.removeItem('norcelis_admin_pin');
      localStorage.removeItem('norcelis_cart_guest');
      localStorage.removeItem('norcelis_wishlist_guest');
    } catch (e) {}
    showToast('Catálogo, repuestos, marcas y banners restablecidos a valores originales');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const addToCart = (newItem: {
    type: 'part' | 'service' | 'vehicle_reservation';
    title: string;
    skuOrCode: string;
    priceSoles: number;
    image: string;
    specsSubtitle?: string;
    hasWorkshopInstallation?: boolean;
    installationFeeSoles?: number;
    quantity?: number;
  }) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.skuOrCode === newItem.skuOrCode);
      if (existing) {
        return prev.map((item) =>
          item.skuOrCode === newItem.skuOrCode
            ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: 'cart-' + Date.now(),
          type: newItem.type,
          title: newItem.title,
          skuOrCode: newItem.skuOrCode,
          priceSoles: newItem.priceSoles,
          quantity: newItem.quantity || 1,
          image: newItem.image,
          specsSubtitle: newItem.specsSubtitle,
          hasWorkshopInstallation: newItem.hasWorkshopInstallation,
          installationFeeSoles: newItem.installationFeeSoles,
        },
      ];
    });
    showToast(`"${newItem.title.slice(0, 32)}..." agregado al carrito`);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Producto eliminado del carrito');
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const toggleCartInstallation = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              hasWorkshopInstallation: !item.hasWorkshopInstallation,
              installationFeeSoles: !item.hasWorkshopInstallation ? 60 : undefined,
            }
          : item
      )
    );
  };

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartSubtotalSoles = cartItems.reduce((acc, item) => {
    const itemTotal = item.priceSoles * item.quantity;
    const installFee = item.hasWorkshopInstallation ? (item.installationFeeSoles || 60) * item.quantity : 0;
    return acc + itemTotal + installFee;
  }, 0);

  const toggleWishlist = (item: {
    id: string;
    type: 'vehicle' | 'part' | 'service';
    title: string;
    subtitle: string;
    sku: string;
    priceSoles: number;
    priceUsd?: number;
    oldPriceSoles?: number;
    image: string;
    categoryBadge: string;
  }) => {
    setWishlistItems((prev) => {
      const exists = prev.some((w) => w.id === item.id || w.sku === item.sku);
      if (exists) {
        showToast('Eliminado de tu lista de deseos');
        return prev.filter((w) => w.id !== item.id && w.sku !== item.sku);
      } else {
        showToast('Guardado en tu lista de deseos');
        return [
          ...prev,
          {
            ...item,
            compatibleWithActiveGarage: true,
            quantity: 1,
          },
        ];
      }
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item eliminado de deseos');
  };

  const isInWishlist = (id: string) => {
    return wishlistItems.some((item) => item.id === id || item.sku === id);
  };

  const moveWishlistToCart = (wishlistId: string) => {
    const item = wishlistItems.find((w) => w.id === wishlistId);
    if (!item) return;
    addToCart({
      type: item.type === 'service' ? 'service' : item.type === 'vehicle' ? 'vehicle_reservation' : 'part',
      title: item.title,
      skuOrCode: item.sku,
      priceSoles: item.priceSoles,
      image: item.image,
      specsSubtitle: item.subtitle,
      quantity: 1,
    });
    removeFromWishlist(wishlistId);
  };

  const moveAllWishlistToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart({
        type: item.type === 'service' ? 'service' : item.type === 'vehicle' ? 'vehicle_reservation' : 'part',
        title: item.title,
        skuOrCode: item.sku,
        priceSoles: item.priceSoles,
        image: item.image,
        specsSubtitle: item.subtitle,
        quantity: 1,
      });
    });
    setWishlistItems([]);
    showToast('Todos los ítems de deseos fueron movidos al carrito');
  };

  const loginUser = (name: string, email: string, role: UserRole = 'customer') => {
    const matched = registeredAccounts.find((acc) => acc.email.toLowerCase() === email.toLowerCase());
    const newUser: AppUser = {
      id: matched?.id || `usr_${Date.now()}`,
      name,
      email,
      role: matched?.role || role,
      docType: matched?.docType,
      docNumber: matched?.docNumber,
      phone: matched?.phone,
      isLoggedIn: true,
      createdAt: matched?.createdAt || new Date().toISOString(),
    };
    prevUserIdRef.current = newUser.id;
    try {
      const userCart = localStorage.getItem(`norcelis_cart_${newUser.id}`);
      setCartItems(userCart ? JSON.parse(userCart) : []);
    } catch {
      setCartItems([]);
    }
    try {
      const userWishlist = localStorage.getItem(`norcelis_wishlist_${newUser.id}`);
      setWishlistItems(userWishlist ? JSON.parse(userWishlist) : []);
    } catch {
      setWishlistItems([]);
    }
    setUser(newUser);
    if (newUser.role === 'admin') {
      setIsAdminUnlocked(true);
      showToast(`¡Sesión iniciada con privilegios de Administrador!`);
    } else {
      setIsAdminUnlocked(false);
      showToast(`¡Bienvenido de vuelta, ${name}!`);
    }
  };

  // ── SEGURIDAD: función privada compartida para construir la sesión ────────
  // Extraída para que tanto loginWithCredentials (legacy) como
  // loginWithCredentialsAsync (PBKDF2) puedan usarla sin re-ejecutar la
  // verificación de contraseña. NUNCA llamar directamente desde componentes.
  const buildUserSession = (account: StoredUserAccount): { success: true; message: string; user: AppUser } => {
    const authUser: AppUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      docType: account.docType,
      docNumber: account.docNumber,
      phone: account.phone,
      isLoggedIn: true,
      createdAt: account.createdAt,
    };

    prevUserIdRef.current = authUser.id;
    try {
      const userCart = localStorage.getItem(`norcelis_cart_${authUser.id}`);
      setCartItems(userCart ? JSON.parse(userCart) : []);
    } catch {
      setCartItems([]);
    }
    try {
      const userWishlist = localStorage.getItem(`norcelis_wishlist_${authUser.id}`);
      setWishlistItems(userWishlist ? JSON.parse(userWishlist) : []);
    } catch {
      setWishlistItems([]);
    }
    try {
      const userGarage = localStorage.getItem(`norcelis_garage_vehicles_${authUser.id}`);
      if (userGarage) {
        const parsedGarage = JSON.parse(userGarage);
        setGarageVehicles(Array.isArray(parsedGarage) ? parsedGarage : []);
        const userActive = localStorage.getItem(`norcelis_active_garage_${authUser.id}`);
        setActiveGarage(userActive ? JSON.parse(userActive) : (parsedGarage[0] || null));
      } else if (account.vehicle && account.vehicle.brand && account.vehicle.model) {
        const createdVeh: ActiveGarageVehicle = {
          id: `gar-${Date.now()}`,
          brand: account.vehicle.brand,
          model: account.vehicle.model,
          year: parseInt(account.vehicle.year) || 2025,
          engine: '1.8L - 2.5L Gasolina / Híbrido',
          plate: `PER-${Math.floor(100 + Math.random() * 900)}`,
          vin: `93H${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        };
        setGarageVehicles([createdVeh]);
        setActiveGarage(createdVeh);
      } else {
        setGarageVehicles([]);
        setActiveGarage(null);
      }
    } catch {
      setGarageVehicles([]);
      setActiveGarage(null);
    }

    setUser(authUser);
    if (account.role === 'admin') {
      setIsAdminUnlocked(true);
      showToast(`¡Acceso de Administrador verificado! Bienvenido, ${account.name}.`);
    } else {
      setIsAdminUnlocked(false);
      showToast(`¡Bienvenido de vuelta, ${account.name}!`);
    }

    return { success: true, message: 'Inicio de sesión exitoso', user: authUser };
  };
  // ─────────────────────────────────────────────────────────────────────────

  const loginWithCredentials = (
    emailOrDoc: string,
    password: string
  ): { success: boolean; message: string; user?: AppUser } => {
    const term = emailOrDoc.trim().toLowerCase();
    let currentAccounts = registeredAccounts;
    try {
      const stored = localStorage.getItem('norcelis_registered_accounts');
      if (stored) currentAccounts = JSON.parse(stored);
    } catch { /* fallback */ }

    const account = currentAccounts.find(
      (acc) => acc.email.toLowerCase() === term || acc.docNumber.toLowerCase() === term
    );

    if (!account) {
      return {
        success: false,
        message: 'No existe ninguna cuenta registrada con este correo o número de documento.',
      };
    }

    // ── SEGURIDAD NC-002: verificación de contraseña ────────────────────────
    // Si el hash almacenado es un texto plano legacy (sin formato salt:hash),
    // comparamos directamente pero migramos al hash PBKDF2 de forma asíncrona.
    // Para cuentas con hash PBKDF2, forzamos el flujo async (loginWithCredentialsAsync).
    const isLegacy = isLegacyPlaintext(account.passwordHash);
    if (!isLegacy) {
      // Cuenta segura: redirigir al flujo async para verificación PBKDF2
      return { success: false, message: '_USE_ASYNC_LOGIN_' };
    }

    // Cuenta legacy: comparación directa (solo durante período de migración)
    if (account.passwordHash !== password) {
      return { success: false, message: 'Contraseña incorrecta. Por favor intente nuevamente.' };
    }

    // Migrar contraseña a hash PBKDF2 asíncronamente en segundo plano
    hashPassword(password).then((newHash) => {
      setRegisteredAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, passwordHash: newHash } : a))
      );
    }).catch(() => { /* No bloquear el login si falla el hash */ });
    // ────────────────────────────────────────────────────────────────────────

    return buildUserSession(account);
  };

  /**
   * NC-002 FIX: Versión asíncrona del login — para cuentas con hash PBKDF2.
   * Los componentes de login deben llamar PRIMERO a loginWithCredentials(),
   * y si reciben { message: '_USE_ASYNC_LOGIN_' }, llamar a esta función.
   * Esta función verifica el hash PBKDF2 y construye la sesión sin re-verificar.
   */
  const loginWithCredentialsAsync = async (
    emailOrDoc: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: AppUser }> => {
    const term = emailOrDoc.trim().toLowerCase();
    let currentAccounts = registeredAccounts;
    try {
      const stored = localStorage.getItem('norcelis_registered_accounts');
      if (stored) currentAccounts = JSON.parse(stored);
    } catch { /* fallback */ }

    const account = currentAccounts.find(
      (acc) => acc.email.toLowerCase() === term || acc.docNumber.toLowerCase() === term
    );

    if (!account) {
      return { success: false, message: 'No existe ninguna cuenta con este correo o documento.' };
    }

    // Verificación PBKDF2 async (segura, tiempo constante)
    const isValid = await verifyPassword(password, account.passwordHash);
    if (!isValid) {
      return { success: false, message: 'Contraseña incorrecta. Por favor intente nuevamente.' };
    }

    // Contraseña verificada — construir sesión sin re-verificar
    return buildUserSession(account);
  };

  const registerAccount = (data: {
    name: string;
    email: string;
    password: string;
    docType: string;
    docNumber: string;
    phone: string;
    vehicle?: { brand: string; model: string; year: string };
  }): { success: boolean; message: string; user?: AppUser } => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanDoc = data.docNumber.trim();

    // Check duplicate email
    if (registeredAccounts.some((acc) => acc.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        message: 'Ya existe una cuenta registrada con este correo electrónico.',
      };
    }

    // Check duplicate document
    if (registeredAccounts.some((acc) => acc.docNumber === cleanDoc)) {
      return {
        success: false,
        message: `Ya existe una cuenta registrada con este número de ${data.docType}.`,
      };
    }

    // ── SEGURIDAD NC-002: el registro SIEMPRE debe hashear la contraseña ──────
    // La contraseña se hashea con PBKDF2 antes de guardar en localStorage.
    // Nota: el registro es ahora async (ver registerAccountAsync).
    // Esta versión síncrona guarda un placeholder para no bloquear la UI;
    // registerAccountAsync() debe usarse en los formularios de registro.
    const newAccount: StoredUserAccount = {
      id: `usr_cust_${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash: '__PENDING_HASH__', // Temporal — reemplazado inmediatamente por registerAccountAsync
      role: 'customer',
      docType: data.docType,
      docNumber: cleanDoc,
      phone: data.phone.trim(),
      createdAt: new Date().toISOString(),
      vehicle: data.vehicle,
    };

    setRegisteredAccounts((prev) => [...prev, newAccount]);

    // If customer entered vehicle info, also register to active garage
    if (data.vehicle && data.vehicle.brand && data.vehicle.model) {
      addGarageVehicle({
        brand: data.vehicle.brand,
        model: data.vehicle.model,
        year: parseInt(data.vehicle.year) || 2025,
        engine: '1.8L - 2.5L Gasolina / Híbrido',
        plate: `PER-${Math.floor(100 + Math.random() * 900)}`,
        vin: `93H${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      });
    } else {
      // New account with no vehicle specified starts strictly with empty garage
      setGarageVehicles([]);
      setActiveGarage(null);
      try {
        localStorage.setItem(`norcelis_garage_vehicles_${newAccount.id}`, JSON.stringify([]));
        localStorage.removeItem(`norcelis_active_garage_${newAccount.id}`);
      } catch (e) {}
    }

    // Brand new account: start with 0 saved favorites and 0 cart items
    prevUserIdRef.current = newAccount.id;
    setCartItems([]);
    setWishlistItems([]);
    try {
      localStorage.setItem(`norcelis_cart_${newAccount.id}`, JSON.stringify([]));
      localStorage.setItem(`norcelis_wishlist_${newAccount.id}`, JSON.stringify([]));
      localStorage.removeItem('norcelis_cart_guest');
      localStorage.removeItem('norcelis_wishlist_guest');
    } catch (e) {}

    const authUser: AppUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: 'customer',
      docType: newAccount.docType,
      docNumber: newAccount.docNumber,
      phone: newAccount.phone,
      isLoggedIn: true,
      createdAt: newAccount.createdAt,
    };

    setUser(authUser);
    setIsAdminUnlocked(false);
    showToast(`¡Cuenta creada con éxito! Bienvenido a Nor Celis, ${authUser.name}.`);

    // Hashear contraseña asíncronamente y actualizar la cuenta
    hashPassword(data.password).then((hashedPw) => {
      setRegisteredAccounts((prev) =>
        prev.map((a) => (a.id === newAccount.id ? { ...a, passwordHash: hashedPw } : a))
      );
    }).catch(() => {
      // No bloquear la UI si falla el hash — la cuenta quedará con '__PENDING_HASH__'
      // hasta que el usuario intente iniciar sesión de nuevo
      console.error('[Seguridad] Error al hashear contraseña en registro. La sesión es válida pero el hash debe regenerarse.');
    });

    return {
      success: true,
      message: 'Cuenta creada con éxito',
      user: authUser,
    };
  };

  const logoutUser = () => {
    const guestUser: AppUser = {
      id: 'usr_guest',
      name: 'Invitado',
      email: '',
      role: 'customer',
      isLoggedIn: false,
    };
    prevUserIdRef.current = 'guest';
    // Clear in-memory cart and wishlist on logout
    setCartItems([]);
    setWishlistItems([]);
    try {
      localStorage.removeItem('norcelis_current_auth_user');
      localStorage.removeItem('norcelis_cart_guest');
      localStorage.removeItem('norcelis_wishlist_guest');
      const guestGarage = localStorage.getItem('norcelis_garage_vehicles_guest');
      const parsedGuestGarage = guestGarage ? JSON.parse(guestGarage) : [];
      setGarageVehicles(Array.isArray(parsedGuestGarage) ? parsedGuestGarage : []);
      const guestActive = localStorage.getItem('norcelis_active_garage_guest');
      setActiveGarage(guestActive ? JSON.parse(guestActive) : (parsedGuestGarage[0] || null));
    } catch (e) {
      setGarageVehicles([]);
      setActiveGarage(null);
    }
    setUser(guestUser);
    setIsAdminUnlocked(false);
    showToast('Sesión cerrada correctamente');
  };

  const findAccountForRecovery = (emailOrDoc: string): {
    found: boolean;
    maskedEmail?: string;
    maskedPhone?: string;
    accountName?: string;
    identifier?: string;
  } => {
    const clean = emailOrDoc.trim().toLowerCase();
    let currentAccounts = registeredAccounts;
    try {
      const stored = localStorage.getItem('norcelis_registered_accounts');
      if (stored) {
        currentAccounts = JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    const account = currentAccounts.find(
      (acc) => acc.email.toLowerCase() === clean || acc.docNumber.toLowerCase() === clean
    );

    if (!account) {
      return { found: false };
    }

    const [namePart, domain] = account.email.split('@');
    const maskedEmail = namePart.length > 2
      ? `${namePart[0]}***${namePart.slice(-1)}@${domain || 'norcelis.pe'}`
      : `${namePart[0]}***@${domain || 'norcelis.pe'}`;

    const phone = account.phone || '987654321';
    const maskedPhone = phone.length >= 6
      ? `${phone.slice(0, 3)}***${phone.slice(-3)}`
      : `${phone.slice(0, 2)}***`;

    return {
      found: true,
      maskedEmail,
      maskedPhone,
      accountName: account.name,
      identifier: account.email,
    };
  };

  const updateAccountPassword = (identifier: string, newPassword: string): {
    success: boolean;
    message: string;
  } => {
    const clean = identifier.trim().toLowerCase();
    let currentAccounts = registeredAccounts;
    try {
      const stored = localStorage.getItem('norcelis_registered_accounts');
      if (stored) {
        currentAccounts = JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    const accountIndex = currentAccounts.findIndex(
      (acc) => acc.email.toLowerCase() === clean || acc.docNumber.toLowerCase() === clean
    );

    if (accountIndex === -1) {
      return {
        success: false,
        message: 'No se encontró la cuenta para restablecer la contraseña.',
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres.',
      };
    }

    const updatedAccount = {
      ...currentAccounts[accountIndex],
      passwordHash: newPassword,
    };

    const newAccountsList = [...currentAccounts];
    newAccountsList[accountIndex] = updatedAccount;

    setRegisteredAccounts(newAccountsList);
    try {
      localStorage.setItem('norcelis_registered_accounts', JSON.stringify(newAccountsList));
    } catch (e) {
      console.error('Error saving updated accounts', e);
    }

    // If currently logged-in user matches, keep in sync
    if (user.isLoggedIn && (user.email.toLowerCase() === clean || user.docNumber?.toLowerCase() === clean)) {
      // session is preserved
    }

    showToast('¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva clave.');

    return {
      success: true,
      message: 'Contraseña restablecida con éxito',
    };
  };

  // Flag to avoid pushing history entry when popstate (browser back/forward) triggered the update
  const isPopstateRef = useRef(false);

  // Synchronize state changes to Browser History (pushState)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isPopstateRef.current) {
      isPopstateRef.current = false;
      return;
    }

    const activeModal: RouteState['modal'] =
      isGarageModalOpen ? 'garage' :
      isQuickQuoteOpen ? 'quote' :
      isTestDriveModalOpen ? 'test-drive' :
      isViewer360Open ? 'viewer-360' :
      pdfModalData ? 'pdf' : null;

    const targetUrl = buildUrlForRoute({
      view: currentView,
      vehicleId: selectedVehicleId,
      partSku: selectedPartSku,
      category: catalogCategoryFilter !== 'todos' ? catalogCategoryFilter : undefined,
      brand: catalogBrandFilter !== 'todos' ? catalogBrandFilter : undefined,
      search: catalogSearchQuery || undefined,
      trackingCode: trackingOrderCode || undefined,
      termsTab: termsActiveTab !== 'terms' ? termsActiveTab : undefined,
      modal: activeModal,
    });

    const currentFullUrl = window.location.pathname + window.location.search + window.location.hash;
    if (targetUrl !== currentFullUrl) {
      window.history.pushState(
        {
          view: currentView,
          vehicleId: selectedVehicleId,
          partSku: selectedPartSku,
          category: catalogCategoryFilter,
          brand: catalogBrandFilter,
          search: catalogSearchQuery,
          trackingCode: trackingOrderCode,
          termsTab: termsActiveTab,
          modal: activeModal,
        },
        '',
        targetUrl
      );
    }
  }, [
    currentView,
    selectedVehicleId,
    selectedPartSku,
    catalogCategoryFilter,
    catalogBrandFilter,
    catalogSearchQuery,
    trackingOrderCode,
    termsActiveTab,
    isGarageModalOpen,
    isQuickQuoteOpen,
    isTestDriveModalOpen,
    isViewer360Open,
    pdfModalData,
  ]);

  // Handle Browser Back / Forward buttons (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      isPopstateRef.current = true;
      const route = parseCurrentUrl();

      // Sincronizar Modales
      setIsGarageModalOpen(route.modal === 'garage');
      setIsQuickQuoteOpen(route.modal === 'quote');
      setIsTestDriveModalOpen(route.modal === 'test-drive');
      setIsViewer360Open(route.modal === 'viewer-360');
      if (route.modal !== 'pdf') {
        setPdfModalData(null);
      }

      // Sincronizar Vista y Parámetros
      setCurrentView(route.view);
      if (route.vehicleId) setSelectedVehicleId(route.vehicleId);
      if (route.partSku) setSelectedPartSku(route.partSku);
      if (route.category !== undefined) setCatalogCategoryFilter(route.category || 'todos');
      if (route.brand !== undefined) setCatalogBrandFilter(route.brand || 'todos');
      if (route.search !== undefined) setCatalogSearchQuery(route.search);
      if (route.trackingCode !== undefined) setTrackingOrderCode(route.trackingCode);
      if (route.termsTab) setTermsActiveTab(route.termsTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedVehicleId,
        setSelectedVehicleId,
        selectedPartSku,
        setSelectedPartSku,
        activeGarage,
        setActiveGarage,
        garageVehicles,
        addGarageVehicle,
        updateGarageVehicle,
        deleteGarageVehicle,
        isGarageModalOpen,
        setIsGarageModalOpen,
        alertsEnabled,
        permissionStatus,
        requestNotificationPermission,
        setPriceAlertsSubscription,
        checkGaragePriceChanges,
        sendTestPriceAlert,
        isViewer360Open,
        setIsViewer360Open,
        isTestDriveModalOpen,
        setIsTestDriveModalOpen,
        isQuickQuoteOpen,
        setIsQuickQuoteOpen,
        quickQuoteItem,
        openQuickQuote,
        closeQuickQuote,
        isAdvisorChatOpen,
        setIsAdvisorChatOpen,
        toggleAdvisorChat,
        pdfModalData,
        openPdfModal,
        closePdfModal,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartQuantity,
        toggleCartInstallation,
        cartTotalCount,
        cartSubtotalSoles,
        wishlistItems,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        moveWishlistToCart,
        moveAllWishlistToCart,
        wishlistTotalCount: wishlistItems.length,
        toastMessage,
        showToast,
        vehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        promoSlides,
        addPromoSlide,
        updatePromoSlide,
        deletePromoSlide,
        reorderPromoSlides,
        adminPin,
        setAdminPin,
        isAdminUnlocked,
        setIsAdminUnlocked,
        isAdminPinModalOpen,
        setIsAdminPinModalOpen,
        resetToDefaultData,
        autoParts,
        addAutoPart,
        updateAutoPart,
        deleteAutoPart,
        services: WORKSHOP_SERVICES_DATA,
        user,
        loginUser,
        loginWithCredentials,
        loginWithCredentialsAsync,
        registerAccount,
        logoutUser,
        registeredAccounts,
        catalogCategoryFilter,
        setCatalogCategoryFilter,
        catalogBrandFilter,
        setCatalogBrandFilter,
        catalogSearchQuery,
        setCatalogSearchQuery,
        navigateToPartsCatalog,
        trackingOrderCode,
        setTrackingOrderCode,
        termsActiveTab,
        setTermsActiveTab,
        navigateToTracking,
        navigateToTerms,
        findAccountForRecovery,
        updateAccountPassword,
        homeCategories,
        updateHomeCategory,
        resetHomeCategories,
        officialBrands,
        addOfficialBrand,
        updateOfficialBrand,
        deleteOfficialBrand,
        resetOfficialBrands,
        panoramicBanner,
        updatePanoramicBanner,
        resetPanoramicBanner,
        topOfferCards,
        updateTopOfferCard,
        resetTopOfferCards,
        bottomOfferCards,
        updateBottomOfferCard,
        resetBottomOfferCards,
        resetAllBannersAndShowcase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export { GarageContext, GarageProvider, useGarage } from './GarageContext';
