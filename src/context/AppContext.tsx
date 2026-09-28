import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ViewMode, ActiveGarageVehicle, CartItem, WishlistItem, Vehicle, AutoPart, WorkshopService, HeroSlide, AppUser, UserRole, StoredUserAccount } from '../types';
import { INITIAL_ACTIVE_GARAGE, AVAILABLE_GARAGE_VEHICLES, VEHICLES_DATA, AUTO_PARTS_DATA, WORKSHOP_SERVICES_DATA, INITIAL_HERO_SLIDES } from '../data/mockData';
import { PdfModalData } from '../components/PdfPreviewModal';

interface AppContextType {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  selectedPartSku: string;
  setSelectedPartSku: (sku: string) => void;
  activeGarage: ActiveGarageVehicle;
  setActiveGarage: (garage: ActiveGarageVehicle) => void;
  garageVehicles: ActiveGarageVehicle[];
  addGarageVehicle: (vehicle: Omit<ActiveGarageVehicle, 'id'>) => void;
  updateGarageVehicle: (vehicleIdOrPlate: string, updatedData: Partial<ActiveGarageVehicle>) => void;
  deleteGarageVehicle: (vehicleIdOrPlate: string) => void;
  isGarageModalOpen: boolean;
  setIsGarageModalOpen: (open: boolean) => void;
  isViewer360Open: boolean;
  setIsViewer360Open: (open: boolean) => void;
  isTestDriveModalOpen: boolean;
  setIsTestDriveModalOpen: (open: boolean) => void;
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

  catalogCategoryFilter: string;
  setCatalogCategoryFilter: (cat: string) => void;
  catalogBrandFilter: string;
  setCatalogBrandFilter: (brand: string) => void;
  catalogSearchQuery: string;
  setCatalogSearchQuery: (query: string) => void;
  navigateToPartsCatalog: (category?: string, brand?: string, search?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('veh-rav4-2025');
  const [selectedPartSku, setSelectedPartSku] = useState<string>('PART-TOY-BRK-01');

  const [garageVehicles, setGarageVehicles] = useState<ActiveGarageVehicle[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_garage_vehicles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading garage vehicles from localStorage', e);
    }
    return AVAILABLE_GARAGE_VEHICLES;
  });

  const [activeGarage, setActiveGarage] = useState<ActiveGarageVehicle>(() => {
    try {
      const savedActive = localStorage.getItem('norcelis_active_garage');
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        if (parsed && parsed.brand) return parsed;
      }
    } catch (e) {
      console.error('Error loading active garage from localStorage', e);
    }
    return INITIAL_ACTIVE_GARAGE;
  });

  // Sync garageVehicles to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('norcelis_garage_vehicles', JSON.stringify(garageVehicles));
    } catch (e) {
      console.error('Error saving garage vehicles to localStorage', e);
    }
  }, [garageVehicles]);

  // Sync activeGarage to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('norcelis_active_garage', JSON.stringify(activeGarage));
    } catch (e) {
      console.error('Error saving active garage to localStorage', e);
    }
  }, [activeGarage]);

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
        if (activeGarage.id === v.id || activeGarage.plate === v.plate || activeGarage.vin === v.vin) {
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

    // If deleted vehicle was currently active, auto-select the next available vehicle or default fallback
    const wasActive =
      activeGarage.id === vehicleIdOrPlate ||
      activeGarage.plate === vehicleIdOrPlate ||
      activeGarage.vin === vehicleIdOrPlate ||
      (targetVehicle && activeGarage.model === targetVehicle.model && activeGarage.year === targetVehicle.year);

    if (wasActive) {
      const nextVehicle = remaining.length > 0 ? remaining[0] : INITIAL_ACTIVE_GARAGE;
      setActiveGarage(nextVehicle);
      showToast(
        `Vehículo eliminado. Se activó automáticamente ${nextVehicle.brand} ${nextVehicle.model}.`
      );
    } else {
      showToast(`Vehículo eliminado de Mi Garaje`);
    }
  };
  
  const [isGarageModalOpen, setIsGarageModalOpen] = useState(false);
  const [isViewer360Open, setIsViewer360Open] = useState(false);
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState(false);
  const [pdfModalData, setPdfModalData] = useState<PdfModalData | null>(null);

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

  // Predefined system accounts
  const INITIAL_PRESET_ACCOUNTS: StoredUserAccount[] = [
    {
      id: 'usr_admin_master',
      name: 'Dirección General & Admin',
      email: 'admin@norcelis.pe',
      passwordHash: 'AdminSecure2025!',
      role: 'admin',
      docType: 'DNI',
      docNumber: '09876543',
      phone: '976543210',
      createdAt: '2025-01-01T08:00:00.000Z',
    },
    {
      id: 'usr_cust_carlos',
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@norcelis.pe',
      passwordHash: 'ClienteSeguro2025!',
      role: 'customer',
      docType: 'DNI',
      docNumber: '74819203',
      phone: '987654321',
      createdAt: '2025-01-15T10:00:00.000Z',
      vehicle: {
        brand: 'Toyota',
        model: 'RAV4 Hybrid',
        year: '2025',
      },
    },
  ];

  const [registeredAccounts, setRegisteredAccounts] = useState<StoredUserAccount[]>(() => {
    try {
      const saved = localStorage.getItem('norcelis_registered_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasAdmin = parsed.some((acc: StoredUserAccount) => acc.role === 'admin');
          if (!hasAdmin) {
            return [INITIAL_PRESET_ACCOUNTS[0], ...parsed];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading registered accounts', e);
    }
    return INITIAL_PRESET_ACCOUNTS;
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

  // Sync cart and wishlist whenever active authenticated user changes (login, logout, new registration)
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
        // Authenticated user: load their specific saved cart and wishlist
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
      } else {
        // Unauthenticated visitor / guest / logged out: strictly empty cart and favorites!
        setCartItems([]);
        setWishlistItems([]);
        try {
          localStorage.removeItem('norcelis_cart_guest');
          localStorage.removeItem('norcelis_wishlist_guest');
        } catch (e) {}
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

  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<string>('todos');
  const [catalogBrandFilter, setCatalogBrandFilter] = useState<string>('todos');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');

  const navigateToPartsCatalog = (category?: string, brand?: string, search?: string) => {
    if (category !== undefined) setCatalogCategoryFilter(category);
    if (brand !== undefined) setCatalogBrandFilter(brand);
    if (search !== undefined) setCatalogSearchQuery(search);
    setCurrentView('parts');
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

  const resetToDefaultData = () => {
    setVehicles(VEHICLES_DATA);
    setPromoSlides(INITIAL_HERO_SLIDES);
    setAutoParts(AUTO_PARTS_DATA);
    setAdminPinState('1234');
    setCartItems([]);
    setWishlistItems([]);
    try {
      localStorage.removeItem('norcelis_custom_vehicles');
      localStorage.removeItem('norcelis_promo_slides');
      localStorage.removeItem('norcelis_custom_parts');
      localStorage.removeItem('norcelis_admin_pin');
      localStorage.removeItem('norcelis_cart_guest');
      localStorage.removeItem('norcelis_wishlist_guest');
    } catch (e) {}
    showToast('Catálogo, repuestos y banners restablecidos a valores originales');
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

  const loginWithCredentials = (
    emailOrDoc: string,
    password: string
  ): { success: boolean; message: string; user?: AppUser } => {
    const term = emailOrDoc.trim().toLowerCase();
    const account = registeredAccounts.find(
      (acc) => acc.email.toLowerCase() === term || acc.docNumber.toLowerCase() === term
    );

    if (!account) {
      return {
        success: false,
        message: 'No existe ninguna cuenta registrada con este correo o número de documento.',
      };
    }

    if (account.passwordHash !== password) {
      return {
        success: false,
        message: 'Contraseña incorrecta. Por favor intente nuevamente.',
      };
    }

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

    setUser(authUser);
    if (account.role === 'admin') {
      setIsAdminUnlocked(true);
      showToast(`¡Acceso de Administrador verificado! Bienvenido, ${account.name}.`);
    } else {
      setIsAdminUnlocked(false);
      showToast(`¡Bienvenido de vuelta, ${account.name}!`);
    }

    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      user: authUser,
    };
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

    const newAccount: StoredUserAccount = {
      id: `usr_cust_${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash: data.password,
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
    } catch (e) {}
    setUser(guestUser);
    setIsAdminUnlocked(false);
    showToast('Sesión cerrada correctamente');
  };

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
        isViewer360Open,
        setIsViewer360Open,
        isTestDriveModalOpen,
        setIsTestDriveModalOpen,
        pdfModalData,
        openPdfModal,
        closePdfModal,
        cartItems,
        addToCart,
        removeFromCart,
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
