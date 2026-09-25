/**
 * Nor Celis Automotriz - Showroom Virtual 360° Configuration
 * Centralized, senior-architected configuration for vehicles, color profiles, and lighting presets.
 * Easy to extend, maintain, and modify for new vehicles or seasonal campaigns.
 */

export interface VehicleColorOption {
  id: string;
  name: string;
  hex: string;
  badge: string;
  turntableGlow: string;
  // Specific image override if available for this color
  imageUrl?: string;
  // Dual-layer photorealistic blending parameters
  filterStyle: string;
  overlayTint: string;
  blendMode: 'color' | 'multiply' | 'overlay' | 'hue';
  opacity: number;
  highlightIntensity: number;
}

export interface AnglePreset {
  angle: number;
  label: string;
  shortLabel: string;
  icon: string;
  mirror: boolean;
}

export interface ShowroomEnvironment {
  id: 'day' | 'night' | 'sunset';
  name: string;
  icon: string;
  ambientBg: string;
  turntableBorder: string;
  turntableFloorGlow: string;
  headlightsDefault: boolean;
  spotlightIntensity: number;
}

// Quick Angle Presets for direct navigation
export const ANGLE_PRESETS: AnglePreset[] = [
  { angle: 0, label: 'Frontal Directo (0°)', shortLabel: 'Frontal', icon: 'visibility', mirror: false },
  { angle: 45, label: '3/4 Frontal Derecho (45°)', shortLabel: '3/4 Delantero', icon: 'screen_rotation', mirror: false },
  { angle: 90, label: 'Perfil Lateral Derecho (90°)', shortLabel: 'Lateral Der.', icon: 'directions_car', mirror: false },
  { angle: 135, label: '3/4 Posterior Derecho (135°)', shortLabel: '3/4 Trasero', icon: 'screen_rotation_alt', mirror: false },
  { angle: 180, label: 'Posterior Directo (180°)', shortLabel: 'Posterior', icon: 'rear_camera', mirror: false },
  { angle: 270, label: 'Perfil Lateral Izquierdo (270°)', shortLabel: 'Lateral Izq.', icon: 'directions_car', mirror: true },
  { angle: 315, label: '3/4 Frontal Izquierdo (315°)', shortLabel: '3/4 Izquierdo', icon: 'screen_rotation', mirror: true },
];

// Environments / Lighting Studios
export const SHOWROOM_ENVIRONMENTS: Record<string, ShowroomEnvironment> = {
  day: {
    id: 'day',
    name: 'Estudio Luz Día (5500K)',
    icon: 'light_mode',
    ambientBg: 'radial-gradient(ellipse at center 35%, #111827 0%, #070b14 100%)',
    turntableBorder: 'rgba(255, 255, 255, 0.15)',
    turntableFloorGlow: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
    headlightsDefault: false,
    spotlightIntensity: 0.3,
  },
  night: {
    id: 'night',
    name: 'Noche Neón LED',
    icon: 'nightlight',
    ambientBg: 'radial-gradient(ellipse at center 35%, #080d1a 0%, #03060c 100%)',
    turntableBorder: 'rgba(56, 189, 248, 0.35)',
    turntableFloorGlow: 'radial-gradient(ellipse at center, rgba(34, 211, 238, 0.18) 0%, transparent 75%)',
    headlightsDefault: true,
    spotlightIntensity: 0.7,
  },
  sunset: {
    id: 'sunset',
    name: 'Golden Hour Sunset',
    icon: 'wb_twilight',
    ambientBg: 'radial-gradient(ellipse at center 35%, #1c1017 0%, #070b14 100%)',
    turntableBorder: 'rgba(251, 146, 60, 0.3)',
    turntableFloorGlow: 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
    headlightsDefault: false,
    spotlightIntensity: 0.45,
  },
};

// Global Vehicle Color Palette with Photorealistic Blend Physics
export const SHOWROOM_COLORS: VehicleColorOption[] = [
  {
    id: 'blanco',
    name: 'Blanco Perlado Premium (070)',
    hex: '#F8FAFC',
    badge: 'Acabado Perlado Tricapa',
    turntableGlow: '#f1f5f9',
    imageUrl: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?auto=format&fit=crop&w=1200&q=80',
    filterStyle: 'brightness(1.15) contrast(1.05) saturate(0.1)',
    overlayTint: 'rgba(255, 255, 255, 0.32)',
    blendMode: 'color',
    opacity: 0.45,
    highlightIntensity: 1.2,
  },
  {
    id: 'gris',
    name: 'Gris Grafito Metálico (1G3)',
    hex: '#4b5563',
    badge: 'Gunmetal Titanio Metálico',
    turntableGlow: '#94a3b8',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    filterStyle: 'grayscale(0.85) contrast(1.28) brightness(0.82)',
    overlayTint: 'rgba(75, 85, 99, 0.65)',
    blendMode: 'multiply',
    opacity: 0.55,
    highlightIntensity: 0.9,
  },
  {
    id: 'azul',
    name: 'Azul Cosmos Profundo (8X8)',
    hex: '#1d4ed8',
    badge: 'Zafiro Noche Metalizado',
    turntableGlow: '#38bdf8',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
    filterStyle: 'hue-rotate(195deg) saturate(3.8) brightness(0.88) contrast(1.22)',
    overlayTint: 'rgba(29, 78, 216, 0.7)',
    blendMode: 'color',
    opacity: 0.75,
    highlightIntensity: 1.1,
  },
  {
    id: 'negro',
    name: 'Negro Mica Ébano (218)',
    hex: '#111827',
    badge: 'Mica Obsidiana Profundo',
    turntableGlow: '#475569',
    imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80',
    filterStyle: 'brightness(0.38) contrast(1.65) saturate(0.1)',
    overlayTint: 'rgba(10, 15, 25, 0.85)',
    blendMode: 'multiply',
    opacity: 0.85,
    highlightIntensity: 0.7,
  },
  {
    id: 'rojo',
    name: 'Rojo Emoción Vulcano (3T3)',
    hex: '#dc2626',
    badge: 'Rally Deportivo Sport',
    turntableGlow: '#f87171',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    filterStyle: 'hue-rotate(338deg) saturate(4.2) brightness(0.94) contrast(1.25)',
    overlayTint: 'rgba(220, 38, 38, 0.72)',
    blendMode: 'color',
    opacity: 0.75,
    highlightIntensity: 1.25,
  },
];

/**
 * Returns human-readable label for a rotation angle.
 */
export function getAnglePerspectiveLabel(angle: number): { name: string; isMirrored: boolean } {
  const norm = ((angle % 360) + 360) % 360;
  const isMirrored = norm > 180;

  if (norm >= 340 || norm < 20) return { name: 'Frontal Directo (0°)', isMirrored: false };
  if (norm >= 20 && norm < 70) return { name: '3/4 Frontal Derecho (45°)', isMirrored: false };
  if (norm >= 70 && norm < 115) return { name: 'Perfil Lateral Derecho (90°)', isMirrored: false };
  if (norm >= 115 && norm < 160) return { name: '3/4 Posterior Derecho (135°)', isMirrored: false };
  if (norm >= 160 && norm < 205) return { name: 'Posterior Directo (180°)', isMirrored: false };
  if (norm >= 205 && norm < 250) return { name: '3/4 Posterior Izquierdo (225°)', isMirrored: true };
  if (norm >= 250 && norm < 295) return { name: 'Perfil Lateral Izquierdo (270°)', isMirrored: true };
  return { name: '3/4 Frontal Izquierdo (315°)', isMirrored: true };
}
