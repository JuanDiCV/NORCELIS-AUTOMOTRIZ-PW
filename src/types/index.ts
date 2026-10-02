export type ViewMode = 
  | 'home' 
  | 'cars' 
  | 'vehicle-pdp' 
  | 'parts' 
  | 'part-pdp'
  | 'services' 
  | 'machinery'
  | 'wishlist' 
  | 'cart' 
  | 'login'
  | 'trade-in'
  | 'financing'
  | 'account'
  | 'locations'
  | 'claims'
  | 'about'
  | 'admin'
  | 'order-tracking'
  | 'terms-policies';

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

export interface PanoramicSideCard {
  brand: string;
  title: string;
  sku: string;
  priceSoles: number;
  normalPrice: number;
  installmentText: string;
  image: string;
}

export interface PanoramicBannerConfig {
  id: string;
  tag: string;
  title: string;
  buttonText: string;
  targetCategory: string;
  leftCard: PanoramicSideCard;
  rightCard: PanoramicSideCard;
  bgGradient?: string;
}

export interface ShowcaseOfferCard {
  id: string;
  type: 'part' | 'service';
  categoryLabel: string;
  brand: string;
  title: string;
  priceSoles: number;
  normalPrice: number;
  cuota: string;
  image: string;
  sku: string;
  stockText?: string;
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

export interface PartTechnicalSpecs {
  origin?: string;
  materialOrComposition?: string;
  homologationStandard?: string;
  warrantyText?: string;
  lifespanOrInterval?: string;
  dryBoilingPoint?: string;
  wetBoilingPoint?: string;
  viscosity?: string;
  dimensionsOrFitment?: string;
  amperageOrPower?: string;
  additionalAttributes?: Record<string, string>;
}

export interface VehicleCompatibilityEntry {
  brand: string;
  model: string;
  years: string;
  engine: string;
  chassisCode?: string;
  notes?: string;
}

export interface CatalogSubfamily {
  id: string;
  name: string;
  category: string;
  description: string;
  brands?: string[];
  icon?: string;
}

export interface CatalogFamily {
  id: string;
  name: string;
  icon: string;
  description: string;
  subfamilies: CatalogSubfamily[];
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
    | 'audio'
    | 'interior'
    | 'herramientas'
    | 'motos'
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
  familyId?: string;
  subfamilyId?: string;
  technicalSpecs?: PartTechnicalSpecs;
  crossOemCodes?: string[];
  vehicleCompatibility?: VehicleCompatibilityEntry[];
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

export interface MachineryItem {
  id: string;
  code: string;
  name: string;
  category: 'movimiento_tierras' | 'excavacion' | 'carga_transporte' | 'compactacion' | 'otros';
  categoryLabel: string;
  brand: 'Caterpillar' | 'Komatsu' | 'Volvo' | 'JCB' | 'Bobcat' | 'Scania' | string;
  model: string;
  year: number;
  image: string;
  hourlyRateSoles: number;
  dailyRateSoles: number;
  monthlyRateSoles: number;
  powerHp: number;
  operatingWeightTons: number;
  bucketCapacityM3?: number;
  payloadCapacityTons?: number;
  availability: 'Disponible Inmediato' | 'Disponible en 24h' | 'En Operación / Reservar';
  fuelType: 'Diésel B5' | 'Diésel Ultra';
  operatorIncluded: boolean;
  telematicsGps: boolean;
  miningCertification: boolean;
  shortDescription: string;
  fullSpecs: {
    engineModel: string;
    maxReachOrDepth?: string;
    speedMax?: string;
    transmissionType?: string;
    hydraulicFlow?: string;
    dimensionsLxWxH?: string;
  };
  suitableApplications: string[];
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

export type UserRole = 'admin' | 'customer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  docType?: string;
  docNumber?: string;
  phone?: string;
  isLoggedIn: boolean;
  createdAt?: string;
}

export interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  docType: string;
  docNumber: string;
  phone: string;
  createdAt: string;
  vehicle?: {
    brand: string;
    model: string;
    year: string;
  };
}

export interface CinematicCategory {
  code: string;
  name: string;
  subtitle: string;
  image: string;
  tag: string;
  badge: string;
  count: string;
}

export interface OfficialBrand {
  code: string;
  name: string;
  iconText: string;
  logoUrl?: string;
  tag: string;
  origin: string;
}
