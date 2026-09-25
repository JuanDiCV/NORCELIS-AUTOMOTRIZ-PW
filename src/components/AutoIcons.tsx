import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * High-fidelity, domain-specific automotive SVG icons.
 * Engineered to replace generic Material Symbols with authentic mechanical and automotive representations.
 */

// 1. AUTOPARTES Y ACCESORIOS: Ventilated cross-drilled performance brake rotor with Brembo-style caliper
export const AutoPartsIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Outer Brake Disc Rim */}
    <circle cx="12" cy="12" r="9.5" strokeDasharray="3 2" />
    <circle cx="12" cy="12" r="7.5" />
    
    {/* Center Hub & 5 Lug Holes */}
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="9.8" r="0.6" fill="currentColor" />
    <circle cx="14" cy="10.8" r="0.6" fill="currentColor" />
    <circle cx="13.2" cy="13.5" r="0.6" fill="currentColor" />
    <circle cx="10.8" cy="13.5" r="0.6" fill="currentColor" />
    <circle cx="10" cy="10.8" r="0.6" fill="currentColor" />
    
    {/* Multi-Piston Performance Caliper on top-right quadrant */}
    <path
      d="M14.5 4.2C16.5 5 18.5 7 19.5 9.5L18 10.5C17.2 8.5 15.8 7 14 6.2L14.5 4.2Z"
      fill="currentColor"
      fillOpacity="0.25"
      stroke="currentColor"
    />
    <rect x="14.2" y="5.2" width="2" height="4.2" rx="1" transform="rotate(35 15.2 7.3)" fill="currentColor" />
  </svg>
);

// 2. VEHÍCULOS (0 KM & SEMINUEVOS): Aerodynamic modern SUV/Sedan fastback silhouette with LED signature
export const VehicleIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Roofline & Aerodynamic Cabin */}
    <path d="M3 13.5L5.2 8.2C5.6 7.4 6.4 6.8 7.3 6.8H15.8C16.6 6.8 17.3 7.3 17.7 8L20.8 12.8L22 13.8V17H20" />
    <path d="M7 13.5H16.8L15.6 9H7.6L7 13.5Z" fill="currentColor" fillOpacity="0.15" />
    
    {/* Beltline & Front Hood */}
    <path d="M2 17H4" />
    <path d="M8.5 17H15.5" />
    <path d="M2 14.5C2 14 2.5 13.5 3 13.5H5.5" />
    <path d="M20 14L22 14.8" />
    
    {/* Front & Rear Wheels with Alloy Hubs */}
    <circle cx="6.2" cy="17" r="2.4" />
    <circle cx="6.2" cy="17" r="1" fill="currentColor" />
    <circle cx="17.8" cy="17" r="2.4" />
    <circle cx="17.8" cy="17" r="1" fill="currentColor" />
    
    {/* LED Headlight Beam Accent */}
    <path d="M21.5 13.5L23.5 13.5" strokeWidth="1.5" />
  </svg>
);

// 3. SERVICIOS (TALLER & DETAILING): Precision torque wrench + spark plug/gear alignment
export const WorkshopServiceIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Precision Mechanical Wrench */}
    <path d="M14.7 6.3C14.3 5.4 14.5 4.3 15.2 3.6C16.1 2.7 17.5 2.7 18.4 3.6C18.9 4.1 19.8 4.1 20.3 3.6L20.8 3.1C21.4 3.7 21.4 4.6 20.9 5.2C20.4 5.7 20.4 6.6 20.9 7.1C21.8 8 21.8 9.4 20.9 10.3C20.2 11 19.1 11.2 18.2 10.8L9.2 19.8C8.8 20.2 8.2 20.2 7.8 19.8L4.2 16.2C3.8 15.8 3.8 15.2 4.2 14.8L14.7 6.3Z" />
    {/* Diagnostic Spark / Laser Measurement Line */}
    <path d="M12 12L7.5 16.5" strokeWidth="1.2" strokeDasharray="1 1.5" />
    <circle cx="6" cy="18" r="1" fill="currentColor" />
    {/* Precision Gear Tooth in Background */}
    <path d="M3.5 7.5L5.5 8.5" />
    <path d="M7.5 3.5L8.5 5.5" />
    <circle cx="6.5" cy="6.5" r="2.5" strokeWidth="1.4" />
  </svg>
);

// 4. PLAN RETOMA & CUOTAS: Dynamic circular exchange arrows embracing vehicle valuation
export const PlanRetomaIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Dynamic Circular Exchange Cycle */}
    <path d="M21 8.5C19.8 5.2 16.6 3 13 3C8.6 3 5 6.6 5 11V12.5" />
    <path d="M2 10L5 13L8 10" />
    
    <path d="M3 15.5C4.2 18.8 7.4 21 11 21C15.4 21 19 17.4 19 13V11.5" />
    <path d="M22 14L19 11L16 14" />
    
    {/* Car Icon Core in Exchange Center */}
    <path d="M9.5 13.5L10.5 11.5H13.5L14.5 13.5" strokeWidth="1.4" />
    <rect x="8.5" y="13.2" width="7" height="2.2" rx="0.8" strokeWidth="1.4" fill="currentColor" fillOpacity="0.2" />
    <circle cx="10" cy="15.8" r="0.9" fill="currentColor" />
    <circle cx="14" cy="15.8" r="0.9" fill="currentColor" />
  </svg>
);

// 5. SHOWROOM INTERACTIVO 360°: Panoramic 3D axis with rotational gimbal markers
export const Showroom360Icon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Elliptical Horizon Ring */}
    <ellipse cx="12" cy="13.5" rx="9" ry="4.5" strokeDasharray="3 2" />
    
    {/* Front Orbit Arc with Arrowhead */}
    <path d="M3.5 14C4.5 16.5 7.8 18 12 18C16.8 18 20.5 16.2 21 13.5" />
    <path d="M21 16L21 13.5L18.5 13.5" />
    
    {/* 360 Emblem Typography / Center Hub */}
    <circle cx="12" cy="10.5" r="2.8" strokeWidth="1.4" fill="currentColor" fillOpacity="0.15" />
    <path d="M10.8 10.5H13.2" strokeWidth="1.4" />
    <path d="M12 9.3V11.7" strokeWidth="1.4" />
  </svg>
);

// 6. TODAS LAS CATEGORÍAS: Technical exploded parts matrix / engineering catalog
export const MasterCatalogIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    <rect x="3" y="3" width="7" height="7" rx="1.8" fill="currentColor" fillOpacity="0.15" />
    <rect x="14" y="3" width="7" height="7" rx="1.8" />
    <rect x="3" y="14" width="7" height="7" rx="1.8" />
    <rect x="14" y="14" width="7" height="7" rx="1.8" fill="currentColor" fillOpacity="0.15" />
    {/* Precision Micro Crosshairs in Modules */}
    <circle cx="6.5" cy="6.5" r="1" fill="currentColor" />
    <circle cx="17.5" cy="17.5" r="1" fill="currentColor" />
    <path d="M16 6.5H19" strokeWidth="1.4" />
    <path d="M5 17.5H8" strokeWidth="1.4" />
  </svg>
);

// 7. MI GARAJE VIRTUAL: Hydraulic 2-post lift hoist holding vehicle
export const GarageLiftIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Two-Post Heavy Duty Columns */}
    <path d="M3 21H6M18 21H21" />
    <path d="M4.5 21V3M19.5 21V3" strokeWidth="2" />
    <path d="M3.5 3H5.5M18.5 3H20.5" />
    
    {/* Hydraulic Lift Carriage Arms */}
    <path d="M4.5 12H8.5L10 13H14L15.5 12H19.5" strokeWidth="1.8" />
    
    {/* Vehicle Elevated on Lift */}
    <path d="M8 11.5L9.5 9H14.5L16 11.5" strokeWidth="1.4" />
    <rect x="7.5" y="11.2" width="9" height="2" rx="0.8" strokeWidth="1.4" fill="currentColor" fillOpacity="0.25" />
    <circle cx="9" cy="13.2" r="0.8" fill="currentColor" />
    <circle cx="15" cy="13.2" r="0.8" fill="currentColor" />
  </svg>
);

// 8. LLANTAS OFF-ROAD (Mickey Thompson & Black Rhino): Beadlock rim with aggressive mud-terrain tread
export const TireOffRoadIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Outer Aggressive Tire Knobbies */}
    <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
    <path d="M12 3V1M12 23V21M3 12H1M23 12H21" strokeWidth="2" />
    <path d="M5.6 5.6L4.2 4.2M19.8 19.8L18.4 18.4M18.4 5.6L19.8 4.2M4.2 19.8L5.6 18.4" strokeWidth="2" />
    
    {/* Beadlock Ring & Tire Sidewall */}
    <circle cx="12" cy="12" r="6.2" strokeDasharray="2 1.5" />
    
    {/* Heavy-Duty Off-Road Hub & 6-Lug Pattern */}
    <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.2" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="9.8" r="0.6" fill="currentColor" />
    <circle cx="13.9" cy="10.9" r="0.6" fill="currentColor" />
    <circle cx="13.9" cy="13.1" r="0.6" fill="currentColor" />
    <circle cx="12" cy="14.2" r="0.6" fill="currentColor" />
    <circle cx="10.1" cy="13.1" r="0.6" fill="currentColor" />
    <circle cx="10.1" cy="10.9" r="0.6" fill="currentColor" />
  </svg>
);

// 9. EQUIPAMIENTO 4X4 & ACCESORIOS (KEKO): Heavy-duty tubular roll-bar + winch bumper
export const Equip4x4Icon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Keko Tubular Roll-Bar K1 Structure */}
    <path d="M4 19V9C4 7 5.5 5 7.5 5H16.5C18.5 5 20 7 20 9V19" strokeWidth="2" />
    <path d="M4 11H20" strokeWidth="1.8" />
    <path d="M6 15H18" strokeWidth="1.4" />
    <path d="M7 5L10 11M17 5L14 11" strokeWidth="1.6" />
    
    {/* 4x4 Heavy-Duty Base Mounts */}
    <rect x="2.5" y="19" width="3.5" height="2" rx="0.5" fill="currentColor" />
    <rect x="18" y="19" width="3.5" height="2" rx="0.5" fill="currentColor" />
    
    {/* Off-Road LED Light Bar on Roof */}
    <rect x="8" y="2" width="8" height="2.2" rx="0.8" fill="currentColor" />
  </svg>
);

// 10. ACEITES & FLUIDOS (Mobil 1 & Delvac): Synthetic oil container with viscosity flow droplet
export const LubricantOilIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Motor Oil Bottle Profile */}
    <path d="M7 6H13L16 9V20C16 20.6 15.6 21 15 21H7C6.4 21 6 20.6 6 20V7C6 6.4 6.4 6 7 6Z" />
    <path d="M9 3H11V6H9V3Z" fill="currentColor" />
    
    {/* Ergonomic Heavy Duty Carry Handle */}
    <path d="M6 9H4C3.4 9 3 9.4 3 10V18C3 18.6 3.4 19 4 19H6" />
    
    {/* Viscosity Oil Droplet with Synthetic Core */}
    <path
      d="M11 11.5C11 11.5 13.5 14.2 13.5 15.5C13.5 16.9 12.4 18 11 18C9.6 18 8.5 16.9 8.5 15.5C8.5 14.2 11 11.5 11 11.5Z"
      fill="currentColor"
      fillOpacity="0.25"
    />
    <circle cx="10.5" cy="15" r="0.8" fill="currentColor" />
    
    {/* Level Indicator Window */}
    <path d="M14 11V18" strokeDasharray="1 1.5" strokeWidth="1.2" />
  </svg>
);

// 11. LÁMINAS DE SEGURIDAD (LLumar): Ballistic shield with solar UV rejection rays
export const SecurityFilmIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Armored Security Shield Contour */}
    <path
      d="M12 2L4 5V11.5C4 16.5 7.4 21.1 12 22C16.6 21.1 20 16.5 20 11.5V5L12 2Z"
      fill="currentColor"
      fillOpacity="0.12"
    />
    {/* Multi-Layered Film Matrix */}
    <path d="M12 6.5V17.5" strokeWidth="1.6" />
    <path d="M8.5 10L12 13.5L15.5 10" strokeWidth="1.6" />
    {/* Nanoceramic Protection Sparkle */}
    <circle cx="12" cy="13.5" r="1.2" fill="currentColor" />
  </svg>
);

// 12. DETAILING & PPF (3M Ceramic Coating): Orbital dual-action machine with 9H reflective glint
export const DetailingPPFIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Polishing Backing Plate & Foam Pad */}
    <ellipse cx="12" cy="16" rx="8" ry="3.5" fill="currentColor" fillOpacity="0.15" />
    <path d="M4 16V17.5C4 19.4 7.6 21 12 21C16.4 21 20 19.4 20 17.5V16" />
    
    {/* Orbital Buffer Spindle & Motor Head */}
    <path d="M12 12.5V8.5" strokeWidth="2.2" />
    <rect x="8.5" y="5.5" width="7" height="3" rx="1" fill="currentColor" fillOpacity="0.3" />
    
    {/* 9H Ceramic Coating Crystal Sparkle */}
    <path d="M18.5 4L19.2 6.2L21.5 7L19.2 7.8L18.5 10L17.8 7.8L15.5 7L17.8 6.2L18.5 4Z" fill="currentColor" />
    <path d="M6 3L6.5 4.5L8 5L6.5 5.5L6 7L5.5 5.5L4 5L5.5 4.5L6 3Z" fill="currentColor" />
  </svg>
);

// 13. SUSPENSIÓN HD (TRAKKO® & KYB): Nitrogen coilover shock absorber with progressive spring
export const SuspensionHDIcon: React.FC<IconProps> = ({ size = 24, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Top Eyelet Mount */}
    <circle cx="12" cy="3.5" r="2" />
    <circle cx="12" cy="3.5" r="0.8" fill="currentColor" />
    
    {/* Damper Shaft & Spring Perch */}
    <path d="M12 5.5V8" strokeWidth="2.2" />
    <line x1="8" y1="8" x2="16" y2="8" strokeWidth="2" />
    
    {/* Progressive Heavy Duty Coil Spring */}
    <path d="M9 8L15 10L9 12L15 14L9 16L15 18" strokeWidth="2" />
    
    {/* Lower Collar & Strut Body */}
    <line x1="8" y1="18" x2="16" y2="18" strokeWidth="2" />
    <path d="M12 18V20.5" strokeWidth="2.2" />
    
    {/* Lower Eyelet Mount */}
    <circle cx="12" cy="21.5" r="1.5" />
    <circle cx="12" cy="21.5" r="0.6" fill="currentColor" />
    
    {/* Remote Nitrogen Reservoir on side */}
    <rect x="17.5" y="8" width="3" height="6.5" rx="1.2" fill="currentColor" fillOpacity="0.25" />
    <path d="M15 9.5H17.5" />
  </svg>
);

// 14. SEDE CAJAMARCA: Concessionaire Showroom Building with Location Pin
export const DealershipPinIcon: React.FC<IconProps> = ({ size = 18, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    {...props}
  >
    {/* Showroom Facade & Pillars */}
    <path d="M2 19H22" strokeWidth="2" />
    <path d="M3 19V11L12 6L21 11V19" />
    <path d="M7 19V13H11V19" />
    <path d="M15 19V13H18V19" />
    
    {/* Floating Location Marker Core */}
    <circle cx="12" cy="4" r="2.5" fill="currentColor" fillOpacity="0.25" />
    <circle cx="12" cy="4" r="1" fill="currentColor" />
  </svg>
);
