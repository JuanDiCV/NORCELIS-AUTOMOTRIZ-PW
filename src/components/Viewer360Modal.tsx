import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { SafeImage } from './SafeImage';
import { FALLBACK_IMAGES } from '../utils/imageAssets';
import {
  SHOWROOM_COLORS,
  SHOWROOM_ENVIRONMENTS,
  ANGLE_PRESETS,
  getAnglePerspectiveLabel,
} from '../utils/showroomConfig';

interface ShowroomHotspot {
  id: string;
  category: 'faros' | 'aros' | 'motor' | 'techo';
  label: string;
  x: string;
  y: string;
  title: string;
  desc: string;
  code: string;
  minAngle?: number;
  maxAngle?: number;
}

export const Viewer360Modal: React.FC = () => {
  const {
    isViewer360Open,
    setIsViewer360Open,
    showToast,
    setIsTestDriveModalOpen,
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
  } = useApp();

  // Selected Vehicle in the Showroom
  const currentVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // Mode and Visual Controls
  const [mode, setMode] = useState<'exterior' | 'interior'>('exterior');
  const [isHeadlightsOn, setIsHeadlightsOn] = useState<boolean>(true); // Enabled by default for immediate visual feedback
  const [environment, setEnvironment] = useState<'day' | 'night' | 'sunset'>('day');
  const [selectedColor, setSelectedColor] = useState<string>('blanco');
  const [componentFilter, setComponentFilter] = useState<'todos' | 'faros' | 'aros' | 'motor' | 'techo'>('todos');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // 360° Rotation Angle (0° to 360°)
  const [rotationAngle, setRotationAngle] = useState<number>(45);
  const [activeHotspot, setActiveHotspot] = useState<string | null>('faros');

  // Dragging state with reliable Pointer capture
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const startAngleRef = useRef<number>(45);
  const stageRef = useRef<HTMLDivElement>(null);

  // Interior panoramic panning
  const [interiorPanX, setInteriorPanX] = useState<number>(0);

  // Active color profile
  const currentColorObj = useMemo(() => {
    return SHOWROOM_COLORS.find((c) => c.id === selectedColor) || SHOWROOM_COLORS[0];
  }, [selectedColor]);

  // Active environment profile
  const currentEnvObj = useMemo(() => {
    return SHOWROOM_ENVIRONMENTS[environment] || SHOWROOM_ENVIRONMENTS.day;
  }, [environment]);

  // Hotspots configured for exterior
  const exteriorHotspots = useMemo<ShowroomHotspot[]>(() => [
    {
      id: 'faros',
      category: 'faros',
      label: 'Faros Bi-LED Projector',
      x: '23%',
      y: '55%',
      title: 'Ópticas Bi-LED Projector con DRL',
      desc: 'Proyector angular Bi-LED, ajuste dinámico de haz con AHB y firma lumínica diurna LED aerodinámica.',
      code: 'TOY-OPT-81110',
      minAngle: 280,
      maxAngle: 90,
    },
    {
      id: 'aros',
      category: 'aros',
      label: 'Aros 18" Dark Graphite',
      x: '33%',
      y: '76%',
      title: 'Aros de Aleación 18" Dark Graphite',
      desc: 'Neumáticos 225/60 R18 de baja resistencia a la rodadura y frenos de disco ventilados con ABS/EBD.',
      code: 'DIM: 18x7J 5x114.3',
      minAngle: 30,
      maxAngle: 330,
    },
    {
      id: 'sunroof',
      category: 'techo',
      label: 'Techo Panorámico',
      x: '55%',
      y: '28%',
      title: 'Sunroof Panorámico Eléctrico',
      desc: 'Vidrio templado laminado con protección UV al 99% y cortinilla eléctrica de accionamiento con un solo toque.',
      code: 'Confort Sky Pack',
    },
    {
      id: 'motor',
      category: 'motor',
      label: 'Motor Dynamic Force Híbrido',
      x: '18%',
      y: '48%',
      title: `${currentVehicle.specs.engine} • ${currentVehicle.specs.power || '219 HP'}`,
      desc: `Sistema híbrido de alta eficiencia con rendimiento homologado de ${currentVehicle.specs.consumption || '72 km/gal'} y tracción ${currentVehicle.specs.traction}.`,
      code: `TREN: ${currentVehicle.specs.traction}`,
      minAngle: 280,
      maxAngle: 100,
    },
    {
      id: 'posterior',
      category: 'techo',
      label: 'Maletera & Faros LED Traseros',
      x: '78%',
      y: '55%',
      title: 'Portón Trasero Eléctrico & Barra LED',
      desc: 'Capacidad de 580 Litros, sensor de apertura manos libres de pie y faros posteriores LED envolventes.',
      code: 'Smart Cargo 580L',
      minAngle: 100,
      maxAngle: 260,
    },
  ], [currentVehicle]);

  // Hotspots for interior
  const interiorHotspots = useMemo<ShowroomHotspot[]>(() => [
    {
      id: 'pantalla',
      category: 'techo',
      label: 'Pantalla 10.5" HD',
      x: '50%',
      y: '44%',
      title: 'Sistema Multimedia Táctil 10.5" HD',
      desc: 'Apple CarPlay y Android Auto inalámbricos, navegación satelital nativa y sonido premium JBL.',
      code: 'Toyota Audio Plus HD',
    },
    {
      id: 'cluster',
      category: 'motor',
      label: 'Clúster Digital 12.3"',
      x: '35%',
      y: '48%',
      title: 'Panel de Instrumentos Digital 12.3"',
      desc: 'Cuatro modos de visualización con flujo de energía híbrida y telemetría de consumo en tiempo real.',
      code: 'Multi-Information Display',
    },
    {
      id: 'asientos',
      category: 'aros',
      label: 'Butacas Cuero SoftTex',
      x: '58%',
      y: '65%',
      title: 'Asientos Ergonómicos Cuero SoftTex',
      desc: 'Regulación eléctrica de 8 posiciones con soporte lumbar y climatización independiente.',
      code: 'Acolchado Ortopédico',
    },
  ], []);

  // Filtered hotspots
  const activeHotspotsList = useMemo(() => {
    const list = mode === 'exterior' ? exteriorHotspots : interiorHotspots;
    if (componentFilter === 'todos') return list;
    return list.filter((h) => h.category === componentFilter);
  }, [mode, exteriorHotspots, interiorHotspots, componentFilter]);

  const currentHotspotData = useMemo(() => {
    return (
      activeHotspotsList.find((h) => h.id === activeHotspot) ||
      activeHotspotsList[0] ||
      null
    );
  }, [activeHotspotsList, activeHotspot]);

  // Turntable Auto-rotation
  useEffect(() => {
    if (!isAutoRotating || !isViewer360Open || isDragging) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotating, isViewer360Open, isDragging]);

  // Pointer drag handlers for smooth 360 rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    startAngleRef.current = rotationAngle;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (mode === 'exterior') {
      const newAngle = Math.round(startAngleRef.current + deltaX * 0.75 + 3600) % 360;
      setRotationAngle(newAngle);
    } else {
      setInteriorPanX((prev) => Math.max(-100, Math.min(100, prev + deltaX * 0.05)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  };

  // Perspective angle calculation and dynamic vehicle transformation
  const { perspectiveLabel, rotationTransform, turntableShadowTransform, isMirrored, isFrontFacing, isRearFacing } = useMemo(() => {
    const { name, isMirrored: mirror } = getAnglePerspectiveLabel(rotationAngle);
    const normalized = ((rotationAngle % 360) + 360) % 360;

    // Headlights visible mostly in frontal arc (280° - 80°)
    const frontFacing = normalized >= 280 || normalized <= 80;
    // Taillights visible mostly in rear arc (100° - 260°)
    const rearFacing = normalized >= 100 && normalized <= 260;

    // Gentle 3D perspective pitch and yaw for realistic turntable movement
    const rad = (normalized * Math.PI) / 180;
    const yaw = Math.sin(rad) * 20;
    const pitch = Math.cos(rad) * 2.5;

    const transform = `perspective(1200px) rotateY(${yaw}deg) rotateX(${pitch}deg) scale(${
      (mirror ? -1 : 1) * zoomLevel
    }, ${zoomLevel})`;

    const shadowTransform = `perspective(1000px) rotateX(65deg) rotateZ(${-normalized}deg) scale(${
      1.08 * zoomLevel
    })`;

    return {
      perspectiveLabel: name,
      rotationTransform: transform,
      turntableShadowTransform: shadowTransform,
      isMirrored: mirror,
      isFrontFacing: frontFacing,
      isRearFacing: rearFacing,
    };
  }, [rotationAngle, zoomLevel]);

  // Exterior Image: Check if active vehicle is the default or if a color variant exists
  const exteriorImage = useMemo(() => {
    // If selected vehicle is default RAV4, use high-resolution verified color asset
    if (currentVehicle.id === 'veh-rav4-2025' && currentColorObj.imageUrl) {
      return currentColorObj.imageUrl;
    }
    return currentVehicle.image;
  }, [currentVehicle, currentColorObj]);

  const interiorImage = FALLBACK_IMAGES.interiorCockpit;

  const toggleHeadlights = useCallback(() => {
    setIsHeadlightsOn((prev) => {
      const next = !prev;
      showToast(next ? 'Faros Bi-LED encendidos' : 'Faros apagados');
      return next;
    });
  }, [showToast]);

  const whatsappConfigMessage = encodeURIComponent(
    `Hola Carlos Mendoza, configuré en el Showroom Virtual 360° el vehículo: ` +
    `${currentVehicle.name} (${currentColorObj.name}) con vista ${perspectiveLabel}. ` +
    `Deseo agendar una cita presencial para verlo en concesionario.`
  );

  if (!isViewer360Open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-5 overflow-hidden">
      <div className="relative w-full h-full max-w-7xl max-h-[96vh] bg-[#070b14] rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
        
        {/* BARRA SUPERIOR: Selector de Vehículo, Faros, Modo y Controles */}
        <header className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 z-30 bg-[#070b14]/95 backdrop-blur-md">
          {/* Identidad del Showroom y Selector de Vehículo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">360</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Showroom Virtual 360°
                </span>
                <span className="text-[10px] bg-secondary-container text-white px-2 py-0.5 rounded-full font-bold">
                  Interactivo
                </span>
              </div>

              {/* Selector de Vehículo */}
              <div className="relative mt-0.5">
                <select
                  value={currentVehicle.id}
                  onChange={(e) => {
                    setSelectedVehicleId(e.target.value);
                    showToast(`Vehículo cargado en Showroom 360°`);
                  }}
                  className="bg-white/10 hover:bg-white/15 text-white font-headline font-bold text-xs sm:text-sm rounded-xl px-2.5 py-1 pr-7 border border-white/20 focus:outline-none focus:border-secondary cursor-pointer max-w-[190px] xs:max-w-[250px] sm:max-w-none truncate"
                  aria-label="Seleccionar vehículo para el Showroom"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id} className="bg-slate-900 text-white font-normal">
                      {v.name} ({v.year}) - {v.brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filtros Centrales de Modo & Entorno de Iluminación */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Selector de Modo: Exterior / Cabina Interior */}
            <div className="flex bg-white/10 p-1 rounded-2xl text-xs font-semibold border border-white/10">
              <button
                onClick={() => setMode('exterior')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'exterior'
                    ? 'bg-secondary-container text-white shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">directions_car</span>
                <span>Exterior 360°</span>
              </button>
              <button
                onClick={() => setMode('interior')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  mode === 'interior'
                    ? 'bg-secondary-container text-white shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">airline_seat_recline_extra</span>
                <span>Cabina VR</span>
              </button>
            </div>

            {/* Selector de Ambiente de Iluminación */}
            <div className="hidden md:flex items-center bg-white/10 p-1 rounded-2xl border border-white/10 text-xs">
              {Object.values(SHOWROOM_ENVIRONMENTS).map((env) => (
                <button
                  key={env.id}
                  onClick={() => {
                    setEnvironment(env.id);
                    if (env.id === 'night') {
                      setIsHeadlightsOn(true);
                      showToast('Modo Noche: Faros Bi-LED activados automáticamente');
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                    environment === env.id
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-white/70 hover:text-white'
                  }`}
                  title={env.name}
                >
                  <span className={`material-symbols-outlined text-[15px] ${
                    env.id === 'day' ? 'text-amber-500' : env.id === 'night' ? 'text-cyan-400' : 'text-orange-400'
                  }`}>
                    {env.icon}
                  </span>
                  <span>{env.id === 'day' ? 'Día' : env.id === 'night' ? 'Noche LED' : 'Sunset'}</span>
                </button>
              ))}
            </div>

            {/* BOTÓN PROMINENTE DE CONTROL DE FAROS BI-LED */}
            {mode === 'exterior' && (
              <button
                onClick={toggleHeadlights}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold border cursor-pointer ${
                  isHeadlightsOn
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.45)] ring-2 ring-cyan-400/30'
                    : 'bg-white/10 text-white/70 border-white/15 hover:text-white hover:bg-white/15'
                }`}
                title={isHeadlightsOn ? 'Apagar Faros Bi-LED' : 'Encender Faros Bi-LED'}
                aria-pressed={isHeadlightsOn}
              >
                <span className={`material-symbols-outlined text-[16px] ${isHeadlightsOn ? 'text-cyan-300 animate-pulse' : 'text-white/50'}`}>
                  highlight
                </span>
                <span>Faros Bi-LED: {isHeadlightsOn ? 'ON' : 'OFF'}</span>
              </button>
            )}
          </div>

          {/* Botón de Cierre */}
          <button
            onClick={() => setIsViewer360Open(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar Showroom"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </header>

        {/* SUBBARRA: Filtros de Inspección y Zoom */}
        <div className="px-4 sm:px-6 py-2 border-b border-white/5 flex items-center justify-between gap-3 text-xs z-20 bg-[#070b14]/70">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider mr-1 hidden sm:inline">
              Inspección:
            </span>
            {[
              { id: 'todos', label: 'Todo el Vehículo', icon: 'view_in_ar' },
              { id: 'faros', label: 'Ópticas Bi-LED', icon: 'highlight' },
              { id: 'aros', label: 'Aros & Frenos', icon: 'tire_repair' },
              { id: 'motor', label: 'Motor Dynamic Force', icon: 'memory' },
              { id: 'techo', label: 'Sunroof & Portón', icon: 'wb_sunny' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setComponentFilter(f.id as any)}
                className={`px-3 py-1 rounded-xl font-medium transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                  componentFilter === f.id
                    ? 'bg-white/20 text-white font-bold border border-white/30 shadow-xs'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Perspectiva y Zoom */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="hidden sm:inline text-[11px] font-mono font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-lg border border-secondary/20">
              {perspectiveLabel}
            </span>

            <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                title="Reducir Zoom"
                aria-label="Reducir Zoom"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="px-1.5 text-[10px] font-mono text-white/80 font-bold">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.45, z + 0.15))}
                className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                title="Aumentar Zoom"
                aria-label="Aumentar Zoom"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        </div>

        {/* ESCENARIO PRINCIPAL 360° INTERACTIVO */}
        <main
          ref={stageRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex-1 relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none transition-colors duration-700"
          style={{ background: currentEnvObj.ambientBg }}
          aria-label="Escenario interactivo 360°"
        >
          {/* ILUMINACIÓN AMBIENTAL DE ESTUDIO */}
          {environment === 'night' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
            </div>
          )}

          {environment === 'sunset' && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-amber-600/20 via-orange-900/10 to-transparent" />
              <div className="absolute bottom-10 left-1/3 w-[500px] h-32 bg-amber-500/15 rounded-full blur-3xl" />
            </div>
          )}

          {/* PLATAFORMA GIRATORIA DE ESTUDIO (TURNTABLE 360°) */}
          {mode === 'exterior' && (
            <div
              className="absolute bottom-8 w-[580px] sm:w-[720px] h-[220px] rounded-full border-2 transition-all duration-300 pointer-events-none flex items-center justify-center"
              style={{
                transform: turntableShadowTransform,
                borderColor: `${currentColorObj.turntableGlow}45`,
                boxShadow:
                  environment === 'night'
                    ? `0 0 65px ${currentColorObj.turntableGlow}30, inset 0 0 45px ${currentColorObj.turntableGlow}20`
                    : `0 0 70px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.08)`,
              }}
            >
              {/* Aro Neón Perimetral con color reflectivo del auto */}
              <div
                className="absolute inset-0 rounded-full border transition-all duration-300"
                style={{
                  borderColor: `${currentColorObj.turntableGlow}80`,
                  boxShadow: `0 0 24px ${currentColorObj.turntableGlow}35`,
                }}
              />
              <div className="w-[85%] h-[85%] rounded-full border border-white/10" />

              {/* Proyección de haz de luz en el suelo cuando los faros están encendidos */}
              {isHeadlightsOn && isFrontFacing && (
                <div
                  className="absolute -top-16 inset-x-10 h-48 pointer-events-none transition-opacity duration-300 blur-md rounded-full"
                  style={{
                    background: `radial-gradient(ellipse at center bottom, rgba(56, 189, 248, 0.45) 0%, rgba(34, 211, 238, 0.12) 55%, transparent 80%)`,
                  }}
                />
              )}

              {/* Resplandor rojo en el suelo de luces traseras */}
              {isHeadlightsOn && isRearFacing && (
                <div
                  className="absolute -bottom-10 inset-x-16 h-32 pointer-events-none transition-opacity duration-300 blur-lg rounded-full"
                  style={{
                    background: `radial-gradient(ellipse at center top, rgba(239, 68, 68, 0.55) 0%, rgba(239, 68, 68, 0.15) 65%, transparent 90%)`,
                  }}
                />
              )}

              {/* Indicador de compás 360° */}
              <div
                className="w-full h-0.5 bg-gradient-to-r from-secondary-container via-transparent to-secondary-container absolute transition-transform duration-75"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              />
            </div>
          )}

          {/* VEHÍCULO CON COLOR DINÁMICO Y FAROS BI-LED */}
          <div className="relative max-w-4xl w-full px-6 flex items-center justify-center">
            {mode === 'exterior' ? (
              <div
                className="relative transition-transform duration-100 ease-out select-none flex items-center justify-center"
                style={{
                  transform: rotationTransform,
                }}
              >
                {/* Contenedor relativo de imagen y capas lumínicas */}
                <div className="relative inline-block max-w-full">
                  {/* IMAGEN DEL VEHÍCULO: Alta Definición con fallback seguro */}
                  <SafeImage
                    key={`${currentVehicle.id}-${selectedColor}`}
                    src={exteriorImage}
                    fallbackSrc={FALLBACK_IMAGES.vehicleSuv}
                    typeHint="vehicle"
                    alt={`${currentVehicle.name} ${currentColorObj.name} 360°`}
                    className="w-full max-h-[52vh] object-contain drop-shadow-[0_28px_35px_rgba(0,0,0,0.85)] pointer-events-none transition-all duration-300"
                    draggable={false}
                    style={{
                      filter: currentColorObj.filterStyle,
                    }}
                  />

                  {/* CAPA DE PINTURA DE CARROCERÍA: Mezcla multicapa para reflejos auténticos */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-300 rounded-3xl"
                    style={{
                      backgroundColor: currentColorObj.overlayTint,
                      mixBlendMode: currentColorObj.blendMode,
                      opacity: currentColorObj.opacity,
                    }}
                  />

                  {/* BRILLO METÁLICO ESPECULAR SECUNDARIO */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-300 rounded-3xl"
                    style={{
                      background: `radial-gradient(circle at 50% 40%, ${currentColorObj.hex}40 0%, transparent 75%)`,
                      mixBlendMode: 'overlay',
                    }}
                  />

                  {/* FAROS BI-LED DELANTEROS: Encendido visible con halo y haces ópticos */}
                  {isHeadlightsOn && isFrontFacing && (
                    <>
                      {/* Faro Frontal Izquierdo */}
                      <div
                        className="absolute top-[48%] left-[22%] w-10 h-10 pointer-events-none transition-opacity duration-200"
                        style={{ opacity: isMirrored ? 0.4 : 1 }}
                      >
                        <div className="w-full h-full rounded-full bg-cyan-200 blur-[2px] animate-pulse shadow-[0_0_35px_#38bdf8,0_0_60px_#0284c7]" />
                        <div className="absolute inset-2.5 rounded-full bg-white blur-[1px]" />
                        {/* Lens Flare Horizontal */}
                        <div className="absolute top-1/2 -left-4 -right-4 h-1 -translate-y-1/2 bg-cyan-300 blur-[2px] opacity-80" />
                      </div>

                      {/* Faro Frontal Derecho */}
                      <div
                        className="absolute top-[46%] right-[30%] w-9 h-9 pointer-events-none transition-opacity duration-200"
                        style={{ opacity: isMirrored ? 1 : 0.4 }}
                      >
                        <div className="w-full h-full rounded-full bg-cyan-200 blur-[2px] animate-pulse shadow-[0_0_30px_#38bdf8,0_0_55px_#0284c7]" />
                        <div className="absolute inset-2 rounded-full bg-white blur-[1px]" />
                        {/* Lens Flare Horizontal */}
                        <div className="absolute top-1/2 -left-3 -right-3 h-1 -translate-y-1/2 bg-cyan-300 blur-[2px] opacity-80" />
                      </div>

                      {/* Haz de luz volumétrico frontal proyectado hacia adelante */}
                      <div
                        className="absolute -bottom-6 left-[16%] w-[68%] h-28 pointer-events-none blur-sm"
                        style={{
                          background:
                            'radial-gradient(ellipse at top, rgba(186, 230, 253, 0.55) 0%, rgba(56, 189, 248, 0.15) 50%, transparent 80%)',
                        }}
                      />
                    </>
                  )}

                  {/* LUCES TRASERAS ROJAS LED (Visibles en ángulos posteriores) */}
                  {isHeadlightsOn && isRearFacing && (
                    <>
                      <div className="absolute top-[47%] right-[16%] w-16 h-6 rounded-full bg-rose-600 blur-[3px] shadow-[0_0_40px_#f43f5e,0_0_70px_#e11d48] pointer-events-none animate-pulse" />
                      <div className="absolute top-[49%] left-[22%] w-12 h-5 rounded-full bg-rose-600 blur-[3px] shadow-[0_0_35px_#f43f5e] pointer-events-none animate-pulse" />
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* MODO CABINA INTERIOR VR PANORÁMICO */
              <div className="relative w-full rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
                <div
                  className="transition-transform duration-200 ease-out"
                  style={{ transform: `scale(${zoomLevel}) translateX(${interiorPanX}px)` }}
                >
                  <SafeImage
                    src={interiorImage}
                    fallbackSrc={FALLBACK_IMAGES.interiorCockpit}
                    typeHint="vehicle"
                    alt="Cabina Interior 360 VR"
                    className="w-full max-h-[52vh] object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                <div className="absolute bottom-5 left-6 text-white pointer-events-none">
                  <span className="text-[10px] font-mono uppercase bg-white/20 px-2 py-0.5 rounded text-white/80 font-bold">
                    Cabina Digital VR 360°
                  </span>
                  <h4 className="font-headline font-bold text-lg sm:text-xl text-white">
                    {currentVehicle.name} • Acabados SoftTex &amp; Pantalla Dual
                  </h4>
                  <p className="text-xs text-white/70">
                    Arrastra lateralmente para explorar la cabina y el puesto de conducción.
                  </p>
                </div>
              </div>
            )}

            {/* PUNTOS DE INSPECCIÓN INTERACTIVOS (HOTSPOTS) */}
            {activeHotspotsList.map((hotspot) => {
              const isActive = activeHotspot === hotspot.id;
              if (
                mode === 'exterior' &&
                hotspot.minAngle !== undefined &&
                hotspot.maxAngle !== undefined
              ) {
                const inRange =
                  hotspot.minAngle > hotspot.maxAngle
                    ? rotationAngle >= hotspot.minAngle || rotationAngle <= hotspot.maxAngle
                    : rotationAngle >= hotspot.minAngle && rotationAngle <= hotspot.maxAngle;
                if (!inRange && componentFilter === 'todos') {
                  return null;
                }
              }

              return (
                <div
                  key={hotspot.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(hotspot.id);
                    if (hotspot.id === 'faros' && !isHeadlightsOn) {
                      setIsHeadlightsOn(true);
                      showToast('Faros Bi-LED encendidos');
                    }
                  }}
                  className="absolute cursor-pointer group z-20"
                  style={{
                    top: hotspot.y,
                    left: isMirrored ? `${100 - parseFloat(hotspot.x)}%` : hotspot.x,
                  }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-secondary-container/40 animate-ping pointer-events-none" />
                    <button
                      className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-secondary-container text-white scale-125 ring-4 ring-secondary-container/40'
                          : 'bg-white/90 text-primary hover:bg-white hover:scale-110'
                      }`}
                      aria-label={hotspot.label}
                    >
                      <span className="material-symbols-outlined text-[15px]">info</span>
                    </button>

                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
                      {hotspot.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TARJETA DETALLE DEL PUNTO ACTIVO */}
          {currentHotspotData && (
            <div className="absolute bottom-5 left-5 max-w-sm bg-[#0f172a]/95 border border-white/20 backdrop-blur-md p-4 rounded-2xl shadow-2xl text-white z-20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-secondary-fixed uppercase font-bold tracking-wider">
                  {currentHotspotData.code}
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h5 className="font-headline font-bold text-sm text-white mb-1">
                {currentHotspotData.title}
              </h5>
              <p className="text-xs text-white/70 leading-relaxed mb-3">
                {currentHotspotData.desc}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {currentHotspotData.category === 'faros' && (
                  <button
                    onClick={toggleHeadlights}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[14px]">highlight</span>
                    <span>{isHeadlightsOn ? 'Apagar Faros' : 'Encender Faros Bi-LED'}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsViewer360Open(false);
                    setIsTestDriveModalOpen(true);
                  }}
                  className="bg-secondary-container hover:bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">speed</span>
                  <span>Probar en Test Drive</span>
                </button>
                <a
                  href={`https://wa.me/51987654321?text=Hola,%20quisiera%20detalles%20sobre%20${encodeURIComponent(
                    currentHotspotData.title
                  )}%20del%20${currentVehicle.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
                >
                  Consultar WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* INDICADOR DE CONTROL 360° Y COMPÁS */}
          <div className="absolute bottom-5 right-5 hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-2xl text-white/80 text-xs">
            <span className="material-symbols-outlined text-secondary text-base">swipe</span>
            <span>Arrastra para rotar</span>
            <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
              {rotationAngle}°
            </span>
          </div>
        </main>

        {/* BARRA INFERIOR DE CONFIGURACIÓN: Colores Oficiales, Presets de Ángulos y Acciones */}
        <footer className="px-4 sm:px-6 py-3 border-t border-white/10 bg-[#070b14]/95 z-30 flex flex-wrap items-center justify-between gap-3">
          {/* SELECTOR DE COLORES OFICIALES */}
          {mode === 'exterior' ? (
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider hidden sm:inline">
                Color de Carrocería:
              </span>
              <div className="flex items-center gap-1.5">
                {SHOWROOM_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedColor(c.id);
                      showToast(`Pintura seleccionada: ${c.name}`);
                    }}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative ${
                      selectedColor === c.id
                        ? 'border-secondary-container scale-125 ring-2 ring-white/60 shadow-md'
                        : 'border-white/30 hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    aria-label={c.name}
                  >
                    {selectedColor === c.id && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] text-primary font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <span className="text-xs text-secondary-fixed font-bold hidden md:inline">
                {currentColorObj.name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-white/80">
              <span className="material-symbols-outlined text-emerald-400">vr180</span>
              <span>Modo Inmersivo Cabina Interior 360°</span>
            </div>
          )}

          {/* SELECTORES DE ÁNGULOS DE VISIÓN DIRECTOS */}
          {mode === 'exterior' && (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full py-0.5">
              {/* Botón de Auto-Giro */}
              <button
                onClick={() => setIsAutoRotating(!isAutoRotating)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  isAutoRotating
                    ? 'bg-secondary-container text-white border-secondary-container shadow-xs animate-pulse'
                    : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/15'
                }`}
                title="Activar o desactivar rotación automática"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isAutoRotating ? 'pause' : 'autorenew'}
                </span>
                <span className="hidden sm:inline">
                  {isAutoRotating ? 'Pausar' : 'Girar 360°'}
                </span>
              </button>

              {ANGLE_PRESETS.map((btn) => {
                const isActive =
                  Math.abs(rotationAngle - btn.angle) < 15 ||
                  (btn.angle === 0 && rotationAngle > 345);
                return (
                  <button
                    key={btn.angle}
                    onClick={() => {
                      setRotationAngle(btn.angle);
                      setIsAutoRotating(false);
                      showToast(`Ángulo: ${btn.label}`);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-white text-slate-900 border-white shadow-sm'
                        : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {btn.shortLabel}
                  </button>
                );
              })}
            </div>
          )}

          {/* ACCIONES COMERCIALES */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://wa.me/51987654321?text=${whatsappConfigMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span className="hidden sm:inline">Compartir por WhatsApp</span>
            </a>

            <button
              onClick={() => {
                setIsViewer360Open(false);
                setIsTestDriveModalOpen(true);
              }}
              className="bg-secondary-container hover:bg-secondary text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">speed</span>
              <span>Test Drive</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
