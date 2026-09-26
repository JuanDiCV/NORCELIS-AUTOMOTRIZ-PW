export type ViewMode = 
  | 'home' 
  | 'cars' 
  | 'vehicle-pdp' 
  | 'parts' 
  | 'part-pdp'
  | 'services' 
  | 'wishlist' 
  | 'cart' 
  | 'login'
  | 'trade-in'
  | 'financing'
  | 'account'
  | 'locations'
  | 'claims'
  | 'about'
  | 'admin';

export interface HeroSlide {
  id: string;
  campaignBadge: string;
  categoryTitle: string;
  categorySubtitle?: string;
  buttonText: string;
  targetView: 'parts' | 'services' | 'cars';
  targetCategory?: string;
  targetBrand?: string;
  productBrand: string;
  productTitle: string;
  productPrice: number;
  offerPrice: number;
  normalPrice: number;
  productPng: string;
  backgroundImage: string;
  bgGradient: string;
  active?: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  subtitle: string;
  year: number;
  condition: 'nuevo' | 'seminuevo';
  bodyType: 'SUV' | 'Sedán' | 'Pick-Up' | 'Hatchback';
  brand: string;
  priceSoles: number;
  priceUsd: number;
  oldPriceSoles?: number;
  monthlySoles: number;
  monthlyUsd: number;
  discountBonus?: string;
  availability: string;
  warranty: string;
  fuelType: 'Híbrido' | 'Gasolina' | '100% Eléctrico' | 'Diésel';
  specs: {
    engine: string;
    transmission: string;
    traction: string;
    power?: string;
    mileage?: string;
    consumption?: string;
    torque?: string;
  };
  image: string;
  colors?: { name: string; hex: string }[];
  brandType?: 'oficial' | 'alternativa';
  brandOrigin?: 'tradicional' | 'china';
}

export interface AutoPart {
  id: string;
  name: string;
  brand: string;
  sku: string;
  oemCode: string;
  category:
    | 'frenos'
    | 'suspension'
    | 'motor'
    | 'baterias'
    | 'filtros'
    | 'iluminacion'
    | 'llantas'
    | 'accesorios4x4'
    | 'lubricantes'
    | 'detailing'
    | 'seguridad'
    | string;
  priceSoles: number;
  priceUsd: number;
  oldPriceSoles?: number;
  rating: number;
  reviewCount: number;
  discount?: string;
  badge?: string;
  compatibleVehicle: string;
  stockText: string;
  features: string[];
  image: string;
  brandType?: 'oficial' | 'alternativa';
  brandOrigin?: 'tradicional' | 'china';
}

export interface WorkshopService {
  id: string;
  name: string;
  category: 'mecanica' | 'estetica' | 'seguridad';
  categoryLabel: string;
  badge: string;
  description: string;
  features: string[];
  priceStartingSoles: number;
  priceUnitText?: string;
  estimatedDuration: string;
  image: string;
}

export interface CartItem {
  id: string;
  type: 'part' | 'service' | 'vehicle_reservation';
  title: string;
  skuOrCode: string;
  priceSoles: number;
  quantity: number;
  image: string;
  specsSubtitle?: string;
  hasWorkshopInstallation?: boolean;
  installationFeeSoles?: number;
  scheduledDate?: string;
  scheduledLocation?: string;
}

export interface WishlistItem {
  id: string;
  type: 'vehicle' | 'part' | 'service';
  title: string;
  subtitle: string;
  sku: string;
  priceSoles: number;
  priceUsd?: number;
  oldPriceSoles?: number;
  image: string;
  compatibleWithActiveGarage: boolean;
  categoryBadge: string;
  quantity: number;
}

export interface ActiveGarageVehicle {
  id?: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  plate: string;
  vin?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehiclePlate: string;
  date: string;
  mileage: number;
  serviceType: string;
  workSummary: string[];
  technician: string;
  workshop: string;
  costSoles: number;
  invoiceNumber: string;
  warrantyCertified: boolean;
  notes?: string;
}

export interface BrandServiceConfig {
  brand: string;
  intervalKm: number;
  intervalMonths: number;
  brandOfficialRecommendation: string;
}

export interface NextMaintenanceForecast {
  currentMileage: number;
  nextServiceKm: number;
  kmRemaining: number;
  estimatedNextDate: Date;
  estimatedNextDateFormatted: string;
  daysRemaining: number;
  determiningFactor: 'kilometraje' | 'tiempo';
  urgencyStatus: 'al_dia' | 'proximo' | 'urgente' | 'vencido';
  servicePackageName: string;
  servicePackageType: 'menor' | 'intermedio' | 'mayor';
  brandIntervalText: string;
  estimatedMonthlyKm: number;
}
