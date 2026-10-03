import React from 'react';
import {
  Search, Heart, ShoppingCart, Menu, X, ChevronDown, ChevronRight, UserRound, SlidersHorizontal,
  CalendarDays, BadgeCheck, Cog, CarFront, Wrench, ArrowRightLeft, Rotate3d, LayoutGrid, Warehouse,
  MapPin, Droplets, Disc3, Settings, Mountain, Sparkles, BatteryCharging, FileText, Headset, Gauge,
  Fuel, Route, Tractor, PackageSearch, ShieldCheck, Zap, Users, Truck, Landmark, MoveVertical,
  type LucideIcon,
} from 'lucide-react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Apple SF Symbols-inspired squircle container tile.
 * Incorporates continuous curvature, microgradients, inner highlight, and subtle elevation.
 */
export interface AppleIconBadgeProps {
  variant?: 'primary' | 'secondary' | 'subtle-orange' | 'subtle-blue' | 'frosted' | 'emerald' | 'amber' | 'slate';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
}

export const AppleIconBadge: React.FC<AppleIconBadgeProps> = ({
  variant = 'subtle-orange',
  size = 'md',
  className = '',
  children,
}) => {
  const sizeClasses = {
    xs: 'w-7 h-7 rounded-lg text-xs',
    sm: 'w-8 h-8 rounded-xl text-sm',
    md: 'w-10 h-10 rounded-xl text-base',
    lg: 'w-12 h-12 rounded-2xl text-lg',
    xl: 'w-14 h-14 rounded-2xl text-xl',
  }[size];

  const variantClasses = {
    primary:
      'bg-gradient-to-br from-[#F07F00] via-[#E87500] to-[#CF6500] text-white shadow-sm ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)]',
    secondary:
      'bg-gradient-to-br from-[#212955] via-[#1D244D] to-[#141A38] text-white shadow-sm ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]',
    'subtle-orange':
      'bg-gradient-to-br from-[#F07F00]/18 via-[#F07F00]/12 to-[#F07F00]/5 text-[#F07F00] border border-[#F07F00]/25 shadow-xs',
    'subtle-blue':
      'bg-gradient-to-br from-[#212955]/15 via-[#212955]/10 to-[#212955]/5 text-[#212955] border border-[#212955]/20 shadow-xs',
    frosted:
      'bg-white/85 backdrop-blur-md text-[#212955] border border-white/50 shadow-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]',
    emerald:
      'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-sm ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]',
    amber:
      'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-sm ring-1 ring-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]',
    slate:
      'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white shadow-sm ring-1 ring-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]',
  }[variant];

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 active:scale-95 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Icon set: thin wrappers over Lucide so every icon in the site shares one
 * consistent, recognizable style. Export names are kept for backwards compatibility.
 */
const make = (Icon: LucideIcon, defaultSize: number): React.FC<IconProps> => {
  const Wrapped: React.FC<IconProps> = ({ size = defaultSize, className = '', ...props }) => (
    <Icon size={size} strokeWidth={1.9} aria-hidden="true" className={`shrink-0 ${className}`} {...(props as object)} />
  );
  return Wrapped;
};

export const AppleSearchIcon = make(Search, 24);
export const AppleHeartIcon = make(Heart, 24);
export const AppleCartIcon = make(ShoppingCart, 24);
export const AppleMenuIcon = make(Menu, 24);
export const AppleCloseIcon = make(X, 24);
export const AppleChevronDownIcon = make(ChevronDown, 18);
export const AppleChevronRightIcon = make(ChevronRight, 18);
export const AppleUserIcon = make(UserRound, 24);
export const AppleTuneSlidersIcon = make(SlidersHorizontal, 20);
export const AppleCalendarIcon = make(CalendarDays, 20);
export const AppleVerifiedSealIcon = make(BadgeCheck, 20);
export const AutoPartsIcon = make(Cog, 22);
export const VehicleIcon = make(CarFront, 22);
export const WorkshopServiceIcon = make(Wrench, 22);
export const PlanRetomaIcon = make(ArrowRightLeft, 22);
export const Showroom360Icon = make(Rotate3d, 22);
export const MasterCatalogIcon = make(LayoutGrid, 22);
export const GarageLiftIcon = make(Warehouse, 22);
export const DealershipPinIcon = make(MapPin, 22);
export const EngineIcon = make(Settings, 22);
export const SuspensionSpringIcon = make(MoveVertical, 22);
export const LubricantOilIcon = make(Droplets, 22);
export const TireOffRoadIcon = make(Disc3, 22);
export const TransmissionGearIcon = make(Cog, 22);
export const Equip4x4Icon = make(Mountain, 22);
export const DetailingPPFIcon = make(Sparkles, 22);
export const CarBatteryIcon = make(BatteryCharging, 22);
export const OfficialQuoteIcon = make(FileText, 22);
export const OnlineAdvisorIcon = make(Headset, 22);
export const SpeedometerGaugeIcon = make(Gauge, 22);
export const FuelDispenserIcon = make(Fuel, 22);
export const Drivetrain4wdIcon = make(Route, 22);
export const CertifiedShieldIcon = make(ShieldCheck, 22);
export const HorsepowerIcon = make(Zap, 22);
export const CarDoorCapacityIcon = make(Users, 22);
export const ExpressDeliveryVanIcon = make(Truck, 22);
export const BankFinancingIcon = make(Landmark, 22);

// Aliases kept for existing imports
export const MachineryIcon = make(Tractor, 22);
export const TrackOrderIcon = make(PackageSearch, 22);

export const BrakeDiscIcon = AutoPartsIcon;
export const EnginePistonIcon = EngineIcon;
export const SuspensionHDIcon = SuspensionSpringIcon;
