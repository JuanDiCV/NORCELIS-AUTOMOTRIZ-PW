import React from 'react';

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

/* =========================================================================
   1. CORE NAVIGATION & ACTIONS (SF SYMBOLS STYLE)
   ========================================================================= */

// 1. APPLE SEARCH: SF Symbol style magnifying glass with optical bevel & 45° ergonomic handle
export const AppleSearchIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <circle cx="10.5" cy="10.5" r="7" />
    <path d="M7.5 10.5C7.5 8.84 8.84 7.5 10.5 7.5" strokeWidth="1.5" strokeOpacity="0.4" />
    <path d="M15.5 15.5L21 21" strokeWidth="2.2" />
  </svg>
);

// 2. APPLE WISHLIST / FAVORITE: SF Symbol style continuous-curve heart with depth
export const AppleHeartIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    fillOpacity="0.15"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
  </svg>
);

// 3. APPLE SHOPPING CART: SF Symbol style modern automotive shopping cart with smooth basket
export const AppleCartIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M2.5 3H5.2L6.8 14.2C6.95 15.2 7.8 16 8.8 16H18.5C19.5 16 20.35 15.2 20.5 14.2L21.8 7.5H5.8" />
    <path d="M7 11H20" strokeWidth="1.2" strokeOpacity="0.4" />
    <circle cx="9.5" cy="19.5" r="1.6" fill="currentColor" />
    <circle cx="17.5" cy="19.5" r="1.6" fill="currentColor" />
  </svg>
);

// 4. APPLE MENU: SF Symbol style 3 rounded pill bars
export const AppleMenuIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M4 6.5H20" />
    <path d="M4 12H20" />
    <path d="M4 17.5H20" />
  </svg>
);

// 5. APPLE CLOSE / XMARK: SF Symbol style rounded cross
export const AppleCloseIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M18 6L6 18M6 6L18 18" />
  </svg>
);

// 6. APPLE CHEVRON DOWN: SF Symbol style 90° smooth chevron
export const AppleChevronDownIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M6 9L12 15L18 9" />
  </svg>
);

// 6b. APPLE CHEVRON RIGHT: SF Symbol style smooth right chevron
export const AppleChevronRightIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M9 18L15 12L9 6" />
  </svg>
);

// 7. APPLE USER / PROFILE: SF Symbol person.crop.circle with Apple curvature
export const AppleUserIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="9" r="3.2" fill="currentColor" fillOpacity="0.2" />
    <path d="M6.2 18.2C7.2 15.8 9.4 14.5 12 14.5C14.6 14.5 16.8 15.8 17.8 18.2" />
  </svg>
);

// 8. APPLE TUNE SLIDERS: SF Symbol slider.horizontal.3 for compatibility and search
export const AppleTuneSlidersIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M4 6H14M18 6H20" />
    <circle cx="16" cy="6" r="2" fill="currentColor" fillOpacity="0.2" />
    <path d="M4 12H6M10 12H20" />
    <circle cx="8" cy="12" r="2" fill="currentColor" fillOpacity="0.2" />
    <path d="M4 18H12M16 18H20" />
    <circle cx="14" cy="18" r="2" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

// 9. APPLE CALENDAR: SF Symbol calendar with date indicators
export const AppleCalendarIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <rect x="3" y="4.5" width="18" height="16.5" rx="3.5" />
    <path d="M3 9.5H21" />
    <path d="M8 2.5V5.5M16 2.5V5.5" strokeWidth="2" />
    <circle cx="8" cy="13.5" r="1" fill="currentColor" />
    <circle cx="12" cy="13.5" r="1" fill="currentColor" />
    <circle cx="16" cy="13.5" r="1" fill="currentColor" />
    <circle cx="8" cy="17" r="1" fill="currentColor" />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </svg>
);

// 10. APPLE VERIFIED SEAL: SF Symbol checkmark.seal.fill for certified seminuevos & OEM
export const AppleVerifiedSealIcon: React.FC<IconProps> = ({ size = 20, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path
      d="M12 2L14.7 4.2C15.3 4.7 16.1 4.9 16.9 4.7L20.3 4.1C21.4 3.9 22.3 4.8 22.1 5.9L21.5 9.3C21.3 10.1 21.5 10.9 22 11.5L24.2 14.2C25 15.1 24.7 16.6 23.6 17.1L20.4 18.3C19.7 18.6 19.1 19.2 18.8 19.9L17.6 23.1C17.1 24.2 15.6 24.5 14.7 23.7L12 21.5L9.3 23.7C8.4 24.5 6.9 24.2 6.4 23.1L5.2 19.9C4.9 19.2 4.3 18.6 3.6 18.3L0.4 17.1C-0.7 16.6 -1 15.1 -0.2 14.2L2 11.5C2.5 10.9 2.7 10.1 2.5 9.3L1.9 5.9C1.7 4.8 2.6 3.9 3.7 4.1L7.1 4.7C7.9 4.9 8.7 4.7 9.3 4.2L12 2Z"
      transform="scale(0.85) translate(2, 2)"
      fill="currentColor"
      fillOpacity="0.18"
    />
    <path d="M8.5 12.2L10.8 14.5L15.8 9.5" strokeWidth="2.2" />
  </svg>
);

/* =========================================================================
   2. DOMAIN-SPECIFIC AUTOMOTIVE ICONS (PRECISE MECHANICAL ACCURACY)
   ========================================================================= */

// 11. AUTOPARTES Y FRENOS OEM: Ventilated cross-drilled rotor with multi-piston caliper
export const AutoPartsIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="12" r="7.5" strokeDasharray="3 2.5" strokeWidth="1.4" />
    <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.18" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="9.8" r="0.6" fill="currentColor" />
    <circle cx="14" cy="10.8" r="0.6" fill="currentColor" />
    <circle cx="13.2" cy="13.5" r="0.6" fill="currentColor" />
    <circle cx="10.8" cy="13.5" r="0.6" fill="currentColor" />
    <circle cx="10" cy="10.8" r="0.6" fill="currentColor" />
    <path
      d="M14.5 3.8C16.8 4.7 18.8 6.7 19.8 9.2L18.2 10.2C17.4 8.2 16 6.7 14 5.8L14.5 3.8Z"
      fill="currentColor"
      fillOpacity="0.25"
      strokeWidth="1.6"
    />
    <rect x="14.5" y="4.8" width="1.8" height="3.8" rx="0.9" transform="rotate(35 15.4 6.7)" fill="currentColor" />
  </svg>
);

export const BrakeDiscIcon = AutoPartsIcon;

// 12. VEHÍCULOS (0 KM & NUEVOS): Aerodynamic modern SUV/Sedan fastback silhouette with LED signature
export const VehicleIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M2.5 13.5L5 8C5.4 7.2 6.3 6.6 7.2 6.6H15.6C16.5 6.6 17.3 7.2 17.7 8L20.8 12.8L22 13.6V16.8H20.2" />
    <path d="M6.8 13.2H16.8L15.6 8.5H7.5L6.8 13.2Z" fill="currentColor" fillOpacity="0.18" strokeWidth="1.2" />
    <path d="M2 16.8H4.2" />
    <path d="M8.6 16.8H15.4" />
    <path d="M19.8 16.8H22" />
    <circle cx="6.4" cy="16.8" r="2.2" strokeWidth="1.8" />
    <circle cx="6.4" cy="16.8" r="0.9" fill="currentColor" />
    <circle cx="17.6" cy="16.8" r="2.2" strokeWidth="1.8" />
    <circle cx="17.6" cy="16.8" r="0.9" fill="currentColor" />
    <path d="M21.2 13.6H22.8" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 13. SERVICIOS DE TALLER & HERRAMIENTAS: Torque wrench + electronic diagnosis gauge
export const WorkshopServiceIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path
      d="M14.7 6.3C14.3 5.4 14.5 4.3 15.2 3.6C16.1 2.7 17.5 2.7 18.4 3.6C18.9 4.1 19.8 4.1 20.3 3.6L20.8 3.1C21.4 3.7 21.4 4.6 20.9 5.2C20.4 5.7 20.4 6.6 20.9 7.1C21.8 8 21.8 9.4 20.9 10.3C20.2 11 19.1 11.2 18.2 10.8L9.2 19.8C8.8 20.2 8.2 20.2 7.8 19.8L4.2 16.2C3.8 15.8 3.8 15.2 4.2 14.8L14.7 6.3Z"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <path d="M11.5 11.5L7.5 15.5" strokeWidth="1.4" strokeDasharray="1.5 1.5" />
    <circle cx="6" cy="18" r="1" fill="currentColor" />
    <circle cx="6.5" cy="6.5" r="2.5" strokeWidth="1.5" />
    <path d="M6.5 3.5V4.5M6.5 8.5V9.5M3.5 6.5H4.5M8.5 6.5H9.5" strokeWidth="1.5" />
  </svg>
);

// 14. PLAN RETOMA & CUOTAS: Dynamic circular exchange cycle embracing vehicle valuation
export const PlanRetomaIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M21 8.5C19.8 5.2 16.6 3 13 3C8.6 3 5 6.6 5 11V12.5" />
    <path d="M2 10L5 13L8 10" />
    <path d="M3 15.5C4.2 18.8 7.4 21 11 21C15.4 21 19 17.4 19 13V11.5" />
    <path d="M22 14L19 11L16 14" />
    <rect x="8.5" y="12" width="7" height="2.5" rx="0.8" fill="currentColor" fillOpacity="0.25" strokeWidth="1.2" />
    <circle cx="10" cy="15" r="0.9" fill="currentColor" />
    <circle cx="14" cy="15" r="0.9" fill="currentColor" />
  </svg>
);

// 15. SHOWROOM INTERACTIVO 360°: Panoramic 3D spherical gimbal
export const Showroom360Icon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <ellipse cx="12" cy="13.5" rx="9" ry="4.5" strokeDasharray="3 2" strokeWidth="1.4" />
    <path d="M3.5 14C4.5 16.5 7.8 18 12 18C16.8 18 20.5 16.2 21 13.5" strokeWidth="2" />
    <path d="M21 16L21 13.5L18.5 13.5" strokeWidth="2" />
    <circle cx="12" cy="10.5" r="2.8" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
    <path d="M10.8 10.5H13.2" strokeWidth="1.5" />
    <path d="M12 9.3V11.7" strokeWidth="1.5" />
  </svg>
);

// 16. MASTER CATALOG: Apple SF square.grid.2x2 with rounded modules
export const MasterCatalogIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <rect x="3.5" y="3.5" width="7" height="7" rx="2.2" fill="currentColor" fillOpacity="0.2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2.2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2.2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2.2" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

// 17. MI GARAJE VIRTUAL: Hydraulic 2-post lift hoist holding vehicle
export const GarageLiftIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M3 21H6M18 21H21" strokeWidth="2" />
    <path d="M4.5 21V3M19.5 21V3" strokeWidth="2.2" />
    <path d="M3.5 3H5.5M18.5 3H20.5" strokeWidth="2" />
    <path d="M4.5 12H8.5L10 13H14L15.5 12H19.5" strokeWidth="1.8" />
    <rect x="7.5" y="11" width="9" height="2.2" rx="0.8" fill="currentColor" fillOpacity="0.25" strokeWidth="1.4" />
    <circle cx="9" cy="13.2" r="0.8" fill="currentColor" />
    <circle cx="15" cy="13.2" r="0.8" fill="currentColor" />
  </svg>
);

// 18. SEDE CAJAMARCA & LIMA: Apple SF mappin with dealership showroom facade
export const DealershipPinIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M2.5 20H21.5" strokeWidth="2" />
    <path d="M3.5 20V11.5L12 6.5L20.5 11.5V20" />
    <path d="M7.5 20V14H11V20" />
    <path d="M14.5 20V14H17.5V20" />
    <circle cx="12" cy="4.2" r="2.8" fill="currentColor" fillOpacity="0.25" strokeWidth="1.6" />
    <circle cx="12" cy="4.2" r="1.1" fill="currentColor" />
  </svg>
);

// 19. MOTOR / ENGINE: Precision block with cylinders and intake valves
export const EngineIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M3 10V18H7V21H17V18H21V10H19V8H15V6H9V8H5V10H3Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M9 13H15" strokeWidth="1.6" />
    <path d="M9 16H15" strokeWidth="1.6" />
    <path d="M12 6V3M9 3H15" strokeWidth="1.6" />
    <circle cx="12" cy="11" r="1.2" fill="currentColor" />
  </svg>
);

export const EnginePistonIcon = EngineIcon;

// 20. SUSPENSIÓN HD & AMORTIGUADOR: Coilover shock absorber with progressive steel spring
export const SuspensionSpringIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    {/* Upper Mounting Eyelet */}
    <circle cx="12" cy="3.5" r="2" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 5.5V8" />
    {/* Shock Absorber Shaft */}
    <line x1="12" y1="8" x2="12" y2="18" strokeWidth="2.5" strokeOpacity="0.4" />
    {/* Coiled Spring Helix */}
    <path d="M8 8.5C8 7.5 16 7.5 16 8.5C16 9.5 8 9.5 8 10.5C8 11.5 16 11.5 16 12.5C16 13.5 8 13.5 8 14.5C8 15.5 16 15.5 16 16.5C16 17.5 8 17.5 8 18.5" strokeWidth="2" />
    {/* Lower Mounting Eyelet */}
    <circle cx="12" cy="20.5" r="2" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 18.5V19.5" />
  </svg>
);

export const SuspensionHDIcon = SuspensionSpringIcon;

// 21. ACEITES & LUBRICANTES: Ergonomic oil canister with synthetic oil droplet
export const LubricantOilIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M4 14C4 11 6 9 9 9H17C18.7 9 20 10.3 20 12V18C20 19.7 18.7 21 17 21H8C5.8 21 4 19.2 4 17V14Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M9 9V5C9 3.9 9.9 3 11 3H14C15.1 3 16 3.9 16 5V9" />
    <path d="M6 9L3 6" />
    <path d="M14 13.5C14 15 12.5 16.5 12 17.5C11.5 16.5 10 15 10 13.5C10 12.4 10.9 11.5 12 11.5C13.1 11.5 14 12.4 14 13.5Z" fill="currentColor" />
  </svg>
);

// 22. LLANTAS & NEUMÁTICOS OFF-ROAD: Heavy-duty radial tire with aggressive tread blocks
export const TireOffRoadIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="12" r="6" fill="currentColor" fillOpacity="0.18" />
    <circle cx="12" cy="12" r="2.5" />
    {/* Tread lugs */}
    <path d="M12 2.5V4M12 20V21.5M2.5 12H4M20 12H21.5" strokeWidth="2" />
    <path d="M5.3 5.3L6.4 6.4M17.6 17.6L18.7 18.7M5.3 18.7L6.4 17.6M17.6 6.4L18.7 5.3" strokeWidth="2" />
    <circle cx="12" cy="12" r="0.9" fill="currentColor" />
  </svg>
);

// 23. TRANSMISIÓN & CAJA DE CAMBIOS: Interlocking planetary gear wheels
export const TransmissionGearIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <circle cx="8.5" cy="8.5" r="5" fill="currentColor" fillOpacity="0.18" />
    <circle cx="8.5" cy="8.5" r="1.8" />
    <path d="M8.5 2V4M8.5 13V15M2 8.5H4M13 8.5H15" strokeWidth="1.8" />
    <circle cx="16.5" cy="16.5" r="4" fill="currentColor" fillOpacity="0.18" />
    <circle cx="16.5" cy="16.5" r="1.5" />
    <path d="M16.5 11.5V13M16.5 20V21.5M11.5 16.5H13M20 16.5H21.5" strokeWidth="1.8" />
  </svg>
);

// 24. EQUIPAMIENTO 4X4 & CARROCERÍA: Heavy duty bullbar / tubular roll-cage
export const Equip4x4Icon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M3 18H21" strokeWidth="2.5" />
    <path d="M5 18V10C5 7.8 6.8 6 9 6H15C17.2 6 19 7.8 19 10V18" strokeWidth="2" />
    <path d="M8 12H16" strokeWidth="1.8" />
    <rect x="7" y="14" width="2" height="3" rx="0.5" fill="currentColor" />
    <rect x="15" y="14" width="2" height="3" rx="0.5" fill="currentColor" />
    <circle cx="10" cy="9" r="1" fill="currentColor" />
    <circle cx="14" cy="9" r="1" fill="currentColor" />
  </svg>
);

// 25. DETAILING & PPF: High-precision ceramic spray with nano-coating shield
export const DetailingPPFIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M12 2L4 6V11.5C4 16.5 7.4 21.2 12 22C16.6 21.2 20 16.5 20 11.5V6L12 2Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M9 12L11 14L15 10" strokeWidth="2" />
    <circle cx="16" cy="5" r="1" fill="currentColor" />
    <circle cx="19" cy="8" r="0.7" fill="currentColor" />
    <circle cx="7" cy="6" r="0.7" fill="currentColor" />
  </svg>
);

// 26. BATERÍA & SISTEMA ELÉCTRICO: Automotive AGM battery with positive & negative posts
export const CarBatteryIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <rect x="3" y="7" width="18" height="14" rx="2.5" fill="currentColor" fillOpacity="0.15" />
    <path d="M6 4V7M18 4V7" strokeWidth="2.2" />
    <path d="M5.5 12H8.5M7 10.5V13.5" strokeWidth="1.6" />
    <path d="M15.5 12H18.5" strokeWidth="1.6" />
    <circle cx="12" cy="14" r="1.5" strokeWidth="1.2" />
  </svg>
);

// 27. COTIZACIÓN OFICIAL / DOCUMENTO COMERCIAL: Stamped quote certificate with seal
export const OfficialQuoteIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M14 2V8H20" />
    <line x1="8" y1="12" x2="16" y2="12" strokeWidth="1.5" />
    <line x1="8" y1="15" x2="13" y2="15" strokeWidth="1.5" />
    {/* Certified Stamped Seal */}
    <circle cx="16" cy="17.5" r="2.5" fill="currentColor" fillOpacity="0.25" strokeWidth="1.5" />
    <path d="M15 17.5L15.8 18.3L17.2 16.8" strokeWidth="1.4" />
  </svg>
);

// 28. ASESOR EN LÍNEA: Professional headset with active audio wave
export const OnlineAdvisorIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M4 14C4 9.6 7.6 6 12 6C16.4 6 20 9.6 20 14" />
    <rect x="2.5" y="13" width="3.5" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
    <rect x="18" y="13" width="3.5" height="6" rx="1.5" fill="currentColor" fillOpacity="0.2" />
    <path d="M19.5 19V20C19.5 21.1 18.6 22 17.5 22H14" />
    <circle cx="13" cy="22" r="1.2" fill="currentColor" />
  </svg>
);

// 29. VELOCÍMETRO & RENDIMIENTO: Gauge tachometer with graduation and redline needle
export const SpeedometerGaugeIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M12 21C6.5 21 2 16.5 2 11C2 6.5 5.8 2.8 10.2 2.1" strokeDasharray="3 1.5" />
    <path d="M12 21C17.5 21 22 16.5 22 11C22 6.5 18.2 2.8 13.8 2.1" />
    <circle cx="12" cy="13" r="2.5" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 13L16.5 7.5" strokeWidth="2.2" stroke="currentColor" />
    <circle cx="12" cy="13" r="1" fill="currentColor" />
  </svg>
);

// 30. COMBUSTIBLE & TANQUE: Fuel dispenser pump with hose and nozzle
export const FuelDispenserIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <rect x="3" y="4" width="10" height="17" rx="2" fill="currentColor" fillOpacity="0.15" />
    <rect x="5.5" y="7" width="5" height="4" rx="1" />
    <path d="M13 8H16C17.1 8 18 8.9 18 10V17C18 17.6 18.4 18 19 18C19.6 18 20 17.6 20 17V12L19 11" />
    <circle cx="8" cy="16" r="1" fill="currentColor" />
  </svg>
);

// 31. TRACCIÓN 4X4 & AWD / DRIVETRAIN: Dual drive-axles with transfer case
export const Drivetrain4wdIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    {/* Central Drive Shaft */}
    <line x1="12" y1="4" x2="12" y2="20" strokeWidth="2.2" />
    {/* Front & Rear Axles */}
    <line x1="4" y1="7" x2="20" y2="7" strokeWidth="2" />
    <line x1="4" y1="17" x2="20" y2="17" strokeWidth="2" />
    {/* 4 Wheels */}
    <rect x="2" y="5" width="3" height="4" rx="1" fill="currentColor" />
    <rect x="19" y="5" width="3" height="4" rx="1" fill="currentColor" />
    <rect x="2" y="15" width="3" height="4" rx="1" fill="currentColor" />
    <rect x="19" y="15" width="3" height="4" rx="1" fill="currentColor" />
    {/* Transfer Case Center Differential */}
    <circle cx="12" cy="12" r="2.8" fill="currentColor" fillOpacity="0.25" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

// 32. SEGURIDAD & AIRBAGS (TSS): Steering wheel with deployed safety airbag & shield
export const CertifiedShieldIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M12 2L4 5.5V11.5C4 16.5 7.4 20.8 12 22C16.6 20.8 20 16.5 20 11.5V5.5L12 2Z" fill="currentColor" fillOpacity="0.18" />
    <path d="M8.5 12L11 14.5L15.5 9.5" strokeWidth="2.2" />
  </svg>
);

// 33. POTENCIA HP & LIGHTNING: Horsepower dynamometer bolt
export const HorsepowerIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" fill="currentColor" fillOpacity="0.2" strokeWidth="2" />
  </svg>
);

// 34. CAPACIDAD DE PASAJEROS: Sedan silhouette with ergonomic seating capacity
export const CarDoorCapacityIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <circle cx="8" cy="7" r="2.5" fill="currentColor" fillOpacity="0.2" />
    <path d="M4 14C4 12 6 10.5 8 10.5C10 10.5 12 12 12 14V17H4V14Z" />
    <circle cx="16" cy="9" r="2" fill="currentColor" fillOpacity="0.2" />
    <path d="M13 15C13 13.5 14.5 12.5 16 12.5C17.5 12.5 19 13.5 19 15V17H13V15Z" />
    <path d="M2 20H22" strokeWidth="2" />
  </svg>
);

// 35. DESPACHO & TRANSPORTE EXPRESS: Fleet logistics delivery van with motion streaks
export const ExpressDeliveryVanIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M1 4H2M0 7H3M1 10H2" strokeWidth="1.5" />
    <path d="M4 6H15V17H4V6Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M15 9H19L22 13V17H15V9Z" fill="currentColor" fillOpacity="0.15" />
    <circle cx="8" cy="18" r="2" strokeWidth="2" />
    <circle cx="18" cy="18" r="2" strokeWidth="2" />
    <path d="M10 18H16" strokeWidth="2" />
  </svg>
);

// 36. BANCOS & FINANCIAMIENTO: Institutional banking facade with ionic columns
export const BankFinancingIcon: React.FC<IconProps> = ({ size = 22, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform ${className}`}
    {...props}
  >
    <path d="M3 9.5L12 4L21 9.5H3Z" fill="currentColor" fillOpacity="0.2" strokeWidth="1.8" />
    <path d="M5 9.5V17M9.5 9.5V17M14.5 9.5V17M19 9.5V17" strokeWidth="2" />
    <path d="M2 17H22M1 20H23" strokeWidth="2" />
  </svg>
);
